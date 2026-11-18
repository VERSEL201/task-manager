import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

export const fetchTasks = async (
  priority?: TaskPriority | 'all',
): Promise<Task[]> => {
  const params: Record<string, string> = {};
  if (priority && priority !== 'all') {
    params.priority = priority;
  }
  const { data } = await axiosForBackend.get<TaskListResponse>('/api/tasks', {
    params,
  });
  return data.items;
};

export const createTask = async (
  body: CreateTaskRequest,
): Promise<Task> => {
  const { data } = await axiosForBackend.post<Task>('/api/tasks', body);
  return data;
};

export const updateTask = async (
  id: string,
  body: UpdateTaskRequest,
): Promise<Task> => {
  const { data } = await axiosForBackend.patch<Task>(
    `/api/tasks/${id}`,
    body,
  );
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axiosForBackend.delete(`/api/tasks/${id}`);
};
