import axios from 'axios';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchTasks = async (
  priority?: TaskPriority | 'all',
): Promise<Task[]> => {
  const params: Record<string, string> = {};
  if (priority && priority !== 'all') {
    params.priority = priority;
  }
  const { data } = await api.get<TaskListResponse>('/api/tasks', {
    params,
  });
  return data.items;
};

export const createTask = async (
  body: CreateTaskRequest,
): Promise<Task> => {
  const { data } = await api.post<Task>('/api/tasks', body);
  return data;
};

export const updateTask = async (
  id: string,
  body: UpdateTaskRequest,
): Promise<Task> => {
  const { data } = await api.patch<Task>(
    `/api/tasks/${id}`,
    body,
  );
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/api/tasks/${id}`);
};
