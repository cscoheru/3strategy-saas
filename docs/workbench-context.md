# Workbench项目功能与上下文状态

## 项目背景

### 源项目：DeepConsult
- **位置**: `/Users/kjonekong/Documents/deepconsult`
- **部署**: deepconsult.vercel.app
- **类型**: ToB组织诊断与咨询AI中台
- **核心功能**: 五维战略诊断系统

### 目标项目：3Strategy Portal
- **位置**: `/Users/kjonekong/3strategy/portal`
- **部署**: www.3strategy.cc
- **类型**: 人力资源咨询工具聚合平台
- **当前状态**: 4张主卡片（战略解码、绩效改进、薪酬改革、AI招聘）+ **智能诊断工作台**

---

## Workbench核心功能

### 五维诊断模型

```
┌─────────────────────────────────────────┐
│           五维诊断模型                    │
├─────────────────────────────────────────┤
│  Strategy   - 战略（战略目标、市场定位）  │
│  Structure  - 组织结构（架构、决策流程）  │
│  Performance- 绩效管理（KPI、考核）       │
│  Compensation- 薪酬激励（体系、公平性）   │
│  Talent     - 人才发展（招聘、培训）      │
└─────────────────────────────────────────┘
```

### 后台流程（用户不可见）

```
用户输入 → 意图识别 → 维度切换 → 数据提取 → 数据库更新
    ↓         ↓          ↓           ↓          ↓
 "我的KPI"   → Performance  → 下一维度  → 提取结构化 → Realtime推送
```

**意图识别**：
- AI自动判断用户问题属于哪个维度
- 用户无感知，后台自动切换

**维度切换**：
- 每个维度充分讨论后（约4轮对话）
- 自动进入下一维度
- 5个维度全部完成后生成报告

**数据提取**：
- 每轮对话后调用AI提取结构化数据
- 生成：分数、标签、关键问题、建议
- 实时更新到Supabase

### Realtime同步

```
┌─────────────┐         ┌──────────────┐
│   前端UI     │◄────────│  Supabase    │
│  (Realtime)  │         │  PostgreSQL  │
└─────────────┘         └──────────────┘
       ↑                        ↑
       │                        │
   Server Actions         后台提取Agent
```

---

## 技术架构

### 前端技术栈
```
Next.js 14 (App Router)
TypeScript 5.9
Tailwind CSS 4
@supabase/ssr
Recharts (雷达图)
```

### 后端技术栈
```
Supabase (PostgreSQL + Realtime)
Zhipu AI (GLM-4)
Server Actions (Next.js)
```

### 数据模型

**diagnosis_sessions表**：
```typescript
{
  id: string
  user_id: string | null
  status: 'active' | 'completed'
  current_stage: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent'
  data_strategy: { score: number, tags: string[], key_issues: string[], ... }
  data_structure: { ... }
  data_performance: { ... }
  data_compensation: { ... }
  data_talent: { ... }
  total_score: number
  created_at: timestamp
}
```

**chat_logs表**：
```typescript
{
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: { stage: string, timestamp: string }
  created_at: timestamp
}
```

---

## 关键代码位置

### Portal已实施组件

**Supabase客户端**：
- ✅ `/Users/kjonekong/3strategy/portal/lib/supabase/client-singleton.ts`
- ✅ `/Users/kjonekong/3strategy/portal/lib/supabase/server.ts`

**Server Actions**：
- ✅ `/Users/kjonekong/3strategy/portal/app/actions/consultation.ts` - 对话和流式响应
- ✅ `/Users/kjonekong/3strategy/portal/app/actions/diagnosis.ts` - 会话管理

**Hooks**：
- ✅ `/Users/kjonekong/3strategy/portal/lib/hooks/use-stream-chat.ts` - 流式对话Hook

**组件**：
- ✅ `/Users/kjonekong/3strategy/portal/components/consultation-workbench.tsx` - 对话界面
- ✅ `/Users/kjonekong/3strategy/portal/components/diagnosis-report-panel.tsx` - 报告展示

**类型**：
- ✅ `/Users/kjonekong/3strategy/portal/types/supabase.ts`

**主页集成**：
- ✅ `/Users/kjonekong/3strategy/portal/app/[locale]/page.tsx` - 已集成ConsultationWorkbench

