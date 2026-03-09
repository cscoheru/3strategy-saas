'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Download, TrendingUp, Users, Settings, BookOpen } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

type Perspective = 'financial' | 'customer' | 'internal' | 'learning'

interface Objective {
  id: string
  perspective: Perspective
  title: string
  measure: string
  target: string
  weight: number
  description: string
}

const PERSPECTIVES = {
  financial: {
    name: '财务',
    icon: TrendingUp,
    question: '要在财务方面取得成功，应向股东展示什么？',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  customer: {
    name: '客户',
    icon: Users,
    question: '要实现愿景，应向客户展示什么？',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  internal: {
    name: '流程',
    icon: Settings,
    question: '要让股东和客户满意，要擅长哪些流程？',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
  learning: {
    name: '学习成长',
    icon: BookOpen,
    question: '如何保持变革和改进的能力？',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
}

const DEFAULT_OBJECTIVES: Objective[] = [
  { id: '1', perspective: 'financial', title: '提高收入增长', measure: '收入增长率', target: '20%', weight: 25, description: '通过新市场拓展实现' },
  { id: '2', perspective: 'financial', title: '提升利润率', measure: '净利润率', target: '15%', weight: 25, description: '优化成本结构' },
  { id: '3', perspective: 'customer', title: '提高客户满意度', measure: '满意度评分', target: '90分', weight: 20, description: '改善服务体验' },
  { id: '4', perspective: 'customer', title: '增加客户保留率', measure: '续约率', target: '85%', weight: 15, description: '客户成功计划' },
  { id: '5', perspective: 'internal', title: '缩短交付周期', measure: '交付时间', target: '24小时', weight: 20, description: '流程优化' },
  { id: '6', perspective: 'internal', title: '提升产品质量', measure: '合格率', target: '99%', weight: 15, description: '质量控制' },
  { id: '7', perspective: 'learning', title: '提升员工技能', measure: '培训覆盖率', target: '100%', weight: 15, description: '技能提升计划' },
  { id: '8', perspective: 'learning', title: '培养领导力', measure: '领导力评分', target: '4.5分', weight: 10, description: '领导力发展项目' }
]

export default function BSCDesigner() {
  const [objectives, setObjectives] = useState<Objective[]>(DEFAULT_OBJECTIVES)
  const [vision, setVision] = useState('成为行业领先的服务提供商')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newObjective, setNewObjective] = useState<Partial<Objective>>({
    perspective: 'financial',
    title: '',
    measure: '',
    target: '',
    weight: 10,
    description: ''
  })

  const addObjective = () => {
    if (!newObjective.title || !newObjective.measure) return

    const objective: Objective = {
      id: Date.now().toString(),
      perspective: newObjective.perspective || 'financial',
      title: newObjective.title,
      measure: newObjective.measure,
      target: newObjective.target || '',
      weight: newObjective.weight || 10,
      description: newObjective.description || ''
    }

    setObjectives([...objectives, objective])
    setNewObjective({
      perspective: 'financial',
      title: '',
      measure: '',
      target: '',
      weight: 10,
      description: ''
    })
    setShowAddForm(false)
  }

  const deleteObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id))
  }

  const exportBSC = () => {
    const data = { vision, objectives, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bsc-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ['维度', '战略目标', '衡量指标', '目标值', '权重', '说明']
    const rows = objectives.map(obj => [
      PERSPECTIVES[obj.perspective].name,
      obj.title,
      obj.measure,
      obj.target,
      `${obj.weight}%`,
      obj.description
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.map(s => `"${s}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bsc.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTotalWeight = (perspective: Perspective) => {
    return objectives
      .filter(obj => obj.perspective === perspective)
      .reduce((sum, obj) => sum + obj.weight, 0)
  }

  const grandTotal = Object.values(PERSPECTIVES).reduce((sum, _, idx) => {
    const key = Object.keys(PERSPECTIVES)[idx] as Perspective
    return sum + getTotalWeight(key)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">平衡计分卡 BSC</h1>
              <p className="text-slate-500 mt-1">从四个维度衡量和管理组织绩效</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportBSC} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出JSON
              </Button>
              <Button onClick={exportCSV} size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出CSV
              </Button>
            </div>
          </div>

          {/* Vision */}
          <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
            <CardContent className="pt-6">
              <Label className="text-slate-300 text-sm">组织愿景</Label>
              <Input
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                placeholder="输入您的组织愿景..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Four Perspectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(PERSPECTIVES).map(([key, perspective]) => {
            const Icon = perspective.icon
            const perspectiveObjectives = objectives.filter(obj => obj.perspective === key)
            const totalWeight = getTotalWeight(key as Perspective)

            return (
              <Card key={key} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${perspective.color} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{perspective.name}</h3>
                        <p className="text-xs text-white/80 max-w-[200px]">{perspective.question}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{totalWeight}%</div>
                      <div className="text-xs text-white/80">权重</div>
                    </div>
                  </div>
                </div>

                {/* Objectives List */}
                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {perspectiveObjectives.map((objective) => (
                    <div key={objective.id} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{objective.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{objective.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                            {objective.weight}%
                          </span>
                          <Button
                            onClick={() => deleteObjective(objective.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500">衡量指标</div>
                          <div className="font-medium text-slate-800">{objective.measure}</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-xs text-slate-500">目标值</div>
                          <div className="font-medium text-green-700">{objective.target}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => {
                      setNewObjective({ ...newObjective, perspective: key as Perspective })
                      setShowAddForm(true)
                    }}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加目标
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Weight Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">权重分配总览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(PERSPECTIVES).map(([key, perspective]) => {
                const Icon = perspective.icon
                const weight = getTotalWeight(key as Perspective)
                const percentage = grandTotal > 0 ? (weight / grandTotal) * 100 : 0

                return (
                  <div key={key} className="text-center">
                    <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${perspective.color} text-white mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{weight}%</div>
                    <div className="text-xs text-slate-500">{perspective.name}</div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div
                        className={`bg-gradient-to-r ${perspective.color} h-1.5 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-medium">权重总和</span>
                <span className={`text-2xl font-bold ${grandTotal === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                  {grandTotal}%
                </span>
              </div>
              {grandTotal !== 100 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ 建议将总权重调整为100%
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Objective Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>添加新目标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>所属维度</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(PERSPECTIVES).map(([key, perspective]) => (
                      <button
                        key={key}
                        onClick={() => setNewObjective({ ...newObjective, perspective: key as Perspective })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          newObjective.perspective === key
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{perspective.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>战略目标</Label>
                  <Input
                    value={newObjective.title}
                    onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                    placeholder="如：提高收入增长"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>衡量指标</Label>
                  <Input
                    value={newObjective.measure}
                    onChange={(e) => setNewObjective({ ...newObjective, measure: e.target.value })}
                    placeholder="如：收入增长率"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>目标值</Label>
                    <Input
                      value={newObjective.target}
                      onChange={(e) => setNewObjective({ ...newObjective, target: e.target.value })}
                      placeholder="如：20%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>权重 (%)</Label>
                    <Input
                      type="number"
                      value={newObjective.weight}
                      onChange={(e) => setNewObjective({ ...newObjective, weight: Number(e.target.value) })}
                      min={1}
                      max={50}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>说明</Label>
                  <Textarea
                    value={newObjective.description}
                    onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                    placeholder="简要描述如何实现此目标"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addObjective} className="flex-1">
                    添加
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
