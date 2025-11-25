import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatusFilter, StatusFilterProps } from './filters/StatusFilter';
import { PriorityFilter, PriorityFilterProps } from './filters/PriorityFilter';
import { TaskStatus, TaskPriority, Task } from '../types/task';
import { TaskFilters, FilterPreset, DEFAULT_FILTERS } from '../types/filter';
import { TagsFilter, TagsFilterProps } from './filters/TagsFilter';
import {
  DateRangeFilter,
  DateRangeFilterProps,
} from './filters/DateRangeFilter';
import { PresetsFilter, PresetsFilterProps } from './filters/PresetsFilter';
import { SearchInput } from './filters/SearchInput';

interface TaskFilterProps {
  onFiltersChange: (filters: TaskFilters) => void;
  tasks: Task[];
  taskCount?: number;
}

const PRESETS_KEY = 'task-filter-presets';

export const TaskFilter = ({
  onFiltersChange,
  tasks,
  taskCount,
}: TaskFilterProps) => {
  // Split state by filter section
  const [statuses, setStatuses] = useState<TaskStatus[]>(
    DEFAULT_FILTERS.statuses
  );
  const [priorities, setPriorities] = useState<TaskPriority[]>(
    DEFAULT_FILTERS.priorities
  );
  const [tags, setTags] = useState<string[]>(DEFAULT_FILTERS.tags);
  const [dateRange, setDateRange] = useState(DEFAULT_FILTERS.dateRange);
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

  // Get all unique tags from tasks
  const tagSet = new Set<string>();
  tasks.forEach((task) => {
    task.tags.forEach((tag) => tagSet.add(tag));
  });
  const availableTags = Array.from(tagSet).sort();

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
      const updatedFilters: TaskFilters = {
        statuses,
        priorities,
        tags,
        dateRange,
        searchQuery: searchInput,
      };
      onFiltersChangeRef.current(updatedFilters);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [statuses, priorities, tags, dateRange, searchInput]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  const handleStatusToggle = useCallback((status: TaskStatus) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const handlePriorityToggle = useCallback((priority: TaskPriority) => {
    setPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleDateRangeChange = useCallback(
    (type: 'created' | 'due', field: 'start' | 'end', value: string) => {
      setDateRange((prev) => ({
        type: prev?.type || type,
        start: field === 'start' ? value : prev?.start,
        end: field === 'end' ? value : prev?.end,
      }));
    },
    []
  );

  const handleDateTypeChange = useCallback((type: 'created' | 'due') => {
    setDateRange((prev) =>
      prev ? { ...prev, type } : { type, start: '', end: '' }
    );
  }, []);

  const handleClearDateRange = useCallback(() => {
    setDateRange(null);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setStatuses(DEFAULT_FILTERS.statuses);
    setPriorities(DEFAULT_FILTERS.priorities);
    setTags(DEFAULT_FILTERS.tags);
    setDateRange(DEFAULT_FILTERS.dateRange);
    setSearchInput('');
  }, []);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `${crypto.randomUUID()}`,
      name: presetName.trim(),
      filters: {
        statuses,
        priorities,
        tags,
        dateRange,
        searchQuery: searchInput,
      },
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    setPresetName('');
    setShowPresetDialog(false);
  }, [presetName, statuses, priorities, tags, dateRange, searchInput, presets]);

  const handleLoadPreset = useCallback((preset: FilterPreset) => {
    setStatuses(preset.filters.statuses || []);
    setPriorities(preset.filters.priorities || []);
    setTags(preset.filters.tags || []);
    setDateRange(preset.filters.dateRange || null);
    setSearchInput(preset.filters.searchQuery || '');
  }, []);

  const handleDeletePreset = useCallback(
    (presetId: string) => {
      const updatedPresets = presets.filter((p) => p.id !== presetId);
      setPresets(updatedPresets);
      localStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    },
    [presets]
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFilterCount = (() => {
    let count = 0;
    if (statuses.length > 0) count++;
    if (searchInput) count++;
    if (priorities.length > 0) count++;
    if (tags.length > 0) count++;
    if (dateRange) count++;
    return count;
  })();

  // Section toggles (no need to memoize)
  const toggleStatusSection = useCallback(
    () => toggleSection('status'),
    [toggleSection]
  );
  const togglePrioritySection = useCallback(
    () => toggleSection('priority'),
    [toggleSection]
  );
  const toggleTagsSection = useCallback(
    () => toggleSection('tags'),
    [toggleSection]
  );
  const toggleDateRangeSection = useCallback(
    () => toggleSection('dateRange'),
    [toggleSection]
  );
  const togglePresetsSection = useCallback(
    () => toggleSection('presets'),
    [toggleSection]
  );

  // Props for each filter component (no need to memoize)
  // Memoize props for each filter component
  const statusFilterProps: StatusFilterProps = React.useMemo(
    () => ({
      expanded: expandedSections.status,
      toggle: toggleStatusSection,
      statuses,
      onToggle: handleStatusToggle,
    }),
    [expandedSections.status, toggleStatusSection, statuses, handleStatusToggle]
  );

  const priorityFilterProps: PriorityFilterProps = React.useMemo(
    () => ({
      expanded: expandedSections.priority,
      toggle: togglePrioritySection,
      priorities,
      onToggle: handlePriorityToggle,
    }),
    [
      expandedSections.priority,
      togglePrioritySection,
      priorities,
      handlePriorityToggle,
    ]
  );

  const tagsFilterProps: TagsFilterProps = React.useMemo(
    () => ({
      expanded: expandedSections.tags,
      toggle: toggleTagsSection,
      tags: availableTags,
      selectedTags: tags,
      onToggle: handleTagToggle,
    }),
    [
      expandedSections.tags,
      toggleTagsSection,
      availableTags,
      tags,
      handleTagToggle,
    ]
  );

  const dateRangeFilterProps: DateRangeFilterProps = React.useMemo(
    () => ({
      expanded: expandedSections.dateRange,
      toggle: toggleDateRangeSection,
      dateRange,
      onTypeChange: handleDateTypeChange,
      onChange: handleDateRangeChange,
      onClear: handleClearDateRange,
    }),
    [
      expandedSections.dateRange,
      toggleDateRangeSection,
      dateRange,
      handleDateTypeChange,
      handleDateRangeChange,
      handleClearDateRange,
    ]
  );

  const presetsFilterProps: PresetsFilterProps = React.useMemo(
    () => ({
      expanded: expandedSections.presets,
      toggle: togglePresetsSection,
      presets,
      onLoad: handleLoadPreset,
      onDelete: handleDeletePreset,
      showDialog: showPresetDialog,
      setShowDialog: setShowPresetDialog,
      presetName,
      setPresetName,
      onSavePresetDialog: handleSavePreset,
    }),
    [
      expandedSections.presets,
      togglePresetsSection,
      presets,
      handleSavePreset,
      handleLoadPreset,
      handleDeletePreset,
      showPresetDialog,
      presetName,
    ]
  );

  const searchInputProps = {
    value: searchInput,
    onChange: handleSearch,
    onClear: handleClearSearch,
  };

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
      <SearchInput {...searchInputProps} />

      {/* Status Filter */}
      <StatusFilter {...statusFilterProps} />

      {/* Priority Filter */}
      <PriorityFilter {...priorityFilterProps} />

      {/* Tags Filter */}
      <TagsFilter {...tagsFilterProps} />

      {/* Date Range Filter */}
      <DateRangeFilter {...dateRangeFilterProps} />

      {/* Filter Presets */}
      <PresetsFilter {...presetsFilterProps} />

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
    </div>
  );
};
