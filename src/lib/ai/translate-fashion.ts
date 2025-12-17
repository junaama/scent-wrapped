"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { ACCORD_VOCABULARY, STYLE_VOCABULARY } from "../perfumes";

// Schema for the LLM response
const ScentProfileSchema = z.object({
  accords: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("3-5 main scent accords that match the fashion aesthetic"),
  style: z
    .object({
      feminine: z.number().min(0).max(1).describe("Weight for feminine style (0-1)"),
      masculine: z.number().min(0).max(1).describe("Weight for masculine style (0-1)"),
      modern: z.number().min(0).max(1).describe("Weight for modern style (0-1)"),
      classic: z.number().min(0).max(1).describe("Weight for classic style (0-1)"),
    })
    .describe("Style weights that should sum to approximately 1"),
  reasoning: z
    .string()
    .describe("One short sentence: 'Your fashion choices reflect [adjectives from tags] which suggest a fragrance profile that is [accords].'"),
});

export type ScentProfile = z.infer<typeof ScentProfileSchema>;

/**
 * Uses an LLM to translate fashion aesthetic tags into a scent profile
 * This is called after the quiz to generate personalized recommendations
 */
export async function translateFashionToScentWithLLM(
  fashionTags: string[]
): Promise<ScentProfile> {
  const accordList = ACCORD_VOCABULARY.join(", ");
  const styleList = STYLE_VOCABULARY.join(", ");

  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: ScentProfileSchema,
    prompt: `You are an expert perfumer and fashion stylist who understands the deep connections between visual aesthetics and scent profiles.

A user's fashion preferences are described by these keywords: "${fashionTags.join(", ")}"

Based on these fashion aesthetics, generate a corresponding fragrance profile.

AVAILABLE ACCORDS (choose 3-5 that best match):
${accordList}

AVAILABLE STYLES (assign weights that sum to ~1):
${styleList}

Consider these connections:
- Minimalist/clean aesthetics → Fresh, Citrus, Green accords
- Dark/gothic/edgy styles → Smoky, Leathery, Resinous accords
- Romantic/feminine looks → Floral, Sweet, Powdery accords
- Bold/dramatic fashion → Oriental, Spicy, Animal accords
- Natural/bohemian vibes → Earthy, Green, Woody accords
- Luxurious/elegant styles → Floral, Oriental, Powdery accords
- Streetwear/modern looks → Fresh, Synthetic, Woody accords

Return a scent profile that would complement someone who loves this fashion aesthetic.

For reasoning, use exactly this format in ONE short sentence:
"Your fashion choices reflect [style adjectives] which suggest a fragrance profile that is [accord adjectives]."`,
  });

  return object;
}

/**
 * Fallback function if LLM call fails - uses the static mapping
 */
export async function translateFashionToScentFallback(
  fashionTags: string[]
): Promise<ScentProfile> {
  // Import the static mapping logic
  const FASHION_TO_SCENT_MAP: Record<string, { accords: string[]; style: string }> = {
    "sophisticated": { accords: ["Woody", "Resinous", "Spicy"], style: "Classic" },
    "elegant": { accords: ["Floral", "Powdery", "Fresh"], style: "Feminine" },
    "minimalist": { accords: ["Fresh", "Citrus", "Green"], style: "Modern" },
    "avant-garde": { accords: ["Synthetic", "Smoky", "Earthy"], style: "Modern" },
    "edgy": { accords: ["Leathery", "Smoky", "Spicy"], style: "Masculine" },
    "romantic": { accords: ["Floral", "Sweet", "Powdery"], style: "Feminine" },
    "dramatic": { accords: ["Oriental", "Spicy", "Animal"], style: "Classic" },
    "bohemian": { accords: ["Earthy", "Green", "Floral"], style: "Feminine" },
    "gothic": { accords: ["Smoky", "Resinous", "Animal"], style: "Masculine" },
    "futuristic": { accords: ["Synthetic", "Aquatic", "Fresh"], style: "Modern" },
    "vintage": { accords: ["Powdery", "Floral", "Oriental"], style: "Classic" },
    "streetwear": { accords: ["Fresh", "Synthetic", "Woody"], style: "Modern" },
    "grunge": { accords: ["Smoky", "Leathery", "Earthy"], style: "Masculine" },
    "maximalist": { accords: ["Oriental", "Sweet", "Spicy"], style: "Feminine" },
    "casual": { accords: ["Fresh", "Citrus", "Green"], style: "Modern" },
    "formal": { accords: ["Woody", "Spicy", "Oriental"], style: "Classic" },
    "black": { accords: ["Smoky", "Leathery", "Woody"], style: "Masculine" },
    "white": { accords: ["Fresh", "Powdery", "Citrus"], style: "Modern" },
    "earth tones": { accords: ["Woody", "Earthy", "Resinous"], style: "Classic" },
    "feminine": { accords: ["Floral", "Sweet", "Powdery"], style: "Feminine" },
  };

  const accordCounts: Record<string, number> = {};
  const styleCounts: Record<string, number> = { Feminine: 0, Masculine: 0, Modern: 0, Classic: 0 };

  for (const tag of fashionTags) {
    const mapping = FASHION_TO_SCENT_MAP[tag.toLowerCase()];
    if (mapping) {
      for (const accord of mapping.accords) {
        accordCounts[accord] = (accordCounts[accord] || 0) + 1;
      }
      styleCounts[mapping.style] = (styleCounts[mapping.style] || 0) + 1;
    }
  }

  const sortedAccords = Object.entries(accordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([accord]) => accord);

  const totalStyle = Object.values(styleCounts).reduce((a, b) => a + b, 0) || 1;

  return {
    accords: sortedAccords.length > 0 ? sortedAccords : ["Fresh", "Woody", "Citrus"],
    style: {
      feminine: styleCounts.Feminine / totalStyle,
      masculine: styleCounts.Masculine / totalStyle,
      modern: styleCounts.Modern / totalStyle,
      classic: styleCounts.Classic / totalStyle,
    },
    reasoning: `Your fashion choices reflect ${fashionTags.slice(0, 3).join(", ")} elements which suggest a fragrance profile that is ${sortedAccords.slice(0, 3).join(", ").toLowerCase()}.`,
  };
}

/**
 * Main function that tries LLM first, falls back to static mapping
 */
export async function translateFashionToScent(
  fashionTags: string[],
  useLLM: boolean = true
): Promise<ScentProfile> {
  if (!useLLM) {
    return translateFashionToScentFallback(fashionTags);
  }

  try {
    return await translateFashionToScentWithLLM(fashionTags);
  } catch (error) {
    console.error("[AI] LLM translation failed, using fallback:", error);
    return translateFashionToScentFallback(fashionTags);
  }
}
