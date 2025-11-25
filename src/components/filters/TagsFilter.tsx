import React from 'react';

export interface TagsFilterProps {
  expanded: boolean;
  toggle: () => void;
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export const TagsFilter = ({
  expanded,
  toggle,
  tags,
  selectedTags,
  onToggle,
}: TagsFilterProps) =>
  tags.length > 0 ? (
    <div>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
      >
        <span>
          Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className={`px-3 py-1.5 rounded-md border transition-all text-xs font-medium ${
                selectedTags.includes(tag)
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;
