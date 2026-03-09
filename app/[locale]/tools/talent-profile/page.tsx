'use client'

import { useState } from 'react'
import { User, Briefcase, MapPin, DollarSign, GraduationCap, Sparkles, Target, CheckCircle2 } from 'lucide-react'

interface SkillRequirement {
  category: string
  name: string
  level: string
  weight: number
  is_mandatory: boolean
  min_years?: number
}

interface ExperienceRequirement {
  category: string
  description: string
  weight: number
  is_mandatory: boolean
  min_years?: number
}

interface SoftSkillRequirement {
  category: string
  name: string
  level: string
  weight: number
}

interface TalentProfile {
  position_title: string
  position_level: string
  department: string
  location: string
  employment_type: string
  technical_skills: SkillRequirement[]
  experience_requirements: ExperienceRequirement[]
  soft_skills: SoftSkillRequirement[]
  education_level?: string
  education_majors: string[]
  salary_range: {
    min: number
    max: number
    median: number
  }
  total_weight: number
  profile_summary: string
  key_differentiators: string[]
  scoring_criteria: {
    technical_skills: string
    experience: string
    soft_skills: string
  }
}

const API_BASE = 'http://localhost:8003'

export default function TalentProfilePage() {
  const [jobDescription, setJobDescription] = useState('')
  const [positionLevel, setPositionLevel] = useState('')
  const [location, setLocation] = useState('北京')
  const [additionalContext, setAdditionalContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<TalentProfile | null>(null)

  const generateProfile = async () => {
    if (!jobDescription.trim()) {
      alert('请输入职位描述')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/recruitment/generate-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          position_level: positionLevel || undefined,
          location,
          additional_context: additionalContext || undefined,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Profile generation error:', error)
      alert('生成画像失败，请检查服务是否运行')
    } finally {
      setLoading(false)
    }
  }

  const getSkillLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      expert: 'text-purple-600 bg-purple-100',
      advanced: 'text-blue-600 bg-blue-100',
      intermediate: 'text-green-600 bg-green-100',
      beginner: 'text-gray-600 bg-gray-100',
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      expert: '专家',
      advanced: '高级',
      intermediate: '中级',
      beginner: '初级',
    }
    return labels[level] || level
  }

  const getSoftSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      average: '一般',
    }
    return labels[level] || level
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
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">人才画像生成</h1>
          </div>
          <p className="text-muted-foreground">
            AI智能分析职位描述，生成结构化人才画像，精确识别技能、经验、软技能要求
          </p>
        </div>

        {/* 输入区域 */}
        <div className="mb-8 p-6 border border-border rounded-xl bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            职位描述输入
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                职位描述 *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="粘贴职位描述，包括岗位职责、任职要求等..."
                className="w-full min-h-[200px] p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  职位等级
                </label>
                <select
                  value={positionLevel}
                  onChange={(e) => setPositionLevel(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">自动识别</option>
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
                  工作地点
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="北京">北京</option>
                  <option value="上海">上海</option>
                  <option value="深圳">深圳</option>
                  <option value="杭州">杭州</option>
                  <option value="广州">广州</option>
                  <option value="成都">成都</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  薪酬预测依据
                </label>
                <div className="p-2 text-sm text-muted-foreground bg-muted rounded-lg">
                  {location} × 职级 × 技能复杂度
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                额外上下文（可选）
              </label>
              <input
                type="text"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="如：团队文化、特殊要求等..."
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={generateProfile}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>生成中...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成人才画像
                </>
              )}
            </button>
          </div>
        </div>

        {/* 画像结果 */}
        {profile && (
          <div className="space-y-6">
            {/* 基础信息 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">岗位基础信息</h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">岗位名称</div>
                  <div className="font-medium text-foreground">{profile.position_title}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">职位等级</div>
                  <div className="font-medium text-foreground">{profile.position_level}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">部门</div>
                  <div className="font-medium text-foreground">{profile.department}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">工作地点</div>
                  <div className="font-medium text-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                </div>
              </div>

              {profile.profile_summary && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">{profile.profile_summary}</p>
                </div>
              )}
            </div>

            {/* 薪酬范围 */}
            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                薪酬范围预测
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">最低</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(profile.salary_range.min)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">中位</div>
                  <div className="text-lg font-bold text-primary">{formatCurrency(profile.salary_range.median)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">最高</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(profile.salary_range.max)}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * 基于市场数据预测，仅供参考
              </p>
            </div>

            {/* 技能要求 */}
            {profile.technical_skills.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">技能要求（权重 {profile.scoring_criteria.technical_skills}）</h2>
                <div className="space-y-3">
                  {profile.technical_skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {skill.is_mandatory && (
                          <CheckCircle2 className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2">
                            {skill.name}
                            <span className={`text-xs px-2 py-1 rounded ${getSkillLevelColor(skill.level)}`}>
                              {getSkillLevelLabel(skill.level)}
                            </span>
                            {skill.is_mandatory && (
                              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                                必需
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{skill.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{skill.weight.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 经验要求 */}
            {profile.experience_requirements.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">经验要求（权重 {profile.scoring_criteria.experience}）</h2>
                <div className="space-y-3">
                  {profile.experience_requirements.map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {exp.is_mandatory && (
                          <CheckCircle2 className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{exp.description}</div>
                          <div className="text-xs text-muted-foreground">{exp.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{exp.weight.toFixed(1)}%</div>
                        {exp.min_years && (
                          <div className="text-xs text-muted-foreground">≥{exp.min_years}年</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 软技能 */}
            {profile.soft_skills.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4">软技能要求（权重 {profile.scoring_criteria.soft_skills}）</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.soft_skills.map((skill, idx) => (
                    <div key={idx} className="px-4 py-2 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-900">{skill.name}</div>
                      <div className="text-xs text-purple-700">
                        {getSoftSkillLevelLabel(skill.level)} · {skill.weight.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 学历要求 */}
            {(profile.education_level || profile.education_majors.length > 0) && (
              <div className="p-6 border border-border rounded-xl bg-card">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  学历要求
                </h2>
                {profile.education_level && (
                  <div className="text-foreground font-medium">{profile.education_level}</div>
                )}
                {profile.education_majors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.education_majors.map((major, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {major}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 关键差异化因素 */}
            {profile.key_differentiators.length > 0 && (
              <div className="p-6 border border-border rounded-xl bg-amber-50">
                <h2 className="text-xl font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  关键差异化因素
                </h2>
                <ul className="space-y-2">
                  {profile.key_differentiators.map((diff, idx) => (
                    <li key={idx} className="text-amber-800 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {diff}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 说明 */}
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          🔗 Recruitment Service: http://localhost:8003 | 人才画像AI驱动生成
        </div>
      </div>
    </div>
  )
}
