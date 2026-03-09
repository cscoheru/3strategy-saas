'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

// 超时保护函数
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

/**
 * 用户注册
 */
export async function signUp(formData: FormData) {
  console.log('[Auth] Starting signup...')

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // 验证输入
  if (!email || !password || !name) {
    console.log('[Auth] Validation failed: missing fields')
    return { error: '请填写所有必填项' }
  }

  if (password.length < 6) {
    console.log('[Auth] Validation failed: password too short')
    return { error: '密码至少需要6个字符' }
  }

  try {
    const supabase = await createServerClient()
    console.log('[Auth] Calling supabase.auth.signUp...')

    // 注册用户 - 添加 15 秒超时
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: undefined,
        },
      }),
      15000,
      '注册请求超时，请检查网络连接或稍后重试'
    )

    if (error) {
      console.error('[Auth] Signup error:', error)
      return { error: error.message }
    }

    console.log('[Auth] Signup successful:', data.user?.id)

    revalidatePath('/', 'layout')

    // 注册成功后自动登录 - 添加 10 秒超时
    console.log('[Auth] Attempting auto signin...')
    const { error: signInError } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      10000,
      '登录请求超时'
    )

    if (signInError) {
      console.error('[Auth] Auto signin error:', signInError)
      return {
        success: true,
        message: '注册成功！请登录。',
      }
    }

    console.log('[Auth] Auto signin successful, redirecting to dashboard')
    redirect('/zh/dashboard')
  } catch (error) {
    console.error('[Auth] Signup exception:', error)
    return { error: error instanceof Error ? error.message : '注册失败，请稍后重试' }
  }
}

/**
 * 用户登录
 */
export async function signIn(formData: FormData) {
  console.log('[Auth] Starting signin...')

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    console.log('[Auth] Validation failed: missing fields')
    return { error: '请填写邮箱和密码' }
  }

  try {
    const supabase = await createServerClient()
    console.log('[Auth] Calling supabase.auth.signInWithPassword...')

    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      10000,
      '登录请求超时，请检查网络连接'
    )

    if (error) {
      console.error('[Auth] Signin error:', error)
      return { error: error.message }
    }

    console.log('[Auth] Signin successful:', data.user?.id)

    revalidatePath('/', 'layout')
    redirect('/zh/dashboard')
  } catch (error) {
    console.error('[Auth] Signin exception:', error)
    return { error: error instanceof Error ? error.message : '登录失败，请稍后重试' }
  }
}

/**
 * 用户登出
 */
export async function signOut() {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Signout error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/zh')
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * 获取用户Profile
 */
export async function getUserProfile() {
  const supabase = await createServerClient()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
