'use client'

import { useState } from 'react'
import { Plus, Trash2, BarChart3, Copy, Sparkles, RefreshCw } from 'lucide-react'

interface KPI {
  id: string
  name: string
  definition: string
  formula: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  target: string
  weight: number
  category: string
}

interface Position {
  id: string
  name: string
  category: string
}

const POSITIONS: Position[] = [
  { id: '1', name: '销售经理', category: '销售' },
  { id: '2', name: '产品经理', category: '产品' },
  { id: '3', name: '技术主管', category: '技术' },
  { id: '4', name: 'HR经理', category: '人力' },
  { id: '5', name: '运营专员', category: '运营' },
  { id: '6', name: '市场专员', category: '市场' },
]

const KPI_TEMPLATES: Record<string, KPI[]> = {
  '销售': [
    { id: '1', name: '销售额', definition: '考核周期内完成的总销售金额', formula: '实际销售额 / 目标销售额 × 100%', frequency: 'monthly', target: '100万', weight: 30, category: '销售' },
    { id: '2', name: '客户转化率', definition: '潜在客户转化为成交客户的比例', formula: '成交客户数 / 潜在客户数 × 100%', frequency: 'monthly', target: '25%', weight: 20, category: '销售' },
    { id: '3', name: '新客户开发数', definition: '考核周期内新开发的客户数量', formula: '新签约客户数', frequency: 'monthly', target: '10个', weight: 20, category: '销售' },
  ],
  '产品': [
    { id: '4', name: '产品上线及时率', definition: '产品按计划上线的比例', formula: '按时上线功能数 / 计划上线功能数 × 100%', frequency: 'quarterly', target: '90%', weight: 25, category: '产品' },
    { id: '5', name: '用户满意度', definition: '用户对产品的满意程度评分', formula: '用户评分平均值', frequency: 'monthly', target: '4.5分', weight: 25, category: '产品' },
    { id: '6', name: '需求完成率', definition: '已完成需求占总需求的比例', formula: '已完成需求数 / 总需求数 × 100%', frequency: 'monthly', target: '85%', weight: 20, category: '产品' },
  ],
  '技术': [
    { id: '7', name: '系统可用性', definition: '系统正常运行时间占比', formula: '正常运行时间 / 总时间 × 100%', frequency: 'monthly', target: '99.9%', weight: 30, category: '技术' },
    { id: '8', name: 'Bug修复及时率', definition: '在规定时间内修复Bug的比例', formula: '及时修复Bug数 / 总Bug数 × 100%', frequency: 'weekly', target: '95%', weight: 20, category: '技术' },
    { id: '9', name: '代码质量评分', definition: '代码审查的平均评分', formula: '代码审查评分平均值', frequency: 'monthly', target: 'A级', weight: 20, category: '技术' },
  ],
  '人力': [
    { id: '10', name: '招聘完成率', definition: '按计划完成招聘的比例', formula: '实际到岗人数 / 计划招聘人数 × 100%', frequency: 'monthly', target: '90%', weight: 25, category: '人力' },
    { id: '11', name: '员工满意度', definition: '员工对公司的满意程度', formula: '员工满意度调研平均分', frequency: 'quarterly', target: '80分', weight: 20, category: '人力' },
    { id: '12', name: '培训覆盖率', definition: '参加培训员工占总员工比例', formula: '参加培训人数 / 总员工数 × 100%', frequency: 'quarterly', target: '95%', weight: 15, category: '人力' },
  ],
  '运营': [
    { id: '13', name: 'DAU增长率', definition: '日活跃用户数的增长比例', formula: '(本期DAU - 上期DAU) / 上期DAU × 100%', frequency: 'weekly', target: '5%', weight: 25, category: '运营' },
    { id: '14', name: '用户留存率', definition: '用户持续使用产品的比例', formula: '留存用户数 / 新增用户数 × 100%', frequency: 'monthly', target: '60%', weight: 25, category: '运营' },
  ],
  '市场': [
    { id: '15', name: '品牌曝光量', definition: '品牌在各渠道的曝光次数', formula: '各渠道曝光量总和', frequency: 'monthly', target: '100万次', weight: 20, category: '市场' },
    { id: '16', name: '获客成本', definition: '获取单个客户所需的平均成本', formula: '营销总费用 / 新增客户数', frequency: 'monthly', target: '<200元', weight: 20, category: '市场' },
  ],
}

