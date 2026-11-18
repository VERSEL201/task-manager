import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateTaskRequest,
  Task,
  TaskListQuery,
  TaskListResponse,
  TaskPriority,
  UpdateTaskRequest,
} from '@shared/api.interface';
import { SUPABASE_CLIENT } from './supabase.provider';

const TABLE = 'tasks';
const COLUMNS = 'id, title, priority, completed, created_at';

interface TaskRow {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

const PRIORITY_TO_DB: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_FROM_DB: Record<string, TaskPriority> = {
  高: 'high',
  中: 'medium',
  低: 'low',
};

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly client: SupabaseClient,
  ) {}

  async findAll(query: TaskListQuery): Promise<TaskListResponse> {
    let request = this.client
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false });

    if (query.priority) {
      request = request.eq('priority', PRIORITY_TO_DB[query.priority]);
    }

    const { data, error } = await request;

    if (error) {
      this.logger.error(
        `查询任务列表失败: ${error.message} ${JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException('查询任务列表失败');
    }

    const rows: TaskRow[] = (data ?? []) as TaskRow[];
    return { items: rows.map((row: TaskRow) => this.mapToTask(row)) };
  }

  async create(dto: CreateTaskRequest): Promise<Task> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        title: dto.title,
        priority: PRIORITY_TO_DB[dto.priority],
        completed: false,
      })
      .select(COLUMNS)
      .single();

    if (error) {
      this.logger.error(`创建任务失败: ${error.message} ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('创建任务失败');
    }

    return this.mapToTask(data as TaskRow);
  }

  async update(id: string, dto: UpdateTaskRequest): Promise<Task> {
    const numericId = this.parseId(id);

    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.priority !== undefined) {
      patch.priority = PRIORITY_TO_DB[dto.priority];
    }
    if (dto.isCompleted !== undefined) patch.completed = dto.isCompleted;

    if (Object.keys(patch).length === 0) {
      return this.findOne(numericId);
    }

    const { data, error } = await this.client
      .from(TABLE)
      .update(patch)
      .eq('id', numericId)
      .select(COLUMNS)
      .maybeSingle();

    if (error) {
      this.logger.error(`更新任务失败: ${error.message} ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('更新任务失败');
    }

    if (!data) throw new NotFoundException('任务不存在');
    return this.mapToTask(data as TaskRow);
  }

  async remove(id: string): Promise<{ success: true }> {
    const numericId = this.parseId(id);

    const { data, error } = await this.client
      .from(TABLE)
      .delete()
      .eq('id', numericId)
      .select(COLUMNS);

    if (error) {
      this.logger.error(`删除任务失败: ${error.message} ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('删除任务失败');
    }

    const rows: TaskRow[] = (data ?? []) as TaskRow[];
    if (rows.length === 0) throw new NotFoundException('任务不存在');
    return { success: true };
  }

  private async findOne(numericId: number): Promise<Task> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(COLUMNS)
      .eq('id', numericId)
      .maybeSingle();

    if (error) {
      this.logger.error(
        `查询单个任务失败: ${error.message} ${JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException('查询任务失败');
    }

    if (!data) throw new NotFoundException('任务不存在');
    return this.mapToTask(data as TaskRow);
  }

  private parseId(id: string): number {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new NotFoundException('任务不存在');
    }
    return numericId;
  }

  private mapToTask(row: TaskRow): Task {
    const priority: TaskPriority = PRIORITY_FROM_DB[row.priority] ?? 'medium';

    return {
      id: String(row.id),
      title: row.title,
      priority,
      isCompleted: row.completed,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    };
  }
}
