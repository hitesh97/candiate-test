import { Task } from '../types/task';

export const STORAGE_KEY = 'tasks';

export const loadTasksFromStorage = async (): Promise<Task[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return resolve([]);
        resolve(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading tasks:', error);
        resolve([]);
      }
    }, 0);
  });
};

export const saveTasksToStorage = async (tasks: Task[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        resolve();
      } catch (error) {
        console.error('Error saving tasks:', error);
        resolve();
      }
    }, 0);
  });
};

export const getTaskById = (tasks: Task[], id: string): Task | undefined => {
  return tasks.find((task) => task.id === id);
};
