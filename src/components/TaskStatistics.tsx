import React from 'react';

export interface TaskStatisticsProps {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export function TaskStatistics({
  total,
  todo,
  inProgress,
  done,
}: TaskStatisticsProps) {
  const completionRate = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
          Total Tasks
        </h3>
        <p className="text-3xl font-bold text-gray-800">{total}</p>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
          To Do
        </h3>
        <p className="text-3xl font-bold text-yellow-600">{todo}</p>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
          In Progress
        </h3>
        <p className="text-3xl font-bold text-blue-600">{inProgress}</p>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
          Completed
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {done}{' '}
          <span className="text-xl font-semibold text-gray-500">
            ({completionRate.toFixed(0)}%)
          </span>
        </p>
      </div>
    </div>
  );
}
