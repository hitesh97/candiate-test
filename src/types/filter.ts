import { TaskStatus, TaskPriority } from './task';

export interface TaskFilters {
  statuses: TaskStatus[];
  searchQuery: string;
  priorities: TaskPriority[];
  tags: string[];
  dateRange: {
    type: 'created' | 'due';
    start?: string;
    end?: string;
  } | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: TaskFilters;
}

export const DEFAULT_FILTERS: TaskFilters = {
  statuses: [],
  searchQuery: '',
  priorities: [],
  tags: [],
  dateRange: null,
};
