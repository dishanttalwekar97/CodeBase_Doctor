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
    const step = Math.ceil(score / 30);
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [score]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#EF4444'; // Red for F
  let grade = 'F';
  let glowColor = 'rgba(239, 68, 68, 0.4)';

  if (score >= 90) {
    color = '#10B981'; // Emerald
    grade = 'A+';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (score >= 80) {
    color = '#22D3EE'; // Cyan
    grade = 'A';
    glowColor = 'rgba(34, 211, 238, 0.4)';
  } else if (score >= 70) {
    color = '#818CF8'; // Indigo
    grade = 'B';
    glowColor = 'rgba(129, 140, 248, 0.4)';
  } else if (score >= 50) {
    color = '#F59E0B'; // Amber
    grade = 'C';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Radial Gauge Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`
          }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-extrabold font-mono text-white tracking-tight leading-none"
        >
          {displayScore}
        </motion.span>
        <span className="text-[11px] font-mono text-gray-400 mt-1 uppercase tracking-wider">Health Score</span>

        {/* Grade Badge */}
        <span
          className="mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm"
          style={{
            color: color,
            borderColor: color,
            backgroundColor: `${color}15`
          }}
        >
          Grade {grade}
        </span>
      </div>
    </div>
  );
};
