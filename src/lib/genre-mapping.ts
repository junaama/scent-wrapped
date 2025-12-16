// Genre to fashion mapping - ported from taste_matcher.py
export const GENRE_TO_FASHION: Record<string, string[]> = {
  // Pop & Mainstream
  "pop": ["trendy", "simple", "everyday", "minimalist", "clean", "accessible"],
  "pop rap": ["streetwear", "accessible", "luxury", "bomber", "clean", "sneakers"],
  "pop dance": ["modern", "athleisure", "logo", "trendy", "instagram"],
  "canadian pop": ["monochrome", "minimalist", "quiet luxury", "sweaters", "clean"],

  // Hip-Hop & Rap
  "rap": ["streetwear", "oversized", "luxury", "sneakers", "chains", "hoodies", "tracksuits"],
  "hip hop": ["streetwear", "oversized", "denim", "hoodies", "loose"],
  "trap": ["luxury", "hoodies", "designer", "yeezy", "balenciaga", "hype"],
  "trap latino": ["logo", "designer", "luxury", "monogram", "denim"],

  // Rock & Alternative
  "rock": ["vintage", "grunge", "leather", "denim", "graphic tees", "slim fit"],
  "art rock": ["avant-garde", "experimental", "statement", "unique", "artsy"],
  "alternative rock": ["vintage", "grunge", "leather", "denim", "edgy"],
  "classic rock": ["vintage", "band tees", "leather", "black", "ripped jeans"],
  "modern rock": ["rick owens", "dark", "monochrome", "avant-garde", "minimalist"],
  "hard rock": ["leather", "bell bottoms", "monochrome", "lace", "dark"],
  "alternative metal": ["90s", "oversized", "sportswear", "skater", "vivienne westwood"],

  // Electronic
  "electronic": ["futuristic", "minimalist", "techwear", "modern", "sleek"],
  "edm": ["streetwear", "gorpcore", "supreme", "athletic", "bold"],
  "synthwave": ["retro", "futuristic", "80s", "neon", "bold"],
  "french house": ["chic", "european", "minimalist", "trendy", "clean"],

  // K-Pop & Asian
  "k-pop": ["korean", "cute", "baggy jeans", "crop top", "futuristic", "streetwear", "maison margiela", "rick owens"],
  "k-rock": ["korean", "indie", "layered", "streetwear", "unique"],
  "k-ballad": ["elegant", "romantic", "soft", "refined", "korean"],
  "anime": ["japanese", "avant-garde", "unique", "colorful", "playful"],

  // Latin
  "urbano latino": ["elevated streetwear", "resort", "bode", "knitwear", "colorful"],
  "reggaeton": ["beachwear", "resort", "low rise", "sexy", "bold"],
  "latin pop": ["leather", "mini", "cropped", "colorful", "bold"],
  "musica mexicana": ["western", "embroidery", "cowboy", "luxury", "silk"],

  // Jazz & Soul
  "jazz": ["classic", "sophisticated", "timeless", "elegant", "refined"],
  "bossa nova": ["relaxed", "resort", "effortless", "classic", "brazilian"],
  "cool jazz": ["minimalist", "sophisticated", "clean", "timeless"],
  "brazilian jazz": ["relaxed", "resort", "classic", "elegant"],
  "latin jazz": ["colorful", "sophisticated", "classic", "rhythmic"],
  "r&b": ["y2k", "low rise", "leather", "silk", "boot cut"],

  // Indie & Alternative
  "indie": ["vintage", "high-waisted", "corduroy", "doc martens", "layered", "unique"],
  "indie pop": ["quirky", "vintage", "colorful", "playful", "eclectic"],
  "french indie pop": ["chic", "parisian", "effortless", "european", "romantic"],
  "neo-psychedelic": ["colorful", "retro", "70s", "bohemian", "trippy"],

  // Classical & Soundtrack
  "classical": ["elegant", "timeless", "refined", "formal", "sophisticated"],
  "soundtrack": ["dramatic", "cinematic", "bold", "statement", "theatrical"],
  "musicals": ["theatrical", "dramatic", "bold", "vintage", "costume"],

  // Folk & Country
  "folk": ["bohemian", "earthy", "natural", "vintage", "relaxed"],
  "singer-songwriter": ["boho", "vintage", "comfortable", "carhartt", "corduroy"],
  "contemporary country": ["western", "vintage levis", "cowboy boots", "lace", "ruffles"],

  // Christian/Worship
  "christian": ["modest", "comfortable", "classic", "earthy", "folk"],
  "christian alternative rock": ["layered", "indie", "modest", "vintage"],
  "christian pop": ["clean", "accessible", "modest", "simple"],
  "worship": ["comfortable", "simple", "modest", "relaxed"],
  "christian folk": ["earthy", "natural", "folk", "modest"],
  "cedm": ["modern", "electronic", "clean", "futuristic"],

  // Art & Experimental
  "art pop": ["avant-garde", "bold", "unique", "artistic", "statement", "experimental"],
  "trip hop": ["dark", "moody", "layered", "90s", "minimalist"],

  // Misc
  "permanent wave": ["retro", "80s", "vintage", "graphic", "oversized sweaters"],
  "french pop": ["parisian", "chic", "elegant", "romantic", "european"],
};

