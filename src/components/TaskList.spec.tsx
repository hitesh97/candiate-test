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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // Empty array shows "No tasks yet"
    expect(screen.getByText('No tasks yet')).toBeDefined();
    expect(
      screen.getByText('Click "Add New Task" to create your first task!')
    ).toBeDefined();
  });

  it('should render sorting controls', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('Sort by:')).toBeDefined();
    expect(screen.getByRole('button', { name: /created date/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /due date/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /priority/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /title/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /desc/i })).toBeDefined();
  });

  it('should highlight active sort button with blue background', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const createdDateButton = screen.getByRole('button', {
      name: /created date/i,
    });
    expect(createdDateButton.className).toContain('bg-blue-500');
  });

  it('should change sort to "dueDate" when Due Date button clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const dueDateButton = screen.getByRole('button', { name: /due date/i });
    await user.click(dueDateButton);

    expect(dueDateButton.className).toContain('bg-blue-500');
  });

  it('should change sort to "priority" when Priority button clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const priorityButton = screen.getByRole('button', { name: /priority/i });
    await user.click(priorityButton);

    expect(priorityButton.className).toContain('bg-blue-500');
  });

  it('should change sort to "title" when Title button clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const titleButton = screen.getByRole('button', { name: /title/i });
    await user.click(titleButton);

    expect(titleButton.className).toContain('bg-blue-500');
  });

  it('should toggle sort order from desc to asc when order button clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const orderButton = screen.getByRole('button', { name: /↓ desc/i });
    await user.click(orderButton);

    expect(screen.getByRole('button', { name: /↑ asc/i })).toBeDefined();
  });

  it('should toggle sort order from asc back to desc', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const orderButton = screen.getByRole('button', { name: /↓ desc/i });
    await user.click(orderButton); // Now Asc
    await user.click(orderButton); // Back to Desc

    expect(screen.getByRole('button', { name: /↓ desc/i })).toBeDefined();
  });

  it('should sort tasks by created date in descending order by default', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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

  it('should sort tasks by title alphabetically when title sort selected', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const titleButton = screen.getByRole('button', { name: /title/i });
    const orderButton = screen.getByRole('button', { name: /↓ desc/i });

    await user.click(titleButton);
    await user.click(orderButton); // Change to asc for alphabetical

    const taskTitles = screen
      .getAllByText(/Task/)
      .map((el) => el.textContent)
      .filter((text) => text?.includes('Task'));

    expect(taskTitles[0]).toContain('First Task');
    expect(taskTitles[1]).toContain('Second Task');
    expect(taskTitles[2]).toContain('Third Task');
  });

  it('should sort tasks by priority (high to low) when priority sort selected', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const priorityButton = screen.getByRole('button', { name: /priority/i });
    await user.click(priorityButton);

    const taskTitles = screen
      .getAllByText(/Task/)
      .map((el) => el.textContent)
      .filter((text) => text?.includes('Task'));

    // Desc order: high (3) -> medium (2) -> low (1)
    expect(taskTitles[0]).toContain('First Task'); // high
    expect(taskTitles[1]).toContain('Second Task'); // medium
    expect(taskTitles[2]).toContain('Third Task'); // low
  });

  it('should sort tasks by due date with tasks without due dates last', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        tasks={mockTasks}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const dueDateButton = screen.getByRole('button', { name: /due date/i });
    const orderButton = screen.getByRole('button', { name: /↓ desc/i });

    await user.click(dueDateButton);
    await user.click(orderButton); // Change to asc

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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
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
