# AI Resume Integration - 文档索引

## 📚 文档导航

### 快速开始
- **[快速参考](./ai-resume-quick-start.md)** - 常用命令、API端点、故障排查

### 项目管理
- **[项目状态](./project-status.md)** - 当前进度、任务状态、阻塞问题
- **[实施计划](./ai-resume-integration-plan.md)** - 完整的4周实施计划和技术方案

### 相关文档
- **[综合研究报告](./open-source-hr-tools-research.md)** - 开源HR工具调研结果（如存在）

---

## 🎯 项目概览

**目标**: 集成AI简历解析服务到Portal，提供智能简历筛选功能

**核心功能**:
1. 简历解析 (PDF/DOCX → 结构化数据)
2. 技能提取与匹配
3. 候选人评分与排序
4. AI辅助筛选面试

**技术栈**:
- Frontend: Next.js 16 + React 19 + TypeScript + shadcn/ui
- AI Service: FastAPI + LangChain + Gemini (OpenRouter)
- Database: Supabase (PostgreSQL)
- Deployment: Node B (103.59.103.85)

---

## 📊 当前进度

```
Phase 0: ████████░░ 80%  (需求确认与技术调研) ← 当前
Phase 1: ░░░░░░░░░░ 0%   (AI Service提取与部署)
Phase 2: ░░░░░░░░░░ 0%   (Portal集成)
Phase 3: ░░░░░░░░░░ 0%   (配置与文档)
Phase 4: ░░░░░░░░░░ 0%   (测试与优化)
```

**预计完成**: 2025-04-05

---

## 🚀 快速链接

### 资源链接
- **Arnavsao项目**: https://github.com/Arnavsao/hrms-platform
- **Frappe HRMS**: https://github.com/frappe/hrms
- **Portal仓库**: /Users/kjonekong/3strategy/portal

### 服务器信息
- **Node A (Portal)**: 139.224.42.111
- **Node B (AI Service)**: 103.59.103.85
- **域名**: www.3strategy.cc

---

## 📋 最近更新

### 2025-03-08
- ✅ 完成需求确认
- ✅ 完成技术调研
- ✅ 制定详细实施计划
- ✅ 创建项目状态跟踪文件
- ✅ 创建快速参考指南

### 下一步行动
1. 验证Arnavsao项目本地运行
2. 提取AI Resume Service模块
3. 重构核心代码以独立部署

---

## 📞 支持

如有问题，请查阅：
1. [快速参考](./ai-resume-quick-start.md) - 故障排查
2. [实施计划](./ai-resume-integration-plan.md) - 详细技术方案
3. [项目状态](./project-status.md) - 当前进度和问题

---

*最后更新: 2025-03-08*
