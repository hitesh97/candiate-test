import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { TaskFilter } from './TaskFilter';
import { Task } from '../types/task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'todo',
    priority: 'high',
    tags: ['urgent', 'frontend'],
    createdAt: '2025-01-01',
    dueDate: '2025-12-31',
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'medium',
    tags: ['backend', 'api'],
    createdAt: '2025-02-01',
    dueDate: '2025-11-30',
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description 3',
    status: 'done',
    priority: 'low',
    tags: ['documentation'],
    createdAt: '2025-03-01',
  },
];

describe('TaskFilter', () => {
  let mockOnFiltersChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnFiltersChange = vi.fn();
    localStorage.clear();
  });

  describe('Search Input', () => {
    it('should render search input', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );
      expect(screen.getByPlaceholderText('Search tasks...')).toBeDefined();
    });

    it('should update search input value when typing', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect((searchInput as HTMLInputElement).value).toBe('test');
    });

    it('should debounce search and call onFiltersChange after 300ms', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Verify input value changed immediately
      expect((searchInput as HTMLInputElement).value).toBe('test');

      // Wait for debounced callback (300ms + buffer)
      await waitFor(
        () => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ searchQuery: 'test' })
          );
        },
        { timeout: 500 }
      );
    });

    it('should show clear button when search has content', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Check that clear button (X icon) exists
      const buttons = screen.getAllByRole('button');
      const clearButton = buttons.find((btn) =>
        btn.querySelector('path[d*="M6 18L18 6"]')
      );
      expect(clearButton).toBeDefined();
    });

    it('should clear search when clear button is clicked', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const buttons = screen.getAllByRole('button');
      const clearButton = buttons.find((btn) =>
        btn.querySelector('path[d*="M6 18L18 6"]')
      );

      if (clearButton) {
        fireEvent.click(clearButton);
      }

      expect((searchInput as HTMLInputElement).value).toBe('');
    });
  });

  describe('Status Filter', () => {
    it('should render collapsible status filter section', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );
      expect(screen.getByText(/^Status/)).toBeDefined();
    });

    it('should expand status filter when clicked', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      const statusButton = screen.getByText(/^Status/);
      fireEvent.click(statusButton);

      expect(screen.getByText('To Do')).toBeDefined();
      expect(screen.getByText('In Progress')).toBeDefined();
      expect(screen.getByText('Done')).toBeDefined();
    });

    it('should toggle status selection', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Status/));
      const todoCheckbox = screen.getByText('To Do');
      fireEvent.click(todoCheckbox);

      // Wait for debounced callback
      await waitFor(
        () => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ statuses: ['todo'] })
          );
        },
        { timeout: 500 }
      );
    });

    it('should show active count in status header', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Status/));
      fireEvent.click(screen.getByText('To Do'));

      // Wait for status count to update
      await waitFor(
        () => {
          expect(screen.getByText(/Status \(1\)/)).toBeDefined();
        },
        { timeout: 500 }
      );
    });
  });

  describe('Priority Filter', () => {
    it('should render collapsible priority filter section', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );
      expect(screen.getByText(/^Priority/i)).toBeDefined();
    });

    it('should expand priority filter when clicked', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Priority/i));

      expect(screen.getByText('High')).toBeDefined();
      expect(screen.getByText('Medium')).toBeDefined();
      expect(screen.getByText('Low')).toBeDefined();
    });

    it('should toggle priority selection', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Priority/i));
      fireEvent.click(screen.getByText('High'));

      // Wait for debounced callback
      await waitFor(
        () => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ priorities: ['high'] })
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe('Tags Filter', () => {
    it('should render tags filter when tasks have tags', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );
      expect(screen.getByText(/^Tags/i)).toBeDefined();
    });

    it('should not render tags filter when no tasks have tags', () => {
      const tasksWithoutTags: Task[] = [
        {
          id: '1',
          title: 'Task',
          description: 'Desc',
          status: 'todo',
          priority: 'low',
          tags: [],
          createdAt: '2025-01-01',
        },
      ];

      render(
        <TaskFilter
          onFiltersChange={mockOnFiltersChange}
          tasks={tasksWithoutTags}
        />
      );

      expect(screen.queryByText(/^Tags/i)).toBeNull();
    });

    it('should display unique tags from all tasks', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Tags/i));

      expect(screen.getByText('#api')).toBeDefined();
      expect(screen.getByText('#backend')).toBeDefined();
      expect(screen.getByText('#documentation')).toBeDefined();
      expect(screen.getByText('#frontend')).toBeDefined();
      expect(screen.getByText('#urgent')).toBeDefined();
    });

    it('should toggle tag selection', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Tags/i));
      fireEvent.click(screen.getByText('#api'));

      // Wait for debounced callback
      await waitFor(
        () => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ tags: ['api'] })
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe('Date Range Filter', () => {
    it('should render date range filter section', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );
      expect(screen.getByText(/^Date Range/i)).toBeDefined();
    });

    it('should expand date range filter when clicked', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Date Range/i));

      expect(screen.getByText('Created Date')).toBeDefined();
      expect(screen.getByText('Due Date')).toBeDefined();
    });

    it('should allow setting date range type', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Date Range/i));
      fireEvent.click(screen.getByText('Created Date'));

      // Wait for debounced callback
      await waitFor(
        () => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
              dateRange: expect.objectContaining({ type: 'created' }),
            })
          );
        },
        { timeout: 500 }
      );
    });

    it('should show clear date range button when date is set', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Date Range/i));
      fireEvent.click(screen.getByText('Created Date'));

      expect(screen.getByText('Clear Date Range')).toBeDefined();
    });
  });

  describe('Filter Presets', () => {
    it('should render presets section', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );
      expect(screen.getByText(/^Saved Presets/i)).toBeDefined();
    });

    it('should show save preset button when expanded', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Saved Presets/i));

      expect(screen.getByText('+ Save Current Filters')).toBeDefined();
    });

    it('should open dialog when save preset is clicked', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Saved Presets/i));
      fireEvent.click(screen.getByText('+ Save Current Filters'));

      expect(screen.getByText('Save Filter Preset')).toBeDefined();
      expect(screen.getByPlaceholderText('Enter preset name...')).toBeDefined();
    });

    it('should save preset to localStorage', () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Saved Presets/i));
      fireEvent.click(screen.getByText('+ Save Current Filters'));

      const input = screen.getByPlaceholderText('Enter preset name...');
      fireEvent.change(input, { target: { value: 'My Preset' } });

      fireEvent.click(screen.getByText('Save'));

      const stored = localStorage.getItem('task-filter-presets');
      expect(stored).toBeTruthy();

      const presets = JSON.parse(stored!);
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('My Preset');
    });
  });

  describe('Clear All Filters', () => {
    it('should show active filter count', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Status/));
      fireEvent.click(screen.getByText('To Do'));

      // Wait for filter count to update
      await waitFor(
        () => {
          expect(screen.getByText(/1 active/i)).toBeDefined();
        },
        { timeout: 500 }
      );
    });

    it('should show Clear All button when filters are active', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      fireEvent.click(screen.getByText(/^Status/));
      fireEvent.click(screen.getByText('To Do'));

      // Wait for Clear All button to appear
      await waitFor(
        () => {
          expect(screen.getByText('Clear All')).toBeDefined();
        },
        { timeout: 500 }
      );
    });

    it('should clear all filters when Clear All is clicked', async () => {
      render(
        <TaskFilter onFiltersChange={mockOnFiltersChange} tasks={mockTasks} />
      );

      // Set some filters
      fireEvent.click(screen.getByText(/^Status/));
      fireEvent.click(screen.getByText('To Do'));

      await waitFor(
        () => {
          expect(screen.getByText('Clear All')).toBeDefined();
        },
        { timeout: 500 }
      );

      mockOnFiltersChange.mockClear();
      // Clear all
      fireEvent.click(screen.getByText('Clear All'));

      await waitFor(
        () => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
              statuses: [],
              priorities: [],
              tags: [],
            })
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe('Task Count Display', () => {
    it('should display task count when provided', () => {
      render(
        <TaskFilter
          onFiltersChange={mockOnFiltersChange}
          tasks={mockTasks}
          taskCount={5}
        />
      );

      expect(screen.getByText('Showing 5 tasks')).toBeDefined();
    });

    it('should display singular "task" for count of 1', () => {
      render(
        <TaskFilter
          onFiltersChange={mockOnFiltersChange}
          tasks={mockTasks}
          taskCount={1}
        />
      );

      expect(screen.getByText('Showing 1 task')).toBeDefined();
    });

    it('should display "No tasks found" when count is 0', () => {
      render(
        <TaskFilter
          onFiltersChange={mockOnFiltersChange}
          tasks={mockTasks}
          taskCount={0}
        />
      );

      expect(screen.getByText('No tasks found')).toBeDefined();
    });
  });
});
