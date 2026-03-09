'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, BarChart3, PieChart, Building2, Users, Target, Plus, Edit, Calculator, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// 模拟数据
const mockSalaryPackage = {
  totalBudget: 5000000, // 500万
  departments: [
    { id: 1, name: '产品部', budget: 1500000, headcount: 20, avgSalary: 75000 },
    { id: 2, name: '研发部', budget: 2000000, headcount: 30, avgSalary: 66667 },
    { id: 3, name: '销售部', budget: 1000000, headcount: 25, avgSalary: 40000 },
    { id: 4, name: '职能部', budget: 500000, headcount: 15, avgSalary: 33333 }
  ]
}

const mockFixedVariableRatios = [
  { roleType: '研发', fixed: 40, variable: 60, description: '高浮动，长期激励为主' },
  { roleType: '销售', fixed: 30, variable: 70, description: '高浮动，短期激励为主' },
  { roleType: '职能', fixed: 70, variable: 30, description: '低浮动，稳定增长为主' },
  { roleType: '管理', fixed: 50, variable: 50, description: '平衡型，短长期结合' }
]

const mockMarketData = [
  { level: 'P5', marketMin: 15000, marketMid: 20000, marketMax: 25000, current: 18000 },
  { level: 'P6', marketMin: 20000, marketMid: 28000, marketMax: 36000, current: 26000 },
  { level: 'P7', marketMin: 30000, marketMid: 40000, marketMax: 50000, current: 35000 },
  { level: 'M1', marketMin: 35000, marketMid: 50000, marketMax: 65000, current: 45000 }
]

type TabType = 'overview' | 'package' | 'structure' | 'bonus' | 'market'

export default function CompensationReformPage({ params }: { params: Promise<{ locale: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link href="/zh" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 inline-block">
            <ChevronRight className="h-4 w-4 rotate-180" />
            返回
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">薪酬改革工具</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            从公司视角设计薪酬体系，连接战略、绩效、人才
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { key: 'overview', label: '总览' },
              { key: 'package', label: '薪酬包' },
              { key: 'structure', label: '固浮比' },
              { key: 'bonus', label: '奖金策略' },
              { key: 'market', label: '市场对标' }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">¥{(mockSalaryPackage.totalBudget / 10000).toFixed(0)}万</div>
                    <div className="text-xs text-muted-foreground">年度薪酬总额</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockSalaryPackage.departments.reduce((sum, d) => sum + d.headcount, 0)}</div>
                    <div className="text-xs text-muted-foreground">总人数</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">¥{(mockSalaryPackage.totalBudget / mockSalaryPackage.departments.reduce((sum, d) => sum + d.headcount, 0) / 1000).toFixed(1)}k</div>
                    <div className="text-xs text-muted-foreground">人均年薪</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">核心设计模块</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-semibold text-foreground mb-2">💰 薪酬包设计</h3>
                  <p className="text-sm text-muted-foreground">
                    公司→部门→岗位→个人，自上而下分配薪酬包，确保总体成本可控
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="font-semibold text-foreground mb-2">📊 固浮比策略</h3>
                  <p className="text-sm text-muted-foreground">
                    根据岗位类型差异化设计固浮比，平衡激励与稳定性
                  </p>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <h3 className="font-semibold text-foreground mb-2">🎯 奖金策略</h3>
                  <p className="text-sm text-muted-foreground">
                    连接绩效结果，设计组织奖金分配方案
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                  <h3 className="font-semibold text-foreground mb-2">📈 市场对标</h3>
                  <p className="text-sm text-muted-foreground">
                    定期进行市场薪酬调研，确保外部竞争力
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package Tab */}
        {activeTab === 'package' && (
          <SalaryPackageView data={mockSalaryPackage} />
        )}

        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <FixedVariableRatioView ratios={mockFixedVariableRatios} />
        )}

        {/* Bonus Tab */}
        {activeTab === 'bonus' && (
          <BonusStrategyView />
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <MarketBenchmarkView data={mockMarketData} />
        )}
      </div>
    </div>
  )
}

