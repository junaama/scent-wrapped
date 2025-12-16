import { NextResponse } from "next/server";
import type { OutfitVector } from "@/types";
import { processChoice, type QuizChoice } from "@/lib/recommendation-engine";

export const dynamic = "force-dynamic";

interface ChooseRequestBody {
  chosenIndex: 0 | 1; // Which outfit was chosen (0 or 1)
  currentRound: number;
  totalRounds: number;
  pair: Array<{
    id: string;
    brand: string;
    season: string;
    imageUrl: string;
    description: string;
    tags: string[];
  }>;
  _state: {
    choices: QuizChoice[];
    candidatePool: Array<{
      outfit: {
        brand: string;
        year: number;
        season: string;
        imageUrl: string;
        description: string;
        tags: string[];
      };
      tagVector: number[];
    }>;
    runningTasteVector: number[] | null;
  };
}

/**
 * POST /api/quiz/choose
 * Processes a user's outfit choice and returns the next pair (or completion status)
 */
export async function POST(request: Request) {
  try {
    const body: ChooseRequestBody = await request.json();
    const { chosenIndex, currentRound, totalRounds, pair, _state } = body;

    if (chosenIndex !== 0 && chosenIndex !== 1) {
      return NextResponse.json(
        { error: "chosenIndex must be 0 or 1" },
        { status: 400 }
      );
    }

    // Reconstruct OutfitVectors from the pair
    const pairVectors: [OutfitVector, OutfitVector] = [
      {
        outfit: {
          brand: pair[0].brand,
          year: 2025,
          season: pair[0].season,
          imageUrl: pair[0].imageUrl,
          description: pair[0].description,
          tags: pair[0].tags,
        },
        tagVector: findTagVectorForOutfit(_state.candidatePool, pair[0]),
      },
      {
        outfit: {
          brand: pair[1].brand,
          year: 2025,
          season: pair[1].season,
          imageUrl: pair[1].imageUrl,
          description: pair[1].description,
          tags: pair[1].tags,
        },
        tagVector: findTagVectorForOutfit(_state.candidatePool, pair[1]),
      },
    ];

    const chosen = pairVectors[chosenIndex];
    const rejected = pairVectors[chosenIndex === 0 ? 1 : 0];

    // Reconstruct current state
    const currentState = {
      currentRound,
      totalRounds,
      choices: _state.choices,
      candidatePool: _state.candidatePool as OutfitVector[],
      runningTasteVector: _state.runningTasteVector,
    };

    // Process the choice
    const { state: newState, nextPair, isComplete } = processChoice(
      currentState,
      chosen,
      rejected
    );

    if (isComplete) {
      // Quiz is done - return choices for results page
      return NextResponse.json({
        isComplete: true,
        currentRound: newState.currentRound,
        totalRounds: newState.totalRounds,
        choices: newState.choices.map((c) => ({
          round: c.round,
          chosen: {
            brand: c.chosen.outfit.brand,
            season: c.chosen.outfit.season,
            imageUrl: c.chosen.outfit.imageUrl,
            tags: c.chosen.outfit.tags,
          },
        })),
        _state: {
          choices: newState.choices,
          candidatePool: [],
          runningTasteVector: newState.runningTasteVector,
        },
      });
    }

    if (!nextPair) {
      return NextResponse.json(
        { error: "Failed to generate next pair" },
        { status: 500 }
      );
    }

    // Return next pair
    return NextResponse.json({
      isComplete: false,
      currentRound: newState.currentRound,
      totalRounds: newState.totalRounds,
      pair: [
        {
          id: `${nextPair[0].outfit.brand}-${nextPair[0].outfit.season}`.replace(/\s+/g, "-"),
          brand: nextPair[0].outfit.brand,
          season: nextPair[0].outfit.season,
          imageUrl: nextPair[0].outfit.imageUrl,
          description: nextPair[0].outfit.description,
          tags: nextPair[0].outfit.tags,
        },
        {
          id: `${nextPair[1].outfit.brand}-${nextPair[1].outfit.season}`.replace(/\s+/g, "-"),
          brand: nextPair[1].outfit.brand,
          season: nextPair[1].outfit.season,
          imageUrl: nextPair[1].outfit.imageUrl,
          description: nextPair[1].outfit.description,
          tags: nextPair[1].outfit.tags,
        },
      ],
      _state: {
        choices: newState.choices,
        candidatePool: newState.candidatePool.map((ov) => ({
          outfit: ov.outfit,
          tagVector: ov.tagVector,
        })),
        runningTasteVector: newState.runningTasteVector,
      },
    });
  } catch (error) {
    console.error("[Quiz Choose] Error:", error);
    return NextResponse.json(
      { error: "Failed to process choice" },
      { status: 500 }
    );
  }
}

/**
 * Find the tag vector for an outfit from the candidate pool
 */
function findTagVectorForOutfit(
  pool: Array<{ outfit: { brand: string; imageUrl: string }; tagVector: number[] }>,
  outfit: { brand: string; imageUrl: string }
): number[] {
  const found = pool.find(
    (p) => p.outfit.brand === outfit.brand && p.outfit.imageUrl === outfit.imageUrl
  );
  return found?.tagVector || new Array(100).fill(0);
}
