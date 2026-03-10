import React from 'react';

interface OptimumTherapyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimumTherapyLogo({ className = '', size = 'md' }: OptimumTherapyLogoProps) {
  const sizeClasses = {
    sm: 'w-48 h-20',
    md: 'w-64 h-24',
    lg: 'w-80 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
        {/* Stylized figure in motion */}
        <g transform="translate(20, 20)">
          {/* Head */}
          <circle cx="25" cy="15" r="8" fill="#4A90E2"/>
          
          {/* Body */}
          <path d="M25 23 L25 45 L30 50 L35 45 L30 40 L25 45" fill="#4A90E2"/>
          
          {/* Arms */}
          <path d="M25 30 L15 25 L10 30 L15 35 L25 30" fill="#F39C12"/>
          <path d="M25 30 L35 35 L40 30 L35 25 L25 30" fill="#F39C12"/>
          
          {/* Legs */}
          <path d="M25 45 L20 60 L15 65 L20 70 L25 65" fill="#4A90E2"/>
          <path d="M25 45 L30 60 L35 55 L30 50 L25 55" fill="#4A90E2"/>
          
          {/* Motion lines */}
          <path d="M5 20 L15 18 M5 25 L15 23 M5 30 L15 28" stroke="#F39C12" strokeWidth="2" fill="none"/>
        </g>
        
        {/* Main text */}
        <text x="80" y="35" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#4A90E2">OPTIMUM</text>
        <text x="80" y="60" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#F39C12">THERAPY</text>
        
        {/* Tagline */}
        <text x="80" y="80" fontFamily="Arial, sans-serif" fontSize="10" fill="#666">TERAPIA FISICA • BIENESTAR</text>
      </svg>
    </div>
  );
}
