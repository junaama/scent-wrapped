'use client';

interface PentagramPoint {
  name: string;
  value: number; // 0 to 1
}

interface PerfumePentagramProps {
  /** Array of 5 scent notes/accords to display on the pentagram */
  points: PentagramPoint[];
  className?: string;
}

// Angles in degrees from top (12 o'clock), going clockwise
// Positioned as a pentagon matching the Figma design
const POINT_ANGLES = [-54, 18, 90, 162, -126];

export function PerfumePentagram({ points, className = '' }: PerfumePentagramProps) {
  // Ensure we have exactly 5 points
  const pentagramPoints = points.slice(0, 5);
  while (pentagramPoints.length < 5) {
    pentagramPoints.push({ name: '', value: 0.15 });
  }

  const size = 280;
  const center = size / 2;
  const radius = 100;
  const labelRadius = radius + 30;

  // Convert angle to x,y coordinates
  const getPoint = (angleDeg: number, r: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180); // -90 to start from top
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
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
        {pentagramPoints.map((point, index) => {
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
        {pentagramPoints.map((point, index) => {
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
        {pentagramPoints.map((point, index) => {
          if (!point.name) return null;

          const angle = POINT_ANGLES[index];
          const labelPoint = getPoint(angle, labelRadius);

          // Calculate text anchor based on position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          const dy = '0.35em';

          // Adjust text positioning based on angle
          const normalizedAngle = ((angle % 360) + 360) % 360;
          if (normalizedAngle > 45 && normalizedAngle < 135) {
            textAnchor = 'start';
          } else if (normalizedAngle > 225 && normalizedAngle < 315) {
            textAnchor = 'end';
          }

          // Calculate rotation for the label to follow the circle tangent
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
              dy={dy}
              transform={`rotate(${rotation}, ${labelPoint.x}, ${labelPoint.y})`}
            >
              {point.name.toUpperCase()}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Helper function to create pentagram points from accords
 * Takes an array of accord names and generates points with calculated values
 */
export function createPentagramPoints(accords: string[]): PentagramPoint[] {
  const topAccords = accords.slice(0, 5);

  // Calculate values - first accord gets highest value, decreasing from there
  return topAccords.map((accord, index) => ({
    name: accord,
    value: 1 - index * 0.15, // 1.0, 0.85, 0.70, 0.55, 0.40
  }));
}
