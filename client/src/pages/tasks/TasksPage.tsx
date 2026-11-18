import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Check,
  Trash2,
  ListTodo,
  Clock,
  Calendar,
  Settings,
  ChevronDown,
} from 'lucide-react';
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskPriority,
} from '@shared/api.interface';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@client/src/api/tasks';
import { logger } from '@lark-apaas/client-toolkit/logger';

const filterOptions: { value: 'all' | TaskPriority; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const StatusBar: React.FC = () => {
  return (
    <div className="status-bar">
      <span className="status-bar-time tnum">9:41</span>
      <div className="status-bar-icons">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path
            d="M1 5C1 5 3.5 2 8.5 2C13.5 2 16 5 16 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3.5 7.5C3.5 7.5 5.5 5.5 8.5 5.5C11.5 5.5 13.5 7.5 13.5 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6 10C6 10 7 9 8.5 9C10 9 11 10 11 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M1 8C2.5 6 5 4.5 8 4.5C11 4.5 13.5 6 15 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3.5 9.5C4.8 8.5 6.5 7.8 8 7.8C9.5 7.8 11.2 8.5 12.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="10.5" r="1" fill="currentColor" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="3"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor" />
          <rect
            x="23"
            y="4"
            width="2"
            height="4"
            rx="1"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<'all' | TaskPriority>('all');
  const [showPrioritySelect, setShowPrioritySelect] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', filter],
    queryFn: () => fetchTasks(filter),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务添加成功');
      setTitle('');
      setPriority('medium');
    },
    onError: (error: unknown) => {
      logger.error('添加任务失败', error);
      toast.error('添加任务失败，请重试');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { isCompleted: boolean };
    }) => updateTask(id, body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: unknown) => {
      logger.error('更新任务失败', error);
      toast.error('更新失败，请重试');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务已删除');
    },
    onError: (error: unknown) => {
      logger.error('删除任务失败', error);
      toast.error('删除失败，请重试');
    },
  });

  const handleAdd = (): void => {
    if (!title.trim()) {
      toast.error('请输入任务标题');
      return;
    }
    createMutation.mutate({ title: title.trim(), priority });
  };

  const handleToggleComplete = (task: Task): void => {
    updateMutation.mutate({ id: task.id, body: { isCompleted: !task.isCompleted } });
  };

  const handleDelete = (id: string): void => {
    deleteMutation.mutate(id);
  };

  const sortedTasks = [...tasks].sort(
    (a: Task, b: Task) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const activeCount = sortedTasks.filter((t: Task) => !t.isCompleted).length;

  return (
    <div className="min-h-screen w-full py-8 px-8 flex items-center justify-center">
      {/* 设备帧 */}
      <div className="device-frame" aria-label="iPhone 设备预览">
        {/* 动态岛 */}
        <div className="dynamic-island" />

        {/* 屏幕面 */}
        <div className="device-screen">
          {/* 状态栏 */}
          <StatusBar />

          {/* 内容区 */}
          <div className="device-content">
            <div className="px-5 pt-2 pb-32">
              {/* 问候语 */}
              <p className="text-[11px] tracking-[0.08em] uppercase tnum text-muted-foreground mb-1">
                today · 周五
              </p>

              {/* 标题 - 衬线展示体 */}
              <h1 className="font-display text-[26px] leading-[1.1] tracking-[-0.02em] text-foreground mb-4">
                智能任务管理
              </h1>

              {/* 统计 Hero 卡 - 陶土橙实底 */}
              <div className="rounded-[18px] bg-primary p-4 mb-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.06em] uppercase tnum text-white/70 mb-1">
                      待完成
                    </p>
                    <p className="font-display text-[40px] leading-none font-semibold tracking-[-0.03em] text-white tnum">
                      {activeCount}
                    </p>
                  </div>
                  <ListTodo className="w-6 h-6 text-white/60" />
                </div>
              </div>

              {/* 添加任务区 */}
              <div className="mb-5">
                <p className="text-[12px] text-muted-foreground mb-2 font-body">
                  添加新任务
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入任务标题..."
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTitle(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') handleAdd();
                    }}
                    className="input-clay flex-1"
                  />
                  <button
                    className="btn-primary w-12 shrink-0 p-0"
                    onClick={handleAdd}
                    disabled={createMutation.isPending}
                    aria-label="添加任务"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* 优先级选择 - filter-select 风格 */}
                <div className="relative mt-2">
                  <button
                    className="filter-pill w-full justify-between"
                    onClick={() => setShowPrioritySelect(!showPrioritySelect)}
                    aria-haspopup="listbox"
                    aria-expanded={showPrioritySelect}
                  >
                    <span>优先级：{TASK_PRIORITY_LABELS[priority]}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {showPrioritySelect && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-[14px] overflow-hidden z-50 shadow-lg">
                      {TASK_PRIORITIES.map((p: TaskPriority) => (
                        <button
                          key={p}
                          className={`w-full text-left px-4 py-3 text-[14px] font-body border-b border-border last:border-b-0 ${
                            priority === p
                              ? 'text-primary font-medium bg-primary/5'
                              : 'text-foreground'
                          }`}
                          onClick={() => {
                            setPriority(p);
                            setShowPrioritySelect(false);
                          }}
                        >
                          <span
                            className={`pill pill-${p} mr-2`}
                            style={{ verticalAlign: 'middle' }}
                          >
                            {TASK_PRIORITY_LABELS[p]}
                          </span>
                          <span style={{ verticalAlign: 'middle' }}>
                            {p === 'high'
                              ? '高优先级'
                              : p === 'medium'
                                ? '中优先级'
                                : '低优先级'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 筛选 Tab */}
              <div
                className="flex gap-2 mb-4 overflow-x-auto"
                role="tablist"
                aria-label="优先级筛选"
              >
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`filter-pill ${
                      filter === opt.value ? 'active' : ''
                    } shrink-0`}
                    onClick={() => setFilter(opt.value)}
                    role="tab"
                    aria-selected={filter === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 任务列表 - list-row 风格 */}
              {isLoading ? (
                <div className="flex justify-center py-12 text-muted-foreground text-[13px] font-body">
                  加载中...
                </div>
              ) : sortedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ListTodo className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-[13px] font-body">暂无任务</p>
                  <p className="text-[12px] mt-1">添加第一个任务开始吧</p>
                </div>
              ) : (
                <div className="card-clay p-0">
                  {sortedTasks.map((task: Task, index: number) => (
                    <div
                      key={task.id}
                      className={`task-list-row px-4 ${
                        task.isCompleted ? 'task-done' : ''
                      } ${index === 0 ? 'pt-3' : ''} ${
                        index === sortedTasks.length - 1 ? 'pb-3' : ''
                      }`}
                    >
                      {/* 完成复选框 */}
                      <button
                        className={`checkbox-circle ${
                          task.isCompleted ? 'checked' : ''
                        }`}
                        onClick={() => handleToggleComplete(task)}
                        aria-label={
                          task.isCompleted ? '标记为未完成' : '标记为已完成'
                        }
                      >
                        {task.isCompleted && (
                          <Check className="w-3 h-3" strokeWidth={3} />
                        )}
                      </button>

                      {/* 任务主体 */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`pill pill-${task.priority}`}>
                            {TASK_PRIORITY_LABELS[task.priority]}
                          </span>
                        </div>
                        <p
                          className={`task-title text-[15px] font-body truncate ${
                            task.isCompleted
                              ? 'text-muted-foreground'
                              : 'text-foreground font-medium'
                          }`}
                          style={{ lineHeight: '1.4' }}
                        >
                          {task.title}
                        </p>
                      </div>

                      {/* 删除按钮 */}
                      <button
                        className="icon-btn text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(task.id)}
                        aria-label="删除任务"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 毛玻璃标签栏 */}
          <div className="glass-tabbar">
            <div className="glass-tabbar-item active">
              <ListTodo className="w-5 h-5" strokeWidth={1.7} />
              <span>任务</span>
            </div>
            <div className="glass-tabbar-item">
              <Calendar className="w-5 h-5" strokeWidth={1.7} />
              <span>日历</span>
            </div>
            <div className="glass-tabbar-item">
              <Clock className="w-5 h-5" strokeWidth={1.7} />
              <span>专注</span>
            </div>
            <div className="glass-tabbar-item">
              <Settings className="w-5 h-5" strokeWidth={1.7} />
              <span>设置</span>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="home-indicator">
            <div className="home-indicator-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
