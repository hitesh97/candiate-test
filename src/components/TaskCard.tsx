import { Task } from '../types/task';
import React from 'react';
import { TagPill } from './TagPill';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

// Move static objects outside component to prevent recreation
const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
} as const;

const STATUS_CYCLE: Task['status'][] = ['todo', 'in-progress', 'done'];

// Optimize date formatting with Intl.DateTimeFormat
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'No due date';
  return dateFormatter.format(new Date(dateString));
};

export const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  onEdit,
}: TaskCardProps) => {
  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleStatusToggle = () => {
    const currentIndex = STATUS_CYCLE.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];
    onUpdate(task.id, { status: nextStatus });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 wrap-break-word">
          {task.title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              PRIORITY_COLORS[task.priority]
            }`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              STATUS_COLORS[task.status]
            }`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <p className="text-gray-500 mb-3 leading-relaxed">{task.description}</p>

      <div className="text-sm text-gray-500 mb-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-gray-400" />
          <span>
            <span className="text-gray-700 font-medium">Due:</span>{' '}
            {formatDate(task.dueDate)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ClockIcon className="text-gray-400" />
          <span>
            <span className="text-gray-700 font-medium">Created:</span>{' '}
            {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-2 flex-wrap">
            {task.tags.map((tag, index) => (
              <TagPill key={index} tag={tag} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-col sm:flex-row">
        <button
          onClick={handleStatusToggle}
          className="flex-1 bg-blue-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-blue-600 transition-colors min-h-11 sm:min-h-0"
        >
          Change Status
        </button>
        {onEdit && (
          <button
            onClick={handleEdit}
            className="flex-1 bg-green-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-green-600 transition-colors min-h-11 sm:min-h-0"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-red-600 transition-colors min-h-11 sm:min-h-0"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
