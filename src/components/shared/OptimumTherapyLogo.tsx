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
      <svg width="100%" height="100%" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
        {/* Background geometric pattern */}
        <defs>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ECDC4"/>
            <stop offset="100%" stopColor="#44A08D"/>
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="100%" stopColor="#FFA500"/>
          </linearGradient>
        </defs>
        
        {/* Background triangular elements */}
        <g opacity="0.1">
          <polygon points="320,20 340,40 320,60" fill="url(#goldGradient)"/>
          <polygon points="340,30 360,50 340,70" fill="url(#goldGradient)"/>
          <polygon points="360,10 380,30 360,50" fill="url(#goldGradient)"/>
        </g>
        
        {/* Main figure */}
        <g transform="translate(50, 25)">
          {/* Head */}
          <circle cx="40" cy="20" r="12" fill="url(#tealGradient)"/>
          
          {/* Body - dynamic pose */}
          <path d="M40 32 Q35 45 30 55 Q32 65 40 70 Q48 65 50 55 Q45 45 40 32 Z" fill="url(#tealGradient)"/>
          
          {/* Left arm - reaching forward */}
          <path d="M35 40 Q25 35 15 40 Q12 45 15 50 Q25 48 35 45 Z" fill="url(#tealGradient)"/>
          
          {/* Right arm - extended back */}
          <path d="M45 40 Q55 35 65 30 Q68 35 65 40 Q55 42 45 45 Z" fill="url(#tealGradient)"/>
          
          {/* Left leg - stepping forward */}
          <path d="M35 65 Q30 75 25 85 Q20 90 25 95 Q30 90 35 80 Q38 70 35 65 Z" fill="url(#tealGradient)"/>
          
          {/* Right leg - pushing off */}
          <path d="M45 65 Q50 75 55 80 Q60 85 65 80 Q62 75 55 70 Q48 68 45 65 Z" fill="url(#tealGradient)"/>
        </g>
        
        {/* Dynamic arrows */}
        <g fill="url(#goldGradient)">
          {/* Arrow 1 - upward motion */}
          <path d="M85 35 L95 25 L105 35 L100 35 L100 45 L90 45 L90 35 Z"/>
          
          {/* Arrow 2 - forward motion */}
          <path d="M110 50 L125 45 L125 40 L135 50 L125 60 L125 55 L110 60 Z"/>
          
          {/* Arrow 3 - diagonal upward */}
          <path d="M120 70 L130 60 L135 65 L140 60 L145 70 L135 75 L130 70 Z"/>
        </g>
        
        {/* Main text - OPTIMUM */}
        <text x="160" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="32" fontWeight="300" letterSpacing="3px" fill="#4ECDC4">OPTIMUM</text>
        
        {/* Main text - THERAPY */}
        <text x="160" y="85" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="32" fontWeight="300" letterSpacing="3px" fill="url(#goldGradient)">THERAPY</text>
        
        {/* Decorative lines */}
        <line x1="160" y1="95" x2="220" y2="95" stroke="url(#goldGradient)" strokeWidth="2"/>
        <line x1="280" y1="95" x2="340" y2="95" stroke="url(#goldGradient)" strokeWidth="2"/>
      </svg>
    </div>
  );
}
