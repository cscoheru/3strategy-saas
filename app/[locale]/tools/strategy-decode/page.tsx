'use client'

import { useState } from 'react'
import { Compass, Target, TrendingUp, Users, ChevronRight, Plus, Edit, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// 模拟数据
const mockStrategicGoals = [
  {
    id: 1,
    title: '成为行业领先的智能咨询平台',
    timeframe: '2025-2027',
    owner: '战略委员会',
    progress: 45,
    departments: [
      { name: '产品部', goals: ['提升AI诊断准确率至90%', '完善OKR+KPI一体化功能'], status: 'on-track' },
      { name: '研发部', goals: ['优化大模型推理速度', '开发智能推荐算法'], status: 'at-risk' },
      { name: '市场部', goals: ['建立行业标杆案例', '提升品牌知名度'], status: 'on-track' }
    ]
  },
  {
    id: 2,
    title: '实现千万级营收目标',
    timeframe: '2025年度',
    owner: '经营管理委员会',
    progress: 62,
    departments: [
      { name: '销售部', goals: ['拓展100+企业客户', '提升客户续费率至85%'], status: 'ahead' },
      { name: '客户成功部', goals: ['建立客户成功体系', '降低客户流失率'], status: 'on-track' },
      { name: '产品部', goals: ['推出企业版功能', '完善API接口'], status: 'on-track' }
    ]
  }
]

const mockBusinessReviews = [
  { id: 1, date: '2025-03-01', topic: 'Q1战略执行复盘', participants: 12, keyIssues: ['AI诊断速度待提升', '销售转化率偏低'], actions: 5 },
  { id: 2, date: '2025-02-15', topic: '市场竞争分析', participants: 8, keyIssues: ['竞品功能迭代加速'], actions: 3 },
  { id: 3, date: '2025-02-01', topic: '客户需求洞察', participants: 15, keyIssues: ['企业定制化需求增加'], actions: 7 }
]

type TabType = 'overview' | 'goals' | 'decomposition' | 'review' | 'insight'

export default function StrategyDecodePage({ params }: { params: Promise<{ locale: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/zh" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 inline-block">
            <ChevronRight className="h-4 w-4 rotate-180" />
            返回
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">战略解码</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            将公司战略分解为可执行的目标和行动计划，实现战略到执行的无缝衔接
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { key: 'overview', label: '总览' },
              { key: 'goals', label: '战略目标' },
              { key: 'decomposition', label: '目标分解' },
              { key: 'review', label: '业务复盘' },
              { key: 'insight', label: '市场洞察' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockStrategicGoals.length}</div>
                    <div className="text-xs text-muted-foreground">战略目标</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {mockStrategicGoals.reduce((sum, g) => sum + g.departments.length, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">部门目标</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(mockStrategicGoals.reduce((sum, g) => sum + g.progress, 0) / mockStrategicGoals.length)}%
                    </div>
                    <div className="text-xs text-muted-foreground">平均进度</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockBusinessReviews.length}</div>
                    <div className="text-xs text-muted-foreground">复盘会议</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">战略解码流程</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <h3 className="font-semibold text-foreground mb-2">1. 战略目标制定</h3>
                  <p className="text-sm text-muted-foreground">
                    明确公司愿景、使命和战略目标，确定时间周期和成功标准
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="font-semibold text-foreground mb-2">2. 部门目标分解</h3>
                  <p className="text-sm text-muted-foreground">
                    将公司战略目标分解到各部门，形成部门级OKR和KPI
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-semibold text-foreground mb-2">3. 执行跟踪管理</h3>
                  <p className="text-sm text-muted-foreground">
                    建立定期跟踪机制，监控目标执行进度，及时发现偏差
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                  <h3 className="font-semibold text-foreground mb-2">4. 复盘诊断改进</h3>
                  <p className="text-sm text-muted-foreground">
                    定期业务复盘，分析执行偏差，归因诊断，持续改进
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategic Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">战略目标管理</h2>
                <p className="text-muted-foreground">制定和跟踪公司级战略目标</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                新建目标
              </button>
            </div>

            {mockStrategicGoals.map((goal) => (
              <div key={goal.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{goal.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>时间周期: {goal.timeframe}</span>
                      <span>负责人: {goal.owner}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{goal.progress}%</div>
                    <div className="text-xs text-muted-foreground">完成进度</div>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goal.progress}%` }} />
                </div>

                <div className="mt-4 space-y-2">
                  {goal.departments.map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{dept.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                          {dept.goals.length} 个目标
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dept.status === 'ahead' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' :
                        dept.status === 'on-track' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                      }`}>
                        {dept.status === 'ahead' ? '超前' : dept.status === 'on-track' ? '正常' : '风险'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Goal Decomposition Tab */}
        {activeTab === 'decomposition' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">目标分解视图</h2>
              <p className="text-muted-foreground">公司战略 → 部门目标 → 关键任务</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  公司
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">成为行业领先的智能咨询平台</h3>
                  <p className="text-sm text-muted-foreground">2025-2027年战略目标</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-3 ml-8">
                {mockStrategicGoals[0].departments.map((dept, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute left-[-2rem] top-4 bottom-4 w-0.5 bg-border" />
                    <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {dept.name[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">{dept.goals[0]}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="ml-12 mt-2 space-y-2">
                      {dept.goals.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business Review Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">业务复盘</h2>
                <p className="text-muted-foreground">定期复盘战略执行，分析问题，持续改进</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                创建复盘
              </button>
            </div>

            <div className="space-y-3">
              {mockBusinessReviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{review.topic}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{review.date}</span>
                        <span>{review.participants} 人参与</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/20">
                      已完成
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">关键问题</h4>
                      <div className="space-y-1">
                        {review.keyIssues.map((issue, i) => (
                          <p key={i} className="text-xs text-amber-800 dark:text-amber-200">• {issue}</p>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">行动项</h4>
                      <p className="text-xs text-blue-800 dark:text-blue-200">{review.actions} 项改进行动已分配</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Insight Tab */}
        {activeTab === 'insight' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">市场洞察</h2>
              <p className="text-muted-foreground">分析市场趋势、竞争对手和客户需求</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">行业趋势</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">AI驱动的组织诊断</p>
                      <p className="text-xs text-muted-foreground">企业对AI咨询工具需求增长</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">绩效管理一体化</p>
                      <p className="text-xs text-muted-foreground">OKR+KPI融合成为主流</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">数据驱动决策</p>
                      <p className="text-xs text-muted-foreground">企业重视数据分析能力</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">竞争优势</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">五维组织诊断模型</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">AI+专家混合咨询</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">从战略到执行闭环</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">轻量化SaaS工具</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">竞争态势</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">产品功能完整度</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-green-500" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">AI诊断准确率</span>
                    <span className="text-sm text-muted-foreground">90%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '90%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">客户满意度</span>
                    <span className="text-sm text-muted-foreground">4.5/5.0</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
