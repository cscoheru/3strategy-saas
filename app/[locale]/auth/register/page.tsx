'use client'

import { useState, useTransition, useEffect } from 'react'
import { signUp } from '@/app/actions/auth'
import { Sparkles, Mail, Lock, User, AlertCircle, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)

  // 检查冷却时间
  useEffect(() => {
    if (lastAttemptTime > 0) {
      const checkCooldown = setInterval(() => {
        const elapsed = Date.now() - lastAttemptTime
        const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000)) // 60秒冷却
        setCooldownRemaining(remaining)

        if (remaining <= 0) {
          clearInterval(checkCooldown)
          setLastAttemptTime(0)
        }
      }, 1000)

      return () => clearInterval(checkCooldown)
    }
  }, [lastAttemptTime])

  async function handleSubmit(formData: FormData) {
    // 检查冷却时间
    if (cooldownRemaining > 0) {
      setError(`请等待 ${cooldownRemaining} 秒后再试，或使用其他邮箱地址。`)
      return
    }

    setError('')
    setLastAttemptTime(Date.now())

    startTransition(async () => {
      const result = await signUp(formData)

      // 如果注册失败，重置冷却时间（非速率限制错误）
      if (result?.error) {
        if (!result.error.includes('过于频繁') && !result.error.includes('rate limit')) {
          setLastAttemptTime(0)
          setCooldownRemaining(0)
        }
        setError(result.error)
      }
      // 成功后会自动redirect
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/zh" className="inline-flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">3Strategy</h1>
              <p className="text-sm text-muted-foreground">智能咨询工具平台</p>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-foreground mt-6">创建账户</h2>
          <p className="text-muted-foreground mt-2">开始您的组织绩效改进之旅</p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border p-8">
          <form action={handleSubmit} className="space-y-5">
            {/* Cooldown Warning */}
            {cooldownRemaining > 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400">
                  <p className="font-medium">请等待 {cooldownRemaining} 秒后再试</p>
                  <p className="text-xs mt-1">为保护账户安全，注册请求有频率限制</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="张三"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="至少6个字符"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                密码至少需要6个字符
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-border"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                我同意{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  服务条款
                </Link>{' '}
                和{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  隐私政策
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || cooldownRemaining > 0}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : cooldownRemaining > 0 ? (
                <>
                  <Clock className="h-4 w-4" />
                  请等待 {cooldownRemaining} 秒
                </>
              ) : (
                '创建账户'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-muted-foreground">
                已有账户？
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="login"
            className="w-full flex items-center justify-center gap-2 border-2 border-border py-3 px-4 rounded-xl font-medium hover:bg-secondary transition-all"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}
