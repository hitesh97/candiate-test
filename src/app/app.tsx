import { useState } from 'react';
import { TasksProvider, useTasksContext } from '../context/TasksContext';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { EditTaskDialog } from '../components/EditTaskDialog';
import { TaskListContainer } from '../components/TaskListContainer';
import { FilteredTasks } from '../components/FilteredTasks';
import { TaskFilter } from '../components/TaskFilter';
import { TaskSorting } from '../components/TaskSorting';
import { TaskStatisticsContainer } from '../components/TaskStatisticsContainer';
import { Footer } from '../components/Footer';
import { TaskActions } from '../components/TaskActions';
import { NewTaskInputType, Task } from '../types/task';
import { TaskFilters, DEFAULT_FILTERS } from '../types/filter';
import {
  downloadTasksAsJSON,
  downloadTasksAsCSV,
} from '../utils/exportHelpers';
import { importTasksFromFile } from '../utils/importHelpers';

function AppContent() {
  const { tasks, loading, addTask, updateTask, importTasks } =
    useTasksContext();
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'dueDate' | 'priority' | 'title'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering is now handled by FilteredTasks component
  // filteredTaskCount will be derived in render

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditSubmit = (updatedTask: NewTaskInputType) => {
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
        <TaskStatisticsContainer />

        {/* Task Actions */}
        <TaskActions
          showExportMenu={showExportMenu}
          importMessage={importMessage}
          onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onImportClick={handleImportClick}
          onFileImport={handleFileImport}
          onCloseImportMessage={() => setImportMessage(null)}
          onAddTaskClick={() => setShowAddDialog(true)}
        />

        {/* Add Task Dialog */}
        {showAddDialog && (
          <AddTaskDialog
            onAddTask={(task) => {
              addTask(task);
              setShowAddDialog(false);
            }}
            onCancel={() => setShowAddDialog(false)}
          />
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
            <TaskFilter onFiltersChange={setFilters} />
          </div>

          {/* Task List */}
          <div className="flex-1">
            <FilteredTasks filters={filters}>
              {(filteredTasks) => (
                <TaskListContainer
                  tasks={filteredTasks}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onEditTask={handleEditTask}
                />
              )}
            </FilteredTasks>
          </div>
        </div>
      </main>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        editingTask={editingTask}
        onEditSubmit={handleEditSubmit}
        onClose={() => setEditingTask(null)}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <TasksProvider>
      <AppContent />
    </TasksProvider>
  );
}
