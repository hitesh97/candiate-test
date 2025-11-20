import { Task, TaskStatus, TaskPriority } from '../types/task';

/**
 * Validate if a value is a valid TaskStatus
 */
const isValidStatus = (value: unknown): value is TaskStatus => {
  return value === 'todo' || value === 'in-progress' || value === 'done';
};

/**
 * Validate if a value is a valid TaskPriority
 */
const isValidPriority = (value: unknown): value is TaskPriority => {
  return value === 'low' || value === 'medium' || value === 'high';
};

/**
 * Validate if an object matches the Task interface structure
 */
const isValidTask = (obj: unknown): obj is Task => {
  if (!obj || typeof obj !== 'object') return false;

  const task = obj as Record<string, unknown>;

  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    isValidStatus(task.status) &&
    isValidPriority(task.priority) &&
    (task.dueDate === undefined || typeof task.dueDate === 'string') &&
    typeof task.createdAt === 'string' &&
    Array.isArray(task.tags) &&
    task.tags.every((tag) => typeof tag === 'string')
  );
};

/**
 * Parse CSV string into array of Task objects
 */
const parseCSV = (csvContent: string): Task[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one task');
  }

  // Skip header line
  const dataLines = lines.slice(1);
  const tasks: Task[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Simple CSV parser that handles quoted fields
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        j++; // Skip next quote
      } else if (char === '"') {
        // Toggle quote mode
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add last field

    if (fields.length !== 8) {
      console.warn(
        `Line ${i + 2}: Expected 8 fields, got ${fields.length}. Skipping.`
      );
      continue;
    }

    const [
      id,
      title,
      description,
      status,
      priority,
      dueDate,
      createdAt,
      tagsStr,
    ] = fields;

    // Parse tags (semicolon-separated)
    const tags = tagsStr
      .split(';')
      .map((t) => t.trim())
      .filter((t) => t);

    const task: Task = {
      id: id.trim(),
      title: title.trim(),
      description: description.trim(),
      status: status.trim() as TaskStatus,
      priority: priority.trim() as TaskPriority,
      dueDate: dueDate.trim() || undefined,
      createdAt: createdAt.trim(),
      tags,
    };

    if (!isValidTask(task)) {
      console.warn(`Line ${i + 2}: Invalid task data. Skipping.`);
      continue;
    }

    tasks.push(task);
  }

  return tasks;
};

/**
 * Import tasks from a file (JSON or CSV format)
 * Returns a promise that resolves to an array of valid Task objects
 */
export const importTasksFromFile = (file: File): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;

        if (!content) {
          reject(new Error('File is empty'));
          return;
        }

        let tasks: Task[] = [];

        // Determine file type and parse accordingly
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);

          if (!Array.isArray(parsed)) {
            reject(new Error('JSON file must contain an array of tasks'));
            return;
          }

          // Validate each task
          tasks = parsed.filter((item) => {
            if (!isValidTask(item)) {
              console.warn('Invalid task found in JSON, skipping:', item);
              return false;
            }
            return true;
          });
        } else if (file.name.endsWith('.csv')) {
          tasks = parseCSV(content);
        } else {
          reject(
            new Error('Unsupported file format. Please use .json or .csv')
          );
          return;
        }

        if (tasks.length === 0) {
          reject(new Error('No valid tasks found in file'));
          return;
        }

        resolve(tasks);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse file: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
