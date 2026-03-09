'use client'

import { useState } from 'react'
import { Users, Target, UserPlus, FileSearch, MessageSquare, BookOpen, Plus, Edit, CheckCircle2, AlertCircle, ChevronRight, Briefcase, GraduationCap, Search } from 'lucide-react'
import Link from 'next/link'

// 模拟数据
const mockHCRequests = [
  { id: 1, department: '产品部', position: '产品经理', headcount: 2, budget: 400000, status: 'approved', urgency: 'high' },
  { id: 2, department: '研发部', position: '高级算法工程师', headcount: 1, budget: 600000, status: 'pending', urgency: 'medium' },
  { id: 3, department: '市场部', position: '品牌经理', headcount: 1, budget: 250000, status: 'approved', urgency: 'low' }
]

const mockTalentProfile = {
  position: '产品经理',
  skills: [
    { name: '产品规划', weight: 90, required: true },
    { name: '数据分析', weight: 75, required: true },
    { name: '用户研究', weight: 80, required: true },
    { name: '项目管理', weight: 85, required: true },
    { name: '沟通能力', weight: 70, required: false },
    { name: '行业知识', weight: 65, required: false }
  ],
  qualifications: [
    { type: 'go', label: '3年以上产品经验', mustHave: true },
    { type: 'go', label: '有B2C产品经验优先', mustHave: false },
    { type: 'no-go', label: '频繁跳槽（2年内超过3次）', mustHave: true }
  ]
}

const mockCandidates = [
  { id: 1, name: '张三', matchScore: 85, keyStrengths: ['产品规划', '数据分析'], gaps: ['行业知识'], status: 'interview' },
  { id: 2, name: '李四', matchScore: 72, keyStrengths: ['项目管理', '沟通能力'], gaps: ['数据分析', '用户研究'], status: 'new' },
  { id: 3, name: '王五', matchScore: 91, keyStrengths: ['产品规划', '用户研究', '行业知识'], gaps: ['项目管理'], status: 'offer' }
]

type TabType = 'overview' | 'hc' | 'profile' | 'matching' | 'offer'

export default function AIRecruitmentPage({ params }: { params: Promise<{ locale: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/zh" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 inline-block">
            <ChevronRight className="h-4 w-4 rotate-180" />
            返回
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI招聘工具</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            从HC规划到人才入职的全流程AI招聘系统
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { key: 'overview', label: '总览' },
              { key: 'hc', label: 'HC规划' },
              { key: 'profile', label: '人才画像' },
              { key: 'matching', label: '智能匹配' },
              { key: 'offer', label: 'Offer决策' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockHCRequests.reduce((sum, r) => sum + r.headcount, 0)}</div>
                    <div className="text-xs text-muted-foreground">在招HC</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockHCRequests.filter(r => r.status === 'approved').length}</div>
                    <div className="text-xs text-muted-foreground">已批准</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockHCRequests.filter(r => r.status === 'pending').length}</div>
                    <div className="text-xs text-muted-foreground">待批准</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{mockCandidates.reduce((sum, c) => sum + (c.matchScore >= 80 ? 1 : 0), 0)}</div>
                    <div className="text-xs text-muted-foreground">匹配候选人</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">核心模块说明</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <h3 className="font-semibold text-foreground mb-2">📊 HC规划（连接薪酬包）</h3>
                  <p className="text-sm text-muted-foreground">
                    基于薪酬包确定HC预算，区分新增、替换、扩编HC。资源向关键岗位倾斜。
                  </p>
                </div>
                <div className="p-4 border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-950/20">
                  <h3 className="font-semibold text-foreground mb-2">🎨 人才画像（AI深度分析）</h3>
                  <p className="text-sm text-muted-foreground">
                    AI分析JD生成候选人画像，包括技能权重、Go/No-Go标准、面试问题建议。
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="font-semibold text-foreground mb-2">🤖 智能匹配（AI简历筛选）</h3>
                  <p className="text-sm text-muted-foreground">
                    简历AI初筛，计算与人才画像的匹配度，识别技能差距。
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-semibold text-foreground mb-2">💼 Offer决策</h3>
                  <p className="text-sm text-muted-foreground">
                    综合评估匹配度、薪酬期望、文化匹配，辅助Offer谈判决策。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HC Planning Tab */}
        {activeTab === 'hc' && (
          <HCPlanningView requests={mockHCRequests} />
        )}

        {/* Talent Profile Tab */}
        {activeTab === 'profile' && (
          <TalentProfileView profile={mockTalentProfile} />
        )}

        {/* Smart Matching Tab */}
        {activeTab === 'matching' && (
          <SmartMatchingView candidates={mockCandidates} />
        )}

        {/* Offer Decision Tab */}
        {activeTab === 'offer' && (
          <OfferDecisionView />
        )}
      </div>
    </div>
  )
}

