/* 前后端共享的类型写在这里 */

export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export const isTaskPriority = (v: string): v is TaskPriority =>
  (TASK_PRIORITIES as readonly string[]).includes(v);
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponse {
  items: Task[];
}

export interface CreateTaskRequest {
  title: string;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  priority?: TaskPriority;
  isCompleted?: boolean;
}

export interface TaskListQuery {
  priority?: TaskPriority;
}
