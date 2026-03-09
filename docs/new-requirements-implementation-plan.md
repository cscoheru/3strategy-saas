# HR微服务新需求实施计划

**文档版本**: 1.0
**创建日期**: 2026-03-09
**预计工期**: 7周
**实施方式**: 敏捷迭代，分模块交付

---

## 📊 总体计划概览

```
Phase 1: 绩效全流程管理 ██████████ 100% (Week 1-3)
Phase 2: 薪酬对标系统     ░░░░░░░░░░   0% (Week 4-5)
Phase 3: 招聘人才画像     ░░░░░░░░░░   0% (Week 6-7)
```

---

## Phase 1: 绩效全流程管理 (Week 1-3)

### Week 1: 目标设定阶段

#### 1.1 AI目标质量评估 (2天)

**技术实现**：
```
performance-service/services/goal_validator.py
├── class GoalQualityAssessor
│   ├── validate_smart(goal: str) -> ValidationResult
│   ├── check_specificity(goal: str) -> float
│   ├── check_measurability(goal: str) -> float
│   ├── check_achievable(goal: str) -> float
│   ├── check_relevant(goal: str, context: str) -> float
│   └── check_time_bound(goal: str) -> float
└── generate_improvement_suggestions(goal: str) -> List[str]
```

**AI Prompt设计**（参考战略解码）：
```python
SYSTEM_PROMPT = """
你是一位资深的目标管理专家，擅长运用SMART原则评估和改进目标。

你的任务：
1. 评估目标是否符合SMART原则
2. 指出具体的问题（如"不够具体"、"无法衡量"）
3. 提供改进建议

评估标准：
- Specific（具体性）：目标是否明确、不含糊
- Measurable（可衡量性）：是否有量化指标
- Achievable（可实现性）：是否具有挑战性但可达成
- Relevant（相关性）：是否与组织战略相关
- Time-bound（时限性）：是否有明确的截止日期

输出格式：
{
  "smart_score": 65,
  "dimension_scores": {
    "specific": 0.4,
    "measurable": 0.8,
    "achievable": 0.9,
    "relevant": 0.7,
    "time_bound": 0.5
  },
  "issues": [
    "目标不够具体：缺少明确的业务指标",
    "时限不清晰：需要明确具体的截止日期"
  ],
  "suggestions": [
    "建议改为：'在Q4结束前，将华东地区的销售额从1000万提升到1500万，增长率达到50%'"
  ]
}
"""
```

**API端点**：
```
POST /api/v1/goals/validate
Request: { "goal": "提升业绩" }
Response: { "smart_score": 35, "issues": [...], "suggestions": [...] }
```

**前端交互**：
- 目标输入框实时评分
- 各维度雷达图展示
- 一键应用改进建议

#### 1.2 目标分解建议 (2天)

**技术实现**：
```python
class GoalDecomposer:
    def decompose_goal(
        team_goal: str,
        team_size: int,
        time_period: str
    ) -> List[IndividualGoal]:
        """
        将团队目标分解为个人目标
        参考战略解码中的目标分解逻辑
        """
```

**前端交互**：
- 输入团队目标
- 自动生成个人目标建议
- 支持手动调整

#### 1.3 权重分配建议 (1天)

**已有实现**：复用现有权重验证逻辑

---

### Week 2: 执行跟踪阶段

#### 2.1 定期进度提醒系统 (2天)

**技术实现**：
```python
class ProgressReminder:
    def check_progress_status(objective_id: str) -> Alert:
        """
        检查目标进度状态
        - 落后30%：黄色预警
        - 落后50%：橙色警报
        - 落后70%：红色警报
        """

    def send_reminder(employee_id: str, manager_id: str):
        """
        发送提醒通知
        - 员工：进度更新提醒
        - 经理：介入提醒
        """
```

**数据模型**：
```python
class ProgressAlert(BaseModel):
    objective_id: str
    alert_level: str  # "warning", "critical", "urgent"
    gap_percentage: float
    message: str
    suggested_actions: List[str]
    created_at: datetime
```

#### 2.2 偏差自动预警 (2天)

**预警逻辑**：
```python
def calculate_deviation(
    current_value: float,
    expected_value: float,
    time_elapsed_percentage: float
) -> DeviationAlert:
    """
    计算执行偏差

    示例：
    - 时间过了50%，目标完成30% → 预警
    - 时间过了50%，目标完成15% → 警报
    """
    expected_progress = time_elapsed_percentage
    actual_progress = current_value / expected_value * 100
    deviation = actual_progress - expected_progress

    if deviation < -30:
        return DeviationAlert(level="urgent")
    elif deviation < -15:
        return DeviationAlert(level="warning")
```

