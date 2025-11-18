import { Task, TaskStatus, TaskPriority } from '../types/task';
import React, { useState, useRef, useActionState } from 'react';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  initialTask?: Task;
  onCancel?: () => void;
}

interface FormState {
  errors: {
    title: string;
    description: string;
    dueDate: string;
  };
  success: boolean;
}

const initialFormState: FormState = {
  errors: { title: '', description: '', dueDate: '' },
  success: false,
};

export const TaskForm = ({
  onSubmit,
  initialTask,
  onCancel,
}: TaskFormProps) => {
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormAction = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as TaskStatus;
    const priority = formData.get('priority') as TaskPriority;
    const dueDate = formData.get('dueDate') as string;

    // Validate required fields
    const newErrors = { title: '', description: '', dueDate: '' };
    if (!title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (newErrors.title || newErrors.description || newErrors.dueDate) {
      return { errors: newErrors, success: false };
    }

    const task = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      tags,
    };

    onSubmit(task);

    // Reset form
    if (!initialTask) {
      formRef.current?.reset();
      setTags([]);
      setTagInput('');
    }

    return {
      errors: { title: '', description: '', dueDate: '' },
      success: true,
    };
  };

  const [formState, formAction] = useActionState(
    handleFormAction,
    initialFormState
  );

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={initialTask?.title || ''}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            formState.errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter task title"
        />
        {formState.errors.title && (
          <p className="mt-1 text-sm text-red-600">{formState.errors.title}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialTask?.description || ''}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            formState.errors.description
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter task description"
        />
        {formState.errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {formState.errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialTask?.status || 'todo'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={initialTask?.priority || 'medium'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            defaultValue={initialTask?.dueDate || ''}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              formState.errors.dueDate
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {formState.errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">
              {formState.errors.dueDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a tag and press Enter"
          />
          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          {initialTask ? 'Update Task' : 'Add Task'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
