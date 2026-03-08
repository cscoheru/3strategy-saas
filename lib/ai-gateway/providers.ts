// AI Gateway - Provider Configuration
// Main model: Zhipu GLM-4.7 (low cost, proven effective)
// Fallback: DeepSeek, Claude, GPT-4o

export interface AIProvider {
  name: string;
  url: string;
  model: string;
  apiKey: string | undefined;
  maxTokens: number;
  temperature: number;
}

export const providers: Record<string, AIProvider> = {
  // Primary - Zhipu GLM-4.7
  zhipu: {
    name: 'Zhipu AI',
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-plus',  // Can also use glm-4-air for lower cost
    apiKey: process.env.ZHIPU_API_KEY,
    maxTokens: 4096,
    temperature: 0.7,
  },
  // Fallback 1 - DeepSeek
  deepseek: {
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY,
    maxTokens: 4096,
    temperature: 0.7,
  },
  // Fallback 2 - Anthropic
  anthropic: {
    name: 'Anthropic',
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 4096,
    temperature: 0.7,
  },
  // Fallback 3 - OpenAI
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4096,
    temperature: 0.7,
  },
};

// Fallback order
export const fallbackOrder = ['zhipu', 'deepseek', 'anthropic', 'openai'];

// Default provider
export const defaultProvider = 'zhipu';
