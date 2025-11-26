import React, { createContext, useContext } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
  AddTaskFn,
  UpdateTaskFn,
  DeleteTaskFn,
  ImportTasksFn,
  DuplicateTaskFn,
  Task,
} from '../types/task';

interface TasksContextValue {
  tasks: Task[];
  loading: boolean;
  addTask: AddTaskFn;
  updateTask: UpdateTaskFn;
  deleteTask: DeleteTaskFn;
  duplicateTask: DuplicateTaskFn;
  importTasks: ImportTasksFn;
}

export const TasksContext = createContext<TasksContextValue | undefined>(
  undefined
);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const tasksApi = useTasks();
  return (
    <TasksContext.Provider value={tasksApi}>{children}</TasksContext.Provider>
  );
};

export function useTasksContext() {
  const ctx = useContext(TasksContext);
  if (!ctx)
    throw new Error('useTasksContext must be used within a TasksProvider');
  return ctx;
}
