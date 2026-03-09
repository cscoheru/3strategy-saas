/**
 * Chat Server Actions
 * AI 对话和数据提取 Server Actions
 * 集成 Python RAG Backend
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  extractJSONWithAI,
  ZhipuAIClient,
  streamChatWithAI,
} from '@/lib/ai/zhipu';
import type { DiagnosisSession, ChatLog } from '@/types/supabase';

// ============================================
// 类型定义
// ============================================

export interface StreamChatOptions {
  sessionId: string;
  message: string;
  temperature?: number;
  useDify?: boolean; // 是否使用 Dify 知识库
  knowledgeBase?: 'managconsult' | 'psyqa'; // Dify 知识库选择
}

export interface ExtractedInsights {
  score: number; // 0-100
  tags: string[];
  key_issues: string[];
  summary?: string;
  recommendations?: string[];
}

type Dimension = 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent';

// ============================================
// 0. 意图识别 (Intent Detection) - 使用本地 LLM
// ============================================

/**
 * 检测用户意图，识别应该讨论哪个维度
 */
async function detectUserIntent(
  message: string,
  currentStage: string
): Promise<Dimension | null> {
  try {
    console.log('🔍 [Intent Detection] Analyzing user intent...');
    console.log('📝 [Intent Detection] Message:', message);

    const client = new ZhipuAIClient();

    const dimensionDescriptions = {
      strategy: '战略（strategy）- 战略目标、愿景、市场定位、竞争优势、战略规划',
      structure: '组织结构（structure）- 组织架构、部门设置、汇报关系、决策流程、跨部门协作',
      performance: '绩效管理（performance）- KPI设定、绩效考核、绩效反馈、激励机制',
      compensation: '薪酬激励（compensation）- 薪酬体系、奖金制度、福利待遇、薪酬公平',
      talent: '人才发展（talent）- 招聘选拔、培训发展、人才梯队、员工满意度、企业文化'
    };

    const systemPrompt = `你是一个专业的组织管理咨询顾问。你的任务是分析用户输入的这句话，判断它最可能属于以下哪个管理维度：

维度列表：
${Object.entries(dimensionDescriptions).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

判断规则：
1. 如果用户的话明确提到某个维度的关键词，选择该维度
2. 如果用户的话涉及多个维度，选择最突出或最相关的那个
3. 如果用户只是打招呼、闲聊、感谢、或与企业管理无关的话题，返回 null
4. 必须从以下维度中选择：strategy, structure, performance, compensation, talent
5. 只输出一个维度单词（如：strategy），不要输出任何其他文字`;

    const userPrompt = `分析这句话："${message}"\n\n它属于哪个维度？只输出维度单词，如果无关紧要输出 null。`;

    const response = await client.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.1, // 低温，确保输出稳定
      maxTokens: 10,
    });

    const detectedDimension = response.choices[0].message.content.trim().toLowerCase();

    console.log('🎯 [Intent Detection] Raw result:', detectedDimension);

    // 验证返回的维度是否有效
    const validDimensions: Dimension[] = ['strategy', 'structure', 'performance', 'compensation', 'talent'];

    if (detectedDimension === 'null' || detectedDimension === '' || !validDimensions.includes(detectedDimension as Dimension)) {
      console.log('⚠️ [Intent Detection] No dimension detected or invalid result');
      return null;
    }

    console.log(`✅ [Intent Detection] Detected dimension: ${detectedDimension}`);
    return detectedDimension as Dimension;

  } catch (error) {
    console.error('❌ [Intent Detection] Failed:', error);
    // 失败时不影响对话，返回 null 保持当前维度
    return null;
  }
}

// ============================================
// 1. 前台对话 Action (流式输出)
// ============================================

/**
 * 流式对话 Server Action
 *
 * 功能：
 * 0. 意图识别 - 检测用户想讨论哪个维度
 * 1. 检索 RAG 知识库
 * 2. 组装 Prompt（含上下文和诊断进度）
 * 3. 调用 AI 生成回复（流式）
 * 4. 保存对话到数据库
 *
 * 使用方式（前端）：
 * ```typescript
 * const stream = await streamChat({ sessionId: 'xxx', message: '用户问题' });
 *
 * for await (const chunk of stream) {
 *   appendToChat(chunk);
 * }
 * ```
 */
