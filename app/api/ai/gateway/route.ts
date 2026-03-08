// AI Gateway API Route
// Unified interface for multiple AI providers
import { NextRequest } from 'next/server';
import { providers, fallbackOrder } from '@/lib/ai-gateway/providers';

export const runtime = 'edge';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GatewayRequest {
  messages: ChatMessage[];
  model?: 'zhipu' | 'deepseek' | 'anthropic' | 'openai';
  stream?: boolean;
}

// System prompt for HR consulting context
const SYSTEM_PROMPT = `你是 3Strategy 的 AI 助手，专注于人力资源管理和战略咨询领域。

你可以帮助用户：
- 战略解码和平衡计分卡 (BSC) 设计
- 绩效管理 (KPI/OKR) 建议和优化
- 薪酬宽带设计和套改计算
- 人才盘点和九宫格分析
- 简历匹配和招聘建议
- HR 数据分析和报告生成

请用专业、简洁的方式回答问题。如果需要更多上下文，请主动询问。`;

async function callZhipu(messages: ChatMessage[], stream: boolean) {
  const provider = providers.zhipu;
  if (!provider.apiKey) {
    throw new Error('Zhipu API key not configured');
  }

  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: provider.maxTokens,
      temperature: provider.temperature,
      stream,
    }),
  });

  if (!response.ok) {
    throw new Error(`Zhipu API error: ${response.status}`);
  }

  return response;
}

async function callDeepSeek(messages: ChatMessage[], stream: boolean) {
  const provider = providers.deepseek;
  if (!provider.apiKey) {
    throw new Error('DeepSeek API key not configured');
  }

  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: provider.maxTokens,
      temperature: provider.temperature,
      stream,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body: GatewayRequest = await request.json();
    const { messages, model = 'zhipu', stream = true } = body;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try primary provider first, then fallback
    const providerOrder = [model, ...fallbackOrder.filter(p => p !== model)];

    let lastError: Error | null = null;

    for (const providerName of providerOrder) {
      try {
        let response: Response;

        switch (providerName) {
          case 'zhipu':
            response = await callZhipu(messages, stream);
            break;
          case 'deepseek':
            response = await callDeepSeek(messages, stream);
            break;
          default:
            continue;
        }

        if (stream) {
          // Return streaming response
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } else {
          const data = await response.json();
          return Response.json(data);
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Provider ${providerName} failed:`, error);
        continue;
      }
    }

    // All providers failed
    return new Response(
      JSON.stringify({ error: 'All AI providers failed', details: lastError?.message }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Gateway error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
