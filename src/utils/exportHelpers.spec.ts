import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadTasksAsJSON, downloadTasksAsCSV } from './exportHelpers';
import { Task } from '../types/task';

describe('exportHelpers', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Add URL methods if they don't exist
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn();
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    }

    // Mock URL.createObjectURL
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    // Mock DOM methods
    clickSpy = vi.fn();
    const mockLink = {
      href: '',
      download: '',
      click: clickSpy,
      style: {},
    } as unknown as HTMLAnchorElement;

    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockLink);
    appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => mockLink);
    removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => mockLink);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadTasksAsJSON', () => {
    it('should export tasks as JSON and trigger download', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'in-progress',
          priority: 'medium',
          tags: ['test'],
          createdAt: '&',
        },
      ];

      downloadTasksAsJSON(tasks);

      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('application/json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty tasks array', () => {
      downloadTasksAsJSON([]);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should set correct filename with timestamp', () => {
      const tasks: Task[] = [];
      downloadTasksAsJSON(tasks);

      const mockLink = createElementSpy.mock.results[0]
        .value as HTMLAnchorElement;
      expect(mockLink.download).toMatch(
        /^tasks-export-\d{4}-\d{2}-\d{2}\.json$/
      );
    });

    it('should create blob with correct MIME type', () => {
      downloadTasksAsJSON([]);

      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('application/json');
    });

    it('should properly clean up resources', () => {
      downloadTasksAsJSON([]);

      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadTasksAsCSV', () => {
    it('should export tasks as CSV and trigger download', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'done',
          priority: 'high',
          tags: ['test', 'sample'],
          createdAt: '&',
        },
      ];

      downloadTasksAsCSV(tasks);

      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('text/csv;charset=utf-8;');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty tasks array', () => {
      downloadTasksAsCSV([]);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should set correct filename with timestamp', () => {
      const tasks: Task[] = [];
      downloadTasksAsCSV(tasks);

      const mockLink = createElementSpy.mock.results[0]
        .value as HTMLAnchorElement;
      expect(mockLink.download).toMatch(
        /^tasks-export-\d{4}-\d{2}-\d{2}\.csv$/
      );
    });

    it('should create blob with correct MIME type', () => {
      downloadTasksAsCSV([]);

      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('text/csv;charset=utf-8;');
    });
    it('should properly clean up resources', () => {
      downloadTasksAsCSV([]);

      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle tasks with commas in fields', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task with, comma',
          description: 'Description',
          status: 'todo',
          priority: 'low',
          tags: [],
          createdAt: '&',
        },
      ];

      downloadTasksAsCSV(tasks);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle tasks with quotes in fields', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task with "quotes"',
          description: 'Description',
          status: 'todo',
          priority: 'low',
          tags: [],
          createdAt: '&',
        },
      ];

      downloadTasksAsCSV(tasks);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle tasks with newlines in fields', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task with\nnewline',
          description: 'Description',
          status: 'todo',
          priority: 'low',
          tags: [],
          createdAt: '&',
        },
      ];

      downloadTasksAsCSV(tasks);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle multiple tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          priority: 'low',
          tags: [],
          createdAt: '&',
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'in-progress',
          priority: 'medium',
          tags: ['tag1'],
          createdAt: '&',
        },
      ];

      downloadTasksAsCSV(tasks);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle all task statuses', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Todo Task',
          description: 'Description',
          status: 'todo',
          priority: 'low',
          tags: [],
          createdAt: '&',
        },
        {
          id: '2',
          title: 'In Progress Task',
          description: 'Description',
          status: 'in-progress',
          priority: 'medium',
          tags: [],
          createdAt: '&',
        },
        {
          id: '3',
          title: 'Done Task',
          description: 'Description',
          status: 'done',
          priority: 'high',
          tags: [],
          createdAt: '&',
        },
      ];

      downloadTasksAsCSV(tasks);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
