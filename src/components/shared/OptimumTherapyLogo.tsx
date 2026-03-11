import React from 'react';
import logoImage from '../../assets/logo.png';

interface OptimumTherapyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimumTherapyLogo({ className = '', size = 'md' }: OptimumTherapyLogoProps) {
  const sizeMap = {
    sm: { height: 48 },
    md: { height: 70 },
    lg: { height: 72 }
  };

  return (
    <img
      src={logoImage}
      alt="Optimum Therapy"
      className={className}
      style={{ height: `${sizeMap[size].height}px`, width: 'auto', objectFit: 'contain', maxWidth: '100%' }}
    />
  );
}
