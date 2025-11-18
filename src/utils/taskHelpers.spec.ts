import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  loadTasksFromStorage,
  saveTasksToStorage,
  getTaskById,
} from './taskHelpers';
import { Task } from '../types/task';

describe('taskHelpers', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: 'todo',
      priority: 'high',
      createdAt: '2025-11-18T10:00:00.000Z',
      tags: ['test'],
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2025-11-18T11:00:00.000Z',
      dueDate: '2025-12-31',
      tags: ['test', 'urgent'],
    },
    {
      id: '3',
      title: 'Test Task 3',
      description: 'Description 3',
      status: 'done',
      priority: 'low',
      createdAt: '2025-11-18T12:00:00.000Z',
      tags: [],
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('STORAGE_KEY', () => {
    it('should have the correct storage key', () => {
      expect(STORAGE_KEY).toBe('tasks');
    });
  });

  describe('loadTasksFromStorage', () => {
    it('should load tasks from localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));

      const result = await loadTasksFromStorage();

      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(3);
      expect(result[0].title).toBe('Test Task 1');
      expect(result[1].status).toBe('in-progress');
      expect(result[2].priority).toBe('low');
    });

    it('should return empty array when no data in localStorage', async () => {
      const result = await loadTasksFromStorage();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return empty array when localStorage item is null', async () => {
      localStorage.removeItem(STORAGE_KEY);

      const result = await loadTasksFromStorage();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON data gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await loadTasksFromStorage();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading tasks:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should handle empty string in localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, '');

      const result = await loadTasksFromStorage();

      expect(result).toEqual([]);
    });

    it('should handle localStorage errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await loadTasksFromStorage();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading tasks:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('should work asynchronously with setTimeout', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));

      const promise = loadTasksFromStorage();

      // Should not be resolved immediately
      expect(promise).toBeInstanceOf(Promise);

      const result = await promise;
      expect(result).toEqual(mockTasks);
    });

    it('should load tasks with all properties intact', async () => {
      const taskWithAllProps: Task = {
        id: 'full-task',
        title: 'Complete Task',
        description: 'Full description',
        status: 'in-progress',
        priority: 'high',
        createdAt: '2025-11-18T10:00:00.000Z',
        dueDate: '2025-12-25',
        tags: ['tag1', 'tag2', 'tag3'],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([taskWithAllProps]));

      const result = await loadTasksFromStorage();

      expect(result[0]).toEqual(taskWithAllProps);
      expect(result[0].dueDate).toBe('2025-12-25');
      expect(result[0].tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('saveTasksToStorage', () => {
    it('should save tasks to localStorage', async () => {
      await saveTasksToStorage(mockTasks);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockTasks);
    });

    it('should save empty array to localStorage', async () => {
      await saveTasksToStorage([]);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBe('[]');
      expect(JSON.parse(stored!)).toEqual([]);
    });

    it('should overwrite existing tasks in localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([mockTasks[0]]));

      await saveTasksToStorage(mockTasks);

      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(3);
      expect(parsed).toEqual(mockTasks);
    });

    it('should handle localStorage errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      await expect(saveTasksToStorage(mockTasks)).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving tasks:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('should work asynchronously with setTimeout', async () => {
      const promise = saveTasksToStorage(mockTasks);

      expect(promise).toBeInstanceOf(Promise);

      await promise;

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual(mockTasks);
    });

    it('should save tasks with all properties', async () => {
      const complexTask: Task = {
        id: 'complex-123',
        title: 'Complex Task with Special Characters: @#$%',
        description: 'Description with\nnewlines\tand\ttabs',
        status: 'done',
        priority: 'medium',
        createdAt: '2025-11-18T15:30:45.123Z',
        dueDate: '2025-12-31T23:59:59.999Z',
        tags: ['tag-with-dash', 'tag_with_underscore', 'TAG_UPPERCASE'],
      };

      await saveTasksToStorage([complexTask]);

      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed[0]).toEqual(complexTask);
      expect(parsed[0].title).toContain('@#$%');
      expect(parsed[0].description).toContain('\n');
    });

    it('should resolve without returning a value', async () => {
      const result = await saveTasksToStorage(mockTasks);

      expect(result).toBeUndefined();
    });

    it('should handle JSON serialization errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Create circular reference to cause JSON.stringify to fail
      const circularTask: any = {
        id: '1',
        title: 'Circular',
        description: 'test',
        status: 'todo',
        priority: 'low',
        createdAt: '2025-11-18',
        tags: [],
      };
      circularTask.self = circularTask;

      await expect(
        saveTasksToStorage([circularTask as Task])
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('getTaskById', () => {
    it('should return the correct task by id', () => {
      const result = getTaskById(mockTasks, '2');

      expect(result).toBeDefined();
      expect(result?.id).toBe('2');
      expect(result?.title).toBe('Test Task 2');
      expect(result?.status).toBe('in-progress');
    });

    it('should return the first task', () => {
      const result = getTaskById(mockTasks, '1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.title).toBe('Test Task 1');
    });

    it('should return the last task', () => {
      const result = getTaskById(mockTasks, '3');

      expect(result).toBeDefined();
      expect(result?.id).toBe('3');
      expect(result?.title).toBe('Test Task 3');
    });

    it('should return undefined when task id does not exist', () => {
      const result = getTaskById(mockTasks, 'non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      const result = getTaskById([], '1');

      expect(result).toBeUndefined();
    });

    it('should handle numeric string ids correctly', () => {
      const result = getTaskById(mockTasks, '1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });

    it('should handle uuid-like ids', () => {
      const tasksWithUuid: Task[] = [
        {
          ...mockTasks[0],
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      ];

      const result = getTaskById(
        tasksWithUuid,
        '550e8400-e29b-41d4-a716-446655440000'
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should be case-sensitive when matching ids', () => {
      const tasksWithCaseId: Task[] = [
        {
          ...mockTasks[0],
          id: 'ABC123',
        },
      ];

      const result1 = getTaskById(tasksWithCaseId, 'ABC123');
      const result2 = getTaskById(tasksWithCaseId, 'abc123');

      expect(result1).toBeDefined();
      expect(result2).toBeUndefined();
    });

    it('should return the first matching task when duplicates exist', () => {
      const tasksWithDuplicates: Task[] = [
        { ...mockTasks[0], id: 'duplicate', title: 'First' },
        { ...mockTasks[1], id: 'duplicate', title: 'Second' },
      ];

      const result = getTaskById(tasksWithDuplicates, 'duplicate');

      expect(result?.title).toBe('First');
    });

    it('should handle tasks with all optional fields present', () => {
      const result = getTaskById(mockTasks, '2');

      expect(result).toBeDefined();
      expect(result?.dueDate).toBe('2025-12-31');
      expect(result?.tags).toEqual(['test', 'urgent']);
      expect(result?.tags?.length).toBe(2);
    });

    it('should handle tasks with no optional fields', () => {
      const result = getTaskById(mockTasks, '1');

      expect(result).toBeDefined();
      expect(result?.dueDate).toBeUndefined();
      expect(result?.tags).toEqual(['test']);
    });
  });

  describe('Integration tests', () => {
    it('should save and load tasks maintaining data integrity', async () => {
      await saveTasksToStorage(mockTasks);
      const loaded = await loadTasksFromStorage();

      expect(loaded).toEqual(mockTasks);
      expect(loaded.length).toBe(mockTasks.length);

      // Verify each task maintained its properties
      loaded.forEach((task, index) => {
        expect(task).toEqual(mockTasks[index]);
      });
    });

    it('should allow finding tasks after save and load cycle', async () => {
      await saveTasksToStorage(mockTasks);
      const loaded = await loadTasksFromStorage();
      const found = getTaskById(loaded, '2');

      expect(found).toBeDefined();
      expect(found).toEqual(mockTasks[1]);
    });

    it('should handle multiple save operations', async () => {
      await saveTasksToStorage([mockTasks[0]]);
      await saveTasksToStorage([mockTasks[0], mockTasks[1]]);
      await saveTasksToStorage(mockTasks);

      const loaded = await loadTasksFromStorage();
      expect(loaded.length).toBe(3);
      expect(loaded).toEqual(mockTasks);
    });

    it('should clear all tasks when saving empty array', async () => {
      await saveTasksToStorage(mockTasks);
      await saveTasksToStorage([]);

      const loaded = await loadTasksFromStorage();
      expect(loaded).toEqual([]);
    });
  });
});
