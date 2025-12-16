'use client';

import { forwardRef } from 'react';
import type { WrappedResult } from '@/lib/compute-wrapped';

interface ShareableCardProps {
  data: WrappedResult;
  preloadedImages?: string[]; // Base64 data URLs for the outfit images
}

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ data, preloadedImages }, ref) => {
    const outfits = data.topOutfits || [];
    const topTwoOutfits = outfits.slice(0, 2);

    // Get top 5 styles from fashionKeywords
    const topStyles = Object.entries(data.fashionKeywords || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([style]) => style.charAt(0).toUpperCase() + style.slice(1));

    // Get top 5 brands
    const topBrands = data.topBrands?.slice(0, 5) || [];

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        className="w-[390px] min-h-[844px] bg-white py-10 px-6 flex flex-col gap-6"
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }} >You are</p>
          <h1
            style={{
              color: '#000',
              margin: '4px 0 0 0',
              fontFamily: 'Georgia, serif',
            }}
            className="text-3xl"
          >
            {data.fashionLabel}
          </h1>
        </div>

        {/* Two outfit images side by side */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {topTwoOutfits.map((outfit, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                aspectRatio: '3/4',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f0f0f0',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preloadedImages?.[index] || outfit.imageUrl}
                alt={outfit.brand}
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Brand label overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: '24px 12px 12px',
                }}
              >
                <p
                  style={{
                    color: '#fff',
                    fontSize: '12px',
                    margin: 0,
                    textTransform: 'lowercase',
                  }}
                >
                  {index + 1} {outfit.brand.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Styles and Top Brands side by side */}
        <div className="flex gap-8">
          {/* Top Styles */}
          <div className="flex-1">
            <p
              className="font-serif text-sm pb-3"
            >
              Top Styles
            </p>
            <div 
            className="flex flex-col gap-1">
              {topStyles.map((style, index) => (
                <p
                  key={index}
                  className="font-bold"
                >
                  {index + 1} {style.toLowerCase()}
                </p>
              ))}
            </div>
          </div>

          {/* Top Brands */}
          <div style={{ flex: 1 }}>
            <p
              className="font-serif text-sm pb-3"
            >
              Top Brands
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {topBrands.map((brand, index) => (
                <p
                  key={index}
                  
                  className="text-base font-bold"
                >
                  {index + 1} {brand.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Total styles and Color palette */}
        <div 
        className="flex gap-8 mt-2"
        >
          {/* Total styles */}
          <div className="flex-1">
            <p
              className="text-sm font-serif pb-4"
            >
              Total styles
            </p>
            <p
              className="text-3xl font-bold"
            >
              {data.styleCount || Object.keys(data.fashionKeywords || {}).length}
            </p>
          </div>

          {/* Color palette */}
          <div  className="flex-1">
            <p
              className="font-serif text-sm pb-4"
            >
              Color palette
            </p>
            <div className="flex">
              {(data.colorPalette || ['#C41E3A', '#228B22', '#9e9e9e', '#4169E1'])
                .slice(0, 4)
                .map((color, index) => (
                  <div
                    key={index}
                    className={`size-10 rounded-full`}
                    style={{
                      backgroundColor: color,
                      marginLeft: index > 0 ? '-10px' : '0',
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-auto text-center pt-6"
        >
          <p
            className="text-sm pb-1 font-serif"
          >
            get fitted from your music taste
          </p>
          <p
            className="font-bold text-base"
          >
            https://dripify.getstuff.city
          </p>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = 'ShareableCard';
