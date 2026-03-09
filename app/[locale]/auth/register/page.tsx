'use client'

import { useState } from 'react'
import { signUp } from '@/app/actions/auth'
import { Sparkles, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await signUp(formData)

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push('/auth/login?registered=true')
      }, 3000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border p-8">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">注册成功！</h2>
            <p className="text-muted-foreground mb-4">
              请检查您的邮箱，我们发送了一封验证邮件。验证后即可登录。
            </p>
            <p className="text-sm text-muted-foreground">
              正在跳转到登录页面...
            </p>
          </div>
        </div>
      </div>
    )
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '创建账户'}
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
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 border-2 border-border py-3 px-4 rounded-xl font-medium hover:bg-secondary transition-all"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}