#### 2.3 经理介入工作流 (1天)

**工作流设计**：
```
进度落后 → 触发预警 → 通知经理 → 经理确认介入 → 记录干预措施 → 跟踪改善情况
```

---

### Week 3: 复盘诊断阶段

#### 3.1 差距归因分析 (3天)

**参考战略解码Step1的实现**：

```python
class PerformanceDiagnostic:
    def analyze_gap(
        goal: str,
        target: float,
        actual: float,
        context: str
    ) -> DiagnosticResult:
        """
        分析目标未达成的根因

        归因维度：
        1. 目标合理性：目标是否过高/过低
        2. 能力匹配度：员工是否有能力完成
        3. 资源支持度：是否有足够资源
        4. 执行方法：执行方法是否得当
        5. 外部环境：是否有不可控因素
        6. 团队协作：团队配合是否到位
        """
```

**AI Prompt设计**：
```python
DIAGNOSTIC_PROMPT = """
你是一位资深的绩效诊断专家，运用"六维归因模型"分析目标未达成的根本原因。

归因维度：
1. 目标合理性（Goal Validity）：目标设定是否合理
2. 能力匹配度（Capability Match）：员工能力是否匹配
3. 资源支持度（Resource Support）：资源是否充足
4. 执行方法（Execution Method）：方法是否正确
5. 外部环境（External Environment）：是否有外部障碍
6. 团队协作（Team Collaboration）：团队配合如何

分析流程：
1. 先给出初步归因（每个维度的问题可能性评分）
2. 标记1-2个最可能有问题的维度（高亮）
3. 通过5问法对话深入挖掘
4. 最终总结核心短板（20-30字）

输出格式：
{
  "summary": "总体分析",
  "dimensions": [
    {
      "id": "goal_validity",
      "name": "目标合理性",
      "score": 85,
      "is_highlighted": true,
      "reason": "目标设定过高，超出实际可达范围"
    },
    ...
  ]
}
"""
```

#### 3.2 5问法深度对话 (1天)

**已有参考**：复用战略解码的DiagnosticChat组件

#### 3.3 能力评估和发展计划 (1天)

**技术实现**：
```python
class CapabilityAssessor:
    def assess_capability(
        gap_analysis: DiagnosticResult,
        employee_profile: EmployeeProfile
    ) -> CapabilityAssessment:
        """
        评估员工能力短板

        输出：
        - 能力雷达图（5个维度）
        - 具体短板描述
        - 改进建议（培训/导师/项目历练）
        """

    def generate_idp(
        capability_gaps: List[str],
        development_options: List[DevelopmentOption]
    ) -> IndividualDevelopmentPlan:
        """
        生成个人发展计划（IDP）

        内容：
        - 发展目标
        - 具体行动项
        - 时间节点
        - 资源支持
        - 衡量标准
        """
```

---

## Phase 2: 薪酬对标系统 (Week 4-5)

### Week 4: 薪酬数据库集成

#### 2.1 第三方API对接 (2天)

**候选数据源**：
- 薪智数据（www.xinzhi.com）
- 太和顾问（www.taihe.com.cn）
- 猎聘/BOSS直聘（爬取数据）

**技术实现**：
```python
class SalaryDatabaseClient:
    def __init__(self, provider: str, api_key: str):
        """
        支持多个数据源：
        - XinzhiClient
        - TaiheClient
        - JobMarketCrawler
        """

    def get_market_benchmark(
        position: str,
        level: str,
        city: str
    ) -> MarketBenchmark:
        """
        获取市场分位值

        返回：
        {
          "position": "Java开发工程师",
          "level": "P6",
          "city": "上海",
          "p25": 18000,
          "p50": 22000,
          "p75": 28000,
          "p90": 35000,
          "sample_size": 1500,
          "updated_at": "2026-03-01"
        }
        """

    def cache_benchmark_data(benchmark: MarketBenchmark):
        """
        缓存数据（减少API调用）
        缓存策略：TTL = 30天
        """
```

**职位映射算法**：
```python
class PositionMapper:
    def normalize_position(self, raw_position: str) -> str:
        """
        将各种职位名称标准化

        示例：
        "Java开发" → "Java开发工程师"
        "前端工程师" → "前端开发工程师"
        "PM" → "产品经理"
        """

    def map_level(self, raw_level: str) -> str:
        """
        将各种职级标准化

        示例：
        "初级" → "P4"
        "中级" → "P5"
        "高级" → "P6"
        "专家" → "P7"
        """
```

#### 2.2 数据缓存和更新 (2天)

