import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/spotify";
import { loadOutfitsFromCSV } from "@/lib/outfits";
import { computeWrappedData } from "@/lib/compute-wrapped";
import { MOCK_TOP_ARTISTS } from "@/lib/mock-data";

// Fetch all top artists with pagination (up to 99 artists)
async function fetchAllTopArtists(accessToken: string) {
  const allArtists: any[] = [];
  const limit = 50;

  // First batch (0-49)
  const firstBatch = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=${limit}&offset=0&time_range=long_term`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!firstBatch.ok) {
    throw new Error("Failed to fetch top artists");
  }

  const firstData = await firstBatch.json();
  allArtists.push(...(firstData.items || []));

  // Second batch (50-99) if there's more data
  if (firstData.total > limit) {
    const secondBatch = await fetch(
      `https://api.spotify.com/v1/me/top/artists?limit=${limit}&offset=${limit}&time_range=long_term`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (secondBatch.ok) {
      const secondData = await secondBatch.json();
      allArtists.push(...(secondData.items || []));
    }
  }

  return allArtists;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  // Get gender preference from query params
  const { searchParams } = new URL(request.url);
  const genderPreference = searchParams.get("gender") || "neutral";

  try {
    // Load outfits (always needed)
    const outfits = await loadOutfitsFromCSV();

    // If no access token, use mock data
    if (!accessToken) {
      console.log(`[Wrapped] No auth token, using mock data with ${outfits.length} outfits`);

      const result = computeWrappedData({
        genderPreference,
        displayName: "Music Lover",
        artists: MOCK_TOP_ARTISTS.items,
        outfits,
      });

      return NextResponse.json(result);
    }

    // Fetch real Spotify data
    const [profile, artists] = await Promise.all([
      getUserProfile(accessToken),
      fetchAllTopArtists(accessToken),
    ]);

    console.log(`[Wrapped] Processing ${artists.length} artists, ${outfits.length} outfits`);

    // Compute the wrapped result
    const result = computeWrappedData({
      genderPreference,
      displayName: profile.display_name || "Music Lover",
      artists,
      outfits,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Wrapped] Error:", error);
    return NextResponse.json(
      { error: "Failed to compute wrapped data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow posting custom artist data for testing
  if (process.env.NODE_ENV === 'production'){
    return NextResponse.json(
      {error: 'This endpoint is disabled in production'},
      {status: 403}
    )
  }
  try {
    const body = await request.json();
    const { artists, genderPreference = "neutral", displayName = "Test User" } = body;

    if (!artists || !Array.isArray(artists)) {
      return NextResponse.json(
        { error: "artists array is required" },
        { status: 400 }
      );
    }

    // Load outfits
    const outfits = await loadOutfitsFromCSV();

    console.log(`[Wrapped] Processing ${artists.length} artists, ${outfits.length} outfits`);

    // Compute the wrapped result
    const result = computeWrappedData({
      genderPreference,
      displayName,
      artists,
      outfits,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Wrapped] Error:", error);
    return NextResponse.json(
      { error: "Failed to compute wrapped data" },
      { status: 500 }
    );
  }
}
