'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SwipeableScreen } from '@/components';
import { type WrappedResult } from '@/lib/compute-wrapped';

export default function ArtistPage() {
  const router = useRouter();
  const [data, setData] = useState<WrappedResult | null>(null);
  function isValidWrappedResult(data: any): data is WrappedResult {
    return (
      data &&
      typeof data === 'object' &&
      data.topArtist &&
      typeof data.topArtist.name === 'string' &&
      Array.isArray(data.colorPalette) &&
      typeof data.fashionLabel === 'string'
    );
  }
  useEffect(() => {
    // const stored = localStorage.getItem('wrappedData');
    // if (stored) {
    //   setData(JSON.parse(stored));
    try {
            const stored = localStorage.getItem('wrappedData');
            if (stored) {
              const parsed = JSON.parse(stored);
if (isValidWrappedResult(parsed)) {
  setData(parsed);
}
              // setData(JSON.parse(stored));
            }
          } catch (error) {
            console.error('Failed to load wrapped data:', error);
            // Optionally redirect to an error page or show error state
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
// Consider adding runtime validation after parsing the localStorage data to ensure all required properties exist with the expected types.


  return (
    <SwipeableScreen onSwipeUp={() => router.push('/wrapped/brands')} onSwipeDown={() => router.push('/wrapped/genres')} currentStep={2} totalSteps={5}>
      <div className="flex flex-col items-center justify-center text-center gap-10 animate-fade-in">
        <div className="flex flex-col gap-4">
          <p className=" text-2xl font-serif">Your color palette is</p>
          {/* <h1 className="text-4xl font-semibold font-serif">{data.topArtist.name}</h1> */}
        </div>

        <div className="flex flex-col gap-4 items-center">
          {/* <p className="text-gray-500">We think your color palette is</p> */}
          <div className="flex gap-2">
            {data.colorPalette.map((color) => (
              <div
                key={color}
                className="w-12 h-12 rounded-full border border-slate-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <p className="text-sm">You gravitate towards</p>
          {data.colorTags?.join(', ') || ''}
        </div>
      </div>
    </SwipeableScreen>
  );
}
