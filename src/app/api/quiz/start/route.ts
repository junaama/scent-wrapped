import { NextResponse } from "next/server";
import { sampleDiverseOutfits } from "@/lib/outfits";
import { initializeQuiz } from "@/lib/recommendation-engine";

export const dynamic = "force-dynamic";

type GenderPreference = 'feminine' | 'masculine' | 'neutral';

/**
 * POST /api/quiz/start
 * Starts a new quiz session and returns the first outfit pair
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const poolSize = body.poolSize || 50; // Number of outfits to sample for the quiz
    const totalRounds = body.totalRounds || 5;
    const gender = body.gender as GenderPreference | undefined;

    // Sample diverse outfits for the quiz pool, filtered by gender preference
    const outfitPool = await sampleDiverseOutfits(poolSize, gender);

    if (outfitPool.length < 2) {
      return NextResponse.json(
        { error: "Not enough outfits available" },
        { status: 500 }
      );
    }

    // Initialize quiz and get first pair
    const { state, pair } = initializeQuiz(outfitPool, totalRounds);

    if (!pair) {
      return NextResponse.json(
        { error: "Failed to generate outfit pair" },
        { status: 500 }
      );
    }

    // Return serializable data (exclude the full candidate pool to reduce payload)
    return NextResponse.json({
      quizId: crypto.randomUUID(),
      currentRound: state.currentRound,
      totalRounds: state.totalRounds,
      pair: [
        {
          id: `${pair[0].outfit.brand}-${pair[0].outfit.season}`.replace(/\s+/g, "-"),
          brand: pair[0].outfit.brand,
          season: pair[0].outfit.season,
          imageUrl: pair[0].outfit.imageUrl,
          description: pair[0].outfit.description,
          tags: pair[0].outfit.tags,
        },
        {
          id: `${pair[1].outfit.brand}-${pair[1].outfit.season}`.replace(/\s+/g, "-"),
          brand: pair[1].outfit.brand,
          season: pair[1].outfit.season,
          imageUrl: pair[1].outfit.imageUrl,
          description: pair[1].outfit.description,
          tags: pair[1].outfit.tags,
        },
      ],
      // Store state for subsequent requests (in production, use a session store)
      _state: {
        choices: [],
        candidatePool: outfitPool.map((ov) => ({
          outfit: ov.outfit,
          tagVector: ov.tagVector,
        })),
        runningTasteVector: null,
      },
    });
  } catch (error) {
    console.error("[Quiz Start] Error:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}
