export type SingleIdFn = (id: string) => void;
export type DuplicateTaskFn = (id: string) => void;
export type ImportTasksFn = (importedTasks: Task[]) => void;
export type DeleteTaskFn = (id: string) => void;
export type AddTaskFn = (newTask: NewTaskInputType) => void;
export type UpdateTaskFn = (
  id: string,
  updates: Partial<NewTaskInputType>
) => void;

export type NewTaskInputType = Omit<Task, 'id' | 'createdAt'>;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  tags: string[];
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
