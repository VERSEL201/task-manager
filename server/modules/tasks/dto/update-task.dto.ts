import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TASK_PRIORITIES } from '@shared/api.interface';
import type { UpdateTaskRequest } from '@shared/api.interface';

export class UpdateTaskDto implements UpdateTaskRequest {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
