import { promises as fs } from "fs";
import path from "path";
import type { Perfume, PerfumeVector } from "../types";

// Feature vocabularies extracted from the dataset
export const ACCORD_VOCABULARY = [
  "Sweet",
  "Spicy",
  "Floral",
  "Woody",
  "Fruity",
  "Fresh",
  "Creamy",
  "Gourmand",
  "Citrus",
  "Synthetic",
  "Green",
  "Powdery",
  "Oriental",
  "Resinous",
  "Smoky",
  "Leathery",
  "Earthy",
  "Aquatic",
  "Animal",
  "Chypre",
  "Fougère",
] as const;

export const STYLE_VOCABULARY = [
  "Feminine",
  "Modern",
  "Masculine",
  "Classic",
] as const;

export const TYPE_VOCABULARY = [
  "Sweet",
  "Spicy",
  "Floral",
  "Woody",
  "Fruity",
  "Creamy",
  "Fresh",
  "Synthetic",
  "Gourmand",
  "Citrus",
  "Powdery",
  "Green",
  "Resinous",
  "Oriental",
  "Smoky",
  "Earthy",
  "Leathery",
  "Animal",
  "Aquatic",
  "Chypre",
  "Fougère",
] as const;

export const OCCASION_VOCABULARY = [
  "Leisure",
  "Daily",
  "Evening",
  "Night Out",
  "Business",
  "Sport",
] as const;

export const SEASON_VOCABULARY = ["Fall", "Spring", "Winter", "Summer"] as const;

export type Accord = (typeof ACCORD_VOCABULARY)[number];
export type Style = (typeof STYLE_VOCABULARY)[number];
export type PerfumeType = (typeof TYPE_VOCABULARY)[number];
export type Occasion = (typeof OCCASION_VOCABULARY)[number];
export type Season = (typeof SEASON_VOCABULARY)[number];

// In-memory cache for perfumes
let cachedPerfumes: Perfume[] | null = null;
let cachedPerfumeVectors: PerfumeVector[] | null = null;

/**
 * Creates a one-hot encoded vector for a list of accords
 */
export function encodeAccords(accords: string[]): number[] {
  return ACCORD_VOCABULARY.map((accord) =>
    accords.includes(accord) ? 1 : 0
  );
}

/**
 * Creates a weighted vector from community chart votes
 */
function encodeChartVotes<T extends string>(
  votes: { name: string; votes: number }[] | undefined,
  vocabulary: readonly T[]
): number[] {
  if (!votes || votes.length === 0) {
    return vocabulary.map(() => 0);
  }

  const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0);
  if (totalVotes === 0) return vocabulary.map(() => 0);

  return vocabulary.map((item) => {
    const entry = votes.find((v) => v.name === item);
    return entry ? entry.votes / totalVotes : 0;
  });
}

/**
 * Creates a vector representation of a perfume for similarity matching
 */
export function createPerfumeVector(perfume: Perfume): PerfumeVector {
  const charts = perfume.community_charts || {};

  return {
    perfume,
    accordVector: encodeAccords(perfume.main_accords || []),
    styleVector: encodeChartVotes(charts.Style, STYLE_VOCABULARY),
    typeVector: encodeChartVotes(charts.Type, TYPE_VOCABULARY),
    seasonVector: encodeChartVotes(charts.Season, SEASON_VOCABULARY),
    occasionVector: encodeChartVotes(charts.Occasion, OCCASION_VOCABULARY),
  };
}

/**
 * Loads all perfume data from JSON files
 */
export async function loadPerfumes(): Promise<Perfume[]> {
  if (cachedPerfumes) {
    return cachedPerfumes;
  }

  const perfumeDir = path.join(process.cwd(), "perfume_data");

  try {
    const files = await fs.readdir(perfumeDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const perfumes: Perfume[] = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(perfumeDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const perfume = JSON.parse(content) as Perfume;
        perfumes.push(perfume);
      } catch (err) {
        // Skip malformed files
        console.warn(`[Perfumes] Skipping invalid file: ${file}`);
      }
    }

    cachedPerfumes = perfumes;
    console.log(`[Perfumes] Loaded ${perfumes.length} perfumes`);
    return perfumes;
  } catch (error) {
    console.error("[Perfumes] Failed to load perfume data:", error);
    throw new Error("Failed to load perfume data");
  }
}

/**
 * Loads perfumes and creates vector representations
 */
export async function loadPerfumeVectors(): Promise<PerfumeVector[]> {
  if (cachedPerfumeVectors) {
    return cachedPerfumeVectors;
  }

  const perfumes = await loadPerfumes();
  cachedPerfumeVectors = perfumes.map(createPerfumeVector);

  console.log(`[Perfumes] Created ${cachedPerfumeVectors.length} perfume vectors`);
  return cachedPerfumeVectors;
}

/**
 * Creates a target scent vector from LLM-generated accords and style preferences
 */
export function createTargetScentVector(
  accords: string[],
  style: { masculine?: number; feminine?: number; modern?: number; classic?: number } = {}
): { accordVector: number[]; styleVector: number[] } {
  const accordVector = encodeAccords(accords);

  // Normalize style weights
  const totalStyle =
    (style.masculine || 0) +
    (style.feminine || 0) +
    (style.modern || 0) +
    (style.classic || 0);

  const styleVector =
    totalStyle > 0
      ? [
          (style.feminine || 0) / totalStyle,
          (style.modern || 0) / totalStyle,
          (style.masculine || 0) / totalStyle,
          (style.classic || 0) / totalStyle,
        ]
      : [0, 0, 0, 0];

  return { accordVector, styleVector };
}

/**
 * Clear caches (useful for development)
 */
export function clearPerfumeCache(): void {
  cachedPerfumes = null;
  cachedPerfumeVectors = null;
}
