# 完整HR工具集成 - 实施路线图

## 🎯 总体目标

将Portal中的mock HR工具替换为**真实的开源项目集成**，涵盖：

1. **绩效管理** (OKR/KPI) - 来自Frappe HRMS
2. **薪酬计算** (宽带/套改) - 来自Horilla
3. **招聘ATS** (简历匹配) - 来自Arnavsao

---

## 📊 集成方案对比

### 方案A: 微服务架构 (推荐) ⭐

```
Portal (Next.js)
    ↓
API Gateway (统一认证、路由)
    ↓
┌──────────┬──────────┬──────────┐
│Performance│Compensation│Recruitment│
│ Service   │  Service  │  Service  │
└──────────┴──────────┴──────────┘
```

**优势**: 解耦、可扩展、易维护
**劣势**: 运维复杂度增加

### 方案B: 单体集成

直接将代码集成到Portal后端

**优势**: 部署简单
**劣势**: 技术栈冲突、维护困难

**✅ 选择方案A**

---

## 🏗️ 技术栈选型

| 服务 | 开源项目 | 技术栈 | 提取模块 |
|------|---------|--------|---------|
| Performance | [Frappe HRMS](https://github.com/frappe/hrms) | Python + PostgreSQL | appraisal, goal, feedback |
| Compensation | [Horilla](https://github.com/horilla-opensource/horilla) | Django + PostgreSQL | payroll, tax, insurance |
| Recruitment | [Arnavsao/hrms-platform](https://github.com/Arnavsao/hrms-platform) | FastAPI + Supabase | resume parser, matcher |

---

## 📦 详细实施计划

### Phase 1: Performance Service (Week 1-2)

#### 1.1 源项目分析

```bash
# 克隆Frappe HRMS
git clone https://github.com/frappe/hrms
cd hrms

# 分析核心模块
find hr -name "*appraisal*" -o -name "*goal*" -o -name "*kra*"
```

**核心文件**:
- `hr/doctype/appraisal/` - 绩效评估
- `hr/mixins/appraisal.py` - 评估逻辑
- `hr/doctype/goal/` - 目标管理

#### 1.2 提取计划

```python
# 提取的核心函数

def calculate_appraisal_score(appraisal_id: str) -> dict:
    """
    计算绩效评估分数

    来源: frappe/hrms/hr/mixins/appraisal.py
    """
    # 1. 获取评估的所有KRA
    kras = get_appraisal_kras(appraisal_id)

    # 2. 计算每个KRA的得分
    total_score = 0
    total_weight = 0

    for kra in kras:
        kra_score = kra.goal_score * (kra.weight / 100)
        total_score += kra_score
        total_weight += kra.weight

    # 3. 计算加权总分
    final_score = total_score / total_weight if total_weight > 0 else 0

    return {
        'total_score': final_score,
        'kra_breakdown': kras,
        'rating': get_rating_from_score(final_score)
    }

def cascade_goals(parent_goal_id: str, child_level: int = 1) -> list:
    """
    目标级联：将上级目标分解为下级目标

    来源: frappe/hrms/hr/doctype/goal/goal.py
    """
    # 1. 获取父目标
    parent_goal = get_goal(parent_goal_id)

    # 2. 根据下属职级创建子目标
    subordinates = get_subordinates(parent_goal.employee, parent_goal.level)

    child_goals = []
    for emp in subordinates:
        child = create_child_goal(
            parent=parent_goal,
            employee=emp,
            level=child_level,
            weight=calculate_weight_allocation(parent_goal, emp)
        )
        child_goals.append(child)

    return child_goals
```

#### 1.3 独立服务结构

```
performance-service/
├── main.py                      # FastAPI入口
├── requirements.txt
├── Dockerfile
├── modules/
│   ├── appraisal.py             # 评估模块
│   ├── goal.py                  # 目标模块
│   ├── kra.py                   # KRA模块
│   └── feedback.py              # 反馈模块
├── models/
│   └── schemas.py               # Pydantic模型
└── tests/
    └── test_appraisal.py
```

#### 1.4 API端点

| 端点 | 功能 | 来源 |
|------|------|------|
| GET /api/cycles | 获取OKR周期列表 | frappe/goal_cycle |
| POST /api/objectives | 创建目标 | frappe/goal |
| POST /api/appraisals/{id}/calculate | 计算绩效分 | 自主实现 |
| GET /api/employees/{id}/goals | 获取员工目标 | frappe/goal |

---

### Phase 2: Compensation Service (Week 2-3)

#### 2.1 源项目分析

```bash
# 克隆Horilla
git clone https://github.com/horilla-opensource/horilla
cd horilla

# 分析薪酬模块
find payroll -name "*.py" | grep -E "(tax|salary|insurance)"
```

**核心文件**:
- `payroll/models/payroll_policy.py` - 薪酬政策
- `payroll/methods/calculate_payroll.py` - 薪酬计算
- `base/methods/insurance_calculation.py` - 五险一金

#### 2.2 提取计划

```python
# 提取的核心函数

def calculate_payroll(
    employee_id: str,
    month: str,
    policy_id: str
) -> dict:
    """
    计算月度工资

    来源: horilla/payroll/methods/calculate_payroll.py
    """
    # 1. 获取员工基本信息
    employee = get_employee(employee_id)

    # 2. 获取薪酬政策
    policy = get_payroll_policy(policy_id)

    # 3. 计算应发工资
    base_salary = employee.base_salary

    # 4. 计算补贴
    allowances = calculate_allowances(employee, policy)

    # 5. 计算扣除项
    # 5.1 个人所得税
    income_tax = calculate_income_tax(base_salary, policy.tax_config)

    # 5.2 社保个人部分
    insurance = calculate_employee_insurance(base_salary, policy.insurance_config)

    # 5.3 公积金个人部分
    provident_fund = calculate_employee_pf(base_salary, policy.pf_config)

    # 6. 计算实发工资
    gross_salary = base_salary + allowances
    deductions = income_tax + insurance + provident_fund
    net_salary = gross_salary - deductions

    return {
        'gross_salary': gross_salary,
        'income_tax': income_tax,
        'insurance': insurance,
        'provident_fund': provident_fund,
        'net_salary': net_salary,
        'breakdown': {
            'base': base_salary,
            'allowances': allowances,
            'deductions': deductions
        }
    }

def design_salary_band(
    job_level: str,
    market_data: dict
) -> dict:
    """
    设计薪酬宽带

    来源: 综合Horilla最佳实践
    """
    # 薪酬宽带设计公式
    # Min = Market_Median × (1 - Range%/2)
    # Mid = Market_Median
    # Max = Market_Median × (1 + Range%/2)

    range_pct = get_range_percentage(job_level)
    median = market_data['median']

    return {
        'level': job_level,
        'min_salary': median * (1 - range_pct/2),
        'mid_salary': median,
        'max_salary': median * (1 + range_pct/2),
        'overlap': calculate_overlap(job_level, market_data['overlap_level'])
    }

def get_range_percentage(job_level: str) -> float:
    """
    获取薪酬范围百分比

    P1 (初级): 40%  → Min:80%, Max:120%
    P2 (中级): 50%  → Min:75%, Max:125%
    P3 (高级): 60%  → Min:70%, Max:130%
    P4 (专家): 80%  → Min:60%, Max:140%
    """
    ranges = {
        'P1': 0.40,
        'P2': 0.50,
        'P3': 0.60,
        'P4': 0.80
    }
    return ranges.get(job_level, 0.50)

def calculate_income_tax(taxable_income: float, tax_config: dict) -> float:
    """
    计算个人所得税 (中国累进税率)

    来源: horilla/payroll/models/tax/slabs.py (中国税制)
    """
    # 中国个人所得税7级累进税率
    tax_brackets = [
        (0, 36000, 0.03, 0),
        (36000, 144000, 0.10, 2520),
        (144000, 300000, 0.20, 16920),
        (300000, 420000, 0.25, 31920),
        (420000, 660000, 0.30, 52920),
        (660000, 960000, 0.35, 85920),
        (960000, float('inf'), 0.45, 181920)
    ]

    tax = 0
    remaining_income = taxable_income

    for lower, upper, rate, quick_deduction in tax_brackets:
        if remaining_income <= 0:
            break

        taxable_in_bracket = min(remaining_income, upper - lower)
        tax += taxable_in_bracket * rate - quick_deduction * (taxable_in_bracket / (upper - lower))
        remaining_income -= taxable_in_bracket

    return max(0, tax)

def calculate_employee_insurance(
    salary: float,
    insurance_config: dict
) -> dict:
    """
    计算社保个人部分

    来源: horilla/base/methods/insurance_calculation.py
    """
    # 中国社保费率 (个人部分)
    # 养老保险: 8%
    # 医疗保险: 2%
    # 失业保险: 0.5% (2023年起)
    # 工伤保险: 0 (个人不缴费)
    # 生育保险: 0 (个人不缴费)

    pension = salary * insurance_config.get('pension_rate', 0.08)
    medical = salary * insurance_config.get('medical_rate', 0.02)
    unemployment = salary * insurance_config.get('unemployment_rate', 0.005)

    return {
        'pension': pension,
        'medical': medical,
        'unemployment': unemployment,
        'total': pension + medical + unemployment
    }
```

#### 2.3 独立服务结构

```
compensation-service/
├── main.py
├── requirements.txt
├── Dockerfile
├── modules/
│   ├── payroll.py               # 工资计算
│   ├── tax.py                   # 税务计算
│   ├── insurance.py             # 社保计算
│   ├── broadbands.py            # 宽带设计
│   └── salary_adjustment.py     # 套改计算
├── models/
│   ├── schemas.py
│   └── tax_tables.py            # 税率表
└── config/
    ├── tax_china.py             # 中国税制
    └── insurance_china.py       # 中国社保
```

#### 2.4 API端点

| 端点 | 功能 | 来源 |
|------|------|------|
| POST /api/salary/broadband/design | 设计薪酬宽带 | 自主实现 |
| POST /api/salary/calculate | 计算工资 | horilla/calculate_payroll |
| GET /api/salary/bands | 获取宽带列表 | horilla/payroll_policy |
| POST /api/salary/adjustment | 套改计算 | 自主实现 |

---

### Phase 3: 集成与部署 (Week 4)

#### 3.1 Portal API Gateway

```typescript
// lib/hr-services-client.ts
interface HRServiceClient {
  performance: PerformanceClient
  compensation: CompensationClient
  recruitment: RecruitmentClient
}

class PerformanceClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.PERFORMANCE_SERVICE_URL || ''
  }

  async listCycles() {
    const response = await fetch(`${this.baseUrl}/api/cycles`)
    return response.json()
  }

  async createObjective(data: any) {
    const response = await fetch(`${this.baseUrl}/api/objectives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async calculateAppraisal(cycleId: string, employeeId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/appraisals/calculate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId, employeeId })
      }
    )
    return response.json()
  }
}

class CompensationClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.COMPENSATION_SERVICE_URL || ''
  }

  async designBroadband(level: string, midSalary: number) {
    const response = await fetch(`${this.baseUrl}/api/salary/broadband/design`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobLevel: level, midSalary })
    })
    return response.json()
  }

  async calculatePayroll(employeeId: string, month: string) {
    const response = await fetch(`${this.baseUrl}/api/salary/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, month })
    })
    return response.json()
  }
}

export const hrClient: HRServiceClient = {
  performance: new PerformanceClient(),
  compensation: new CompensationClient(),
  recruitment: new RecruitmentClient()
}
```

#### 3.2 环境变量配置

```env
# Portal .env.local

# Performance Service
PERFORMANCE_SERVICE_URL=http://103.59.103.85:8001
PERFORMANCE_SERVICE_API_KEY=xxx

# Compensation Service
COMPENSATION_SERVICE_URL=http://103.59.103.85:8002
COMPENSATION_SERVICE_API_KEY=xxx

# Recruitment Service
RECRUITMENT_SERVICE_URL=http://103.59.103.85:8003
RECRUITMENT_SERVICE_API_KEY=xxx
```

#### 3.3 Docker Compose编排

```yaml
# hr-services-docker-compose.yml

version: '3.8'

services:
  # Performance Service
  performance-service:
    build: ./performance-service
    container_name: hr-performance
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/performance
    depends_on:
      - db
    restart: unless-stopped

  # Compensation Service
  compensation-service:
    build: ./compensation-service
    container_name: hr-compensation
    ports:
      - "8002:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/compensation
    depends_on:
      - db
    restart: unless-stopped

  # Recruitment Service (已完成)
  recruitment-service:
    build: ./ai-resume-service
    container_name: hr-recruitment
    ports:
      - "8003:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  # Shared Database
  db:
    image: postgres:15-alpine
    container_name: hr-postgres
    environment:
      - POSTGRES_USER=hr_user
      - POSTGRES_PASSWORD=hr_pass
      - POSTGRES_DB=hr_services
    volumes:
      - hr_pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: hr-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - performance-service
      - compensation-service
      - recruitment-service
    restart: unless-stopped

volumes:
  hr_pgdata:
```

---

## 📅 实施时间表

| Week | 任务 | 交付物 |
|------|------|--------|
| 1 | Performance服务提取 | Docker镜像 |
| 1 | Performance本地测试 | 测试报告 |
| 2 | Compensation服务提取 | Docker镜像 |
| 2 | Compensation本地测试 | 测试报告 |
| 3 | 服务部署到Node B | 3个运行服务 |
| 3 | Portal API Gateway | 代码提交 |
| 4 | UI集成 + E2E测试 | 完整功能 |

---

## ✅ 验收标准

### 功能验收
- [ ] Performance: OKR目标创建、进度更新、绩效评分
- [ ] Compensation: 宽带设计、工资计算、税务处理
- [ ] Recruitment: 简历解析、技能匹配、评分排序

### 性能验收
- [ ] API P95延迟 < 500ms
- [ ] 并发100请求无错误
- [ ] 服务可用性 > 99%

### 集成验收
- [ ] Portal无缝调用各服务
- [ ] 统一认证鉴权
- [ ] 错误处理完善

---

**文档版本**: v1.0
**更新日期**: 2025-03-08
