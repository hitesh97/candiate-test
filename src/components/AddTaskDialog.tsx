import { NewTaskInputType } from '../types/task';
import { TaskForm } from './TaskForm';

type AddTaskDialogProps = {
  onAddTask: (task: NewTaskInputType) => void;
  onCancel: () => void;
};

export function AddTaskDialog({ onAddTask, onCancel }: AddTaskDialogProps) {
  return (
    <div className="mb-6">
      <TaskForm onSubmit={onAddTask} onCancel={onCancel} />
    </div>
  );
}
