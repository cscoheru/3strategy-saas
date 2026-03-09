# AI Resume Service Integration Plan

## 📋 Project Overview

**目标**: 将开源AI简历解析服务集成到Portal，提供智能简历筛选功能

**技术栈**:
- Frontend: Next.js 16 + React 19 + TypeScript + shadcn/ui
- AI Service: FastAPI + LangChain + Gemini (OpenRouter)
- Database: Supabase (PostgreSQL)
- File Storage: Supabase Storage

**核心功能**:
1. 简历解析 (PDF/DOCX → 结构化数据)
2. 技能提取与匹配
3. 候选人评分与排序
4. AI辅助筛选面试

---

## 🎯 成功标准

- [ ] 简历解析准确率 > 85%
- [ ] 技能匹配F1 score > 0.8
- [ ] API响应时间 < 5秒 (单简历)
- [ ] 支持中英文简历
- [ ] Portal集成无缝体验

---

## 📊 Phase 0: 需求确认与技术调研

### 0.1 需求文档
- [ ] 业务需求确认
  - 简历格式支持 (PDF, DOCX, TXT?)
  - 解析字段要求 (姓名、邮箱、电话、技能、经验、教育)
  - 匹配算法需求 (技能匹配、经验匹配、软技能?)
  - 评分标准定义

- [ ] 技术选型确认
  - AI模型选择 (Gemini vs GPT-4 vs Claude)
  - 向量数据库需求 (暂不需要，使用基础匹配)
  - 文件存储方案 (Supabase Storage vs S3)

### 0.2 原型验证
- [ ] Arnavsao项目本地运行
  ```bash
  git clone https://github.com/Arnavsao/hrms-platform
  cd hrms-platform/backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload
  ```

- [ ] API测试验证
  ```bash
  # 测试简历解析
  curl -X POST http://localhost:8000/api/parse-resume \
    -F "file=@test.pdf"

  # 测试候选人匹配
  curl -X POST http://localhost:8000/api/match \
    -H "Content-Type: application/json" \
    -d '{"resume": {...}, "job_description": "..."}'
  ```

---

## 🏗️ Phase 1: AI Service提取与独立部署 (Week 1-2)

### 1.1 模块提取

**任务**: 从Arnavsao项目提取核心简历解析模块

**步骤**:
```bash
# 1. 克隆项目
git clone https://github.com/Arnavsao/hrms-platform
cd hrms-platform

# 2. 分析项目结构
tree -L 3 backend/app

# 3. 识别核心模块
# - backend/app/api/resume.py
# - backend/app/services/resume_parser.py
# - backend/app/services/skill_extractor.py
# - backend/app/services/match_scorer.py

# 4. 创建独立服务目录
mkdir -p ai-resume-service
cd ai-resume-service

# 5. 复制核心文件
cp ../backend/app/services/*.py ./services/
cp ../backend/app/api/*.py ./api/

# 6. 创建主文件
touch main.py requirements.txt Dockerfile README.md
```

**输出文件**:
```
ai-resume-service/
├── main.py                 # FastAPI应用入口
├── requirements.txt        # 依赖清单
├── Dockerfile             # 容器化配置
├── .env.example           # 环境变量模板
├── services/
│   ├── __init__.py
│   ├── resume_parser.py   # 简历解析核心
│   ├── skill_extractor.py # 技能提取
│   ├── match_scorer.py    # 匹配评分
│   └── ai_client.py       # AI模型客户端
├── api/
│   ├── __init__.py
│   ├── routes.py          # API路由定义
│   └── schemas.py         # Pydantic模型
├── tests/
│   ├── test_parser.py
│   └── test_matcher.py
└── README.md
```

### 1.2 依赖精简

**原始依赖分析**:
```bash
# 查看原项目依赖
cd hrms-platform/backend
pip list | grep -E "(langchain|fastapi|pdf)"
```

