'use client'

import { useState } from 'react'
import { GraduationCap, TrendingUp, BookOpen, UserPlus, Briefcase, CheckCircle2 } from 'lucide-react'

interface CapabilityGap {
  dimension: string
  current_score: number
  required_score: number
  gap: number
  priority: string
  impact_on_performance: string
}

interface TrainingCourse {
  name: string
  provider: string
  duration: string
  format: string
  relevance_score: number
}

interface MentorRecommendation {
  type: string
  requirements: string[]
  expected_outcomes: string[]
}

interface ProjectExperience {
  project_type: string
  description: string
  role: string
  duration: string
  learning_objectives: string[]
}

interface DevelopmentPlan {
  training_courses: TrainingCourse[]
  mentor: MentorRecommendation | null
  project_experiences: ProjectExperience[]
  self_learning: string[]
  timeline_months: number
}

interface AssessmentResult {
  employee_id: string
  employee_name: string
  assessment_date: string
  capability_radar: Record<string, number>
  capability_gaps: CapabilityGap[]
  overall_strengths: string[]
  overall_weaknesses: string[]
  development_focus: string
  development_plan: DevelopmentPlan
}

export default function CapabilityAssessmentPage() {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    currentRole: '',
    careerGoal: '',
  })
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const assess = async () => {
    if (!formData.employeeId || !formData.currentRole) {
      showMessage('error', '请填写员工ID和当前职位')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8001/api/v1/goal-lifecycle/capabilities/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: formData.employeeId,
          employee_name: formData.employeeName || undefined,
          current_role: formData.currentRole,
          career_goal: formData.careerGoal || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        showMessage('success', '能力评估完成')
      } else {
        showMessage('error', '评估失败')
      }
    } catch (error) {
      console.error('Assessment error:', error)
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
      technical_skills: '专业技能',
      leadership: '领导力',
      communication: '沟通能力',
      problem_solving: '问题解决',
      learning: '学习能力',
      execution: '执行力',
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-amber-600 bg-amber-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const loadExample = () => {
    setFormData({
      employeeId: 'emp-001',
      employeeName: '张三',
      currentRole: '销售专员',
      careerGoal: '晋升为销售经理',
    })
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">能力评估与IDP</h1>
          </div>
          <p className="text-muted-foreground">
            基于六维能力雷达图评估，生成个性化发展计划（培训、导师、项目）
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <GraduationCap className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="mb-8 p-6 border border-border rounded-xl bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">员工信息</h2>
            <button
              onClick={loadExample}
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
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="张三"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                当前职位
              </label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                placeholder="销售专员"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                职业目标（可选）
              </label>
              <input
                type="text"
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="晋升为销售经理"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            onClick={assess}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? '评估中...' : '开始评估'}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* 能力雷达图 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">能力雷达图</h2>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(result.capability_radar).map(([dim, score]) => (
                  <div key={dim} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {getDimensionLabel(dim)}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${getScoreColor(score)}`}>
                        {score}分
                      </span>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 能力差距 */}
            {result.capability_gaps.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">能力差距分析</h2>

                <div className="space-y-4">
                  {result.capability_gaps.map((gap) => (
                    <div key={gap.dimension} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">
                            {getDimensionLabel(gap.dimension)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(gap.priority)}`}>
                            {gap.priority === 'high' ? '高优先级' : gap.priority === 'medium' ? '中优先级' : '低优先级'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            当前{gap.current_score}分 → 目标{gap.required_score}分
                          </span>
                          <span className="text-sm font-medium text-primary">
                            差距{gap.gap}分
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${gap.current_score}%` }}
                          />
                        </div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${gap.required_score}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground">
                        {gap.impact_on_performance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 发展重点 */}
            <div className="p-6 border border-border rounded-xl bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">发展重点</h2>
              <p className="text-blue-800">{result.development_focus}</p>
            </div>

            {/* IDP - 发展计划 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                个人发展计划（IDP）- {result.development_plan.timeline_months}个月
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 培训课程 */}
                {result.development_plan.training_courses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">培训课程</h3>
                    </div>
                    <div className="space-y-2">
                      {result.development_plan.training_courses.map((course, idx) => (
                        <div key={idx} className="p-3 border border-border rounded-lg bg-muted/30">
                          <div className="font-medium text-foreground text-sm">{course.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {course.provider} · {course.duration} · {course.format}
                          </div>
                          <div className="text-xs text-primary mt-1">
                            相关性: {course.relevance_score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 导师推荐 */}
                {result.development_plan.mentor && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserPlus className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">导师推荐</h3>
                    </div>
                    <div className="p-4 border border-border rounded-lg bg-muted/30">
                      <div className="text-sm font-medium text-primary mb-2">
                        {result.development_plan.mentor.type}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        <strong>要求：</strong>
                        <ul className="list-disc list-inside mt-1">
                          {result.development_plan.mentor.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <strong>期望成果：</strong>
                        <ul className="list-disc list-inside mt-1">
                          {result.development_plan.mentor.expected_outcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 项目历练 */}
                {result.development_plan.project_experiences.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">项目历练</h3>
                    </div>
                    <div className="space-y-2">
                      {result.development_plan.project_experiences.map((project, idx) => (
                        <div key={idx} className="p-3 border border-border rounded-lg bg-muted/30">
                          <div className="font-medium text-foreground text-sm">{project.project_type}</div>
                          <div className="text-xs text-muted-foreground mt-1">{project.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            角色: {project.role} · 时长: {project.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 自学建议 */}
              {result.development_plan.self_learning.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">自学建议</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.development_plan.self_learning.map((item, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              🔗 Performance Service: http://localhost:8001
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
