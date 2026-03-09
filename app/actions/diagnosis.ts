/**
 * Diagnosis Session Server Actions
 * 用于管理诊断会话的 Server Actions
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { DiagnosisSession, DiagnosisSessionInsert } from '@/types/supabase';

/**
 * 创建新的诊断会话（带重试机制）
 */
async function createSessionWithRetry(supabase: any, newSession: DiagnosisSessionInsert, retryCount = 0) {
  const MAX_RETRIES = 1;
  const TIMEOUT_MS = 8000; // Increased from 3s to 8s for better reliability

  console.log(`🔄 [CreateSession] Attempt ${retryCount + 1}/${MAX_RETRIES + 1} with ${TIMEOUT_MS}ms timeout...`);

  try {

    // 创建带超时的 Promise
    const insertPromise = supabase
      .from('diagnosis_sessions')
      .insert(newSession)
      .select()
      .single();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Insert timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
    });

    const result = await Promise.race([insertPromise, timeoutPromise]) as any;

    if (result.error) {
      console.error('❌ [CreateSession] Insert failed:', result.error);

      // 如果有重试次数，且是网络超时错误，则重试
      if (retryCount < MAX_RETRIES &&
          (result.error.message?.includes('timeout') ||
           result.error.message?.includes('fetch failed') ||
           result.error.code === 'NETWORK_ERROR')) {
        console.log(`🔄 [CreateSession] Retrying after timeout...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
        return createSessionWithRetry(supabase, newSession, retryCount + 1);
      }

      return {
        data: null,
        error: {
          message: result.error.message || 'Unknown error',
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code,
        }
      };
    }

    console.log('✅ [CreateSession] Session created successfully:', result.data?.id);
    return result;

  } catch (error: any) {
    console.error('❌ [CreateSession] Exception:', error.message);

    // 如果是超时错误，且有重试次数，则重试
    if (retryCount < MAX_RETRIES && error.message?.includes('timeout')) {
      console.log(`🔄 [CreateSession] Retrying after exception...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return createSessionWithRetry(supabase, newSession, retryCount + 1);
    }

    return {
      data: null,
      error: {
        message: error?.message || 'Unknown error',
        name: error?.name,
        code: error?.code,
      }
    };
  }
}

export async function createDiagnosisSession() {
  try {
    console.log('🔐 [CreateSession] Starting session creation...');
    console.log('🔐 [CreateSession] Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    const supabase = await createServerClient();
    console.log('✅ [CreateSession] Server client created');

    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ [CreateSession] Auth check complete, user:', user?.id || 'guest');

    // 使用已登录用户，或访客模式（user_id = null）
    const userId = user?.id || null;

    console.log('✅ [CreateSession] Creating diagnosis session for user:', userId || 'guest');

    const newSession: DiagnosisSessionInsert = {
      user_id: userId, // 允许 null（访客模式）
      status: 'active',
      current_stage: 'strategy',
      data_strategy: {},
      data_structure: {},
      data_performance: {},
      data_compensation: {},
      data_talent: {},
      total_score: 0,
      summary_report: null,
      report_content: null,
    };

    // 使用带重试的创建函数
    console.log('🔄 [CreateSession] Calling createSessionWithRetry...');
    const result = await createSessionWithRetry(supabase, newSession);
    console.log('📤 [CreateSession] Returning result:', { success: !!result.data, hasError: !!result.error });
    return result;

  } catch (error: any) {
    console.error('❌ [CreateSession] Unexpected error:', error);
    console.error('❌ [CreateSession] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.split('\n')?.[0],
      toString: String(error),
    });
    return {
      data: null,
      error: {
        message: error?.message || 'Unknown error',
        name: error?.name,
        details: error?.details,
      }
    };
  }
}

/**
 * 获取用户的所有诊断会话
 */
export async function getUserDiagnosisSessions() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('diagnosis_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
}

/**
 * 获取单个诊断会话（包含聊天记录）
 */
export async function getDiagnosisSessionWithMessages(sessionId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 获取会话信息
  const { data: session, error: sessionError } = await supabase
    .from('diagnosis_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError) {
    return { data: null, error: sessionError };
  }

  // 获取聊天记录
  const { data: messages, error: messagesError } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    return { data: null, error: messagesError };
  }

  return {
    data: {
      session,
      messages: messages || [],
    },
    error: null,
  };
}

/**
 * 更新诊断会话的当前阶段
 */
export async function updateSessionStage(sessionId: string, stage: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent') {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('diagnosis_sessions')
    .update({ current_stage: stage })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();
}

/**
 * 更新会话的维度数据
 */
export async function updateDimensionData(
  sessionId: string,
  dimension: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent',
  data: any
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const fieldName = `data_${dimension}` as const;

  return await supabase
    .from('diagnosis_sessions')
    .update({ [fieldName]: data })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();
}

/**
 * 完成诊断会话并生成总结报告
 */
export async function completeDiagnosisSession(sessionId: string, summaryReport: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 计算总分（如果尚未计算）
  const { data: session } = await supabase
    .from('diagnosis_sessions')
    .select('data_strategy, data_structure, data_performance, data_compensation, data_talent')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return { data: null, error: new Error('Session not found') };
  }

  const calculateScore = (data: any) => data?.score || 0;
  const totalScore = Math.round(
    (calculateScore(session.data_strategy) +
     calculateScore(session.data_structure) +
     calculateScore(session.data_performance) +
     calculateScore(session.data_compensation) +
     calculateScore(session.data_talent)) / 5
  );

  return await supabase
    .from('diagnosis_sessions')
    .update({
      status: 'completed',
      summary_report: summaryReport,
      total_score: totalScore,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();
}

/**
 * 删除诊断会话（级联删除相关聊天记录）
 */
export async function deleteDiagnosisSession(sessionId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('diagnosis_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);
}
