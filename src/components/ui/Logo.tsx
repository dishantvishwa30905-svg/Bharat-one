'use client';
import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'white';
  className?: string;
}

export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  const textColor = variant === 'white' ? '#FFFFFF' : '#0D1B3D';
  const taglineColor = variant === 'white' ? '#D1D5DB' : '#6B7280';
  const taglineHighlight = variant === 'white' ? '#4ADE80' : '#138808';

  const icon = (
    <svg viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
      {/* Saffron top bump */}
      <path d="M 22 8 C 55 8 70 22 65 42 C 61 56 46 58 38 58 L 22 58 Z" fill="#FF8C00"/>
      {/* Green bottom bump */}
      <path d="M 22 58 C 50 58 66 62 70 78 C 75 96 52 104 22 104 L 14 104 C 6 82 4 36 22 8 Z" fill="#138808"/>
      {/* White cutout top */}
      <path d="M 27 18 L 40 18 C 48 18 53 22 51 30 C 49 38 40 40 32 40 L 27 40 Z" fill="white"/>
      {/* White cutout bottom */}
      <path d="M 27 68 L 44 68 C 52 68 57 73 55 84 C 53 92 42 96 27 96 Z" fill="white"/>
      {/* Ashoka Chakra */}
      <g transform="translate(42 82)">
        <circle r="11" fill="none" stroke="#000088" strokeWidth="1.5"/>
        <circle r="2" fill="#000088"/>
        <line x1="0" y1="-11" x2="0" y2="11" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-11" y1="0" x2="11" y2="0" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-7.78" y1="-7.78" x2="7.78" y2="7.78" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-7.78" y1="7.78" x2="7.78" y2="-7.78" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-4.16" y1="-10.2" x2="4.16" y2="10.2" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-10.2" y1="-4.16" x2="10.2" y2="4.16" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-10.2" y1="4.16" x2="10.2" y2="-4.16" stroke="#000088" strokeWidth="0.6"/>
        <line x1="-4.16" y1="10.2" x2="4.16" y2="-10.2" stroke="#000088" strokeWidth="0.6"/>
      </g>
    </svg>
  );

  if (variant === 'compact') {
    return <div className={`flex items-center h-10 ${className}`}>{icon}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-10 flex-shrink-0">{icon}</div>
      <div>
        <div className="font-jakarta font-900 text-xl leading-none tracking-wide" style={{ color: textColor, fontWeight: 900 }}>
          BHARAT ONE
        </div>
        <div className="text-[10px] font-medium leading-none mt-0.5" style={{ color: taglineColor }}>
          One Platform. Every Scheme.{' '}
          <span style={{ color: taglineHighlight }}>Your Benefits.</span>
        </div>
      </div>
    </div>
  );
}
