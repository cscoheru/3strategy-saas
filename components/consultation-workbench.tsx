'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { useStreamChat, Message } from '@/lib/hooks/use-stream-chat'
import { createDiagnosisSession } from '@/app/actions/diagnosis'
import { DiagnosisReportPanel } from './diagnosis-report-panel'

export function ConsultationWorkbench() {
  const [mode, setMode] = useState<'chat' | 'report'>('chat')
  const [sessionId, setSessionId] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDegradedMode, setIsDegradedMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isStreaming,
    sendMessage,
    setMessagesList,
  } = useStreamChat({
    sessionId,
    onMessageComplete: (msg) => {
      console.log('Message completed:', msg)
    },
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // 初始化会话
  useEffect(() => {
    if (isInitialized) return

    const initSession = async () => {
      try {
        console.log('🔄 [Workbench] Initializing session...')
        const { data, error } = await createDiagnosisSession()

        if (error) {
          // Error is now properly structured with message property
          const errorMsg = error?.message || error?.toString?.() || '未知错误'
          console.error('❌ [Workbench] Failed to create session:', errorMsg)
          console.error('❌ [Workbench] Error details:', {
            message: error?.message,
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
          })
          setErrorMessage(errorMsg)
          setIsDegradedMode(true)
          // 即使失败也显示欢迎消息（降级模式）
          setMessagesList([{
            id: 'welcome',
            role: 'assistant',
            content: '欢迎来到3Strategy智能诊断系统！\n\n⚠️ 注意：当前使用简化模式，部分功能可能受限。请稍后刷新页面尝试完整功能。\n\n请告诉我您组织目前面临的挑战，例如：战略目标不清晰、绩效管理流于形式、人才流失严重等问题。',
            timestamp: new Date(),
          }])
          setIsInitialized(true)
          return
        }

        if (data) {
          console.log('✅ [Workbench] Session created:', data.id)
          setSessionId(data.id)

          // 添加欢迎消息
          setMessagesList([{
            id: 'welcome',
            role: 'assistant',
            content: '欢迎来到3Strategy智能诊断系统！\n\n我可以帮助您诊断组织在战略、结构、绩效、薪酬、人才五个维度的问题。\n\n请告诉我您组织目前面临的主要挑战是什么？',
            timestamp: new Date(),
          }])
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('❌ [Workbench] Init error:', error)
        setIsInitialized(true)
      }
    }

    initSession()
  }, [isInitialized, setMessagesList])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return

    const message = inputValue
    setInputValue('')

    // 如果没有sessionId，使用本地模式
    if (!sessionId) {
      // 添加用户消息
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      }
      setMessagesList([...messages, userMsg])

      // 模拟AI回复
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getLocalAIResponse(message),
          timestamp: new Date(),
        }
        setMessagesList([...messages, aiMsg])
      }, 500)
      return
    }

    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 本地AI回复（当Supabase不可用时）
  const getLocalAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('战略') || lowerQuery.includes('目标')) {
      return `【问题分析】
根据您的描述，战略问题的核心可能在于目标不清晰、执行不到位或与实际业务脱节。

【建议选项】
1. **[建立战略解码体系]**
   - 具体步骤：①澄清愿景使命 ②分解战略目标 ③对齐部门KPI ④建立追踪机制
   - 预期结果：全员方向一致，战略可落地执行
   - 所需资源：1-2个月，高层参与，外部咨询支持

2. **[优化战略执行流程]**
   - 具体步骤：①建立战略例会 ②设置里程碑 ③定期review进展 ④及时调整
   - 预期结果：执行透明化，问题及时暴露
   - 所需资源：持续进行，管理层投入

【后续问题】
请问您组织的战略目标是否已经明确？主要卡在哪个环节？`
    }
    if (lowerQuery.includes('绩效') || lowerQuery.includes('kpi') || lowerQuery.includes('okr')) {
      return `【问题分析】
绩效管理问题通常体现在KPI设定不合理、考核流于形式、或与激励脱节。

【建议选项】
1. **[重建KPI体系]**
   - 具体步骤：①梳理战略目标 ②提取关键指标 ③设定SMART目标 ④建立数据收集机制
   - 预期结果：指标科学合理，能量化可追踪
   - 所需资源：2-4周，HRBP牵头，各部门配合

2. **[优化绩效流程]**
   - 具体步骤：①简化考核表 ②增加即时反馈 ③建立改进计划 ④关联发展机会
   - 预期结果：管理效率提升，员工接受度提高
   - 所需资源：1-2周，IT系统支持

【后续问题】
您当前的绩效考核主要存在什么问题？是指标设定还是执行过程？`
    }
    if (lowerQuery.includes('薪酬') || lowerQuery.includes('工资') || lowerQuery.includes('奖金')) {
      return `【问题分析】
薪酬问题通常涉及内部公平性、外部竞争性、或与绩效的关联度不足。

【建议选项】
1. **[进行薪酬调研]**
   - 具体步骤：①选择对标企业 ②收集薪酬数据 ③分析差距 ④制定调整方案
   - 预期结果：了解市场水平，调整有据可依
   - 所需资源：2-4周，外部数据购买

2. **[优化薪酬结构]**
   - 具体步骤：①设计宽带薪酬 ②设置浮动比例 ③建立晋升通道 ④完善福利体系
   - 预期结果：激励性强，保留核心人才
   - 所需资源：1-2个月，专业咨询支持

【后续问题】
您觉得当前薪酬体系最大的问题是什么？是外部竞争力还是内部公平性？`
    }
    if (lowerQuery.includes('人才') || lowerQuery.includes('招聘') || lowerQuery.includes('培训')) {
      return `【问题分析】
人才发展问题通常涉及招聘效率低、培养体系缺失、或关键人才流失。

【建议选项】
1. **[建立人才盘点机制]**
   - 具体步骤：①定义能力模型 ②评估现有人才 ③识别高潜人才 ④制定发展计划
   - 预期结果：人才状况清晰，发展有的放矢
   - 所需资源：1-2个月，专业测评工具

2. **[优化招聘流程]**
   - 具体步骤：①明确岗位画像 ②优化面试流程 ③建立人才库 ④改善雇主品牌
   - 预期结果：招聘效率提升，人岗匹配度提高
   - 所需资源：持续进行，HR团队建设

【后续问题】
您组织当前最紧迫的人才问题是什么？是招聘困难还是人才流失？`
    }
    if (lowerQuery.includes('组织') || lowerQuery.includes('结构') || lowerQuery.includes('流程')) {
      return `【问题分析】
组织结构问题可能包括层级过多、决策效率低、部门墙严重或职责不清。

【建议选项】
1. **[优化组织架构]**
   - 具体步骤：①诊断现有结构 ②设计未来架构 ③制定迁移路径 ④沟通变革方案
   - 预期结果：敏捷高效，支持战略执行
   - 所需资源：2-3个月，全员配合，变革管理

2. **[优化决策流程]**
   - 具体步骤：①梳理决策事项 ②明确决策权限 ③设置响应时效 ④建立问责机制
   - 预期结果：决策提速，责任清晰
   - 所需资源：1个月，管理层共识

【后续问题】
您觉得当前组织架构最大的痛点是什么？是决策效率还是跨部门协作？`
    }

    return `【问题分析】
感谢您的分享。为了给出更精准的建议，我需要了解更多背景信息。

【建议选项】
1. **[补充问题背景]** 描述问题的持续时间、影响范围、已采取的措施
2. **[聚焦具体维度]** 从战略、结构、绩效、薪酬、人才中选择最相关的一个
3. **[描述期望状态]** 告诉我您希望达到的理想状态

【后续问题】
能否详细描述一下这个问题的具体情况？比如：问题出现多久了？涉及哪些部门？对组织造成了什么影响？`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (mode === 'report') {
    return <DiagnosisReportPanel sessionId={sessionId} onBack={() => setMode('chat')} />
  }

  return (
    <div className="w-full px-5 py-8 lg:px-6 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">AI智能诊断</h2>
          <p className="text-muted-foreground">告诉我您组织面临的挑战，AI将为您生成五维诊断报告</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：对话区域 */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">AI顾问</h3>
                    {isDegradedMode && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        简化模式
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isDegradedMode ? '部分功能受限' : '五维智能诊断系统'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-background/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {/* Streaming indicator */}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">AI正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex items-center gap-3">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="描述您组织面临的挑战..."
                    className="flex-1 min-h-[60px] max-h-[120px] bg-secondary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none border border-transparent focus:border-primary/30 transition-all"
                    disabled={isStreaming}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isStreaming}
                    className="h-12 px-5 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 font-medium"
                  >
                    <span className="hidden sm:inline">发送</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  AI会根据您的描述自动识别问题所属维度并进行深入分析
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：查看报告按钮 */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col justify-center shadow-sm">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">查看诊断报告</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  随时查看AI为您生成的五维组织诊断报告
                </p>
                <button
                  onClick={() => setMode('report')}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-3 px-6 font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
                >
                  查看报告
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-4 text-xs text-muted-foreground">
                  💡 即使对话未完成，也可以随时查看当前诊断结果
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
