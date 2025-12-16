import { NextResponse } from "next/server";
import type { OutfitVector } from "@/types";
import {
  getRecommendationsFromQuiz,
  type QuizChoice,
} from "@/lib/recommendation-engine";

export const dynamic = "force-dynamic";

interface ResultsRequestBody {
  choices: QuizChoice[];
  useLLM?: boolean; // Whether to use LLM for translation (default: true)
}

/**
 * POST /api/quiz/results
 * Gets scent recommendations based on quiz choices
 * This is where the LLM translation happens
 */
export async function POST(request: Request) {
  try {
    const body: ResultsRequestBody = await request.json();
    const { choices, useLLM = true } = body;

    if (!choices || choices.length === 0) {
      return NextResponse.json(
        { error: "No choices provided" },
        { status: 400 }
      );
    }

    // Reconstruct QuizChoice objects with proper OutfitVector structure
    const reconstructedChoices: QuizChoice[] = choices.map((c) => ({
      round: c.round,
      chosen: c.chosen as OutfitVector,
      rejected: c.rejected as OutfitVector,
    }));

    // Get recommendations (this calls the LLM internally)
    const { userTaste, recommendations, scentProfile } =
      await getRecommendationsFromQuiz(reconstructedChoices, useLLM);

    return NextResponse.json({
      success: true,
      userTaste: {
        topTags: userTaste.topTags,
        selectedOutfits: userTaste.selectedOutfits.map((o) => ({
          brand: o.brand,
          season: o.season,
          imageUrl: o.imageUrl,
        })),
      },
      scentProfile: {
        accords: scentProfile.accords,
        style: scentProfile.style,
        reasoning: scentProfile.reasoning,
      },
      recommendations: recommendations.map((r) => ({
        name: r.perfume.name,
        brand: r.perfume.brand,
        imageUrl: r.perfume.image_url,
        mainAccords: r.perfume.main_accords,
        score: Math.round(r.score * 100),
        matchReason: r.matchReason,
        ratings: r.perfume.ratings,
      })),
    });
  } catch (error) {
    console.error("[Quiz Results] Error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
