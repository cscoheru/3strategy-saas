# Workbench集成实施计划

## 项目概述

将deepconsult项目的五维战略诊断workbench集成到3strategy portal主页，替换当前的简单AI对话功能。

**源项目**: deepconsult.vercel.app
**目标项目**: 3strategy portal (www.3strategy.cc)

**当前状态**: ✅ 代码实施已完成，进入测试阶段

---

## UI设计

### 状态A：对话模式（默认）

```
┌─────────────────────────────────────────────────┐
│ Header (3Strategy + 智能咨询工具平台)            │
├─────────────────────────────────────────────────┤
│ Hero: 组织绩效改进平台                           │
├─────────────────────────────────────────────────┤
│ 4张卡片:                                         │
│ [战略解码] [绩效改进] [薪酬改革] [AI招聘]        │
├─────────────────────────────────────────────────┤
│ ┌───────────────────────┐ ┌─────────────────┐ │
│ │   AI顾问对话           │ │                 │ │
│ │   - 流式对话           │ │  (右侧空间保留)  │ │
│ │   - 输入框             │ │                 │ │
│ │   - 查看诊断结果 按钮  │ │                 │ │
│ └───────────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 状态B：报告模式

```
┌─────────────────────────────────────────────────┐
│ Header (简化版)                                  │
├─────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐  │
│ │            五维诊断报告                    │  │
│ │                                           │  │
│ │  ┌───────┐  ┌───────┐  ┌───────┐         │  │
│ │  │雷达图  │  │ 分数  │  │ 标签   │         │  │
│ │  └───────┘  └───────┘  └───────┘         │  │
│ │                                           │  │
│ │  ┌───────────────────────────────────┐   │  │
│ │  │ 关键问题                           │   │  │
│ │  │ - 问题1                            │   │  │
│ │  │ - 问题2                            │   │  │
│ │  └───────────────────────────────────┘   │  │
│ │                                           │  │
│ │  ┌───────────────────────────────────┐   │  │
│ │  │ 改进建议                           │   │  │
│ │  │ - 建议1                            │   │  │
│ │  │ - 建议2                            │   │  │
│ │  └───────────────────────────────────┘   │  │
│ │                                           │  │
│ │  [ 下载报告 ]  [ 回到对话 ]              │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 实施状态

### ✅ Step 1: 安装依赖 - 已完成
```bash
cd /Users/kjonekong/3strategy/portal
npm install @supabase/ssr @supabase/supabase-js
```

### ✅ Step 2: 复制核心文件 - 已完成

**已复制的文件**：
```
✅ lib/supabase/client-singleton.ts  - Supabase客户端单例
✅ lib/supabase/server.ts            - Supabase服务端客户端
✅ lib/ai/zhipu.ts                   - 智谱AI客户端
✅ app/actions/consultation.ts       - 咨询对话Server Action
✅ app/actions/diagnosis.ts          - 诊断会话Server Action
✅ lib/hooks/use-stream-chat.ts     - 流式对话Hook
✅ types/supabase.ts                 - Supabase类型定义
```

### ✅ Step 3: 配置环境变量 - 已完成

**`.env.local` 配置**：
```env
# Supabase (与deepconsult共享)
NEXT_PUBLIC_SUPABASE_URL=https://cnximbkrryvvbyyjtxwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI (Zhipu GLM-4)
ZHIPU_AI_KEY=9689f59575bd417b94e59d3d5e7041df.BU0UX7rmpTHun4BQ
```

### ✅ Step 4: 创建ConsultationWorkbench组件 - 已完成

**文件位置**: `/Users/kjonekong/3strategy/portal/components/consultation-workbench.tsx`

**功能**：
- 对话界面（流式响应）
- 消息输入框
- "查看诊断报告"按钮
- 会话初始化
- AI顾问欢迎消息

### ✅ Step 5: 创建DiagnosisReport组件 - 已完成

**文件位置**: `/Users/kjonekong/3strategy/portal/components/diagnosis-report-panel.tsx`

**功能**：
- 五维雷达图（Recharts）
- 各维度分数展示
- 关键标签显示
- 问题列表展示
- 改进建议展示
- 下载报告按钮
- 回到对话按钮

### ✅ Step 6: 修改主页 - 已完成

**文件**: `/Users/kjonekong/3strategy/portal/app/[locale]/page.tsx`

**修改内容**：
```typescript
// 已添加import
import { ConsultationWorkbench } from '@/components/consultation-workbench'

// 已在main底部添加
<ConsultationWorkbench />
```

---

## 文件清单

### 新增文件

