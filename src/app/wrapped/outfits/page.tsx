'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SwipeableScreen, Button, ShareableCard } from '@/components';
import { type WrappedResult } from '@/lib/compute-wrapped';
import Image from 'next/image';
import { toPng } from 'html-to-image';

export default function OutfitsPage() {
  const router = useRouter();
  const [data, setData] = useState<WrappedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSwipeDown = () => {
    router.push('/wrapped/brands');
  };

  // Fetch images via proxy to convert to base64 (avoids CORS issues with html-to-image)
  const preloadImages = async (outfits: { imageUrl: string }[]) => {
    const topTwo = outfits.slice(0, 2);
    const promises = topTwo.map(async (outfit) => {
      try {
        const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(outfit.imageUrl)}`);
        if (!res.ok) return outfit.imageUrl; // fallback to original
        const { dataUrl } = await res.json();
        return dataUrl;
      } catch {
        return outfit.imageUrl; // fallback to original
      }
    });
    return Promise.all(promises);
  };

  useEffect(() => {
    const stored = localStorage.getItem('wrappedData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        // Pre-fetch images for the shareable card
        if (parsed.topOutfits?.length) {
          preloadImages(parsed.topOutfits).then(setPreloadedImages);
        }
      } catch (error) {
        console.error('Failed to parse wrapped data:', error);
        localStorage.removeItem('wrappedData');
      }
    }
  }, []);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Failed to generate image:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dripify-${data?.fashionLabel?.toLowerCase().replace(/\s+/g, '-') || 'wrapped'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        // Fallback to text share if image generation fails
        if (navigator.share) {
          await navigator.share({
            title: 'My 2025 Dripify',
            text: `I'm ${data?.fashionLabel}! Get your 2025 fits based on my music taste!`,
            url: 'https://dripify.getstuff.city'
          });
        }
        return;
      }

      const file = new File([blob], 'dripify-wrapped.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My 2025 Dripify',
          text: `I'm ${data?.fashionLabel}! Get fitted from your music taste at dripify.getstuff.city`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        await handleDownload();
      }
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    // localStorage.clear();
    localStorage.removeItem('wrappedData')
    window.location.href = '/';
  };

  if (!data) {
    return (
      <SwipeableScreen onSwipeDown={handleSwipeDown} currentStep={5} totalSteps={5} className="flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </SwipeableScreen>
    );
  }

  const outfits = data.topOutfits || []

  return (
    <SwipeableScreen onSwipeDown={handleSwipeDown} currentStep={5} totalSteps={5} className="flex flex-col items-center gap-8 py-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-serif pb-2">You are {data.fashionLabel}</h1>
        
      </div>

      <div className="grid gap-3 w-full">
        {outfits.map((outfit) => (
            <div className="w-full relative aspect-3/4 bg-slate-100 rounded-lg overflow-hidden">
            <Image
              src={outfit.imageUrl}
              alt={`${outfit.brand} - ${outfit.season}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
         
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4">
              <p className="text-white font-medium">{outfit.brand}</p>
              <p className="text-white/70 text-sm">{outfit.season}</p>
             
            </div>
          </div>
        ))}
      </div>


      {/* Why these outfits */}
      <div className="w-full p-4 bg-slate-50 rounded-lg mt-4">
        <p className="text-sm text-slate-600 mb-2">Why these outfits?</p>
        <p className="text-xs text-slate-500">
          Based on your top tracks ({data.genres.slice(0, 3).join(', ') || 'N/A'}),
          we matched you with runway looks featuring: {' '}
          {outfits[0]?.matchedKeywords.slice(0, 4).join(', ') || 'N/A'} looks.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full pt-4">
        <Button variant="primary" onClick={handleShare} className="w-full" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Share story'}
        </Button>
        <Button variant="outline" onClick={handleDownload} className="w-full" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Download image'}
        </Button>
        <Button variant="outline" onClick={handleRestart} className="w-full">
          Start over
        </Button>
      </div>

      {/* Hidden shareable card for image generation */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
        }}
        aria-hidden="true"
      >
        <ShareableCard ref={cardRef} data={data} preloadedImages={preloadedImages} />
      </div>
    </SwipeableScreen>
  );
}
