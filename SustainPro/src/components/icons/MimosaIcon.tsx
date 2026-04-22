import React from 'react';

interface MimosaIconProps {
  className?: string;
}

export function MimosaIcon({ className = "h-4 w-4" }: MimosaIconProps) {
  return (
    <div className="mimosa-container">
      
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Main central rachis (stem) - always visible */}
        <path d="M12 3v18" strokeWidth="1.5" />
        
        {/* Primary pinnae (main branches) - Left side */}
        <g className="mimosa-left">
          <path d="M12 5l-6 2" strokeWidth="1.2" />
          <path d="M12 7l-7 2.5" strokeWidth="1.2" />
          <path d="M12 9l-8 3" strokeWidth="1.2" />
          <path d="M12 11l-8 3" strokeWidth="1.2" />
          <path d="M12 13l-7 2.5" strokeWidth="1.2" />
          <path d="M12 15l-6 2" strokeWidth="1.2" />
          <path d="M12 17l-4 1.5" strokeWidth="1.2" />
        </g>
        
        {/* Primary pinnae (main branches) - Right side */}
        <g className="mimosa-right">
          <path d="M12 5l6 2" strokeWidth="1.2" />
          <path d="M12 7l7 2.5" strokeWidth="1.2" />
          <path d="M12 9l8 3" strokeWidth="1.2" />
          <path d="M12 11l8 3" strokeWidth="1.2" />
          <path d="M12 13l7 2.5" strokeWidth="1.2" />
          <path d="M12 15l6 2" strokeWidth="1.2" />
          <path d="M12 17l4 1.5" strokeWidth="1.2" />
        </g>
        
        {/* Tiny leaflets along left branches - creating feathery texture */}
        <g className="mimosa-leaflets" strokeWidth="0.8" opacity="0.8">
          {/* Top left branch leaflets */}
          <path d="M10 6l-0.8 0.4" />
          <path d="M9 6.3l-0.8 0.4" />
          <path d="M8 6.6l-0.8 0.4" />
          <path d="M7 6.9l-0.8 0.4" />
          <path d="M6 7.2l-0.8 0.4" />
          
          {/* Second left branch leaflets */}
          <path d="M9.5 8.2l-0.8 0.5" />
          <path d="M8.5 8.5l-0.8 0.5" />
          <path d="M7.5 8.8l-0.8 0.5" />
          <path d="M6.5 9.1l-0.8 0.5" />
          <path d="M5.5 9.4l-0.8 0.5" />
          <path d="M4.5 9.7l-0.8 0.5" />
          
          {/* Third left branch leaflets */}
          <path d="M9 10.8l-0.9 0.6" />
          <path d="M8 11.2l-0.9 0.6" />
          <path d="M7 11.6l-0.9 0.6" />
          <path d="M6 12l-0.9 0.6" />
          <path d="M5 12.4l-0.9 0.6" />
          <path d="M4 12.8l-0.9 0.6" />
          
          {/* Fourth left branch leaflets */}
          <path d="M9 13.8l-0.9 0.6" />
          <path d="M8 14.2l-0.9 0.6" />
          <path d="M7 14.6l-0.9 0.6" />
          <path d="M6 15l-0.9 0.6" />
          <path d="M5 15.4l-0.9 0.6" />
          <path d="M4 15.8l-0.9 0.6" />
        </g>
        
        {/* Tiny leaflets along right branches - creating feathery texture */}
        <g className="mimosa-leaflets" strokeWidth="0.8" opacity="0.8">
          {/* Top right branch leaflets */}
          <path d="M14 6l0.8 0.4" />
          <path d="M15 6.3l0.8 0.4" />
          <path d="M16 6.6l0.8 0.4" />
          <path d="M17 6.9l0.8 0.4" />
          <path d="M18 7.2l0.8 0.4" />
          
          {/* Second right branch leaflets */}
          <path d="M14.5 8.2l0.8 0.5" />
          <path d="M15.5 8.5l0.8 0.5" />
          <path d="M16.5 8.8l0.8 0.5" />
          <path d="M17.5 9.1l0.8 0.5" />
          <path d="M18.5 9.4l0.8 0.5" />
          <path d="M19.5 9.7l0.8 0.5" />
          
          {/* Third right branch leaflets */}
          <path d="M15 10.8l0.9 0.6" />
          <path d="M16 11.2l0.9 0.6" />
          <path d="M17 11.6l0.9 0.6" />
          <path d="M18 12l0.9 0.6" />
          <path d="M19 12.4l0.9 0.6" />
          <path d="M20 12.8l0.9 0.6" />
          
          {/* Fourth right branch leaflets */}
          <path d="M15 13.8l0.9 0.6" />
          <path d="M16 14.2l0.9 0.6" />
          <path d="M17 14.6l0.9 0.6" />
          <path d="M18 15l0.9 0.6" />
          <path d="M19 15.4l0.9 0.6" />
          <path d="M20 15.8l0.9 0.6" />
        </g>
        
        {/* Additional delicate leaflets for more feathery appearance */}
        <g className="mimosa-leaflets" strokeWidth="0.6" opacity="0.6">
          <path d="M10.5 6.1l-0.6 0.3" />
          <path d="M9.5 6.4l-0.6 0.3" />
          <path d="M8.5 6.7l-0.6 0.3" />
          <path d="M13.5 6.1l0.6 0.3" />
          <path d="M14.5 6.4l0.6 0.3" />
          <path d="M15.5 6.7l0.6 0.3" />
          
          <path d="M10 8.3l-0.6 0.4" />
          <path d="M9 8.7l-0.6 0.4" />
          <path d="M8 9.1l-0.6 0.4" />
          <path d="M14 8.3l0.6 0.4" />
          <path d="M15 8.7l0.6 0.4" />
          <path d="M16 9.1l0.6 0.4" />
        </g>
      </svg>
    </div>
  );
}