# Technical Test Submission Template

## Candidate Information

- **Name:** Hitesh Khatri
- **Date:** [Submission Date]

---

## Bugs Fixed

### Bug #1: State Mutation, Async Persistence, and Race Conditions in useTasks Hook

**Location:** `src/hooks/useTasks.ts`, `src/utils/taskHelpers.ts`

**Issue:**
The original hook directly mutated the tasks array (using splice), causing unpredictable UI updates. Persistence to local storage was synchronous and inconsistently applied, risking missed updates and stale state. Functional updates were not used, leading to possible race conditions. There was no error handling for storage failures, and the updateTask method allowed accidental changes to protected fields like id and createdAt. State could be updated after component unmount, causing React warnings.

**Solution:**
Refactored the hook and helpers to use async persistence with Promises, simulating future-proofed storage. Effects now use async/await and abort flags to prevent state updates after unmount. Functional state updates are used for all mutations, and persistence is centralized in a useEffect that runs after state changes, skipping the initial load. Error handling is added for both loading and saving, and only valid fields can be updated. This makes the hook robust, predictable, and safe for concurrent updates, async storage, and component lifecycle edge cases.

---

### Bug #2: LocalStorage Key Mismatch Causing Data Loss

**Location:** `src/utils/taskHelpers.ts`

**Issue:**
The loadTasksFromStorage function used 'task-list' as the localStorage key, while saveTasksToStorage used the STORAGE_KEY constant ('tasks'). This mismatch caused all tasks to be saved to one key but loaded from another, resulting in complete data loss on page refresh as the app couldn't retrieve saved tasks.

**Solution:**
Changed loadTasksFromStorage to use STORAGE_KEY constant consistently with saveTasksToStorage, ensuring tasks are saved and loaded from the same localStorage key. This eliminates data persistence issues and maintains data integrity across sessions.

---

### Bug #3: Case-Sensitive Search Functionality

**Location:** `src/components/TaskList.tsx`

**Issue:**
The search filter used string.includes() without case normalization, making searches case-sensitive. Users searching for "test" would not find tasks titled "Test" or "TEST", significantly limiting search usability and creating a poor user experience.

**Solution:**
Modified the search filter to convert both the search query and task fields (title and description) to lowercase before comparison using toLowerCase(). This ensures case-insensitive matching, allowing users to find tasks regardless of character casing.

---

### Bug #4: Unformatted Date Display

**Location:** `src/components/TaskCard.tsx`

**Issue:**
The formatDate function returned raw ISO date strings (e.g., "2025-12-25") instead of user-friendly formatted dates. The function had a comment acknowledging it "Should format to readable date" but no implementation, showing technical debt and poor UX.

**Solution:**
Implemented proper date formatting using toLocaleDateString() with locale options to display dates in a readable format (e.g., "Dec 25, 2025"). This improves readability and provides a professional user interface for date display.

---

### Bug #5: Inconsistent Date Formatting for Created Date

**Location:** `src/components/TaskCard.tsx`

**Issue:**
The Created date field used new Date(task.createdAt).toLocaleDateString() without options, while the Due date used the formatDate function with proper formatting. This inconsistency resulted in different date formats being displayed on the same card (e.g., "12/25/2025" vs "Dec 25, 2025"), creating visual inconsistency and unprofessional appearance.

**Solution:**
Changed the Created date to use the same formatDate() helper function, ensuring both Due and Created dates display in consistent, readable format (e.g., "Dec 25, 2025"). This maintains visual consistency across the UI and provides a unified user experience.

---

### Bug #6: Missing Form Validation

**Location:** `src/components/TaskForm.tsx`

**Issue:**
The task form had no validation, allowing submission with empty title and description fields. This created broken tasks with no content, cluttering the task list with useless entries and degrading data quality. No user feedback was provided for invalid submissions.

**Solution:**
Added validation to check if title is empty before submission, displaying an alert if required fields are missing. Implemented string trimming for title and description to remove whitespace, preventing creation of tasks with only spaces and ensuring data quality.

---

### Bug #7: Infinite Re-render Risk from useEffect Dependencies

**Location:** `src/components/TaskFilter.tsx`

