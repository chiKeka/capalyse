import React from "react";

interface CircularScoreBarProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

const CircularScoreBar: React.FC<CircularScoreBarProps> = ({
  value,
  size = 80,
  strokeWidth = 12,
  className = "",
  showPercentage = true,
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  return (
    <div
      className={`relative w-auto h-auto inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 h-${size} w-${size}`}
        style={{ width: size, height: size }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAF7F3"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#047857"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold ,g:text-4xl md:text-3xl text-2xl xl:text-5xl  text-[#282828]">
            {Math.round(normalizedValue)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularScoreBar;
