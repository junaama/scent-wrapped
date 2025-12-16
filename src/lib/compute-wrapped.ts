import {
  buildFashionProfile,
  generateFashionLabel,
  calculateStyleAge,
  scoreOutfit,
  type ScoredOutfit,
} from "./genre-mapping";
import { MOCK_TOP_ARTISTS, getOutfitsWithTags } from "./mock-data";
import type { RunwayOutfit } from "./outfits";

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; height?: number; width?: number }[];
  popularity?: number;
}

interface OutfitInput {
  brand: string;
  year?: number;
  season: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

export interface WrappedResult {
  user: {
    displayName: string;
  };
  genres: string[];
  genreCount: number;
  styleCount: number;
  fashionLabel: string;
  topArtist: {
    name: string;
    imageUrl: string;
  };
  topFiveArtists: {
    name: string;
    imageUrl: string;
  }[];
  colorPalette: string[];
  colorTags: string[];
  topBrands: { name: string; reason: string; imageUrl: string; representativeBrandImage: string }[];
  styleAge: { label: string; decade: string; description: string; age: number };
  topOutfits: ScoredOutfit[];
  fashionKeywords: Record<string, number>;
}

// Color palettes based on outfit tags
function generateColorPaletteFromOutfits(outfits: ScoredOutfit[]): { colors: string[]; tags: string[] } {
  // Tag to color mapping based on common fashion/runway descriptors
  const tagColors: Record<string, string> = {
    // Neutrals
    "black": "#1a1a1a",
    "white": "#FFFFFF",
    "grey": "#6b6b6b",
    "gray": "#6b6b6b",
    "monochrome": "#333333",
    "neutral": "#9e9e9e",

    // Earth tones
    "earth tones": "#8B7355",
    "brown": "#8B4513",
    "beige": "#F5DEB3",
    "tan": "#D2B48C",
    "camel": "#C19A6B",

    // Bold colors
    "red": "#C41E3A",
    "bold": "#FF4500",
    "yellow": "#FFD700",
    "orange": "#FF8C00",
    "pink": "#FFB6C1",
    "purple": "#8B008B",
    "blue": "#4169E1",
    "green": "#228B22",
    "pastel": "#E6E6FA",

    // Styles that imply colors
    "dark": "#1a1a1a",
    "dystopian": "#2d2d2d",
    "futuristic": "#1E90FF",
    "romantic": "#DDA0DD",
    "elegant": "#2C3E50",
    "luxury": "#C9B037",
    "minimalist": "#E8E8E8",
    "vintage": "#D2691E",
    "grunge": "#4a4a4a",
    "streetwear": "#FF4500",
    "techwear": "#0F0F0F",
    "bohemian": "#CD853F",
    "colorful": "#FF6B6B",
  };

  // Count color occurrences from outfit descriptions and track contributing tags
  const colorCounts: Record<string, number> = {};
  const colorToTags: Record<string, Set<string>> = {};

  outfits.forEach((outfit, index) => {
    const weight = 5 - index; // Higher weight for better matched outfits
    const description = outfit.description.toLowerCase();

    Object.entries(tagColors).forEach(([tag, color]) => {
      if (description.includes(tag)) {
        colorCounts[color] = (colorCounts[color] || 0) + weight;
        
        // Track which tags contributed to this color
        if (!colorToTags[color]) {
          colorToTags[color] = new Set();
        }
        colorToTags[color].add(tag);
      }
    });
  });

  // Get top 4 colors with their tags
  const sortedColorEntries = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const sortedColors = sortedColorEntries.map(([color]) => color);
  const sortedTags = sortedColorEntries
    .map(([color]) => {
      // Get the first tag that contributed to this color (or use a default)
      const tags = Array.from(colorToTags[color] || []);
      return tags[0] || "neutral";
    });

  // If we don't have enough colors, add defaults
  const defaultColors = ["#1a1a1a", "#6b6b6b", "#9e9e9e", "#d4d4d4"];
  const defaultTags = ["black", "grey", "neutral", "monochrome"];
  
  while (sortedColors.length < 4) {
    for (let i = 0; i < defaultColors.length; i++) {
      const color = defaultColors[i];
      const tag = defaultTags[i];
      if (!sortedColors.includes(color)) {
        sortedColors.push(color);
        sortedTags.push(tag);
        break;
      }
    }
    // Safety: if all defaults are somehow used, just break
    if (sortedColors.length < 4 && defaultColors.every(c => sortedColors.includes(c))) {
      break;
    }
  }

  return { colors: sortedColors, tags: sortedTags };
}

// Artist quotes/associations
const ARTIST_QUOTES: Record<string, string> = {
  "Björk": "It's not the music that makes me want to produce, it's the life force",
  "Radiohead": "Everything in its right place",
  "Tame Impala": "Let it happen",
  "HYUKOH": "Feels like we only go backwards",
  "Stan Getz": "Let's cool one",
  "KAI": "Mmmh, that style though",
  "default": "Your sound, your style",
};

export interface ComputeWrappedOptions {
  genderPreference?: string;
  displayName?: string;
  artists?: SpotifyArtist[];
  outfits?: OutfitInput[];
}

export function computeWrappedData(options: ComputeWrappedOptions = {}): WrappedResult {
  const {
    genderPreference = "neutral",
    displayName = "Music Lover",
    artists: providedArtists,
    outfits: providedOutfits,
  } = options;

  const artists = providedArtists || MOCK_TOP_ARTISTS.items;
  const outfits = providedOutfits || getOutfitsWithTags();

  // Build fashion profile from artists
  const profile = buildFashionProfile(artists);

  // Get unique styles count
  const uniqueStyles = new Set(Object.keys(profile.fashionKeywords));
  // Get top artist (first one with an image)
  const topArtist = artists.find((a) => a.images.length > 0) || artists[0] || { name: "Unknown Artist", images: [] };
  // Get top 5 artists
  const topFiveArtists = artists.slice(0, 5).map((artist) => ({
    name: artist.name || "Unknown Artist",
    imageUrl: artist.images[0]?.url || "",
  }));
  const fashionLabel = generateFashionLabel(profile.fashionKeywords);

  // Get top artist (first one with an image)
  // const topArtist = artists.find((a) => a.images.length > 0) || artists[0];

  // Calculate style age
  const styleAge = calculateStyleAge(profile.topGenres);

  // Filter outfits by gender preference based on season/collection type
  const filterOutfitsByGender = (outfit: OutfitInput): boolean => {
    const seasonLower = outfit.season.toLowerCase();
    const isMenswear = seasonLower.includes('menswear');

    if (genderPreference === "feminine") {
      // Only non-menswear (Ready-to-Wear, Womenswear, etc.)
      return !isMenswear;
    } else if (genderPreference === "masculine") {
      // Only menswear
      return isMenswear;
    }
    // Neutral: include all
    return true;
  };

  const filteredOutfits = outfits.filter(filterOutfitsByGender);

  // Fallback to all outfits if filter returns too few results
  const outfitsToScore = filteredOutfits.length >= 10 ? filteredOutfits : outfits;

  // Score and select top outfits
  const scoredOutfits = outfitsToScore.map((outfit) => {
    const { score, matchedKeywords } = scoreOutfit(outfit, profile.fashionKeywords);

    return {
      brand: outfit.brand,
      season: outfit.season,
      imageUrl: outfit.imageUrl,
      description: outfit.description,
      matchScore: Math.round(score * 10) / 10,
      matchedKeywords: matchedKeywords.slice(0, 5),
    };
  });

  // Sort by score and diversify brands (max 2 per brand)
  scoredOutfits.sort((a, b) => b.matchScore - a.matchScore);

  const selectedOutfits: ScoredOutfit[] = [];
  const brandCounts: Record<string, number> = {};

  for (const outfit of scoredOutfits) {
    if (selectedOutfits.length >= 5) break;
    const count = brandCounts[outfit.brand] || 0;
    if (count < 2) {
      selectedOutfits.push(outfit);
      brandCounts[outfit.brand] = count + 1;
    }
  }

  // If we don't have enough, just take top 5
  if (selectedOutfits.length < 5) {
    // selectedOutfits.push(...scoredOutfits.slice(0, 5 - selectedOutfits.length));
    for (const outfit of scoredOutfits) {
            if (selectedOutfits.length >= 5) break;
            if (!selectedOutfits.includes(outfit)) {
              selectedOutfits.push(outfit);
            }
          }
         }
  

  // Generate color palette from matched outfits (after outfits are selected)
  const { colors: colorPalette, tags: colorTags } = generateColorPaletteFromOutfits(selectedOutfits);

  // Get set of image URLs used in topOutfits to avoid duplicates
  const usedOutfitImages = new Set(selectedOutfits.map(o => o.imageUrl));

  // Derive top brands from scored outfits, using DIFFERENT images than topOutfits
  // For each brand, find two outfits: one for the brand page, one as representative
  const brandsSeen = new Set<string>();
  const topBrands: { name: string; reason: string; imageUrl: string; representativeBrandImage: string }[] = [];

  for (const outfit of scoredOutfits) {
    const brandLower = outfit.brand.toLowerCase();
    if (!brandsSeen.has(brandLower) && outfit.imageUrl) {
      // Find outfits for this brand that aren't used in topOutfits
      const brandOutfits = scoredOutfits.filter(
        o => o.brand.toLowerCase() === brandLower &&
             o.imageUrl &&
             !usedOutfitImages.has(o.imageUrl)
      );

      // If we have unused brand outfits, use them; otherwise fall back to any brand outfit
      const allBrandOutfits = scoredOutfits.filter(
        o => o.brand.toLowerCase() === brandLower && o.imageUrl
      );

      const primaryOutfit = brandOutfits[0] || allBrandOutfits[0];
      const secondaryOutfit = brandOutfits[1] || allBrandOutfits[1] || primaryOutfit;

      if (primaryOutfit) {
        brandsSeen.add(brandLower);
        topBrands.push({
          name: outfit.brand,
          reason: `${primaryOutfit.matchedKeywords[0] || 'style'}`,
          imageUrl: primaryOutfit.imageUrl,
          representativeBrandImage: secondaryOutfit?.imageUrl || primaryOutfit.imageUrl,
        });
        if (topBrands.length >= 5) break;
      }
    }
  }

  return {
    user: {
      displayName,
    },
    genres: profile.topGenres,
    genreCount: Object.keys(profile.genreCounts).length,
    styleCount: uniqueStyles.size,
    fashionLabel,
    topArtist: {
      name: topArtist.name,
      imageUrl: topArtist.images[0]?.url || "",
    },
    topFiveArtists,
    colorPalette,
    colorTags,
    topBrands,
    styleAge,
    topOutfits: selectedOutfits,
    fashionKeywords: profile.fashionKeywords,
  };
}

export function getArtistQuote(artistName: string): string {
  return ARTIST_QUOTES[artistName] || ARTIST_QUOTES["default"];
}
