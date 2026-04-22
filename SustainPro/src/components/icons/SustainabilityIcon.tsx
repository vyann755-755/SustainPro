import React from 'react';

interface SustainabilityIconProps {
  className?: string;
}

export function SustainabilityIcon({ className = "h-8 w-8" }: SustainabilityIconProps) {
  return (
    <div className="sustainability-icon-container">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
      >
        {/* Central Earth/Core */}
        <circle 
          cx="16" 
          cy="16" 
          r="3" 
          fill="currentColor" 
          className="sustainability-core"
          opacity="0.9"
        />
        
        {/* Growing Leaves - Layer 1 */}
        <g className="sustainability-leaves-1">
          {/* Top Leaf */}
          <path 
            d="M16 8 C14 6, 18 6, 16 8 C16 8, 16 12, 16 12 Z" 
            fill="currentColor" 
            opacity="0.8"
          />
          
          {/* Right Leaf */}
          <path 
            d="M24 16 C26 14, 26 18, 24 16 C24 16, 20 16, 20 16 Z" 
            fill="currentColor" 
            opacity="0.8"
          />
          
          {/* Bottom Leaf */}
          <path 
            d="M16 24 C18 26, 14 26, 16 24 C16 24, 16 20, 16 20 Z" 
            fill="currentColor" 
            opacity="0.8"
          />
          
          {/* Left Leaf */}
          <path 
            d="M8 16 C6 18, 6 14, 8 16 C8 16, 12 16, 12 16 Z" 
            fill="currentColor" 
            opacity="0.8"
          />
        </g>
        
        {/* Growing Leaves - Layer 2 (Smaller, offset) */}
        <g className="sustainability-leaves-2">
          {/* Top-Right */}
          <path 
            d="M20 12 C19 10, 21 10, 20 12 C20 12, 18 14, 18 14 Z" 
            fill="currentColor" 
            opacity="0.6"
          />
          
          {/* Bottom-Right */}
          <path 
            d="M20 20 C21 22, 19 22, 20 20 C20 20, 18 18, 18 18 Z" 
            fill="currentColor" 
            opacity="0.6"
          />
          
          {/* Bottom-Left */}
          <path 
            d="M12 20 C13 22, 11 22, 12 20 C12 20, 14 18, 14 18 Z" 
            fill="currentColor" 
            opacity="0.6"
          />
          
          {/* Top-Left */}
          <path 
            d="M12 12 C11 10, 13 10, 12 12 C12 12, 14 14, 14 14 Z" 
            fill="currentColor" 
            opacity="0.6"
          />
        </g>
        
        {/* Floating Energy Particles */}
        <g className="sustainability-particles">
          <circle cx="10" cy="6" r="0.8" fill="currentColor" opacity="0.7" />
          <circle cx="26" cy="10" r="0.6" fill="currentColor" opacity="0.5" />
          <circle cx="26" cy="22" r="0.8" fill="currentColor" opacity="0.7" />
          <circle cx="10" cy="26" r="0.6" fill="currentColor" opacity="0.5" />
          <circle cx="6" cy="6" r="0.5" fill="currentColor" opacity="0.4" />
          <circle cx="26" cy="6" r="0.5" fill="currentColor" opacity="0.4" />
        </g>
        
        {/* Growth Rings */}
        <g className="sustainability-rings">
          <circle 
            cx="16" 
            cy="16" 
            r="8" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.3"
          />
          <circle 
            cx="16" 
            cy="16" 
            r="12" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.3" 
            opacity="0.2"
          />
        </g>
      </svg>
    </div>
  );
}