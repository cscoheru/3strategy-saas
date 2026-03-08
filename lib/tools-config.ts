// 工具配置 - 工具注册表
import { Target, BarChart, DollarSign, Calculator, Users, Grid3X3, Briefcase, FileText, LineChart, MessageSquare, ExternalLink } from 'lucide-react';

export interface Tool {
  id: string;
  name: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  icon: string;
  status: 'live' | 'coming-soon' | 'external';
  url: string;
  category: string;
  priority: number;
}

export const tools: Tool[] = [
  // P0 - 核心功能
  {
    id: 'strategy',
    name: { en: 'Strategy Decoding', zh: '战略解码' },
    description: {
      en: 'Three Forces Three Platforms strategic planning tool',
      zh: '三力三平台战略规划工具'
    },
    icon: 'Target',
    status: 'external',
    url: 'https://strategy-kappa.vercel.app',
    category: 'Strategy',
    priority: 0
  },
  {
    id: 'bsc',
    name: { en: 'Balanced Scorecard', zh: '平衡计分卡' },
    description: {
      en: 'BSC vision, perspectives, objectives and KPIs',
      zh: 'BSC 愿景、视角、目标和 KPI 管理'
    },
    icon: 'BarChart',
    status: 'coming-soon',
    url: '/tools/bsc',
    category: 'Strategy',
    priority: 1
  },
  {
    id: 'ai-assistant',
    name: { en: 'AI Assistant', zh: 'AI 助手' },
    description: {
      en: 'Multi-model AI chat powered by GLM-4.7',
      zh: '基于 GLM-4.7 的多模型 AI 聊天'
    },
    icon: 'MessageSquare',
    status: 'live',
    url: '#chat',
    category: 'AI',
    priority: 0
  },

  // P1 - 薪酬管理
  {
    id: 'broadband',
    name: { en: 'Broadband Designer', zh: '薪酬宽带设计' },
    description: {
      en: 'Compensation broadband visualization and design',
      zh: '薪酬宽带可视化设计工具'
    },
    icon: 'DollarSign',
    status: 'coming-soon',
    url: '/tools/broadband',
    category: 'Compensation',
    priority: 1
  },
  {
    id: 'conversion',
    name: { en: 'Conversion Calculator', zh: '套改计算器' },
    description: {
      en: 'Salary conversion and adjustment calculator',
      zh: '薪酬套改计算工具'
    },
    icon: 'Calculator',
    status: 'coming-soon',
    url: '/tools/conversion',
    category: 'Compensation',
    priority: 1
  },

  // P1 - 人才盘点
  {
    id: 'nine-box',
    name: { en: 'Nine-Box Grid', zh: '九宫格' },
    description: {
      en: 'Talent review and performance-potential matrix',
      zh: '人才盘点九宫格工具'
    },
    icon: 'Grid3X3',
    status: 'coming-soon',
    url: '/tools/nine-box',
    category: 'Talent Review',
    priority: 1
  },
  {
    id: 'skills-matrix',
    name: { en: 'Skills Matrix', zh: '技能矩阵' },
    description: {
      en: 'Team skills assessment and visualization',
      zh: '团队技能评估矩阵'
    },
    icon: 'Users',
    status: 'coming-soon',
    url: '/tools/skills-matrix',
    category: 'Talent Review',
    priority: 1
  },

  // P2 - 绩效管理
  {
    id: 'okr',
    name: { en: 'OKR Designer', zh: 'OKR 设计器' },
    description: {
      en: 'AI-assisted OKR design and tracking',
      zh: 'AI 辅助 OKR 设计工具'
    },
    icon: 'Target',
    status: 'coming-soon',
    url: '/tools/okr',
    category: 'Performance',
    priority: 2
  },
  {
    id: 'kpi',
    name: { en: 'KPI Generator', zh: 'KPI 生成器' },
    description: {
      en: 'AI-powered KPI suggestions and templates',
      zh: 'AI 生成 KPI 建议和模板'
    },
    icon: 'BarChart',
    status: 'coming-soon',
    url: '/tools/kpi',
    category: 'Performance',
    priority: 2
  },

  // P2 - 招聘分析
  {
    id: 'resume-matcher',
    name: { en: 'Resume Matcher', zh: '简历匹配' },
    description: {
      en: 'AI-powered resume-job matching',
      zh: 'AI 简历岗位匹配工具'
    },
    icon: 'Briefcase',
    status: 'coming-soon',
    url: '/tools/resume-matcher',
    category: 'Recruitment',
    priority: 2
  },

  // P2 - HR 分析
  {
    id: 'analytics',
    name: { en: 'HR Analytics', zh: 'HR 分析' },
    description: {
      en: 'HR data visualization and insights',
      zh: 'HR 数据可视化分析'
    },
    icon: 'LineChart',
    status: 'coming-soon',
    url: '/tools/analytics',
    category: 'Analytics',
    priority: 2
  },
  {
    id: 'reports',
    name: { en: 'Report Generator', zh: '报告生成器' },
    description: {
      en: 'AI-powered HR report generation',
      zh: 'AI 生成 HR 分析报告'
    },
    icon: 'FileText',
    status: 'coming-soon',
    url: '/tools/reports',
    category: 'Analytics',
    priority: 3
  },

  // 外部工具
  {
    id: 'perplexity',
    name: { en: 'Perplexity', zh: 'Perplexity 搜索' },
    description: {
      en: 'AI-powered search engine',
      zh: 'AI 驱动的搜索引擎'
    },
    icon: 'ExternalLink',
    status: 'external',
    url: 'https://perplexity.ai',
    category: 'General',
    priority: 0
  }
];

export const toolCategories = [
  { id: 'Strategy', name: { en: 'Strategy', zh: '战略' }, icon: 'Target' },
  { id: 'Performance', name: { en: 'Performance', zh: '绩效' }, icon: 'BarChart' },
  { id: 'Compensation', name: { en: 'Compensation', zh: '薪酬' }, icon: 'DollarSign' },
  { id: 'Talent Review', name: { en: 'Talent Review', zh: '人才盘点' }, icon: 'Users' },
  { id: 'Recruitment', name: { en: 'Recruitment', zh: '招聘' }, icon: 'Briefcase' },
  { id: 'Analytics', name: { en: 'Analytics', zh: '分析' }, icon: 'LineChart' },
  { id: 'AI', name: { en: 'AI Tools', zh: 'AI 工具' }, icon: 'MessageSquare' },
  { id: 'General', name: { en: 'General', zh: '通用' }, icon: 'ExternalLink' }
];

export const getToolIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Target, BarChart, DollarSign, Calculator, Users, Grid3X3, Briefcase, FileText, LineChart, MessageSquare, ExternalLink
  };
  return icons[iconName] || Target;
};
