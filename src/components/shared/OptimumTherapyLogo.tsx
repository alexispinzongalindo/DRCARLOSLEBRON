import React from 'react';

interface OptimumTherapyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimumTherapyLogo({ className = '', size = 'md' }: OptimumTherapyLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl font-bold',
    md: 'text-3xl font-bold', 
    lg: 'text-4xl font-bold'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center space-x-3 bg-red-100 p-2 border-2 border-red-500`} style={{ minWidth: '200px', minHeight: '40px' }}>
      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
        <div className="w-5 h-5 bg-white rounded-full"></div>
      </div>
      <span className="text-teal-600 font-black">OPTIMUM</span>
      <span className="text-yellow-500 font-black">THERAPY</span>
    </div>
  );
}
