import { Task } from '../types/task';

/**
 * Export tasks to JSON format and trigger download
 */
export const downloadTasksAsJSON = (tasks: Task[]): void => {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escape CSV field values to handle commas, quotes, and newlines
 */
const escapeCSVField = (field: string | undefined | null): string => {
  if (!field) return '';
  const stringField = String(field);
  if (
    stringField.includes(',') ||
    stringField.includes('"') ||
    stringField.includes('\n')
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

/**
 * Export tasks to CSV format and trigger download
 */
export const downloadTasksAsCSV = (tasks: Task[]): void => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Due Date',
    'Created At',
    'Tags',
  ];

  const rows = tasks.map((task) => [
    escapeCSVField(task.id),
    escapeCSVField(task.title),
    escapeCSVField(task.description),
    escapeCSVField(task.status),
    escapeCSVField(task.priority),
    escapeCSVField(task.dueDate || ''),
    escapeCSVField(task.createdAt),
    escapeCSVField(task.tags.join('; ')),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
