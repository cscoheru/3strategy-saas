'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Plus, Trash2, Download, Calculator, TrendingUp, Users } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Legend
} from 'recharts'

interface Employee {
  id: string
  name: string
  currentLevel: string
  currentSalary: number
  performance: 'A' | 'B' | 'C' | 'D'
  years: number
}

interface AdjustmentPlan {
  newLevel: string
  newSalary: number
  increase: number
  increasePercent: number
}

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: '1', name: '张三', currentLevel: 'L2', currentSalary: 15000, performance: 'A', years: 3 },
  { id: '2', name: '李四', currentLevel: 'L2', currentSalary: 14000, performance: 'B', years: 2 },
  { id: '3', name: '王五', currentLevel: 'L3', currentSalary: 25000, performance: 'A', years: 4 },
  { id: '4', name: '赵六', currentLevel: 'L1', currentSalary: 10000, performance: 'C', years: 1 },
]

const LEVELS = [
  { level: 'L1', title: '初级', minSalary: 8000, midSalary: 10000, maxSalary: 12000 },
  { level: 'L2', title: '中级', minSalary: 12000, midSalary: 16000, maxSalary: 20000 },
  { level: 'L3', title: '高级', minSalary: 18000, midSalary: 24000, maxSalary: 30000 },
  { level: 'L4', title: '资深', minSalary: 26000, midSalary: 35000, maxSalary: 44000 },
  { level: 'L5', title: '专家', minSalary: 38000, midSalary: 50000, maxSalary: 62000 },
]

