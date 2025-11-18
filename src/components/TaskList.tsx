import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { Pagination } from './Pagination';
import { useState, useTransition, useDeferredValue, useCallback } from 'react';

interface TaskListProps {
  tasks: Task[];
  filter: TaskStatus | 'all';
  searchQuery: string;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskList = ({
  tasks,
  filter,
  searchQuery,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
}: TaskListProps) => {
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'dueDate' | 'priority' | 'title'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [paginationRange, setPaginationRange] = useState({ start: 0, end: 5 });
  const [, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isStale = searchQuery !== deferredSearchQuery;

  let filteredTasks = tasks;

  if (filter !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.status === filter);
  }

  if (deferredSearchQuery) {
    const lowerQuery = deferredSearchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery)
    );
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
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

  // Get paginated tasks
  const paginatedTasks = sortedTasks.slice(
    paginationRange.start,
    paginationRange.end
  );

  // Handle pagination changes
  const handlePaginate = useCallback((startIndex: number, endIndex: number) => {
    startTransition(() => {
      setPaginationRange({ start: startIndex, end: endIndex });
    });
  }, []);

  if (sortedTasks.length === 0) {
    let message = 'No tasks found';
    let suggestion = '';

    if (tasks.length === 0) {
      message = 'No tasks yet';
      suggestion = 'Click "Add New Task" to create your first task!';
    } else if (deferredSearchQuery) {
      message = `No tasks match "${deferredSearchQuery}"`;
      suggestion = 'Try a different search term';
    } else if (filter !== 'all') {
      message = `No tasks with status: ${filter}`;
      suggestion = 'Try a different filter or create a new task';
    }

    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium mb-2">{message}</p>
        <p className="text-sm">{suggestion}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sorting controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => startTransition(() => setSortBy('createdAt'))}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'createdAt'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Created Date
            </button>
            <button
              onClick={() => startTransition(() => setSortBy('dueDate'))}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'dueDate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Due Date
            </button>
            <button
              onClick={() => startTransition(() => setSortBy('priority'))}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'priority'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Priority
            </button>
            <button
              onClick={() => startTransition(() => setSortBy('title'))}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'title'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Title
            </button>
            <button
              onClick={() =>
                startTransition(() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                )
              }
              className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-150 ${
          isStale ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {paginatedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
          />
        ))}
      </div>

      <Pagination totalItems={sortedTasks.length} onPaginate={handlePaginate} />
    </div>
  );
};
