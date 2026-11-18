import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { supabaseProvider } from './supabase.provider';

@Module({
  controllers: [TasksController],
  providers: [TasksService, supabaseProvider],
})
export class TasksModule {}
