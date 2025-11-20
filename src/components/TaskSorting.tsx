interface TaskSortingProps {
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  onSortByChange: (
    sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title'
  ) => void;
  onSortOrderToggle: () => void;
}

export const TaskSorting = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle,
}: TaskSortingProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSortByChange('createdAt')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'createdAt'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Created Date
          </button>
          <button
            onClick={() => onSortByChange('dueDate')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'dueDate'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Due Date
          </button>
          <button
            onClick={() => onSortByChange('priority')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'priority'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => onSortByChange('title')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'title'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Title
          </button>
          <button
            onClick={onSortOrderToggle}
            className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>
    </div>
  );
};
