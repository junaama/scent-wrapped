# Scent Wrapped

A web app that recommends signature scents based on your fashion style preferences. Users choose between runway outfits in a 5-round quiz, and the app uses AI to translate their aesthetic into personalized fragrance recommendations.

## Features

- **Adaptive Quiz**: 5-round binary choice quiz using outfit similarity algorithms
- **AI-Powered Matching**: Gemini LLM translates fashion aesthetics to scent profiles
- **33k+ Runway Outfits**: From Vogue's runway database with tagged descriptions
- **9k+ Fragrances**: Complete with accords, notes, and community ratings

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI API key (for Gemini)

### Environment Setup

Create a `.env` file in the root directory:

```env
# Google AI API key (for Gemini)
# Get this from https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# Optional: Spotify API (for music-based features)
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=https://localhost:3000/api/auth/callback
```

### Installation

```bash
npm install
npm run dev
```

Open [https://localhost:3000](https://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── quiz/
│   │   ├── page.tsx          # Quiz UI (outfit selection)
│   │   └── results/
│   │       └── page.tsx      # Results page (scent recommendations)
│   └── api/
│       └── quiz/
│           ├── start/route.ts    # Start quiz session
│           ├── choose/route.ts   # Submit outfit choice
│           └── results/route.ts  # Get recommendations (calls LLM)
├── lib/
│   ├── ai/
│   │   └── translate-fashion.ts  # LLM action for fashion→scent translation
│   ├── outfits.ts               # Outfit data loader + vectorization
│   ├── perfumes.ts              # Perfume data loader + encoding
│   ├── vectors.ts               # Similarity math utilities
│   └── recommendation-engine.ts # Quiz logic + matching pipeline
├── components/
│   └── ...                      # UI components
└── types/
    └── index.ts                 # TypeScript interfaces
```

## Data

### Outfits (`data/vogue_tagged_outfits.csv`)
- 33,000+ runway looks with brand, season, image URL, and tags
- Tags extracted from descriptions (e.g., "minimalist", "romantic", "edgy")

### Perfumes (`perfume_data/*.json`)
- 9,249 fragrances with accords, notes, ratings, and community charts
- Vectorized using one-hot encoding for similarity matching

## API Routes

### `POST /api/quiz/start`
Starts a new quiz session.

**Request:**
```json
{ "poolSize": 50, "totalRounds": 5 }
```

**Response:**
```json
{
  "quizId": "uuid",
  "currentRound": 1,
  "totalRounds": 5,
  "pair": [{ "brand": "...", "imageUrl": "...", "tags": [...] }, ...],
  "_state": { ... }
}
```

### `POST /api/quiz/choose`
Submit a choice and get the next pair.

**Request:**
```json
{
  "chosenIndex": 0,
  "currentRound": 1,
  "totalRounds": 5,
  "pair": [...],
  "_state": { ... }
}
```

**Response:**
```json
{
  "isComplete": false,
  "currentRound": 2,
  "pair": [...],
  "_state": { ... }
}
```

### `POST /api/quiz/results`
Get scent recommendations (calls Gemini LLM).

**Request:**
```json
{
  "choices": [...],
  "useLLM": true
}
```

**Response:**
```json
{
  "userTaste": { "topTags": ["minimalist", "elegant", ...] },
  "scentProfile": {
    "accords": ["Fresh", "Woody", "Citrus"],
    "style": { "feminine": 0.3, "modern": 0.5, ... },
    "reasoning": "Your minimalist aesthetic pairs with..."
  },
  "recommendations": [
    {
      "name": "Perfume Name",
      "brand": "Brand",
      "imageUrl": "...",
      "mainAccords": ["Fresh", "Citrus"],
      "score": 87,
      "matchReason": "Matches your Fresh & Woody profile..."
    }
  ]
}
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Vercel AI SDK + Google Gemini 1.5 Flash
- **Styling**: Tailwind CSS
- **Fonts**: Geist Sans, Playfair Display



## Scent Recommendation Process from Gemini

## The Strategy: Adaptive Profile Refinement

Your idea of 4-5 binary choices is perfect. It uses **Active Learning** to quickly map a user's taste preferences without requiring them to know a single fashion or fragrance term.

### 1. Data Preparation and Feature Extraction

The first step is turning your rich text and categorical data into **numerical vectors** that a machine learning model can use for comparison.

#### A. Fashion Vectors (33,000 Outfits)
* **Feature:** The `example_description` (e.g., "one shoulder, mini dress, neutral, flowing, romantic...").
* **Action:** Use a robust **Sentence Embedding Model** (like the ones powering Gemini) to convert the entire descriptive string for each outfit into a high-dimensional vector. This embeds the *meaning* or *vibe* of the outfit, not just the keywords.
    * *Result:* Each of the 33,000 outfits now has a 384- or 768-dimensional vector representing its aesthetic.

#### B. Scent Vectors (10,000 Fragrances)
* **Feature:** `main_accords`, `top_notes`, and `community_charts/Style`.
* **Action:** Create a **Scent Profile Vector** based on the most reliable categorical data. Use a **One-Hot Encoding** scheme for the `main_accords` and `Style` charts.
    * *Example Vector:* [1 (Sweet), 0 (Fruity), 1 (Woody), 0 (Aromatic), 1 (Masculine), 0 (Feminine), ...]
    * *Result:* Each of the 10,000 fragrances has a normalized vector representing its scent profile.

### 2. The Adaptive Binary Choice Quiz (4-5 Steps)

The key is making the choices **strategic** to maximize information gain.

| Stage | Goal | Outfit Selection Criteria |
| :--- | :--- | :--- |
| **Initial (Choice 1)** | Find the user's major aesthetic bucket (e.g., Minimalist vs. Maximalist). | **MAXIMUM DISSIMILARITY.** Choose two outfits whose feature vectors have the lowest Cosine Similarity (i.e., they are furthest apart in the aesthetic space). |
| **Refinement (Choices 2-3)** | Refine the choice based on color, silhouette, or fabric within the chosen bucket. | **MEDIUM DISSIMILARITY.** Compare the user's last choice (A) against all unchosen outfits. Find pairs that are similar to A, but differ significantly on *one* core feature (e.g., A is *leather*, B is *silk*). |
| **Final (Choices 4-5)** | Zero in on a specific sub-niche (e.g., "dark romantic" vs. "light romantic"). | **MINIMUM DISSIMILARITY.** Find pairs that are very similar to the user's running taste profile to confirm micro-preferences. |

#### Profiling Output: The User Taste Vector (UTV)
After the 4-5 choices, you calculate the average of the **Fashion Vectors** for all the outfits the user picked. This single, averaged vector is the **User Taste Vector (UTV)**—a highly personalized numerical fingerprint of their aesthetic.

### 3. The Cross-Domain Matching Engine (The Bridge)

This is the most critical step and where your use of LLMs shines, overcoming the need for human-labeled mappings.

#### Strategy: LLM-Assisted Semantic Bridging

Instead of trying to match the Fashion UTV directly to the Scent Vector, you use an LLM as a **Translator**.

1.  **Extract Top Aesthetic Tags from UTV:** Take the UTV and find the top 5 closest outfit vectors in your dataset. Look at their **most frequent keywords** (e.g., `minimalist`, `structured`, `neutral`, `cashmere`).
2.  **Generate Target Scent Profile:** Feed the top 5 aesthetic tags into a generative model with a specific prompt:

    > **Prompt to Gemini:** "A user loves fashion that is described by the following keywords: '{top_5_tags}'. Based on these aesthetics, generate a corresponding fragrance profile. Select 3-5 of the most appropriate **Main Accords** and 5 representative **Notes** from the following lists: [List all 20 Main Accords].
    >
    > **Output only a JSON object:** `{'accords': ['...', '...'], 'notes': ['...', '...']}`"

    * *Example Output:* `{'accords': ['Woody', 'Oriental', 'Spicy'], 'notes': ['Oud', 'Leather', 'Tonka Bean', 'Pepper']}`

3.  **Final Recommendation Match:**

    * Create a **Target Scent Vector** based on the LLM's JSON output.
    * Compare this Target Scent Vector against the **Scent Vectors** of all 10,000 fragrances using **Cosine Similarity**.
    * Recommend the **Top 3 Fragrances** with the highest score.

### Data Requirements & Optimization

| Item | Status | Action Required |
| :--- | :--- | :--- |
| **33k Outfits** | **✓ Sufficient** | Convert `example_description` to **Feature Vectors** (using a tool like an LLM embedding API). |
| **10k Fragrances**| **✓ Sufficient** | Convert `main_accords` and `community_charts` to **Feature Vectors** (One-Hot Encoding). |
| **Cross-Domain Map**| **✗ Missing** | **Bridge with an LLM.** Use a powerful model to translate Fashion Tags into Scent Accords dynamically. |

Your strategy is sound, data-rich, and ready for development. The LLM acts as the "expert perfumer/stylist" that bridges the two domains automatically.