// HC规划组件
function HCPlanningView({ requests }: { requests: typeof mockHCRequests }) {
  const [showNewHC, setShowNewHC] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">HC规划管理</h2>
          <p className="text-muted-foreground">连接薪酬包，规划招聘需求</p>
        </div>
        <button onClick={() => setShowNewHC(!showNewHC)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          新建HC
        </button>
      </div>

      {/* 新建HC表单 */}
      {showNewHC && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">新建HC申请</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">部门</label>
              <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <option>产品部</option>
                <option>研发部</option>
                <option>销售部</option>
                <option>市场部</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">岗位</label>
              <input type="text" placeholder="产品经理" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">HC数量</label>
              <input type="number" placeholder="1" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">预算范围</label>
              <input type="text" placeholder="300000-500000" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setShowNewHC(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
              取消
            </button>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
              提交审批
            </button>
          </div>
        </div>
      )}

      {/* HC请求列表 */}
      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{req.department}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">{req.position}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    req.status === 'approved' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' :
                    req.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' :
                    'bg-gray-50 text-gray-700 dark:bg-gray-950/20'
                  }`}>
                    {req.status === 'approved' ? '已批准' : '待审批'}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>HC: {req.headcount}人</span>
                  <span>预算: ¥{(req.budget / 10000).toFixed(0)}万</span>
                  <span className={`flex items-center gap-1 ${
                    req.urgency === 'high' ? 'text-red-500' :
                    req.urgency === 'medium' ? 'text-amber-500' :
                    'text-blue-500'
                  }`}>
                    <AlertCircle className="h-3.5 w-3.5" />
                    {req.urgency === 'high' ? '紧急' : req.urgency === 'medium' ? '中等' : '普通'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Target className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 人才画像组件
function TalentProfileView({ profile }: { profile: typeof mockTalentProfile }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">人才画像分析</h2>
          <p className="text-muted-foreground">AI深度分析JD，生成候选人画像</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5">
          <Edit className="h-4 w-4" />
          编辑画像
        </button>
      </div>

      {/* 技能权重 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">技能权重分析</h3>
        <div className="space-y-3">
          {profile.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-32 text-sm text-foreground">{skill.name}</div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">权重</span>
                  <span className="font-medium text-foreground">{skill.weight}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${skill.weight}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${skill.required ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {skill.required ? '必需' : '加分'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 筛选标准 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Go标准（必备条件）
          </h3>
          <div className="space-y-2">
            {profile.qualifications.filter(q => q.type === 'go').map((q, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-foreground">{q.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            No-Go标准（淘汰条件）
          </h3>
          <div className="space-y-2">
            {profile.qualifications.filter(q => q.type === 'no-go').map((q, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-foreground">{q.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 智能匹配组件
function SmartMatchingView({ candidates }: { candidates: typeof mockCandidates }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI智能匹配</h2>
        <p className="text-muted-foreground">简历AI初筛，计算与人才画像的匹配度</p>
      </div>

      {/* 候选人列表 */}
      <div className="space-y-3">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      candidate.matchScore >= 85 ? 'text-green-500' :
                      candidate.matchScore >= 70 ? 'text-blue-500' :
                      'text-amber-500'
                    }`}>
                      {candidate.matchScore}%
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                      {candidate.status === 'offer' ? '已发Offer' : candidate.status === 'interview' ? '面试中' : '新简历'}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-muted-foreground mb-2">核心优势</div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.keyStrengths.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {candidate.gaps.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">能力差距</div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.gaps.map((g, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary transition-colors">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  邀请信息
                </button>
                <button className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary transition-colors">
                  <FileSearch className="h-4 w-4 inline mr-1" />
                  详细简历
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Offer决策组件
function OfferDecisionView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Offer决策辅助</h2>
        <p className="text-muted-foreground">综合评估匹配度、薪酬期望、文化匹配</p>
      </div>

      {/* 评估维度 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">综合评估模型</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">40%</div>
            <div className="text-sm text-muted-foreground">能力匹配</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">30%</div>
            <div className="text-sm text-muted-foreground">薪酬期望</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">20%</div>
            <div className="text-sm text-muted-foreground">文化匹配</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">10%</div>
            <div className="text-sm text-muted-foreground">发展潜力</div>
          </div>
        </div>
      </div>

      {/* 决策建议 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI决策建议</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">推荐发放Offer</p>
              <p className="text-xs text-muted-foreground mt-1">
                综合评分85分+，核心能力匹配度高，薪酬期望在预算范围内，建议快速推进Offer流程。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">需要进一步评估</p>
              <p className="text-xs text-muted-foreground mt-1">
                综合评分60-85分，某些关键能力存在差距，建议安排深度面试或能力测评后再决策。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">不建议继续</p>
              <p className="text-xs text-muted-foreground mt-1">
                综合评分低于60分，存在关键短板或薪酬期望远超预算，建议礼貌拒绝并保留候选人库。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