**精简后的requirements.txt**:
```txt
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Data Validation
pydantic==2.5.0
pydantic-settings==2.1.0

# File Processing
pdfplumber==0.10.3
python-docx==1.1.0
Pillow==10.1.0

# AI/ML
langchain==0.1.0
langchain-community==0.0.10
openai==1.3.0  # 或者 anthropic

# Utilities
python-dotenv==1.0.0
httpx==0.25.2
```

### 1.3 核心模块重构

**1.3.1 Resume Parser**

```python
# services/resume_parser.py
from typing import List, Dict, Any
from pydantic import BaseModel
import pdfplumber
import docx
from pathlib import Path

class ParsedResume(BaseModel):
    """标准化简历数据模型"""
    name: str
    email: str
    phone: str
    skills: List[str]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    raw_text: str

class ResumeParser:
    """简历解析器 - 独立无依赖"""

    def __init__(self, ai_enabled: bool = True):
        self.ai_enabled = ai_enabled

    async def parse(self, file_path: str) -> ParsedResume:
        """
        解析简历文件

        Args:
            file_path: 文件路径

        Returns:
            ParsedResume: 结构化简历数据
        """
        # 1. 提取文本
        text = self._extract_text(file_path)

        # 2. 解析结构化数据
        if self.ai_enabled:
            return await self._parse_with_ai(text)
        else:
            return self._parse_with_regex(text)

    def _extract_text(self, file_path: str) -> str:
        """从文件中提取纯文本"""
        path = Path(file_path)

        if path.suffix == '.pdf':
            return self._extract_from_pdf(file_path)
        elif path.suffix == '.docx':
            return self._extract_from_docx(file_path)
        elif path.suffix == '.txt':
            return Path(file_path).read_text(encoding='utf-8')
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")

    def _extract_from_pdf(self, file_path: str) -> str:
        """从PDF提取文本"""
        text = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text.append(page.extract_text() or "")
        return "\n".join(text)

    def _extract_from_docx(self, file_path: str) -> str:
        """从DOCX提取文本"""
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    async def _parse_with_ai(self, text: str) -> ParsedResume:
        """使用AI解析简历"""
        # TODO: 集成LLM
        pass

    def _parse_with_regex(self, text: str) -> ParsedResume:
        """使用正则表达式解析简历"""
        # TODO: 实现基础解析
        pass
```

**1.3.2 Candidate Matcher**

