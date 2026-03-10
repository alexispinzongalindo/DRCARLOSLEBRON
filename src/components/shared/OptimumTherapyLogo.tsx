import React from 'react';

interface OptimumTherapyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimumTherapyLogo({ className = '', size = 'md' }: OptimumTherapyLogoProps) {
  const sizeClasses = {
    sm: 'text-xl font-bold',
    md: 'text-2xl font-bold', 
    lg: 'text-3xl font-bold'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center space-x-2`}>
      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-full"></div>
      </div>
      <span className="text-teal-600">OPTIMUM</span>
      <span className="text-yellow-500">THERAPY</span>
    </div>
  );
}
