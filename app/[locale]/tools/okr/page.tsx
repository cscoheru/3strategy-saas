'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Target, TrendingUp, CheckCircle2, Save, AlertCircle } from 'lucide-react'
import { performanceApi, type Objective as ApiObjective, type KeyResult as ApiKeyResult } from '@/lib/hr-api'

// 本地接口继承API接口，添加UI相关属性
interface KeyResult extends ApiKeyResult {
  id?: string
}

interface LocalObjective extends Omit<ApiObjective, 'keyResults' | 'overallProgress' | 'overallScore'> {
  keyResults: KeyResult[]
  overallProgress: number
  overallScore: number
  expanded: boolean
}

export default function OKRDesigner() {
  const [objectives, setObjectives] = useState<LocalObjective[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddObjective, setShowAddObjective] = useState(false)
  const [newObjectiveTitle, setNewObjectiveTitle] = useState('')
  const [employeeId] = useState('emp-001')
  const [cycleId] = useState('cycle-2024-q1')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 加载已有目标
  useEffect(() => {
    loadObjectives()
  }, [])

  const loadObjectives = async () => {
    try {
      const data = await performanceApi.getEmployeeObjectives(employeeId, cycleId)
      setObjectives(data.map(obj => ({ ...obj, expanded: false })))
    } catch (error) {
      console.error('Failed to load objectives:', error)
      showMessage('error', '加载目标失败，使用示例数据')
      setObjectives([
        {
          id: '1',
          title: '提升产品用户体验',
          employeeId,
          cycleId,
          status: 'active',
          keyResults: [
            { title: '用户满意度达到4.5分', target_value: 4.5, current_value: 4.2, unit: '分', weight: 40 },
            { title: '页面加载时间降到2秒', target_value: 2, current_value: 2.8, unit: '秒', weight: 30 },
            { title: '完成10个核心功能优化', target_value: 10, current_value: 7, unit: '个', weight: 30 },
          ],
          overallProgress: 65,
          overallScore: 65,
          expanded: true,
        },
      ])
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const validateWeights = (keyResults: KeyResult[]) => {
    const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.1) {
      showMessage('error', `关键结果总权重必须为100%，当前为${totalWeight}%`)
      return false
    }
    return true
  }

  const saveObjective = async (objective: LocalObjective) => {
    try {
      if (!objective.keyResults || objective.keyResults.length === 0) {
        showMessage('error', '请至少添加一个关键结果')
        return
      }

      if (!validateWeights(objective.keyResults)) {
        return
      }

      setLoading(true)
      await performanceApi.createObjective(objective)
      showMessage('success', '目标保存成功')
      await loadObjectives()
    } catch (error) {
      console.error('Save objective error:', error)
      showMessage('error', '保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const addObjective = () => {
    if (!newObjectiveTitle.trim()) return

    const newObjective: LocalObjective = {
      title: newObjectiveTitle,
      employeeId,
      cycleId,
      status: 'draft',
      keyResults: [],
      overallProgress: 0,
      overallScore: 0,
      expanded: true,
    }

    setObjectives([...objectives, newObjective])
    setNewObjectiveTitle('')
    setShowAddObjective(false)
  }

  const deleteObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id))
  }

  const addKeyResult = (objectiveId: string | undefined) => {
    if (!objectiveId) return

    setObjectives(objectives.map(obj => {
      if (obj.id !== objectiveId) return obj
      const newKR: KeyResult = {
        title: '新的关键结果',
        target_value: 100,
        current_value: 0,
        unit: '%',
        weight: 50,
      }
      // 重新分配权重使总和为100
      const currentKRs = obj.keyResults || []
      const newKRs = [...currentKRs, newKR]
      const evenWeight = Math.round(100 / newKRs.length)
      newKRs.forEach(kr => kr.weight = evenWeight)

      return { ...obj, keyResults: newKRs }
    }))
  }

  const updateKeyResult = (
    objectiveId: string | undefined,
    krIndex: number,
    field: keyof KeyResult,
    value: string | number
  ) => {
    if (!objectiveId) return

    setObjectives(objectives.map(obj => {
      if (obj.id !== objectiveId) return obj

      const updatedKRs = [...(obj.keyResults || [])]
      updatedKRs[krIndex] = { ...updatedKRs[krIndex], [field]: value }

      // 重新计算进度和分数
      const progress = updatedKRs.length > 0
        ? updatedKRs.reduce((sum, kr) => {
            const krProgress = kr.target_value > 0 ? (kr.current_value / kr.target_value) * 100 : 0
            return sum + (krProgress * kr.weight / 100)
          }, 0)
        : 0

      return {
        ...obj,
        keyResults: updatedKRs,
        overallProgress: Math.round(progress),
        overallScore: Math.round(progress),
      }
    }))
  }

  const deleteKeyResult = (objectiveId: string | undefined, krIndex: number) => {
    if (!objectiveId) return

    setObjectives(objectives.map(obj => {
      if (obj.id !== objectiveId) return obj

      const updatedKRs = (obj.keyResults || []).filter((_, i) => i !== krIndex)

      // 重新分配权重
      if (updatedKRs.length > 0) {
        const evenWeight = Math.round(100 / updatedKRs.length)
        updatedKRs.forEach(kr => kr.weight = evenWeight)
      }

      const progress = updatedKRs.length > 0
        ? updatedKRs.reduce((sum, kr) => {
            const krProgress = kr.target_value > 0 ? (kr.current_value / kr.target_value) * 100 : 0
            return sum + (krProgress * kr.weight / 100)
          }, 0)
        : 0

      return {
        ...obj,
        keyResults: updatedKRs,
        overallProgress: Math.round(progress),
        overallScore: Math.round(progress),
      }
    }))
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'text-green-600 bg-green-100'
    if (progress >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  const totalKRCount = objectives.reduce((sum, obj) => sum + (obj.keyResults?.length || 0), 0)
  const avgProgress = objectives.length > 0
    ? Math.round(objectives.reduce((sum, obj) => sum + obj.overallProgress, 0) / objectives.length)
    : 0

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">OKR 设计器</h1>
            <p className="text-muted-foreground mt-2">目标与关键结果管理 - 连接到Performance Service</p>
          </div>
          <button
            onClick={() => setShowAddObjective(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            添加目标
          </button>
        </div>

        {/* Message */}
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

        {/* Add Objective Form */}
        {showAddObjective && (
          <div className="mb-6 p-4 border border-border rounded-xl bg-card">
            <div className="flex gap-3">
              <input
                type="text"
                value={newObjectiveTitle}
                onChange={(e) => setNewObjectiveTitle(e.target.value)}
                placeholder="输入目标名称..."
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addObjective()}
              />
              <button
                onClick={addObjective}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddObjective(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* OKR List */}
        <div className="space-y-4">
          {objectives.map((objective, idx) => (
            <div key={objective.id || idx} className="border border-border rounded-xl bg-card overflow-hidden">
              {/* Objective Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30"
                onClick={() => setObjectives(objectives.map((o, i) =>
                  i === idx ? { ...o, expanded: !o.expanded } : o
                ))}
              >
                <Target className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{objective.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          objective.overallProgress >= 70 ? 'bg-green-500' :
                          objective.overallProgress >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(objective.overallProgress, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${getProgressColor(objective.overallProgress)}`}>
                      {objective.overallProgress}%
                    </span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {objective.keyResults?.length || 0} 个KR
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    saveObjective(objective)
                  }}
                  disabled={loading}
                  className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg"
                  title="保存到服务器"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteObjective(objective.id!)
                  }}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Key Results */}
              {objective.expanded && (
                <div className="border-t border-border p-4 space-y-3 bg-muted/30">
                  {(objective.keyResults || []).map((kr, krIdx) => (
                    <div key={krIdx} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                      <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={kr.title}
                          onChange={(e) => updateKeyResult(objective.id, krIdx, 'title', e.target.value)}
                          className="col-span-4 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <input
                          type="number"
                          value={kr.current_value}
                          onChange={(e) => updateKeyResult(objective.id, krIdx, 'current_value', Number(e.target.value))}
                          className="col-span-1 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <span className="text-xs text-muted-foreground">/</span>
                        <input
                          type="number"
                          value={kr.target_value}
                          onChange={(e) => updateKeyResult(objective.id, krIdx, 'target_value', Number(e.target.value))}
                          className="col-span-1 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(objective.id, krIdx, 'unit', e.target.value)}
                          className="col-span-1 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          placeholder="单位"
                        />
                        <div className="col-span-2 flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">权重</span>
                          <input
                            type="number"
                            value={kr.weight}
                            onChange={(e) => updateKeyResult(objective.id, krIdx, 'weight', Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                          <span className="text-xs">%</span>
                        </div>
                        <div className="col-span-2">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                (kr.current_value / kr.target_value * 100) >= 70 ? 'bg-green-500' :
                                (kr.current_value / kr.target_value * 100) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min((kr.current_value / kr.target_value * 100), 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => deleteKeyResult(objective.id, krIdx)}
                            className="p-1 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addKeyResult(objective.id)}
                    className="flex items-center gap-2 w-full p-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加关键结果
                  </button>
                  {(objective.keyResults || []).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      总权重: {(objective.keyResults || []).reduce((sum, kr) => sum + kr.weight, 0)}%
                      {Math.abs((objective.keyResults || []).reduce((sum, kr) => sum + kr.weight, 0) - 100) > 0.1 && (
                        <span className="text-red-500 ml-2">⚠️ 权重总和必须为100%</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-xl bg-card text-center">
            <div className="text-2xl font-bold text-foreground">{objectives.length}</div>
            <div className="text-sm text-muted-foreground">目标数</div>
          </div>
          <div className="p-4 border border-border rounded-xl bg-card text-center">
            <div className="text-2xl font-bold text-foreground">{totalKRCount}</div>
            <div className="text-sm text-muted-foreground">关键结果</div>
          </div>
          <div className="p-4 border border-border rounded-xl bg-card text-center">
            <div className="text-2xl font-bold text-foreground">{avgProgress}%</div>
            <div className="text-sm text-muted-foreground">平均进度</div>
          </div>
        </div>

        {/* Service Status */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          🔗 Performance Service: http://localhost:8001
        </div>
      </div>
    </div>
  )
}
