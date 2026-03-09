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
  // 战略
  {
    id: 'strategy',
    name: { en: 'Strategy Decoding', zh: '战略解码' },
    description: {
      en: 'Three Forces Three Platforms strategic planning',
      zh: '三力三平台战略规划'
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
      en: 'BSC vision, perspectives, objectives',
      zh: 'BSC 愿景、视角、目标'
    },
    icon: 'BarChart',
    status: 'live',
    url: '/tools/bsc',
    category: 'Strategy',
    priority: 1
  },

  // 绩效
  {
    id: 'okr',
    name: { en: 'OKR Designer', zh: 'OKR 设计器' },
    description: {
      en: 'AI-assisted OKR design',
      zh: 'AI 辅助 OKR 设计'
    },
    icon: 'Target',
    status: 'live',
    url: '/tools/okr',
    category: 'Performance',
    priority: 2
  },
  {
    id: 'kpi',
    name: { en: 'KPI Generator', zh: 'KPI 生成器' },
    description: {
      en: 'AI-powered KPI suggestions',
      zh: 'AI 生成 KPI 建议'
    },
    icon: 'BarChart',
    status: 'live',
    url: '/tools/kpi',
    category: 'Performance',
    priority: 2
  },

  // 薪酬
  {
    id: 'broadband',
    name: { en: 'Broadband Designer', zh: '薪酬宽带' },
    description: {
      en: 'Compensation broadband design',
      zh: '薪酬宽带设计'
    },
    icon: 'DollarSign',
    status: 'live',
    url: '/tools/broadband',
    category: 'Compensation',
    priority: 1
  },
  {
    id: 'conversion',
    name: { en: 'Conversion Calculator', zh: '套改计算器' },
    description: {
      en: 'Salary conversion calculator',
      zh: '薪酬套改计算'
    },
    icon: 'Calculator',
    status: 'live',
    url: '/tools/salary-adjustment',
    category: 'Compensation',
    priority: 1
  },

  // 人才 (合并了招聘的简历匹配)
  {
    id: 'nine-box',
    name: { en: 'Nine-Box Grid', zh: '九宫格' },
    description: {
      en: 'Talent review matrix',
      zh: '人才盘点九宫格'
    },
    icon: 'Grid3X3',
    status: 'live',
    url: '/tools/nine-box',
    category: 'Talent',
    priority: 1
  },
  {
    id: 'skills-matrix',
    name: { en: 'Skills Matrix', zh: '技能矩阵' },
    description: {
      en: 'Team skills assessment',
      zh: '团队技能评估'
    },
    icon: 'Users',
    status: 'live',
    url: '/tools/skills-matrix',
    category: 'Talent',
    priority: 1
  },
  {
    id: 'resume-matcher',
    name: { en: 'Resume Matcher', zh: '简历匹配' },
    description: {
      en: 'AI resume-job matching',
      zh: 'AI 简历匹配'
    },
    icon: 'Briefcase',
    status: 'live',
    url: '/tools/resume-match',
    category: 'Talent',
    priority: 2
  },
  {
    id: 'analytics',
    name: { en: 'HR Analytics', zh: 'HR 分析' },
    description: {
      en: 'HR data visualization',
      zh: 'HR 数据分析'
    },
    icon: 'LineChart',
    status: 'live',
    url: '/tools/hr-analytics',
    category: 'Talent',
    priority: 2
  },
];

// 只保留4个核心分类，两行布局
export const toolCategories = [
  { id: 'Strategy', name: { en: 'Strategy', zh: '战略' }, icon: 'Target' },
  { id: 'Performance', name: { en: 'Performance', zh: '绩效' }, icon: 'BarChart' },
  { id: 'Compensation', name: { en: 'Compensation', zh: '薪酬' }, icon: 'DollarSign' },
  { id: 'Talent', name: { en: 'Talent', zh: '人才' }, icon: 'Users' },
];

export const getToolIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Target, BarChart, DollarSign, Calculator, Users, Grid3X3, Briefcase, FileText, LineChart, MessageSquare, ExternalLink
  };
  return icons[iconName] || Target;
};
