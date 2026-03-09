'use client'

import { useEffect, useState } from 'react'
import { Download, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Hash, TrendingUp, FileText, Sparkles } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client-singleton'

interface DiagnosisReportPanelProps {
  sessionId: string
  onBack: () => void
}

// 默认数据（当Supabase不可用时）
const defaultData = {
  data_strategy: {
    score: 65,
    tags: ['战略清晰度中等', '目标分解不完整', '执行跟踪较弱'],
    key_issues: ['战略目标未有效分解到部门级', '缺乏有效的战略执行监控机制', '员工对战略理解不深入'],
    recommendations: ['建立战略解码机制，将战略目标分解到各部门', '引入战略执行仪表盘，实时跟踪关键指标', '定期开展战略宣讲，确保全员理解'],
    summary: '战略方向基本明确，但执行落地存在较大差距'
  },
  data_structure: {
    score: 58,
    tags: ['组织架构传统', '决策流程冗长', '跨部门协作不足'],
    key_issues: ['组织层级过多，决策效率低下', '部门墙现象严重，协作成本高'],
    recommendations: ['扁平化组织结构，减少管理层级', '建立跨部门协作机制'],
    summary: '组织结构需要优化以提升效率'
  },
  data_performance: {
    score: 62,
    tags: ['KPI设定不科学', '绩效流于形式', '缺乏反馈机制'],
    key_issues: ['KPI与战略目标脱节', '绩效考核缺乏过程管理'],
    recommendations: ['建立OKR+KPI一体化体系', '加强绩效过程管理和反馈'],
    summary: '绩效管理体系需要重构'
  },
  data_compensation: {
    score: 55,
    tags: ['薪酬缺乏竞争力', '固浮比不合理', '激励效果有限'],
    key_issues: ['薪酬水平低于市场P50', '固定工资占比过高'],
    recommendations: ['进行市场对标，调整薪酬水平', '优化固浮比结构'],
    summary: '薪酬体系需要全面改革'
  },
  data_talent: {
    score: 60,
    tags: ['人才储备不足', '培训体系缺失', '关键岗位流失'],
    key_issues: ['关键岗位人才储备不足', '缺乏系统的人才培养体系'],
    recommendations: ['建立人才梯队计划', '完善培训发展体系'],
    summary: '人才发展机制需要加强'
  }
}