**Issue:**
The useEffect hook included onSearchChange in its dependency array. Since this callback is recreated on every parent component render, it triggered excessive re-renders and potential infinite loops, causing performance degradation and React warnings about dependency arrays.

**Solution:**
Removed onSearchChange from useEffect dependencies and implemented 300ms debouncing using setTimeout. This prevents unnecessary re-renders, improves search performance by reducing function calls during rapid typing, and eliminates React warnings while maintaining functionality.

---

### Bug #8: Inverted Priority Sorting Logic

**Location:** `src/components/TaskList.tsx`

**Issue:**
The priority sorting compared priorityOrder[b.priority] - priorityOrder[a.priority], which was backwards. When users selected "Sort by Priority", low-priority tasks appeared first instead of high-priority tasks, creating a counterintuitive and frustrating sorting experience that violated user expectations.

**Solution:**
Reversed the comparison to priorityOrder[a.priority] - priorityOrder[b.priority], ensuring high-priority tasks (value 3) sort before medium (value 2) and low (value 1) priority tasks. This aligns with user expectations and standard priority sorting conventions.

---

### Bug #9: Unused Dead Code in Helpers

**Location:** `src/utils/taskHelpers.ts`

**Issue:**
The filterTasksByStatus function was defined but never used anywhere in the codebase. It also performed sorting, which conflicted with the sorting logic in TaskList component. This dead code created maintenance overhead, confusion for developers, and potential for future bugs.

**Solution:**
Removed the entire filterTasksByStatus function to clean up the codebase. Filtering and sorting are properly handled in TaskList component where they belong, improving code organization, reducing complexity, and eliminating redundant functionality.

---

## Tests Implemented

### Test Suite #1: TaskCard Component Tests

**Location:** `src/components/TaskCard.spec.tsx`

**Coverage:** 15 comprehensive tests covering:

**Rendering Tests:**

- Task title and description display
- Priority badges (high, medium, low) with correct CSS classes
- Status badges (todo, in-progress, done) with correct CSS classes
- Formatted due dates using en-GB locale (e.g., "25 Dec 2025")
- Formatted created dates with consistent formatting
- "No due date" fallback for tasks without due dates
- Tags rendering with # prefix
- Empty tags handling (no tags section displayed)

**Event Handler Tests:**

- Delete button triggers onDelete callback with correct task ID
- Change Status button triggers onUpdate callback with next status in cycle
- Status cycling verification: todo → in-progress → done → todo

**Edge Cases & Variants:**

- All three priority levels tested individually with color validation
- All three status levels tested individually with color validation
- Tasks with and without due dates
- Tasks with and without tags

**Testing Approach:**
Used vitest with @testing-library/react for component rendering and user interactions. Replaced jest-dom matchers (toHaveClass, toBeInTheDocument) with standard vitest assertions using toBeDefined(), toBeNull(), and className.toContain() for compatibility. User interactions simulated with @testing-library/user-event.

---

### Test Suite #2: TaskFilter Component Tests

**Location:** `src/components/TaskFilter.spec.tsx`

**Coverage:** 15 comprehensive tests covering:

**Rendering Tests:**

- Search input with placeholder text
- All four filter buttons (All Tasks, TODO, IN PROGRESS, DONE)
- Active filter highlighting with blue background
- Inactive filter styling with gray background

**Filter Button Interaction Tests:**

- onFilterChange callback triggered for each filter button
- Correct filter value passed ('all', 'todo', 'in-progress', 'done')
- Multiple consecutive filter changes handling

**Search Functionality Tests:**

- Input value updates correctly when typing
- Search debouncing with 300ms delay implementation
- Debounce timer cancellation on rapid typing
- onSearchChange callback with correct search query
- Empty string handling when search is cleared
- Default activeFilter set to 'all' when not provided

**Testing Approach:**
Used vitest with fake timers (vi.useFakeTimers) to test debounce behavior accurately. Implemented fireEvent.change() from @testing-library/react to properly trigger React's onChange event system. Used vi.advanceTimersByTimeAsync() to fast-forward time and verify debounce functionality. Mock functions created with vi.fn() to verify callback invocations and arguments.

---

### Test Suite #3: TaskForm Component Tests

