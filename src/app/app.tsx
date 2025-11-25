import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { FilteredTasks } from '../components/FilteredTasks';
import { TaskFilter } from '../components/TaskFilter';
import { TaskSorting } from '../components/TaskSorting';
import { TaskStatistics } from '../components/TaskStatistics';
import { TaskActions } from '../components/TaskActions';
import { Dialog } from '../components/Dialog';
import { Task } from '../types/task';
import { TaskFilters, DEFAULT_FILTERS } from '../types/filter';
import {
  downloadTasksAsJSON,
  downloadTasksAsCSV,
} from '../utils/exportHelpers';
import { importTasksFromFile } from '../utils/importHelpers';

export function App() {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    importTasks,
  } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  // Sort state is now managed in TaskSorting
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'dueDate' | 'priority' | 'title'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Filtering is now handled by FilteredTasks component
  // filteredTaskCount will be derived in render

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
    // File input click is now handled by TaskActions component
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
        <TaskStatistics
          total={stats.total}
          todo={stats.todo}
          inProgress={stats.inProgress}
          done={stats.done}
        />

        {/* Task Actions */}
        <TaskActions
          showForm={showForm}
          showExportMenu={showExportMenu}
          importMessage={importMessage}
          onToggleForm={() => setShowForm(!showForm)}
          onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onImportClick={handleImportClick}
          onFileImport={handleFileImport}
          onCloseImportMessage={() => setImportMessage(null)}
        />

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
          {/* Filter and Sorting Sidebar */}
          <div className="lg:w-80 lg:shrink-0 space-y-6">
            <TaskSorting
              initialSortBy={sortBy}
              initialSortOrder={sortOrder}
              onSortChange={(newSortBy, newSortOrder) => {
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            />
            <TaskFilter onFiltersChange={setFilters} tasks={tasks} />
          </div>

          {/* Task List */}
          <div className="flex-1">
            <FilteredTasks tasks={tasks} filters={filters}>
              {(filteredTasks) => (
                <TaskList
                  tasks={filteredTasks}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onDuplicateTask={duplicateTask}
                  onEditTask={handleEditTask}
                />
              )}
            </FilteredTasks>
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
