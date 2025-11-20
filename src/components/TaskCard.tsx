import { Task } from '../types/task';
import React from 'react';
import { TagPill } from './TagPill';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { AlertPinIcon } from './icons/AlertPinIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PencilIcon } from './icons/PencilIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit?: (task: Task) => void;
}

// Move static objects outside component to prevent recreation
const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

const PRIORITY_BORDER_COLORS = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
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

const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  onDuplicate,
  onEdit,
}: TaskCardProps) => {
  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleDuplicate = () => {
    onDuplicate(task.id);
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

  const taskIsOverdue = isOverdue(task.dueDate);
  const isHighPriorityOverdue = task.priority === 'high' && taskIsOverdue;

  return (
    <div
      className={`bg-white p-5 rounded-lg shadow-md border-l-4 border-t border-r border-b border-gray-200 hover:shadow-lg transition-all flex flex-col ${
        PRIORITY_BORDER_COLORS[task.priority]
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
        <div className="flex items-center gap-2">
          {isHighPriorityOverdue && (
            <AlertPinIcon
              className="text-red-600 animate-pulse-twice shrink-0"
              title="Overdue"
            />
          )}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 wrap-break-word tracking-tight">
            {task.title}
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              PRIORITY_COLORS[task.priority]
            }`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              STATUS_COLORS[task.status]
            }`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 leading-relaxed text-sm">
        {task.description}
      </p>

      <div className="text-sm text-gray-600 mb-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="text-gray-400" />
          <span className="text-xs">
            <span className="text-gray-700 font-semibold">Due:</span>{' '}
            <span
              className={`${
                taskIsOverdue && task.status !== 'done'
                  ? 'text-red-600 font-bold'
                  : 'text-gray-600'
              }`}
            >
              {formatDate(task.dueDate)}
              {taskIsOverdue && task.status !== 'done' && (
                <span className="ml-1.5 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  OVERDUE
                </span>
              )}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <ClockIcon className="text-gray-400" />
          <span className="text-xs">
            <span className="text-gray-700 font-semibold">Created:</span>{' '}
            <span className="text-gray-600">{formatDate(task.createdAt)}</span>
          </span>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {task.tags.map((tag, index) => (
              <TagPill key={index} tag={tag} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-auto border-t border-gray-200 pt-3">
        <button
          onClick={handleStatusToggle}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-blue-500 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
          title="Change to next status"
        >
          <CheckCircleIcon className="shrink-0" />
          <span>Status</span>
        </button>
        {onEdit && (
          <button
            onClick={handleEdit}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-green-500 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-green-600 transition-colors"
            title="Edit this task"
          >
            <PencilIcon className="shrink-0" />
            <span>Edit</span>
          </button>
        )}
        <button
          onClick={handleDuplicate}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-purple-500 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-purple-600 transition-colors"
          title="Duplicate this task"
        >
          <DocumentDuplicateIcon className="shrink-0" />
          <span className="hidden sm:inline">Duplicate</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-red-500 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-red-600 transition-colors"
          title="Delete this task"
        >
          <TrashIcon className="shrink-0" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};
