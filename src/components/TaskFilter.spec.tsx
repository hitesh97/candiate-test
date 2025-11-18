import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TaskFilter } from './TaskFilter';

describe('TaskFilter', () => {
  let mockOnFilterChange: ReturnType<typeof vi.fn>;
  let mockOnSearchChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnFilterChange = vi.fn();
    mockOnSearchChange = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    expect(searchInput).toBeDefined();
    expect(searchInput.tagName).toBe('INPUT');
  });

  it('should render all filter buttons', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    expect(screen.getByRole('button', { name: /all tasks/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /todo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /in progress/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /done/i })).toBeDefined();
  });

  it('should highlight active filter button', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
        activeFilter="todo"
      />
    );

    const todoButton = screen.getByRole('button', { name: /todo/i });
    expect(todoButton.className).toContain('bg-blue-500');
    expect(todoButton.className).toContain('text-white');
  });

  it('should highlight "All Tasks" button when activeFilter is "all"', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
        activeFilter="all"
      />
    );

    const allButton = screen.getByRole('button', { name: /all tasks/i });
    expect(allButton.className).toContain('bg-blue-500');
    expect(allButton.className).toContain('text-white');
  });

  it('should apply inactive styles to non-active filter buttons', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
        activeFilter="todo"
      />
    );

    const allButton = screen.getByRole('button', { name: /all tasks/i });
    expect(allButton.className).toContain('bg-gray-200');
    expect(allButton.className).toContain('text-gray-700');
  });

  it('should call onFilterChange when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const todoButton = screen.getByRole('button', { name: /todo/i });
    await user.click(todoButton);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith('todo');
  });

  it('should call onFilterChange with "in-progress" when In Progress button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const inProgressButton = screen.getByRole('button', {
      name: /in progress/i,
    });
    await user.click(inProgressButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('in-progress');
  });

  it('should call onFilterChange with "done" when Done button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const doneButton = screen.getByRole('button', { name: /done/i });
    await user.click(doneButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('done');
  });

  it('should call onFilterChange with "all" when All Tasks button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const allButton = screen.getByRole('button', { name: /all tasks/i });
    await user.click(allButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('should update search input value when typing', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'test query');

    expect((searchInput as HTMLInputElement).value).toBe('test query');
  });

  it('should debounce search and call onSearchChange after 300ms', async () => {
    vi.useFakeTimers();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search tasks...'
    ) as HTMLInputElement;

    // Use fireEvent which properly triggers React onChange
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should not be called immediately
    expect(mockOnSearchChange).not.toHaveBeenCalled();

    // Fast-forward time by 300ms
    await vi.advanceTimersByTimeAsync(300);

    // Should be called after debounce delay
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith('test');

    vi.useRealTimers();
  });

  it('should cancel previous debounce timer when typing rapidly', async () => {
    vi.useFakeTimers();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search tasks...'
    ) as HTMLInputElement;

    // Type first character
    fireEvent.change(searchInput, { target: { value: 't' } });
    await vi.advanceTimersByTimeAsync(100);

    // Type second character before debounce completes
    fireEvent.change(searchInput, { target: { value: 'te' } });
    await vi.advanceTimersByTimeAsync(100);

    // Type third character
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    await vi.advanceTimersByTimeAsync(100);

    // At this point, only 300ms total, but multiple inputs
    expect(mockOnSearchChange).not.toHaveBeenCalled();

    // Complete the debounce delay from last input
    await vi.advanceTimersByTimeAsync(200);

    // Should only be called once with the final value
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith('tes');

    vi.useRealTimers();
  });

  it('should call onSearchChange with empty string when search is cleared', async () => {
    vi.useFakeTimers();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search tasks...'
    ) as HTMLInputElement;

    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await vi.advanceTimersByTimeAsync(300);
    expect(mockOnSearchChange).toHaveBeenCalledWith('test');

    // Clear the input
    fireEvent.change(searchInput, { target: { value: '' } });
    await vi.advanceTimersByTimeAsync(300);

    expect(mockOnSearchChange).toHaveBeenCalledWith('');

    vi.useRealTimers();
  });

  it('should default activeFilter to "all" when not provided', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const allButton = screen.getByRole('button', { name: /all tasks/i });
    expect(allButton.className).toContain('bg-blue-500');
  });

  it('should handle multiple filter changes', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    // Click todo
    await user.click(screen.getByRole('button', { name: /todo/i }));
    expect(mockOnFilterChange).toHaveBeenCalledWith('todo');

    // Click in-progress
    await user.click(screen.getByRole('button', { name: /in progress/i }));
    expect(mockOnFilterChange).toHaveBeenCalledWith('in-progress');

    // Click done
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(mockOnFilterChange).toHaveBeenCalledWith('done');

    expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
  });
});