export function DiagnosisReportPanel({ sessionId, onBack }: DiagnosisReportPanelProps) {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sessionId) {
          // 使用默认数据
          setSessionData({ data_strategy: {}, data_structure: {}, data_performance: {}, data_compensation: {}, data_talent: {} })
          setLoading(false)
          return
        }

        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('diagnosis_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (error) {
          console.warn('Failed to fetch session data, using defaults:', error)
          // 使用默认数据
          setSessionData(defaultData)
        } else {
          setSessionData(data)
        }
      } catch (error) {
        console.warn('Error fetching session, using defaults:', error)
        setSessionData(defaultData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  // 获取有效的数据（如果有数据则使用，否则标记为"收集中"）
  const getData = (field: string) => {
    const data = sessionData?.[field]
    // 检查数据是否真实存在（有实际内容，不是空对象）
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      // 检查是否有实际的诊断数据（有分数和标签）
      if (data.score !== undefined && data.score > 0) {
        return { ...data, hasData: true }
      }
    }
    // 数据不足，返回空数据状态
    return { score: 0, tags: [], key_issues: [], recommendations: [], summary: '数据收集中...', hasData: false }
  }

  // 准备雷达图数据（只显示有数据的维度）
  const getRadarData = () => {
    const dimensions = [
      { key: 'data_strategy', name: '战略' },
      { key: 'data_structure', name: '结构' },
      { key: 'data_performance', name: '绩效' },
      { key: 'data_compensation', name: '薪酬' },
      { key: 'data_talent', name: '人才' },
    ]

    return dimensions.map(dim => {
      const data = getData(dim.key)
      return {
        dimension: dim.name,
        value: data.hasData ? data.score : 0,
        fullMark: 100,
        hasData: data.hasData,
      }
    })
  }

  const radarData = getRadarData()

  // 计算总分（只计算有数据的维度）
  const dimensionsWithData = radarData.filter(d => d.hasData)
  const totalScore = dimensionsWithData.length > 0
    ? Math.round(dimensionsWithData.reduce((sum, item) => sum + item.value, 0) / dimensionsWithData.length)
    : 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    if (score >= 40) return '一般'
    return '需改进'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 60) return TrendingUp
    return AlertTriangle
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">正在生成诊断报告...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-5 lg:px-6 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            返回对话
          </button>
          <h1 className="text-3xl font-bold text-foreground">五维诊断报告</h1>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg group"
          >
            <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
            下载报告
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto px-5 lg:px-6 space-y-6">
        {/* 数据收集提示 */}
        {dimensionsWithData.length < 5 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">诊断进行中</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  当前已完成 {dimensionsWithData.length}/5 个维度的评估。继续与AI顾问对话，完成所有维度的诊断后将生成完整报告。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 总分卡片 */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {dimensionsWithData.length > 0 ? '综合评分' : '诊断进度'}
              </h2>
              <p className="text-muted-foreground">
                {dimensionsWithData.length > 0
                  ? `基于 ${dimensionsWithData.length} 个维度的评估结果`
                  : '请先与AI顾问对话，系统将自动收集诊断数据'
                }
              </p>
            </div>
            <div className="text-center">
              {dimensionsWithData.length > 0 ? (
                <>
                  <div className={`text-6xl font-bold ${getScoreColor(totalScore)}`}>
                    {totalScore}
                  </div>
                  <div className={`text-lg font-medium ${getScoreColor(totalScore)} mt-1`}>
                    {getScoreLabel(totalScore)}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-muted-foreground mb-1">
                    {dimensionsWithData.length}/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    维度已完成
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 分数概览 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {radarData.map((item) => {
            const data = getData(
              item.dimension === '战略' ? 'data_strategy' :
              item.dimension === '结构' ? 'data_structure' :
              item.dimension === '绩效' ? 'data_performance' :
              item.dimension === '薪酬' ? 'data_compensation' : 'data_talent'
            )

            if (data.hasData) {
              const ScoreIcon = getScoreIcon(item.value)
              return (
                <div key={item.dimension} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ScoreIcon className={`h-4 w-4 ${getScoreColor(item.value)}`} />
                    <span className="text-sm text-muted-foreground">{item.dimension}</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(item.value)}`}>
                    {item.value}
                  </div>
                  <div className={`text-xs font-medium ${getScoreColor(item.value)} mt-1`}>
                    {getScoreLabel(item.value)}
                  </div>
                </div>
              )
            } else {
              return (
                <div key={item.dimension} className="bg-card border border-dashed border-border rounded-xl p-4 text-center opacity-60">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-transparent animate-spin" />
                    <span className="text-sm text-muted-foreground">{item.dimension}</span>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground/50">
                    收集中
                  </div>
                  <div className="text-xs text-muted-foreground/50 mt-1">
                    继续对话
                  </div>
                </div>
              )
            }
          })}
        </div>

        {/* 标签云 - 只显示有数据的维度标签 */}
        {dimensionsWithData.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              关键标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                ...getData('data_strategy').tags.filter(() => getData('data_strategy').hasData),
                ...getData('data_structure').tags.filter(() => getData('data_structure').hasData),
                ...getData('data_performance').tags.filter(() => getData('data_performance').hasData),
                ...getData('data_compensation').tags.filter(() => getData('data_compensation').hasData),
                ...getData('data_talent').tags.filter(() => getData('data_talent').hasData),
              ].map((tag: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Hash className="h-3 w-3" />
                  {tag}
                </span>
              ))}
              {dimensionsWithData.length === 0 && (
                <span className="text-sm text-muted-foreground italic">完成对话后，系统将自动提取关键标签</span>
              )}
            </div>
          </div>
        )}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            关键标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              ...getData('data_strategy').tags || [],
              ...getData('data_structure').tags || [],
              ...getData('data_performance').tags || [],
              ...getData('data_compensation').tags || [],
              ...getData('data_talent').tags || [],
            ].map((tag: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Hash className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 各维度详细报告 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { key: 'data_strategy', name: '战略', icon: '🎯' },
            { key: 'data_structure', name: '结构', icon: '🏗️' },
            { key: 'data_performance', name: '绩效', icon: '📊' },
            { key: 'data_compensation', name: '薪酬', icon: '💰' },
            { key: 'data_talent', name: '人才', icon: '👥' },
          ].map((dimension) => {
            const data = getData(dimension.key as any)

            if (!data.hasData) {
              return (
                <div key={dimension.key} className="bg-card/50 border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl mb-3 opacity-50">{dimension.icon}</span>
                  <h4 className="font-semibold text-muted-foreground mb-2">{dimension.name}维度</h4>
                  <div className="text-sm text-muted-foreground/70">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 mx-auto mb-2 animate-pulse" />
                    数据收集中
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-2">继续对话以完成此维度评估</p>
                </div>
              )
            }

            return (
              <div key={dimension.key} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{dimension.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground">{dimension.name}维度</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(data.score || 0)}`}>
                      {data.score}分
                    </div>
                  </div>
                </div>

                {data.summary && data.summary !== '数据收集中...' && (
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{data.summary}"
                  </p>
                )}

                {data.key_issues && data.key_issues.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      关键问题
                    </h5>
                    <div className="space-y-1.5">
                      {data.key_issues.map((issue: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground">• {issue}</p>
                      ))}
                    </div>
                  </div>
                )}

                {data.recommendations && data.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      改进建议
                    </h5>
                    <div className="space-y-1.5">
                      {data.recommendations.map((rec: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 注册引导弹窗 */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">下载完整报告</h3>
              <p className="text-muted-foreground">
                注册后即可下载包含详细分析、改进建议和行动方案的完整PDF报告
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full rounded-xl bg-primary text-primary-foreground py-3 px-6 font-medium hover:bg-primary/90 transition-all">
                立即注册
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full rounded-xl border border-border py-3 px-6 font-medium hover:bg-secondary transition-all"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
