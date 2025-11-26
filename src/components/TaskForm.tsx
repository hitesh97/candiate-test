import {
  Task,
  TaskStatus,
  TaskPriority,
  NewTaskInputType,
} from '../types/task';
import React, { useState, useActionState } from 'react';
import { TagPill } from './TagPill';

type TaskFormProps = {
  onSubmit: (task: NewTaskInputType) => void;
  initialTask?: Task;
  onCancel?: () => void;
};

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
  // Controlled form state
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(
    initialTask?.description || ''
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialTask?.status || 'todo'
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialTask?.priority || 'medium'
  );
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleFormAction = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
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

    // Call onSubmit and wait for it to complete
    await Promise.resolve(onSubmit(task));

    // Reset form only on successful submission in Add mode
    if (!initialTask) {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
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
    <form action={formAction} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-5">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm font-medium placeholder:text-gray-400 ${
            formState.errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter task title"
        />
        {formState.errors.title && (
          <p className="mt-1.5 text-sm text-red-600 font-medium">
            {formState.errors.title}
          </p>
        )}
      </div>

      <div className="mb-5">
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm font-medium placeholder:text-gray-400 ${
            formState.errors.description
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter task description"
        />
        {formState.errors.description && (
          <p className="mt-1.5 text-sm text-red-600 font-medium">
            {formState.errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
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
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm font-medium ${
              formState.errors.dueDate
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {formState.errors.dueDate && (
            <p className="mt-1.5 text-sm text-red-600 font-medium">
              {formState.errors.dueDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-semibold text-gray-700 mb-2"
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium placeholder:text-gray-400"
            placeholder="Type a tag and press Enter"
          />
          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((tag, index) => (
                <TagPill key={index} tag={tag} removable onRemove={removeTag} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-semibold text-base shadow-sm"
        >
          {initialTask ? 'Update Task' : 'Add Task'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors font-semibold text-base shadow-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
