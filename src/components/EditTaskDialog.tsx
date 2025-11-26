import { useState } from 'react';
import { Dialog } from './Dialog';
import { TaskForm } from './TaskForm';
import { NewTaskInputType, Task } from '../types/task';

interface EditTaskDialogProps {
  editingTask: Task | null;
  onEditSubmit: (updatedTask: NewTaskInputType) => void;
  onClose: () => void;
}

export function EditTaskDialog({
  editingTask,
  onEditSubmit,
  onClose,
}: EditTaskDialogProps) {
  return (
    <Dialog isOpen={!!editingTask} onClose={onClose} title="Edit Task">
      {editingTask && (
        <TaskForm
          key={editingTask.id}
          initialTask={editingTask}
          onSubmit={onEditSubmit}
          onCancel={onClose}
        />
      )}
    </Dialog>
  );
}