// Brand associations by genre
export const GENRE_TO_BRANDS: Record<string, { name: string; styles: string[] }[]> = {
  "k-pop": [
    { name: "Maison Margiela", styles: ["avant-garde", "deconstructed"] },
    { name: "Rick Owens", styles: ["dark", "futuristic"] },
    { name: "Vetements", styles: ["streetwear", "oversized"] },
  ],
  "k-rock": [
    { name: "Acne Studios", styles: ["minimalist", "scandinavian"] },
    { name: "Our Legacy", styles: ["vintage", "layered"] },
  ],
  "art pop": [
    { name: "Comme des Garçons", styles: ["avant-garde", "experimental"] },
    { name: "Iris van Herpen", styles: ["sculptural", "futuristic"] },
  ],
  "art rock": [
    { name: "Ann Demeulemeester", styles: ["dark", "romantic"] },
    { name: "Rick Owens", styles: ["avant-garde", "monochrome"] },
  ],
  "trip hop": [
    { name: "Rick Owens", styles: ["dark", "minimalist"] },
    { name: "Yohji Yamamoto", styles: ["black", "oversized"] },
  ],
  "indie": [
    { name: "A.P.C.", styles: ["minimalist", "french"] },
    { name: "Margaret Howell", styles: ["classic", "understated"] },
  ],
  "french indie pop": [
    { name: "Isabel Marant", styles: ["parisian", "bohemian"] },
    { name: "Sandro", styles: ["chic", "effortless"] },
    { name: "Celine", styles: ["parisian", "minimalist"] },
  ],
  "neo-psychedelic": [
    { name: "Dries Van Noten", styles: ["colorful", "artistic"] },
    { name: "Etro", styles: ["bohemian", "prints"] },
  ],
  "jazz": [
    { name: "Ralph Lauren", styles: ["classic", "sophisticated"] },
    { name: "Brunello Cucinelli", styles: ["quiet luxury", "refined"] },
  ],
  "bossa nova": [
    { name: "Loro Piana", styles: ["relaxed", "luxury"] },
    { name: "The Row", styles: ["minimalist", "elegant"] },
  ],
  "classical": [
    { name: "The Row", styles: ["timeless", "refined"] },
    { name: "Jil Sander", styles: ["minimalist", "elegant"] },
  ],
  "synthwave": [
    { name: "Balenciaga", styles: ["retro-futuristic", "bold"] },
    { name: "Courreges", styles: ["60s", "futuristic"] },
  ],
  "anime": [
    { name: "Undercover", styles: ["japanese", "avant-garde"] },
    { name: "Sacai", styles: ["hybrid", "layered"] },
  ],
  "alternative rock": [
    { name: "AllSaints", styles: ["leather", "edgy"] },
    { name: "The Kooples", styles: ["rock", "parisian"] },
  ],
  "musicals": [
    { name: "Gucci", styles: ["theatrical", "maximalist"] },
    { name: "Dolce & Gabbana", styles: ["dramatic", "ornate"] },
  ],
};

export interface FashionProfile {
  genreCounts: Record<string, number>;
  fashionKeywords: Record<string, number>;
  topGenres: string[];
}

export interface ScoredOutfit {
  brand: string;
  season: string;
  imageUrl: string;
  description: string;
  matchScore: number;
  matchedKeywords: string[];
}

export function extractGenresFromArtists(artists: { genres: string[] }[]): Record<string, number> {
  const genreCounts: Record<string, number> = {};

  artists.forEach((artist, position) => {
    // Weight earlier artists more heavily
    const weight = Math.max(1, 20 - position);

    artist.genres.forEach((genre) => {
      const normalized = genre.toLowerCase().trim();
      genreCounts[normalized] = (genreCounts[normalized] || 0) + weight;
    });
  });

  return genreCounts;
}

