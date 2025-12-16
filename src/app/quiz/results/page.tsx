'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ScreenWrapper, Button, PerfumePentagram, createPentagramPoints } from '@/components';

interface Recommendation {
  name: string;
  brand: string;
  imageUrl: string;
  mainAccords: string[];
  score: number;
  matchReason: string;
  ratings: {
    scent?: { score: string };
    durability?: { score: string };
  };
}

interface ScentProfile {
  accords: string[];
  style: {
    feminine: number;
    masculine: number;
    modern: number;
    classic: number;
  };
  reasoning: string;
}

interface ResultsData {
  userTaste: {
    topTags: string[];
    selectedOutfits: Array<{ brand: string; season: string; imageUrl: string }>;
  };
  scentProfile: ScentProfile;
  recommendations: Recommendation[];
}

const rotatingLoadingText = [
  'figuring you out...',
  'touching grass...',
  'picking you, choosing you, loving you...',
];

export default function ResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % rotatingLoadingText.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get quiz choices from localStorage
      const storedChoices = localStorage.getItem('quizChoices');
      if (!storedChoices) {
        router.push('/quiz');
        return;
      }

      const choices = JSON.parse(storedChoices);

      const res = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choices, useLLM: true }),
      });

      if (!res.ok) throw new Error('Failed to get recommendations');

      const data = await res.json();
      setResults(data);

      // Clear stored choices
      localStorage.removeItem('quizChoices');
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopStyle = (style: ScentProfile['style']) => {
    const entries = Object.entries(style) as [string, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };
  if (isLoading) {
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center text-center gap-4">
        <div className="animate-pulse">
          <p className="text-xs mt-2">
            {rotatingLoadingText[loadingTextIndex]}
          </p>
        </div>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center text-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" onClick={() => router.push('/quiz')}>
          Try again
        </Button>
      </ScreenWrapper>
    );
  }

  if (!results) return null;

  return (
    <ScreenWrapper className="flex flex-col items-center py-8">
      {/* Header */}
      <p className="text-sm text-slate-500 mb-2">your scent profile</p>
      <h1 className="font-serif text-3xl text-center mb-6">
        we found your
        <br />
        signature scents
      </h1>

      {/* Scent Profile Summary */}
      <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Your vibe</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {results.scentProfile.accords.map((accord) => (
            <span
              key={accord}
              className="px-3 py-1 bg-white rounded-full text-sm border border-slate-200"
            >
              {accord}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-600 capitalize">
          {getTopStyle(results.scentProfile.style)} • {results.userTaste.topTags.slice(0, 3).join(' • ')}
        </p>
      </div>

      {/* Scent Pentagram */}
      <div className="w-full bg-black rounded-2xl p-6 mb-8">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 text-center">
          Your scent profile
        </p>
        <PerfumePentagram points={createPentagramPoints(results.scentProfile.accords)} />
      </div>

      {/* Recommendations */}
      <div className="w-full space-y-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Top matches</p>

        {results.recommendations.map((rec, index) => (
          <div
            key={rec.name}
            className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl"
          >
            {/* Perfume image */}
            <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              {rec.imageUrl ? (
                <Image
                  src={rec.imageUrl}
                  alt={rec.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🧴
                </div>
              )}
            </div>

            {/* Perfume info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm truncate">{rec.name}</p>
                  <p className="text-xs text-slate-500">{rec.brand}</p>
                </div>
                <span className="text-xs bg-black text-white px-2 py-1 rounded-full flex-shrink-0">
                  #{index + 1}
                </span>
              </div>

              {/* Accords */}
              <div className="flex flex-wrap gap-1 mt-2">
                {rec.mainAccords.slice(0, 3).map((accord) => (
                  <span
                    key={accord}
                    className="text-xs px-2 py-0.5 bg-slate-100 rounded-full"
                  >
                    {accord}
                  </span>
                ))}
              </div>

              {/* Match reason */}
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {rec.matchReason}
              </p>

              {/* Score */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${rec.score}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{rec.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected outfits preview */}
      <div className="w-full mt-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Based on your picks</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {results.userTaste.selectedOutfits.map((outfit, index) => (
            <div
              key={index}
              className="w-16 h-20 relative rounded-lg overflow-hidden flex-shrink-0"
            >
              <Image
                src={outfit.imageUrl}
                alt={`${outfit.brand} selection`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* AI reasoning */}
      {results.scentProfile.reasoning && (
        <div className="w-full mt-6 p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">Why these scents?</p>
          <p className="text-sm text-slate-700">{results.scentProfile.reasoning}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full mt-8">
        <Button onClick={() => router.push('/quiz')}>
          Take quiz again
        </Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Back to home
        </Button>
      </div>
    </ScreenWrapper>
  );
}
