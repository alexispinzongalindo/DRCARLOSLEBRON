import React from 'react';

interface OptimumTherapyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimumTherapyLogo({ className = '', size = 'md' }: OptimumTherapyLogoProps) {
  const sizeClasses = {
    sm: 'h-16 w-48',
    md: 'h-20 w-60', 
    lg: 'h-24 w-72'
  };

  return (
    <img 
      src="/optimum-therapy-logo-final.png" 
      alt="Optimum Therapy" 
      className={`${sizeClasses[size]} ${className}`}
      style={{ objectFit: 'contain' }}
      onError={(e) => {
        console.error('Logo failed to load:', e);
        // Fallback to original logo
        (e.target as HTMLImageElement).src = '/optimum-therapy-logo.png';
      }}
    />
  );
}
