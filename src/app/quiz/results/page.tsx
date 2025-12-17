'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { ScreenWrapper, Button, PerfumePentagram, createPentagramPoints, ScentShareCard } from '@/components';

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
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

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

  const getStyleLabel = () => {
    if (!results) return '';
    const topStyle = getTopStyle(results.scentProfile.style);
    const topTags = results.userTaste.topTags.slice(0, 2);
    return `${topTags.join(' ')} ${topStyle}`;
  };

  const handleShare = async () => {
    if (!shareCardRef.current || !results) return;

    setIsSharing(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      // Try native share if available
      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'scent-wrapped.png', { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Scent Profile',
            text: 'Check out my signature scent from Scent Wrapped!',
          });
        } else {
          // Fallback to download
          downloadImage(dataUrl);
        }
      } else {
        // Fallback to download
        downloadImage(dataUrl);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = 'scent-wrapped.png';
    link.href = dataUrl;
    link.click();
  };

  const validateEmail = async (emailToValidate: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/email/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToValidate }),
      });
      const data = await res.json();
      if (!data.valid) {
        setEmailError(data.error || 'Invalid email address');
        return false;
      }
      return true;
    } catch {
      setEmailError('Failed to validate email');
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !results) return;

    setEmailError(null);
    setIsValidatingEmail(true);

    // Validate email first
    const isValid = await validateEmail(email.trim());
    setIsValidatingEmail(false);

    if (!isValid) return;

    // Submit email and send results
    setIsSubmittingEmail(true);
    try {
      const res = await fetch('/api/email/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          styleLabel: getStyleLabel(),
          scentProfile: results.scentProfile,
          recommendations: results.recommendations,
          selectedOutfits: results.userTaste.selectedOutfits,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setEmailError(data.error || 'Failed to submit email');
        return;
      }

      // Unlock full results
      setIsUnlocked(true);
    } catch {
      setEmailError('Failed to submit email. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
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
      {/* <p className="text-sm text-slate-500 mb-2">your scent profile</p> */}
      <h1 className="font-serif text-3xl text-center mb-6">
        you are
        <br />

        {getStyleLabel()}
      </h1>

      {/* Scent Profile Summary */}
      {/* <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4">
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
      </div> */}

      {/* Scent Pentagram */}
      <div className="bg-black rounded-full p-6 mb-8">

        <PerfumePentagram points={createPentagramPoints(results.scentProfile.accords)} />
      </div>
      <div className="flex flex-col items-center gap-2">


        <div className="size-48 relative flex overflow-hidden ">

          <Image
            src={results.recommendations[0].imageUrl}
            alt={results.recommendations[0].name}
            fill
            className="object-cover"
            sizes="100px"
          /> </div>
          <p className="font-medium text-xl">{results.recommendations[0].name}</p>
          <p className="text-sm ">By {results.recommendations[0].brand}</p>
          <p>hints of:    {results.recommendations[0].mainAccords.slice(0, 3).map((accord, idx) => (
            <span
              key={accord}
              className="lowercase "
            >
              {idx > 0 && ', '}{accord}
            </span>
          ))}</p>

       
      </div>
      {/* Email Gate or Full Recommendations */}
      {!isUnlocked ? (
        /* Email Collection Form */
        <div className="w-full mt-8 py-6 ">
          <p className="text-xl font-serif text-center mb-2">
            Want to see {results.recommendations.slice(1).length} more matches?
          </p>
          <p className="text-sm text-slate-500 text-center mb-6">
            Enter your email to unlock your full results
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-full border border-slate-300 focus:border-black focus:outline-none text-center"
                disabled={isValidatingEmail || isSubmittingEmail}
              />
              {emailError && (
                <p className="text-sm text-red-500 text-center mt-2">{emailError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!email.trim() || isValidatingEmail || isSubmittingEmail}
              className="w-full"
            >
              {isValidatingEmail ? 'Checking...' : isSubmittingEmail ? 'Unlocking...' : 'Unlock full results'}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            We&apos;ll email your results and you&apos;ll be first to know of future apps we create :)
          </p>
        </div>
      ) : (
        /* Full Results - Unlocked */
        <>
          {/* Scent Profile Summary */}
          {/* <div className="w-full p-4 mt-8 mb-4">
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
          </div> */}

          {/* Recommendations */}
          <p className="text-2xl lowercase tracking-wider font-serif my-6">
            Here&apos;s {results.recommendations.slice(1).length} others for you
          </p>

          <div className="w-full space-y-4  grid grid-cols-2">
            {results.recommendations.slice(1).map((rec, index) => (
              <div
                key={rec.name}
                className="flex gap-4 p-4"
              >
                {/* Perfume image */}
                <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-white flex-shrink-0">
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
                      <p className="font-medium text-sm text-wrap">{rec.name}</p>
                      <p className="text-xs text-slate-500">{rec.brand}</p>
                    </div>
                    {/* <span className="text-xs bg-black text-white px-2 py-1 rounded-full flex-shrink-0">
                      #{index + 2}
                    </span> */}
                  </div>

                  {/* Accords */}
                  {/* <div className="flex flex-wrap gap-1 mt-2">
                    {rec.mainAccords.slice(0, 3).map((accord) => (
                      <span
                        key={accord}
                        className="text-xs px-2 py-0.5 bg-white rounded-full"
                      >
                        {accord}
                      </span>
                    ))}
                  </div> */}

                  {/* Match reason */}
                  {/* {rec.matchReason && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
                      &quot;{rec.matchReason}&quot;
                    </p>
                  )} */}

                  {/* Score */}
                  {/* <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${rec.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{rec.score}%</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {/* Selected outfits preview */}
          {/* {results.userTaste.selectedOutfits.length > 0 && (
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
          )} */}

          {/* AI reasoning */}
          {/* {results.scentProfile.reasoning && (
            <div className="w-full mt-6 p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs text-slate-500 mb-1">Why these scents?</p>
              <p className="text-sm text-slate-700">{results.scentProfile.reasoning}</p>
            </div>
          )} */}
        </>
      )}

      {/* Actions - Share button only after unlock */}
      <div className="flex flex-col gap-3 w-full mt-8">
        <Button onClick={handleShare} disabled={isSharing} variant="outline">
          {isSharing ? 'Creating image...' : 'Share with my friends'}
        </Button>
      </div>

      {/* Hidden Shareable Card for image generation */}
      <div className="fixed -left-[9999px] top-0">
        <ScentShareCard
          ref={shareCardRef}
          data={{
            styleLabel: getStyleLabel(),
            topAccords: results.scentProfile.accords,
            topPerfume: results.recommendations[0],
          }}
        />
      </div>
    </ScreenWrapper>
  );
}
