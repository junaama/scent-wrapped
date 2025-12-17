/**
 * Recommendation Engine - Cross-domain matching from fashion to fragrance
 *
 * Implements the Adaptive Profile Refinement strategy:
 * 1. Binary choice quiz to build User Taste Vector (UTV)
 * 2. LLM-assisted translation of fashion aesthetics to scent accords
 * 3. Cosine similarity matching to find top perfumes
 */

import type { Perfume, PerfumeVector, OutfitVector, UserTasteVector } from "../types";
import { getTopTagsFromVector } from "./outfits";
import {
  loadPerfumeVectors,
  createTargetScentVector
} from "./perfumes";
import {
  cosineSimilarity,
  averageVectors,
  findMaxDissimilarPair,
  findMediumDissimilarPair,
} from "./vectors";
import { translateFashionToScent, type ScentProfile } from "./ai/translate-fashion";

export interface QuizChoice {
  round: number;
  chosen: OutfitVector;
  rejected: OutfitVector;
}

export interface QuizState {
  currentRound: number;
  totalRounds: number;
  choices: QuizChoice[];
  candidatePool: OutfitVector[];
  runningTasteVector: number[] | null;
}

export interface ScentRecommendation {
  perfume: Perfume;
  score: number;
  matchReason: string;
}

/**
 * Initializes a new quiz session with maximum dissimilarity pair
 */
export function initializeQuiz(
  outfitPool: OutfitVector[],
  totalRounds: number = 5
): { state: QuizState; pair: [OutfitVector, OutfitVector] | null } {
  // Find the most dissimilar pair for the first choice
  const vectorsWithVector = outfitPool.map((ov) => ({
    ...ov,
    vector: ov.tagVector,
  }));

  const pair = findMaxDissimilarPair(vectorsWithVector);

  return {
    state: {
      currentRound: 1,
      totalRounds,
      choices: [],
      candidatePool: outfitPool,
      runningTasteVector: null,
    },
    pair: pair as [OutfitVector, OutfitVector] | null,
  };
}

/**
 * Processes a user's choice and returns the next pair
 */
export function processChoice(
  state: QuizState,
  chosen: OutfitVector,
  rejected: OutfitVector
): {
  state: QuizState;
  nextPair: [OutfitVector, OutfitVector] | null;
  isComplete: boolean;
} {
  const newChoice: QuizChoice = {
    round: state.currentRound,
    chosen,
    rejected,
  };

  const newChoices = [...state.choices, newChoice];

  // Update running taste vector (average of all chosen outfit vectors)
  const chosenVectors = newChoices.map((c) => c.chosen.tagVector);
  const newTasteVector = averageVectors(chosenVectors);

  // Remove chosen and rejected from pool (using imageUrl for comparison since references are lost during JSON serialization)
  const newPool = state.candidatePool.filter(
    (o) => o.outfit.imageUrl !== chosen.outfit.imageUrl && o.outfit.imageUrl !== rejected.outfit.imageUrl
  );

  const newState: QuizState = {
    ...state,
    currentRound: state.currentRound + 1,
    choices: newChoices,
    candidatePool: newPool,
    runningTasteVector: newTasteVector,
  };

  // Check if quiz is complete
  if (newState.currentRound > state.totalRounds) {
    return { state: newState, nextPair: null, isComplete: true };
  }

  // Select next pair based on quiz stage
  let nextPair: [OutfitVector, OutfitVector] | null = null;

  const vectorsWithVector = newPool.map((ov) => ({
    ...ov,
    vector: ov.tagVector,
  }));

  if (state.currentRound <= 1) {
    // Stage 1: Maximum dissimilarity
    nextPair = findMaxDissimilarPair(vectorsWithVector) as [OutfitVector, OutfitVector] | null;
  } else if (state.currentRound <= 3) {
    // Stage 2-3: Medium dissimilarity relative to taste vector
    nextPair = findMediumDissimilarPair(
      newTasteVector,
      vectorsWithVector,
      [0.3, 0.7]
    ) as [OutfitVector, OutfitVector] | null;
  } else {
    // Stage 4-5: High similarity to taste vector (fine-tuning)
    nextPair = findMediumDissimilarPair(
      newTasteVector,
      vectorsWithVector,
      [0.6, 0.9]
    ) as [OutfitVector, OutfitVector] | null;
  }

  // Fallback to max dissimilar if no pair found
  if (!nextPair) {
    nextPair = findMaxDissimilarPair(vectorsWithVector) as [OutfitVector, OutfitVector] | null;
  }

  return { state: newState, nextPair, isComplete: false };
}

