import { useState, useEffect, useRef } from 'react';
import { Task } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/taskHelpers';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const loadedTasks = await loadTasksFromStorage();
        if (!aborted) {
          setTasks(Array.isArray(loadedTasks) ? loadedTasks : []);
        }
      } catch (err) {
        console.error('Failed to load tasks from storage', err);
        if (!aborted) setTasks([]);
      } finally {
        if (!aborted) setLoading(false);
        initialLoadRef.current = false;
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
  };

  // Only allow updates to mutable fields; prevent accidental changes to 'id' and 'createdAt'.
  const updateTask = (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  /**
   * Duplicate a task by copying all fields except id and createdAt.
   * The new task gets a fresh ID and creation timestamp.
   */
  const duplicateTask = (id: string) => {
    setTasks((prev) => {
      const taskToDuplicate = prev.find((task) => task.id === id);
      if (!taskToDuplicate) return prev;

      const duplicatedTask: Task = {
        ...taskToDuplicate,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        tags: [...taskToDuplicate.tags],
      };

      return [...prev, duplicatedTask];
    });
  };

  /**
   * Import tasks in bulk, assigning new unique IDs to all imported tasks
   * to prevent conflicts with existing tasks.
   */
  const importTasks = (importedTasks: Task[]) => {
    setTasks((prev) => {
      // Generate new IDs for all imported tasks
      const tasksWithNewIds = importedTasks.map((task) => ({
        ...task,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));
      return [...prev, ...tasksWithNewIds];
    });
  };

  // Persist tasks whenever they change, but skip the initial load
  useEffect(() => {
    if (initialLoadRef.current) return;
    (async () => {
      try {
        await saveTasksToStorage(tasks);
      } catch (err) {
        console.error('Failed to save tasks to storage', err);
      }
    })();
    return () => {
      // No cleanup needed yet.
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    importTasks,
  };
};