```python
# services/match_scorer.py
from typing import List, Dict, Tuple
from pydantic import BaseModel

class MatchResult(BaseModel):
    """匹配结果"""
    total_score: float  # 0-100
    skill_score: float
    experience_score: float
    education_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]

class CandidateMatcher:
    """候选人与岗位匹配器"""

    def __init__(
        self,
        skill_weight: float = 0.4,
        experience_weight: float = 0.3,
        education_weight: float = 0.2,
        soft_skill_weight: float = 0.1
    ):
        self.skill_weight = skill_weight
        self.experience_weight = experience_weight
        self.education_weight = education_weight
        self.soft_skill_weight = soft_skill_weight

    def calculate_match(
        self,
        resume: Dict[str, Any],
        job_description: Dict[str, Any]
    ) -> MatchResult:
        """
        计算候选人与岗位的匹配度

        Args:
            resume: 简历数据
            job_description: 岗位描述

        Returns:
            MatchResult: 匹配结果
        """
        # 1. 技能匹配
        skill_result = self._match_skills(
            resume.get('skills', []),
            job_description.get('required_skills', [])
        )

        # 2. 经验匹配
        exp_result = self._match_experience(
            resume.get('experience', []),
            job_description.get('required_experience', {})
        )

        # 3. 教育匹配
        edu_result = self._match_education(
            resume.get('education', []),
            job_description.get('required_education', [])
        )

        # 4. 计算总分
        total_score = (
            skill_result['score'] * self.skill_weight +
            exp_result['score'] * self.experience_weight +
            edu_result['score'] * self.education_weight
        )

        return MatchResult(
            total_score=round(total_score, 2),
            skill_score=round(skill_result['score'], 2),
            experience_score=round(exp_result['score'], 2),
            education_score=round(edu_result['score'], 2),
            matched_skills=skill_result['matched'],
            missing_skills=skill_result['missing'],
            recommendations=self._generate_recommendations(
                skill_result, exp_result, edu_result
            )
        )

    def _match_skills(
        self,
        candidate_skills: List[str],
        required_skills: List[str]
    ) -> Dict[str, Any]:
        """技能匹配计算"""
        if not required_skills:
            return {'score': 100.0, 'matched': [], 'missing': []}

        candidate_lower = [s.lower() for s in candidate_skills]
        matched = []
        missing = []

        for req in required_skills:
            req_lower = req.lower()
            if any(
                req_lower in skill or skill in req_lower
                for skill in candidate_lower
            ):
                matched.append(req)
            else:
                missing.append(req)

        score = (len(matched) / len(required_skills)) * 100
        return {'score': score, 'matched': matched, 'missing': missing}

    def _match_experience(
        self,
        candidate_exp: List[Dict],
        required_exp: Dict
    ) -> Dict[str, Any]:
        """经验匹配计算"""
        # TODO: 实现经验匹配逻辑
        return {'score': 50.0, 'matched_years': 0}

    def _match_education(
        self,
        candidate_edu: List[Dict],
        required_edu: List[str]
    ) -> Dict[str, Any]:
        """教育匹配计算"""
        # TODO: 实现教育匹配逻辑
        return {'score': 50.0, 'matched': False}

    def _generate_recommendations(
        self,
        skill_result: Dict,
        exp_result: Dict,
        edu_result: Dict
    ) -> List[str]:
        """生成改进建议"""
        recommendations = []

        if skill_result['missing']:
            recommendations.append(
                f"建议补充以下技能: {', '.join(skill_result['missing'][:3])}"
            )

        if exp_result['score'] < 60:
            recommendations.append("工作经验与岗位要求有一定差距")

        return recommendations
```

**1.3.3 FastAPI主程序**

```python
# main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os

from services.resume_parser import ResumeParser, ParsedResume
from services.match_scorer import CandidateMatcher, MatchResult

# 配置
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://www.3strategy.cc"
).split(",")

# 创建应用
app = FastAPI(
    title="AI Resume Parser Service",
    description="AI-powered resume parsing and candidate matching service",
    version="1.0.0"
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
parser = ResumeParser(ai_enabled=True)
matcher = CandidateMatcher()

# API Models
class JobDescription(BaseModel):
    title: str
    required_skills: List[str]
    required_experience: Dict[str, Any] = {}
    required_education: List[str] = []
    description: str = ""

class MatchRequest(BaseModel):
    resume: Dict[str, Any]
    job_description: Dict[str, Any]

# Endpoints
@app.get("/")
async def root():
    """健康检查"""
    return {
        "service": "AI Resume Parser",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """详细健康检查"""
    return {
        "status": "healthy",
        "services": {
            "parser": "ok",
            "matcher": "ok",
            "ai": "enabled" if parser.ai_enabled else "disabled"
        }
    }

@app.post("/api/v1/parse", response_model=ParsedResume)
async def parse_resume(file: UploadFile = File(...)):
    """
    解析简历文件

    Args:
        file: 简历文件 (PDF, DOCX, TXT)

    Returns:
        ParsedResume: 结构化简历数据
    """
    # 验证文件类型
    allowed_extensions = {'.pdf', '.docx', '.txt'}
    file_ext = '.' + file.filename.split('.')[-1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {allowed_extensions}"
        )

    # 保存临时文件
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # 解析简历
        result = await parser.parse(tmp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 清理临时文件
        os.unlink(tmp_path)

@app.post("/api/v1/match", response_model=MatchResult)
async def match_candidate(request: MatchRequest):
    """
    匹配候选人与岗位

    Args:
        request: 包含简历和岗位描述的匹配请求

    Returns:
        MatchResult: 匹配结果
    """
    try:
        result = matcher.calculate_match(
            request.resume,
            request.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 1.4 本地测试

```bash
# 安装依赖
cd ai-resume-service
pip install -r requirements.txt

