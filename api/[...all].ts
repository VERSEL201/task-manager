import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const TABLE = 'tasks';
const COLUMNS = 'id, title, priority, completed, created_at';

const PRIORITY_TO_DB: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_FROM_DB: Record<string, string> = {
  高: 'high',
  中: 'medium',
  低: 'low',
};

type Row = {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
};

function send(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function mapRow(row: Row) {
  return {
    id: String(row.id),
    title: row.title,
    priority: PRIORITY_FROM_DB[row.priority] ?? 'medium',
    isCompleted: row.completed,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

function readBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req: any, res: any) {
  const url = new URL(req.url || '/', 'http://localhost');
  const path = url.pathname.replace(/\/+$/, '');
  const method = req.method;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    send(res, 500, { message: '缺少 Supabase 环境变量' });
    return;
  }

  const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // 列表 / 新增
  if (path === '/api/tasks') {
    if (method === 'GET') {
      let request = client
        .from(TABLE)
        .select(COLUMNS)
        .order('created_at', { ascending: false });

      const priority = url.searchParams.get('priority');
      if (priority && PRIORITY_TO_DB[priority]) {
        request = request.eq('priority', PRIORITY_TO_DB[priority]);
      }

      const { data, error } = await request;
      if (error) {
        send(res, 500, { message: '查询任务列表失败' });
        return;
      }
      send(res, 200, { items: ((data ?? []) as Row[]).map(mapRow) });
      return;
    }

    if (method === 'POST') {
      const body = readBody(req);
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const priority = PRIORITY_TO_DB[body.priority];

      if (!title) {
        send(res, 400, { message: '任务标题不能为空' });
        return;
      }
      if (!priority) {
        send(res, 400, { message: '优先级不合法' });
        return;
      }

      const { data, error } = await client
        .from(TABLE)
        .insert({ title, priority, completed: false })
        .select(COLUMNS)
        .single();

      if (error) {
        send(res, 500, { message: '创建任务失败' });
        return;
      }
      send(res, 201, mapRow(data as Row));
      return;
    }

    send(res, 405, { message: 'Method Not Allowed' });
    return;
  }

  // 更新 / 删除
  const idMatch = path.match(/^\/api\/tasks\/([^/]+)$/);
  if (idMatch) {
    const numericId = Number(idMatch[1]);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      send(res, 404, { message: '任务不存在' });
      return;
    }

    if (method === 'PATCH') {
      const body = readBody(req);
      const patch: Record<string, unknown> = {};

      if (body.title !== undefined) {
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        if (!title) {
          send(res, 400, { message: '任务标题不能为空' });
          return;
        }
        patch.title = title;
      }
      if (body.priority !== undefined) {
        const dbPriority = PRIORITY_TO_DB[body.priority];
        if (!dbPriority) {
          send(res, 400, { message: '优先级不合法' });
          return;
        }
        patch.priority = dbPriority;
      }
      if (body.isCompleted !== undefined) {
        patch.completed = Boolean(body.isCompleted);
      }

      if (Object.keys(patch).length === 0) {
        const { data, error } = await client
          .from(TABLE)
          .select(COLUMNS)
          .eq('id', numericId)
          .maybeSingle();
        if (error) {
          send(res, 500, { message: '查询任务失败' });
          return;
        }
        if (!data) {
          send(res, 404, { message: '任务不存在' });
          return;
        }
        send(res, 200, mapRow(data as Row));
        return;
      }

      const { data, error } = await client
        .from(TABLE)
        .update(patch)
        .eq('id', numericId)
        .select(COLUMNS)
        .maybeSingle();

      if (error) {
        send(res, 500, { message: '更新任务失败' });
        return;
      }
      if (!data) {
        send(res, 404, { message: '任务不存在' });
        return;
      }
      send(res, 200, mapRow(data as Row));
      return;
    }

    if (method === 'DELETE') {
      const { data, error } = await client
        .from(TABLE)
        .delete()
        .eq('id', numericId)
        .select(COLUMNS);

      if (error) {
        send(res, 500, { message: '删除任务失败' });
        return;
      }
      if (!(data ?? []).length) {
        send(res, 404, { message: '任务不存在' });
        return;
      }
      send(res, 200, { success: true });
      return;
    }

    send(res, 405, { message: 'Method Not Allowed' });
    return;
  }

  send(res, 404, { message: 'Not Found' });
}
