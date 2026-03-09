'use client'

import { useState } from 'react'
import { FileText, Sparkles, CheckCircle, AlertCircle, MessageSquare, Target, TrendingUp } from 'lucide-react'

const API_BASE = 'http://localhost:8003'

interface MatchScore {
  overall_score: number
  technical_score: number
  experience_score: number
  education_score: number
  soft_skill_score: number
}

interface SkillGap {
  skill_name: string
  required_level: string
  candidate_level: string
  gap_severity: string
  suggestions: string[]
}

interface ExperienceGap {
  requirement: string
  candidate_has: boolean
  gap_description: string
  severity: string
}

interface InterviewQuestion {
  question: string
  category: string
  focus_area: string
  priority: string
}

interface MatchAnalysis {
  candidate_name?: string
  match_score: MatchScore
  skill_gaps: SkillGap[]
  experience_gaps: ExperienceGap[]
  strengths: string[]
  concerns: string[]
  interview_questions: InterviewQuestion[]
  recommendation: string
  recommendation_reason: string
}

export default function ResumeMatchPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [positionLevel, setPositionLevel] = useState('')
  const [location, setLocation] = useState('北京')
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null)

  const analyzeMatch = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      alert('请输入职位描述和简历内容')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/recruitment/analyze-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          position_level: positionLevel || undefined,
          location,
          resume_text: resumeText,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setAnalysis(result.data)
      }
    } catch (error) {
      console.error('Match analysis error:', error)
      alert('分析失败，请检查服务是否运行')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    return 'text-amber-600 bg-amber-100'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    return 'bg-amber-500'
  }

  const getGapSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-600 bg-red-100',
      significant: 'text-orange-600 bg-orange-100',
      minor: 'text-yellow-600 bg-yellow-100',
      none: 'text-green-600 bg-green-100',
    }
    return colors[severity] || 'text-gray-600 bg-gray-100'
  }

  const getGapSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      critical: '严重',
      significant: '显著',
      minor: '轻微',
      none: '无',
    }
    return labels[severity] || severity
  }

  const getRecommendationLabel = (recommendation: string) => {
    const labels: Record<string, string> = {
      strong_recommend: '强烈推荐',
      recommend: '推荐',
      consider: '考虑',
      not_recommend: '不推荐',
    }
    return labels[recommendation] || recommendation
  }

  const getRecommendationColor = (recommendation: string) => {
    const colors: Record<string, string> = {
      strong_recommend: 'text-green-600 bg-green-100',
      recommend: 'text-blue-600 bg-blue-100',
      consider: 'text-amber-600 bg-amber-100',
      not_recommend: 'text-red-600 bg-red-100',
    }
    return colors[recommendation] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">简历匹配分析</h1>
          </div>
          <p className="text-muted-foreground">
            AI驱动的简历与岗位匹配度分析，识别技能差距，生成面试问题
          </p>
        </div>

        {/* 输入区域 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 左侧：职位描述 */}
          <div className="p-6 border border-border rounded-xl bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              职位描述
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  职位描述内容 *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="粘贴职位描述..."
                  className="w-full min-h-[200px] p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    职位等级
                  </label>
                  <select
                    value={positionLevel}
                    onChange={(e) => setPositionLevel(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">自动识别</option>
                    <option value="executive">高管</option>
                    <option value="senior">高级</option>
                    <option value="mid">中级</option>
                    <option value="junior">初级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    工作地点
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="北京">北京</option>
                    <option value="上海">上海</option>
                    <option value="深圳">深圳</option>
                    <option value="杭州">杭州</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：简历内容 */}
          <div className="p-6 border border-border rounded-xl bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              简历内容
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                简历文本 *
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="粘贴简历文本内容..."
                className="w-full min-h-[280px] p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 分析按钮 */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={analyzeMatch}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>分析中...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                开始匹配分析
              </>
            )}
          </button>
        </div>

        {/* 分析结果 */}
        {analysis && (
          <div className="space-y-6">
            {/* 总体评分 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">匹配度评分</h2>
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">总体</div>
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.match_score.overall_score).split(' ')[0]}`}>
                    {analysis.match_score.overall_score.toFixed(1)}
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${getScoreBgColor(analysis.match_score.overall_score)}`}
                      style={{ width: `${analysis.match_score.overall_score}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">技能</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.match_score.technical_score.toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">经验</div>
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.match_score.experience_score.toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">学历</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.match_score.education_score.toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">软技能</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {analysis.match_score.soft_skill_score.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* 推荐意见 */}
              <div className={`p-4 rounded-lg ${getRecommendationColor(analysis.recommendation)}`}>
                <div className="font-semibold mb-1">
                  推荐意见: {getRecommendationLabel(analysis.recommendation)}
                </div>
                <div className="text-sm opacity-80">{analysis.recommendation_reason}</div>
              </div>
            </div>

            {/* 优势与关注点 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 border border-green-300 rounded-xl bg-green-50">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  优势
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 border border-amber-300 rounded-xl bg-amber-50">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  关注点
                </h3>
                <ul className="space-y-2">
                  {analysis.concerns.map((concern, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">!</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 技能差距 */}
            {analysis.skill_gaps.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h3 className="font-semibold text-foreground mb-4">技能差距分析</h3>
                <div className="space-y-3">
                  {analysis.skill_gaps.map((gap, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-foreground">{gap.skill_name}</div>
                        <span className={`text-xs px-2 py-1 rounded ${getGapSeverityColor(gap.gap_severity)}`}>
                          {getGapSeverityLabel(gap.gap_severity)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        要求: {gap.required_level} | 候选人: {gap.candidate_level}
                      </div>
                      {gap.suggestions.length > 0 && (
                        <div className="text-xs text-blue-600">
                          💡 {gap.suggestions[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 经验差距 */}
            {analysis.experience_gaps.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h3 className="font-semibold text-foreground mb-4">经验差距分析</h3>
                <div className="space-y-3">
                  {analysis.experience_gaps.map((gap, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${gap.candidate_has ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">{gap.requirement}</div>
                        <span className={`text-xs px-2 py-1 rounded ${getGapSeverityColor(gap.severity)}`}>
                          {gap.candidate_has ? '符合' : '不符合'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{gap.gap_description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 面试问题 */}
            {analysis.interview_questions.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  推荐面试问题
                </h3>
                <div className="space-y-3">
                  {analysis.interview_questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          q.priority === 'high' ? 'bg-red-100 text-red-700' :
                          q.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {q.priority === 'high' ? '重要' : q.priority === 'medium' ? '中等' : '一般'}
                        </span>
                        <span className="text-xs text-muted-foreground">{q.category} | {q.focus_area}</span>
                      </div>
                      <div className="text-sm text-blue-900">{q.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          🔗 Recruitment Service: http://localhost:8003 | 简历匹配AI驱动分析
        </div>
      </div>
    </div>
  )
}