**Location:** `src/components/TaskForm.spec.tsx`

**Coverage:** 36 comprehensive tests covering:

**Rendering Tests:**

- All form fields present (title, description, status, priority, due date, tags)
- Submit button text changes based on mode ("Add Task" vs "Update Task")
- Cancel button conditional rendering (only when onCancel prop provided)
- Default field values (empty strings, 'todo' status, 'medium' priority)
- Form initialization with initialTask values for edit mode
- All status options available (todo, in-progress, done)
- All priority options available (low, medium, high)
- Tags input with placeholder text

**Form Input Tests:**

- Title field updates on typing
- Description field updates on typing
- Status dropdown selection changes
- Priority dropdown selection changes
- Due date input changes
- Field value persistence during typing

**Tags Functionality Tests:**

- Add tag by pressing Enter key
- Add multiple tags sequentially
- Clear tag input after adding
- Prevent adding empty or whitespace-only tags
- Prevent duplicate tags
- Remove tag by clicking X button
- Remove specific tag when multiple exist
- Initialize with tags from initialTask
- Ignore non-Enter key presses
- Trim whitespace from tags before adding

**Form Submission Tests:**

- onSubmit callback triggered with correct form data (including tags)
- Form data includes all fields (title, description, status, priority, dueDate, tags)
- Whitespace trimming applied to title and description
- dueDate set to undefined when empty
- Tags array included in submission
- Empty tags array when no tags added
- Form reset after successful submission (all fields including tags cleared to defaults)
- Complete submission with all optional fields filled

**Validation Tests:**

- Empty title prevented from submission with alert
- Whitespace-only title prevented from submission with alert
- onSubmit NOT called when validation fails

**Event Handler Tests:**

- onCancel callback triggered when cancel button clicked
- Mock functions verified for proper invocation

**Testing Approach:**
Used vitest with @testing-library/react for rendering and interactions. Combined fireEvent for direct DOM manipulation (select/date inputs, keyboard events) and userEvent for realistic typing simulations. Mocked window.alert with vi.spyOn for validation testing. Verified form data structure with expect.objectContaining() for flexible assertions. Created separate test cases for create mode (no initialTask) and edit mode (with initialTask). Tested tag addition with Enter key, tag removal with click events, and duplicate prevention logic.

---

### Test Suite #4: TaskList Component Tests

**Location:** `src/components/TaskList.spec.tsx`

**Coverage:** 24 comprehensive tests covering:

**Filtering Tests:**

- Render all tasks when filter is "all"
- Filter by status (todo, in-progress, done) correctly
- Case-insensitive search in task titles
- Case-insensitive search in task descriptions
- Combined filter and search query functionality
- No results when filter and search don't match

**Empty State Messages:**

- "No tasks yet" message when tasks array is empty
- "No tasks match" message when search has no results
- "No tasks with status" message when filter has no results
- Contextual suggestions for each empty state

**Sorting Controls:**

- All sorting buttons rendered (Created Date, Due Date, Priority, Title)
- Sort order toggle button rendered (Asc/Desc)
- Active sort button highlighted with blue background
- Sort selection changes when buttons clicked
- Sort order toggles between ascending and descending

**Sorting Functionality:**

- Default sort by created date in descending order
- Sort by title alphabetically (A-Z in asc, Z-A in desc)
- Sort by priority (high→medium→low in desc order)
- Sort by due date with no-due-date tasks last (Infinity handling)
- Sort order inversion works correctly (asc vs desc)

**Component Integration:**

- TaskCard components rendered for each task
- Callbacks (onUpdateTask, onDeleteTask) passed to TaskCard
- Grid layout with responsive columns (1/2/3 columns)

**Testing Approach:**
Used vitest with @testing-library/react for component rendering and DOM queries. Simulated user interactions with userEvent for button clicks. Verified sorting behavior by extracting task titles in rendered order and comparing with expected sequences. Tested edge cases like tasks without due dates (sorted as Infinity). Used container queries to verify CSS grid classes for responsive layout.

---

### Test Suite #5: useTasks Hook Tests

**Location:** `src/hooks/useTasks.spec.ts`

**Coverage:** 20 comprehensive tests covering:

