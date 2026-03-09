'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Users, Target } from 'lucide-react'

interface Employee {
  employee_id: string
  employee_name?: string
  position: string
  job_level: string
  city: string
  current_salary: number
  industry?: string
  years_of_service?: number
  performance_rating?: string
}

interface OrganizationHealth {
  overall_score: number
  market_competitiveness: number
  internal_equity: number
  budget_utilization: number
  risk_level: string
  recommendations: string[]
}

interface EmployeeAnalysis {
  employee_id: string
  employee_name: string
  current_salary: number
  market_position: string
  percentile: number
  gap_percentage: number
  turnover_risk: string
  risk_factors: string[]
  market_data?: {
    position: string
  }
}

interface HeatmapData {
  department: string
  position_level: string
  competitiveness_score: number
  market_position: string
  average_gap_percentage: number
  employee_count: number
  high_risk_count: number
}

interface BudgetSimulation {
  scenario_name: string
  target_position: string
  affected_employees: number
  total_increase: number
  average_increase: number
  budget_required: number
  post_adjustment_health: number
  roi_description: string
}

export default function SalaryDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'batch' | 'heatmap' | 'budget'>('overview')

  // 示例员工数据
  const [employees] = useState<Employee[]>([
    {
      employee_id: 'emp-001',
      employee_name: '张三',
      position: '软件工程师',
      job_level: 'senior',
      city: '北京',
      current_salary: 400000,
      industry: '互联网',
      years_of_service: 2,
      performance_rating: '优秀',
    },
    {
      employee_id: 'emp-002',
      employee_name: '李四',
      position: '软件工程师',
      job_level: 'senior',
      city: '北京',
      current_salary: 550000,
      industry: '互联网',
      years_of_service: 4,
    },
    {
      employee_id: 'emp-003',
      employee_name: '王五',
      position: '产品经理',
      job_level: 'mid',
      city: '上海',
      current_salary: 300000,
      industry: '互联网',
      years_of_service: 1,
      performance_rating: '良好',
    },
    {
      employee_id: 'emp-004',
      employee_name: '赵六',
      position: '销售经理',
      job_level: 'manager',
      city: '深圳',
      current_salary: 350000,
      industry: '销售',
      years_of_service: 3,
    },
    {
      employee_id: 'emp-005',
      employee_name: '钱七',
      position: '数据分析师',
      job_level: 'junior',
      city: '杭州',
      current_salary: 150000,
      industry: '互联网',
      years_of_service: 0.5,
    },
  ])

  const [healthData, setHealthData] = useState<OrganizationHealth | null>(null)
  const [batchResults, setBatchResults] = useState<EmployeeAnalysis[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [budgetSimulations, setBudgetSimulations] = useState<BudgetSimulation[]>([])
  const [loading, setLoading] = useState(false)

  // 加载仪表盘数据
  const loadDashboard = async () => {
    setLoading(true)

    try {
      // 并行加载所有数据
      const [healthRes, batchRes, heatmapRes] = await Promise.all([
        fetch('http://localhost:8002/api/v1/compensation/dashboard/health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees }),
        }),
        fetch('http://localhost:8002/api/v1/compensation/dashboard/batch-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees }),
        }),
        fetch('http://localhost:8002/api/v1/compensation/dashboard/heatmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees }),
        }),
      ])

      const health = await healthRes.json()
      const batch = await batchRes.json()
      const heatmap = await heatmapRes.json()

      if (health.success) setHealthData(health.data)
      if (batch.success) setBatchResults(batch.data.analyses)
      if (heatmap.success) setHeatmapData(heatmap.data.heatmap)

      // 自动加载预算模拟
      const budgetRes = await fetch('http://localhost:8002/api/v1/compensation/dashboard/simulate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees,
          scenarios: [
            { name: '调整至有竞争力', target_position: 'competitive' },
            { name: '调整至领先', target_position: 'leading' },
            { name: '仅调整高风险员工', target_position: 'competitive' },
          ],
        }),
      })

      const budget = await budgetRes.json()
      if (budget.success) setBudgetSimulations(budget.data.simulations)

    } catch (error) {
      console.error('Dashboard loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-green-600 bg-green-100'
    }
  }

  const getMarketPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      leading: '领先',
      competitive: '有竞争力',
      market: '市场水平',
      lagging: '滞后',
      significantly_lagging: '严重滞后',
    }
    return labels[position] || position
  }

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">薪酬仪表盘</h1>
          </div>
          <p className="text-muted-foreground">
            组织薪酬健康度、批量竞争力分析、热力图可视化与预算模拟
          </p>
        </div>

        {/* 加载按钮 */}
        <div className="mb-6">
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? '加载中...' : '📊 加载仪表盘数据'}
          </button>
        </div>

        {/* 标签页 */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              健康度总览
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'batch'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              批量分析
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'heatmap'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              热力图
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'budget'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              预算模拟
            </button>
          </div>
        </div>

        {/* 健康度总览 */}
        {activeTab === 'overview' && healthData && (
          <div className="space-y-6">
            {/* 总体评分 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-6">组织薪酬健康度</h2>

              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">总体健康度</div>
                  <div className={`text-4xl font-bold ${getScoreColor(healthData.overall_score)}`}>
                    {healthData.overall_score}
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${getScoreBgColor(healthData.overall_score)}`}
                      style={{ width: `${healthData.overall_score}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">市场竞争力</div>
                  <div className={`text-4xl font-bold ${getScoreColor(healthData.market_competitiveness)}`}>
                    {healthData.market_competitiveness}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">内部公平性</div>
                  <div className={`text-4xl font-bold ${getScoreColor(healthData.internal_equity)}`}>
                    {healthData.internal_equity}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">预算使用率</div>
                  <div className={`text-4xl font-bold ${getScoreColor(healthData.budget_utilization)}`}>
                    {healthData.budget_utilization}%
                  </div>
                </div>
              </div>

              {/* 风险等级 */}
              <div className={`p-4 rounded-lg ${getRiskLevelColor(healthData.risk_level)}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">风险等级: {healthData.risk_level === 'high' ? '高' : healthData.risk_level === 'medium' ? '中' : '低'}</span>
                </div>
              </div>
            </div>

            {/* 建议 */}
            {healthData.recommendations.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-3">💡 改进建议</h3>
                <ul className="space-y-2">
                  {healthData.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-blue-800 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 批量分析 */}
        {activeTab === 'batch' && batchResults.length > 0 && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">员工竞争力分析</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">员工</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">职位</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">当前年薪</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">市场定位</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">差距</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">离职风险</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((emp) => (
                      <tr key={emp.employee_id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{emp.employee_name}</div>
                          <div className="text-sm text-muted-foreground">{emp.employee_id}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{emp.market_data?.position || '-'}</td>
                        <td className="py-3 px-4 text-right text-sm text-foreground">{formatCurrency(emp.current_salary)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(emp.market_position)}`}>
                            {getMarketPositionLabel(emp.market_position)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          <span className={emp.gap_percentage < 0 ? 'text-red-600' : 'text-green-600'}>
                            {emp.gap_percentage > 0 ? '+' : ''}{emp.gap_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(emp.turnover_risk)}`}>
                            {emp.turnover_risk === 'high' ? '高' : emp.turnover_risk === 'medium' ? '中' : '低'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 高风险员工预警 */}
            <div className="p-6 border border-red-300 rounded-xl bg-red-50">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                高离职风险员工 ({batchResults.filter(e => e.turnover_risk === 'high').length}人)
              </h3>
              <div className="space-y-2">
                {batchResults.filter(e => e.turnover_risk === 'high').map((emp) => (
                  <div key={emp.employee_id} className="text-sm text-red-800">
                    <strong>{emp.employee_name}</strong> - {emp.risk_factors?.join('、') || '薪酬滞后'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 热力图 */}
        {activeTab === 'heatmap' && heatmapData.length > 0 && (
          <div className="p-6 border border-border rounded-xl bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">薪酬竞争力热力图</h2>

            <div className="space-y-4">
              {heatmapData.map((data, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="font-medium text-foreground">{data.department}</div>
                      <div className="text-sm text-muted-foreground">{data.position_level}</div>
                      <div className="text-sm text-muted-foreground">{data.employee_count}人</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">{data.competitiveness_score}</div>
                      <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(data.market_position)}`}>
                        {getMarketPositionLabel(data.market_position)}
                      </span>
                      {data.high_risk_count > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                          {data.high_risk_count}人高风险
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getHeatmapColor(data.competitiveness_score)}`}
                      style={{ width: `${data.competitiveness_score}%` }}
                    />
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    平均差距: {data.average_gap_percentage > 0 ? '+' : ''}{data.average_gap_percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 预算模拟 */}
        {activeTab === 'budget' && budgetSimulations.length > 0 && (
          <div className="p-6 border border-border rounded-xl bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">调薪预算模拟</h2>

            <div className="space-y-4">
              {budgetSimulations.map((sim, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{sim.scenario_name}</h3>
                    <div className={`text-2xl font-bold ${getScoreColor(sim.post_adjustment_health)}`}>
                      {sim.post_adjustment_health}分
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">影响员工</div>
                      <div className="font-medium text-foreground">{sim.affected_employees}人</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">所需预算</div>
                      <div className="font-medium text-primary">{formatCurrency(sim.budget_required)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">人均调薪</div>
                      <div className="font-medium text-foreground">{formatCurrency(sim.average_increase)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">调整后健康度</div>
                      <div className="font-medium text-green-600">{sim.post_adjustment_health}分</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">
                    {sim.roi_description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          🔗 Compensation Service: http://localhost:8002 | 仪表盘数据实时更新
        </div>
      </div>
    </div>
  )
}
