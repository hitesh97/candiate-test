import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';
import * as taskHelpers from '../utils/taskHelpers';
import { Task } from '../types/task';

describe('useTasks', () => {
  let mockLoadTasksFromStorage: ReturnType<typeof vi.fn>;
  let mockSaveTasksToStorage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLoadTasksFromStorage = vi.fn();
    mockSaveTasksToStorage = vi.fn();

    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockImplementation(
      mockLoadTasksFromStorage
    );
    vi.spyOn(taskHelpers, 'saveTasksToStorage').mockImplementation(
      mockSaveTasksToStorage
    );

    // Mock console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty tasks and loading true', () => {
    mockLoadTasksFromStorage.mockResolvedValue([]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should load tasks from storage on mount', async () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Description',
        status: 'todo',
        priority: 'high',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      },
    ];

    mockLoadTasksFromStorage.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockLoadTasksFromStorage).toHaveBeenCalledTimes(1);
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('should set loading to false after loading tasks', async () => {
    mockLoadTasksFromStorage.mockResolvedValue([]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle load error gracefully and set empty tasks', async () => {
    mockLoadTasksFromStorage.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Failed to load tasks from storage',
      expect.any(Error)
    );
  });

  it('should handle non-array data from storage', async () => {
    mockLoadTasksFromStorage.mockResolvedValue(null as unknown as Task[]);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual([]);
  });

  it('should add a new task with generated id and createdAt', async () => {
    mockLoadTasksFromStorage.mockResolvedValue([]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newTask = {
      title: 'New Task',
      description: 'New Description',
      status: 'todo' as const,
      priority: 'medium' as const,
      tags: ['test'],
    };

    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    const isoSpy = vi
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2025-01-01T00:00:00.000Z');

    result.current.addTask(newTask);

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0]).toEqual({
      ...newTask,
      id: '1234567890',
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    dateSpy.mockRestore();
    isoSpy.mockRestore();
  });

  it('should add task to existing tasks array', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Description',
      status: 'done',
      priority: 'low',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newTask = {
      title: 'Second Task',
      description: 'Second Description',
      status: 'todo' as const,
      priority: 'high' as const,
      tags: [],
    };

    result.current.addTask(newTask);

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
    });

    expect(result.current.tasks[0]).toEqual(existingTask);
    expect(result.current.tasks[1].title).toBe('Second Task');
  });

  it('should update an existing task', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      status: 'todo',
      priority: 'low',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.updateTask('1', {
      title: 'Updated Title',
      status: 'done',
    });

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe('Updated Title');
    });

    expect(result.current.tasks[0].status).toBe('done');
    expect(result.current.tasks[0].description).toBe('Original Description');
    expect(result.current.tasks[0].priority).toBe('low');
  });

  it('should not modify id or createdAt when updating task', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.updateTask('1', { title: 'Updated' });

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe('Updated');
    });

    expect(result.current.tasks[0].id).toBe('1');
    expect(result.current.tasks[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
  });

  it('should not update task when id does not match', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Original',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.updateTask('999', { title: 'Updated' });

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe('Original');
    });
  });

  it('should delete a task by id', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'high',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'done',
        priority: 'low',
        createdAt: '2025-01-02T00:00:00.000Z',
        tags: [],
      },
    ];

    mockLoadTasksFromStorage.mockResolvedValue(tasks);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.deleteTask('1');

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0].id).toBe('2');
    expect(result.current.tasks[0].title).toBe('Task 2');
  });

  it('should not modify tasks when deleting non-existent id', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.deleteTask('999');

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0].id).toBe('1');
  });

  it('should save tasks to storage after adding a task', async () => {
    mockLoadTasksFromStorage.mockResolvedValue([]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the initial load call
    mockSaveTasksToStorage.mockClear();

    const newTask = {
      title: 'New Task',
      description: 'Description',
      status: 'todo' as const,
      priority: 'medium' as const,
      tags: [],
    };

    result.current.addTask(newTask);

    await waitFor(() => {
      expect(mockSaveTasksToStorage).toHaveBeenCalled();
    });

    expect(mockSaveTasksToStorage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'New Task',
          description: 'Description',
        }),
      ])
    );
  });

  it('should save tasks to storage after updating a task', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSaveTasksToStorage.mockClear();

    result.current.updateTask('1', { status: 'done' });

    await waitFor(() => {
      expect(mockSaveTasksToStorage).toHaveBeenCalled();
    });

    expect(mockSaveTasksToStorage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          status: 'done',
        }),
      ])
    );
  });

  it('should save tasks to storage after deleting a task', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description',
        status: 'done',
        priority: 'low',
        createdAt: '2025-01-02T00:00:00.000Z',
        tags: [],
      },
    ];

    mockLoadTasksFromStorage.mockResolvedValue(tasks);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSaveTasksToStorage.mockClear();

    result.current.deleteTask('1');

    await waitFor(() => {
      expect(mockSaveTasksToStorage).toHaveBeenCalled();
    });

    expect(mockSaveTasksToStorage).toHaveBeenCalledWith([
      expect.objectContaining({ id: '2' }),
    ]);
  });

  it('should not save to storage multiple times on initial load', async () => {
    const initialTasks: Task[] = [
      {
        id: '1',
        title: 'Initial Task',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      },
    ];

    mockLoadTasksFromStorage.mockResolvedValue(initialTasks);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Wait a bit more to ensure save completes
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should save once after initial load (due to setTasks triggering the effect)
    // but not multiple times
    expect(mockSaveTasksToStorage.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('should handle save error gracefully', async () => {
    mockLoadTasksFromStorage.mockResolvedValue([]);
    mockSaveTasksToStorage.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newTask = {
      title: 'Task',
      description: 'Description',
      status: 'todo' as const,
      priority: 'medium' as const,
      tags: [],
    };

    result.current.addTask(newTask);

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    // Task should still be added even if save fails
    expect(result.current.tasks[0].title).toBe('Task');
  });

  it('should prevent state updates after unmount during load', async () => {
    let resolveLoad: (value: Task[]) => void;
    mockLoadTasksFromStorage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        })
    );

    const { result, unmount } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    unmount();

    // Resolve after unmount - should not cause errors
    if (resolveLoad) {
      resolveLoad([]);
    }

    // Wait a bit to ensure no state updates happen
    await new Promise((resolve) => setTimeout(resolve, 10));

    // No error should occur and state should not update after unmount
    expect(result.current.loading).toBe(true);
  });

  it('should update multiple fields in a task at once', async () => {
    const existingTask: Task = {
      id: '1',
      title: 'Original',
      description: 'Original Description',
      status: 'todo',
      priority: 'low',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: ['old'],
    };

    mockLoadTasksFromStorage.mockResolvedValue([existingTask]);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.updateTask('1', {
      title: 'Updated',
      description: 'Updated Description',
      status: 'done',
      priority: 'high',
      tags: ['new'],
    });

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe('Updated');
    });

    const updatedTask = result.current.tasks[0];
    expect(updatedTask.description).toBe('Updated Description');
    expect(updatedTask.status).toBe('done');
    expect(updatedTask.priority).toBe('high');
    expect(updatedTask.tags).toEqual(['new']);
  });

  it('should maintain task order when updating', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'First',
        description: 'Desc',
        status: 'todo',
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      },
      {
        id: '2',
        title: 'Second',
        description: 'Desc',
        status: 'done',
        priority: 'low',
        createdAt: '2025-01-02T00:00:00.000Z',
        tags: [],
      },
      {
        id: '3',
        title: 'Third',
        description: 'Desc',
        status: 'in-progress',
        priority: 'high',
        createdAt: '2025-01-03T00:00:00.000Z',
        tags: [],
      },
    ];

    mockLoadTasksFromStorage.mockResolvedValue(tasks);
    mockSaveTasksToStorage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.updateTask('2', { title: 'Updated Second' });

    await waitFor(() => {
      expect(result.current.tasks[1].title).toBe('Updated Second');
    });

    expect(result.current.tasks[0].id).toBe('1');
    expect(result.current.tasks[1].id).toBe('2');
    expect(result.current.tasks[2].id).toBe('3');
  });
});
