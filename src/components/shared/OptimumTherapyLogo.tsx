import React from 'react';

interface OptimumTherapyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimumTherapyLogo({ className = '', size = 'md' }: OptimumTherapyLogoProps) {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16', 
    lg: 'h-20'
  };

  return (
    <img 
      src="/optimum-therapy-logo.png" 
      alt="Optimum Therapy" 
      className={`${sizeClasses[size]} w-auto ${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
}
