'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Download, Settings } from 'lucide-react';
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
  ReferenceLine
} from 'recharts';

interface SalaryBand {
  id: string;
  level: string;
  title: string;
  min: number;
  mid: number;
  max: number;
  color: string;
}

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
];

const DEFAULT_BANDS: SalaryBand[] = [
  { id: '1', level: 'L1', title: '初级', min: 8000, mid: 10000, max: 12000, color: COLORS[0] },
  { id: '2', level: 'L2', title: '中级', min: 12000, mid: 16000, max: 20000, color: COLORS[1] },
  { id: '3', level: 'L3', title: '高级', min: 18000, mid: 24000, max: 30000, color: COLORS[2] },
  { id: '4', level: 'L4', title: '资深', min: 26000, mid: 35000, max: 44000, color: COLORS[3] },
  { id: '5', level: 'L5', title: '专家', min: 38000, mid: 50000, max: 62000, color: COLORS[4] },
];

export default function BroadbandDesigner() {
  const [bands, setBands] = useState<SalaryBand[]>(DEFAULT_BANDS);
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [overlapMode, setOverlapMode] = useState<'none' | 'moderate' | 'high'>('moderate');

  // Calculate overlap percentages
  const calculateOverlap = (band1: SalaryBand, band2: SalaryBand) => {
    if (band1.max <= band2.min || band2.max <= band1.min) return 0;
    const overlap = Math.min(band1.max, band2.max) - Math.max(band1.min, band2.min);
    const range = Math.max(band1.max - band1.min, band2.max - band2.min);
    return Math.round((overlap / range) * 100);
  };

  // Generate chart data
  const chartData = useMemo(() => {
    const data: any[] = [];
    bands.forEach((band) => {
      data.push({
        level: band.level,
        min: band.min / 1000,
        mid: band.mid / 1000,
        max: band.max / 1000,
        color: band.color,
        title: band.title,
      });
    });
    return data;
  }, [bands]);

  // Generate overlap matrix
  const overlapMatrix = useMemo(() => {
    return bands.map((band1, i) =>
      bands.map((band2, j) => (i < j ? calculateOverlap(band1, band2) : null))
    );
  }, [bands]);

  const updateBand = (id: string, field: keyof SalaryBand, value: string | number) => {
    setBands((prev) =>
      prev.map((band) => {
        if (band.id !== id) return band;
        const updated = { ...band, [field]: value };

        // Auto-adjust min/mid/max relationships
        if (field === 'min' && typeof value === 'number') {
          updated.mid = Math.max(value, updated.mid);
          updated.max = Math.max(updated.mid, updated.max);
        } else if (field === 'mid' && typeof value === 'number') {
          updated.min = Math.min(updated.min, value);
          updated.max = Math.max(value, updated.max);
        } else if (field === 'max' && typeof value === 'number') {
          updated.mid = Math.min(updated.mid, value);
          updated.min = Math.min(updated.min, updated.mid);
        }

        return updated;
      })
    );
  };

  const addBand = () => {
    const lastBand = bands[bands.length - 1];
    const newBand: SalaryBand = {
      id: String(Date.now()),
      level: `L${bands.length + 1}`,
      title: '新职级',
      min: lastBand ? lastBand.max * 0.9 : 10000,
      mid: lastBand ? lastBand.max * 1.1 : 15000,
      max: lastBand ? lastBand.max * 1.3 : 20000,
      color: COLORS[bands.length % COLORS.length],
    };
    setBands([...bands, newBand]);
  };

  const deleteBand = (id: string) => {
    if (bands.length <= 1) return;
    setBands(bands.filter((b) => b.id !== id));
  };

  const exportData = () => {
    const csvContent = '职级,名称,最小值(K),中位值(K),最大值(K)\n' +
      bands.map(b => `${b.level},${b.title},${b.min/1000},${b.mid/1000},${b.max/1000}`).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'broadband-salary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">薪酬宽带设计器</h1>
          <p className="text-slate-500 mt-2">可视化设计和管理薪酬宽带体系</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Band Configuration */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">职级配置</CardTitle>
                <Button onClick={addBand} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {bands.map((band) => (
                  <div
                    key={band.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedBand === band.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white'
                    }`}
                    onClick={() => setSelectedBand(band.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: band.color }}
                        />
                        <Input
                          value={band.level}
                          onChange={(e) => updateBand(band.id, 'level', e.target.value)}
                          className="w-16 h-8 text-sm"
                        />
                        <Input
                          value={band.title}
                          onChange={(e) => updateBand(band.id, 'title', e.target.value)}
                          className="w-20 h-8 text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => deleteBand(band.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-slate-500">最小值</Label>
                        <Input
                          type="number"
                          value={band.min}
                          onChange={(e) => updateBand(band.id, 'min', Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">中位值</Label>
                        <Input
                          type="number"
                          value={band.mid}
                          onChange={(e) => updateBand(band.id, 'mid', Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">最大值</Label>
                        <Input
                          type="number"
                          value={band.max}
                          onChange={(e) => updateBand(band.id, 'max', Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                      宽度: {((band.max - band.min) / band.mid * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Export Button */}
            <Button onClick={exportData} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出 CSV
            </Button>
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Broadband Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">薪酬宽带可视化</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="level"
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickFormatter={(v) => `${v}K`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}K`, '']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />

                      {/* Min Line */}
                      <Area
                        type="monotone"
                        dataKey="min"
                        stroke="#94a3b8"
                        fill="transparent"
                        strokeWidth={2}
                        dot={{ fill: '#94a3b8', strokeWidth: 2 }}
                      />

                      {/* Mid Line */}
                      <Line
                        type="monotone"
                        dataKey="mid"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                      />

                      {/* Max Line */}
                      <Area
                        type="monotone"
                        dataKey="max"
                        stroke="#94a3b8"
                        fill="transparent"
                        strokeWidth={2}
                        dot={{ fill: '#94a3b8', strokeWidth: 2 }}
                      />

                      {/* Band Areas */}
                      {chartData.map((band, index) => (
                        <ReferenceLine
                          key={band.level}
                          y={band.mid}
                          stroke={band.color}
                          strokeDasharray="5 5"
                          strokeOpacity={0.3}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-slate-400" />
                    <span className="text-slate-500">最小值</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-indigo-500 rounded" />
                    <span className="text-slate-500">中位值</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-slate-400" />
                    <span className="text-slate-500">最大值</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overlap Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">职级重叠度矩阵</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-2"></th>
                        {bands.map((band) => (
                          <th key={band.id} className="p-2 text-center font-medium">
                            {band.level}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bands.map((band1, i) => (
                        <tr key={band1.id}>
                          <td className="p-2 font-medium">{band1.level}</td>
                          {bands.map((band2, j) => (
                            <td
                              key={band2.id}
                              className="p-2 text-center"
                            >
                              {i === j ? (
                                <span className="text-slate-300">-</span>
                              ) : i < j ? (
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs ${
                                    (overlapMatrix[i]?.[j] || 0) > 30
                                      ? 'bg-amber-100 text-amber-800'
                                      : (overlapMatrix[i]?.[j] || 0) > 15
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {overlapMatrix[i]?.[j] || 0}%
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-100" />
                    <span className="text-slate-500">15-30% 适中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-100" />
                    <span className="text-slate-500">&gt;30% 过高</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">薪酬统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {bands.length}
                    </div>
                    <div className="text-sm text-slate-500">职级数量</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {(bands[0]?.min / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-slate-500">最低起薪</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {(bands[bands.length - 1]?.max / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-slate-500">最高薪酬</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {bands.reduce((sum, b) => sum + (b.max - b.min) / b.mid * 100, 0) / bands.length | 0}%
                    </div>
                    <div className="text-sm text-slate-500">平均宽带</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