// 薪酬包设计组件
function SalaryPackageView({ data }: { data: typeof mockSalaryPackage }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">薪酬包设计</h2>
          <p className="text-muted-foreground">自上而下分配薪酬资源</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Calculator className="h-4 w-4" />
          调整预算
        </button>
      </div>

      {/* 总览卡片 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">公司薪酬总额分配</h3>
        <div className="text-3xl font-bold text-primary mb-2">¥{(data.totalBudget / 10000).toFixed(0)}万</div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary mb-6">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 w-full" />
        </div>

        <h4 className="text-sm font-medium text-foreground mb-3">部门薪酬包分配</h4>
        <div className="space-y-3">
          {data.departments.map((dept) => {
            const percentage = ((dept.budget / data.totalBudget) * 100).toFixed(1)
            return (
              <div key={dept.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">{dept.headcount}人</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">预算</span>
                        <span className="font-medium text-foreground">¥{(dept.budget / 10000).toFixed(0)}万</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-foreground">{percentage}%</div>
                      <div className="text-xs text-muted-foreground">人均¥{(dept.avgSalary / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 固浮比组件
function FixedVariableRatioView({ ratios }: { ratios: typeof mockFixedVariableRatios }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">固浮比设计策略</h2>
        <p className="text-muted-foreground">根据岗位类型设计差异化固浮比</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ratios.map((item, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{item.roleType}</h3>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">固定部分</span>
                <span className="font-medium text-foreground">{item.fixed}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${item.fixed}%` }} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">浮动部分</span>
                <span className="font-medium text-foreground">{item.variable}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${item.variable}%` }} />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      {/* 快速计算器 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">快速计算器</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">年薪标准</label>
            <input type="number" placeholder="100000" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">固浮比</label>
            <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <option>30:70 (销售)</option>
              <option>40:60 (研发)</option>
              <option>50:50 (管理)</option>
              <option>70:30 (职能)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">测算结果</label>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="text-sm">固定: <span className="font-medium text-foreground">¥70,000</span> / 浮动: <span className="font-medium text-green-500">¥30,000</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 奖金策略组件
function BonusStrategyView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">奖金策略设计</h2>
        <p className="text-muted-foreground">连接绩效结果，激励目标达成</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 个人奖金 */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">个人奖金计算</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">基于个人KPI完成度</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 个人KPI完成率 × 个人目标奖金</p>
                <p>• 上限封顶（不超过目标奖金的150%）</p>
                <p>• 保底机制（不低于目标奖金的50%）</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">示例计算</h4>
              <div className="text-sm text-muted-foreground">
                <p>目标奖金: ¥30,000</p>
                <p>KPI完成率: 110%</p>
                <p className="font-medium text-foreground">实发奖金: ¥33,000 (110%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 组织奖金 */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">组织奖金池分配</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">分配原则</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 按部门绩效结果分配奖金池</li>
                <li>• 部门内按个人贡献二次分配</li>
                <li>• 向核心岗位和关键人才倾斜</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">注意事项</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 确保薪酬总额可控</li>
                <li>• 避免大锅饭，体现差异化</li>
                <li>• 与长期激励(股权)协调配合</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 市场对标组件
function MarketBenchmarkView({ data }: { data: typeof mockMarketData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">市场薪酬对标</h2>
          <p className="text-muted-foreground">确保薪酬外部竞争力</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
          <BarChart3 className="h-4 w-4" />
          更新数据
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">岗位薪酬对标表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">岗位等级</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">市场最小值</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">市场中位值</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">市场最大值</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">当前水平</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">竞争力</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const competitiveness = row.current >= row.marketMid ? '高' : row.current >= row.marketMin ? '中' : '低'
                const competitivenessColor = competitiveness === '高' ? 'text-green-500' : competitiveness === '中' ? 'text-amber-500' : 'text-red-500'
                return (
                  <tr key={index} className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{row.level}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">¥{row.marketMin.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">¥{row.marketMid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">¥{row.marketMax.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">¥{row.current.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${competitivenessColor}`}>
                        {competitiveness}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
            <div className="font-medium text-green-700 dark:text-green-300">竞争力强</div>
            <div className="text-green-600 dark:text-green-400 mt-1">≥P50</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-center">
            <div className="font-medium text-amber-700 dark:text-amber-300">竞争力中</div>
            <div className="text-amber-600 dark:text-amber-400 mt-1">P25-P50</div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
            <div className="font-medium text-red-700 dark:text-red-300">竞争力弱</div>
            <div className="text-red-600 dark:text-red-400 mt-1">&lt;P25</div>
          </div>
        </div>
      </div>
    </div>
  )
}
