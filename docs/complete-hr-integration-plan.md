# 3Strategy Portal - 开源HR工具完整集成实施计划

## 📋 项目概述

**目标**: 集成多个成熟开源HR项目，替换Portal中的mock实现，提供真实业务逻辑

**技术架构**: 混合微服务架构
- **Frontend**: Portal (Next.js 16)
- **Backend Services**: 独立部署的开源模块
- **API Gateway**: Portal API Routes
- **Database**: Supabase PostgreSQL

---

## 🎯 核心需求矩阵

| 功能领域 | 当前状态 | 目标状态 | 优先级 | 开源候选 |
|---------|---------|---------|--------|----------|
| **绩效管理** | Mock UI | 真实OKR/KPI逻辑 | P0 | Frappe Performance |
| **薪酬计算** | 简单公式 | 完整薪酬体系 | P0 | Horilla Payroll |
| **招聘ATS** | 关键词匹配 | AI简历解析+匹配 | P0 | Arnavsao AI |
| **九宫格** | 静态展示 | 动态评估逻辑 | P1 | 自研增强 |

---

## 🏗️ 技术架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Portal (Next.js 16)                       │
│  - UI: shadcn/ui + TailwindCSS                             │
│  - API Routes: /api/hr/*                                    │
│  - Pages: /tools/okr, /tools/broadband, /tools/resume-match │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API over HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Portal API Routes)                │
│  - 统一认证                                                  │
│  - 请求转发                                                  │
│  - 数据聚合                                                  │
│  - 错误处理                                                  │
└─────┬───────────────┬───────────────┬────────────────────────┘
      │               │               │
      ▼               ▼               ▼
┌───────────┐   ┌───────────┐   ┌─────────────┐
│Performance│   │Compensation│   │Recruitment   │
│  Service  │   │  Service   │   │   Service    │
│(Frappe)   │   │ (Horilla)  │   │(Arnavsao)   │
└───────────┘   └───────────┘   └─────────────┘
    :8001           :8002             :8003
```

---

## 📦 Phase 1: 绩效管理服务 (Frappe Performance)

### 1.1 选型分析

**项目**: Frappe HRMS Performance Module

**优势**:
- ✅ 完整的OKR/KPI框架
- ✅ 360度评估体系
- ✅ 目标级联功能
- ✅ REST API就绪
- ✅ 15年+生产验证

**技术栈**:
- Backend: Python (Frappe Framework)
- Frontend: Vue.js
- Database: PostgreSQL/MariaDB

### 1.2 模块提取方案

#### 核心模块识别

```
frappe/hrms/
├── hr/
│   └── doctype/
│       ├── appraisal/              # 绩效评估
│       │   ├── appraisal.py
│       │   ├── appraisal_goal.py
│       │   └── appraisal_kra.py     # KRA: Key Result Area
│       └── performance_feedback/    # 360度反馈
└── payroll/
    └── doctype/
        ├── salary_structure/        # 薪酬结构
        ├── salary_slip/             # 工资单
        └── employee_tax/            # 税务计算
```

#### 提取策略

**方案A: 最小化提取 (推荐)**
```
独立服务目录:
performance-service/
├── modules/
│   ├── appraisal.py           # 从frappe提取核心逻辑
│   ├── goal.py                # 目标管理
│   └── feedback.py            # 反馈管理
├── models/                    # 独立数据模型
│   └── schemas.py
└── api/
    └── routes.py
```

**提取的核心函数**:
1. `calculate_appraisal_score()` - 绩效评分计算
2. `cascade_goals()` - 目标级联
3. `generate_feedback_summary()` - 反馈汇总

### 1.3 数据模型设计

```sql
-- 绩效管理表结构

-- OKR周期
CREATE TABLE okr_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- OKR目标
CREATE TABLE okr_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES okr_cycles(id),
    employee_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),  -- KRA分类
    weight INTEGER DEFAULT 0,  -- 权重
    parent_id UUID REFERENCES okr_objectives(id),  -- 级联关系
    progress DECIMAL(5,2) DEFAULT 0,  -- 进度0-100
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- OKR关键结果
CREATE TABLE okr_key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES okr_objectives(id),
    title VARCHAR(200) NOT NULL,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    unit VARCHAR(20),  -- %, count, score等
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending'
);

-- 绩效评估
CREATE TABLE appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL,
    cycle_id UUID REFERENCES okr_cycles(id),
    overall_score DECIMAL(5,2),
    feedback_summary TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 评估详情
CREATE TABLE appraisal_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appraisal_id UUID REFERENCES appraisals(id),
    kra_category VARCHAR(50),
    score DECIMAL(5,2),
    weight INTEGER,
    comments TEXT
);
```

### 1.4 API接口设计

```python
# FastAPI路由示例

from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/performance", tags=["performance"])

class OKRObjective(BaseModel):
    id: str
    title: str
    category: str
    weight: int
    progress: float
    status: str

class OKRCycle(BaseModel):
    id: str
    name: str
    start_date: str
    end_date: str
    status: str

@router.get("/cycles")
async def list_cycles() -> List[OKRCycle]:
    """获取所有OKR周期"""
    pass

@router.get("/cycles/{cycle_id}/objectives")
async def list_objectives(cycle_id: str) -> List[OKRObjective]:
    """获取周期内的所有目标"""
    pass

@router.post("/objectives")
async def create_objective(objective: OKRObjective):
    """创建新目标"""
    pass

@router.post("/objectives/{id}/progress")
async def update_progress(id: str, progress: float):
    """更新目标进度"""
    pass

@router.post("/appraisals/{cycle_id}/calculate")
async def calculate_appraisal(cycle_id: str, employee_id: str):
    """计算绩效评估分数"""
    # 核心计算逻辑
    score = calculate_appraisal_score(employee_id, cycle_id)
    return {"score": score}
```

### 1.5 Portal集成

```typescript
// app/api/performance/cycles/route.ts
export async function GET() {
  const response = await fetch(
    `${process.env.PERFORMANCE_SERVICE_URL}/api/performance/cycles`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.PERFORMANCE_SERVICE_API_KEY}`
      }
    }
  )
  const cycles = await response.json()
  return NextResponse.json(cycles)
}
```

---

## 💰 Phase 2: 薪酬计算服务 (Horilla Payroll)

### 2.1 选型分析

**项目**: Horilla HRMS Payroll Module

**优势**:
- ✅ 完整的薪酬宽带设计
- ✅ 工资单生成
- ✅ 税务计算
- ✅ 社保/公积金支持
- ✅ 多国税务规则

**技术栈**:
- Backend: Django + Python
- Database: PostgreSQL

### 2.2 模块提取方案

#### 核心模块识别

```
horilla/
├── payroll/
│   ├── models/
│   │   ├── payroll_policy.py       # 薪酬政策
│   │   ├── payroll_settings.py      # 薪酬设置
│   │   ├── employee_tax.py          # 税务
│   │   └── reimbursement.py         # 报销
│   ├── methods/
│   │   ├── calculate_payroll.py     # 薪酬计算
│   │   ├── tax_calculation.py       # 税务计算
│   │   └── pf_calculation.py        # 公积金计算
│   └── api/
│       └── urls.py
└── base/
    └── methods/
        └── insurance_calculation.py  # 五险一金
```

#### 提取的核心函数

1. **薪酬计算核心**:
```python
def calculate_net_salary(
    gross_salary: float,
    tax_config: TaxConfig,
    insurance_config: InsuranceConfig,
    benefits: List[Benefit]
) -> PayrollResult:
    """
    计算实发工资

    公式: 实发 = 应发 - 个人所得税 - 社保个人部分 - 公积金个人部分 + 补贴
    """
    # 1. 计算应纳税所得额
    taxable_income = calculate_taxable_income(gross_salary, insurance_config)

    # 2. 计算个人所得税
    income_tax = calculate_income_tax(taxable_income, tax_config)

    # 3. 计算社保和公积金
    personal_insurance = calculate_personal_insurance(gross_salary, insurance_config)

    # 4. 计算补贴
    total_benefits = sum(b.amount for b in benefits)

    # 5. 计算实发
    net_salary = gross_salary - income_tax - personal_insurance + total_benefits

    return PayrollResult(
        gross_salary=gross_salary,
        income_tax=income_tax,
        insurance=personal_insurance,
        benefits=total_benefits,
        net_salary=net_salary
    )
```

2. **宽带薪酬设计**:
```python
def design_salary_broadband(
    job_level: str,
    mid_salary: float,
    overlap_rate: float = 0.5
) -> SalaryBand:
    """
    设计薪酬宽带

    宽带薪酬 = [最小值, 中位值, 最大值]
    最小值 = 中位值 / (1 + 范围系数/2)
    最大值 = 中位值 * (1 + 范围系数/2)
    """
    range_coefficient = {  # 薪酬范围系数
        'P1': 0.40,  # 初级: ±20%
        'P2': 0.50,  # 中级: ±25%
        'P3': 0.60,  # 高级: ±30%
        'P4': 0.80,  # 专家: ±40%
    }

    coeff = range_coefficient.get(job_level, 0.50)

    return SalaryBand(
        level=job_level,
        min_salary=mid_salary / (1 + coeff/2),
        mid_salary=mid_salary,
        max_salary=mid_salary * (1 + coeff/2),
        overlap=overlap_rate
    )
```

### 2.3 数据模型设计

```sql
-- 薪酬管理表结构

-- 薪酬宽带
CREATE TABLE salary_bands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_level VARCHAR(20) NOT NULL UNIQUE,
    level_name VARCHAR(50),
    min_salary DECIMAL(12,2) NOT NULL,
    mid_salary DECIMAL(12,2) NOT NULL,
    max_salary DECIMAL(12,2) NOT NULL,
    overlap_rate DECIMAL(3,2) DEFAULT 0.50
);

-- 员工薪酬
CREATE TABLE employee_salary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE,
    job_level VARCHAR(20) REFERENCES salary_bands(job_level),
    base_salary DECIMAL(12,2),
    performance_bonus DECIMAL(3,2),  -- 绩效奖金系数
    effective_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 薪酬政策
CREATE TABLE payroll_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tax_rate_config JSONB,  -- 税率配置
    insurance_config JSONB,  -- 社保配置
    bonus_rules JSONB,  -- 奖金规则
    effective_date DATE
);

-- 工资单
CREATE TABLE salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50),
    month VARCHAR(7),  -- YYYY-MM
    gross_salary DECIMAL(12,2),
    income_tax DECIMAL(12,2),
    insurance DECIMAL(12,2),
    bonus DECIMAL(12,2),
    net_salary DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.4 API接口设计

```python
# FastAPI路由

class SalaryBandRequest(BaseModel):
    job_level: str
    mid_salary: float
    overlap_rate: float = 0.5

@router.post("/api/salary/broadband")
async def design_broadband(req: SalaryBandRequest):
    """设计薪酬宽带"""
    band = design_salary_broadband(req.job_level, req.mid_salary, req.overlap_rate)
    return band

class PayrollRequest(BaseModel):
    employee_id: str
    base_salary: float
    performance_bonus: float = 0
    benefits: List[float] = []

@router.post("/api/salary/calculate")
async def calculate_payroll(req: PayrollRequest):
    """计算工资"""
    result = calculate_net_salary(
        req.base_salary,
        get_tax_config(),
        get_insurance_config(),
        req.benefits
    )
    return result
```

---

## 👔 Phase 3: 招聘ATS服务 (Arnavsao AI)

### 3.1 已完成 ✅

**状态**: 核心模块已提取完成

**文件位置**: `/Users/kjonekong/3strategy/portal/ai-resume-service/`

**功能**:
- ✅ 简历解析 (PDF/DOCX)
- ✅ 技能提取
- ✅ 候选人匹配
- ✅ REST API

---

## 🚀 Phase 4: 集成实施计划

### 4.1 实施时间线

| 阶段 | 任务 | 周期 | 负责模块 | 依赖 |
|------|------|------|----------|------|
| Week 1 | 绩效服务提取 | 5天 | Frappe Performance | - |
| Week 2 | 薪酬服务提取 | 5天 | Horilla Payroll | - |
| Week 3 | 服务部署测试 | 3天 | All | Week 1-2 |
| Week 3 | Portal API Gateway | 3天 | Portal Routes | 服务部署 |
| Week 4 | UI集成 | 4天 | Portal Pages | API Gateway |
| Week 4 | 测试优化 | 3天 | All | UI集成 |

### 4.2 部署架构

```
Node A (139.224.42.111) - 主服务器
├── Portal (Next.js)
│   ├── Port 3000
│   └── API Routes
│
Node B (103.59.103.85) - HR服务
├── Performance Service (Port 8001)
├── Compensation Service (Port 8002)
├── Recruitment AI Service (Port 8003)
└── Nginx (反向代理)
```

### 4.3 服务器配置

**Nginx配置** (Node B):
```nginx
server {
    listen 80;
    server_name hr.3strategy.cc;

    location /api/performance/ {
        proxy_pass http://localhost:8001/api/;
    }

    location /api/compensation/ {
        proxy_pass http://localhost:8002/api/;
    }

    location /api/recruitment/ {
        proxy_pass http://localhost:8003/api/;
    }
}
```

---

## 📊 服务对比矩阵

| 特性 | Performance (Frappe) | Compensation (Horilla) | Recruitment (Arnavsao) |
|------|---------------------|------------------------|------------------------|
| **开源协议** | GPL-3.0 | LGPL-3.0 | MIT |
| **语言** | Python | Python (Django) | Python (FastAPI) |
| **数据库** | PostgreSQL/MariaDB | PostgreSQL | Supabase |
| **REST API** | ✅ | ✅ | ✅ |
| **Docker** | ✅ | ✅ | ✅ |
| **提取难度** | 中 | 中 | 低 |
| **成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **文档质量** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔧 实施步骤详解

### Step 1: 环境准备

```bash
# 在Node B服务器上
ssh root@103.59.103.85

# 安装Docker
curl -fsSL https://get.docker.com | sh

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 创建项目目录
mkdir -p /opt/hr-services
cd /opt/hr-services
```

### Step 2: 服务部署 (并行)

```bash
# 1. Performance Service
cd /opt/hr-services
git clone https://github.com/frappe/hrms performance-service
cd performance-service
# 提取核心模块...
docker build -t hr-performance:latest .
docker run -d -p 8001:8000 hr-performance:latest

# 2. Compensation Service
cd /opt/hr-services
git clone https://github.com/horilla-opensource/horilla compensation-service
cd compensation-service
# 提取核心模块...
docker build -t hr-compensation:latest .
docker run -d -p 8002:8000 hr-compensation:latest

# 3. Recruitment AI Service
cd /opt/hr-services
# 复制已完成的ai-resume-service
docker build -t hr-recruitment:latest .
docker run -d -p 8003:8000 hr-recruitment:latest
```

### Step 3: Portal集成

```bash
# 在Portal项目
cd /Users/kjonekong/3strategy/portal

# 1. 创建API Gateway
mkdir -p app/api/hr/{performance,compensation,recruitment}

# 2. 添加环境变量
# .env.local
PERFORMANCE_SERVICE_URL=http://103.59.103.85:8001
COMPENSATION_SERVICE_URL=http://103.59.103.85:8002
RECRUITMENT_SERVICE_URL=http://103.59.103.85:8003

# 3. 创建客户端SDK
# lib/hr-services-client.ts
```

---

## 📝 数据一致性策略

### 方案1: API转发 (推荐用于MVP)

```
Portal → API Routes → 直接转发请求
```

**优势**: 实现简单，快速上线
**劣势**: 数据分散，无本地缓存

### 方案2: 数据同步 (推荐用于生产)

```
Portal DB ← Webhook ← Services
         ↓
      本地缓存
```

**优势**: 数据集中，性能好
**劣势**: 复杂度高，需要同步逻辑

### 方案3: 混合模式

```
关键数据 → 实时转发
历史数据 → 定期同步 + 本地缓存
```

---

## 🎯 成功标准

### 功能完整性
- [ ] OKR管理: 目标创建、进度跟踪、级联、评估
- [ ] 薪酬计算: 宽带设计、工资单生成、税务计算
- [ ] 简历匹配: AI解析、技能匹配、评分排序

### 性能指标
- [ ] API响应 < 500ms (P95)
- [ ] 并发支持 > 100 req/s
- [ ] 系统可用性 > 99%

### 用户体验
- [ ] 无缝集成，用户感知不到后端切换
- [ ] 保持现有UI/UX风格
- [ ] 支持中英文双语

---

## 🚨 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Python环境兼容性 | 高 | 使用Docker容器化 |
| API版本变化 | 中 | 固定服务版本，使用API Gateway |
| 数据一致性 | 中 | Webhook + 定期同步 |
| 性能瓶颈 | 中 | Redis缓存 + CDN |
| 维护成本 | 低 | 模块化设计，易于替换 |

---

## 📅 交付物

1. **Performance Service** (Docker镜像)
2. **Compensation Service** (Docker镜像)
3. **Recruitment AI Service** (已完成)
4. **Portal API Gateway** (代码)
5. **UI集成** (页面更新)
6. **部署文档** (运维手册)
7. **用户手册** (使用指南)

---

## 🔄 迭代路线图

**V1.0** (4周后):
- ✅ 三个核心服务上线
- ✅ Portal基础集成
- ✅ 基础功能可用

**V2.0** (8周后):
- 🔄 数据同步优化
- 🔄 高级功能（批量操作、导出）
- 🔄 性能优化

**V3.0** (12周后):
- 🔄 AI增强（智能推荐、预测）
- 🔄 移动端适配
- 🔄 数据分析看板

---

**文档版本**: v2.0
**最后更新**: 2025-03-08
**状态**: 待审核