| 文件路径 | 状态 | 描述 |
|---------|------|------|
| `lib/supabase/client-singleton.ts` | ✅ | Supabase客户端单例 |
| `lib/supabase/server.ts` | ✅ | Supabase服务端客户端 |
| `app/actions/consultation.ts` | ✅ | 咨询对话Server Action |
| `app/actions/diagnosis.ts` | ✅ | 诊断会话Server Action |
| `lib/hooks/use-stream-chat.ts` | ✅ | 流式对话Hook |
| `components/consultation-workbench.tsx` | ✅ | 对话工作台组件 |
| `components/diagnosis-report-panel.tsx` | ✅ | 诊断报告面板组件 |

### 修改文件

| 文件路径 | 状态 | 修改内容 |
|---------|------|---------|
| `app/[locale]/page.tsx` | ✅ | 集成ConsultationWorkbench |
| `.env.local` | ✅ | 添加Supabase和Zhipu AI配置 |

---

## 测试清单

### 功能测试

| 测试项 | 状态 | 测试方法 |
|-------|------|---------|
| 对话流程正常 | 📝 待测试 | 发送消息，接收AI流式回复 |
| "查看诊断结果"按钮 | 📝 待测试 | 点击按钮切换到报告模式 |
| 报告页面显示 | 📝 待测试 | 验证雷达图、分数、标签显示 |
| "回到对话"按钮 | 📝 待测试 | 点击按钮返回对话模式 |
| 数据状态保持 | 📝 待测试 | 切换状态后数据不丢失 |

### UI测试

| 测试项 | 状态 | 测试方法 |
|-------|------|---------|
| 响应式布局-桌面 | 📝 待测试 | 1920x1080分辨率 |
| 响应式布局-平板 | 📝 待测试 | 768x1024分辨率 |
| 响应式布局-手机 | 📝 待测试 | 375x667分辨率 |
| 4张卡片对齐 | 📝 待测试 | 与workbench对齐 |
| 状态切换动画 | 📝 待测试 | 流畅度验证 |

### 数据测试

| 测试项 | 状态 | 测试方法 |
|-------|------|---------|
| Supabase连接 | 📝 待测试 | 检查连接状态 |
| 会话创建 | 📝 待测试 | 验证diagnosis_sessions表 |
| Realtime更新 | 📝 待测试 | 验证数据实时同步 |
| 数据提取功能 | 📝 待测试 | 验证结构化数据提取 |

---

## 部署注意事项

### 前置条件

1. **Supabase配置**：
   - ✅ RLS策略已配置允许访客模式
   - ✅ 表结构已创建（diagnosis_sessions, chat_logs）
   - ⚠️ 需要验证生产环境配置

2. **环境变量**：
   - ⚠️ 生产环境需要配置正确的Supabase URL和Key
   - ⚠️ ZHIPU_AI_KEY需要在生产环境配置

3. **依赖版本**：
   - ⚠️ 需要验证@supabase/ssr版本兼容性

### 部署步骤

```bash
# 1. 本地测试
npm run dev
# 访问 http://localhost:3000
# 验证所有功能正常

# 2. 构建生产版本
npm run build

# 3. 部署到Vercel
vercel --prod

# 4. 验证生产环境
# 访问 https://www.3strategy.cc
# 验证所有功能正常
```

---

## 测试指令

### 本地开发服务器启动

```bash
cd /Users/kjonekong/3strategy/portal
npm run dev
```

### 测试URL

- 开发环境: http://localhost:3000
- 中文页面: http://localhost:3000/zh
- 英文页面: http://localhost:3000/en

### 功能测试步骤

1. **打开页面** → 验证4张卡片和对话界面正常显示
2. **发送消息** → 输入"我的组织绩效管理有问题" → 验证AI流式回复
3. **查看报告** → 点击"查看诊断报告"按钮 → 验证报告模式切换
4. **返回对话** → 点击"回到对话"按钮 → 验证对话模式恢复
5. **数据验证** → 检查Supabase数据库中的会话和聊天记录

---

## 故障排查

### 常见问题

| 问题 | 可能原因 | 解决方案 |
|-----|---------|---------|
| 无法连接Supabase | 环境变量未配置 | 检查`.env.local`配置 |
| AI回复失败 | Zhipu AI Key无效 | 检查`ZHIPU_AI_KEY` |
| 流式响应不工作 | Hook配置错误 | 检查`use-stream-chat.ts` |
| 报告数据为空 | 数据提取失败 | 检查`consultation.ts`中的extractInsights |
| 状态切换失败 | sessionId丢失 | 检查状态管理逻辑 |

---

## 更新日志

### 2026-03-09 - 代码实施完成 ✅

- ✅ 所有核心文件已复制
- ✅ 环境变量已配置
- ✅ 组件已创建并集成
- ✅ 主页已更新

**下一步**: 进行功能测试和UI测试

### 2026-03-08 - 项目启动

- 创建实施计划文档
- 定义UI设计和技术架构
