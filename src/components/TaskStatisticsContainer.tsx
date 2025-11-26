import React, { useMemo } from 'react';
// import { Task } from '../types/task';
import { TaskStatistics } from './TaskStatistics';
import { useTasksContext } from '../context/TasksContext';

export const TaskStatisticsContainer: React.FC = () => {
  const { tasks } = useTasksContext();
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    return {
      total,
      todo,
      inProgress,
      done,
      completionRate: total > 0 ? (done / total) * 100 : 0,
    };
  }, [tasks]);

  return <TaskStatistics {...stats} />;
};
