'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

/**
 * 用户注册
 */
export async function signUp(formData: FormData) {
  const supabase = await createServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // 验证输入
  if (!email || !password || !name) {
    return { error: '请填写所有必填项' }
  }

  if (password.length < 6) {
    return { error: '密码至少需要6个字符' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { error: error.message }
  }

  // 创建用户Profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name: name,
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // 继续执行，因为auth已经创建成功
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: '注册成功！请检查邮箱验证您的账户。',
    user: data.user,
  }
}

/**
 * 用户登录
 */
export async function signIn(formData: FormData) {
  const supabase = await createServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '请填写邮箱和密码' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Signin error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/zh/dashboard')
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
