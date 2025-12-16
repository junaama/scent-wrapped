'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SwipeableScreen } from '@/components';
import { type WrappedResult } from '@/lib/compute-wrapped';

export default function AgePage() {
  const router = useRouter();
  const [data, setData] = useState<WrappedResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('wrappedData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.styleAge?.label && parsed?.styleAge?.description && parsed?.styleAge?.decade) {
          setData(parsed);
        } else {
          console.error('Invalid data structure in localStorage');
          router.push('/wrapped');
        }
      } catch (error) {
        console.error('Failed to parse wrappedData:', error);
        router.push('/wrapped');
      }
    } else {
      router.push('/wrapped');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <SwipeableScreen onSwipeUp={() => router.push('/wrapped/outfits')} onSwipeDown={() => router.push('/wrapped/brands')} currentStep={4} totalSteps={5}>
      <div className="flex flex-col items-center justify-center text-center gap-8 animate-fade-in">
        <p className="font-serif text-2xl">this is your style age</p>

        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-serif">

            {data.styleAge.age || '50'}

          </h1>

        </div>
        <p className="text-sm">
          {data.topFiveArtists && `your taste spans across ${data.topFiveArtists[1]?.name} and ${data.topFiveArtists[3]?.name}`}
        </p>

        <div className="flex items-center gap-2 text-sm">
          {data.styleAge.description}
        </div>
      </div>
    </SwipeableScreen>
  );
}
