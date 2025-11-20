import { useState, useMemo, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskFilter } from '../components/TaskFilter';
import { Dialog } from '../components/Dialog';
import { Task } from '../types/task';
import { TaskFilters, DEFAULT_FILTERS } from '../types/filter';
import {
  downloadTasksAsJSON,
  downloadTasksAsCSV,
} from '../utils/exportHelpers';
import { importTasksFromFile } from '../utils/importHelpers';

export function App() {
  const { tasks, loading, addTask, updateTask, deleteTask, importTasks } =
    useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredTasks = useMemo(() => {
    // Pre-compute values outside the filter loop for performance
    const hasStatusFilter = filters.statuses.length > 0;
    const hasSearchFilter = filters.searchQuery.length > 0;
    const lowerQuery = hasSearchFilter ? filters.searchQuery.toLowerCase() : '';
    const hasPriorityFilter = filters.priorities.length > 0;
    const hasTagsFilter = filters.tags.length > 0;
    const hasDateFilter = filters.dateRange !== null;

    // Pre-compute date filter values once
    let dateFilterType: 'created' | 'due' | null = null;
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let startTime = 0;
    let endTime = 0;

    if (hasDateFilter && filters.dateRange) {
      dateFilterType = filters.dateRange.type;
      if (filters.dateRange.start) {
        startDate = new Date(filters.dateRange.start);
        startTime = startDate.getTime();
      }
      if (filters.dateRange.end) {
        endDate = new Date(filters.dateRange.end);
        endTime = endDate.getTime();
      }
    }

    // Single-pass filter combining all conditions
    return tasks.filter((task) => {
      // Status filter
      if (hasStatusFilter && !filters.statuses.includes(task.status)) {
        return false;
      }

      // Search filter
      if (hasSearchFilter) {
        const titleMatch = task.title.toLowerCase().includes(lowerQuery);
        const descMatch = task.description.toLowerCase().includes(lowerQuery);
        const tagMatch = task.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery)
        );
        if (!titleMatch && !descMatch && !tagMatch) {
          return false;
        }
      }

      // Priority filter
      if (hasPriorityFilter && !filters.priorities.includes(task.priority)) {
        return false;
      }

      // Tags filter
      if (
        hasTagsFilter &&
        !filters.tags.some((filterTag) => task.tags.includes(filterTag))
      ) {
        return false;
      }

      // Date range filter
      if (hasDateFilter && dateFilterType) {
        const dateStr =
          dateFilterType === 'created' ? task.createdAt : task.dueDate;
        if (!dateStr) return false;

        const taskTime = new Date(dateStr).getTime();
        if (startDate && taskTime < startTime) return false;
        if (endDate && taskTime > endTime) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const filteredTaskCount = filteredTasks.length;

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditSubmit = (updatedTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, updatedTask);
      setEditingTask(null);
    }
  };

  const handleExportJSON = () => {
    downloadTasksAsJSON(tasks);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    downloadTasksAsCSV(tasks);
    setShowExportMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedTasks = await importTasksFromFile(file);
      importTasks(importedTasks);
      setImportMessage({
        type: 'success',
        text: `Successfully imported ${importedTasks.length} task${
          importedTasks.length === 1 ? '' : 's'
        }!`,
      });
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: `Import failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">
            Task Management System
          </h1>
          <p className="text-blue-50 mt-2 text-base font-medium">
            Organize and track your tasks efficiently
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p>Loading tasks...</p>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
              Total Tasks
            </h3>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
              To Do
            </h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.todo}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.done}{' '}
              <span className="text-xl font-semibold text-gray-500">
                ({stats.completionRate.toFixed(0)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mb-6">
          {/* Import/Export Message Banner */}
          {importMessage && (
            <div
              className={`mb-4 p-4 rounded-lg border flex items-start justify-between ${
                importMessage.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-red-50 border-red-400 text-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  {importMessage.type === 'success' ? '✓' : '✕'}
                </span>
                <p className="font-medium">{importMessage.text}</p>
              </div>
              <button
                onClick={() => setImportMessage(null)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl leading-none"
                aria-label="Close message"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md font-semibold text-base"
              >
                Export Tasks ▾
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
                  <button
                    onClick={handleExportJSON}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors font-medium text-gray-700 border-b border-gray-200"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors font-medium text-gray-700"
                  >
                    Export as CSV
                  </button>
                </div>
              )}
            </div>

            {/* Import Button */}
            <button
              onClick={handleImportClick}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors shadow-md font-semibold text-base"
            >
              Import Tasks
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileImport}
              className="hidden"
            />

            {/* Add Task Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white px-8 py-3.5 rounded-lg hover:bg-blue-600 transition-colors shadow-md font-semibold text-base"
            >
              {showForm ? 'Cancel' : '+ Add New Task'}
            </button>
          </div>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <TaskForm
              onSubmit={(task) => {
                addTask(task);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filter and Task List Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Filter */}
          <div className="lg:w-80 lg:shrink-0">
            <TaskFilter
              onFiltersChange={setFilters}
              tasks={tasks}
              taskCount={filteredTaskCount}
            />
          </div>

          {/* Task List */}
          <div className="flex-1">
            <TaskList
              tasks={filteredTasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onEditTask={handleEditTask}
            />
          </div>
        </div>
      </main>

      {/* Edit Task Dialog */}
      <Dialog
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            key={editingTask.id}
            initialTask={editingTask}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Dialog>

      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-sm font-medium text-gray-300">
            Task Management System - Technical Test © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
