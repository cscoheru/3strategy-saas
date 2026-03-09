'use client'

import { useEffect, useState } from 'react'
import { Sparkles, User, Settings, LogOut, Target, DollarSign, Users, BarChart3 } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = (await import('@/lib/supabase/client-singleton')).getSupabaseClient()

        // 获取当前用户
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }

        setUser(currentUser)

        // 获取用户Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        setProfile(profileData)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  async function handleSignOut() {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-6">
          <Link href="/zh" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">3Strategy</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/zh/dashboard/settings" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-6 lg:py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            欢迎，{profile?.name || user?.email?.split('@')[0]}！
          </h1>
          <p className="text-muted-foreground mt-2">
            开始您的组织绩效改进之旅
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">诊断会话</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">生成的OKR</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">薪酬方案</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">招聘需求</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/zh/tools/performance-improvement" className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
              <Target className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-foreground">绩效改进</p>
                <p className="text-sm text-muted-foreground">OKR + KPI 管理</p>
              </div>
            </Link>

            <Link href="/zh/tools/compensation-reform" className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-foreground">薪酬改革</p>
                <p className="text-sm text-muted-foreground">薪酬包设计</p>
              </div>
            </Link>

            <Link href="/zh/tools/ai-recruitment" className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-foreground">AI招聘</p>
                <p className="text-sm text-muted-foreground">智能人才匹配</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
