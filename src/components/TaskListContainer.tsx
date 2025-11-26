import React, { useState, useMemo } from 'react';
import { Pagination } from './Pagination';
import { Task } from '../types/task';
import { TaskList } from './TaskList';

interface TaskListContainerProps {
  tasks: Task[];
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  onEditTask?: (task: Task) => void;
}

export const TaskListContainer: React.FC<TaskListContainerProps> = ({
  tasks,
  sortBy,
  sortOrder,
  onEditTask,
}) => {
  // Handlers are now used directly in TaskList via context
  const [paginationRange, setPaginationRange] = useState({ start: 0, end: 10 });

  // Memoized sorting
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        }
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [tasks, sortBy, sortOrder]);

  // Paginate
  const paginatedTasks = sortedTasks.slice(
    paginationRange.start,
    paginationRange.end
  );

  // Handler for pagination changes
  const handlePaginate = (startIndex: number, endIndex: number) => {
    setPaginationRange({ start: startIndex, end: endIndex });
  };

  // Render Pagination and TaskList
  return (
    <>
      <Pagination
        totalItems={sortedTasks.length}
        onPaginate={handlePaginate}
        itemsLabel="tasks"
      />
      <TaskList tasks={paginatedTasks} onEditTask={onEditTask} />
    </>
  );
};
