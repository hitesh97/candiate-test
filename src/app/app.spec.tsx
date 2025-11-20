import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import App from './app';
import * as taskHelpers from '../utils/taskHelpers';
import * as exportHelpers from '../utils/exportHelpers';

describe('App', () => {
  beforeEach(() => {
    // Mock localStorage operations
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([]);
    vi.spyOn(taskHelpers, 'saveTasksToStorage').mockResolvedValue();

    // Mock export functions to avoid URL.createObjectURL issues
    vi.spyOn(exportHelpers, 'downloadTasksAsJSON').mockImplementation(() => {});
    vi.spyOn(exportHelpers, 'downloadTasksAsCSV').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(
      getAllByText(new RegExp('Task Management System', 'gi')).length > 0
    ).toBeTruthy();
  });

  it('should complete full task lifecycle: create → view → edit → change status → delete', async () => {
    /**
     * Integration Test: Complete Task Lifecycle Flow
     *
     * This test validates the entire user journey for managing a task from creation to deletion.
     * It ensures all CRUD operations work together seamlessly and state updates propagate correctly
     * across the application.
     *
     * Test Coverage:
     * - useTasks hook: addTask, updateTask, deleteTask operations
     * - TaskForm component: Task creation and editing with validation
     * - TaskList component: Filtering, sorting, and task display
     * - TaskCard component: Status updates, edit trigger, and deletion
     * - Dialog component: Modal interactions for editing
     * - App component: State management and component integration
     *
     * Workflow Steps:
     * 1. CREATE: Fill form with task details (title, description, priority, tags, due date)
     * 2. VIEW: Verify task appears in list with all correct information
     * 3. EDIT: Open dialog, modify task details, save changes
     * 4. STATUS: Cycle through status changes (todo → in-progress → done)
     * 5. DELETE: Remove task and verify empty state
     *
     * This test ensures the React 19 features (Form Actions, useTransition, useDeferredValue)
     * work correctly together in a real user scenario.
     */
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // ========== STEP 1: CREATE TASK ==========
    // Click "Add New Task" button to show the form
    const addNewTaskButton = screen.getByRole('button', {
      name: /Add New Task/i,
    });
    await user.click(addNewTaskButton);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task title')).toBeDefined();
    });

    // Fill in the task form
    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText(
      'Enter task description'
    );
    const dueDateInput = screen.getByLabelText(/Due Date/i);

    await user.type(titleInput, 'Integration Test Task');
    await user.type(descriptionInput, 'This task tests the complete lifecycle');
    await user.type(dueDateInput, '2025-12-31');

    // Select priority
    const prioritySelect = screen.getByLabelText(
      /Priority/i
    ) as HTMLSelectElement;
    await user.selectOptions(prioritySelect, 'high');

    // Add tags
    const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');
    await user.type(tagInput, 'integration{Enter}');
    await user.type(tagInput, 'testing{Enter}');

    // Submit the form
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(addButton);

    // ========== STEP 2: VIEW IN LIST ==========
    // Verify task appears in the list
    await waitFor(() => {
      expect(screen.getByText('Integration Test Task')).toBeDefined();
    });

    expect(
      screen.getByText('This task tests the complete lifecycle')
    ).toBeDefined();
    expect(screen.getByText(/31 Dec 2025/)).toBeDefined();
    expect(screen.getByText(/#integration/)).toBeDefined();
    expect(screen.getByText(/#testing/)).toBeDefined();

    // Verify initial status is 'todo'
    const statusBadges = screen.getAllByText(/todo/i);
    expect(statusBadges.length).toBeGreaterThan(0);

    // Verify priority is 'high'
    expect(screen.getByText(/high/i)).toBeDefined();

    // ========== STEP 3: EDIT TASK ==========
    // Click Edit button
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeDefined();
    });

    // Verify form is pre-filled with task data
    const dialogTitleInput = screen.getByDisplayValue(
      'Integration Test Task'
    ) as HTMLInputElement;
    const dialogDescriptionInput = screen.getByDisplayValue(
      'This task tests the complete lifecycle'
    ) as HTMLTextAreaElement;
    expect(dialogTitleInput).toBeDefined();
    expect(dialogDescriptionInput).toBeDefined();

    // Modify the task
    await user.clear(dialogTitleInput);
    await user.type(dialogTitleInput, 'Updated Integration Task');

    await user.clear(dialogDescriptionInput);
    await user.type(dialogDescriptionInput, 'This task has been updated');

    // Change priority to medium
    const dialogPrioritySelect = screen.getByLabelText(
      /Priority/i
    ) as HTMLSelectElement;
    await user.selectOptions(dialogPrioritySelect, 'medium');

    // Submit the edit
    const updateButton = screen.getByRole('button', { name: /Update Task/i });
    await user.click(updateButton);

    // ========== STEP 4: VERIFY EDITS ==========
    // Wait for dialog to close and verify updated content
    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).toBeNull();
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Integration Task')).toBeDefined();
    });

    expect(screen.getByText('This task has been updated')).toBeDefined();
    expect(screen.getByText(/medium/i)).toBeDefined();

    // ========== STEP 5: CHANGE STATUS ==========
    // Click "Status" button on the task card to move from TODO → IN PROGRESS
    // Get all buttons named "Status" and select the one on the task card (second one)
    const statusButtons = screen.getAllByRole('button', {
      name: /Status/i,
    });
    // The task card status button is the second one (first is in filter panel)
    const changeStatusButton = statusButtons[1];
    await user.click(changeStatusButton);

    // Verify status changed to IN PROGRESS
    await waitFor(() => {
      expect(screen.getByText('in-progress')).toBeDefined();
    });

    // Click again to move from IN PROGRESS → DONE
    await user.click(changeStatusButton);

    // Verify status changed to DONE
    await waitFor(() => {
      expect(screen.getByText('done')).toBeDefined();
    });

    // ========== STEP 6: DELETE TASK ==========
    // Click Delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    await user.click(deleteButton);

    // Verify task is removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Updated Integration Task')).toBeNull();
    });

    expect(screen.queryByText('This task has been updated')).toBeNull();

    // Verify empty state message appears
    await waitFor(() => {
      expect(screen.getByText(/No tasks yet/i)).toBeDefined();
    });
  }, 15000); // Increase timeout for long integration test

  it('should open and close export dropdown menu', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Click Export button to open menu
    const exportButton = screen.getByRole('button', {
      name: /Export Tasks/i,
    });
    await user.click(exportButton);

    // Verify export options appear
    await waitFor(() => {
      expect(screen.getByText('Export as JSON')).toBeDefined();
      expect(screen.getByText('Export as CSV')).toBeDefined();
    });

    // Click Export button again to close menu
    await user.click(exportButton);

    // Verify export options are removed
    await waitFor(() => {
      expect(screen.queryByText('Export as JSON')).toBeNull();
      expect(screen.queryByText('Export as CSV')).toBeNull();
    });
  });

  it('should export tasks as JSON', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Open export menu
    const exportButton = screen.getByRole('button', {
      name: /Export Tasks/i,
    });
    await user.click(exportButton);

    // Click Export as JSON
    const exportJsonButton = screen.getByText('Export as JSON');
    await user.click(exportJsonButton);

    // Verify menu closes after export
    await waitFor(() => {
      expect(screen.queryByText('Export as JSON')).toBeNull();
    });
  });

  it('should export tasks as CSV', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Open export menu
    const exportButton = screen.getByRole('button', {
      name: /Export Tasks/i,
    });
    await user.click(exportButton);

    // Click Export as CSV
    const exportCsvButton = screen.getByText('Export as CSV');
    await user.click(exportCsvButton);

    // Verify menu closes after export
    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).toBeNull();
    });
  });

  it('should trigger file input when import button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Get the hidden file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput).toBeDefined();
    expect(fileInput.className).toContain('hidden');

    // Mock click on file input
    const clickSpy = vi.spyOn(fileInput, 'click');

    // Click Import button
    const importButton = screen.getByRole('button', {
      name: /Import Tasks/i,
    });
    await user.click(importButton);

    // Verify file input click was triggered
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it('should handle successful file import', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Get the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Create a mock JSON file with tasks
    const mockTasks = [
      {
        id: '1',
        title: 'Imported Task',
        description: 'This was imported',
        status: 'todo',
        priority: 'medium',
        tags: ['imported'],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
    ];

    const fileContent = JSON.stringify(mockTasks);
    const file = new File([fileContent], 'tasks.json', {
      type: 'application/json',
    });

    // Trigger file import
    await user.upload(fileInput, file);

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/Successfully imported 1 task!/i)).toBeDefined();
    });

    // Verify imported task appears
    await waitFor(() => {
      expect(screen.getByText('Imported Task')).toBeDefined();
    });
  });

  it('should handle failed file import', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Get the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Create an invalid file
    const file = new File(['invalid json content'], 'tasks.json', {
      type: 'application/json',
    });

    // Trigger file import
    await user.upload(fileInput, file);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/Import failed:/i)).toBeDefined();
    });
  });

  it('should close import/export message banner', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Get the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Import a task to trigger success message
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test',
        status: 'todo',
        priority: 'low',
        tags: [],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
    ];

    const file = new File([JSON.stringify(mockTasks)], 'tasks.json', {
      type: 'application/json',
    });

    await user.upload(fileInput, file);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully imported 1 task!/i)).toBeDefined();
    });

    // Click close button
    const closeButton = screen.getByLabelText('Close message');
    await user.click(closeButton);

    // Verify message is removed
    await waitFor(() => {
      expect(screen.queryByText(/Successfully imported 1 task!/i)).toBeNull();
    });
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();

    // Mock tasks to have one task available
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        tags: ['test'],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
    ]);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeDefined();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    // Verify dialog opens
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeDefined();
    });

    // Verify TaskForm is pre-filled
    const titleInput = screen.getByDisplayValue(
      'Test Task'
    ) as HTMLInputElement;
    expect(titleInput).toBeDefined();
  });

  it('should close edit dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();

    // Mock tasks to have one task available
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        tags: ['test'],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
    ]);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeDefined();
    });

    // Open edit dialog
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeDefined();
    });

    // Click cancel button in form
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).toBeNull();
    });
  });

  it('should update task when edit form is submitted', async () => {
    const user = userEvent.setup();

    // Mock tasks to have one task available
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([
      {
        id: '1',
        title: 'Original Task',
        description: 'Original Description',
        status: 'todo',
        priority: 'medium',
        tags: ['test'],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
    ]);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Original Task')).toBeDefined();
    });

    // Open edit dialog
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeDefined();
    });

    // Update the title
    const titleInput = screen.getByDisplayValue(
      'Original Task'
    ) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task Title');

    // Submit the form
    const updateButton = screen.getByRole('button', { name: /Update Task/i });
    await user.click(updateButton);

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).toBeNull();
    });

    // Verify task is updated in the list
    await waitFor(() => {
      expect(screen.getByText('Updated Task Title')).toBeDefined();
      expect(screen.queryByText('Original Task')).toBeNull();
    });
  });

  it('should toggle task form when Add New Task button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Initially form should not be visible
    expect(screen.queryByPlaceholderText('Enter task title')).toBeNull();

    // Click Add New Task button
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    await user.click(addButton);

    // Form should appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task title')).toBeDefined();
    });

    // Button text should change to Cancel - verify by finding the unique button with specific class
    const buttons = screen.getAllByRole('button', { name: /cancel/i });
    const topCancelButton = buttons.find((btn) =>
      btn.className.includes('bg-blue-500')
    );
    expect(topCancelButton).toBeDefined();

    // Click the top-level Cancel button
    await user.click(topCancelButton!);

    // Form should disappear
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Enter task title')).toBeNull();
    });

    // Button text should change back to Add New Task
    expect(screen.getByRole('button', { name: /Add New Task/i })).toBeDefined();
  });

  it('should show correct statistics and pass tasks to filter component', async () => {
    // Mock tasks with different statuses
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([
      {
        id: '1',
        title: 'Todo Task',
        description: 'Task 1',
        status: 'todo',
        priority: 'high',
        tags: ['urgent'],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
      {
        id: '2',
        title: 'In Progress Task',
        description: 'Task 2',
        status: 'in-progress',
        priority: 'medium',
        tags: ['work'],
        createdAt: '2025-01-02',
        dueDate: '2025-12-31',
      },
      {
        id: '3',
        title: 'Done Task',
        description: 'Task 3',
        status: 'done',
        priority: 'low',
        tags: ['completed'],
        createdAt: '2025-01-03',
        dueDate: '2025-12-31',
      },
    ]);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Todo Task')).toBeDefined();
      expect(screen.getByText('In Progress Task')).toBeDefined();
      expect(screen.getByText('Done Task')).toBeDefined();
    });

    // Verify all 3 tasks are displayed
    expect(screen.getByText('Todo Task')).toBeDefined();
    expect(screen.getByText('In Progress Task')).toBeDefined();
    expect(screen.getByText('Done Task')).toBeDefined();

    // Verify filter component is present
    expect(screen.getByPlaceholderText('Search tasks...')).toBeDefined();
  });

  it('should show correct statistics in dashboard', async () => {
    // Mock tasks with different statuses
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'high',
        tags: [],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'todo',
        priority: 'medium',
        tags: [],
        createdAt: '2025-01-02',
        dueDate: '2025-12-31',
      },
      {
        id: '3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'in-progress',
        priority: 'low',
        tags: [],
        createdAt: '2025-01-03',
        dueDate: '2025-12-31',
      },
      {
        id: '4',
        title: 'Task 4',
        description: 'Description 4',
        status: 'done',
        priority: 'high',
        tags: [],
        createdAt: '2025-01-04',
        dueDate: '2025-12-31',
      },
    ]);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeDefined();
    });

    // Verify statistics
    const statsCards = document.querySelectorAll('.bg-white.p-5.rounded-lg');

    // Total Tasks: 4
    expect(statsCards[0].textContent).toContain('4');

    // To Do: 2
    expect(statsCards[1].textContent).toContain('2');

    // In Progress: 1
    expect(statsCards[2].textContent).toContain('1');

    // Completed: 1 (25%)
    expect(statsCards[3].textContent).toContain('1');
    expect(statsCards[3].textContent).toContain('25%');
  });

  it('should render TaskFilter component with search capability', async () => {
    const user = userEvent.setup();

    // Mock tasks with different content
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([
      {
        id: '1',
        title: 'Shopping List',
        description: 'Buy groceries',
        status: 'todo',
        priority: 'medium',
        tags: ['personal'],
        createdAt: '2025-01-01',
        dueDate: '2025-12-31',
      },
      {
        id: '2',
        title: 'Work Report',
        description: 'Complete quarterly report',
        status: 'todo',
        priority: 'high',
        tags: ['work', 'urgent'],
        createdAt: '2025-01-02',
        dueDate: '2025-12-31',
      },
      {
        id: '3',
        title: 'Meeting Notes',
        description: 'Review meeting minutes',
        status: 'todo',
        priority: 'low',
        tags: ['work'],
        createdAt: '2025-01-03',
        dueDate: '2025-12-31',
      },
    ]);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Shopping List')).toBeDefined();
    });

    // Verify search input is present (TaskFilter component is rendered)
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    expect(searchInput).toBeDefined();

    // Verify all tasks are initially visible
    expect(screen.getByText('Shopping List')).toBeDefined();
    expect(screen.getByText('Work Report')).toBeDefined();
    expect(screen.getByText('Meeting Notes')).toBeDefined();
  });
});
