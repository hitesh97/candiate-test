import React from 'react';
import { TagIcon } from './icons/TagIcon';

interface TagPillProps {
  tag: string;
  removable?: boolean;
  onRemove?: (tag: string) => void;
  className?: string;
}

export const TagPill = ({
  tag,
  removable,
  onRemove,
  className = '',
}: TagPillProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm ${className}`}
    >
      <TagIcon className="text-gray-500" />
      <span>#{tag}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag)}
          className="ml-2 text-gray-500 hover:text-red-600 focus:outline-none"
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
