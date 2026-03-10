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
      <svg width="100%" height="100%" viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg">
        {/* Exact recreation of the provided logo */}
        
        {/* Background triangular pattern - light geometric elements */}
        <g opacity="0.08" fill="#FFB800">
          <polygon points="420,30 440,50 420,70"/>
          <polygon points="440,40 460,60 440,80"/>
          <polygon points="460,20 480,40 460,60"/>
          <polygon points="480,50 500,70 480,90"/>
          <polygon points="500,30 520,50 500,70"/>
          <polygon points="440,80 460,100 440,120"/>
          <polygon points="460,90 480,110 460,130"/>
          <polygon points="480,70 500,90 480,110"/>
        </g>
        
        {/* Main figure - exact teal color and pose from image */}
        <g transform="translate(80, 40)">
          {/* Head */}
          <circle cx="50" cy="25" r="15" fill="#4ECDC4"/>
          
          {/* Torso */}
          <ellipse cx="50" cy="55" rx="18" ry="25" fill="#4ECDC4"/>
          
          {/* Left arm - extended forward */}
          <ellipse cx="25" cy="45" rx="8" ry="20" fill="#4ECDC4" transform="rotate(-30 25 45)"/>
          
          {/* Right arm - extended back */}
          <ellipse cx="75" cy="40" rx="8" ry="18" fill="#4ECDC4" transform="rotate(45 75 40)"/>
          
          {/* Left leg - stepping forward */}
          <ellipse cx="40" cy="90" rx="10" ry="25" fill="#4ECDC4" transform="rotate(-15 40 90)"/>
          
          {/* Right leg - pushing back */}
          <ellipse cx="65" cy="95" rx="10" ry="22" fill="#4ECDC4" transform="rotate(25 65 95)"/>
        </g>
        
        {/* Golden arrows - exact positioning and style from image */}
        <g fill="#FFB800">
          {/* Upper right arrow */}
          <path d="M180 45 L195 30 L210 45 L205 45 L205 60 L190 60 L190 45 Z"/>
          
          {/* Middle right arrow */}
          <path d="M200 70 L220 65 L220 60 L235 75 L220 90 L220 85 L200 80 Z"/>
          
          {/* Lower arrow */}
          <path d="M185 100 L200 85 L215 100 L210 100 L210 115 L195 115 L195 100 Z"/>
        </g>
        
        {/* OPTIMUM text - exact font and spacing */}
        <text x="280" y="80" fontFamily="'Helvetica Neue', 'Arial', sans-serif" fontSize="42" fontWeight="300" letterSpacing="4px" fill="#4ECDC4">OPTIMUM</text>
        
        {/* THERAPY text - exact font and spacing */}
        <text x="280" y="125" fontFamily="'Helvetica Neue', 'Arial', sans-serif" fontSize="42" fontWeight="300" letterSpacing="4px" fill="#FFB800">THERAPY</text>
        
        {/* Decorative horizontal lines */}
        <line x1="280" y1="140" x2="350" y2="140" stroke="#FFB800" strokeWidth="2"/>
        <line x1="470" y1="140" x2="540" y2="140" stroke="#FFB800" strokeWidth="2"/>
      </svg>
    </div>
  );
}
