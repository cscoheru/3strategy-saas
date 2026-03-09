'use client'

import { useState, use } from 'react'
import { Sparkles } from 'lucide-react'
import { toolCategories, type Tool } from '@/lib/tools-data'
import { ConsultationWorkbench } from '@/components/consultation-workbench'
import Link from 'next/link'

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool.id)
  }

  // 构建带locale前缀的URL
  const getLocalizedUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `/${locale}/${url}`
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                3Strategy
              </h1>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                智能咨询工具平台
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={getLocalizedUrl('auth/login')} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
              登录
            </Link>
            <Link href={getLocalizedUrl('auth/register')} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              开始使用
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-6 lg:py-12">

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              组织绩效改进平台
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              从战略解码到绩效改进，从薪酬改革到AI招聘，一体化解决企业组织管理问题
            </p>
          </div>

          {/* Tool Cards - 4 Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {toolCategories[0].tools.map((tool, index) => {
              const Icon = tool.icon
              const ToolContent = (
                <div className="group relative h-full flex flex-col">
                  {/* Upper Narrow Section */}
                  <div className="relative z-10 rounded-t-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-border p-6 pb-4 shadow-sm transition-all duration-300 group-hover:shadow-md">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {/* SubModules List - Upper Narrow */}
                    {tool.subModules && (
                      <div className="space-y-1.5 mt-4 pt-4 border-t border-border/50">
                        {tool.subModules.map((subModule, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            <span className="text-xs text-muted-foreground leading-relaxed flex-1">
                              {subModule}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lower Wide Section */}
                  <div className="relative z-10 rounded-b-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 to-slate-950 border-x border-b border-border p-6 pt-4 shadow-md transition-all duration-300 group-hover:shadow-xl flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">查看详情</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )

              if (tool.url) {
                const isExternal = tool.url.startsWith('http')
                return (
                  <Link
                    key={tool.id}
                    href={getLocalizedUrl(tool.url)}
                    onClick={() => handleToolClick(tool)}
                    className="block h-full"
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                  >
                    {ToolContent}
                  </Link>
                )
              }

              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className="block h-full cursor-pointer"
                >
                  {ToolContent}
                </div>
              )
            })}
          </div>

          {/* Consultation Workbench */}
          <ConsultationWorkbench />
        </div>
      </main>
    </div>
  )
}
