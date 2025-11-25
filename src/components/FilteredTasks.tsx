import React, { useMemo } from 'react';
import { Task } from '../types/task';
import { TaskFilters } from '../types/filter';

interface FilteredTasksProps {
  tasks: Task[];
  filters: TaskFilters;
  children: (filteredTasks: Task[]) => React.ReactNode;
}

export const FilteredTasks: React.FC<FilteredTasksProps> = ({
  tasks,
  filters,
  children,
}) => {
  const filteredTasks = useMemo(() => {
    const hasStatusFilter = filters.statuses.length > 0;
    const hasSearchFilter = filters.searchQuery.length > 0;
    const lowerQuery = hasSearchFilter ? filters.searchQuery.toLowerCase() : '';
    const hasPriorityFilter = filters.priorities.length > 0;
    const hasTagsFilter = filters.tags.length > 0;
    const hasDateFilter = filters.dateRange !== null;

    let dateFilterType: 'created' | 'due' | null = null;
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let startTime = 0;
    let endTime = 0;

    if (hasDateFilter && filters.dateRange) {
      dateFilterType = filters.dateRange.type;
      if (filters.dateRange.start) {
        startDate = new Date(filters.dateRange.start);
        startTime = startDate.getTime();
      }
      if (filters.dateRange.end) {
        endDate = new Date(filters.dateRange.end);
        endTime = endDate.getTime();
      }
    }

    return tasks.filter((task) => {
      if (hasStatusFilter && !filters.statuses.includes(task.status)) {
        return false;
      }
      if (hasSearchFilter) {
        const titleMatch = task.title.toLowerCase().includes(lowerQuery);
        const descMatch = task.description.toLowerCase().includes(lowerQuery);
        const tagMatch = task.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery)
        );
        if (!titleMatch && !descMatch && !tagMatch) {
          return false;
        }
      }
      if (hasPriorityFilter && !filters.priorities.includes(task.priority)) {
        return false;
      }
      if (
        hasTagsFilter &&
        !filters.tags.some((filterTag) => task.tags.includes(filterTag))
      ) {
        return false;
      }
      if (hasDateFilter && dateFilterType) {
        const dateStr =
          dateFilterType === 'created' ? task.createdAt : task.dueDate;
        if (!dateStr) return false;
        const taskTime = new Date(dateStr).getTime();
        if (startDate && taskTime < startTime) return false;
        if (endDate && taskTime > endTime) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  return <>{children(filteredTasks)}</>;
};
