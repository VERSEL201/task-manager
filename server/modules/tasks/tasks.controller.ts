import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Task, TaskListResponse } from '@shared/api.interface';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskListQueryDto } from './dto/task-list.query.dto';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query() query: TaskListQueryDto): Promise<TaskListResponse> {
    return this.tasksService.findAll(query);
  }

  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    return this.tasksService.remove(id);
  }
}