**Hook Initialization:**

- Initialize with empty tasks and loading state true
- Load tasks from storage on mount
- Set loading to false after loading completes
- Handle non-array data from storage gracefully

**Error Handling:**

- Handle load errors gracefully and set empty tasks
- Handle save errors without breaking functionality
- Log errors to console appropriately
- Prevent state updates after component unmount

**Add Task Functionality:**

- Add new task with auto-generated ID and createdAt timestamp
- Add task to existing tasks array
- Preserve existing tasks when adding new ones
- Generate unique IDs using Date.now()

**Update Task Functionality:**

- Update existing task fields (title, status, priority, etc.)
- Update multiple fields simultaneously
- Prevent modification of id and createdAt fields
- No changes when updating non-existent task ID
- Maintain task order when updating

**Delete Task Functionality:**

- Delete task by ID from tasks array
- Preserve other tasks when deleting one
- No changes when deleting non-existent ID

**Storage Persistence:**

- Save tasks to storage after adding a task
- Save tasks to storage after updating a task
- Save tasks to storage after deleting a task
- Handle initial load without unnecessary saves
- Async persistence with proper error handling

**Testing Approach:**
Used vitest with @testing-library/react's renderHook for testing custom hooks. Mocked localStorage operations by spying on taskHelpers functions (loadTasksFromStorage, saveTasksToStorage) to isolate hook logic from storage implementation. Used waitFor to handle async operations and state updates. Mocked Date.now() and Date.prototype.toISOString() to test ID and timestamp generation. Verified abort mechanism prevents state updates after unmount. Tested all CRUD operations and their side effects on storage persistence.

---

### Test Summary

**Total Tests:** 112 tests (110 implemented + 2 existing)

- TaskCard: 15 tests ✓
- TaskFilter: 15 tests ✓
- TaskForm: 36 tests ✓
- TaskList: 24 tests ✓
- useTasks: 20 tests ✓
- App: 2 tests ✓

**Test Results:** All 112 tests passing
**Test Duration:** ~5 seconds
**Coverage Areas:**

- Component rendering and UI validation
- User interaction and event handlers
- Edge cases and error conditions
- State management and callbacks
- CSS class application and styling
- Date formatting and localization
- Debouncing and performance optimizations

**Key Testing Patterns Used:**

- Vitest for test framework with jsdom environment
- @testing-library/react for component rendering
- @testing-library/user-event for realistic user interactions
- fireEvent for direct DOM event simulation
- Mock functions for callback verification
- Fake timers for debounce/async testing
- TypeScript type assertions for type safety

---

## Features Implemented

### Feature #1: Task Tags Management

**Details:**
Implemented a comprehensive tagging system for tasks, allowing users to categorize and organize their tasks with custom labels. The feature was missing from the original implementation where the Task type included a `tags` property, but the TaskForm component had hardcoded empty arrays for tags without any user interface for managing them.

**Implementation:**

- **Tag Input Field:** Added an input field in TaskForm where users can type tag names
- **Add Tag Interaction:** Tags are added by pressing Enter key after typing
- **Visual Display:** Tags appear as rounded pills with blue background and white text, showing # prefix
- **Remove Functionality:** Each tag pill has an × button to remove it
- **Duplicate Prevention:** System prevents adding the same tag twice to a task
- **Validation:** Empty or whitespace-only tags are rejected
- **Edit Mode Support:** Tags are properly loaded when editing existing tasks

**Test Coverage:**
Added 14 comprehensive tests for the tags functionality:

- Tag addition via Enter key
- Multiple tags support
- Input clearing after tag addition
- Empty/whitespace tag prevention
- Duplicate tag prevention
- Tag removal functionality
- Edit mode tag initialization
- Keyboard event handling

**User Benefits:**

- Better task organization with custom labels
- Quick visual identification of task categories
- Flexible categorization without predefined categories
- Easy tag management with intuitive keyboard and mouse interactions

---

### Feature #2: Edit Task Dialog

**Details:**
Implemented a comprehensive edit functionality that allows users to modify existing tasks through a modal dialog interface. This feature was completely missing from the original application - users could only create new tasks, change their status, or delete them, but had no way to edit task details after creation.