**缓存策略**：
```python
class BenchmarkCache:
    def get_cached_benchmark(
        position: str,
        level: str,
        city: str
    ) -> Optional[MarketBenchmark]:
        """
        查询缓存
        优先级：Redis → PostgreSQL → API
        """

    def update_cache():
        """
        定期更新缓存
        频率：每周一次
        范围：常用职位和城市
        """
```

#### 2.3 竞争力分析算法 (1天)

```python
class CompetitivenessAnalyzer:
    def analyze_position(
        employee_salary: float,
        market_benchmark: MarketBenchmark
    ) -> CompetitivenessResult:
        """
        分析薪酬竞争力

        返回：
        {
          "position": "领先",
          "percentile": 75,
          "gap_to_market": {
            "to_p50": +2000,
            "to_p75": -3000
          },
          "turnover_risk": "low",
          "recommendation": "薪酬处于P75位置，竞争力较强，建议保持"
        }
        """
```

---

### Week 5: 薪酬仪表盘和调薪建议

#### 2.4 薪酬仪表盘 (2天)

**可视化组件**：
- 组织薪酬分布图（直方图）
- 各职级竞争力热力图
- 薪酬趋势图（时间序列）
- 离职风险预警仪表盘

#### 2.5 调薪建议生成 (3天)

**AI分析**：
```python
class SalaryAdjustmentAdvisor:
    def generate_adjustment_suggestion(
        employee: Employee,
        current_salary: float,
        performance_rating: str,
        market_position: str
    ) -> AdjustmentSuggestion:
        """
        生成调薪建议

        考虑因素：
        - 绩效评级
        - 市场竞争力
        - 薪酬压缩（与下级/同级差距）
        - 预算约束
        - 内部公平性

        输出：
        {
          "recommended_increase": 15,
          "new_salary": 25300,
          "new_position": "P75",
          "budget_impact": 3000,
          "rationale": "基于优秀绩效和市场P75定位",
          "risks": [
            "可能引起同级员工的不满"
          ],
          "alternatives": [
            {"increase": 12, "rationale": "保守方案"},
            {"increase": 18, "rationale": "激进方案"}
          ]
        }
        """
```

---

## Phase 3: 招聘人才画像 (Week 6-7)

### Week 6: 人才画像生成

#### 3.1 AI画像生成器 (3天)

**技术实现**：
```python
class TalentProfileGenerator:
    def generate_profile(
        job_description: str,
        required_skills: List[str],
        experience_level: str,
        team_context: str
    ) -> TalentProfile:
        """
        生成高质量人才画像

        AI分析维度：
        1. 核心技能分析
        2. 经验要求细化
        3. 软技能识别
        4. 文化匹配要素
        5. 薪酬范围预测
        6. 筛选优先级
        """

    def extract_implicit_requirements(
        job_description: str
    ) -> ImplicitRequirements:
        """
        从JD中提取隐含要求

        示例：
        JD: "负责高频交易系统开发"
        隐含要求：
        - 对延迟敏感（<10ms）
        - 需要C++/Rust经验
        - 需要金融行业知识
        """
```

**AI Prompt设计**：
```python
PROFILE_GENERATION_PROMPT = """
你是一位资深的招聘专家和人才分析师，擅长从岗位需求中提取理想候选人的完整画像。

你的任务：
1. 分析岗位的核心需求（显性和隐性）
2. 生成多维度人才画像
3. 识别关键的筛选标准
4. 预测合理的薪酬范围

分析维度：
1. **硬技能**（Hard Skills）：
   - 核心技术栈（必需）
   - 辅助技能（加分项）
   - 技能深度要求

2. **经验画像**（Experience Profile）：
   - 工作年限（范围+理由）
   - 行业经验（哪些行业优先）
   - 项目经验（典型项目类型）
   - 规模经验（团队规模/用户规模）

3. **软技能**（Soft Skills）：
   - 沟通能力
   - 团队协作
   - 问题解决
   - 学习能力

4. **隐性要求**（Implicit Requirements）：
   - 从职责中推断的能力
   - 从工作环境中推断的特质
   - 从团队文化中推断的匹配度

5. **薪酬预测**（Salary Prediction）：
   - 基于技能和经验预测
   - 参考市场数据
   - 考虑地区差异

6. **筛选优先级**（Screening Priority）：
   - 哪些是"必须有"
   - 哪些是"加分项"
   - 哪些可以"培养"

输出格式（JSON）：
{
  "core_skills": {
    "required": ["Java", "Spring", "MySQL"],
    "preferred": ["Redis", "Kafka"],
    "skill_levels": {
      "Java": "精通",
      "Spring": "熟练"
    }
  },
  "experience_profile": {
    "total_years": {"min": 3, "max": 5, "ideal": 4},
    "industry_experience": ["金融", "电商"],
    "project_types": ["高并发系统", "支付系统"],
    "scale_requirements": {
      "team_size": "10+人团队",
      "users": "百万级用户"
    }
  },
  "soft_skills": ["沟通能力", "问题解决", "抗压能力"],
  "implicit_requirements": [
    "能够承受业务高峰期的压力",
    "对金融业务有敏感性"
  ],
  "salary_range": {
    "min": 18000,
    "max": 28000,
    "median": 22000,
    "rationale": "基于P6-P7职级、上海地区"
  },
  "screening_priority": {
    "must_have": ["Java", "3年经验", "高并发项目"],
    "nice_to_have": ["金融行业", "Kafka"],
    "trainable": ["具体业务知识"]
  },
  "interview_focus": [
    "深度挖掘高并发项目经验",
    "考察问题解决思路",
    "评估团队协作能力"
  ]
}
"""
```

