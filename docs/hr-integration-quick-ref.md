# 开源HR工具集成 - 快速参考

## 📁 项目文档索引

```
docs/
├── README.md                              # 文档导航
├── project-status.md                      # 项目状态跟踪
├── ai-resume-integration-plan.md          # AI Resume服务计划 (Phase 1)
├── complete-hr-integration-plan.md        # 完整集成计划 (NEW!)
├── hr-services-implementation-roadmap.md   # 实施路线图 (NEW!)
└── ai-resume-quick-start.md               # 快速参考
```

---

## 🎯 三大核心服务

### 1. Performance Service (绩效管理)

**来源**: [Frappe HRMS](https://github.com/frappe/hrms)

**核心功能**:
- OKR周期管理
- 目标创建与级联
- 绩效评估计算
- KRA (Key Result Area) 管理

**技术栈**: Python + PostgreSQL + Frappe Framework

**提取模块**:
```
frappe/hrms/hr/
├── doctype/appraisal/          # 绩效评估
├── doctype/goal/               # 目标管理
├── doctype/appraisal_cycle/     # OKR周期
└── mixins/appraisal.py          # 核心逻辑
```

**API端点**:
- `GET /api/cycles` - 获取OKR周期
- `POST /api/objectives` - 创建目标
- `POST /api/appraisals/{id}/calculate` - 计算绩效分

---

### 2. Compensation Service (薪酬计算)

**来源**: [Horilla](https://github.com/horilla-opensource/horilla)

**核心功能**:
- 薪酬宽带设计
- 工资单生成
- 个人所得税计算 (中国税制)
- 五险一金计算

**技术栈**: Django + PostgreSQL

**提取模块**:
```
horilla/payroll/
├── models/payroll_policy.py     # 薪酬政策
├── methods/calculate_payroll.py # 工资计算
└── methods/tax_calculation.py   # 税务计算
```

**API端点**:
- `POST /api/salary/broadband/design` - 设计薪酬宽带
- `POST /api/salary/calculate` - 计算工资
- `GET /api/salary/bands` - 获取宽带列表

---

### 3. Recruitment AI Service (招聘ATS) ✅

**来源**: [Arnavsao/hrms-platform](https://github.com/Arnavsao/hrms-platform)

**状态**: **已完成** ✅

**位置**: `/Users/kjonekong/3strategy/portal/ai-resume-service/`

**核心功能**:
- 简历解析 (PDF/DOCX)
- 技能提取
- 候选人匹配评分

**技术栈**: FastAPI + Python + OpenAI

---

## 🏗️ 部署架构

```
Node B (103.59.103.85)
├── Performance Service  :8001
├── Compensation Service :8002
├── Recruitment Service  :8003 (已完成)
└── Nginx (反向代理)    :80

Portal (139.224.42.111)
├── Next.js App          :3000
└── API Gateway          :/api/hr/*
```

---

## 📋 实施检查清单

### Phase 1: Performance Service

- [ ] 克隆Frappe HRMS
- [ ] 分析核心模块
- [ ] 提取appraisal逻辑
- [ ] 提取goal管理
- [ ] 创建FastAPI包装
- [ ] 编写单元测试
- [ ] Docker镜像构建
- [ ] 本地验证

### Phase 2: Compensation Service

- [ ] 克隆Horilla
- [ ] 分析payroll模块
- [ ] 提取tax计算
- [ ] 提取insurance计算
- [ ] 创建中国税制配置
- [ ] 编写单元测试
- [ ] Docker镜像构建
- [ ] 本地验证

### Phase 3: Portal集成

- [ ] 创建API Gateway
- [ ] 配置环境变量
- [ ] 更新OKR页面
- [ ] 更新薪酬页面
- [ ] 更新简历匹配页面
- [ ] E2E测试

---

## 🔗 关键链接

- **Frappe HRMS**: https://github.com/frappe/hrms
- **Horilla**: https://github.com/horilla-opensource/horilla
- **Arnavsao**: https://github.com/Arnavsao/hrms-platform
- **Portal**: /Users/kjonekong/3strategy/portal

---

## 📞 支持

- **完整计划**: `complete-hr-integration-plan.md`
- **实施路线**: `hr-services-implementation-roadmap.md`
- **项目状态**: `project-status.md`

---

*最后更新: 2025-03-08*