export async function streamChat(
  options: StreamChatOptions
): Promise<AsyncGenerator<string, void, unknown>> {
  const { sessionId, message, temperature = 0.3, useDify = false, knowledgeBase = 'managconsult' } = options;

  try {
    // 1. 获取会话信息
    const supabase = await createServerClient();
    const { data: session, error: sessionError } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // 2. 🎯 意图识别 - 检测用户想讨论哪个维度
    const detectedDimension = await detectUserIntent(message, session.current_stage);
    let currentStage = session.current_stage;

    // 3. 如果检测到新维度，更新数据库
    if (detectedDimension && detectedDimension !== currentStage) {
      console.log(`🔄 [Intent Detection] Switching from ${currentStage} to ${detectedDimension}`);

      const { error: updateError } = await supabase
        .from('diagnosis_sessions')
        .update({ current_stage: detectedDimension })
        .eq('id', sessionId)
        .select()
        .single();

      if (!updateError) {
        console.log('✅ [Intent Detection] Stage updated successfully');
        currentStage = detectedDimension;
      } else {
        console.error('❌ [Intent Detection] Failed to update stage:', updateError);
        // 更新失败，保持当前维度
      }
    }

    // 4. 保存用户消息
    await supabase.from('chat_logs').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
      metadata: {
        stage: session.current_stage,
        timestamp: new Date().toISOString(),
      },
    });

    // 5. 调用 Python 后端 API（Dify 或 LightRAG）
    let fullAIResponse = '';

    // 创建异步生成器
    async function* generateStream(): AsyncGenerator<string, void, unknown> {
      const ragApiUrl = process.env.RAG_API_URL || 'http://127.0.0.1:8000';

      // 尝试使用RAG后端（Dify或LightRAG）
      let ragSuccess = false;

      // 1. 尝试Dify API
      if (useDify) {
        console.log('🤖 [Dify API] Calling Dify knowledge base...');
        try {
          const response = await fetch(`${ragApiUrl}/dify/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message, knowledge_base: knowledgeBase }),
          });

          if (response.ok) {
            const data = await response.json();
            fullAIResponse = data.answer || '抱歉，我暂时无法回答这个问题。';
            ragSuccess = true;
            console.log('✅ [Dify API] Response received');

            // 流式输出
            const chunkSize = 10;
            for (let i = 0; i < fullAIResponse.length; i += chunkSize) {
              yield fullAIResponse.slice(i, i + chunkSize);
              await new Promise(resolve => setTimeout(resolve, 20));
            }

            // 保存到数据库
            await supabase.from('chat_logs').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullAIResponse,
              metadata: { stage: session.current_stage, timestamp: new Date().toISOString(), use_dify: true, knowledgeBase },
            });

            // 异步触发数据提取
            extractInsights(sessionId).catch(err => console.error('Background extraction failed:', err));
            detectAndSwitchDimension(sessionId, message, fullAIResponse).catch(err => console.error('Dimension detection failed:', err));
            return;
          } else {
            console.warn(`⚠️ [Dify API] Not available (${response.status}), trying next option...`);
          }
        } catch (err) {
          console.warn('⚠️ [Dify API] Request failed, trying next option...');
        }
      }

      // 2. 尝试LightRAG API
      if (!ragSuccess) {
        console.log('🤖 [LightRAG API] Calling Python RAG backend...');
        try {
          const response = await fetch(`${ragApiUrl}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message, mode: 'hybrid' }),
          });

          if (response.ok) {
            const data = await response.json();
            fullAIResponse = data.answer || '抱歉，我暂时无法回答这个问题。';
            ragSuccess = true;
            console.log('✅ [LightRAG API] Response received');

            // 流式输出
            const chunkSize = 10;
            for (let i = 0; i < fullAIResponse.length; i += chunkSize) {
              yield fullAIResponse.slice(i, i + chunkSize);
              await new Promise(resolve => setTimeout(resolve, 20));
            }

            // 保存到数据库
            await supabase.from('chat_logs').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullAIResponse,
              metadata: { stage: session.current_stage, timestamp: new Date().toISOString(), rag_context_used: true },
            });

            // 异步触发数据提取
            extractInsights(sessionId).catch(err => console.error('Background extraction failed:', err));
            detectAndSwitchDimension(sessionId, message, fullAIResponse).catch(err => console.error('Dimension detection failed:', err));
            return;
          } else {
            console.warn(`⚠️ [LightRAG API] Not available (${response.status}), falling back to Zhipu AI...`);
          }
        } catch (err) {
          console.warn('⚠️ [LightRAG API] Request failed, falling back to Zhipu AI...');
        }
      }

      // 3. 降级到本地Zhipu AI
      console.log('🤖 [Zhipu AI] Using local AI model...');
      const systemPrompt = buildSystemPrompt(currentStage, '');
      const aiStream = streamChatWithAI(message, systemPrompt, { temperature });

      for await (const chunk of aiStream) {
        fullAIResponse += chunk;
        yield chunk;
      }

      // 保存降级后的回复
      await supabase.from('chat_logs').insert({
        session_id: sessionId,
        role: 'assistant',
        content: fullAIResponse,
        metadata: {
          stage: session.current_stage,
          timestamp: new Date().toISOString(),
          rag_context_used: false, // 标记未使用 RAG
        },
      });

      // 异步触发数据提取
      extractInsights(sessionId).catch(err => console.error('Background extraction failed:', err));
      detectAndSwitchDimension(sessionId, message, fullAIResponse).catch(err => console.error('Dimension detection failed:', err));
    }

    return generateStream();

  } catch (error) {
    console.error('streamChat error:', error);
    throw error;
  }
}

