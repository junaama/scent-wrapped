'use client';

import { forwardRef } from 'react';

interface ScentShareData {
  styleLabel: string; // e.g. "avant garde classic"
  topAccords: string[]; // For the pentagram
  topPerfume: {
    name: string;
    brand: string;
    imageUrl: string;
    mainAccords: string[];
  };
}

interface ScentShareCardProps {
  data: ScentShareData;
  preloadedPerfumeImage?: string; // Base64 data URL for the perfume image
}

// Pentagram component for the shareable card (inline SVG version)
function ShareablePentagram({ accords }: { accords: string[] }) {
  const size = 320;
  const center = size / 2;
  const radius = 110;
  const labelRadius = radius + 28;

  // Angles matching the main PerfumePentagram component
  const POINT_ANGLES = [-54, 18, 90, 162, -126];

  // Create points from accords
  const points = accords.slice(0, 5).map((accord, index) => ({
    name: accord,
    value: 1 - index * 0.15,
  }));

  // Pad to 5 points if needed
  while (points.length < 5) {
    points.push({ name: '', value: 0.15 });
  }

  const getPoint = (angleDeg: number, r: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible' }}
    >
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      />

      {/* Center point */}
      <circle cx={center} cy={center} r="2" fill="white" />

      {/* Lines from center to each point */}
      {points.map((point, index) => {
        const angle = POINT_ANGLES[index];
        const endPoint = getPoint(angle, radius * point.value);

        return (
          <line
            key={`line-${index}`}
            x1={center}
            y1={center}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        );
      })}

      {/* Points on the circle edge */}
      {points.map((_, index) => {
        const angle = POINT_ANGLES[index];
        const circlePoint = getPoint(angle, radius);

        return (
          <circle
            key={`point-${index}`}
            cx={circlePoint.x}
            cy={circlePoint.y}
            r="3"
            fill="white"
          />
        );
      })}

      {/* Labels */}
      {points.map((point, index) => {
        if (!point.name) return null;

        const angle = POINT_ANGLES[index];
        const labelPoint = getPoint(angle, labelRadius);

        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        const normalizedAngle = ((angle % 360) + 360) % 360;
        if (normalizedAngle > 45 && normalizedAngle < 135) {
          textAnchor = 'start';
        } else if (normalizedAngle > 225 && normalizedAngle < 315) {
          textAnchor = 'end';
        }

        let rotation = angle;
        if (normalizedAngle > 90 && normalizedAngle < 270) {
          rotation += 180;
        }

        return (
          <text
            key={`label-${index}`}
            x={labelPoint.x}
            y={labelPoint.y}
            fill="white"
            fontSize="11"
            fontFamily="system-ui, sans-serif"
            fontWeight="400"
            letterSpacing="0.05em"
            textAnchor={textAnchor}
            dominantBaseline="middle"
            transform={`rotate(${rotation}, ${labelPoint.x}, ${labelPoint.y})`}
          >
            {point.name.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

export const ScentShareCard = forwardRef<HTMLDivElement, ScentShareCardProps>(
  ({ data, preloadedPerfumeImage }, ref) => {
    const { styleLabel, topAccords, topPerfume } = data;

    // Get first 3 accords for the "hints of" text
    const hints = topPerfume.mainAccords.slice(0, 3).join(', ').toLowerCase();

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          width: '390px',
          minHeight: '844px',
          backgroundColor: '#000',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <p
          style={{
            color: '#fff',
            fontSize: '28px',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          you are {styleLabel.toLowerCase()}
        </p>

        {/* Pentagram */}
        <div style={{ marginTop: '24px' }}>
          <ShareablePentagram accords={topAccords} />
        </div>

        {/* Tagline */}
        <p
          style={{
            color: '#fff',
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            textAlign: 'center',
            margin: '24px 0 0 0',
          }}
        >
          ...and you smell nice :)
        </p>

        {/* Perfume Image */}
        <div
          style={{
            width: '140px',
            height: '140px',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preloadedPerfumeImage || topPerfume.imageUrl}
            alt={topPerfume.name}
            crossOrigin="anonymous"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Perfume Name */}
        <p
          style={{
            color: '#fff',
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            textAlign: 'center',
            margin: '16px 0 0 0',
          }}
        >
          {topPerfume.name.toLowerCase()}
        </p>

        {/* Hints */}
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            textAlign: 'center',
            margin: '8px 0 0 0',
          }}
        >
          hints of: {hints}
        </p>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '36px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            let your taste find your next
            <br />
            signature scent
          </p>
          <p
            style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '8px 0 0 0',
            }}
          >
            scent.getstuff.city
          </p>
        </div>
      </div>
    );
  }
);

ScentShareCard.displayName = 'ScentShareCard';