export function mapGenresToFashion(genreCounts: Record<string, number>): Record<string, number> {
  const fashionKeywords: Record<string, number> = {};

  Object.entries(genreCounts).forEach(([genre, count]) => {
    // Direct match
    if (GENRE_TO_FASHION[genre]) {
      GENRE_TO_FASHION[genre].forEach((keyword) => {
        fashionKeywords[keyword] = (fashionKeywords[keyword] || 0) + count;
      });
    } else {
      // Fuzzy match
      Object.entries(GENRE_TO_FASHION).forEach(([mappedGenre, keywords]) => {
        if (mappedGenre.includes(genre) || genre.includes(mappedGenre)) {
          keywords.forEach((keyword) => {
            fashionKeywords[keyword] = (fashionKeywords[keyword] || 0) + count * 0.5;
          });
        }
      });
    }
  });

  return fashionKeywords;
}

export function buildFashionProfile(artists: { genres: string[] }[]): FashionProfile {
  const genreCounts = extractGenresFromArtists(artists);
  const fashionKeywords = mapGenresToFashion(genreCounts);

  // Get top 5 genres by count
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  return { genreCounts, fashionKeywords, topGenres };
}

export function scoreOutfit(
  outfit: { description: string; tags: string[] },
  fashionKeywords: Record<string, number>
): { score: number; matchedKeywords: string[] } {
  let score = 0;
  const matchedKeywords: string[] = [];
  const outfitText = outfit.description.toLowerCase();
  const outfitTags = new Set(outfit.tags.map((t) => t.toLowerCase()));

  Object.entries(fashionKeywords).forEach(([keyword, weight]) => {
    const keywordLower = keyword.toLowerCase();

    if (outfitText.includes(keywordLower) || outfitTags.has(keywordLower)) {
      score += weight;
      matchedKeywords.push(keyword);
    } else {
      // Partial match
      for (const tag of outfitTags) {
        if (keywordLower.includes(tag) || tag.includes(keywordLower)) {
          score += weight * 0.5;
          matchedKeywords.push(`${keyword}~${tag}`);
          break;
        }
      }
    }
  });

  return { score, matchedKeywords };
}

export function generateFashionLabel(fashionKeywords: Record<string, number>): string {
  const topKeywords = Object.entries(fashionKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([kw]) => kw);

  const modifiers = [
    "avant-garde", "vintage", "minimalist", "maximalist", "dark",
    "bohemian", "futuristic", "romantic", "edgy", "refined"
  ];

  const styles = [
    "streetwear", "luxury", "grunge", "chic", "classic",
    "boho", "punk", "preppy", "artsy", "eclectic"
  ];

  const selectedModifier = topKeywords.find((kw) => modifiers.includes(kw)) || "eclectic";
  const selectedStyle = topKeywords.find((kw) => styles.includes(kw)) || "style";

  return `${selectedModifier} ${selectedStyle}`;
}

export function getBrandsFromGenres(topGenres: string[]): { name: string; reason: string }[] {
  const brandMap: Record<string, { count: number; genres: string[] }> = {};

  topGenres.forEach((genre) => {
    const brands = GENRE_TO_BRANDS[genre] || [];
    brands.forEach((brand) => {
      if (!brandMap[brand.name]) {
        brandMap[brand.name] = { count: 0, genres: [] };
      }
      brandMap[brand.name].count++;
      brandMap[brand.name].genres.push(genre);
    });
  });

  // Also check partial matches
  topGenres.forEach((genre) => {
    Object.entries(GENRE_TO_BRANDS).forEach(([mappedGenre, brands]) => {
      if (genre.includes(mappedGenre) || mappedGenre.includes(genre)) {
        brands.forEach((brand) => {
          if (!brandMap[brand.name]) {
            brandMap[brand.name] = { count: 0, genres: [] };
          }
          if (!brandMap[brand.name].genres.includes(genre)) {
            brandMap[brand.name].count += 0.5;
            brandMap[brand.name].genres.push(genre);
          }
        });
      }
    });
  });

  return Object.entries(brandMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      reason: `Because you listened to ${data.genres[0]}`,
    }));
}

