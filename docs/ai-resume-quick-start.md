# AI Resume Service - 快速参考

## 📁 项目结构

```
portal/
├── docs/
│   ├── ai-resume-integration-plan.md  # 完整实施计划
│   ├── project-status.md              # 项目状态跟踪
│   └── ai-resume-quick-start.md       # 本文件 - 快速参考
│
├── app/
│   └── api/
│       └── recruitment/
│           ├── parse-resume/
│           │   └── route.ts           # 简历解析API
│           └── match/
│               └── route.ts           # 候选人匹配API
│
├── types/
│   └── resume.ts                      # 类型定义
│
└── app/[locale]/tools/
    └── resume-match/
        └── page.tsx                   # UI组件

ai-resume-service/ (独立部署)
├── main.py                            # FastAPI入口
├── requirements.txt                   # Python依赖
├── Dockerfile                         # 容器配置
├── services/
│   ├── resume_parser.py               # 简历解析核心
│   └── match_scorer.py                # 匹配算法
└── tests/
    ├── test_parser.py
    └── test_matcher.py
```

---

## 🔑 关键命令

### AI Service (Python)

```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn main:app --reload --port 8000

# 运行测试
pytest tests/

# Docker构建
docker build -t ai-resume-service .

# Docker运行
docker run -p 8000:8000 ai-resume-service

# 查看日志
docker-compose logs -f
```

### Portal (Next.js)

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check

# Lint
npm run lint
```

---

## 🔌 API端点

### AI Service (http://103.59.103.85:8000)

```
GET  /health                    健康检查
POST /api/v1/parse             解析简历
POST /api/v1/match             候选人匹配
GET  /docs                     Swagger文档
```

### Portal API Gateway

```
POST /api/recruitment/parse-resume   转发解析请求
POST /api/recruitment/match          转发匹配请求
```

---

## 📤 请求/响应示例

### 解析简历

```bash
curl -X POST http://localhost:8000/api/v1/parse \
  -F "file=@resume.pdf"

# 响应
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "skills": ["Python", "React", "Node.js"],
  "experience": [
    {
      "company": "ABC公司",
      "title": "软件工程师",
      "duration": "2020-2023"
    }
  ],
  "education": [...]
}
```

### 匹配候选人

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "resume": {...},
    "job_description": {
      "title": "全栈工程师",
      "required_skills": ["Python", "React", "SQL"]
    }
  }'

# 响应
{
  "total_score": 85.5,
  "skill_score": 90.0,
  "matched_skills": ["Python", "React"],
  "missing_skills": ["SQL"],
  "recommendations": ["建议补充SQL技能"]
}
```

---

## 🔧 环境变量

### AI Service (.env)

```env
# AI模型配置
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
AI_MODEL=gemini-pro

# CORS配置
ALLOWED_ORIGINS=http://localhost:3000,https://www.3strategy.cc

# 服务配置
PORT=8000
LOG_LEVEL=info
```

### Portal (.env.local)

```env
# AI服务地址
AI_RESUME_SERVICE_URL=http://103.59.103.85:8000
AI_RESUME_SERVICE_API_KEY=xxx

# 存储配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

---

## 🐛 故障排查

### AI服务启动失败

```bash
# 检查端口占用
lsof -i :8000

# 检查日志
docker-compose logs

# 重启服务
docker-compose restart
```

### 解析失败

```bash
# 测试AI API密钥
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# 检查文件大小限制
# 在FastAPI中查看UploadFile配置
```

### Portal连接失败

```bash
# 测试AI服务连通性
curl http://103.59.103.85:8000/health

# 检查CORS配置
# 在浏览器开发者工具中查看Network错误
```

---

## 📊 性能基准

| 操作 | 预期时间 | 实际时间 |
|------|---------|---------|
| PDF解析 | < 3s | ___ |
| 技能提取 | < 2s | ___ |
| 匹配计算 | < 1s | ___ |
| 端到端 | < 5s | ___ |

---

## ✅ 测试清单

### 功能测试

- [ ] PDF简历解析 (中文)
- [ ] PDF简历解析 (英文)
- [ ] DOCX简历解析
- [ ] 技能提取准确性
- [ ] 匹配算法准确性
- [ ] 错误处理

### 性能测试

- [ ] 单文件处理
- [ ] 并发处理 (10 req/s)
- [ ] 大文件处理 (> 5MB)

### 集成测试

- [ ] Portal → AI Service
- [ ] 数据库存储
- [ ] 文件存储

---

## 📞 支持

- **文档**: `docs/ai-resume-integration-plan.md`
- **状态**: `docs/project-status.md`
- **Issues**: GitHub Issues
