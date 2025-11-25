import React from 'react';
import { TaskStatus } from '../../types/task';

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  color: string;
}[] = [
  {
    value: 'todo',
    label: 'To Do',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    value: 'done',
    label: 'Done',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
];

export interface StatusFilterProps {
  expanded: boolean;
  toggle: () => void;
  statuses: TaskStatus[];
  onToggle: (status: TaskStatus) => void;
}

export const StatusFilter = ({
  expanded,
  toggle,
  statuses,
  onToggle,
}: StatusFilterProps) => (
  <div>
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
    >
      <span>Status {statuses.length > 0 && `(${statuses.length})`}</span>
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
        {STATUS_OPTIONS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={`px-3 py-1.5 rounded-md border transition-all text-xs font-semibold ${
              statuses.includes(value)
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
