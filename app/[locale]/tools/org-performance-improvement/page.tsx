'use client'

import { useState } from 'react'
import {
  Target,
  TrendingUp,
  Activity,
  Search,
  GraduationCap,
  DollarSign,
  Users,
  ChevronRight,
  BookOpen,
  BarChart3,
  FileText,
  UserPlus
} from 'lucide-react'

interface SubModule {
  id: string
  title: string
  description: string
  icon: any
  items: string[]
  url: string
}

const subModules: SubModule[] = [
  {
    id: 'strategy-decode',
    title: '战略解码',
    description: '业务复盘 → 市场洞察 → 目标制定 → 任务分解',
    icon: Target,
    items: ['业务复盘', '市场洞察', '目标制定', '任务分解'],
    url: 'https://strategy-kappa.vercel.app'
  },
  {
    id: 'org-performance',
    title: '组织绩效',
    description: '目标与指标管理（OKR + KPI 一体化）',
    icon: BarChart3,
    items: ['公司战略', '部门目标', '岗位目标', '个人指标'],
    url: '#org-performance'
  },
  {
    id: 'progress-diagnosis',
    title: '进度跟踪与诊断',
    description: '进度跟踪 + 归因诊断（合并）',
    icon: Activity,
    items: ['实时监控', '偏差预警', '根因分析', '改进建议'],
    url: '#progress-diagnosis'
  },
  {
    id: 'capability-assessment',
    title: '能力评估',
    description: '能力雷达图与IDP生成',
    icon: GraduationCap,
    items: ['能力雷达', 'IDP计划', '培训推荐', '导师匹配'],
    url: '/tools/capability-assessment'
  },
  {
    id: 'compensation-management',
    title: '薪酬管理',
    description: '薪酬包设计、固浮比策略、奖金分配',
    icon: DollarSign,
    items: ['薪酬包', '固浮比', '奖金策略', '市场对标'],
    url: '#compensation'
  },
  {
    id: 'recruitment-management',
    title: '招聘管理',
    description: 'HC规划、人才画像、招聘执行',
    icon: UserPlus,
    items: ['HC规划', '人才画像', '渠道分析', '简历匹配'],
    url: '#recruitment'
  }
]

export default function OrgPerformanceImprovementPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('overview')

  const renderModule = (module: SubModule) => {
    const Icon = module.icon

    return (
      <div key={module.id} className="mb-6">
        <div className="flex items-center gap-4 p-6 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors cursor-pointer"
             onClick={() => setActiveModule(module.id)}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{module.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
            <div className="flex flex-wrap gap-2">
              {module.items.map((item, idx) => (
                <span key={idx} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">组织绩效改进</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            从战略到执行的一体化组织绩效改进平台
          </p>
        </div>

        {/* Process Flow */}
        <div className="mb-8 p-6 border border-border rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">📊 完整业务流程</h2>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="font-medium text-foreground">1. 战略解码</div>
              <div className="text-muted-foreground">确定方向</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium text-foreground">2. 组织绩效</div>
              <div className="text-muted-foreground">目标分解</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium text-foreground">3. 进度跟踪</div>
              <div className="text-muted-foreground">执行监控</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium text-foreground">4. 绩效诊断</div>
              <div className="text-muted-foreground">复盘改进</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium text-foreground">5. 能力发展</div>
              <div className="text-muted-foreground">IDP计划</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium text-foreground">6. 薪酬激励</div>
              <div className="text-muted-foreground">价值分配</div>
            </div>
          </div>
        </div>

        {/* Sub Modules List */}
        <div className="space-y-6">
          <div className="p-6 border border-border rounded-xl bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-2">六大核心模块</h2>
            <p className="text-sm text-muted-foreground mb-6">点击模块查看详情</p>
            {subModules.map((module) => renderModule(module))}
          </div>

          {/* Key Integration Points */}
          <div className="p-6 border border-border rounded-xl bg-amber-50 dark:bg-amber-950/20">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4">🔗 关键集成点</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-amber-900 dark:text-amber-100">战略 → 绩效</div>
                <div className="text-amber-700 dark:text-amber-300">战略解码输出 → 组织绩效输入</div>
              </div>
              <div>
                <div className="font-medium text-amber-900 dark:text-amber-100">绩效 → 薪酬</div>
                <div className="text-amber-700 dark:text-amber-300">绩效评分 → 奖金分配</div>
              </div>
              <div>
                <div className="font-medium text-amber-900 dark:text-amber-100">薪酬 → 招聘</div>
                <div className="text-amber-700 dark:text-amber-300">薪酬包 → HC预算</div>
              </div>
              <div>
                <div className="font-medium text-amber-900 dark:text-amber-100">招聘 → 绩效</div>
                <div className="text-amber-700 dark:text-amber-300">人才到位 → 目标调整</div>
              </div>
            </div>
          </div>

          {/* AI Assistant Preview */}
          <div className="p-6 border border-primary/30 rounded-xl bg-primary/5">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              AI智能顾问（即将上线）
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              全流程AI陪伴，从战略制定到执行跟踪，提供实时分析和建议
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-foreground">"本季度销售额未达成，我分析了3个可能原因..."</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-foreground">"根据市场数据，建议研发团队固浮比调整为6:4"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-foreground">"候选人A的技术能力匹配度92%，建议进入终面"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground text-center">
          🚀 组织绩效改进平台 - 从战略到执行的一体化管理
        </div>
      </div>
    </div>
  )
}