/**
 * 构建 System Prompt
 */
function buildSystemPrompt(
  currentStage: string,
  ragContext: string
): string {
  const stageNames: Record<string, string> = {
    strategy: '战略',
    structure: '组织结构',
    performance: '绩效管理',
    compensation: '薪酬激励',
    talent: '人才发展',
  };

  const stageName = stageNames[currentStage] || currentStage;

  return `你是一位资深的组织管理咨询专家，专注于${stageName}领域。

## 🎯 诊断任务说明

你正在为用户进行**五维组织诊断**，需要依次评估：
1. 战略（Strategy）- 战略目标、市场定位、竞争优势
2. 结构（Structure）- 组织架构、决策流程、跨部门协作
3. 绩效（Performance）- KPI设定、绩效考核、激励机制
4. 薪酬（Compensation）- 薪酬体系、公平性、激励效果
5. 人才（Talent）- 招聘、培训、人才梯队、员工满意度

**当前正在评估**: ${stageName}维度

## ⚠️ 重要约束

1. **深度分析原则**:
   - 每个维度至少需要3-4轮对话才能充分评估
   - 不要急于给出结论，需要通过提问深入了解用户情况
   - 只在有充分信息支撑的情况下才给出评估

2. **禁止快速评分**:
   - 绝对禁止在对话初期就给出评分或排名
   - 只在完成该维度的充分对话（至少3轮）后，后台会自动提取评分
   - 你的回复不需要包含分数，专注于分析和建议

3. **引导式对话**:
   - 通过提问逐步深入了解用户组织情况
   - 每次回复末尾必须提出1-2个后续问题
   - 问题要具体、有针对性，避免泛泛而谈

## 📋 必须遵循的回答格式

### 【深入分析】
- 分析用户描述的现象背后可能存在的根本原因
- 识别2-3个关键影响因素
- 说明这些因素如何相互影响

### 【诊断提问】
- 提出2-3个具体问题来深入了解用户情况
- 问题要针对${stageName}维度的关键方面
- 避免是/否问题，使用开放式问题

### 【专业建议】
提供2-3个针对性的建议方向（而非完整解决方案）：
1. **[方向名称]** - 简要说明
   - **关键考虑点**: 这个方向需要重点注意什么
   - **适用场景**: 什么情况下选择这个方向

### 【下一步】
- 引导用户回答你的诊断提问
- 或者根据用户之前的回答，提出更深入的探索问题

## 示例对话风格

❌ **不要这样（太快下结论）**:
"您的绩效管理有问题，建议建立KPI体系。建立步骤如下..."

✅ **应该这样（逐步深入了解）**:
"【深入分析】
您提到的绩效流于形式，这通常涉及几个层面：指标设计是否科学、考核过程是否规范、结果应用是否有效...

【诊断提问】
1. 您目前的KPI是如何设定的？是从战略目标分解而来，还是直接沿用部门职责？
2. 绩效考核的频率是多久？考核结果主要用于什么用途？
3. 您觉得员工对当前绩效体系的接受度如何？有没有收到过反馈？

【专业建议】
1. **[重新审视指标体系]** - 如果KPI与战略脱节，需要从源头梳理
2. **[优化考核过程]** - 如果过程流于形式，可能需要加强过程管理

【下一步】
能否先聊聊您当前的KPI是如何设定的？这样我能更好地理解您的情况。"

## 回复要求

- **长度**: 每次回复200-400字，不要太长
- **语调**: 专业、客观、有同理心
- **结构**: 严格遵循上述格式
- **禁忌**:
  - 不要说"我觉得"、"可能是"等不确定的表述
  - 不要在信息不足时给出具体方案
  - 不要过早进行跨维度比较
  - 绝对不要主动提及评分或排名

记住：你的目标是**深入理解用户的问题**，而非快速给出答案。`;
}

