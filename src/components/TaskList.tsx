import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { useTasksContext } from '../context/TasksContext';

interface TaskListProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask }) => {
  const { updateTask, deleteTask, duplicateTask } = useTasksContext();
  if (tasks.length === 0) {
    let message = 'No tasks found';
    let suggestion = '';

    message = 'No tasks yet';
    suggestion = 'Click "Add New Task" to create your first task!';

    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium mb-2">{message}</p>
        <p className="text-sm">{suggestion}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-150">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onDuplicate={duplicateTask}
            onEdit={onEditTask}
          />
        ))}
      </div>
    </div>
  );
};
