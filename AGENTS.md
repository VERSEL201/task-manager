# 智能任务管理系统

## 设计规范

### 场景约束
- 产品定位：个人用任务清单，管理日常待办，像手机里的专注待办 App，而不是又一个后台管理系统
- 应用类型：个人工具；判定理由：单人自用、任务清单、轻量级操作
- 使用者与场合：个人日常使用，随时添加、切换、删除任务
- 视觉主角：任务列表本身，每条任务的优先级和完成状态一目了然
- 信息密度：中等，列表形式，一屏展示 6-8 条任务
- 页面结构：拟真 iPhone 15 Pro 设备帧居中，单屏只做一件事（任务管理）；选择理由：陶土折屏风格要求移动设备帧呈现
- 工作面板：无
- 用户风格原话：陶土折屏风格
- 应用身份：不展示；理由：单屏工具，设备帧内标题即功能

### 视觉方向：陶土折屏
（方向名是内部代号，不得出现在任何界面文案里）

| 项 | 取值 | 用途 | 出处 |
|---|---|---|---|
| 背景 | hsl(60 18% 97%) (#fafaf7) | 页面底色，暖近白，顶部叠 accent 6% 径向渐晕 | 陶土折屏规范 |
| 正文 | hsl(48 8% 10%) (#1a1916) | 主文字 | 陶土折屏规范 |
| 主色/强调色 | hsl(15 55% 53%) (#c96442) | 陶土橙：主按钮、激活态、pill。每屏至多 2 次 | 陶土折屏规范 |
| 次文字 | hsl(45 4% 41%) (#6b6964) | 次要文字、meta | 陶土折屏规范 |
| 边框 | hsl(40 15% 89%) (#e8e5df) | 所有发丝边框与分隔线 | 陶土折屏规范 |
| 卡片面 | hsl(0 0% 100%) (#ffffff) | 卡片、按钮面 | 陶土折屏规范 |
| 语义色 | 高 accent / 中 hsl(42 95% 55%) / 低 hsl(145 65% 45%) / 完成 muted | 优先级标签 | 高用陶土橙，其余沿用但降饱和 |
| 字体 | 标题 Iowan Old Style/Charter/Georgia/Songti SC 衬线 / 正文 SF Pro/system-ui 无衬线 / 数字 SF Mono 等宽 | 三套字体严格分工 | 陶土折屏规范 |
| 圆角 | device 56px / screen 44px / card 18px / button 14px / pill 999px | 软圆角族 | 陶土折屏规范 |
| 阴影 | 设备帧双 inset 描边 + 双层落地阴影；卡片无阴影（靠发丝边框分层） |  | 陶土折屏规范 |
| 图标线宽 | 1.7px | SVG 单线 | 陶土折屏规范 |
| 字号阶梯 | 10(pill) / 12(meta) / 13(sub) / 15(body) / 20(h2) / 26(h1) / 64(hero) px |  | 陶土折屏规范 |
| 点睛样式 | 拟真 iPhone 设备帧（动态岛 + 状态栏 SVG + home indicator + 毛玻璃标签栏） | 签名级视觉元素 | 陶土折屏规范 |
| 动效 | 入场：淡入 / 列表项操作：0.2s 过渡 / 悬停：无（移动设备风格无 hover） | 三项都填 | |
| 配图风格 | 无（禁止外链图片，用 ph-img 渐变占位） | 陶土折屏 hard rule | |

### 间距
- 设备帧内水平内边距：20px
- 竖直堆叠间距：16px
- 卡片内边距：16px
- 列表行间距：12px
- 栅格间距：10px

### 页面实现约束
- 页面中央展示一个 390×844 的 iPhone 15 Pro 设备帧，设备帧内滚动内容
- 设备帧固定：动态岛（124×36，顶部居中）+ 状态栏（时间 9:41 + 信号/wifi/电池 SVG）+ 底部 home indicator
- 外框圆角 56px，内屏圆角 44px，制造厚度差
- 设备帧双 inset 描边 + 双层落地阴影，禁止扁平
- 标签栏：毛玻璃 backdrop-filter: blur(20px)，顶部发丝分隔线，激活项陶土橙
- 强调色预算：陶土橙每屏最多 2 次（accent 卡内部白字不计入）
- 标题用衬线展示体，正文用系统无衬线，数字一律等宽 tabular-nums
- 卡片纯白 + 发丝边框 + 18px 圆角，无阴影
- 优先级 pill 用陶土橙底+白字（高优先级），其余用描边 tag
- 所有可点击控件触控区 ≥44px 高
- 完成态：文字 muted 色 + 删除线，不用额外强调色
- 空态：居中，muted 色说明文字
- 字体全部用系统字体栈，不 @import 外部 webfont
- 图标用 lucide-react（单线），strokeWidth 1.7
- 页面背景顶部叠 accent 6% 径向渐晕

### 配图清单
- 无

## 后端

### 数据源：Supabase REST API
- 任务数据存放在外部 Supabase 项目，**不再使用应用内置数据库**（`server/database/schema.ts` 的 `task` 表已不作为数据源）
- 统一由 `server/modules/tasks/supabase.provider.ts` 提供 `SUPABASE_CLIENT`（`@supabase/supabase-js`），配置与 anon key 仅存在于服务端，禁止下发到前端
- 所有访问经由服务端 `TasksService`，前端只调 `/api/tasks`，不直连 Supabase

### Supabase `tasks` 表 → 接口字段映射
| Supabase 列 | 类型 | 接口字段 | 转换规则 |
|---|---|---|---|
| `id` | bigint 自增 | `id: string` | `String(row.id)`；入参需 `Number()` 解析，非法值抛 404 |
| `title` | text | `title` | 直传 |
| `priority` | text（'高'/'中'/'低'） | `priority: 'high'/'medium'/'low'` | 双向 map：high↔高、medium↔中、low↔低；未知值回退 `medium` |
| `completed` | boolean | `isCompleted` | 直传 |
| `created_at` | timestamptz | `createdAt` / `updatedAt` | 表无 `updated_at` 列，`updatedAt` 复用 `created_at` |

### 约定
- 服务端不缓存，每次请求直连 Supabase
- Supabase 返回 `error` 时记完整日志并抛 `InternalServerErrorException`；`maybeSingle()` 无数据抛 `NotFoundException`
- 列表按 `created_at` 降序；优先级筛选在服务端用 `.eq('priority', 中文值)` 下推
