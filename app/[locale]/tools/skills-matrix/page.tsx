'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Trash2, Download, Settings, Check, X } from 'lucide-react';

// 技能等级定义
type SkillLevel = 0 | 1 | 2 | 3 | 4;

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: Record<string, SkillLevel>;
}

// 技能等级配置
const SKILL_LEVELS: Record<SkillLevel, { label: string; color: string; description: string }> = {
  0: { label: '-', color: 'bg-slate-100 text-slate-400', description: '未掌握' },
  1: { label: '了解', color: 'bg-red-100 text-red-700', description: '基础认知' },
  2: { label: '熟悉', color: 'bg-amber-100 text-amber-700', description: '能独立工作' },
  3: { label: '熟练', color: 'bg-blue-100 text-blue-700', description: '深入理解' },
  4: { label: '精通', color: 'bg-green-100 text-green-700', description: '专家级别' },
};

// 默认技能列表
const DEFAULT_SKILLS: Skill[] = [
  { id: 's1', name: 'JavaScript', category: '前端开发' },
  { id: 's2', name: 'React', category: '前端开发' },
  { id: 's3', name: 'TypeScript', category: '前端开发' },
  { id: 's4', name: 'Node.js', category: '后端开发' },
  { id: 's5', name: 'Python', category: '后端开发' },
  { id: 's6', name: 'SQL', category: '数据库' },
  { id: 's7', name: 'Git', category: '工具' },
  { id: 's8', name: 'AWS', category: '云服务' },
];

// 默认团队成员
const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: '张三',
    role: '前端工程师',
    skills: { s1: 4, s2: 4, s3: 3, s4: 2, s5: 1, s6: 2, s7: 3, s8: 2 },
  },
  {
    id: 'm2',
    name: '李四',
    role: '后端工程师',
    skills: { s1: 2, s2: 1, s3: 2, s4: 4, s5: 4, s6: 4, s7: 3, s8: 3 },
  },
  {
    id: 'm3',
    name: '王五',
    role: '全栈工程师',
    skills: { s1: 3, s2: 3, s3: 3, s4: 3, s5: 2, s6: 3, s7: 4, s8: 2 },
  },
  {
    id: 'm4',
    name: '赵六',
    role: '技术经理',
    skills: { s1: 3, s2: 2, s3: 2, s4: 3, s5: 3, s6: 3, s7: 4, s8: 4 },
  },
];

