import React from 'react';

interface TaskSortingProps {
  onSortChange: (
    sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title',
    sortOrder: 'asc' | 'desc'
  ) => void;
  initialSortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  initialSortOrder?: 'asc' | 'desc';
}

export const TaskSorting = ({
  onSortChange,
  initialSortBy = 'createdAt',
  initialSortOrder = 'desc',
}: TaskSortingProps) => {
  const [sortBy, setSortBy] = React.useState<
    'createdAt' | 'dueDate' | 'priority' | 'title'
  >(initialSortBy);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>(
    initialSortOrder
  );

  // Notify parent when sort changes
  React.useEffect(() => {
    onSortChange(sortBy, sortOrder);
  }, [sortBy, sortOrder, onSortChange]);

  const handleSortByChange = (
    newSortBy: 'createdAt' | 'dueDate' | 'priority' | 'title'
  ) => {
    setSortBy(newSortBy);
  };
  const handleSortOrderToggle = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSortByChange('createdAt')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'createdAt'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Created Date
          </button>
          <button
            onClick={() => handleSortByChange('dueDate')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'dueDate'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Due Date
          </button>
          <button
            onClick={() => handleSortByChange('priority')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'priority'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => handleSortByChange('title')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'title'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Title
          </button>
          <button
            onClick={handleSortOrderToggle}
            className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>
    </div>
  );
};
