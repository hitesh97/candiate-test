import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TaskStatus, TaskPriority, Task } from '../types/task';
import { TaskFilters, FilterPreset, DEFAULT_FILTERS } from '../types/filter';

interface TaskFilterProps {
  onFiltersChange: (filters: TaskFilters) => void;
  tasks: Task[];
  taskCount?: number;
}

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

const PRESETS_KEY = 'task-filter-presets';

export const TaskFilter = ({
  onFiltersChange,
  tasks,
  taskCount,
}: TaskFilterProps) => {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    status: false,
    priority: false,
    tags: false,
    dateRange: false,
    presets: false,
  });

  // Store callback in ref to avoid effect re-runs
  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // Get all unique tags from tasks (memoized)
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      task.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
  }, []);

  // Debounced filter application - only depends on values that actually change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedFilters = { ...filters, searchQuery: searchInput };
      onFiltersChangeRef.current(updatedFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchInput,
    filters.statuses,
    filters.priorities,
    filters.tags,
    filters.dateRange,
  ]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  const handleStatusToggle = useCallback((status: TaskStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const handlePriorityToggle = useCallback((priority: TaskPriority) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const handleDateRangeChange = useCallback(
    (type: 'created' | 'due', field: 'start' | 'end', value: string) => {
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          type: prev.dateRange?.type || type,
          start: field === 'start' ? value : prev.dateRange?.start,
          end: field === 'end' ? value : prev.dateRange?.end,
        },
      }));
    },
    []
  );

  const handleDateTypeChange = useCallback((type: 'created' | 'due') => {
    setFilters((prev) => ({
      ...prev,
      dateRange: prev.dateRange
        ? { ...prev.dateRange, type }
        : { type, start: '', end: '' },
    }));
  }, []);

  const handleClearDateRange = useCallback(() => {
    setFilters((prev) => ({ ...prev, dateRange: null }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  }, []);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: presetName.trim(),
      filters: { ...filters, searchQuery: searchInput },
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    setPresetName('');
    setShowPresetDialog(false);
  }, [presetName, filters, searchInput, presets]);

  const handleLoadPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
    setSearchInput(preset.filters.searchQuery);
  }, []);

  const handleDeletePreset = useCallback(
    (presetId: string) => {
      const updatedPresets = presets.filter((p) => p.id !== presetId);
      setPresets(updatedPresets);
      localStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    },
    [presets]
  );

  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    },
    []
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.statuses.length > 0) count++;
    if (searchInput) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters, searchInput]);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">
          Filter Tasks
        </label>
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
              {activeFilterCount} active
            </span>
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-gray-600 hover:text-red-600 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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

      {/* Status Filter */}
      <div>
        <button
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
        >
          <span>
            Status{' '}
            {filters.statuses.length > 0 && `(${filters.statuses.length})`}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${
              expandedSections.status ? 'rotate-180' : ''
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
        {expandedSections.status && (
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => handleStatusToggle(value)}
                className={`px-3 py-1.5 rounded-md border transition-all text-xs font-semibold ${
                  filters.statuses.includes(value)
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

      {/* Priority Filter */}
      <div>
        <button
          onClick={() => toggleSection('priority')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
        >
          <span>
            Priority{' '}
            {filters.priorities.length > 0 && `(${filters.priorities.length})`}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${
              expandedSections.priority ? 'rotate-180' : ''
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
        {expandedSections.priority && (
          <div className="flex gap-2 flex-wrap">
            {PRIORITY_OPTIONS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => handlePriorityToggle(value)}
                className={`px-3 py-1.5 rounded-md border transition-all text-xs font-semibold ${
                  filters.priorities.includes(value)
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

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('tags')}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
          >
            <span>
              Tags {filters.tags.length > 0 && `(${filters.tags.length})`}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${
                expandedSections.tags ? 'rotate-180' : ''
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
          {expandedSections.tags && (
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-md border transition-all text-xs font-medium ${
                    filters.tags.includes(tag)
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
      )}

      {/* Date Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('dateRange')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
        >
          <span>Date Range {filters.dateRange && '(active)'}</span>
          <svg
            className={`h-4 w-4 transition-transform ${
              expandedSections.dateRange ? 'rotate-180' : ''
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
        {expandedSections.dateRange && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleDateTypeChange('created')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
                  filters.dateRange?.type === 'created'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Created Date
              </button>
              <button
                onClick={() => handleDateTypeChange('due')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
                  filters.dateRange?.type === 'due'
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
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    handleDateRangeChange(
                      filters.dateRange?.type || 'created',
                      'start',
                      e.target.value
                    )
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
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    handleDateRangeChange(
                      filters.dateRange?.type || 'created',
                      'end',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {filters.dateRange && (
                <button
                  onClick={handleClearDateRange}
                  className="w-full text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Date Range
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Presets */}
      <div>
        <button
          onClick={() => toggleSection('presets')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
        >
          <span>
            Saved Presets {presets.length > 0 && `(${presets.length})`}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${
              expandedSections.presets ? 'rotate-180' : ''
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
        {expandedSections.presets && (
          <div className="space-y-2">
            <button
              onClick={() => setShowPresetDialog(true)}
              className="w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs font-semibold"
            >
              + Save Current Filters
            </button>
            {presets.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="flex-1 text-left text-xs font-medium text-gray-700 hover:text-blue-600"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {taskCount !== undefined && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            {taskCount === 0 ? (
              <span className="text-gray-500">No tasks found</span>
            ) : (
              <span>
                Showing {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Save Preset Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Save Filter Preset</h3>
            <input
              type="text"
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
                disabled={!presetName.trim()}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowPresetDialog(false);
                  setPresetName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
