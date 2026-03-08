'use client';

import React from 'react';
import { Target, BarChart, DollarSign, Calculator, Users, Grid3X3, Briefcase, FileText, LineChart, MessageSquare, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import { tools, toolCategories, type Tool } from '@/lib/tools-config';
import { ChatBox } from '@/components/chat-box';
import Link from 'next/link';

// Icon mapping
const iconMap: Record<string, any> = {
  Target, BarChart, DollarSign, Calculator, Users, Grid3X3, Briefcase, FileText, LineChart, MessageSquare, ExternalLink
};

function ToolCard({ tool, locale }: { tool: Tool; locale: string }) {
  const Icon = iconMap[tool.icon] || Target;
  const isExternal = tool.status === 'external';
  const isLive = tool.status === 'live';

  const CardContent = () => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-slate-200 h-full flex flex-col">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isLive && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Zap className="w-3 h-3 mr-1" />
            Live
          </span>
        )}
        {tool.status === 'coming-soon' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Soon
          </span>
        )}
        {isExternal && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ExternalLink className="w-3 h-3 mr-1" />
            Link
          </span>
        )}
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {tool.name[locale as 'en' | 'zh']}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-4 flex-grow">
        {tool.description[locale as 'en' | 'zh']}
      </p>

      {/* Category */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wider">
          {tool.category}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block">
        <CardContent />
      </a>
    );
  }

  return (
    <Link href={tool.url}>
      <CardContent />
    </Link>
  );
}

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // Using zh as default for now, will be replaced with locale from params
  const locale = 'zh';

  // Group tools by category
  const toolsByCategory = toolCategories.map(category => ({
    ...category,
    tools: tools.filter(t => t.category === category.id).sort((a, b) => a.priority - b.priority)
  })).filter(cat => cat.tools.length > 0);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              3Strategy
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal mt-2 opacity-90">
                HR 咨询工具平台
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl opacity-80 mb-8">
              专业的管理咨询工具集，涵盖战略解码、绩效管理、薪酬设计、人才盘点等核心领域
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#tools"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-indigo-600 font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                探索工具
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
              <a
                href="https://strategy-kappa.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-all"
              >
                三力三平台
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {toolsByCategory.map((category) => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { className: "w-5 h-5 text-slate-600" })}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {category.name[locale as 'en' | 'zh']}
                </h2>
                <span className="text-sm text-slate-400">({category.tools.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} locale={locale} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Chat Section */}
      <section id="chat" className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <MessageSquare className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">AI 助手</h2>
            <p className="text-slate-500">基于 GLM-4.7 的智能咨询助手，随时为您解答管理问题</p>
          </div>

          {/* Real Chat Box Component */}
          <ChatBox />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
              <span className="text-white font-semibold">3Strategy</span>
            </div>
            <p className="text-sm">© 2024 3Strategy. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">隐私政策</a>
              <a href="#" className="hover:text-white transition-colors">使用条款</a>
              <a href="#" className="hover:text-white transition-colors">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
