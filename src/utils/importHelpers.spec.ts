import { describe, it, expect, vi } from 'vitest';
import { importTasksFromFile } from './importHelpers';
import { Task } from '../types/task';

describe('importHelpers', () => {
  describe('importTasksFromFile', () => {
    describe('JSON import', () => {
      it('should successfully import valid JSON tasks', async () => {
        const tasks: Task[] = [
          {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            status: 'todo',
            priority: 'high',
            tags: ['test', 'important'],
            createdAt: '2025-01-01',
            dueDate: '2025-12-31',
          },
          {
            id: '2',
            title: 'Another Task',
            description: 'Another Description',
            status: 'in-progress',
            priority: 'medium',
            tags: ['work'],
            createdAt: '2025-01-02',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const result = await importTasksFromFile(file);

        expect(result).toEqual(tasks);
        expect(result.length).toBe(2);
      });

      it('should reject empty JSON file', async () => {
        const file = new File([''], 'tasks.json', {
          type: 'application/json',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'File is empty'
        );
      });

      it('should reject non-array JSON', async () => {
        const fileContent = JSON.stringify({ tasks: [] });
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'JSON file must contain an array of tasks'
        );
      });

      it('should reject invalid JSON syntax', async () => {
        const file = new File(['{ invalid json }'], 'tasks.json', {
          type: 'application/json',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'Failed to parse file'
        );
      });

      it('should filter out invalid tasks and keep valid ones', async () => {
        const tasks = [
          {
            id: '1',
            title: 'Valid Task',
            description: 'Valid',
            status: 'todo',
            priority: 'high',
            tags: [],
            createdAt: '2025-01-01',
          },
          {
            id: '2',
            title: 'Invalid Task',
            // missing required fields
          },
          {
            id: '3',
            title: 'Another Valid Task',
            description: 'Valid',
            status: 'done',
            priority: 'low',
            tags: ['tag'],
            createdAt: '2025-01-03',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(2);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('3');
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });

      it('should reject if all tasks are invalid', async () => {
        const tasks = [{ invalid: 'task1' }, { invalid: 'task2' }];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'No valid tasks found in file'
        );

        consoleWarnSpy.mockRestore();
      });

      it('should validate task status field', async () => {
        const tasks = [
          {
            id: '1',
            title: 'Invalid Status',
            description: 'Test',
            status: 'invalid-status',
            priority: 'high',
            tags: [],
            createdAt: '2025-01-01',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'No valid tasks found in file'
        );

        consoleWarnSpy.mockRestore();
      });

      it('should validate task priority field', async () => {
        const tasks = [
          {
            id: '1',
            title: 'Invalid Priority',
            description: 'Test',
            status: 'todo',
            priority: 'invalid-priority',
            tags: [],
            createdAt: '2025-01-01',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'No valid tasks found in file'
        );

        consoleWarnSpy.mockRestore();
      });

      it('should accept tasks without dueDate', async () => {
        const tasks: Task[] = [
          {
            id: '1',
            title: 'Task without due date',
            description: 'Test',
            status: 'todo',
            priority: 'high',
            tags: [],
            createdAt: '2025-01-01',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].dueDate).toBeUndefined();
      });

      it('should validate tags are array of strings', async () => {
        const tasks = [
          {
            id: '1',
            title: 'Invalid Tags',
            description: 'Test',
            status: 'todo',
            priority: 'high',
            tags: [123, 456], // Invalid: numbers instead of strings
            createdAt: '2025-01-01',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'No valid tasks found in file'
        );

        consoleWarnSpy.mockRestore();
      });
    });

    describe('CSV import', () => {
      it('should successfully import valid CSV tasks', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Test Task,Test Description,todo,high,2025-12-31,2025-01-01,test; important
2,Another Task,Another Description,in-progress,medium,,2025-01-02,work`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          priority: 'high',
          dueDate: '2025-12-31',
          createdAt: '2025-01-01',
          tags: ['test', 'important'],
        });
        expect(result[1]).toEqual({
          id: '2',
          title: 'Another Task',
          description: 'Another Description',
          status: 'in-progress',
          priority: 'medium',
          dueDate: undefined,
          createdAt: '2025-01-02',
          tags: ['work'],
        });
      });

      it('should handle quoted CSV fields with commas', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,"Task with, comma","Description, with, commas",todo,high,2025-12-31,2025-01-01,tag1; tag2`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Task with, comma');
        expect(result[0].description).toBe('Description, with, commas');
      });

      it('should handle escaped quotes in CSV fields', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,"Task with ""quotes""","Description with ""multiple"" ""quotes""",todo,high,2025-12-31,2025-01-01,`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Task with "quotes"');
        expect(result[0].description).toBe(
          'Description with "multiple" "quotes"'
        );
      });

      it('should handle empty CSV file (headers only)', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'CSV file must contain headers and at least one task'
        );
      });

      it('should handle CSV with no headers', async () => {
        const csvContent = ``;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'File is empty'
        );
      });

      it('should skip CSV lines with incorrect field count', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,todo,high,2025-12-31,2025-01-01,tag1
2,Invalid Task,Only Three Fields
3,Task 3,Desc 3,done,low,,2025-01-03,tag3`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(2);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('3');
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Expected 8 fields')
        );

        consoleWarnSpy.mockRestore();
      });

      it('should skip CSV lines with invalid task data', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,todo,high,2025-12-31,2025-01-01,tag1
2,Task 2,Desc 2,invalid-status,high,2025-12-31,2025-01-02,tag2
3,Task 3,Desc 3,done,low,,2025-01-03,tag3`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(2);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('3');
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid task data')
        );

        consoleWarnSpy.mockRestore();
      });

      it('should handle empty tags in CSV', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,todo,high,2025-12-31,2025-01-01,`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].tags).toEqual([]);
      });

      it('should parse semicolon-separated tags', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,todo,high,2025-12-31,2025-01-01,tag1; tag2; tag3; tag4`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].tags).toEqual(['tag1', 'tag2', 'tag3', 'tag4']);
      });

      it('should trim whitespace from CSV fields', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
  1  ,  Task 1  ,  Desc 1  ,  todo  ,  high  ,  2025-12-31  ,  2025-01-01  ,  tag1  ;  tag2  `;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].id).toBe('1');
        expect(result[0].title).toBe('Task 1');
        expect(result[0].tags).toEqual(['tag1', 'tag2']);
      });

      it('should handle empty due date in CSV', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,todo,high,,2025-01-01,tag1`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].dueDate).toBeUndefined();
      });

      it('should skip empty lines in CSV', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,todo,high,2025-12-31,2025-01-01,tag1

2,Task 2,Desc 2,done,low,,2025-01-02,tag2

`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(2);
      });

      it('should reject if all CSV tasks are invalid', async () => {
        const csvContent = `ID,Title,Description,Status,Priority,Due Date,Created At,Tags
1,Task 1,Desc 1,invalid-status,high,2025-12-31,2025-01-01,tag1
2,Task 2,Desc 2,invalid-status,low,,2025-01-02,tag2`;

        const file = new File([csvContent], 'tasks.csv', {
          type: 'text/csv',
        });

        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'No valid tasks found in file'
        );

        consoleWarnSpy.mockRestore();
      });
    });

    describe('Unsupported file formats', () => {
      it('should reject unsupported file format', async () => {
        const file = new File(['some content'], 'tasks.txt', {
          type: 'text/plain',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'Unsupported file format. Please use .json or .csv'
        );
      });

      it('should reject file with no extension', async () => {
        const file = new File(['some content'], 'tasks', {
          type: 'text/plain',
        });

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'Unsupported file format. Please use .json or .csv'
        );
      });
    });

    describe('File reading errors', () => {
      it('should handle file read errors', async () => {
        const file = new File(['content'], 'tasks.json', {
          type: 'application/json',
        });

        // Mock FileReader to simulate an error
        const originalFileReader = global.FileReader;
        global.FileReader = class MockFileReader {
          onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
          onerror: (() => void) | null = null;
          result: string | ArrayBuffer | null = null;

          readAsText() {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror();
              }
            }, 0);
          }
        } as unknown as typeof FileReader;

        await expect(importTasksFromFile(file)).rejects.toThrow(
          'Failed to read file'
        );

        global.FileReader = originalFileReader;
      });
    });

    describe('Edge cases', () => {
      it('should handle very large task arrays in JSON', async () => {
        const tasks: Task[] = Array.from({ length: 1000 }, (_, i) => ({
          id: `${i + 1}`,
          title: `Task ${i + 1}`,
          description: `Description ${i + 1}`,
          status: 'todo' as const,
          priority: 'medium' as const,
          tags: [`tag${i}`],
          createdAt: '2025-01-01',
        }));

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1000);
      });

      it('should handle tasks with all possible status values', async () => {
        const tasks: Task[] = [
          {
            id: '1',
            title: 'Todo Task',
            description: 'Desc',
            status: 'todo',
            priority: 'high',
            tags: [],
            createdAt: '2025-01-01',
          },
          {
            id: '2',
            title: 'In Progress Task',
            description: 'Desc',
            status: 'in-progress',
            priority: 'medium',
            tags: [],
            createdAt: '2025-01-02',
          },
          {
            id: '3',
            title: 'Done Task',
            description: 'Desc',
            status: 'done',
            priority: 'low',
            tags: [],
            createdAt: '2025-01-03',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(3);
        expect(result[0].status).toBe('todo');
        expect(result[1].status).toBe('in-progress');
        expect(result[2].status).toBe('done');
      });

      it('should handle tasks with all possible priority values', async () => {
        const tasks: Task[] = [
          {
            id: '1',
            title: 'Low Priority',
            description: 'Desc',
            status: 'todo',
            priority: 'low',
            tags: [],
            createdAt: '2025-01-01',
          },
          {
            id: '2',
            title: 'Medium Priority',
            description: 'Desc',
            status: 'todo',
            priority: 'medium',
            tags: [],
            createdAt: '2025-01-02',
          },
          {
            id: '3',
            title: 'High Priority',
            description: 'Desc',
            status: 'todo',
            priority: 'high',
            tags: [],
            createdAt: '2025-01-03',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(3);
        expect(result[0].priority).toBe('low');
        expect(result[1].priority).toBe('medium');
        expect(result[2].priority).toBe('high');
      });

      it('should handle special characters in task fields', async () => {
        const tasks: Task[] = [
          {
            id: '1',
            title: 'Task with émojis 🎉 and spëcial çhars',
            description: 'Description with 中文字符 and العربية',
            status: 'todo',
            priority: 'high',
            tags: ['tâg1', 'tãg2'],
            createdAt: '2025-01-01',
          },
        ];

        const fileContent = JSON.stringify(tasks);
        const file = new File([fileContent], 'tasks.json', {
          type: 'application/json',
        });

        const result = await importTasksFromFile(file);

        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Task with émojis 🎉 and spëcial çhars');
        expect(result[0].description).toBe(
          'Description with 中文字符 and العربية'
        );
      });
    });
  });
});
