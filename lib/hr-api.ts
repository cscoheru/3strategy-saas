/**
 * HR Microservices API Client
 *
 * 连接三个HR微服务：
 * - Recruitment (8000): 简历解析、候选人匹配
 * - Performance (8001): OKR、KPI、绩效评估
 * - Compensation (8002): 宽带薪酬、个税计算
 */

const API_BASE_URLS = {
  recruitment: process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://localhost:8000',
  performance: process.env.NEXT_PUBLIC_PERFORMANCE_API || 'http://localhost:8001',
  compensation: process.env.NEXT_PUBLIC_COMPENSATION_API || 'http://localhost:8002',
}

// ============ Recruitment API ============

export interface ParseResumeRequest {
  file: File
}

export interface ParsedResume {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: Array<{
    company: string
    title: string
    duration: string
    description?: string
  }>
  education: Array<{
    school: string
    degree: string
    major?: string
    graduation_year?: string
  }>
  links: {
    github?: string
    linkedin?: string
    portfolio?: string
  }
  raw_text?: string
}

export interface MatchRequest {
  resume: ParsedResume
  job_description: {
    title: string
    required_skills: string[]
    required_experience?: {
      years?: number
      domain?: string
    }
    required_education?: string[]
    description?: string
  }
}

export interface MatchResult {
  total_score: number
  skill_score: number
  experience_score: number
  education_score: number
  matched_skills: string[]
  missing_skills: string[]
  recommendations: string[]
}

export const recruitmentApi = {
  // 解析简历
  async parseResume(file: File): Promise<{ success: boolean; data: ParsedResume; error?: string }> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URLS.recruitment}/api/v1/parse`, {
        method: 'POST',
        body: formData,
      })
      return await response.json()
    } catch (error) {
      console.error('Parse resume error:', error)
      return { success: false, data: null as any, error: '连接解析服务失败' }
    }
  },

  // 候选人匹配
  async matchCandidate(request: MatchRequest): Promise<MatchResult> {
    const response = await fetch(`${API_BASE_URLS.recruitment}/api/v1/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return await response.json()
  },
}

// ============ Performance API ============

export interface KeyResult {
  id?: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  weight: number
  progress?: number
}

export interface Objective {
  id?: string
  title: string
  description?: string
  employeeId: string
  cycleId: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  keyResults: KeyResult[]
  overallProgress: number
  overallScore: number
}

export interface KPI {
  id?: string
  name: string
  category: string
  description?: string
  target_value: number
  actual_value: number
  unit: string
  weight: number
  achieved: boolean
}

export const performanceApi = {
  // 创建目标
  async createObjective(objective: Objective): Promise<Objective> {
    // 转换camelCase到snake_case用于API
    const apiData = {
      title: objective.title,
      description: objective.description,
      employee_id: objective.employeeId,
      cycle_id: objective.cycleId,
      status: objective.status,
      key_results: objective.keyResults.map(kr => ({
        title: kr.title,
        description: kr.description,
        target_value: kr.target_value,
        current_value: kr.current_value,
        unit: kr.unit,
        weight: kr.weight,
      })),
    }

    const response = await fetch(`${API_BASE_URLS.performance}/api/v1/objectives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    })
    const result = await response.json()

    // 转换snake_case到camelCase
    return {
      ...result.data,
      employeeId: result.data.employee_id,
      cycleId: result.data.cycle_id,
      keyResults: result.data.key_results || [],
      overallProgress: result.data.overall_progress || 0,
      overallScore: result.data.overall_score || 0,
    } as Objective
  },

  // 获取员工目标
  async getEmployeeObjectives(employeeId: string, cycleId?: string): Promise<Objective[]> {
    const params = new URLSearchParams()
    if (cycleId) params.append('cycleId', cycleId)

    const response = await fetch(
      `${API_BASE_URLS.performance}/api/v1/objectives/${employeeId}?${params}`
    )
    const result = await response.json()

    // 转换snake_case到camelCase
    return (result.data || []).map((obj: any) => ({
      ...obj,
      employeeId: obj.employee_id,
      cycleId: obj.cycle_id,
      keyResults: obj.key_results || [],
      overallProgress: obj.overall_progress || 0,
      overallScore: obj.overall_score || 0,
    })) as Objective[]
  },

  // 更新目标进度
  async updateObjectiveProgress(
    objectiveId: string,
    progressUpdates: Array<{ kr_id: string; current_value: number }>
  ): Promise<void> {
    await fetch(`${API_BASE_URLS.performance}/api/v1/objectives/${objectiveId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressUpdates),
    })
  },

  // 创建KPI
  async createKPI(kpi: KPI): Promise<KPI> {
    const response = await fetch(`${API_BASE_URLS.performance}/api/v1/kpis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kpi),
    })
    const result = await response.json()
    return result.data
  },

  // 获取员工KPI
  async getEmployeeKPIs(employeeId: string): Promise<KPI[]> {
    const response = await fetch(`${API_BASE_URLS.performance}/api/v1/kpis/${employeeId}`)
    const result = await response.json()
    return result.data || []
  },
}

// ============ Compensation API ============

export interface TaxCalculation {
  gross_salary: number
  social_insurance: number
  housing_fund: number
  taxable_income: number
  tax: number
  net_salary: number
  effective_rate: number
}

export interface SalaryBand {
  grade: string
  min_salary: number
  mid_salary: number
  max_salary: number
  overlap_percent: number
}

export interface SalaryAnalysis {
  salary: number
  grade: string
  band: SalaryBand
  analysis: {
    position_in_band: number
    quartile: string
    recommendation: string
  }
}

export const compensationApi = {
  // 计算个税
  async calculateTax(grossSalary: number): Promise<TaxCalculation> {
    const response = await fetch(`${API_BASE_URLS.compensation}/api/v1/calculate-tax`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gross_salary: grossSalary }),
    })
    const result = await response.json()
    return result.data
  },

  // 获取宽带薪酬体系
  async getBroadbandBands(): Promise<SalaryBand[]> {
    const response = await fetch(`${API_BASE_URLS.compensation}/api/v1/broadband/bands`)
    const result = await response.json()
    return result.data || []
  },

  // 分析薪资位置
  async analyzeSalaryPosition(salary: number): Promise<SalaryAnalysis> {
    const response = await fetch(`${API_BASE_URLS.compensation}/api/v1/broadband/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gross_salary: salary }),
    })
    const result = await response.json()
    return result.data
  },

  // 获取税率表
  async getTaxBrackets(): Promise<any> {
    const response = await fetch(`${API_BASE_URLS.compensation}/api/v1/tax-brackets`)
    const result = await response.json()
    return result.data
  },
}

// ============ Health Check ============

export async function checkServicesHealth() {
  const services = await Promise.allSettled([
    fetch(`${API_BASE_URLS.recruitment}/health`).then(r => r.json()),
    fetch(`${API_BASE_URLS.performance}/health`).then(r => r.json()),
    fetch(`${API_BASE_URLS.compensation}/health`).then(r => r.json()),
  ])

  return {
    recruitment: services[0].status === 'fulfilled' ? services[0].value : null,
    performance: services[1].status === 'fulfilled' ? services[1].value : null,
    compensation: services[2].status === 'fulfilled' ? services[2].value : null,
  }
}
