# 日志调试指南

## 📋 如何查看详细日志

### 方式 1: 查看文件日志

所有日志都会写入文件，可以实时查看：

```powershell
# 实时跟踪日志
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log -Wait -Tail 100

# 或者查看最后 50 行
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log -Tail 50
```

### 方式 2: 使用 MCP Inspector

MCP Inspector 可以实时查看 MCP 通信和日志：

```bash
cd D:\my_project\Ace-Mcp\Ace-Mcp-Node
npx @modelcontextprotocol/inspector node dist/index.js
```

然后在浏览器中打开显示的 URL，例如：
```
http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=xxx
```

在 Inspector 界面中：
1. 点击 "Tools" 标签
2. 选择 `search_context` 工具
3. 填写参数
4. 点击 "Call Tool"
5. 查看请求和响应

### 方式 3: Web 管理界面

启动带 Web 界面的服务器：

```bash
node dist/index.js --web-port 8900
```

然后访问 http://localhost:8900

在 Web 界面中：
- **Real-time Logs**: 实时查看日志（通过 WebSocket）
- **Tool Debugger**: 调试工具调用
- **Configuration**: 查看和修改配置

## 📊 日志级别说明

### DEBUG (调试)
最详细的日志，包含：
- HTTP 请求和响应的完整内容
- 文件读取的详细信息
- 编码检测过程
- 哈希计算
- 批次详情

**何时使用**: 需要追踪具体的执行流程时

### INFO (信息)
常规操作日志，包含：
- 索引开始/完成
- 批次上传进度
- 搜索操作
- 配置信息

**何时使用**: 了解程序正在做什么

### WARNING (警告)
潜在问题，包含：
- 编码问题
- 重试操作
- 部分失败

**何时使用**: 发现异常但不致命的情况

### ERROR (错误)
严重错误，包含：
- API 请求失败
- 文件读取失败
- 索引失败
- 搜索失败

**何时使用**: 操作失败时

## 🔍 常见问题的日志关键字

### 问题 1: 无法读取文件

搜索日志中的关键字：
```
Failed to read file
iconv.decode is not a function
encoding
```

查看日志中的编码检测过程：
```
Successfully read xxx with encoding: xxx
```

### 问题 2: API 请求失败

搜索日志中的关键字：
```
Invalid URL
Request failed
HTTP 状态码
响应数据
```

查看详细的请求信息：
```
🌐 上传 URL
📝 请求数据
🔑 使用 Token
```

### 问题 3: 索引失败

搜索日志中的关键字：
```
Collected 0 blobs
索引失败
批次上传失败
All batches failed
```

查看收集到的文件：
```
Collected file
Split file
```

### 问题 4: MCP 通信问题

搜索日志中的关键字：
```
SyntaxError: Unexpected token
is not valid JSON
MCP 服务器
```

## 📝 日志示例解读

### 成功的索引操作

```
📊 搜索前自动索引项目: C:/Users/xxx/Desktop/天气9...
📁 项目路径: C:/Users/xxx/Desktop/天气9
🔎 搜索查询: getElementById location
📄 文件收集完成: 收集到 5 个 blob
📊 增量索引统计: total=5, existing=0, new=5, to_upload=5
📤 准备上传 5 个新 blob，分为 1 批次（每批最多 10 个）
📦 正在上传第 1/1 批次（包含 5 个 blob）
🔄 尝试 1/3: 发送 POST 请求...
📨 收到响应: 状态码 200
✅ 批次上传成功！
🎉 所有批次上传完成！总共成功上传 5 个 blob
✅ 索引完成
```

### 失败的 API 请求

```
📦 正在上传第 1/1 批次（包含 5 个 blob）
🌐 上传 URL: https://d15.api.augmentcode.com/api/v1/index/upload
🔄 尝试 1/3: 发送 POST 请求...
❌ 请求失败（尝试 1/3）: Invalid URL
⚙️ 请求配置错误: Invalid URL
⏳ 等待 1000ms 后重试...
```

### 编码问题

```
⚠️ Failed to read file: xxx.html - TypeError: iconv.decode is not a function
```

## 🛠️ 调试技巧

### 技巧 1: 使用 grep 过滤日志

```powershell
# 只看错误
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log | Select-String "ERROR"

# 只看某个文件的操作
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log | Select-String "index.html"

# 只看HTTP请求
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log | Select-String "HTTP|请求|响应"
```

### 技巧 2: 清空日志重新开始

```powershell
# 清空日志文件
Clear-Content $env:USERPROFILE\.acemcp\log\acemcp.log

# 然后重新运行你的测试
npx @modelcontextprotocol/inspector node dist/index.js
```

### 技巧 3: 比较 Python 和 Node 版本的日志

```powershell
# Python 版本日志
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log | Select-String "Python"

# Node 版本日志
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log | Select-String "Node"
```

## 🎯 当前版本的日志特点

### ✅ 已实现的详细日志

1. **文件收集**: 
   - 文件路径
   - 编码检测
   - 文件分割信息

2. **索引操作**:
   - 统计信息（总数、已存在、新增）
   - 批次详情
   - 上传进度

3. **HTTP 请求**:
   - 完整的 URL
   - 请求参数
   - 响应状态
   - 错误详情

4. **搜索操作**:
   - 搜索参数
   - 索引状态
   - 结果统计

### 📌 日志中的表情符号说明

- 🔍: 搜索操作
- 📁: 文件/目录操作
- 📊: 统计信息
- 📤: 上传操作
- 📨: HTTP 响应
- 🌐: HTTP 请求
- ✅: 成功
- ❌: 失败
- ⚠️: 警告
- 🔄: 重试
- ⏳: 等待
- 💾: 保存
- 🔧: 配置
- 📝: 数据内容

## 💡 提示

1. 日志文件会自动轮转（超过 5MB 时）
2. 保留最近 10 个日志文件
3. 日志使用 UTF-8 编码
4. 时间戳格式: `YYYY-MM-DD HH:MM:SS`

## 🆘 如果日志没有帮助

如果日志信息仍然不足以定位问题，请：

1. 检查配置文件: `%USERPROFILE%\.acemcp\settings.toml`
2. 验证 API 端点是否可访问
3. 检查网络连接
4. 查看 MCP Inspector 的控制台输出
5. 比较 Python 版本的行为

---

祝调试顺利！🚀

