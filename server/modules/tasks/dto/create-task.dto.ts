import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TASK_PRIORITIES } from '@shared/api.interface';
import type { CreateTaskRequest } from '@shared/api.interface';

export class CreateTaskDto implements CreateTaskRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsIn(TASK_PRIORITIES)
  priority!: 'high' | 'medium' | 'low';
}