// ============================================
// 2. 后台提取 Action (异步调用)
// ============================================

/**
 * 提取结构化洞察（后台异步执行）
 *
 * 功能：
 * 1. 获取对话历史
 * 2. 调用 AI 提取结构化数据（JSON）
 * 3. 更新 diagnosis_sessions 的 data_{module} 字段
 *
 * 注意：此函数设计为后台异步执行，失败不影响主对话流
 */
export async function extractInsights(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  console.log('🔄 [extractInsights] Starting for session:', sessionId);

  try {
    // 1. 获取会话信息和对话历史
    const supabase = await createServerClient();
    const { data: session, error: sessionError } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('❌ [extractInsights] Session not found:', sessionError);
      return { success: false, error: 'Session not found' };
    }

    console.log('✅ [extractInsights] Session found, current_stage:', session.current_stage);

    const { data: messages, error: messagesError } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('❌ [extractInsights] Failed to fetch messages:', messagesError);
      return { success: false, error: 'Failed to fetch messages' };
    }

    if (!messages || messages.length === 0) {
      console.warn('⚠️ [extractInsights] No messages found, skipping extraction');
      return { success: false, error: 'No messages to extract from' };
    }

    console.log(`✅ [extractInsights] Found ${messages.length} messages`);
    console.log('📝 [extractInsights] Messages:', messages.map(m => ({ role: m.role, content: m.content.slice(0, 50) + '...' })));
    console.log('📝 [extractInsights] Messages:', messages.map(m => ({ role: m.role, content: m.content.slice(0, 50) + '...' })));

    // 2. 组装对话历史
    const conversation = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    // 3. 构建 System Prompt（提取模式）
    const currentStage = session.current_stage;
    const stageNames: Record<string, string> = {
      strategy: '战略',
      structure: '组织结构',
      performance: '绩效管理',
      compensation: '薪酬激励',
      talent: '人才发展',
    };
    const stageName = stageNames[currentStage] || currentStage;

    const systemPrompt = `你是一位组织管理数据分析专家。你的任务是从对话中提取结构化数据。

## 当前分析维度：${stageName}

## 任务说明

请分析以下对话记录，提取关于"${stageName}"的结构化洞察。

## 输出格式（严格遵循JSON）

请输出以下JSON格式（不要包含其他文字）：

\`\`\`json
{
  "score": <数字 0-100>,
  "tags": ["标签1", "标签2", "标签3"],
  "key_issues": ["问题1", "问题2"],
  "summary": "<简短总结>",
  "recommendations": ["建议1", "建议2"]
}
\`\`\`

## 评分标准

- **score (0-100)**:
  - 90-100: 优秀（行业领先水平）
  - 70-89: 良好（高于平均水平）
  - 50-69: 一般（符合基本标准）
  - 30-49: 较差（存在明显问题）
  - 0-29: 严重（亟需改进）

- **tags**: 提取 3-5 个关键词或标签
- **key_issues**: 列出 2-4 个关键问题
- **summary**: 用一句话概括现状（50字以内）
- **recommendations**: 提出 2-3 个改进建议

## 注意事项

1. 严格输出 JSON 格式，不要包含任何解释性文字
2. 如果对话信息不足，给出保守估计
3. 评分要有依据，体现专业判断
4. 标签和问题要具体，避免空泛`;

    // 4. 调用 AI 提取 JSON
    console.log('🤖 [extractInsights] Calling AI to extract insights...');

    let insights: ExtractedInsights;
    try {
      insights = await extractJSONWithAI<ExtractedInsights>(
        conversation,
        systemPrompt,
        { temperature: 0.3 }
      );
      console.log('📊 [extractInsights] AI Response:', insights);
    } catch (aiError) {
      console.error('❌ [extractInsights] AI extraction failed:', aiError);
      // 返回默认结构，避免程序崩溃
      insights = {
        score: 50,
        tags: ['数据提取失败'],
        key_issues: ['AI 服务暂时不可用'],
        summary: '请稍后重试',
        recommendations: ['建议重新发送消息']
      };
    }

    // 5. 验证提取的数据
    if (!insights || typeof insights.score !== 'number') {
      console.error('❌ [extractInsights] Invalid insights extracted:', insights);
      return { success: false, error: 'Invalid extraction format' };
    }

    // 6. 更新数据库
    const fieldName = `data_${currentStage}` as const;
    const updateData = {
      [fieldName]: insights,
    };

    console.log(`💾 [extractInsights] Updating database field: ${fieldName}`);
    console.log('📝 [extractInsights] Data to update:', updateData);

    const { data: updatedData, error: updateError } = await supabase
      .from('diagnosis_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [extractInsights] Failed to update session:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ [extractInsights] Extraction success:', updatedData);
    console.log(`✅ [extractInsights] Successfully extracted and saved insights for ${currentStage}:`, insights);
    return { success: true };

  } catch (error) {
    console.error('extractInsights error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// 3. 辅助函数
// ============================================

/**
 * 获取会话的完整对话历史
 */
export async function getChatHistory(sessionId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * 手动触发数据提取（用于测试或按需提取）
 */
export async function triggerExtraction(
  sessionId: string
): Promise<{ success: boolean; insights?: ExtractedInsights; error?: string }> {
  try {
    // 先调用提取
    const result = await extractInsights(sessionId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 获取更新后的会话数据
    const supabase = await createServerClient();
    const { data: session } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    // 提取当前阶段的数据
    const currentStage = session?.current_stage;
    const fieldName = `data_${currentStage}` as const;
    const insights = session?.[fieldName];

    return { success: true, insights: insights as ExtractedInsights };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 完成当前阶段并进入下一阶段
 */
export async function completeCurrentStage(sessionId: string) {
  try {
    const supabase = await createServerClient();
    const { data: session } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // 阶段顺序
    const stages = ['strategy', 'structure', 'performance', 'compensation', 'talent'] as const;
    const currentIndex = stages.indexOf(session.current_stage as any);

    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      // 已经是最后阶段或无效阶段
      return { success: false, error: 'No next stage' };
    }

    const nextStage = stages[currentIndex + 1];

    // 更新到下一阶段
    const { error } = await supabase
      .from('diagnosis_sessions')
      .update({ current_stage: nextStage })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    return { success: true, nextStage };

  } catch (error) {
    console.error('completeCurrentStage error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// 3. 智能维度切换
// ============================================

/**
 * 检测对话内容并自动切换维度
 */
async function detectAndSwitchDimension(
  sessionId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { data: session } = await supabase
      .from('diagnosis_sessions')
      .select('current_stage, data_strategy, data_structure, data_performance, data_compensation, data_talent')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    const currentStage = session.current_stage;
    const currentData = (session as any)[`data_${currentStage}`];

    // 检查当前维度是否有足够的对话和数据
    const messageCount = await getMessageCount(sessionId);
    const hasScore = currentData?.score > 0;

    console.log(`🔍 [Dimension Check] Stage: ${currentStage}, Messages: ${messageCount}, Has Score: ${hasScore}`);

    // 切换条件：
    // 1. 至少有 4 轮对话（2个用户消息 + 2个AI回复）
    // 2. 当前维度已提取到分数
    if (messageCount >= 4 && hasScore) {
      const stages = ['strategy', 'structure', 'performance', 'compensation', 'talent'];
      const currentIndex = stages.indexOf(currentStage);

      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        console.log(`✨ [Dimension Switch] Moving from ${currentStage} to ${nextStage}`);

        await supabase
          .from('diagnosis_sessions')
          .update({ current_stage: nextStage })
          .eq('id', sessionId);

        console.log('✅ [Dimension Switch] Stage updated successfully');
      } else {
        console.log('🎉 [Dimension Switch] All dimensions completed!');
      }
    }
  } catch (error) {
    console.error('❌ [Dimension Switch] Error:', error);
  }
}

/**
 * 获取会话的用户消息数量
 */
async function getMessageCount(sessionId: string): Promise<number> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('chat_logs')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('role', 'user');

  return error ? 0 : (data?.length || 0);
}
