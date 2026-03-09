'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, Users, DollarSign, Award, Download, Calendar } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

// Sample HR analytics data
const SAMPLE_DATA = {
  headcount: [
    { month: '1月', total: 120, hires: 8, departures: 3 },
    { month: '2月', total: 125, hires: 10, departures: 5 },
    { month: '3月', total: 130, hires: 12, departures: 2 },
    { month: '4月', total: 140, hires: 15, departures: 5 },
    { month: '5月', total: 150, hires: 18, departures: 8 },
    { month: '6月', total: 145, hires: 6, departures: 11 },
  ],
  turnover: [
    { department: '技术部', rate: 8.5 },
    { department: '销售部', rate: 15.2 },
    { department: '市场部', rate: 12.3 },
    { department: '人力部', rate: 6.8 },
    { department: '运营部', rate: 10.1 },
  ],
  performance: [
    { category: 'A (优秀)', count: 25, percentage: 20.8 },
    { category: 'B (良好)', count: 58, percentage: 48.3 },
    { category: 'C (合格)', count: 32, percentage: 26.7 },
    { category: 'D (待改进)', count: 5, percentage: 4.2 },
  ],
  salary: [
    { level: 'L1', avgSalary: 10, count: 30 },
    { level: 'L2', avgSalary: 16, count: 45 },
    { level: 'L3', avgSalary: 25, count: 35 },
    { level: 'L4', avgSalary: 38, count: 8 },
    { level: 'L5', avgSalary: 52, count: 2 },
  ],
  training: [
    { category: '技术培训', hours: 120, participants: 45 },
    { category: '管理培训', hours: 80, participants: 30 },
    { category: '软技能', hours: 60, participants: 50 },
    { category: '合规培训', hours: 40, participants: 120 },
  ],
  recruitment: [
    { source: '招聘网站', count: 45, costPerHire: 3500 },
    { source: '内部推荐', count: 25, costPerHire: 1800 },
    { source: '猎头', count: 15, costPerHire: 12000 },
    { source: '校园招聘', count: 35, costPerHire: 2500 },
  ]
}

export default function HRAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('6个月')
  const [selectedMetric, setSelectedMetric] = useState('headcount')

  const metrics = [
    { id: 'headcount', name: '人力分析', icon: Users },
    { id: 'turnover', name: '离职率', icon: TrendingUp },
    { id: 'performance', name: '绩效分布', icon: Award },
    { id: 'salary', name: '薪酬分析', icon: DollarSign },
    { id: 'training', name: '培训统计', icon: Calendar },
    { id: 'recruitment', name: '招聘渠道', icon: Users },
  ]

  const exportReport = () => {
    const report = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      metrics: SAMPLE_DATA
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hr-analytics-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">HR 数据分析</h1>
            <p className="text-slate-500 mt-2">人力资源数据深度分析，驱动数据化决策</p>
          </div>
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Metric Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分析指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metrics.map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      selectedMetric === metric.id
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    } border`}
                  >
                    <metric.icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{metric.name}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">关键指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">当前员工总数</div>
                  <div className="text-2xl font-bold text-blue-700">{SAMPLE_DATA.headcount[SAMPLE_DATA.headcount.length - 1].total} 人</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">平均绩效评分</div>
                  <div className="text-2xl font-bold text-green-700">B+ (良好)</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600">整体离职率</div>
                  <div className="text-2xl font-bold text-purple-700">10.6%</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-600">人均培训时长</div>
                  <div className="text-2xl font-bold text-orange-700">8.5h</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Area */}
          <div className="lg:col-span-3">
            {/* Headcount Trend Chart */}
            {selectedMetric === 'headcount' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">人力趋势分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={SAMPLE_DATA.headcount}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} name="总人数" />
                        <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="新入职" />
                        <Line type="monotone" dataKey="departures" stroke="#ef4444" strokeWidth={2} name="离职" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Turnover Rate Chart */}
            {selectedMetric === 'turnover' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">各部门离职率对比</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SAMPLE_DATA.turnover}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v) => [`${v}%`, '离职率']} />
                        <Bar dataKey="rate" fill="#6366f1" name="离职率" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Distribution */}
            {selectedMetric === 'performance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">绩效等级分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SAMPLE_DATA.performance}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.category}: ${entry.percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {SAMPLE_DATA.performance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Salary Analysis */}
            {selectedMetric === 'salary' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">职级薪酬分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SAMPLE_DATA.salary} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}K`} />
                        <YAxis dataKey="level" type="category" width={40} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: any, name: any) => {
                            if (name === 'avgSalary') return [`${value}K`, '平均薪酬']
                            if (name === 'count') return [value, '人数']
                            return [value, name]
                          }}
                        />
                        <Legend />
                        <Bar dataKey="avgSalary" fill="#6366f1" name="平均薪酬" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Training Statistics */}
            {selectedMetric === 'training' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">培训统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SAMPLE_DATA.training}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="hours" fill="#6366f1" name="培训时长" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recruitment Channels */}
            {selectedMetric === 'recruitment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">招聘渠道效果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={SAMPLE_DATA.recruitment}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.source}: ${entry.count}人`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {SAMPLE_DATA.recruitment.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">人均招聘成本</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SAMPLE_DATA.recruitment.map((channel, index) => (
                        <div key={channel.source} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{channel.source}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">
                              ¥{channel.costPerHire.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">{channel.count}人</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
