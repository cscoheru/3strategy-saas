'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Target } from 'lucide-react'

interface DimensionScore {
  dimension: string
  score: number
  passed: boolean
  issues: string[]
  suggestions: string[]
}

interface ValidationResult {
  goal: string
  smart_score: number
  passed: boolean
  dimension_scores: DimensionScore[]
  overall_issues: string[]
  improved_suggestions: string[]
  improved_goal: string | null
}

export default function PerformanceDiagnosticPage() {
  const [goal, setGoal] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const validateGoal = async () => {
    if (!goal.trim()) {
      showMessage('error', '请输入目标')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8001/api/v1/goal-lifecycle/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal, context: context || undefined }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        showMessage(data.data.passed ? 'success' : 'error',
          data.data.passed ? '目标质量合格' : '目标质量需要改进')
      } else {
        showMessage('error', '验证失败')
      }
    } catch (error) {
      console.error('Validation error:', error)
      showMessage('error', '连接服务失败，请确保Performance Service正在运行')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      specific: '具体性 (Specific)',
      measurable: '可衡量性 (Measurable)',
      achievable: '可实现性 (Achievable)',
      relevant: '相关性 (Relevant)',
      time_bound: '时限性 (Time-bound)',
    }
    return labels[dimension] || dimension
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">绩效目标诊断</h1>
          </div>
          <p className="text-muted-foreground">
            基于SMART原则评估目标质量，提供改进建议
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="mb-8 p-6 border border-border rounded-xl bg-card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                目标描述
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="例如：提升Q4季度的销售业绩"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                上下文信息（可选）
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="例如：销售部门，华东地区"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={validateGoal}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? '分析中...' : '验证目标质量'}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">SMART评分</h2>
                <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                  result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {result.smart_score}
                </div>
              </div>

              <div className="relative h-4 bg-secondary rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all ${getScoreBgColor(result.smart_score)}`}
                  style={{ width: `${result.smart_score}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {result.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                {result.passed ? '目标质量合格' : '目标质量需要改进'}
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">维度分析</h2>
              <div className="space-y-4">
                {result.dimension_scores.map((dim) => (
                  <div key={dim.dimension} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{getDimensionLabel(dim.dimension)}</span>
                        <span className={`text-sm px-2 py-1 rounded ${getScoreColor(dim.score)}`}>
                          {dim.score}分
                        </span>
                      </div>
                      {dim.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all ${getScoreBgColor(dim.score)}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>

                    {dim.issues.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-red-700 mb-1">问题：</div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {dim.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dim.suggestions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">建议：</div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {dim.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {result.overall_issues.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-amber-50">
                <h2 className="text-xl font-semibold text-amber-900 mb-4">改进建议</h2>
                <ul className="space-y-2">
                  {result.overall_issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-amber-900">{issue}</span>
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
