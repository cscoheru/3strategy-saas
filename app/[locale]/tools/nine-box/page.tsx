'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Trash2, Download, User } from 'lucide-react';

// 九宫格位置定义
type BoxPosition = 'star' | 'high-potential' | 'core' | 'high-performer' | 'average' | 'underperformer' | 'problem';

interface Employee {
  id: string;
  name: string;
  department: string;
  performance: number; // 1-5
  potential: number;   // 1-5
  box?: BoxPosition;
  notes: string;
}

// 九宫格配置
const BOXES: Record<BoxPosition, { label: string; description: string; color: string; action: string }> = {
  'star': { label: '明星', description: '高绩效高潜力', color: 'bg-green-100 border-green-400', action: '重点培养' },
  'high-potential': { label: '高潜人才', description: '中绩效高潜力', color: 'bg-blue-100 border-blue-400', action: '加速发展' },
  'core': { label: '核心骨干', description: '高绩效中潜力', color: 'bg-indigo-100 border-indigo-400', action: '稳定激励' },
  'high-performer': { label: '业绩明星', description: '高绩效低潜力', color: 'bg-purple-100 border-purple-400', action: '专业深耕' },
  'average': { label: '中坚力量', description: '中绩效中潜力', color: 'bg-slate-100 border-slate-400', action: '持续关注' },
  'underperformer': { label: '待提升', description: '低绩效高/中潜力', color: 'bg-amber-100 border-amber-400', action: '辅导改进' },
  'problem': { label: '问题员工', description: '低绩效低潜力', color: 'bg-red-100 border-red-400', action: '绩效改进' },
};

// 根据绩效和潜力计算九宫格位置
function calculateBox(performance: number, potential: number): BoxPosition {
  if (performance >= 4 && potential >= 4) return 'star';
  if (performance >= 4 && potential >= 2.5) return 'core';
  if (performance >= 4) return 'high-performer';
  if (performance >= 2.5 && potential >= 4) return 'high-potential';
  if (performance >= 2.5 && potential >= 2.5) return 'average';
  if (potential >= 4) return 'underperformer';
  if (potential >= 2.5) return 'underperformer';
  return 'problem';
}

// 默认员工数据
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: '1', name: '张三', department: '技术部', performance: 4.5, potential: 4.2, notes: '' },
  { id: '2', name: '李四', department: '产品部', performance: 3.8, potential: 4.5, notes: '' },
  { id: '3', name: '王五', department: '技术部', performance: 4.2, potential: 3.0, notes: '' },
  { id: '4', name: '赵六', department: '市场部', performance: 3.2, potential: 3.5, notes: '' },
  { id: '5', name: '钱七', department: '运营部', performance: 2.5, potential: 2.8, notes: '' },
  { id: '6', name: '孙八', department: '技术部', performance: 4.8, potential: 4.8, notes: '' },
];

