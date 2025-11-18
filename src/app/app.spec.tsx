import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import App from './app';
import * as taskHelpers from '../utils/taskHelpers';

describe('App', () => {
  beforeEach(() => {
    // Mock localStorage operations
    vi.spyOn(taskHelpers, 'loadTasksFromStorage').mockResolvedValue([]);
    vi.spyOn(taskHelpers, 'saveTasksToStorage').mockResolvedValue();
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
    // Click "Change Status" to move from TODO → IN PROGRESS
    const changeStatusButton = screen.getByRole('button', {
      name: /Change Status/i,
    });
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
});