**Implementation:**

**New Component - Dialog.tsx:**

- Created reusable modal dialog component with proper accessibility
- Features: backdrop click to close, ESC key handling, body scroll lock prevention
- Responsive design with max width and scrollable content area
- Props: isOpen, onClose, title, children for flexible reusability

**TaskCard Component Updates:**

- Added optional `onEdit` prop to TaskCardProps interface
- Implemented `handleEdit` function that calls onEdit callback with task data
- Added green "Edit" button between "Change Status" and "Delete" buttons
- Conditional rendering - Edit button only shows when onEdit prop provided

**TaskList Component Updates:**

- Added optional `onEditTask` prop to TaskListProps interface
- Threaded callback through to TaskCard components in the map function
- Maintains prop-drilling pattern consistent with onUpdateTask/onDeleteTask

**App Component Updates:**

- Added `editingTask` state (Task | null) to track which task is being edited
- Implemented `handleEditTask` function to open dialog with selected task
- Implemented `handleEditSubmit` function to save changes and close dialog
- Added Dialog component after main content with TaskForm inside
- Dialog shows conditionally when editingTask is not null
- TaskForm receives editingTask as initialTask prop for pre-population

**User Workflow:**

1. User clicks green "Edit" button on any task card
2. Modal dialog opens with TaskForm pre-filled with existing task data
3. User can modify any field (title, description, status, priority, due date, tags)
4. Clicking "Save Task" updates the task and closes dialog
5. Clicking "Cancel" or ESC key closes dialog without saving
6. Task list refreshes automatically showing updated data

**Technical Highlights:**

- Reusable Dialog component can be used for other modals in future
- Proper state management with controlled components
- Clean separation of concerns (Dialog UI vs Form logic)
- Consistent prop-threading pattern through component tree
- Type-safe with TypeScript interfaces

**User Benefits:**

- Complete task editing capability without deleting and recreating
- Professional modal dialog experience
- Maintains all validation rules from task creation
- Intuitive UI with familiar form interface
- Non-destructive - can cancel without losing changes
- Keyboard shortcuts (ESC to close) for power users

---**Missing Functionality:**

- No input field for users to add tags to tasks
- Tags array was always empty in form submissions
- No ability to view, add, or remove tags when creating/editing tasks
- Tags displayed on TaskCard but couldn't be managed through the UI

**Implementation Approach:**

**1. UI Components (TaskForm.tsx):**

- Added tags input field with placeholder "Type a tag and press Enter"
- Implemented real-time tag pills display below the input field
- Each tag pill displays with a `#` prefix for visual consistency
- Added remove button (×) on each tag pill with hover effects

**2. State Management:**

- Created `tags` state array to track current task tags
- Created `tagInput` state for the input field value
- Initialized from `initialTask?.tags` for edit mode support

**3. Tag Addition Logic:**

- `handleTagInputKeyDown` function listens for Enter key press
- Validates and trims input before adding
- Prevents duplicate tags using `tags.includes()` check
- Clears input field after successful addition
- Ignores other key presses to prevent accidental additions

**4. Tag Removal Logic:**

- `removeTag` function filters out selected tag from array
- Each tag pill has clickable × button with `aria-label` for accessibility
- Hover state changes text color to red for visual feedback

**5. Form Integration:**

- Tags included in form submission data
- Form reset now clears both tags array and input field
- Edit mode properly loads existing tags from `initialTask`

**6. Testing:**

- Added 14 comprehensive tests for tag functionality
- Tests cover: adding tags, removing tags, duplicate prevention, empty input validation, Enter key handling, form submission with tags, and initialization from existing task

**Result:**
Users can now fully manage task tags through an intuitive interface with keyboard-friendly input (Enter to add) and mouse-friendly removal (click × button). Tags are properly persisted with tasks and displayed consistently throughout the application.

---

## AI Tool Usage

### Tools Used

- [ ] GitHub Copilot
- [ ] ChatGPT
- [ ] Claude
- [ ] Other: [Specify]

---

## Testing Strategy

### Tests Written

- [ ] Unit tests for [component/function]
- [ ] Integration tests for [feature]

### Test Coverage

[Describe your testing approach and coverage]