export default function SkillsMatrix() {
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '前端开发' });
  const [newMember, setNewMember] = useState({ name: '', role: '' });

  // 按分类分组技能
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) grouped[skill.category] = [];
      grouped[skill.category].push(skill);
    });
    return grouped;
  }, [skills]);

  // 计算团队统计
  const teamStats = useMemo(() => {
    const stats: Record<string, { avg: number; max: number; min: number; count: number }> = {};
    skills.forEach(skill => {
      const levels = members.map(m => m.skills[skill.id] || 0) as number[];
      stats[skill.id] = {
        avg: levels.reduce((a: number, b: number) => a + b, 0) / members.length,
        max: Math.max(...levels),
        min: Math.min(...levels),
        count: levels.filter((l: number) => l >= 3).length,
      };
    });
    return stats;
  }, [skills, members]);

  // 更新技能等级
  const updateSkillLevel = (memberId: string, skillId: string, level: SkillLevel) => {
    setMembers(members.map(m =>
      m.id === memberId
        ? { ...m, skills: { ...m.skills, [skillId]: level } }
        : m
    ));
  };

  // 添加技能
  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    const skill: Skill = {
      id: `s${Date.now()}`,
      name: newSkill.name,
      category: newSkill.category,
    };
    setSkills([...skills, skill]);
    setNewSkill({ name: '', category: '前端开发' });
    setShowAddSkill(false);
  };

  // 添加成员
  const addMember = () => {
    if (!newMember.name.trim()) return;
    const member: TeamMember = {
      id: `m${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      skills: {},
    };
    setMembers([...members, member]);
    setNewMember({ name: '', role: '' });
    setShowAddMember(false);
  };

  // 删除技能
  const deleteSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
    setMembers(members.map(m => {
      const { [id]: _, ...rest } = m.skills;
      return { ...m, skills: rest };
    }));
  };

  // 删除成员
  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  // 导出矩阵
  const exportMatrix = () => {
    const headers = ['成员', '角色', ...skills.map(s => s.name)].join(',');
    const rows = members.map(m =>
      [m.name, m.role, ...skills.map(s => m.skills[s.id] || 0)].join(',')
    ).join('\n');

    const csv = '\ufeff' + headers + '\n' + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 获取等级颜色
  const getLevelColor = (level: SkillLevel) => {
    return SKILL_LEVELS[level].color;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">技能矩阵</h1>
            <p className="text-slate-500 mt-2">团队技能评估与可视化</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddSkill(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              添加技能
            </Button>
            <Button onClick={() => setShowAddMember(true)} variant="outline">
              <Users className="w-4 h-4 mr-2" />
              添加成员
            </Button>
            <Button onClick={exportMatrix} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* Add Skill Form */}
        {showAddSkill && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>技能名称</Label>
                  <Input
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="如：Vue.js"
                  />
                </div>
                <div className="flex-1">
                  <Label>分类</Label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200"
                  >
                    <option>前端开发</option>
                    <option>后端开发</option>
                    <option>数据库</option>
                    <option>工具</option>
                    <option>云服务</option>
                    <option>软技能</option>
                  </select>
                </div>
                <Button onClick={addSkill}>添加</Button>
                <Button onClick={() => setShowAddSkill(false)} variant="outline">取消</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Member Form */}
        {showAddMember && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>姓名</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="输入姓名"
                  />
                </div>
                <div className="flex-1">
                  <Label>角色</Label>
                  <Input
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="如：前端工程师"
                  />
                </div>
                <Button onClick={addMember}>添加</Button>
                <Button onClick={() => setShowAddMember(false)} variant="outline">取消</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Matrix */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left font-medium text-slate-700 min-w-[120px]">
                      成员
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 min-w-[100px]">
                      角色
                    </th>
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      categorySkills.map((skill, idx) => (
                        <th key={skill.id} className="px-2 py-3 text-center min-w-[80px] group">
                          <div className="relative">
                            <div className="font-medium text-slate-700">{skill.name}</div>
                            <div className="text-xs text-slate-400">{category}</div>
                            <button
                              onClick={() => deleteSkill(skill.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        </th>
                      ))
                    ))}
                    <th className="px-4 py-3 text-center font-medium text-slate-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => (
                    <tr key={member.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="sticky left-0 px-4 py-3 font-medium bg-inherit">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs">{member.name.charAt(0)}</span>
                          </div>
                          {member.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{member.role}</td>
                      {skills.map(skill => (
                        <td key={skill.id} className="px-2 py-2 text-center">
                          <select
                            value={member.skills[skill.id] || 0}
                            onChange={(e) => updateSkillLevel(member.id, skill.id, Number(e.target.value) as SkillLevel)}
                            className={`w-full h-8 rounded text-xs font-medium cursor-pointer ${getLevelColor((member.skills[skill.id] || 0) as SkillLevel)}`}
                          >
                            {[0, 1, 2, 3, 4].map(level => (
                              <option key={level} value={level}>
                                {SKILL_LEVELS[level as SkillLevel].label}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <Button
                          onClick={() => deleteMember(member.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* Stats Row */}
                  <tr className="bg-indigo-50 font-medium">
                    <td colSpan={2} className="px-4 py-3 text-indigo-700">
                      团队平均
                    </td>
                    {skills.map(skill => (
                      <td key={skill.id} className="px-2 py-3 text-center">
                        <div className="text-indigo-700">
                          {teamStats[skill.id]?.avg.toFixed(1)}
                        </div>
                      </td>
                    ))}
                    <td></td>
                  </tr>

                  {/* Coverage Row */}
                  <tr className="bg-green-50 text-sm">
                    <td colSpan={2} className="px-4 py-3 text-green-700">
                      熟练人数 (≥3)
                    </td>
                    {skills.map(skill => (
                      <td key={skill.id} className="px-2 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          teamStats[skill.id]?.count >= 2
                            ? 'bg-green-200 text-green-800'
                            : teamStats[skill.id]?.count >= 1
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {teamStats[skill.id]?.count}
                        </span>
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">等级说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(SKILL_LEVELS).map(([level, config]) => (
                <div key={level} className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-sm text-slate-500">{config.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
