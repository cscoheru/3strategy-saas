'use client'

import { useState } from 'react'
import { TrendingDown, AlertTriangle, CheckCircle2, DollarSign, BarChart3 } from 'lucide-react'

interface MarketPercentile {
  p25: number
  p50: number
  p75: number
  p90: number
  avg: number
}

interface MarketData {
  position: string
  job_level: string
  city: string
  percentile: MarketPercentile
  sample_size: number
  data_source: string
}

interface CompetitivenessResult {
  employee_id: string
  employee_name: string
  current_salary: number
  market_position: string
  percentile: number
  gap_to_market: number
  gap_percentage: number
  market_data: MarketData
  turnover_risk: string
  risk_factors: string[]
  recommendations: string[]
}

interface AdjustmentResult {
  employee_id: string
  employee_name: string
  current_salary: number
  current_position: string
  suggested_salary: number
  suggested_increase: number
  suggested_increase_percentage: number
  new_position: string
  target_percentile: number
  budget_impact: number
  reasons: string[]
}

export default function SalaryBenchmarkPage() {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'analyze' | 'adjust'>('benchmark')

  // 市场对标表单
  const [benchmarkForm, setBenchmarkForm] = useState({
    position: '',
    jobLevel: 'mid',
    city: '',
    industry: '互联网',
  })

  // 竞争力分析表单
  const [analyzeForm, setAnalyzeForm] = useState({
    employeeId: '',
    employeeName: '',
    position: '',
    jobLevel: 'mid',
    city: '',
    currentSalary: '',
    industry: '互联网',
    yearsOfService: '0',
    performanceRating: '',
  })

  // 调薪建议表单
  const [adjustForm, setAdjustForm] = useState({
    employeeId: '',
    employeeName: '',
    position: '',
    jobLevel: 'mid',
    city: '',
    currentSalary: '',
    industry: '互联网',
  })

  const [benchmarkResult, setBenchmarkResult] = useState<MarketData | null>(null)
  const [analyzeResult, setAnalyzeResult] = useState<CompetitivenessResult | null>(null)
  const [adjustResult, setAdjustResult] = useState<AdjustmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 查询市场对标
  const queryBenchmark = async () => {
    if (!benchmarkForm.position || !benchmarkForm.city) {
      showMessage('error', '请填写职位和城市')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8002/api/v1/compensation/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(benchmarkForm),
      })

      const data = await response.json()

      if (data.success) {
        setBenchmarkResult(data.data)
        showMessage('success', '查询成功')
      } else {
        showMessage('error', '查询失败')
      }
    } catch (error) {
      console.error('Benchmark error:', error)
      showMessage('error', '连接服务失败，请确保Compensation Service正在运行')
    } finally {
      setLoading(false)
    }
  }

  // 分析竞争力
  const analyzeCompetitiveness = async () => {
    if (!analyzeForm.employeeId || !analyzeForm.position || !analyzeForm.city || !analyzeForm.currentSalary) {
      showMessage('error', '请填写必要信息')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8002/api/v1/compensation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...analyzeForm,
          currentSalary: parseFloat(analyzeForm.currentSalary),
          yearsOfService: parseFloat(analyzeForm.yearsOfService),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalyzeResult(data.data)
        showMessage('success', '分析完成')
      } else {
        showMessage('error', '分析失败')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      showMessage('error', '连接服务失败')
    } finally {
      setLoading(false)
    }
  }

  // 计算调薪建议
  const calculateAdjustment = async () => {
    if (!adjustForm.employeeId || !adjustForm.position || !adjustForm.city || !adjustForm.currentSalary) {
      showMessage('error', '请填写必要信息')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8002/api/v1/compensation/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adjustForm,
          currentSalary: parseFloat(adjustForm.currentSalary),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAdjustResult(data.data)
        showMessage('success', '计算完成')
      } else {
        showMessage('error', '计算失败')
      }
    } catch (error) {
      console.error('Adjustment error:', error)
      showMessage('error', '连接服务失败')
    } finally {
      setLoading(false)
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

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'leading':
        return 'text-green-600 bg-green-100 border-green-300'
      case 'competitive':
        return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'market':
        return 'text-gray-600 bg-gray-100 border-gray-300'
      case 'lagging':
        return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'significantly_lagging':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTurnoverRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-green-600 bg-green-100'
    }
  }

  const loadBenchmarkExample = () => {
    setBenchmarkForm({
      position: '软件工程师',
      jobLevel: 'senior',
      city: '北京',
      industry: '互联网',
    })
  }

  const loadAnalyzeExample = () => {
    setAnalyzeForm({
      employeeId: 'emp-001',
      employeeName: '张三',
      position: '软件工程师',
      jobLevel: 'senior',
      city: '北京',
      currentSalary: '400000',
      industry: '互联网',
      yearsOfService: '2',
      performanceRating: '优秀',
    })
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">薪酬对标</h1>
          </div>
          <p className="text-muted-foreground">
            市场薪酬数据查询、竞争力分析与调薪建议，AI驱动的薪酬决策支持
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* 标签页 */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'benchmark'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              市场对标
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'analyze'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              竞争力分析
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'adjust'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              调薪建议
            </button>
          </div>
        </div>

        {/* 市场对标 */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">查询市场薪酬数据</h2>
                <button
                  onClick={loadBenchmarkExample}
                  className="text-sm text-primary hover:underline"
                >
                  加载示例
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位
                  </label>
                  <input
                    type="text"
                    value={benchmarkForm.position}
                    onChange={(e) => setBenchmarkForm({ ...benchmarkForm, position: e.target.value })}
                    placeholder="软件工程师"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位等级
                  </label>
                  <select
                    value={benchmarkForm.jobLevel}
                    onChange={(e) => setBenchmarkForm({ ...benchmarkForm, jobLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="executive">高管</option>
                    <option value="director">总监</option>
                    <option value="manager">经理</option>
                    <option value="senior">高级专员</option>
                    <option value="mid">中级专员</option>
                    <option value="junior">初级专员</option>
                    <option value="intern">实习生</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    城市
                  </label>
                  <input
                    type="text"
                    value={benchmarkForm.city}
                    onChange={(e) => setBenchmarkForm({ ...benchmarkForm, city: e.target.value })}
                    placeholder="北京"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    行业
                  </label>
                  <input
                    type="text"
                    value={benchmarkForm.industry}
                    onChange={(e) => setBenchmarkForm({ ...benchmarkForm, industry: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <button
                onClick={queryBenchmark}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? '查询中...' : '查询市场数据'}
              </button>
            </div>

            {benchmarkResult && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">市场薪酬分位值</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">职位</div>
                    <div className="text-lg font-semibold text-foreground">{benchmarkResult.position}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">城市</div>
                    <div className="text-lg font-semibold text-foreground">{benchmarkResult.city}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">P25</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(benchmarkResult.percentile.p25)}</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">P50（中位数）</div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(benchmarkResult.percentile.p50)}</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">P75</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(benchmarkResult.percentile.p75)}</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">P90</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(benchmarkResult.percentile.p90)}</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  数据来源: {benchmarkResult.data_source} | 样本量: {benchmarkResult.sample_size}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 竞争力分析 */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">分析员工薪酬竞争力</h2>
                <button
                  onClick={loadAnalyzeExample}
                  className="text-sm text-primary hover:underline"
                >
                  加载示例
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    员工ID
                  </label>
                  <input
                    type="text"
                    value={analyzeForm.employeeId}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, employeeId: e.target.value })}
                    placeholder="emp-001"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    员工姓名
                  </label>
                  <input
                    type="text"
                    value={analyzeForm.employeeName}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, employeeName: e.target.value })}
                    placeholder="张三"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位
                  </label>
                  <input
                    type="text"
                    value={analyzeForm.position}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, position: e.target.value })}
                    placeholder="软件工程师"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位等级
                  </label>
                  <select
                    value={analyzeForm.jobLevel}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, jobLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="executive">高管</option>
                    <option value="director">总监</option>
                    <option value="manager">经理</option>
                    <option value="senior">高级专员</option>
                    <option value="mid">中级专员</option>
                    <option value="junior">初级专员</option>
                    <option value="intern">实习生</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    城市
                  </label>
                  <input
                    type="text"
                    value={analyzeForm.city}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, city: e.target.value })}
                    placeholder="北京"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    当前年薪（元）
                  </label>
                  <input
                    type="number"
                    value={analyzeForm.currentSalary}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, currentSalary: e.target.value })}
                    placeholder="400000"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    服务年限（年）
                  </label>
                  <input
                    type="number"
                    value={analyzeForm.yearsOfService}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, yearsOfService: e.target.value })}
                    placeholder="2"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    绩效评级（可选）
                  </label>
                  <input
                    type="text"
                    value={analyzeForm.performanceRating}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, performanceRating: e.target.value })}
                    placeholder="优秀"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <button
                onClick={analyzeCompetitiveness}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? '分析中...' : '分析竞争力'}
              </button>
            </div>

            {analyzeResult && (
              <div className="space-y-4">
                {/* 市场定位 */}
                <div className={`p-6 border rounded-xl ${getMarketPositionColor(analyzeResult.market_position)}`}>
                  <h2 className="text-xl font-semibold mb-4">市场定位</h2>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm opacity-75 mb-1">当前年薪</div>
                      <div className="text-2xl font-bold">{formatCurrency(analyzeResult.current_salary)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75 mb-1">市场定位</div>
                      <div className="text-2xl font-bold">{getMarketPositionLabel(analyzeResult.market_position)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75 mb-1">市场百分位</div>
                      <div className="text-2xl font-bold">{analyzeResult.percentile}%</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium">与市场中位值差距: </span>
                    <span className={`font-bold ${analyzeResult.gap_to_market < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {analyzeResult.gap_percentage > 0 ? '+' : ''}{analyzeResult.gap_percentage.toFixed(1)}%
                      ({formatCurrency(analyzeResult.gap_to_market)})
                    </span>
                  </div>
                </div>

                {/* 离职风险 */}
                <div className={`p-4 rounded-lg ${getTurnoverRiskColor(analyzeResult.turnover_risk)}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">离职风险: {analyzeResult.turnover_risk === 'high' ? '高' : analyzeResult.turnover_risk === 'medium' ? '中' : '低'}</span>
                  </div>
                  {analyzeResult.risk_factors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {analyzeResult.risk_factors.map((factor, idx) => (
                        <li key={idx} className="text-sm">• {factor}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 建议 */}
                {analyzeResult.recommendations.length > 0 && (
                  <div className="p-4 border border-border rounded-lg bg-blue-50">
                    <h3 className="font-medium text-blue-900 mb-2">建议</h3>
                    <ul className="space-y-1">
                      {analyzeResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-blue-800">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 调薪建议 */}
        {activeTab === 'adjust' && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-lg font-semibold text-foreground mb-4">计算调薪建议</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    员工ID
                  </label>
                  <input
                    type="text"
                    value={adjustForm.employeeId}
                    onChange={(e) => setAdjustForm({ ...adjustForm, employeeId: e.target.value })}
                    placeholder="emp-001"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    员工姓名
                  </label>
                  <input
                    type="text"
                    value={adjustForm.employeeName}
                    onChange={(e) => setAdjustForm({ ...adjustForm, employeeName: e.target.value })}
                    placeholder="张三"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位
                  </label>
                  <input
                    type="text"
                    value={adjustForm.position}
                    onChange={(e) => setAdjustForm({ ...adjustForm, position: e.target.value })}
                    placeholder="软件工程师"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位等级
                  </label>
                  <select
                    value={adjustForm.jobLevel}
                    onChange={(e) => setAdjustForm({ ...adjustForm, jobLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="executive">高管</option>
                    <option value="director">总监</option>
                    <option value="manager">经理</option>
                    <option value="senior">高级专员</option>
                    <option value="mid">中级专员</option>
                    <option value="junior">初级专员</option>
                    <option value="intern">实习生</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    城市
                  </label>
                  <input
                    type="text"
                    value={adjustForm.city}
                    onChange={(e) => setAdjustForm({ ...adjustForm, city: e.target.value })}
                    placeholder="北京"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    当前年薪（元）
                  </label>
                  <input
                    type="number"
                    value={adjustForm.currentSalary}
                    onChange={(e) => setAdjustForm({ ...adjustForm, currentSalary: e.target.value })}
                    placeholder="400000"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <button
                onClick={calculateAdjustment}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? '计算中...' : '计算调薪建议'}
              </button>
            </div>

            {adjustResult && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">调薪建议</h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">当前年薪</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(adjustResult.current_salary)}</div>
                    <div className={`text-sm mt-1 ${getMarketPositionColor(adjustResult.current_position)}`}>
                      {getMarketPositionLabel(adjustResult.current_position)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">建议年薪</div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(adjustResult.suggested_salary)}</div>
                    <div className={`text-sm mt-1 ${getMarketPositionColor(adjustResult.new_position)}`}>
                      {getMarketPositionLabel(adjustResult.new_position)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg mb-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">调薪幅度</div>
                    <div className="text-2xl font-bold text-primary">{adjustResult.suggested_increase_percentage.toFixed(1)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">调薪金额</div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(adjustResult.suggested_increase)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">预算影响</div>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(adjustResult.budget_impact)}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">调薪理由</h3>
                  <ul className="space-y-1">
                    {adjustResult.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          🔗 Compensation Service: http://localhost:8002
        </div>
      </div>
    </div>
  )
}