/**
 * Builds the User Taste Vector from quiz results
 */
export function buildUserTasteVector(choices: QuizChoice[]): UserTasteVector {
  const selectedOutfits = choices.map((c) => c.chosen.outfit);
  const vectors = choices.map((c) => c.chosen.tagVector);
  const averageTagVector = averageVectors(vectors);
  const topTags = getTopTagsFromVector(averageTagVector, 8);

  return {
    averageTagVector,
    topTags,
    selectedOutfits,
  };
}

/**
 * Finds the top matching perfumes for a user's taste profile
 * @param useLLM - Whether to use LLM for translation (default: true)
 */
export async function findMatchingPerfumes(
  userTaste: UserTasteVector,
  topN: number = 3,
  useLLM: boolean = true
): Promise<{ recommendations: ScentRecommendation[]; scentProfile: ScentProfile }> {
  const perfumeVectors = await loadPerfumeVectors();

  // Translate user's fashion preferences to scent profile (via LLM or fallback)
  const scentProfile = await translateFashionToScent(userTaste.topTags, useLLM);

  // Create target scent vector from LLM response
  const targetScent = createTargetScentVector(scentProfile.accords, scentProfile.style);

  // Score all perfumes
  const scored = perfumeVectors.map((pv) => {
    // Weighted similarity: 60% accords, 40% style
    const accordSim = cosineSimilarity(targetScent.accordVector, pv.accordVector);
    const styleSim = cosineSimilarity(targetScent.styleVector, pv.styleVector);
    const score = accordSim * 0.6 + styleSim * 0.4;

    return { perfume: pv.perfume, score };
  });

  // Sort by score and take top N
  scored.sort((a, b) => b.score - a.score);

  const recommendations = scored.slice(0, topN).map((s) => ({
    perfume: s.perfume,
    score: s.score,
    matchReason: generateMatchReason(scentProfile, s.perfume),
  }));

  return { recommendations, scentProfile };
}

/**
 * Generates a human-readable match reason
 */
function generateMatchReason(scentProfile: ScentProfile, perfume: Perfume): string {
  const perfumeAccords = perfume.main_accords.slice(0, 3).join(", ");
  const matchedAccords = scentProfile.accords
    .filter((a) => perfume.main_accords.includes(a))
    .slice(0, 2)
    .join(" & ");

  if (matchedAccords) {
    return `Matches your ${matchedAccords} profile with ${perfumeAccords} notes`;
  }
  return `Complements your style with ${perfumeAccords} notes`;
}

/**
 * Full recommendation pipeline: quiz results -> scent recommendations
 * @param useLLM - Whether to use LLM for translation (default: true)
 */
export async function getRecommendationsFromQuiz(
  quizChoices: QuizChoice[],
  useLLM: boolean = true
): Promise<{
  userTaste: UserTasteVector;
  recommendations: ScentRecommendation[];
  scentProfile: ScentProfile;
}> {
  const userTaste = buildUserTasteVector(quizChoices);
  const { recommendations, scentProfile } = await findMatchingPerfumes(userTaste, 5, useLLM);

  return { userTaste, recommendations, scentProfile };
}

// Re-export the ScentProfile type for use in API routes
export type { ScentProfile };