export default function SalaryAdjustment() {
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES)
  const [adjustments, setAdjustments] = useState<Record<string, AdjustmentPlan>>({})
  const [budgetPercent, setBudgetPercent] = useState(10)
  const [performanceBonus, setPerformanceBonus] = useState(true)

  // Calculate adjustment based on performance and years
  const calculateAdjustment = (employee: Employee): AdjustmentPlan => {
    const currentLevel = LEVELS.find(l => l.level === employee.currentLevel)
    if (!currentLevel) {
      return {
        newLevel: employee.currentLevel,
        newSalary: employee.currentSalary,
        increase: 0,
        increasePercent: 0
      }
    }

    let targetLevel = employee.currentLevel
    let baseIncrease = 0

    // Performance-based increase
    const performanceMultiplier = employee.performance === 'A' ? 1.15
      : employee.performance === 'B' ? 1.08
      : employee.performance === 'C' ? 1.03
      : 1.0

    // Years of experience bonus
    const yearsBonus = Math.min(employee.years * 0.005, 0.05)

    // Calculate base increase
    baseIncrease = employee.currentSalary * (performanceMultiplier + yearsBonus - 1)

    // Check for level promotion
    if (employee.performance === 'A' && employee.years >= 3) {
      const currentLevelIndex = LEVELS.findIndex(l => l.level === employee.currentLevel)
      if (currentLevelIndex < LEVELS.length - 1) {
        targetLevel = LEVELS[currentLevelIndex + 1].level
        baseIncrease = Math.max(baseIncrease, LEVELS[currentLevelIndex + 1].minSalary - employee.currentSalary)
      }
    }

    // Apply budget cap
    const maxIncrease = employee.currentSalary * (budgetPercent / 100)
    const finalIncrease = Math.min(baseIncrease, maxIncrease)
    const newSalary = Math.round(employee.currentSalary + finalIncrease)
    const increase = Math.round(finalIncrease)
    const increasePercent = Math.round((increase / employee.currentSalary) * 100)

    return {
      newLevel: targetLevel,
      newSalary,
      increase,
      increasePercent
    }
  }

  // Auto-generate adjustments for all employees
  const generateAdjustments = () => {
    const newAdjustments: Record<string, AdjustmentPlan> = {}
    employees.forEach(emp => {
      newAdjustments[emp.id] = calculateAdjustment(emp)
    })
    setAdjustments(newAdjustments)
  }

  // Calculate total cost
  const totalCost = Object.values(adjustments).reduce((sum, adj) => sum + adj.increase, 0)
  const currentTotalSalary = employees.reduce((sum, emp) => sum + emp.currentSalary, 0)
  const newTotalSalary = employees.reduce((sum, emp) => {
    const adj = adjustments[emp.id]
    return sum + (adj ? adj.newSalary : emp.currentSalary)
  }, 0)

  // Generate chart data
  const chartData = employees.map(emp => {
    const adj = adjustments[emp.id]
    return {
      name: emp.name,
      current: emp.currentSalary / 1000,
      adjusted: adj ? adj.newSalary / 1000 : emp.currentSalary / 1000,
      increase: adj ? adj.increase / 1000 : 0
    }
  })

  const addEmployee = () => {
    const newEmp: Employee = {
      id: String(Date.now()),
      name: '新员工',
      currentLevel: 'L1',
      currentSalary: 10000,
      performance: 'B',
      years: 1
    }
    setEmployees([...employees, newEmp])
  }

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id))
    const newAdjustments = { ...adjustments }
    delete newAdjustments[id]
    setAdjustments(newAdjustments)
  }

  const updateEmployee = (id: string, field: keyof Employee, value: string | number) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, [field]: value } : emp
    ))
  }

  const exportPlan = () => {
    const headers = ['姓名', '当前职级', '当前薪资', '绩效', '工作年限', '新职级', '新薪资', '调增额', '调增比例']
    const rows = employees.map(emp => {
      const adj = adjustments[emp.id]
      return [
        emp.name,
        emp.currentLevel,
        emp.currentSalary,
        emp.performance,
        emp.years,
        adj?.newLevel || '-',
        adj?.newSalary || '-',
        adj?.increase || '-',
        `${adj?.increasePercent || 0}%`
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'salary-adjustment-plan.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">薪酬套改方案</h1>
            <p className="text-slate-500 mt-2">基于绩效和工作年限的薪酬调整方案设计</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={generateAdjustments} className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              生成套改方案
            </Button>
            <Button onClick={exportPlan} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出方案
            </Button>
          </div>
        </div>

        {/* Budget Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">套改参数设置</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>预算增幅: {budgetPercent}%</Label>
              <Slider
                value={[budgetPercent]}
                onValueChange={([v]) => setBudgetPercent(v)}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>保守 (5%)</span>
                <span>适中 (10%)</span>
                <span>积极 (20%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="performanceBonus"
                  checked={performanceBonus}
                  onChange={(e) => setPerformanceBonus(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="performanceBonus" className="cursor-pointer">
                  启用绩效加成
                </Label>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <div>员工总数: {employees.length} 人</div>
              <div>当前总薪酬: ¥{(currentTotalSalary / 1000).toFixed(0)}K</div>
              <div>调整后总薪酬: ¥{(newTotalSalary / 1000).toFixed(0)}K</div>
              <div className="font-semibold text-indigo-600">
                预计增加成本: ¥{(totalCost / 1000).toFixed(0)}K
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">员工列表</CardTitle>
                <Button onClick={addEmployee} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  添加员工
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="p-3 text-left font-medium text-slate-600">姓名</th>
                        <th className="p-3 text-left font-medium text-slate-600">当前职级</th>
                        <th className="p-3 text-left font-medium text-slate-600">当前薪资</th>
                        <th className="p-3 text-left font-medium text-slate-600">绩效</th>
                        <th className="p-3 text-left font-medium text-slate-600">工作年限</th>
                        <th className="p-3 text-center font-medium text-slate-600">新职级</th>
                        <th className="p-3 text-center font-medium text-slate-600">新薪资</th>
                        <th className="p-3 text-center font-medium text-slate-600">调增</th>
                        <th className="p-3 text-center font-medium text-slate-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => {
                        const adj = adjustments[emp.id]
                        return (
                          <tr key={emp.id} className="border-b border-slate-100">
                            <td className="p-3">
                              <Input
                                value={emp.name}
                                onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <select
                                value={emp.currentLevel}
                                onChange={(e) => updateEmployee(emp.id, 'currentLevel', e.target.value)}
                                className="h-8 text-sm border border-slate-200 rounded px-2"
                              >
                                {LEVELS.map(l => (
                                  <option key={l.level} value={l.level}>{l.level} - {l.title}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={emp.currentSalary}
                                onChange={(e) => updateEmployee(emp.id, 'currentSalary', Number(e.target.value))}
                                className="h-8 text-sm w-28"
                              />
                            </td>
                            <td className="p-3">
                              <select
                                value={emp.performance}
                                onChange={(e) => updateEmployee(emp.id, 'performance', e.target.value)}
                                className="h-8 text-sm border border-slate-200 rounded px-2"
                              >
                                <option value="A">A (优秀)</option>
                                <option value="B">B (良好)</option>
                                <option value="C">C (合格)</option>
                                <option value="D">D (待改进)</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={emp.years}
                                onChange={(e) => updateEmployee(emp.id, 'years', Number(e.target.value))}
                                className="h-8 text-sm w-16"
                              />
                            </td>
                            <td className="p-3 text-center">
                              {adj ? (
                                <span className={adj.newLevel !== emp.currentLevel ? 'font-semibold text-indigo-600' : ''}>
                                  {adj.newLevel}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              {adj ? `¥${adj.newSalary.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-3 text-center">
                              {adj ? (
                                <span className={adj.increasePercent > 0 ? 'text-green-600' : ''}>
                                  +¥{adj.increase.toLocaleString()} ({adj.increasePercent}%)
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                onClick={() => deleteEmployee(emp.id)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Adjustment Chart */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">薪酬调整对比图</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}K`} />
                      <Tooltip
                        formatter={(value: any) => [`¥${(value * 1000).toLocaleString()}`, '']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="current" name="当前薪资" fill="#94a3b8" />
                      <Bar dataKey="adjusted" name="调整后薪资" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Statistics */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">套改统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500">平均调增幅度</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Object.keys(adjustments).length > 0
                      ? Math.round(Object.values(adjustments).reduce((sum, adj) => sum + adj.increasePercent, 0) / Object.keys(adjustments).length)
                      : 0}%
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500">晋升人数</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(adjustments).filter(adj => {
                      const emp = employees.find(e => adjustments[e.id]?.newLevel !== e.currentLevel)
                      return emp
                    }).length}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500">最高调增</div>
                  <div className="text-2xl font-bold text-slate-700">
                    {Math.max(0, ...Object.values(adjustments).map(adj => adj.increasePercent))}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">绩效分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map(perf => {
                    const count = employees.filter(e => e.performance === perf).length
                    return (
                      <div key={perf} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            perf === 'A' ? 'bg-green-500' :
                            perf === 'B' ? 'bg-blue-500' :
                            perf === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm">{perf} 级</span>
                        </div>
                        <span className="text-sm font-medium">{count} 人</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
