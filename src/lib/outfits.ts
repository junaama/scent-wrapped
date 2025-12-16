import { promises as fs } from "fs";
import path from "path";
import type { OutfitVector, RunwayOutfitData } from "../types";

export type RunwayOutfit = RunwayOutfitData;

// Top 100 most common tags from the dataset (for one-hot encoding)
export const TAG_VOCABULARY = [
  "sophisticated", "elegant", "monochrome", "formal", "casual",
  "relaxed", "earth tones", "black", "avant-garde", "minimalist",
  "edgy", "dramatic", "bold", "structured", "romantic",
  "trousers", "classic", "oversized", "flowing", "subtle",
  "streetwear", "fitted", "vintage", "preppy", "deconstructed",
  "statement", "menswear", "playful", "retro", "white",
  "sheer", "dress", "knit", "silk", "blazer",
  "futuristic", "tailored", "gothic", "matching set", "feminine",
  "bohemian", "mini dress", "lace", "blue", "y2k",
  "sculptural", "bold colors", "textured", "denim", "conceptual",
  "leather", "grunge", "linen", "grey", "statement piece",
  "coat", "experimental", "unique", "brown", "couture",
  "maximalist", "comfortable", "utilitarian", "pastel", "red",
  "floral", "black and white", "mini skirt", "midi dress", "relaxed fit",
  "runway", "dark", "fall", "simple", "pink",
  "evening wear", "resort wear", "sporty", "layering", "knitwear",
  "chic", "creative", "neutral", "embroidered", "geometric",
  "asymmetrical", "beige", "metallic", "sexy", "velvet",
  "wide leg", "long coat", "refined", "satin", "maxi dress",
  "feathers", "winter", "sequins", "power dressing", "soft",
] as const;

export type OutfitTag = (typeof TAG_VOCABULARY)[number];

// In-memory cache for outfits (loaded once per server instance)
let cachedOutfits: RunwayOutfit[] | null = null;
let cachedOutfitVectors: OutfitVector[] | null = null;

/**
 * Creates a one-hot encoded tag vector for an outfit
 */
export function encodeOutfitTags(tags: string[]): number[] {
  const normalizedTags = tags.map((t) => t.toLowerCase().trim());
  return TAG_VOCABULARY.map((tag) => (normalizedTags.includes(tag) ? 1 : 0));
}

/**
 * Creates a vector representation of an outfit for similarity matching
 */
export function createOutfitVector(outfit: RunwayOutfit): OutfitVector {
  return {
    outfit,
    tagVector: encodeOutfitTags(outfit.tags),
  };
}

/**
 * Gets the top tags from a tag vector based on vocabulary
 */
export function getTopTagsFromVector(
  tagVector: number[],
  topN: number = 5
): string[] {
  const indexed = tagVector.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => b.val - a.val);
  return indexed
    .slice(0, topN)
    .filter((item) => item.val > 0)
    .map((item) => TAG_VOCABULARY[item.idx]);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDescription(description: string): string[] {
  return description
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 2);
}

export async function loadOutfitsFromCSV(): Promise<RunwayOutfit[]> {
  // Return cached data if available
  if (cachedOutfits) {
    return cachedOutfits;
  }

  const csvPath = path.join(process.cwd(), ".", "data", "vogue_tagged_outfits.csv");

  try {
    const fileContent = await fs.readFile(csvPath, "utf-8");
    const lines = fileContent.split("\n");

    // Skip header row
    const outfits: RunwayOutfit[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = parseCSVLine(line);
      if (fields.length < 5) continue;

      const [brand, year, season, imageUrl, description] = fields;

      outfits.push({
        brand: brand || "",
        year: parseInt(year) || 2025,
        season: season || "",
        imageUrl: imageUrl || "",
        description: description || "",
        tags: parseDescription(description || ""),
      });
    }

    // Cache the parsed outfits
    cachedOutfits = outfits;
    console.log(`[Outfits] Loaded ${outfits.length} outfits from CSV`);

    return outfits;
  } catch (error) {
    console.error("[Outfits] Failed to load CSV:", error);
    throw new Error("Failed to load outfit data");
  }
}

/**
 * Loads outfits and creates vector representations
 */
export async function loadOutfitVectors(): Promise<OutfitVector[]> {
  if (cachedOutfitVectors) {
    return cachedOutfitVectors;
  }

  const outfits = await loadOutfitsFromCSV();
  cachedOutfitVectors = outfits.map(createOutfitVector);

  console.log(`[Outfits] Created ${cachedOutfitVectors.length} outfit vectors`);
  return cachedOutfitVectors;
}

/**
 * Gets a random sample of outfit vectors with good diversity
 */
export async function sampleDiverseOutfits(
  count: number = 100
): Promise<OutfitVector[]> {
  const allVectors = await loadOutfitVectors();

  // Stratified sampling by brand to ensure diversity
  const byBrand = new Map<string, OutfitVector[]>();
  for (const vec of allVectors) {
    const brand = vec.outfit.brand;
    if (!byBrand.has(brand)) {
      byBrand.set(brand, []);
    }
    byBrand.get(brand)!.push(vec);
  }

  const sampled: OutfitVector[] = [];
  const brands = Array.from(byBrand.keys());

  // Round-robin sample from each brand
  let brandIdx = 0;
  while (sampled.length < count && brands.length > 0) {
    const brand = brands[brandIdx % brands.length];
    const brandOutfits = byBrand.get(brand)!;

    if (brandOutfits.length > 0) {
      const randomIdx = Math.floor(Math.random() * brandOutfits.length);
      sampled.push(brandOutfits.splice(randomIdx, 1)[0]);
    }

    if (brandOutfits.length === 0) {
      brands.splice(brandIdx % brands.length, 1);
    } else {
      brandIdx++;
    }
  }

  return sampled;
}

// Clear cache (useful for development/testing)
export function clearOutfitCache(): void {
  cachedOutfits = null;
  cachedOutfitVectors = null;
}
