import React from 'react';
import { TaskFilters } from '../../types/filter';

export interface DateRangeFilterProps {
  expanded: boolean;
  toggle: () => void;
  dateRange: TaskFilters['dateRange'];
  onTypeChange: (type: 'created' | 'due') => void;
  onChange: (
    type: 'created' | 'due',
    field: 'start' | 'end',
    value: string
  ) => void;
  onClear: () => void;
}

export const DateRangeFilter = ({
  expanded,
  toggle,
  dateRange,
  onTypeChange,
  onChange,
  onClear,
}: DateRangeFilterProps) => (
  <div>
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
    >
      <span>Date Range {dateRange && '(active)'}</span>
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
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => onTypeChange('created')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
              dateRange?.type === 'created'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Created Date
          </button>
          <button
            onClick={() => onTypeChange('due')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
              dateRange?.type === 'due'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Due Date
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">
              From
            </label>
            <input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) =>
                onChange(dateRange?.type || 'created', 'start', e.target.value)
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">
              To
            </label>
            <input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) =>
                onChange(dateRange?.type || 'created', 'end', e.target.value)
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {dateRange && (
            <button
              onClick={onClear}
              className="w-full text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Clear Date Range
            </button>
          )}
        </div>
      </div>
    )}
  </div>
);
