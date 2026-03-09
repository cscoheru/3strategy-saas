'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, Clock, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react'

interface ObjectiveData {
  id: string
  title: string
  start_date: string
  end_date: string
  current_progress: number
  current_date?: string
}

interface ProgressStatus {
  objective_id: string
  objective_title: string
  start_date: string
  end_date: string
  current_date: string
  total_days: number
  days_elapsed: number
  days_remaining: number
  time_elapsed_percentage: number
  expected_progress: number
  actual_progress: number
  progress_variance: number
  alert_level: 'info' | 'warning' | 'critical' | 'urgent'
  on_track: boolean
  risk_factors: string[]
}

interface ProgressAlert {
  objective_id: string
  objective_title: string
  alert_level: 'info' | 'warning' | 'critical' | 'urgent'
  gap_percentage: number
  message: string
  suggested_actions: string[]
}

export default function ProgressTrackerPage() {
  const [objective, setObjective] = useState({
    id: '',
    title: '',
    startDate: '',
    endDate: '',
    currentProgress: 0,
  })
  const [currentDate, setCurrentDate] = useState('')
  const [status, setStatus] = useState<ProgressStatus | null>(null)
  const [alert, setAlert] = useState<ProgressAlert | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const checkProgress = async () => {
    if (!objective.title || !objective.startDate || !objective.endDate) {
      showMessage('error', '请填写完整信息')
      return
    }

    setLoading(true)

    try {
      const requestBody: ObjectiveData = {
        id: objective.id || `obj-${Date.now()}`,
        title: objective.title,
        start_date: objective.startDate,
        end_date: objective.endDate,
        current_progress: objective.currentProgress,
      }

      if (currentDate) {
        requestBody.current_date = currentDate
      }

      const response = await fetch('http://localhost:8001/api/v1/goal-lifecycle/progress/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success) {
        setStatus(data.data)
        showMessage('success', '进度检查完成')

        // 同时获取预警
        const alertResponse = await fetch('http://localhost:8001/api/v1/goal-lifecycle/progress/alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        const alertData = await alertResponse.json()
        if (alertData.success && alertData.data) {
          setAlert(alertData.data)
        } else {
          setAlert(null)
        }
      } else {
        showMessage('error', '检查失败')
      }
    } catch (error) {
      console.error('Progress check error:', error)
      showMessage('error', '连接服务失败，请确保Performance Service正在运行')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'urgent':
        return 'text-red-600 bg-red-100 border-red-300'
      case 'critical':
        return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'warning':
        return 'text-amber-600 bg-amber-100 border-amber-300'
      default:
        return 'text-green-600 bg-green-100 border-green-300'
    }
  }

  const getAlertLevelIcon = (level: string) => {
    switch (level) {
      case 'urgent':
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <CheckCircle2 className="w-5 h-5" />
    }
  }

  const getProgressColor = (variance: number) => {
    if (variance >= 0) return 'bg-green-500'
    if (variance >= -20) return 'bg-amber-500'
    if (variance >= -30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // 示例数据
  const loadExample = () => {
    setObjective({
      id: 'obj-001',
      title: 'Q4提升华东地区销售额',
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      currentProgress: 30,
    })
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">进度跟踪</h1>
          </div>
          <p className="text-muted-foreground">
            基于时间的期望进度vs实际进度分析，自动预警偏差并建议改进行动
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

        <div className="mb-8 p-6 border border-border rounded-xl bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">目标信息</h2>
            <button
              onClick={loadExample}
              className="text-sm text-primary hover:underline"
            >
              加载示例
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                目标标题
              </label>
              <input
                type="text"
                value={objective.title}
                onChange={(e) => setObjective({ ...objective, title: e.target.value })}
                placeholder="例如：Q4提升华东地区销售额"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  开始日期
                </label>
                <input
                  type="date"
                  value={objective.startDate}
                  onChange={(e) => setObjective({ ...objective, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  结束日期
                </label>
                <input
                  type="date"
                  value={objective.endDate}
                  onChange={(e) => setObjective({ ...objective, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  当前进度 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={objective.currentProgress}
                  onChange={(e) => setObjective({ ...objective, currentProgress: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  当前日期（可选）
                </label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              onClick={checkProgress}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? '分析中...' : '检查进度'}
            </button>
          </div>
        </div>

        {alert && (
          <div className={`mb-6 p-6 border rounded-xl ${getAlertLevelColor(alert.alert_level)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getAlertLevelIcon(alert.alert_level)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">预警信息</h3>
                <p className="mb-4">{alert.message}</p>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">建议行动：</h4>
                  <ul className="space-y-1">
                    {alert.suggested_actions.map((action, idx) => (
                      <li key={idx} className="text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm">
                  <span className="font-medium">偏差幅度：</span>
                  <span className={alert.gap_percentage < -30 ? 'font-bold' : ''}>
                    {alert.gap_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {status && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">进度详情</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">期望进度</div>
                    <div className="text-2xl font-bold text-foreground">
                      {status.expected_progress}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">实际进度</div>
                    <div className="text-2xl font-bold text-foreground">
                      {status.actual_progress}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">进度偏差</div>
                    <div className={`text-2xl font-bold flex items-center gap-2 ${
                      status.progress_variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {status.progress_variance >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {status.progress_variance > 0 ? '+' : ''}{status.progress_variance.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">时间消耗</div>
                    <div className="text-2xl font-bold text-foreground">
                      {status.time_elapsed_percentage}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">已用天数</div>
                    <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {status.days_elapsed} / {status.total_days} 天
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">剩余天数</div>
                    <div className="text-2xl font-bold text-foreground">
                      {status.days_remaining} 天
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">进度可视化</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm">期望进度</div>
                    <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${status.expected_progress}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-right">{status.expected_progress}%</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm">实际进度</div>
                    <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(status.progress_variance)}`}
                        style={{ width: `${status.actual_progress}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-right">{status.actual_progress}%</div>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                status.on_track ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {status.on_track ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {status.on_track ? '目标按计划进行' : '目标需要关注'}
                  </span>
                </div>
              </div>
            </div>

            {status.risk_factors.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-amber-50">
                <h2 className="text-xl font-semibold text-amber-900 mb-4">风险因素</h2>
                <ul className="space-y-2">
                  {status.risk_factors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-amber-900">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              🔗 Performance Service: http://localhost:8001
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