#### 3.2 画像验证机制 (2天)

**准确度验证**：
```python
class ProfileValidator:
    def validate_profile_accuracy(
        profile: TalentProfile,
        hired_candidates: List[Employee]
    ) -> ValidationReport:
        """
        验证画像准确度

        方法：
        1. 将画像与实际入职员工对比
        2. 计算匹配度
        3. 识别画像偏差
        4. 迭代优化

        输出：
        {
          "accuracy_score": 0.85,
          "dimension_scores": {
            "skills": 0.9,
            "experience": 0.8,
            "soft_skills": 0.75
          },
          "deviations": [
            "实际要求的Kafka熟练度被低估了"
          ],
          "optimization_suggestions": [
            "提高Kafka的必需性等级"
          ]
        }
        """
```

---

### Week 7: 画像优化和集成

#### 3.3 A/B测试框架 (2天)

```python
class ProfileABTest:
    def run_ab_test(
        position: str,
        profile_a: TalentProfile,  # AI生成
        profile_b: TalentProfile   # 人工生成
    ) -> ABTestResult:
        """
        A/B测试对比

        测试指标：
        - 简历筛选准确率
        - 面试通过率
        - 入职后绩效
        - 招聘周期
        """
```

#### 3.4 前端集成 (3天)

**页面设计**：
```
/tools/talent-profile
├── JD输入区
├── AI画像生成区
├── 画像展示区
│   ├── 技能雷达图
│   ├── 经验要求
│   ├── 薪酬范围
│   └── 筛选优先级
├── 画像验证区
└── 历史数据对比
```

---

## 📁 关键文件清单

### 新增文件（按模块）

**绩效管理**：
```
performance-service/
├── services/
│   ├── goal_validator.py          # 目标质量评估
│   ├── progress_tracker.py         # 进度跟踪
│   ├── performance_diagnostic.py   # 绩效诊断
│   └── capability_assessor.py      # 能力评估
├── routes/
│   └── goal_lifecycle.py           # 全流程API
└── models/
    └── alert.py                    # 预警模型
```

**薪酬管理**：
```
compensation-service/
├── services/
│   ├── salary_database.py          # 数据库集成
│   ├── market_benchmark.py         # 市场对标
│   └── adjustment_advisor.py       # 调薪建议
├── clients/
│   ├── xinzhi_client.py            # 薪智API
│   └── taihe_client.py             # 太和API
└── cache/
    └── benchmark_cache.py          # 数据缓存
```

**招聘管理**：
```
ai-resume-service/
├── services/
│   ├── profile_generator.py        # 画像生成
│   ├── profile_validator.py        # 画像验证
│   └── ab_test.py                  # A/B测试
└── routes/
    └── talent_profile.py           # 画像API
```

**前端页面**：
```
app/[locale]/tools/
├── performance-lifecycle/
│   └── page.tsx                    # 绩效全流程
├── salary-benchmark/
│   └── page.tsx                    # 薪酬对标
└── talent-profile/
    └── page.tsx                    # 人才画像
```

---

## 🧪 测试策略

### 单元测试
- 每个核心函数的单元测试
- 覆盖率目标：80%

### 集成测试
- API端点测试
- 数据流测试
- 第三方API集成测试

### 用户验收测试
- 真实场景测试
- A/B测试验证
- 用户反馈收集

---

## 📊 进度跟踪

**里程碑**：
- Week 3结束：绩效管理可用
- Week 5结束：薪酬对标可用
- Week 7结束：招聘画像可用

**每周Review**：
- 周一：计划确认
- 周三：进度检查
- 周五：成果演示

---

*文档创建日期: 2026-03-09*
*预计开始日期: 待用户确认*