export default function NineBoxGrid() {
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    department: '',
    performance: 3,
    potential: 3,
    notes: '',
  });

  // 计算每个员工的九宫格位置
  const employeesWithBox = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      box: calculateBox(emp.performance, emp.potential),
    }));
  }, [employees]);

  // 按九宫格位置分组
  const employeesByBox = useMemo(() => {
    const grouped: Record<BoxPosition, Employee[]> = {
      'star': [], 'high-potential': [], 'core': [], 'high-performer': [],
      'average': [], 'underperformer': [], 'problem': [],
    };
    employeesWithBox.forEach(emp => {
      if (emp.box) grouped[emp.box].push(emp);
    });
    return grouped;
  }, [employeesWithBox]);

  // 添加员工
  const addEmployee = () => {
    if (!newEmployee.name.trim()) return;
    setEmployees([...employees, { ...newEmployee, id: String(Date.now()) }]);
    setNewEmployee({ name: '', department: '', performance: 3, potential: 3, notes: '' });
    setShowAddForm(false);
  };

  // 删除员工
  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  // 更新员工评分
  const updateScore = (id: string, field: 'performance' | 'potential', value: number) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  // 导出报告
  const exportReport = () => {
    const report = employeesWithBox.map(e =>
      `${e.name},${e.department},${e.performance},${e.potential},${e.box},${BOXES[e.box!].action}`
    ).join('\n');

    const header = '姓名,部门,绩效,潜力,分类,建议行动\n';
    const blob = new Blob(['\ufeff' + header + report], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nine-box-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 统计数据
  const stats = useMemo(() => {
    const total = employees.length;
    const avgPerformance = employees.reduce((s, e) => s + e.performance, 0) / total || 0;
    const avgPotential = employees.reduce((s, e) => s + e.potential, 0) / total || 0;
    const highTalent = employeesByBox['star'].length + employeesByBox['high-potential'].length;
    return { total, avgPerformance, avgPotential, highTalent };
  }, [employees, employeesByBox]);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">人才盘点九宫格</h1>
            <p className="text-slate-500 mt-2">基于绩效与潜力的人才分类与发展策略</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              添加员工
            </Button>
            <Button onClick={exportReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出报告
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Nine Box Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>九宫格分布</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Grid Layout */}
                <div className="relative">
                  {/* Y Axis Label */}
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-slate-600 whitespace-nowrap">
                    潜力 →
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-3 gap-2 ml-4">
                    {/* Row 1: High Potential */}
                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['high-performer'].color} min-h-[150px]`}>
                      <div className="text-xs font-medium text-slate-600 mb-1">{BOXES['high-performer'].label}</div>
                      <div className="text-xs text-slate-500 mb-2">{BOXES['high-performer'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['high-performer'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['core'].color} min-h-[150px]`}>
                      <div className="text-xs font-medium text-slate-600 mb-1">{BOXES['core'].label}</div>
                      <div className="text-xs text-slate-500 mb-2">{BOXES['core'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['core'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['star'].color} min-h-[150px]`}>
                      <div className="text-xs font-semibold text-green-700 mb-1">⭐ {BOXES['star'].label}</div>
                      <div className="text-xs text-green-600 mb-2">{BOXES['star'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['star'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white font-medium"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 2: Medium Potential */}
                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['problem'].color} min-h-[150px]`}>
                      <div className="text-xs font-medium text-red-600 mb-1">{BOXES['problem'].label}</div>
                      <div className="text-xs text-slate-500 mb-2">{BOXES['problem'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['problem'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['average'].color} min-h-[150px]`}>
                      <div className="text-xs font-medium text-slate-600 mb-1">{BOXES['average'].label}</div>
                      <div className="text-xs text-slate-500 mb-2">{BOXES['average'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['average'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['high-potential'].color} min-h-[150px]`}>
                      <div className="text-xs font-medium text-blue-700 mb-1">{BOXES['high-potential'].label}</div>
                      <div className="text-xs text-slate-500 mb-2">{BOXES['high-potential'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['high-potential'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 3: Low Potential */}
                    <div className="aspect-square min-h-[150px] bg-slate-50 border-2 border-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-slate-400">-</span>
                    </div>

                    <div className={`aspect-square p-3 rounded-lg border-2 ${BOXES['underperformer'].color} min-h-[150px]`}>
                      <div className="text-xs font-medium text-amber-700 mb-1">{BOXES['underperformer'].label}</div>
                      <div className="text-xs text-slate-500 mb-2">{BOXES['underperformer'].description}</div>
                      <div className="space-y-1">
                        {employeesByBox['underperformer'].map(emp => (
                          <div key={emp.id} className="text-xs bg-white/80 px-2 py-1 rounded truncate cursor-pointer hover:bg-white"
                               onClick={() => setSelectedEmployee(emp.id)}>
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="aspect-square min-h-[150px] bg-slate-50 border-2 border-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-slate-400">-</span>
                    </div>
                  </div>

                  {/* X Axis Label */}
                  <div className="text-center text-sm font-medium text-slate-600 mt-3 ml-4">
                    绩效 →
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>盘点统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
                    <div className="text-sm text-slate-500">总人数</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.avgPerformance.toFixed(1)}</div>
                    <div className="text-sm text-slate-500">平均绩效</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.avgPotential.toFixed(1)}</div>
                    <div className="text-sm text-slate-500">平均潜力</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.highTalent}</div>
                    <div className="text-sm text-slate-500">高潜人才</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Employee List & Form */}
          <div className="space-y-4">
            {/* Add Employee Form */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">添加员工</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>姓名</Label>
                    <Input
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="输入姓名"
                    />
                  </div>
                  <div>
                    <Label>部门</Label>
                    <Input
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      placeholder="输入部门"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>绩效 (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newEmployee.performance}
                        onChange={(e) => setNewEmployee({ ...newEmployee, performance: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>潜力 (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newEmployee.potential}
                        onChange={(e) => setNewEmployee({ ...newEmployee, potential: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addEmployee} className="flex-1">添加</Button>
                    <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">取消</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employee List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">员工列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {employeesWithBox.map((emp) => (
                    <div
                      key={emp.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedEmployee === emp.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedEmployee(emp.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {emp.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{emp.name}</div>
                            <div className="text-xs text-slate-500">{emp.department}</div>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => { e.stopPropagation(); deleteEmployee(emp.id); }}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">绩效:</span>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={emp.performance}
                            onChange={(e) => updateScore(emp.id, 'performance', Number(e.target.value))}
                            className="h-6 text-xs mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">潜力:</span>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={emp.potential}
                            onChange={(e) => updateScore(emp.id, 'potential', Number(e.target.value))}
                            className="h-6 text-xs mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${BOXES[emp.box!].color}`}>
                          {BOXES[emp.box!].label}
                        </span>
                        <span className="text-xs text-slate-500">{BOXES[emp.box!].action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
