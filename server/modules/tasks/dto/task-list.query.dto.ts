import { Transform, Type } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { TASK_PRIORITIES } from '@shared/api.interface';
import type { TaskListQuery } from '@shared/api.interface';

export class TaskListQueryDto implements TaskListQuery {
  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key] === '' ? undefined : value,
  )
  @IsString()
  @IsIn(TASK_PRIORITIES)
  priority?: 'high' | 'medium' | 'low';
}