export default function KPIGenerator() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateKPIs = (position: Position) => {
    setIsGenerating(true)
    setSelectedPosition(position)

    // Simulate AI generation delay
    setTimeout(() => {
      const templateKPIs = KPI_TEMPLATES[position.category] || []
      setKpis(templateKPIs.map(kpi => ({
        ...kpi,
        id: String(Date.now()) + kpi.id,
      })))
      setIsGenerating(false)
    }, 800)
  }

  const addKPI = () => {
    const newKPI: KPI = {
      id: String(Date.now()),
      name: '新KPI指标',
      definition: '请输入指标定义',
      formula: '请输入计算公式',
      frequency: 'monthly',
      target: '',
      weight: 10,
      category: selectedPosition?.category || '通用',
    }
    setKpis([...kpis, newKPI])
  }

  const updateKPI = (id: string, field: keyof KPI, value: string | number) => {
    setKpis(kpis.map(kpi =>
      kpi.id === id ? { ...kpi, [field]: value } : kpi
    ))
  }

  const deleteKPI = (id: string) => {
    setKpis(kpis.filter(kpi => kpi.id !== id))
  }

  const copyKPIs = () => {
    const text = kpis.map(kpi =>
      `${kpi.name}\n定义: ${kpi.definition}\n公式: ${kpi.formula}\n频率: ${kpi.frequency}\n目标: ${kpi.target}\n权重: ${kpi.weight}%`
    ).join('\n\n')
    navigator.clipboard.writeText(text)
  }

  const totalWeight = kpis.reduce((sum, kpi) => sum + kpi.weight, 0)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">KPI 生成器</h1>
          <p className="text-muted-foreground mt-2">根据岗位自动生成关键绩效指标</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Position Selection */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-xl bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4">选择岗位</h3>
              <div className="space-y-2">
                {POSITIONS.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => generateKPIs(position)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedPosition?.id === position.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="font-medium">{position.name}</div>
                    <div className="text-xs text-muted-foreground">{position.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - KPI List */}
          <div className="lg:col-span-3">
            {isGenerating ? (
              <div className="flex items-center justify-center h-64 border border-border rounded-xl bg-card">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground">正在生成KPI...</p>
                </div>
              </div>
            ) : kpis.length > 0 ? (
              <div className="space-y-4">
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      岗位: <span className="font-medium text-foreground">{selectedPosition?.name}</span>
                    </span>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      权重合计: {totalWeight}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addKPI}
                      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary"
                    >
                      <Plus className="w-4 h-4" />
                      添加
                    </button>
                    <button
                      onClick={copyKPIs}
                      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                {kpis.map((kpi, index) => (
                  <div key={kpi.id} className="border border-border rounded-xl bg-card p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        <div className="col-span-3">
                          <label className="text-xs text-muted-foreground">指标名称</label>
                          <input
                            type="text"
                            value={kpi.name}
                            onChange={(e) => updateKPI(kpi.id, 'name', e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs text-muted-foreground">定义</label>
                          <input
                            type="text"
                            value={kpi.definition}
                            onChange={(e) => updateKPI(kpi.id, 'definition', e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground">考核周期</label>
                          <select
                            value={kpi.frequency}
                            onChange={(e) => updateKPI(kpi.id, 'frequency', e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          >
                            <option value="daily">每日</option>
                            <option value="weekly">每周</option>
                            <option value="monthly">每月</option>
                            <option value="quarterly">每季度</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground">目标值</label>
                          <input
                            type="text"
                            value={kpi.target}
                            onChange={(e) => updateKPI(kpi.id, 'target', e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs text-muted-foreground">权重%</label>
                          <input
                            type="number"
                            value={kpi.weight}
                            onChange={(e) => updateKPI(kpi.id, 'weight', Number(e.target.value))}
                            min="0"
                            max="100"
                            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                        <div className="col-span-1 flex items-end justify-end">
                          <button
                            onClick={() => deleteKPI(kpi.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="col-span-12">
                          <label className="text-xs text-muted-foreground">计算公式</label>
                          <input
                            type="text"
                            value={kpi.formula}
                            onChange={(e) => updateKPI(kpi.id, 'formula', e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border border-border rounded-xl bg-card">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">请从左侧选择岗位生成KPI</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