# 启动服务
uvicorn main:app --reload --port 8000

# 健康检查
curl http://localhost:8000/health

# 测试解析
curl -X POST http://localhost:8000/api/v1/parse \
  -F "file=@test_resume.pdf"

# 查看API文档
open http://localhost:8000/docs
```

### 1.5 Docker化

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-resume-service:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ALLOWED_ORIGINS=http://localhost:3000,https://www.3strategy.cc
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

### 1.6 部署到Node B

```bash
# 在Node B服务器上
cd /opt
mkdir ai-resume-service
cd ai-resume-service

# 上传代码
scp -r ai-resume-service/* user@103.59.103.85:/opt/ai-resume-service/

# 启动服务
docker-compose up -d

# 验证
curl http://103.59.103.85:8000/health
```

---

## 🔌 Phase 2: Portal集成 (Week 3)

### 2.1 API Gateway创建

```typescript
// app/api/recruitment/parse-resume/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  try {
    // 1. 验证用户权限
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. 获取上传文件
    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // 3. 验证文件类型
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX are supported.' },
        { status: 400 }
      )
    }

    // 4. 转发到AI服务
    const aiServiceUrl = process.env.AI_RESUME_SERVICE_URL || 'http://103.59.103.85:8000'
    const aiFormData = new FormData()
    aiFormData.append('file', file)

    const response = await fetch(`${aiServiceUrl}/api/v1/parse`, {
      method: 'POST',
      body: aiFormData,
    })

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`)
    }

    // 5. 返回解析结果
    const data = await response.json()

    // 6. 可选：存储到数据库
    // await db.parsedResume.create({ ... })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Resume parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/api/recruitment/match/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resume, jobDescription } = await request.json()

    // 调用AI服务
    const aiServiceUrl = process.env.AI_RESUME_SERVICE_URL
    const response = await fetch(`${aiServiceUrl}/api/v1/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume,
        job_description: jobDescription
      })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Match calculation failed' },
      { status: 500 }
    )
  }
}
```

### 2.2 类型定义

```typescript
// types/resume.ts
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
    major: string
    graduation_year?: string
  }>
  raw_text?: string
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

export interface MatchResult {
  total_score: number
  skill_score: number
  experience_score: number
  education_score: number
  matched_skills: string[]
  missing_skills: string[]
  recommendations: string[]
}
```

### 2.3 UI组件开发

```typescript
// app/[locale]/tools/resume-match/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, FileText, Sparkles } from 'lucide-react'
import type { ParsedResume, MatchResult } from '@/types/resume'

export default function ResumeMatchPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleParse = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/recruitment/parse-resume', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setParsedResume(data)
    } catch (error) {
      console.error('Parse error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!parsedResume || !jobDescription) return

    setLoading(true)
    try {
      const response = await fetch('/api/recruitment/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: parsedResume,
          jobDescription: {
            title: 'Software Engineer',
            required_skills: extractSkillsFromJD(jobDescription),
            description: jobDescription
          }
        })
      })

      const data = await response.json()
      setMatchResult(data)
    } catch (error) {
      console.error('Match error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI 简历匹配</h1>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. 上传简历</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            <Button onClick={handleParse} disabled={!file || loading}>
              <Sparkles className="w-4 h-4 mr-2" />
              解析简历
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Result */}
      {parsedResume && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. 解析结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">姓名</h3>
                <p>{parsedResume.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">邮箱</h3>
                <p>{parsedResume.email}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold">技能</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parsedResume.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Description Input */}
      {parsedResume && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. 输入岗位描述</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-32 p-2 border rounded"
              placeholder="粘贴岗位描述..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button
              onClick={handleMatch}
              disabled={!jobDescription || loading}
              className="mt-4"
            >
              计算匹配度
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Match Result */}
      {matchResult && (
        <Card>
          <CardHeader>
            <CardTitle>4. 匹配结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600">
                {matchResult.total_score}%
              </div>
              <div className="text-gray-500">综合匹配度</div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">技能匹配 ({matchResult.skill_score}%)</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {matchResult.matched_skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-green-100 rounded text-green-800">
                      ✓ {skill}
                    </span>
                  ))}
                  {matchResult.missing_skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-red-100 rounded text-red-800">
                      ✗ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {matchResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold">建议</h4>
                  <ul className="list-disc list-inside mt-2">
                    {matchResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function extractSkillsFromJD(jd: string): string[] {
  // 简化的技能提取逻辑
  const commonSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'Go',
    'SQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS'
  ]

  return commonSkills.filter(skill =>
    jd.toLowerCase().includes(skill.toLowerCase())
  )
}
```

---

## 📝 Phase 3: 配置与文档 (Week 3)

### 3.1 环境变量配置

```env
# .env.local (Portal)
AI_RESUME_SERVICE_URL=http://103.59.103.85:8000
AI_RESUME_SERVICE_API_KEY=your_api_key_if_needed

# .env (AI Service)
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
ALLOWED_ORIGINS=http://localhost:3000,https://www.3strategy.cc
```

### 3.2 工具注册

```typescript
// lib/tools-config.ts
export const tools: Tool[] = [
  // ... existing tools
  {
    id: 'resume-match',
    name: { en: 'Resume Match', zh: '简历匹配' },
    description: {
      en: 'AI-powered resume parsing and job matching',
      zh: 'AI驱动的简历解析与岗位匹配'
    },
    icon: 'FileText',
    status: 'live',
    url: '/tools/resume-match',
    category: 'Talent',
    priority: 1
  }
]
```

---

## 📊 Phase 4: 测试与优化 (Week 4)

### 4.1 功能测试清单

- [ ] PDF简历解析测试
  - [ ] 中文简历
  - [ ] 英文简历
  - [ ] 多页简历
  - [ ] 复杂格式简历

- [ ] DOCX简历解析测试
- [ ] 技能提取准确性测试
- [ ] 匹配算法准确性测试
- [ ] API错误处理测试
- [ ] 并发请求测试

### 4.2 性能优化

```typescript
// lib/resume-cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function cachedParseResume(
  fileHash: string,
  parseFn: () => Promise<ParsedResume>
): Promise<ParsedResume> {
  const cacheKey = `resume:parse:${fileHash}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const result = await parseFn()
  await redis.setex(cacheKey, 3600, JSON.stringify(result)) // 1小时缓存

  return result
}
```

---

## 📦 Deliverables

1. **AI Resume Service**
   - [ ] 可独立部署的FastAPI服务
   - [ ] Docker镜像
   - [ ] API文档

2. **Portal Integration**
   - [ ] 简历上传UI
   - [ ] 解析结果展示
   - [ ] 匹配评分展示

3. **Documentation**
   - [ ] API使用文档
   - [ ] 部署指南
   - [ ] 故障排查指南

---

## 🚨 Risk Mitigation

| 风险 | 应对措施 |
|------|---------|
| AI API限流 | 实现请求队列和重试机制 |
| 解析准确率低 | 提供手动编辑功能 |
| 服务不可用 | 降级到基础解析 |
| 文件过大 | 限制文件大小，提供分片上传 |

---

## 📅 Timeline

| Week | Milestone |
|------|-----------|
| 1 | AI Service提取完成 |
| 2 | AI Service部署上线 |
| 3 | Portal集成完成 |
| 4 | 测试与优化 |
