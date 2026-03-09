# HR微服务 - 浏览器测试指南

**所有服务已就绪** 🟢 → **现在可以通过浏览器测试**

---

## 🌐 访问地址

**Portal Frontend**: http://localhost:3200

---

## 📋 测试页面

### 1. OKR管理器 - Performance Service集成

**URL**: http://localhost:3200/tools/okr

**测试步骤**:
1. ✅ 页面加载显示 "OKR 设计器"
2. ✅ 点击"添加目标"按钮
3. ✅ 输入目标名称，按Enter添加
4. ✅ 点击"添加关键结果"
5. ✅ 设置目标值、当前值、权重
6. ✅ 观察权重自动计算（总权重100%）
7. ✅ 点击💾保存按钮
8. ✅ 查看成功/失败消息

**预期行为**:
- 权重总和不为100%时显示警告
- 保存成功后显示绿色消息
- 页面底部显示 "🔗 Performance Service"

---

### 2. 宽带薪酬设计器 - Compensation Service集成

**URL**: http://localhost:3200/tools/broadband

**测试步骤**:
1. ✅ 页面加载显示宽带薪酬可视化
2. ✅ 在"个税计算器"面板输入税前工资 (如: 25000)
3. ✅ 点击"计算"按钮
4. ✅ 查看计算结果：
   - 税前工资: ¥25,000
   - 社保个人: -¥2,625
   - 公积金个人: -¥1,750
   - 个人所得税: -¥1,715
   - **税后工资: ¥18,910**
5. ✅ 查看薪资宽带分析（等级、位置、四分位）

**预期行为**:
- 显示详细的个税计算
- 显示薪资在宽带中的位置
- 显示调整建议
- 页面底部显示 "🔗 Compensation Service"

---

### 3. 简历匹配 - Recruitment Service集成

**URL**: http://localhost:3200/tools/resume-match

**测试步骤**:
1. ✅ 上传PDF/DOCX简历
2. ✅ 点击"开始解析"
3. ✅ 查看AI提取的技能（智谱AI glm-4-flash）
4. ✅ 填写岗位要求：
   - 必需技能: `Python, React, SQL`
   - 工作年限: `3`
   - 学历要求: `本科`
5. ✅ 点击"计算匹配度"
6. ✅ 查看匹配结果：
   - 综合匹配度评分
   - 技能/经验/教育分数
   - 已掌握/缺失技能
   - AI建议

**预期行为**:
- AI成功解析简历（约3-10秒）
- 提取姓名、邮箱、电话、技能
- 计算匹配分数
- 显示颜色编码的评级

---

## 🔍 验证API连接

### 在浏览器开发者工具中验证

**F12** → **Network** 标签

1. **测试Performance API**:
   ```
   URL: http://localhost:8001/api/v1/objectives/emp-001
   Method: GET
   Expected: {"success": true, "data": []}
   ```

2. **测试Compensation API**:
   ```
   URL: http://localhost:8002/api/v1/calculate-tax
   Method: POST
   Body: {"gross_salary": 25000}
   Expected: {"success": true, "data": {...}}
   ```

3. **测试Recruitment API**:
   ```
   URL: http://localhost:8000/health
   Method: GET
   Expected: {"status": "healthy", "services": {...}}
   ```

---

## 🧪 完整测试流程

### OKR测试流程

```
1. 打开 http://localhost:3200/tools/okr
2. 点击"添加目标"
3. 输入 "提升销售业绩"，按Enter
4. 点击"添加关键结果"（3次）
5. 设置KR数据：
   - KR1: 销售额100万 (当前75万) 权重40%
   - KR2: 新客户20个 (当前15个) 权重30%
   - KR3: 客户满意度90% (当前85%) 权重30%
6. 点击💾保存
7. 查看成功消息
```

### 个税测试流程

```
1. 打开 http://localhost:3200/tools/broadband
2. 在个税计算器输入 "30000"
3. 点击"计算"
4. 查看结果：
   - 税后: ~23,500元
   - 实际税率: ~8%
5. 修改薪资为 "50000"，重新计算
6. 查看税率变化
```

### 简历匹配测试流程

```
1. 打开 http://localhost:3200/tools/resume-match
2. 上传你的真实简历PDF
3. 点击"开始解析"，等待3-10秒
4. 查看AI提取的技能列表
5. 设置岗位要求（匹配你简历的技能）
6. 点击"计算匹配度"
7. 查看匹配分数和建议
```

---

## ❌ 故障排查

### 问题1: API连接失败

**症状**: 页面显示错误，没有调用成功

**解决**:
```bash
# 检查服务是否运行
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health

# 如果服务停止，重启服务：
cd ai-resume-service && python3 main.py &
cd performance-service && python3 main.py &
cd compensation-service && python3 main.py &
```

### 问题2: CORS错误

**症状**: F12 Console显示 "CORS policy blocked"

**解决**:
- 检查服务端CORS配置
- 确保 `ALLOWED_ORIGINS` 包含 `http://localhost:3200`

### 问题3: 编译错误

**症状**: npm run build 失败

**解决**:
```bash
# 清理并重新构建
rm -rf .next
npm run build
npm run dev
```

---

## 📊 服务架构

```
┌─────────────────────────────────────┐
│         Portal (Next.js)              │
│         http://localhost:3200        │
│                                     │
│  ┌──────────┐  ┌──────────┐  ┌────┴────┐ │
│  │   OKR    │  │ Broadband │  │  Resume  │ │
│  │   Page   │  │   Page   │  │  Match  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │            │            │        │
│       ▼            ▼            ▼        │
│  ┌────────────────────────────────────┐ │
│  │          API Gateway (hr-api.ts)    │ │
│  └────────────────────────────────────┘ │
│       │            │            │        │
│       ▼            ▼            ▼        │
│  ┌────────────────────────────────────┐ │
│  │  Performance │ Compensation │  │
│  │   Service    │   Service     │  │
│  │  Port 8001    │   Port 8002    │  │
│  └───────────────┴───────────────┘  │
│  │  Recruitment │                     │
│  │  Service     │                     │
│  │  Port 8000    │                     │
│  └──────────────┴─────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ 测试检查清单

- [ ] 页面正常加载，无编译错误
- [ ] OKR: 能添加目标/KR，权重自动计算
- [ ] OKR: 点击保存按钮有响应
- [ ] Broadband: 能计算个税
- [ ] Broadband: 显示薪资位置分析
- [ ] Resume: 能上传简历文件
- [ ] Resume: AI解析显示技能
- [ ] Resume: 匹配功能正常
- [ ] 所有页面底部显示服务连接状态

---

**测试日期**: 2026-03-08
**所有服务状态**: 🟢 Healthy
**准备就绪**: ✅ 可以通过浏览器测试
