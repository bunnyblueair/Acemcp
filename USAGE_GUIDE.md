# 🚀 Ace-MCP 使用和测试指南

## 📋 目录

1. [快速开始](#快速开始)
2. [配置说明](#配置说明)
3. [在 Cursor 中使用](#在-cursor-中使用)
4. [在其他 MCP 客户端中使用](#在其他-mcp-客户端中使用)
5. [Web 管理界面使用](#web-管理界面使用)
6. [功能测试](#功能测试)
7. [常见问题](#常见问题)

---

## 快速开始

### 1. 编译项目

```bash
cd D:/my_project/Ace-Mcp/Ace-Mcp-Node
npm install
npm run build
```

验证编译成功：
```bash
# 应该看到 dist/ 目录被创建
ls dist/

# 输出示例：
# index.js  config.js  logger.js  index/  tools/  web/
```

### 2. 初始化配置

首次运行会自动创建配置文件：

```bash
npm start
# 按 Ctrl+C 退出

# 配置文件已创建在：
# Windows: C:\Users\你的用户名\.acemcp\settings.toml
# Linux/Mac: ~/.acemcp/settings.toml
```

### 3. 编辑配置

打开配置文件并修改：

```toml
# ~/.acemcp/settings.toml

BASE_URL = "https://your-api-endpoint.com"
TOKEN = "your-actual-api-token"
BATCH_SIZE = 10
MAX_LINES_PER_BLOB = 800
```

⚠️ **重要**：必须设置正确的 `BASE_URL` 和 `TOKEN`，否则索引和搜索功能无法工作。

---

## 配置说明

### 配置文件位置

- **Windows**: `C:\Users\<用户名>\.acemcp\settings.toml`
- **Linux/Mac**: `~/.acemcp/settings.toml`

### 配置项说明

```toml
# API 基础 URL（必需）
BASE_URL = "https://your-api.com"

# API 访问令牌（必需）
TOKEN = "your-token-here"

# 批量上传大小（可选，默认 10）
BATCH_SIZE = 10

# 每个 blob 的最大行数（可选，默认 800）
MAX_LINES_PER_BLOB = 800

# 要索引的文件扩展名（可选）
TEXT_EXTENSIONS = [
  ".py", ".js", ".ts", ".jsx", ".tsx",
  ".java", ".go", ".rs", ".cpp", ".c",
  ".md", ".txt", ".json", ".yaml"
]

# 排除模式（可选）
EXCLUDE_PATTERNS = [
  "node_modules", ".git", "dist", "build",
  ".venv", "venv", "__pycache__"
]
```

### 数据目录

索引数据存储在：
- **Windows**: `C:\Users\<用户名>\.acemcp\data\`
- **Linux/Mac**: `~/.acemcp/data/`

包含的文件：
- `projects.json` - 已索引项目的 blob 列表

---

## 在 Cursor 中使用

### 方法 1: 通过 Cursor 配置文件

1. 打开 Cursor 设置
2. 找到 MCP 服务器配置
3. 添加以下配置：

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

⚠️ **注意**：路径使用正斜杠 `/`，即使在 Windows 上。

### 方法 2: 使用命令行参数

如果不想使用配置文件，可以直接传递参数：

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js",
        "--base-url", "https://your-api.com",
        "--token", "your-token"
      ],
      "env": {}
    }
  }
}
```

### 方法 3: 带 Web 管理界面

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js",
        "--web-port", "8080"
      ],
      "env": {}
    }
  }
}
```

然后访问 http://localhost:8080 管理服务器。

### 在 Cursor 中测试

1. 重启 Cursor
2. 打开一个项目文件
3. 在聊天框中输入：

```
@acemcp search_context 搜索日志配置相关代码
```

或者使用工具调用：

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node",
    "query": "logging configuration setup"
  }
}
```

---

## 在其他 MCP 客户端中使用

### Claude Desktop

编辑 Claude Desktop 配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js"
      ]
    }
  }
}
```

### 其他兼容 MCP 的客户端

任何支持 MCP 协议的客户端都可以使用，只需配置：

- **command**: `node`
- **args**: `["/path/to/dist/index.js"]`
- **transport**: `stdio`

---

## Web 管理界面使用

### 启动 Web 界面

```bash
cd D:/my_project/Ace-Mcp/Ace-Mcp-Node
npm start -- --web-port 8080
```

或者使用开发模式：

```bash
npm run dev -- --web-port 8080
```

### 访问界面

在浏览器中打开：http://localhost:8080

### 界面功能

#### 1. 服务器状态
- 查看服务器运行状态
- 查看已索引项目数量
- 查看存储路径

#### 2. 配置管理
- 在线查看当前配置
- 修改配置项
- 保存配置到文件
- 立即生效（无需重启）

#### 3. 实时日志
- WebSocket 连接实时推送日志
- 支持日志级别过滤
- 自动滚动到最新日志

#### 4. 工具调试器
- 在线测试 `search_context` 工具
- 查看工具调用结果
- 调试工具参数

### Web 界面使用示例

1. **测试索引功能**：
   ```json
   工具名称: search_context
   
   参数 (JSON):
   {
     "project_root_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node",
     "query": "web server setup"
   }
   ```

2. **修改配置**：
   - 点击"Configuration Management"
   - 修改 `BATCH_SIZE` 或其他配置
   - 点击"Save Configuration"
   - 观察日志确认配置已更新

---

## 功能测试

### 测试 1: 验证服务器启动

```bash
npm start

