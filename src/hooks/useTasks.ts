import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AddTaskFn,
  UpdateTaskFn,
  DeleteTaskFn,
  ImportTasksFn,
  DuplicateTaskFn,
  Task,
} from '../types/task';
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

  // All mutator functions are defined inside useMemo for referential stability
  const value = useMemo(() => {
    const addTask: AddTaskFn = (newTask) => {
      const task: Task = {
        ...newTask,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, task]);
    };

    const updateTask: UpdateTaskFn = (id, updates) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );
    };

    const deleteTask: DeleteTaskFn = (id) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const duplicateTask: DuplicateTaskFn = (id) => {
      setTasks((prev) => {
        const taskToDuplicate = prev.find((task) => task.id === id);
        if (!taskToDuplicate) return prev;

        const duplicatedTask: Task = {
          ...taskToDuplicate,
          id: `${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
          tags: [...taskToDuplicate.tags],
        };

        return [...prev, duplicatedTask];
      });
    };

    const importTasks: ImportTasksFn = (importedTasks) => {
      setTasks((prev) => {
        // Generate new IDs for all imported tasks
        const tasksWithNewIds = importedTasks.map((task) => ({
          ...task,
          id: `${crypto.randomUUID()}`,
        }));
        return [...prev, ...tasksWithNewIds];
      });
    };

    return {
      tasks,
      loading,
      addTask,
      updateTask,
      deleteTask,
      duplicateTask,
      importTasks,
    };
  }, [tasks, loading]);

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

  return value;
};
