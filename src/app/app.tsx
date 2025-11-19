import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskFilter } from '../components/TaskFilter';
import { Dialog } from '../components/Dialog';
import { TaskStatus, Task } from '../types/task';

export function App() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const filteredTaskCount = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((task) => task.status === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerQuery) ||
          task.description.toLowerCase().includes(lowerQuery) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered.length;
  }, [tasks, filter, searchQuery]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditSubmit = (updatedTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, updatedTask);
      setEditingTask(null);
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
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-8 py-3.5 rounded-lg hover:bg-blue-600 transition-colors shadow-md font-semibold text-base"
          >
            {showForm ? 'Cancel' : '+ Add New Task'}
          </button>
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
              onFilterChange={setFilter}
              onSearchChange={setSearchQuery}
              activeFilter={filter}
              taskCount={filteredTaskCount}
            />
          </div>

          {/* Task List */}
          <div className="flex-1">
            <TaskList
              tasks={tasks}
              filter={filter}
              searchQuery={searchQuery}
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
