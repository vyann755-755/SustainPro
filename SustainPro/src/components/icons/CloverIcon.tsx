import React from 'react';

interface CloverIconProps {
  className?: string;
}

export function CloverIcon({ className = "h-4 w-4" }: CloverIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Four-leaf clover design */}
      <path d="M12 12c-2-2-2-5.5 0-7.5s5.5-2 7.5 0-2 5.5-0 7.5" />
      <path d="M12 12c2-2 5.5-2 7.5 0s2 5.5 0 7.5-5.5-2-7.5 0" />
      <path d="M12 12c2 2 2 5.5 0 7.5s-5.5 2-7.5 0 2-5.5 0-7.5" />
      <path d="M12 12c-2 2-5.5 2-7.5 0s-2-5.5 0-7.5 5.5 2 7.5 0" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M12 12v6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}