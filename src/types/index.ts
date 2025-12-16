export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; height: number; width: number }[];
  popularity: number;
  followers: { total: number };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
}

export interface UserProfile {
  id: string;
  display_name: string;
  images: { url: string }[];
}

export interface RunwayOutfit {
  id: string;
  imageUrl: string;
  designer: string;
  collection: string;
  tags: string[];
}

export interface WrappedData {
  user: UserProfile;
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  genres: string[];
  styleCount: number;
  topBrands: { name: string; reason: string }[];
  styleAge: { label: string; description: string };
  colorPalette: string[];
  topOutfits: RunwayOutfit[];
}

export type GenderPreference = 'feminine' | 'masculine' | 'neutral';

export type ColorPalette = 'warm' | 'cool' | 'neutral' | 'bold';

export interface UserPreferences {
  genderPreference: GenderPreference;
  colorPalette: ColorPalette;
}

// Perfume data types
export interface PerfumeRating {
  score: string;
  votes: string;
}

export interface ChartEntry {
  name: string;
  votes: number;
}

export interface CommunityCharts {
  Type?: ChartEntry[];
  Style?: ChartEntry[];
  Season?: ChartEntry[];
  Occasion?: ChartEntry[];
}

export interface Perfume {
  name: string;
  brand: string;
  release_year: string;
  description: string;
  image_url: string;
  main_accords: string[];
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  ratings: {
    scent?: PerfumeRating;
    durability?: PerfumeRating;
    sillage?: PerfumeRating;
    bottle?: PerfumeRating;
    pricing?: PerfumeRating;
  };
  community_charts: CommunityCharts;
}

// Vector representation for ML matching
export interface PerfumeVector {
  perfume: Perfume;
  accordVector: number[];    // One-hot encoded main accords
  styleVector: number[];     // Weighted style votes
  typeVector: number[];      // Weighted type votes
  seasonVector: number[];    // Weighted season votes
  occasionVector: number[];  // Weighted occasion votes
}

export interface OutfitVector {
  outfit: RunwayOutfitData;
  tagVector: number[];       // One-hot encoded tags
  embedding?: number[];      // Optional: sentence embedding from description
}

// Outfit from CSV (extended version)
export interface RunwayOutfitData {
  brand: string;
  year: number;
  season: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

// User taste profile from quiz
export interface UserTasteVector {
  averageTagVector: number[];
  topTags: string[];
  selectedOutfits: RunwayOutfitData[];
}
