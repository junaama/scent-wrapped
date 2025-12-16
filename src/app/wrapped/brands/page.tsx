'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SwipeableScreen } from '@/components';
import { type WrappedResult } from '@/lib/compute-wrapped';

// Helper function to determine if a color is light or dark
function isLightColor(hex: string): boolean {
  // Remove # if present
  const color = hex.replace('#', '');
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export default function BrandsPage() {
  const router = useRouter();
  const [data, setData] = useState<WrappedResult | null>(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wrappedData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.topBrands)) {
          setData(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load wrapped data:', error);
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const handleCardClick = (index: number) => {
    setExpandedIndex(index);
  };

  const brands = data.topBrands;
  const colorPalette = data.colorPalette || ['#1a1a1a', '#6b6b6b', '#9e9e9e', '#d4d4d4'];

  return (
    <SwipeableScreen onSwipeUp={() => router.push('/wrapped/age')} onSwipeDown={() => router.push('/wrapped/artist')} currentStep={3} totalSteps={5}>
      <div className="flex flex-col gap-4 animate-fade-in">
        <h1 className="text-2xl font-serif text-center mb-2">here are your top brands</h1>

        <div className="flex flex-col gap-2">
          {brands.map((brand, index) => {
            const isExpanded = index === expandedIndex;
            // Cycle through color palette if there are more brands than colors
            const colorIndex = index % colorPalette.length;
            const backgroundColor = colorPalette[colorIndex];
            const textColor = isLightColor(backgroundColor) ? 'text-black' : 'text-white';

            return (
              <div
                key={brand.name}
                className="rounded-xl overflow-hidden transition-all duration-500 ease-out"
                style={{ backgroundColor, borderColor: backgroundColor }}
              >
                {/* Collapsed header - always visible */}
                <button
                  onClick={() => handleCardClick(index)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-all duration-300 ${textColor}`}
                >
                  <span className="text-xl font-serif font-medium text-black">
                    {index + 1}. {brand.name.toLowerCase()}
                  </span>
                </button>

                {/* Expandable image section */}
                <div
                  className={`transition-all duration-500 ease-out overflow-hidden ${
                    isExpanded ? ' ' : 'max-h-0 '
                  }`}
                >
                  <div className="relative w-full aspect-4/5">
                    <Image
                      src={brand.imageUrl}
                      alt={brand.name}
                      fill
                      className={`object-cover transition-all duration-700 ${
                        isExpanded ? 'scale-100 ' : 'scale-105 '
                      }`}
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    {/* Brand reason */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-500 delay-100 ${
                        isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}
                    >
                      <p className="text-sm opacity-80">

                        {brand.reason.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {brands.length === 0 && (
          <p className="text-slate-500 text-center">
            Your eclectic taste spans many brands!
          </p>
        )}
      </div>
    </SwipeableScreen>
  );
}
