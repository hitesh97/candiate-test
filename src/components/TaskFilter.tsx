import { useState, useEffect, useCallback } from 'react';
import { TaskStatus } from '../types/task';

interface TaskFilterProps {
  onFilterChange: (status: TaskStatus | 'all') => void;
  onSearchChange: (query: string) => void;
  activeFilter?: TaskStatus | 'all';
  taskCount?: number;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'todo', label: 'TO DO' },
  { value: 'in-progress', label: 'IN PROGRESS' },
  { value: 'done', label: 'DONE' },
] as const;

export const TaskFilter = ({
  onFilterChange,
  onSearchChange,
  activeFilter = 'all',
  taskCount,
}: TaskFilterProps) => {
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Debounce search to improve performance
    const timeoutId = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onSearchChange]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleFilterClick = useCallback(
    (filter: TaskStatus | 'all') => {
      onFilterChange(filter);
    },
    [onFilterChange]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-6">
      {/* Search Input */}
      <label className="text-sm font-medium text-gray-700">Filter tasks:</label>
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={handleSearch}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium placeholder:text-gray-400"
            aria-label="Search tasks"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleFilterClick(value)}
            className={`px-5 py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${
              activeFilter === value
                ? 'bg-blue-500 text-white shadow-md scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm hover:shadow'
            }`}
            aria-label={`Filter by ${label}`}
            aria-pressed={activeFilter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {taskCount !== undefined && searchInput && (
        <div className="mt-3 text-sm text-gray-600 font-medium">
          {taskCount === 0 ? (
            <span className="text-gray-500">No tasks found</span>
          ) : (
            <span>
              Found {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
