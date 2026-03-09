'use client'

import { useState } from 'react'
import { Search, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, MessageSquare } from 'lucide-react'

interface DimensionScore {
  id: string
  name: string
  score: number
  is_highlighted: boolean
  reason: string
  issues: string[]
  suggestions: string[]
}

interface DiagnosticResult {
  goal: string
  target: number
  actual: number
  gap_percentage: number
  gap_type: string
  dimension_scores: DimensionScore[]
  summary: string
  root_cause: string
  root_cause_type: string
  recommendations: string[]
  five_questions: string[]
}

export default function PerformanceAttributionPage() {
  const [formData, setFormData] = useState({
    goal: '',
    target: '',
    actual: '',
    context: '',
  })
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showFiveQuestions, setShowFiveQuestions] = useState(false)

  const diagnose = async () => {
    if (!formData.goal || !formData.target || !formData.actual) {
      showMessage('error', '请填写完整信息')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8001/api/v1/goal-lifecycle/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: formData.goal,
          target: parseFloat(formData.target),
          actual: parseFloat(formData.actual),
          context: formData.context || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        showMessage('success', '诊断完成')
      } else {
        showMessage('error', '诊断失败')
      }
    } catch (error) {
      console.error('Diagnostic error:', error)
      showMessage('error', '连接服务失败，请确保Performance Service正在运行')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
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

  const getGapTypeColor = (gapType: string) => {
    switch (gapType) {
      case 'positive':
        return 'text-green-600 bg-green-100'
      case 'negative':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const loadExample = () => {
    setFormData({
      goal: 'Q4提升华东地区销售额从1000万到1500万',
      target: '1500',
      actual: '1050',
      context: '新员工，首次负责销售，人手不足',
    })
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">归因诊断</h1>
          </div>
          <p className="text-muted-foreground">
            基于3力3平台框架深度分析目标未达成的根本原因，提供5问法对话和改进建议
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
            <h2 className="text-lg font-semibold text-foreground">诊断信息</h2>
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
                目标描述
              </label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="例如：Q4提升华东地区销售额从1000万到1500万"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  目标值
                </label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="1500"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  实际完成值
                </label>
                <input
                  type="number"
                  value={formData.actual}
                  onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                  placeholder="1050"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                上下文信息（可选）
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="例如：新员工，首次负责销售，人手不足"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={2}
              />
            </div>

            <button
              onClick={diagnose}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? '诊断中...' : '开始诊断'}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            {/* 差距概览 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">差距概览</h2>

              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">目标值</div>
                  <div className="text-2xl font-bold text-foreground">{result.target}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">实际完成</div>
                  <div className="text-2xl font-bold text-foreground">{result.actual}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">差距</div>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${getGapTypeColor(result.gap_type).split(' ')[0]}`}>
                    {result.gap_percentage >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    {result.gap_percentage > 0 ? '+' : ''}{result.gap_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${getGapTypeColor(result.gap_type)}`}>
                <div className="font-medium">{result.summary}</div>
              </div>
            </div>

            {/* 维度分析 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">维度分析</h2>

              <div className="space-y-4">
                {result.dimension_scores.map((dim) => (
                  <div
                    key={dim.id}
                    className={`border rounded-lg p-4 ${dim.is_highlighted ? 'border-amber-500 bg-amber-50' : 'border-border'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{dim.name}</span>
                        <span className={`text-sm px-2 py-1 rounded ${getScoreColor(dim.score)}`}>
                          {dim.score}分
                        </span>
                        {dim.is_highlighted && (
                          <span className="text-xs px-2 py-1 bg-amber-500 text-white rounded">
                            核心短板
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all ${getScoreBgColor(dim.score)}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">{dim.reason}</div>

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

            {/* 根因分析 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">根因分析</h2>

              <div className="p-4 bg-red-50 border border-red-300 rounded-lg mb-4">
                <div className="text-sm text-red-700 mb-1">核心短板：</div>
                <div className="text-red-900 font-medium">{result.root_cause}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-foreground mb-2">改进建议：</div>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5问法对话 */}
            {result.five_questions && result.five_questions.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    5问法深度对话
                  </h2>
                  <button
                    onClick={() => setShowFiveQuestions(!showFiveQuestions)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showFiveQuestions ? '收起' : '展开'}
                  </button>
                </div>

                {showFiveQuestions && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700 mb-2">
                        💡 5问法是一种根因分析技术，通过连续追问"为什么"找到问题根源
                      </div>
                    </div>

                    <div className="space-y-3">
                      {result.five_questions.map((question, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {idx + 1}
                            </div>
                            <div className="flex-1 text-foreground">{question}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
