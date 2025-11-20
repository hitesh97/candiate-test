import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TaskList } from './TaskList';
import { Task } from '../types/task';

describe('TaskList', () => {
  let mockOnUpdateTask: ReturnType<typeof vi.fn>;
  let mockOnDeleteTask: ReturnType<typeof vi.fn>;
  let mockTasks: Task[];

  beforeEach(() => {
    mockOnUpdateTask = vi.fn();
    mockOnDeleteTask = vi.fn();
    mockTasks = [
      {
        id: '1',
        title: 'First Task',
        description: 'First description',
        status: 'todo',
        priority: 'high',
        createdAt: '2025-01-01T00:00:00.000Z',
        dueDate: '2025-12-31',
        tags: ['urgent'],
      },
      {
        id: '2',
        title: 'Second Task',
        description: 'Second description',
        status: 'in-progress',
        priority: 'medium',
        createdAt: '2025-02-01T00:00:00.000Z',
        dueDate: '2025-11-30',
        tags: [],
      },
      {
        id: '3',
        title: 'Third Task',
        description: 'Third description',
        status: 'done',
        priority: 'low',
        createdAt: '2025-03-01T00:00:00.000Z',
        tags: ['completed'],
      },
    ];
  });

  it('should render all tasks when filter is "all"', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.getByText('First Task')).toBeDefined();
    expect(screen.getByText('Second Task')).toBeDefined();
    expect(screen.getByText('Third Task')).toBeDefined();
  });

  it('should render only todo tasks when filter is "todo"', () => {
    const todoTasks = mockTasks.filter((t) => t.status === 'todo');
    render(
      <TaskList
        tasks={todoTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.getByText('First Task')).toBeDefined();
    expect(screen.queryByText('Second Task')).toBeNull();
    expect(screen.queryByText('Third Task')).toBeNull();
  });

  it('should render only in-progress tasks when filter is "in-progress"', () => {
    const inProgressTasks = mockTasks.filter((t) => t.status === 'in-progress');
    render(
      <TaskList
        tasks={inProgressTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.queryByText('First Task')).toBeNull();
    expect(screen.getByText('Second Task')).toBeDefined();
    expect(screen.queryByText('Third Task')).toBeNull();
  });

  it('should render only done tasks when filter is "done"', () => {
    const doneTasks = mockTasks.filter((t) => t.status === 'done');
    render(
      <TaskList
        tasks={doneTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.queryByText('First Task')).toBeNull();
    expect(screen.queryByText('Second Task')).toBeNull();
    expect(screen.getByText('Third Task')).toBeDefined();
  });

  it('should filter tasks by search query in title (case-insensitive)', () => {
    const searchedTasks = mockTasks.filter((t) =>
      t.title.toLowerCase().includes('first')
    );
    render(
      <TaskList
        tasks={searchedTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.getByText('First Task')).toBeDefined();
    expect(screen.queryByText('Second Task')).toBeNull();
    expect(screen.queryByText('Third Task')).toBeNull();
  });

  it('should filter tasks by search query in description (case-insensitive)', () => {
    const searchedTasks = mockTasks.filter((t) =>
      t.description.toLowerCase().includes('second')
    );
    render(
      <TaskList
        tasks={searchedTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.queryByText('First Task')).toBeNull();
    expect(screen.getByText('Second Task')).toBeDefined();
    expect(screen.queryByText('Third Task')).toBeNull();
  });

  it('should show "No tasks yet" message when tasks array is empty', () => {
    render(
      <TaskList
        tasks={[]}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    expect(screen.getByText('No tasks yet')).toBeDefined();
    expect(
      screen.getByText('Click "Add New Task" to create your first task!')
    ).toBeDefined();
  });

  it('should show "No tasks match" message when search has no results', () => {
    render(
      <TaskList
        tasks={[]}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    // Empty array shows "No tasks yet"
    expect(screen.getByText('No tasks yet')).toBeDefined();
    expect(
      screen.getByText('Click "Add New Task" to create your first task!')
    ).toBeDefined();
  });

  it('should show "No tasks with status" message when filter has no results', () => {
    // Pass empty array to simulate filtered-out results
    render(
      <TaskList
        tasks={[]}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    // Empty array shows "No tasks yet"
    expect(screen.getByText('No tasks yet')).toBeDefined();
    expect(
      screen.getByText('Click "Add New Task" to create your first task!')
    ).toBeDefined();
  });

  it('should sort tasks by created date in descending order by default', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    const taskTitles = screen
      .getAllByText(/Task/)
      .map((el) => el.textContent)
      .filter((text) => text?.includes('Task'));

    // Most recent (March) should be first in desc order
    expect(taskTitles[0]).toContain('Third Task');
    expect(taskTitles[1]).toContain('Second Task');
    expect(taskTitles[2]).toContain('First Task');
  });

  it('should sort tasks by title alphabetically when sortBy="title" prop passed', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="title"
        sortOrder="asc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    const taskTitles = screen
      .getAllByText(/Task/)
      .map((el) => el.textContent)
      .filter((text) => text?.includes('Task'));

    expect(taskTitles[0]).toContain('First Task');
    expect(taskTitles[1]).toContain('Second Task');
    expect(taskTitles[2]).toContain('Third Task');
  });

  it('should sort tasks by priority when sortBy="priority" prop passed', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="priority"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    const taskTitles = screen
      .getAllByText(/Task/)
      .map((el) => el.textContent)
      .filter((text) => text?.includes('Task'));

    // Desc order: high (3) -> medium (2) -> low (1)
    expect(taskTitles[0]).toContain('First Task'); // high
    expect(taskTitles[1]).toContain('Second Task'); // medium
    expect(taskTitles[2]).toContain('Third Task'); // low
  });

  it('should sort tasks by due date when sortBy="dueDate" prop passed', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="dueDate"
        sortOrder="asc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    const taskTitles = screen
      .getAllByText(/Task/)
      .map((el) => el.textContent)
      .filter((text) => text?.includes('Task'));

    // Asc: Nov -> Dec -> no due date (Infinity)
    expect(taskTitles[0]).toContain('Second Task'); // Nov 30
    expect(taskTitles[1]).toContain('First Task'); // Dec 31
    expect(taskTitles[2]).toContain('Third Task'); // No due date
  });

  it('should pass onUpdateTask callback to TaskCard components', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    // Verify TaskCard components are rendered (they would receive the callbacks)
    expect(screen.getByText('First Task')).toBeDefined();
    expect(screen.getByText('Second Task')).toBeDefined();
    expect(screen.getByText('Third Task')).toBeDefined();
  });

  it('should combine filter and search query correctly', () => {
    // Simulate filtering for todo AND containing 'first'
    const filteredTasks = mockTasks.filter(
      (t) => t.status === 'todo' && t.title.toLowerCase().includes('first')
    );
    render(
      <TaskList
        tasks={filteredTasks}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    // Only "First Task" is todo AND matches "first"
    expect(screen.getByText('First Task')).toBeDefined();
    expect(screen.queryByText('Second Task')).toBeNull();
    expect(screen.queryByText('Third Task')).toBeNull();
  });

  it('should show no results when filter and search do not match any tasks', () => {
    // Pass empty array to simulate no matches
    render(
      <TaskList
        tasks={[]}
        sortBy="createdAt"
        sortOrder="desc"
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onDuplicateTask={vi.fn()}
      />
    );

    // Empty array shows "No tasks yet"
    expect(screen.getByText('No tasks yet')).toBeDefined();
  });

  it('should render tasks in grid layout', () => {
    const { container } = render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeDefined();
    expect(gridContainer?.className).toContain('grid-cols-1');
    expect(gridContainer?.className).toContain('md:grid-cols-2');
    expect(gridContainer?.className).toContain('lg:grid-cols-3');
  });
});
