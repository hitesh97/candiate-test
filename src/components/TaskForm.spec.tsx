import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TaskForm } from './TaskForm';
import { Task } from '../types/task';

describe('TaskForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
  });

  it('should render all form fields', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeDefined();
    expect(screen.getByLabelText(/description/i)).toBeDefined();
    expect(screen.getByLabelText(/status/i)).toBeDefined();
    expect(screen.getByLabelText(/priority/i)).toBeDefined();
    expect(screen.getByLabelText(/due date/i)).toBeDefined();
    expect(screen.getByLabelText(/tags/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /add task/i })).toBeDefined();
  });

  it('should render submit button with "Add Task" text when no initialTask', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /add task/i })).toBeDefined();
  });

  it('should render submit button with "Update Task" text when initialTask provided', () => {
    const initialTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'high',
      createdAt: new Date().toISOString(),
      tags: [],
    };

    render(<TaskForm onSubmit={mockOnSubmit} initialTask={initialTask} />);

    expect(screen.getByRole('button', { name: /update task/i })).toBeDefined();
  });

  it('should render cancel button when onCancel is provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
  });

  it('should not render cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
  });

  it('should initialize form with default values', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement;
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    const prioritySelect = screen.getByLabelText(
      /priority/i
    ) as HTMLSelectElement;
    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;

    expect(titleInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
    expect(statusSelect.value).toBe('todo');
    expect(prioritySelect.value).toBe('medium');
    expect(dueDateInput.value).toBe('');
  });

  it('should initialize form with initialTask values', () => {
    const initialTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-12-25',
      createdAt: new Date().toISOString(),
      tags: [],
    };

    render(<TaskForm onSubmit={mockOnSubmit} initialTask={initialTask} />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement;
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    const prioritySelect = screen.getByLabelText(
      /priority/i
    ) as HTMLSelectElement;
    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;

    expect(titleInput.value).toBe('Test Task');
    expect(descriptionInput.value).toBe('Test Description');
    expect(statusSelect.value).toBe('in-progress');
    expect(prioritySelect.value).toBe('high');
    expect(dueDateInput.value).toBe('2025-12-25');
  });

  it('should update title field when typing', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.type(titleInput, 'New Task');

    expect(titleInput.value).toBe('New Task');
  });

  it('should update description field when typing', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement;
    await user.type(descriptionInput, 'New Description');

    expect(descriptionInput.value).toBe('New Description');
  });

  it('should update status when selecting different option', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'done' } });

    expect(statusSelect.value).toBe('done');
  });

  it('should update priority when selecting different option', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const prioritySelect = screen.getByLabelText(
      /priority/i
    ) as HTMLSelectElement;
    fireEvent.change(prioritySelect, { target: { value: 'low' } });

    expect(prioritySelect.value).toBe('low');
  });

  it('should update due date when changed', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31' } });

    expect(dueDateInput.value).toBe('2025-12-31');
  });

  it('should call onSubmit with form data when submitted with valid title', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'medium',
      dueDate: undefined,
      tags: [],
    });
  });

  it('should trim whitespace from title and description on submit', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, '  Test Task  ');
    await user.type(descriptionInput, '  Test Description  ');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Task',
        description: 'Test Description',
      })
    );
  });

  it('should not call onSubmit when title is empty', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Title is required');

    alertSpy.mockRestore();
  });

  it('should not call onSubmit when title contains only whitespace', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, '   ');
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Title is required');

    alertSpy.mockRestore();
  });

  it('should submit with all field values including optional due date', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Complete Task');
    await user.type(descriptionInput, 'Full Description');
    fireEvent.change(statusSelect, { target: { value: 'in-progress' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-12-25' } });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Complete Task',
      description: 'Full Description',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-12-25',
      tags: [],
    });
  });

  it('should reset form fields after successful submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement;
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    const prioritySelect = screen.getByLabelText(
      /priority/i
    ) as HTMLSelectElement;
    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test Description');
    fireEvent.change(statusSelect, { target: { value: 'done' } });
    fireEvent.change(prioritySelect, { target: { value: 'low' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-12-25' } });
    await user.click(submitButton);

    // Verify form was reset to default values
    expect(titleInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
    expect(statusSelect.value).toBe('todo');
    expect(prioritySelect.value).toBe('medium');
    expect(dueDateInput.value).toBe('');
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should have all status options available', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const statusSelect = screen.getByLabelText(/status/i);
    const options = Array.from(statusSelect.querySelectorAll('option'));

    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('todo');
    expect(options[1].value).toBe('in-progress');
    expect(options[2].value).toBe('done');
  });

  it('should have all priority options available', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const prioritySelect = screen.getByLabelText(/priority/i);
    const options = Array.from(prioritySelect.querySelectorAll('option'));

    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('low');
    expect(options[1].value).toBe('medium');
    expect(options[2].value).toBe('high');
  });

  it('should set dueDate to undefined when empty string', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Task without due date');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: undefined,
      })
    );
  });

  it('should render tags input field with placeholder', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement;
    expect(tagsInput).toBeDefined();
    expect(tagsInput.placeholder).toBe('Type a tag and press Enter');
  });

  it('should add a tag when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i);
    await user.type(tagsInput, 'urgent');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#urgent')).toBeDefined();
  });

  it('should add multiple tags', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i);

    await user.type(tagsInput, 'urgent');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.type(tagsInput, 'bug');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.type(tagsInput, 'frontend');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#urgent')).toBeDefined();
    expect(screen.getByText('#bug')).toBeDefined();
    expect(screen.getByText('#frontend')).toBeDefined();
  });

  it('should clear tag input after adding a tag', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement;
    await user.type(tagsInput, 'test');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    expect(tagsInput.value).toBe('');
  });

  it('should not add empty or whitespace-only tags', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i);

    await user.type(tagsInput, '   ');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    expect(screen.queryByText(/#/)).toBeNull();
  });

  it('should not add duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i);

    await user.type(tagsInput, 'urgent');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.type(tagsInput, 'urgent');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    const urgentTags = screen.getAllByText('#urgent');
    expect(urgentTags).toHaveLength(1);
  });

  it('should remove a tag when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i);
    await user.type(tagsInput, 'removeme');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#removeme')).toBeDefined();

    const removeButton = screen.getByLabelText('Remove tag removeme');
    await user.click(removeButton);

    expect(screen.queryByText('#removeme')).toBeNull();
  });

  it('should remove correct tag when multiple tags exist', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i);

    await user.type(tagsInput, 'first');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.type(tagsInput, 'second');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.type(tagsInput, 'third');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    const removeSecondButton = screen.getByLabelText('Remove tag second');
    await user.click(removeSecondButton);

    expect(screen.getByText('#first')).toBeDefined();
    expect(screen.queryByText('#second')).toBeNull();
    expect(screen.getByText('#third')).toBeDefined();
  });

  it('should include tags in form submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const tagsInput = screen.getByLabelText(/tags/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Task with tags');

    await user.type(tagsInput, 'urgent');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.type(tagsInput, 'bug');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Task with tags',
        tags: ['urgent', 'bug'],
      })
    );
  });

  it('should submit with empty tags array when no tags added', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Task without tags');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [],
      })
    );
  });

  it('should reset tags after form submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const tagsInput = screen.getByLabelText(/tags/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Test Task');
    await user.type(tagsInput, 'test');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#test')).toBeDefined();

    await user.click(submitButton);

    expect(screen.queryByText('#test')).toBeNull();
  });

  it('should initialize with tags from initialTask', () => {
    const initialTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: ['existing', 'tags'],
    };

    render(<TaskForm onSubmit={mockOnSubmit} initialTask={initialTask} />);

    expect(screen.getByText('#existing')).toBeDefined();
    expect(screen.getByText('#tags')).toBeDefined();
  });

  it('should not add tag when other keys are pressed', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement;
    await user.type(tagsInput, 'test');
    fireEvent.keyDown(tagsInput, { key: 'Space', code: 'Space' });

    expect(screen.queryByText('#test')).toBeNull();
    expect(tagsInput.value).toBe('test');
  });

  it('should trim whitespace from tags before adding', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const tagsInput = screen.getByLabelText(/tags/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'Test');
    await user.type(tagsInput, '  spaced  ');
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['spaced'],
      })
    );
  });
});
