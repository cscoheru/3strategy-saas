'use client'

import { useState } from 'react'
import { Target, BarChart3, Activity, Search, GraduationCap, BookOpen, Plus, Edit, Trash2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// 模拟数据
const mockObjectives = [
  {
    id: 1,
    title: '提升产品市场竞争力',
    department: '产品部',
    owner: '张三',
    progress: 75,
    keyResults: [
      { id: 1, name: '发布3个核心功能', current: 2, target: 3, unit: '个', status: 'on-track' },
      { id: 2, name: '用户满意度达到4.5分', current: 4.2, target: 4.5, unit: '分', status: 'at-risk' },
      { id: 3, name: '月活用户增长50%', current: 35, target: 50, unit: '%', status: 'on-track' }
    ]
  },
  {
    id: 2,
    title: '优化研发效率',
    department: '研发部',
    owner: '李四',
    progress: 60,
    keyResults: [
      { id: 4, name: '代码覆盖率提升至80%', current: 65, target: 80, unit: '%', status: 'at-risk' },
      { id: 5, name: 'Bug修复时间缩短30%', current: 15, target: 30, unit: '%', status: 'ahead' }
    ]
  }
]

const mockDepartments = [
  { id: 1, name: '产品部', progress: 75, status: 'on-track', issues: 2, objectives: 3 },
  { id: 2, name: '研发部', progress: 60, status: 'at-risk', issues: 3, objectives: 2 },
  { id: 3, name: '销售部', progress: 90, status: 'ahead', issues: 1, objectives: 4 },
  { id: 4, name: '市场部', progress: 70, status: 'on-track', issues: 2, objectives: 3 }
]

const mockEmployee = {
  id: 1,
  name: '王五',
  department: '产品部',
  position: '产品经理',
  capabilities: [
    { name: '战略思维', score: 75, level: 'good' },
    { name: '执行力', score: 90, level: 'excellent' },
    { name: '团队协作', score: 80, level: 'good' },
    { name: '创新意识', score: 65, level: 'developing' },
    { name: '沟通能力', score: 85, level: 'good' },
    { name: '专业能力', score: 88, level: 'good' }
  ],
  idp: [
    { type: 'training', title: '产品创新思维工作坊', priority: 'high' },
    { type: 'mentor', title: '导师：资深产品总监', priority: 'medium' },
    { type: 'project', title: '负责新产品线0-1孵化', priority: 'high' }
  ]
}

type TabType = 'overview' | 'goals' | 'tracking' | 'capability'

export default function PerformanceImprovementPage({ params }: { params: Promise<{ locale: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [locale] = useState('zh')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">绩效改进</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            从战略目标分解到个人绩效的全流程管理
          </p>
        </div>

        {/* Process Flow */}
        <div className="mb-8 p-6 border border-border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">📊 完整业务流程</h2>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">1. 目标分解</div>
              <div className="text-muted-foreground mt-1">战略→部门→个人</div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="font-semibold text-primary">2. 进度跟踪</div>
              <div className="text-muted-foreground mt-1">实时监控+预警</div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="font-semibold text-primary">3. 复盘诊断</div>
              <div className="text-muted-foreground mt-1">归因分析+改进</div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="font-semibold text-primary">4. 能力发展</div>
              <div className="text-muted-foreground mt-1">IDP计划</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6">
            {[
              { key: 'overview', label: '总览' },
              { key: 'goals', label: '组织绩效' },
              { key: 'tracking', label: '进度跟踪与诊断' },
              { key: 'capability', label: '能力评估' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">核心模块说明</h2>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="font-semibold text-foreground mb-2">🎯 组织绩效（OKR+KPI一体化）</h3>
                  <p className="text-sm text-muted-foreground">
                    将公司战略目标层层分解到部门、团队、个人，OKR关注目标与关键结果，KPI关注量化指标，
                    两者结合实现既有方向感又有可衡量性的绩效管理体系。
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-semibold text-foreground mb-2">📈 进度跟踪与诊断（合并）</h3>
                  <p className="text-sm text-muted-foreground">
                    实时跟踪目标执行进度，自动识别偏差并预警。未达成目标时，
                    使用3力3平台框架进行深度归因分析，5问法对话挖掘根本原因。
                  </p>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <h3 className="font-semibold text-foreground mb-2">🧠 能力评估</h3>
                  <p className="text-sm text-muted-foreground">
                    基于绩效诊断结果，评估6维度能力（技术、领导力、沟通、问题解决、学习、执行），
                    生成个性化IDP计划，推荐培训、导师、项目历练机会。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border border-primary/30 rounded-xl bg-primary/5">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                数据流向说明
              </h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• <strong>输入</strong>：公司战略目标（来自战略解码模块）</p>
                <p>• <strong>输出</strong>：个人绩效评分 → 连接薪酬模块的奖金分配</p>
                <p>• <strong>闭环</strong>：绩效诊断结果 → 能力评估 → IDP计划 → 下一周期目标调整</p>
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab - 交互式版本 */}
        {activeTab === 'goals' && (
          <OKRGoalsView objectives={mockObjectives} />
        )}

        {/* Tracking Tab - 交互式版本 */}
        {activeTab === 'tracking' && (
          <ProgressTrackingView departments={mockDepartments} />
        )}

        {/* Capability Tab - 交互式版本 */}
        {activeTab === 'capability' && (
          <CapabilityAssessmentView employee={mockEmployee} />
        )}
      </div>
    </div>
  )
}

// ===== 交互式组件 =====

// OKR目标管理组件
function OKRGoalsView({ objectives }: { objectives: typeof mockObjectives }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-500 bg-green-50 dark:bg-green-950/20'
      case 'on-track': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
      case 'at-risk': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
      case 'off-track': return 'text-red-500 bg-red-50 dark:bg-red-950/20'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ahead': return '超前'
      case 'on-track': return '正常'
      case 'at-risk': return '风险'
      case 'off-track': return '落后'
      default: return '未知'
    }
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">OKR + KPI 目标管理</h2>
          <p className="text-muted-foreground">管理组织目标，跟踪关键结果执行进度</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          新建目标
        </button>
      </div>

      {/* 目标列表 */}
      <div className="space-y-4">
        {objectives.map((obj) => (
          <div key={obj.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* 目标头部 */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpandedId(expandedId === obj.id ? null : obj.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-foreground">O{obj.id}: {obj.title}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">
                    {obj.department}
                  </span>
                  <span className="text-xs text-muted-foreground">负责人: {obj.owner}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-md">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">整体进度</span>
                      <span className="font-medium text-foreground">{obj.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${obj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  expandedId === obj.id ? 'rotate-90' : ''
                }`}
              />
            </div>

            {/* 关键结果列表（可展开） */}
            {expandedId === obj.id && (
              <div className="border-t border-border p-5 bg-secondary/20">
                <h4 className="text-sm font-medium text-foreground mb-4">关键结果 (KR)</h4>
                <div className="space-y-3">
                  {obj.keyResults.map((kr) => {
                    const progress = Math.round((kr.current / kr.target) * 100)
                    return (
                      <div key={kr.id} className="rounded-lg bg-card p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">KR{kr.id}: {kr.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(kr.status)}`}>
                              {getStatusLabel(kr.status)}
                            </span>
                            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">进度</span>
                              <span className="text-foreground">{kr.current} / {kr.target} {kr.unit}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-primary">{progress}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button className="mt-4 w-full py-2 text-sm text-center text-primary hover:bg-primary/5 rounded-lg transition-colors">
                  + 添加关键结果
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 进度跟踪组件
function ProgressTrackingView({ departments }: { departments: typeof mockDepartments }) {
  const [selectedDept, setSelectedDept] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-500'
      case 'on-track': return 'text-blue-500'
      case 'at-risk': return 'text-amber-500'
      case 'off-track': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ahead': return '超前'
      case 'on-track': return '正常'
      case 'at-risk': return '风险'
      case 'off-track': return '落后'
      default: return '未知'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">进度跟踪与诊断</h2>
        <p className="text-muted-foreground">实时监控各部门目标执行情况</p>
      </div>

      {/* 部门概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
            className={`rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
              selectedDept === dept.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{dept.name}</h3>
              <span className={`text-sm font-medium ${getStatusColor(dept.status)}`}>
                {getStatusLabel(dept.status)}
              </span>
            </div>
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">完成进度</span>
                <span className="font-medium text-foreground">{dept.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${dept.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{dept.objectives} 个目标</span>
              {dept.issues > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {dept.issues} 问题
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 详情面板 */}
      {selectedDept && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {departments.find(d => d.id === selectedDept)?.name} - 详细诊断
          </h3>

          {/* 模拟诊断内容 */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-950/20 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">执行良好的方面</p>
                <p className="text-sm text-muted-foreground mt-1">目标设定清晰，团队协作顺畅，关键里程碑按时完成</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">需要关注的问题</p>
                <p className="text-sm text-muted-foreground mt-1">部分关键结果进度落后，资源分配存在瓶颈，跨团队协作需加强</p>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">改进建议</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 调整资源优先级，聚焦关键目标</li>
                <li>• 建立周度进度回顾机制</li>
                <li>• 识别并消除跨部门协作障碍</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 能力评估组件
function CapabilityAssessmentView({ employee }: { employee: typeof mockEmployee }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">能力评估与IDP</h2>
          <p className="text-muted-foreground">评估员工6维度能力，制定个性化发展计划</p>
        </div>
        <select className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
          <option>{employee.department} - {employee.name}</option>
          <option>研发部 - 赵六</option>
          <option>市场部 - 钱七</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 能力雷达图 */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">能力评估雷达图</h3>
          <div className="space-y-3">
            {employee.capabilities.map((cap, index) => {
              const levelColor = cap.score >= 85 ? 'bg-green-500' : cap.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
              const levelLabel = cap.score >= 85 ? '优秀' : cap.score >= 70 ? '良好' : '发展中'
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-foreground">{cap.name}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cap.score}分</span>
                      <span className={`text-xs px-2 py-0.5 rounded text-white ${levelColor}`}>
                        {levelLabel}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${cap.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* IDP计划 */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">个人发展计划 (IDP)</h3>
          <div className="space-y-3">
            {employee.idp.map((item, index) => {
              const icon = item.type === 'training' ? '📚' : item.type === 'mentor' ? '👨‍🏫' : '🎯'
              const priorityColor = item.priority === 'high' ? 'text-red-500' : item.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
              return (
                <div key={index} className="rounded-lg bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className={`text-xs ${priorityColor}`}>
                          {item.priority === 'high' ? '高优先级' : '中优先级'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'training' && '推荐培训课程以提升相关技能'}
                        {item.type === 'mentor' && '匹配资深导师进行一对一指导'}
                        {item.type === 'project' && '负责挑战性项目以锻炼能力'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button className="mt-4 w-full py-2.5 text-sm text-center border border-dashed border-primary rounded-lg text-primary hover:bg-primary/5 transition-colors">
            + 添加发展计划
          </button>
        </div>
      </div>
    </div>
  )
}
