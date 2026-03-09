import {
  Compass,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface Tool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  status: "available" | "coming_soon"
  url?: string
  subModules?: string[]  // 子模块列表
}

export interface ToolCategory {
  id: string
  name: string
  nameEn: string
  description: string
  tools: Tool[]
}

export const toolCategories: ToolCategory[] = [
  {
    id: "org-improvement",
    name: "组织改进",
    nameEn: "Organizational Improvement",
    description: "从战略到执行的一体化组织改进平台",
    tools: [
      {
        id: "strategy-decode",
        name: "战略解码",
        description: "将公司战略分解为可执行的目标和行动计划，实现战略到执行的无缝衔接",
        icon: Compass,
        category: "org-improvement",
        status: "available",
        url: "tools/strategy-decode",
        subModules: [
          "业务复盘",
          "市场洞察",
          "目标制定",
          "任务分解"
        ]
      },
      {
        id: "performance-improvement",
        name: "绩效改进",
        description: "从战略目标分解到个人绩效的全流程管理，连接目标制定、进度跟踪、诊断复盘与能力发展",
        icon: Target,
        category: "org-improvement",
        status: "available",
        url: "tools/performance-improvement",
        subModules: [
          "组织绩效：OKR+KPI一体化目标管理",
          "进度跟踪与诊断：执行监控+归因分析合并",
          "能力评估：能力雷达图与IDP发展计划"
        ]
      },
      {
        id: "compensation-reform",
        name: "薪酬改革",
        description: "从公司视角设计薪酬体系，薪酬包规划、固浮比设计、奖金策略连接绩效结果",
        icon: DollarSign,
        category: "org-improvement",
        status: "available",
        url: "tools/compensation-reform",
        subModules: [
          "薪酬包设计：公司→部门→岗位→个人的资源分配",
          "固浮比策略：不同岗位的固浮比设计（研发/销售/职能）",
          "奖金策略：连接绩效结果的组织奖金分配",
          "市场对标：岗位薪酬竞争力分析"
        ]
      },
      {
        id: "ai-recruitment",
        name: "AI招聘",
        description: "从HC规划到人才入职的全流程AI招聘系统，需求分析、人才画像、智能匹配、Offer决策",
        icon: Users,
        category: "org-improvement",
        status: "available",
        url: "tools/ai-recruitment",
        subModules: [
          "HC规划：连接薪酬包的招聘需求与预算管理",
          "人才画像：AI深度分析JD生成候选人画像",
          "智能匹配：简历AI初筛与匹配度评分",
          "招聘执行：渠道选择、面试问题生成、Offer谈判"
        ]
      },
    ],
  },
]

export const allTools = toolCategories.flatMap((category) => category.tools)
