import React from 'react';
import { TaskPriority } from '../../types/task';

export interface PriorityFilterProps {
  expanded: boolean;
  toggle: () => void;
  priorities: TaskPriority[];
  onToggle: (priority: TaskPriority) => void;
}

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  color: string;
}[] = [
  {
    value: 'high',
    label: 'High',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    value: 'low',
    label: 'Low',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
];

export const PriorityFilter = ({
  expanded,
  toggle,
  priorities,
  onToggle,
}: PriorityFilterProps) => (
  <div>
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
    >
      <span>Priority {priorities.length > 0 && `(${priorities.length})`}</span>
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
      <div className="flex gap-2 flex-wrap">
        {PRIORITY_OPTIONS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={`px-3 py-1.5 rounded-md border transition-all text-xs font-semibold ${
              priorities.includes(value)
                ? color
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    )}
  </div>
);
