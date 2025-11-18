import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import { Task } from '../types/task';

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task description',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-12-25',
    createdAt: '2025-11-18T10:00:00.000Z',
    tags: ['testing', 'important'],
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  it('should render task title and description', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeDefined();
    expect(screen.getByText('This is a test task description')).toBeDefined();
  });

  it('should render priority badge with correct color', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const priorityBadge = screen.getByText('high');
    expect(priorityBadge).toBeDefined();
    expect(priorityBadge.className).toContain('bg-red-100');
    expect(priorityBadge.className).toContain('text-red-800');
  });

  it('should render status badge with correct color', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const statusBadge = screen.getByText('todo');
    expect(statusBadge).toBeDefined();
    expect(statusBadge.className).toContain('bg-gray-100');
    expect(statusBadge.className).toContain('text-gray-800');
  });

  it('should render formatted due date', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // The date format will be "25 Dec 2025" with en-GB locale
    expect(screen.getByText(/Due:/)).toBeDefined();
    expect(screen.getByText(/25 Dec 2025/)).toBeDefined();
  });

  it('should render formatted created date', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Created:/)).toBeDefined();
    expect(screen.getByText(/18 Nov 2025/)).toBeDefined();
  });

  it('should render "No due date" when dueDate is undefined', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined };
    render(
      <TaskCard
        task={taskWithoutDueDate}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/No due date/)).toBeDefined();
  });

  it('should render tags', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('#testing')).toBeDefined();
    expect(screen.getByText('#important')).toBeDefined();
  });

  it('should not render tags section when tags array is empty', () => {
    const taskWithoutTags = { ...mockTask, tags: [] };
    render(
      <TaskCard
        task={taskWithoutTags}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText(/#/)).toBeNull();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should call onUpdate with next status when change status button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const changeStatusButton = screen.getByRole('button', {
      name: /change status/i,
    });
    await user.click(changeStatusButton);

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'in-progress' });
  });

  it('should cycle through all statuses correctly', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const changeStatusButton = screen.getByRole('button', {
      name: /change status/i,
    });

    // Click 1: todo -> in-progress
    await user.click(changeStatusButton);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'in-progress' });

    // Update task status and rerender
    const inProgressTask = { ...mockTask, status: 'in-progress' as const };
    rerender(
      <TaskCard
        task={inProgressTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Click 2: in-progress -> done
    await user.click(changeStatusButton);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'done' });

    // Update task status and rerender
    const doneTask = { ...mockTask, status: 'done' as const };
    rerender(
      <TaskCard
        task={doneTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Click 3: done -> todo (cycles back)
    await user.click(changeStatusButton);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'todo' });
  });

  it('should render medium priority with correct color', () => {
    const mediumPriorityTask = { ...mockTask, priority: 'medium' as const };
    render(
      <TaskCard
        task={mediumPriorityTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const priorityBadge = screen.getByText('medium');
    expect(priorityBadge.className).toContain('bg-yellow-100');
    expect(priorityBadge.className).toContain('text-yellow-800');
  });

  it('should render low priority with correct color', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' as const };
    render(
      <TaskCard
        task={lowPriorityTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const priorityBadge = screen.getByText('low');
    expect(priorityBadge.className).toContain('bg-green-100');
    expect(priorityBadge.className).toContain('text-green-800');
  });

  it('should render in-progress status with correct color', () => {
    const inProgressTask = { ...mockTask, status: 'in-progress' as const };
    render(
      <TaskCard
        task={inProgressTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const statusBadge = screen.getByText('in-progress');
    expect(statusBadge.className).toContain('bg-blue-100');
    expect(statusBadge.className).toContain('text-blue-800');
  });

  it('should render done status with correct color', () => {
    const doneTask = { ...mockTask, status: 'done' as const };
    render(
      <TaskCard
        task={doneTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const statusBadge = screen.getByText('done');
    expect(statusBadge.className).toContain('bg-green-100');
    expect(statusBadge.className).toContain('text-green-800');
  });
});
