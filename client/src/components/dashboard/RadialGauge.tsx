import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RadialGaugeProps {
  score: number;
  size?: number;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({ score, size = 180 }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(score / 35));
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [score]);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#EF4444'; // Red for F
  let grade = 'F';
  let glowColor = 'rgba(239, 68, 68, 0.5)';
  let gradientId = 'gaugeRed';

  if (score >= 90) {
    color = '#10B981'; // Emerald
    grade = 'A+';
    glowColor = 'rgba(16, 185, 129, 0.5)';
    gradientId = 'gaugeEmerald';
  } else if (score >= 80) {
    color = '#22D3EE'; // Cyan
    grade = 'A';
    glowColor = 'rgba(34, 211, 238, 0.5)';
    gradientId = 'gaugeCyan';
  } else if (score >= 70) {
    color = '#818CF8'; // Indigo
    grade = 'B';
    glowColor = 'rgba(129, 140, 248, 0.5)';
    gradientId = 'gaugeIndigo';
  } else if (score >= 50) {
    color = '#F59E0B'; // Amber
    grade = 'C';
    glowColor = 'rgba(245, 158, 11, 0.5)';
    gradientId = 'gaugeAmber';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer Rotating Subtle Ambient Aura Ring */}
      <div
        className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-spin-slow"
        style={{ margin: -6 }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gaugeEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gaugeCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="gaugeIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="gaugeAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="gaugeRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>

        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Inner Accent Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth}
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth={1}
          fill="transparent"
        />

        {/* Animated Radial Gauge Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 12px ${glowColor})`
          }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-extrabold font-mono text-white tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
        >
          {displayScore}
        </motion.span>
        <span className="text-[11px] font-mono text-gray-400 mt-1 uppercase tracking-widest font-medium">Health Score</span>

        {/* Grade Badge */}
        <span
          className="mt-2 text-[10px] font-mono font-extrabold px-3 py-0.5 rounded-full border shadow-[0_0_12px_rgba(0,0,0,0.5)] tracking-wider"
          style={{
            color: color,
            borderColor: `${color}60`,
            backgroundColor: `${color}18`
          }}
        >
          Grade {grade}
        </span>
      </div>
    </div>
  );
};