---

## UI状态设计

### 状态A：对话模式
- ✅ 显示4张主卡片
- ✅ 显示AI对话框
- ✅ 显示"查看诊断结果"按钮
- ✅ 隐藏报告内容

### 状态B：报告模式
- ✅ 隐藏4张主卡片
- ✅ 隐藏AI对话框
- ✅ 全屏显示五维报告
- ✅ 显示"回到对话"按钮

### 状态切换逻辑

```
[对话模式] ←→ [报告模式]
    ↓            ↑
 点击查看    点击返回
              ↓
         数据保留在Supabase
         通过sessionId关联
```

---

## 数据流图

```
用户操作                   前端组件              Server Actions          Supabase
   │                        │                        │                    │
   ├─ 发送消息 ────────────→ ConsultationWorkbench  │                    │
   │                        │                        │                    │
   ├─ 意图识别 ────────────────────────────────────→ streamChat() ─────→│
   │                        │                        │                    │
   ├─ 流式响应 ←───────── useStreamChat ←─────── AI (Zhipu)          │
   │                        │                        │                    │
   ├─ 数据提取 ────────────────────────────────────→ extractInsights() │
   │                        │                        │                    │
   └─ Realtime更新 ←────── Realtime订阅 ←─────────┤                    │
                                                        ↓
                                                   保存到数据库
```

---

## 环境配置

### Supabase（与deepconsult共享）✅

**开发环境**：
```env
NEXT_PUBLIC_SUPABASE_URL=https://cnximbkrryvvbyyjtxwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**RLS策略**：
- 允许访客创建会话（user_id = null）
- 允许读取自己的会话和聊天记录
- 允许Realtime订阅

### AI服务 ✅

**Zhipu AI**：
```env
ZHIPU_AI_KEY=9689f59575bd417b94e59d3d5e7041df.BU0UX7rmpTHun4BQ
```

---

## 实施状态（2026-03-09）

### ✅ 已完成

- [x] 安装@supabase/ssr依赖
- [x] 复制Supabase客户端代码
- [x] 复制Server Actions代码
- [x] 复制use-stream-chat Hook
- [x] 创建ConsultationWorkbench组件
- [x] 创建DiagnosisReport组件
- [x] 修改page.tsx替换AI Chat
- [x] 配置环境变量
- [x] **代码实施完成，可进入测试阶段**

### 🔄 待测试

- [ ] 对话流程测试（发送消息，接收AI回复）
- [ ] "查看诊断结果"按钮功能
- [ ] 报告页面展示（雷达图、分数、标签）
- [ ] "回到对话"按钮功能
- [ ] 状态切换动画
- [ ] Supabase连接验证
- [ ] 会话创建成功验证
- [ ] Realtime更新验证
- [ ] 数据提取功能验证

### 📋 待部署

- [ ] 本地测试通过后部署到Vercel
- [ ] 生产环境配置验证
- [ ] 域名 www.3strategy.cc 配置更新

---

## 测试计划

### 功能测试清单

| 功能 | 状态 | 备注 |
|-----|------|------|
| 会话初始化 | 📝 待测试 | 验证Supabase连接 |
| 消息发送 | 📝 待测试 | 验证流式响应 |
| AI回复接收 | 📝 待测试 | 验证Zhipu AI连接 |
| 查看报告按钮 | 📝 待测试 | 验证状态切换 |
| 报告数据展示 | 📝 待测试 | 验证雷达图渲染 |
| 回到对话按钮 | 📝 待测试 | 验证状态保持 |

### UI测试清单

| 测试项 | 状态 | 备注 |
|-------|------|------|
| 响应式布局（桌面） | 📝 待测试 | 1920x1080 |
| 响应式布局（平板） | 📝 待测试 | 768x1024 |
| 响应式布局（手机） | 📝 待测试 | 375x667 |
| 4张卡片对齐 | 📝 待测试 | 与workbench对齐 |
| 状态切换动画 | 📝 待测试 | 流畅度验证 |

---

## 更新日志

### 2026-03-09
- ✅ 代码实施完成
- 📝 等待功能测试
- 📝 等待UI测试
- 📝 等待部署验证

### 原始会话
- 2026-03-08: 创建项目文档和实施计划
- 2026-03-09: 另一会话完成代码实施
