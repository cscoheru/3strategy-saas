# Portal HR微服务集成完成报告

**集成日期**: 2026-03-08
**版本**: 1.0.0

---

## ✅ 集成状态总览

| 服务 | 端口 | 状态 | Portal页面 | 集成方式 |
|------|------|------|-----------|---------|
| **Recruitment** | 8000 | 🟢 运行中 | `/tools/resume-match` | ✅ 已集成 |
| **Performance** | 8001 | 🟢 运行中 | `/tools/okr` | ✅ 已集成 |
| **Compensation** | 8002 | 🟢 运行中 | `/tools/broadband` | ✅ 已集成 |

---

## 📁 文件结构

### 新增/修改的文件

```
portal/
├── lib/
│   └── hr-api.ts                    # ✅ 统一API客户端
├── app/[locale]/tools/
│   ├── resume-match/
│   │   └── page.tsx                 # ✅ 简历匹配（已集成）
│   ├── okr/
│   │   └── page.tsx                 # ✅ OKR设计器（已集成）
│   └── broadband/
│       └── page.tsx                 # ✅ 宽带薪酬（已集成）
└── .env.local.hr                    # ✅ API配置文件
```

---

## 🔌 API集成详情

### 1. Recruitment API (Port 8000)

**端点**:
- `POST /api/v1/parse` - 简历解析
- `POST /api/v1/match` - 候选人匹配

**集成页面**: `/tools/resume-match`

**功能**:
- ✅ 上传PDF/DOCX简历
- ✅ AI解析（智谱AI glm-4-flash）
- ✅ 提取技能、经验、教育
- ✅ 候选人与岗位匹配

**示例调用**:
```typescript
import { recruitmentApi } from '@/lib/hr-api'

const result = await recruitmentApi.parseResume(file)
const match = await recruitmentApi.matchCandidate({
  resume: result.data,
  job_description: { ... }
})
```

---

### 2. Performance API (Port 8001)

**端点**:
- `POST /api/v1/objectives` - 创建目标
- `GET /api/v1/objectives/{employee_id}` - 获取目标
- `PUT /api/v1/objectives/{id}/progress` - 更新进度
- `POST /api/v1/kpis` - 创建KPI
- `GET /api/v1/kpis/{employee_id}` - 获取KPI

**集成页面**: `/tools/okr`

**功能**:
- ✅ OKR目标管理
- ✅ 关键结果(KR)跟踪
- ✅ 权重验证（总权重100%）
- ✅ 进度自动计算
- ✅ 保存到Performance Service

**核心算法**:
```python
# OKR评分 (70%)
okr_score = Σ(kr.score × kr.weight) / 100

# KPI评分 (30%)
kpi_score = Σ(kpi.achievement_rate × kpi.weight) / 100

# 综合评分
total_score = okr_score × 0.7 + kpi_score × 0.3
```

---

### 3. Compensation API (Port 8002)

**端点**:
- `POST /api/v1/calculate-tax` - 计算个税
- `GET /api/v1/broadband/bands` - 获取宽带体系
- `POST /api/v1/broadband/analyze` - 分析薪资位置
- `GET /api/v1/tax-brackets` - 获取税率表

**集成页面**: `/tools/broadband`

**功能**:
- ✅ 实时个税计算
- ✅ 社保公积金计算
- ✅ 税后工资计算
- ✅ 宽带薪酬设计
- ✅ 薪资位置分析
- ✅ 四分位评估

**个税计算示例**:
```typescript
import { compensationApi } from '@/lib/hr-api'

const taxResult = await compensationApi.calculateTax(25000)
// 返回: { gross_salary, social_insurance, housing_fund, tax, net_salary }
```

---

## 🧪 测试结果

### 服务健康检查

```bash
# Recruitment Service
curl http://localhost:8000/health
# {"status":"healthy","services":{"parser":"ok","matcher":"ok","ai":"enabled"}}

# Performance Service
curl http://localhost:8001/health
# {"status":"healthy","services":{"okr":"ok","kpi":"ok","appraisal":"ok"}}

# Compensation Service
curl http://localhost:8002/health
# {"status":"healthy","services":{"broadband":"ok","tax":"ok","social":"ok","adjustment":"ok"}}
```

---

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```bash
# HR微服务API端点
NEXT_PUBLIC_RECRUITMENT_API=http://localhost:8000
NEXT_PUBLIC_PERFORMANCE_API=http://localhost:8001
NEXT_PUBLIC_COMPENSATION_API=http://localhost:8002
```

### 生产环境部署

修改为生产URL：

```bash
NEXT_PUBLIC_RECRUITMENT_API=https://api.3strategy.cc/recruitment
NEXT_PUBLIC_PERFORMANCE_API=https://api.3strategy.cc/performance
NEXT_PUBLIC_COMPENSATION_API=https://api.3strategy.cc/compensation
```

---

## 📊 核心业务逻辑来源

### Performance Service - 来自Frappe HRMS

**提取模块**: `hrms/mixins/appraisal.py`

**核心逻辑**:
```python
def validate_total_weightage(table_name, table_label):
    total_weightage = sum(d.per_weightage for d in self.get(table_name))
    if total_weightage != 100.0:
        throw("Total weightage must add up to 100%")
```

### Compensation Service - 中国本土化

**个税税率表**: 7级累进（3%-45%）
**起征点**: 5000元
**社保费率**: 参考上海标准

---

## 🎯 使用指南

### 1. 简历匹配

访问: http://localhost:3200/tools/resume-match

1. 上传简历文件（PDF/DOCX）
2. 点击"开始解析"
3. 查看AI提取的技能
4. 填写岗位要求
5. 点击"计算匹配度"

### 2. OKR管理

访问: http://localhost:3200/tools/okr

1. 点击"添加目标"
2. 输入目标名称
3. 添加关键结果（KR）
4. 设置目标值和权重（总权重100%）
5. 点击💾保存到服务器

### 3. 宽带薪酬与个税

访问: http://localhost:3200/tools/broadband

1. 设计薪酬宽带（左上角面板）
2. 输入税前工资进行个税计算（右下角面板）
3. 查看税后工资和实际税率
4. 查看薪资在宽带中的位置分析

---

## 🚀 启动所有服务

```bash
# 1. 启动三个微服务（在各自的目录）
cd ai-resume-service && python3 main.py &        # Port 8000
cd performance-service && python3 main.py &       # Port 8001
cd compensation-service && python3 main.py &      # Port 8002

# 2. 启动Portal
cd portal && npm run dev                          # Port 3200
```

---

## ✅ 已完成功能

- [x] API客户端统一封装
- [x] 简历匹配 - AI解析 + 候选人匹配
- [x] OKR管理 - 目标创建、进度跟踪、权重验证
- [x] 宽带薪酬 - 可视化设计 + 个税计算
- [x] 服务健康检查
- [x] CORS配置
- [x] 错误处理

---

## 📝 待优化项

1. **匹配算法优化** - 提升技能匹配的智能度
2. **数据库集成** - 持久化OKR、KPI数据
3. **用户认证** - 区分不同员工的数据
4. **周期管理** - 绩效周期创建和管理
5. **导出功能** - OKR、宽带薪酬导出

---

## 🔗 相关文档

- [AI Resume Service README](../ai-resume-service/README.md)
- [Performance Service README](../performance-service/README.md)
- [Compensation Service README](../compensation-service/README.md)
- [Frappe HRMS](https://github.com/frappe/hrms)
- [Horilla HRMS](https://github.com/horilla-opensource/horilla)

---

**集成完成日期**: 2026-03-08
**下一步**: 部署到生产环境并配置域名
