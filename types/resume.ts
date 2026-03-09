// HR Services Type Definitions

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

export interface MatchResult {
  total_score: number
  skill_score: number
  experience_score: number
  education_score: number
  matched_skills: string[]
  missing_skills: string[]
  recommendations: string[]
}

export interface JobDescription {
  title: string
  required_skills: string[]
  required_experience?: {
    years?: number
    domain?: string
  }
  required_education?: string[]
  description?: string
}
