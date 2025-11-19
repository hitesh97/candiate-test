import React from 'react';

export const TagIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h10l4 4v10a2 2 0 01-2 2H7L3 11V5a2 2 0 012-2z"
    />
  </svg>
);