// Calculate style age based on genre associations
export function calculateStyleAge(topGenres: string[]): { label: string; decade: string; description: string; age: number } {
  // Map genres to age ranges [min, max]
  const genreToAgeRange: Record<string, [number, number]> = {
    // Children's music (0-2)
    "children's music": [0, 2],
    "nursery rhymes": [0, 2],
    "cocomelon": [0, 2],
    
    // Very young (3-10)
    "disney": [3, 10],
    "kids pop": [3, 10],
    
    // Pre-teens/Teens (11-20)
    "pop": [12, 24],
    "k-pop": [16, 24],
    "k-rock": [16, 24],
    "trap": [16, 28],
    "edm": [18, 28],
    "hip hop": [16, 30],
    "rap": [16, 30],
    "pop rap": [16, 28],
    "trap latino": [18, 28],
    "urbano latino": [18, 30],
    "reggaeton": [18, 30],
    "latin pop": [16, 28],
    
    // Young adults (20-35)
    "indie": [20, 32],
    "indie pop": [20, 32],
    "french indie pop": [22, 35],
    "art pop": [22, 35],
    "alternative rock": [22, 38],
    "modern rock": [20, 35],
    "r&b": [20, 35],
    "pop dance": [18, 28],
    "canadian pop": [20, 32],
    
    // Adults (30-50)
    "rock": [30, 50],
    "hard rock": [30, 55],
    "alternative metal": [25, 45],
    "electronic": [25, 45],
    "french house": [28, 45],
    "synthwave": [35, 55],
    "trip hop": [30, 50],
    "grunge": [35, 55],
    "art rock": [30, 55],
    "neo-psychedelic": [35, 60],
    "permanent wave": [40, 60],
    
    // Middle-aged (50-70)
    "classic rock": [50, 70],
    "jazz": [45, 70],
    "bossa nova": [45, 70],
    "cool jazz": [50, 75],
    "brazilian jazz": [45, 70],
    "latin jazz": [45, 70],
    
    // Older (60+)
    "classical": [60, 85],
    "soundtrack": [40, 70],
    "musicals": [50, 80],
    "folk": [40, 70],
    "singer-songwriter": [35, 65],
    "contemporary country": [35, 65],
    "christian": [30, 70],
    "christian alternative rock": [30, 65],
    "christian pop": [25, 60],
    "worship": [30, 70],
    "christian folk": [35, 70],
    "french pop": [40, 65],
    "anime": [18, 35],
  };

  // Calculate weighted average age from genres
  let totalWeight = 0;
  let weightedAgeSum = 0;

  topGenres.forEach((genre, index) => {
    // Weight earlier genres more heavily (first genre gets weight 5, second gets 4, etc.)
    const weight = Math.max(1, 6 - index);
    const ageRange = genreToAgeRange[genre.toLowerCase()];
    
    if (ageRange) {
      const [minAge, maxAge] = ageRange;
      // Use midpoint of the range
      const avgAge = (minAge + maxAge) / 2;
      weightedAgeSum += avgAge * weight;
      totalWeight += weight;
    }
  });

  // Calculate final age
  let age: number;
  if (totalWeight > 0) {
    age = Math.round(weightedAgeSum / totalWeight);
  } else {
    // Default to young adult if no matches
    age = 20;
  }

  // Clamp age to 0-200 range
  age = Math.max(0, Math.min(200, age));

  // Map age to decade and label
  let decade: string;
  let label: string;
  let description: string;

  if (age <= 2) {
    decade = "2020s";
    label = "Gen Alpha";
    description = "You're just getting started";
  } else if (age <= 10) {
    decade = "2020s";
    label = "Gen Alpha";
    description = "You're ahead of the curve";
  } else if (age <= 20) {
    decade = "2020s";
    label = "Gen Alpha";
    description = "You're ahead of the curve";
  } else if (age <= 30) {
    decade = "2010s";
    label = "Gen Z";
    description = "okay zoomer";
  } else if (age <= 40) {
    decade = "2000s";
    label = "Millennial";
    description = "hashtag millennial";
  } else if (age <= 50) {
    decade = "90s";
    label = "Elder Millennial";
    description = "Grunge and minimalism define you";
  } else if (age <= 60) {
    decade = "80s";
    label = "Gen X";
    description = "ok xoomer";
  } else if (age <= 70) {
    decade = "70s";
    label = "Boomer";
    description = "okay boomer";
  } else {
    decade = "60s";
    label = "Silent Generation";
    description = "Classic elegance runs in your veins";
  }

  return { label, decade, description, age };
}