# 预期输出：
# 正在启动 acemcp MCP 服务器...
# 配置: index_storage_path=C:\Users\...\data, batch_size=10
# API: base_url=https://...
# MCP 服务器已通过 stdio 连接
```

✅ 看到 "MCP 服务器已通过 stdio 连接" 表示成功。

### 测试 2: 验证 Web 界面

```bash
npm start -- --web-port 8080

# 预期输出：
# 正在启动 Web 管理界面，端口 8080
# Web management interface running on http://localhost:8080
```

访问 http://localhost:8080，应该看到管理界面。

### 测试 3: 索引本地项目

使用 Web 界面或直接调用工具：

```bash
# 创建测试脚本 test.js
cat > test.js << 'EOF'
import { IndexManager } from './dist/index/manager.js';

const manager = new IndexManager(
  'C:/Users/<你的用户名>/.acemcp/data',
  'https://your-api.com',
  'your-token',
  new Set(['.js', '.ts', '.md']),
  10,
  800,
  ['node_modules', '.git']
);

async function test() {
  try {
    const result = await manager.indexProject('D:/my_project/Ace-Mcp/Ace-Mcp-Node');
    console.log('索引结果:', result);
  } catch (error) {
    console.error('索引失败:', error);
  }
}

test();
EOF

# 运行测试
node test.js
```

### 测试 4: 搜索功能

在 Cursor 或 Web 界面中测试搜索：

```json
{
  "project_root_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node",
  "query": "logging configuration setup"
}
```

预期返回：与日志配置相关的代码片段。

### 测试 5: 增量索引

第二次运行索引：

```bash
node test.js

# 预期输出：
# 增量索引: total=150, existing=150, new=0, to_upload=0
# No new blobs to upload, all blobs already exist in index
```

✅ 说明增量索引正常工作，不会重复上传。

### 测试 6: 多编码文件

创建不同编码的测试文件：

```bash
# UTF-8 文件
echo "Hello World" > test_utf8.txt

# GBK 文件（Windows 中文）
echo "你好世界" > test_gbk.txt
```

索引包含这些文件的目录，检查日志：

```
Successfully read test_utf8.txt with encoding: utf-8
Successfully read test_gbk.txt with encoding: gbk
```

### 测试 7: 文件分割

创建一个超过 800 行的大文件：

```bash
# 创建 1000 行的文件
for i in {1..1000}; do echo "Line $i"; done > large_file.txt
```

索引后检查日志：

```
Split file large_file.txt (1000 lines) into 2 chunks
```

### 测试 8: .gitignore 支持

在项目根目录创建 `.gitignore`：

```gitignore
node_modules/
dist/
*.log
```

索引时检查日志：

```
Loaded .gitignore with X patterns
Excluded by .gitignore: node_modules/express
```

---

## 常见问题

### Q1: 如何验证 MCP 服务器是否正常工作？

**A**: 三种方法：

1. **查看启动日志**：
   ```bash
   npm start
   # 应该看到 "MCP 服务器已通过 stdio 连接"
   ```

2. **使用 Web 界面**：
   ```bash
   npm start -- --web-port 8080
   # 访问 http://localhost:8080
   # 查看服务器状态
   ```

3. **在 MCP 客户端中测试**：
   - 在 Cursor 中调用 `search_context` 工具
   - 检查是否返回结果

### Q2: 索引失败怎么办？

**A**: 检查以下几点：

1. **检查配置**：
   ```bash
   cat ~/.acemcp/settings.toml
   # 确认 BASE_URL 和 TOKEN 正确
   ```

2. **检查网络**：
   ```bash
   curl https://your-api-endpoint.com/health
   ```

3. **查看日志**：
   ```bash
   tail -f ~/.acemcp/log/acemcp.log
   # 查看详细错误信息
   ```

4. **检查项目路径**：
   ```bash
   # 确保路径存在且可访问
   ls "D:/my_project/Ace-Mcp/Ace-Mcp-Node"
   ```

### Q3: Web 界面无法访问？

**A**: 检查：

1. **端口占用**：
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```

