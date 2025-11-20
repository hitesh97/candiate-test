import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { Pagination } from './Pagination';
import { useState, useTransition, useCallback } from 'react';

interface TaskListProps {
  tasks: Task[];
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskList = ({
  tasks,
  sortBy,
  sortOrder,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onEditTask,
}: TaskListProps) => {
  const [paginationRange, setPaginationRange] = useState({ start: 0, end: 5 });
  const [, startTransition] = useTransition();

  // Tasks are already filtered by parent component
  const sortedTasks = [...tasks].sort((a, b) => {
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
    } else {
      message = 'No tasks match your filters';
      suggestion = 'Try adjusting your filters or create a new task';
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
      <Pagination totalItems={sortedTasks.length} onPaginate={handlePaginate} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-150">
        {paginatedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onDuplicate={onDuplicateTask}
            onEdit={onEditTask}
          />
        ))}
      </div>
    </div>
  );
};