2. **防火墙**：确保端口 8080 未被防火墙阻止

3. **启动日志**：查看是否有错误信息

### Q4: 编码错误怎么办？

**A**: 
- 程序会自动尝试 UTF-8 → GBK → GB2312 → Latin-1
- 如果仍然失败，检查日志中的 `replacement characters` 警告
- 考虑手动转换文件编码

### Q5: 如何清除索引数据？

**A**:
```bash
# 删除索引数据
rm ~/.acemcp/data/projects.json

# 重新索引
npm start
```

### Q6: Python 和 Node.js 版本可以共存吗？

**A**: 
- ✅ 可以！它们共享相同的配置和数据格式
- 使用相同的 `~/.acemcp/` 目录
- 可以无缝切换

### Q7: 如何更新配置？

**A**: 三种方法：

1. **直接编辑配置文件**：
   ```bash
   nano ~/.acemcp/settings.toml
   # 重启服务器生效
   ```

2. **使用 Web 界面**：
   - 在线修改配置
   - 点击保存
   - 立即生效（无需重启）

3. **命令行参数**：
   ```bash
   npm start -- --base-url https://new-api.com --token new-token
   ```

### Q8: 如何查看详细日志？

**A**:
```bash
# 实时查看日志
tail -f ~/.acemcp/log/acemcp.log

# Windows PowerShell
Get-Content -Path "$env:USERPROFILE\.acemcp\log\acemcp.log" -Wait
```

---

## 🎯 完整测试流程示例

### 1. 准备环境

```bash
cd D:/my_project/Ace-Mcp/Ace-Mcp-Node
npm install
npm run build
```

### 2. 配置 API

```bash
# 编辑配置文件
notepad C:\Users\<你的用户名>\.acemcp\settings.toml

# 设置：
# BASE_URL = "https://your-api.com"
# TOKEN = "your-token"
```

### 3. 启动服务器（带 Web 界面）

```bash
npm start -- --web-port 8080
```

### 4. 访问 Web 界面

打开浏览器：http://localhost:8080

### 5. 测试索引

在 Web 界面的工具调试器中：

```json
{
  "tool_name": "search_context",
  "arguments": {
    "project_root_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node",
    "query": "express web application setup"
  }
}
```

### 6. 观察结果

- 实时日志中应显示索引进度
- 工具调试器返回搜索结果
- 服务器状态显示已索引项目数 +1

### 7. 在 Cursor 中使用

1. 配置 Cursor MCP 服务器
2. 重启 Cursor
3. 在项目中使用 `@acemcp` 搜索代码

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**：
   - [README.md](./README.md)
   - [FINAL_CODE_REVIEW.md](./FINAL_CODE_REVIEW.md)

2. **检查日志**：
   - `~/.acemcp/log/acemcp.log`

3. **提交 Issue**：
   - 包含错误日志
   - 包含配置信息（隐藏敏感信息）
   - 描述复现步骤

4. **联系作者**：
   - Email: wmymz@icloud.com

---

## ✅ 成功标准

索引和搜索功能正常工作的标志：

- ✅ 服务器启动无错误
- ✅ Web 界面可以访问
- ✅ 索引项目成功（日志中显示上传的 blob 数量）
- ✅ 搜索返回相关代码片段
- ✅ 增量索引不会重复上传文件
- ✅ 日志文件正常轮转

恭喜！你的 Ace-MCP 服务器已经正常工作了！🎉

