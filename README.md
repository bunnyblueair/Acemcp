# Acemcp Node.js 实现

[![npm version](https://img.shields.io/npm/v/acemcp-node.svg)](https://www.npmjs.com/package/acemcp-node)
[![npm downloads](https://img.shields.io/npm/dm/acemcp-node.svg)](https://www.npmjs.com/package/acemcp-node)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
  <img src="https://img.shields.io/badge/MCP-Model%20Context%20Protocol-orange" alt="MCP">
  <img src="https://img.shields.io/badge/AI-Ready-success" alt="AI Ready">

## 📑 目录

- [简介](#-简介)
- [核心特性](#-核心特性)
- [快速开始](#-快速开始)
- [安装](#-安装)
- [配置](#-配置)
- [使用指南](#-使用指南)
  - [MCP 客户端配置](#在-mcp-客户端中配置)
  - [工具说明](#-工具说明)
  - [Web 管理界面](#-web-管理界面)
- [WSL 支持](#-wsl-路径支持完全指南)
- [API 文档](#-api-文档)
- [示例场景](#-使用场景示例)
- [开发指南](#-开发)
- [故障排除](#-故障排除)
- [兼容性](#-与-python-版本的兼容性)
- [贡献](#-贡献)
- [许可证](#-许可证)

---

## 📖 简介

**Acemcp** 是一个高性能的 MCP (Model Context Protocol) 服务器，专为 AI 助手（如 Claude、GPT 等）提供**代码库索引**和**语义搜索**能力。通过 Acemcp，AI 助手可以：

- 🔍 快速搜索和理解大型代码库
- 📊 获取带行号的精确代码片段
- 🤖 自动增量更新索引
- 🌐 通过 Web 界面管理和调试

**为什么选择 Acemcp？**

| 特点 | 说明 |
|------|------|
| **零配置启动** | 首次运行自动生成配置 |
| **增量索引** | 只处理变更文件，快速高效 |
| **跨平台** | Windows、Linux、macOS、WSL 全支持 |
| **多编码** | 自动检测 UTF-8、GBK、GB2312、Latin-1 |
| **AI 友好** | 返回格式化的代码片段，含文件路径和行号 |

---

## ⭐ 核心特性

<table>
<tr>
<td width="50%">

### 🚀 性能优化
- ✅ **增量索引** - 仅索引新文件或修改的文件
- ✅ **批量上传** - 支持批量操作和自动重试
- ✅ **智能分割** - 大文件自动分割为多个块
- ✅ **缓存机制** - SHA-256 哈希避免重复上传

</td>
<td width="50%">

### 🛠 开发友好
- ✅ **TypeScript** - 完整类型支持
- ✅ **Web 界面** - 实时日志、配置管理、工具调试
- ✅ **.gitignore 支持** - 自动排除无关文件
- ✅ **详细日志** - 可配置的日志级别和轮转

</td>
</tr>
<tr>
<td width="50%">

### 🌍 兼容性
- ✅ **跨平台路径** - 统一处理 Windows/Unix 路径
- ✅ **WSL 完整支持** - UNC 路径、/mnt 自动转换
- ✅ **多编码支持** - UTF-8, GBK, GB2312, Latin-1
- ✅ **Python 版本兼容** - 共享配置和数据格式

</td>
<td width="50%">

### 🎯 MCP 集成
- ✅ **标准 MCP 协议** - 完整实现 SDK
- ✅ **search_context 工具** - 语义搜索代码片段
- ✅ **stdio 传输** - 标准输入输出通信
- ✅ **灵活配置** - 命令行参数 + 配置文件

</td>
</tr>
</table>

---

## 🚀 快速开始

### 方式一：通过 NPM 安装（推荐）

```bash
# 全局安装
npm install -g acemcp-node

# 或本地安装到项目
npm install acemcp-node
```

### 方式二：从源码安装

```bash
# 克隆仓库
git clone https://github.com/yeuxuan/Ace-Mcp-Node.git
cd Ace-Mcp-Node

# 安装依赖
npm install

# 编译 TypeScript
npm run build
```

### 首次运行

```bash
# 启动服务器（首次会创建配置文件）
npm start

# 或启动带 Web 界面
npm start -- --web-port 8080
```

访问 http://localhost:8080 查看 Web 管理界面！

---

## 📦 安装

### 系统要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0（或 yarn、pnpm）
- **操作系统**：Windows 10+、Linux、macOS、WSL 2

### 详细安装步骤

#### 1. NPM 全局安装（推荐用于 MCP 客户端）

```bash
npm install -g acemcp-node

# 验证安装
node -e "console.log(require('acemcp-node/package.json').version)"
```

#### 2. NPM 本地安装（用于项目集成）

```bash
# 创建项目目录
mkdir my-mcp-project && cd my-mcp-project

# 初始化 package.json
npm init -y

# 安装 acemcp-node
npm install acemcp-node

# 运行
npx acemcp-node
```

#### 3. 从源码开发安装

```bash
git clone https://github.com/yeuxuan/Ace-Mcp-Node.git
cd Ace-Mcp-Node
npm install
npm run build

# 开发模式（自动重载）
npm run dev
```

---

### 配置文件

首次运行时，程序会在 `~/.acemcp/` 目录下自动创建配置文件：

#### 配置文件位置

```
~/.acemcp/
├── settings.toml     # 主配置文件
├── data/
│   └── projects.json # 项目索引数据
└── log/
    └── acemcp.log    # 日志文件
```

#### settings.toml 配置详解

```toml
# ~/.acemcp/settings.toml

# === API 配置 ===
BASE_URL = "https://api.example.com"  # 索引服务器地址
TOKEN = "your-token-here"              # 访问令牌

# === 索引配置 ===
BATCH_SIZE = 10                        # 批量上传数量（1-50）
MAX_LINES_PER_BLOB = 800               # 单个代码块最大行数

# === 文件类型配置 ===
# 支持索引的文本文件扩展名
TEXT_EXTENSIONS = [
  # 编程语言
  ".py", ".js", ".ts", ".jsx", ".tsx",
  ".java", ".go", ".rs", ".cpp", ".c",
  ".h", ".hpp", ".cs", ".rb", ".php",
  ".swift", ".kt", ".scala", ".clj",
  
  # 配置和数据
  ".md", ".txt", ".json", ".yaml", ".yml",
  ".toml", ".xml", ".ini", ".conf",
  
  # Web 相关
  ".html", ".css", ".scss", ".sass", ".less",
  
  # 脚本
  ".sql", ".sh", ".bash", ".ps1", ".bat"
]

# === 排除模式 ===
# 不会被索引的目录和文件模式
EXCLUDE_PATTERNS = [
  # 虚拟环境
  ".venv", "venv", ".env", "env",
  "node_modules",
  
  # 版本控制
  ".git", ".svn", ".hg",
  
  # Python 缓存
  "__pycache__", ".pytest_cache", ".mypy_cache",
  ".tox", ".eggs", "*.egg-info",
  
  # 构建产物
  "dist", "build", "target", "out",
  
  # IDE 配置
  ".idea", ".vscode", ".vs",
  
  # 系统文件
  ".DS_Store", "Thumbs.db",
  
  # 编译文件
  "*.pyc", "*.pyo", "*.pyd", "*.so", "*.dll"
]
```

#### 命令行参数覆盖

```bash
# 临时使用不同的 API 配置
npm start -- --base-url https://custom-api.com --token custom-token

# 自定义批次大小
npm start -- --batch-size 20

# 启动 Web 界面在指定端口
npm start -- --web-port 3000

# 组合使用
npm start -- --base-url https://api.com --token abc123 --web-port 8080
```

---

## 📘 使用指南

### 启动方式

#### 1. 标准 MCP 模式（stdio）

```bash
npm start
```

此模式用于 MCP 客户端集成，通过标准输入/输出通信。

#### 2. Web 管理模式

```bash
npm start -- --web-port 8080
```

访问 http://localhost:8080 使用图形界面：
- 📊 查看服务器状态
- ⚙️ 编辑配置文件
- 📝 实时日志查看
- 🛠 工具调试测试

#### 3. 开发模式

```bash
npm run dev                    # 标准模式 + 热重载
npm run dev -- --web-port 8080 # Web 模式 + 热重载
```

---

## 🔧 WSL 路径支持完全指南

Acemcp-Node 对 WSL (Windows Subsystem for Linux) 提供**完整的路径支持**，无需手动转换路径格式。

### 支持的路径格式

| 路径类型 | 原始格式 | 自动转换后 | 使用场景 |
|---------|---------|-----------|---------|
| **Windows 本地** | `C:\Users\username\project` | `C:/Users/username/project` | Windows 上的项目 |
| **WSL 内部** | `/home/user/project` | `/home/user/project` | WSL 文件系统内 |
| **WSL 访问 Windows** | `/mnt/c/Users/username/project` | `C:/Users/username/project` | WSL 中访问 Windows 文件 ⭐ |
| **Windows 访问 WSL** | `\\wsl$\Ubuntu\home\user\project` | `/home/user/project` | Windows 访问 WSL 文件 ⭐ |

### 使用示例

#### Windows 环境

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/Users/username/myproject",
    "query": "authentication logic"
  }
}
```

#### WSL 环境访问 Windows 项目

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "/mnt/c/Users/username/myproject",
    "query": "database connection"
  }
}
```

#### Windows 访问 WSL 项目

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "\\\\wsl$\\Ubuntu\\home\\user\\myproject",
    "query": "API routes"
  }
}
```

### 自动处理特性

- ✅ **路径规范化** - 统一使用正斜杠 `/`
- ✅ **末尾斜杠移除** - 自动移除路径末尾的 `/` 或 `\`
- ✅ **UNC 路径转换** - 自动识别并转换 `\\wsl$\` 格式
- ✅ **/mnt 转换** - 自动将 `/mnt/c/` 转为 `C:/`

### 故障排除

如果遇到路径问题，请参考：
- 📄 [WSL 路径支持指南](WSL_PATH_GUIDE.md) - WSL 环境专用指南
- 📄 [路径故障排查指南](PATH_TROUBLESHOOTING.md) - 详细的路径问题诊断

---

## 🔌 在 MCP 客户端中配置

### Claude Desktop 配置

编辑 Claude Desktop 配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

#### 方式一：使用全局安装的包

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "npx",
      "args": ["acemcp-node"],
      "env": {}
    }
  }
}
```

#### 方式二：指定本地路径（从源码安装）

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": ["D:/projects/Ace-Mcp-Node/dist/index.js"],
      "env": {}
    }
  }
}
```

#### 方式三：带 Web 界面

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/projects/Ace-Mcp-Node/dist/index.js",
        "--web-port",
        "8080"
      ],
      "env": {}
    }
  }
}
```

#### 方式四：自定义 API 配置

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/projects/Ace-Mcp-Node/dist/index.js",
        "--base-url",
        "https://your-api.com",
        "--token",
        "your-token-here"
      ],
      "env": {}
    }
  }
}
```

#### WSL 环境特殊配置

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": ["\\\\wsl$\\Ubuntu\\home\\user\\Ace-Mcp-Node\\dist\\index.js"],
      "env": {}
    }
  }
}
```

### 其他 MCP 客户端

对于支持 MCP 协议的其他客户端（如 Zed、Cursor 等），配置方式类似，请参考各客户端的 MCP 配置文档。

### 验证配置

配置完成后：
1. 重启 MCP 客户端
2. 检查日志文件：`~/.acemcp/log/acemcp.log`
3. 如果启用了 Web 界面，访问 http://localhost:8080

---

## 📚 API 文档

### `search_context` 工具

在项目代码库中执行**语义搜索**，自动进行增量索引并返回相关代码片段。

#### 参数

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `project_root_path` | string | ✅ | 项目根目录的**绝对路径**，使用正斜杠 `/` | `C:/Users/username/myproject` |
| `query` | string | ✅ | 自然语言搜索查询 | `"authentication middleware"` |

#### 功能流程

```
1. 接收搜索请求
   ↓
2. 检查项目索引状态
   ↓
3. 执行增量索引（仅新增/修改文件）
   ├─ 收集文件（遵循 .gitignore）
   ├─ 分割大文件
   ├─ 计算 SHA-256 哈希
   └─ 批量上传到服务器
   ↓
4. 执行语义搜索
   ↓
5. 返回格式化结果（文件路径 + 行号 + 代码片段）
```

#### 返回格式

```typescript
interface SearchResult {
  type: 'text';
  text: string; // 格式化的搜索结果
}
```

**返回示例**：

```
Found 3 relevant code snippets:

────────────────────────────────────────

File: src/auth/middleware.ts (Lines 15-28)

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

────────────────────────────────────────

File: src/auth/login.ts (Lines 42-56)
...
```

#### 使用示例

##### 示例 1：搜索认证逻辑

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/Users/username/myproject",
    "query": "user authentication and JWT token verification"
  }
}
```

##### 示例 2：搜索数据库配置

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "/home/user/backend-api",
    "query": "database connection pool configuration"
  }
}
```

##### 示例 3：搜索错误处理

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "D:/projects/react-app",
    "query": "error boundary and exception handling in React components"
  }
}
```

#### 错误处理

| 错误类型 | 返回信息 | 解决方案 |
|---------|---------|---------|
| 路径不存在 | `Error: Project root path does not exist` | 检查路径拼写和权限 |
| 缺少参数 | `Error: project_root_path is required` | 提供所有必需参数 |
| API 连接失败 | `Error: Failed to connect to API` | 检查 BASE_URL 和 TOKEN 配置 |
| 索引失败 | `Error: Failed to index project` | 查看日志文件诊断 |

---

## 💡 使用场景示例

### 场景 1：AI 助手代码审查

**需求**：让 AI 助手理解项目的认证机制

```
用户：@acemcp 我的项目中是如何实现用户认证的？

AI 助手调用：
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/projects/my-saas-app",
    "query": "user authentication login signup middleware"
  }
}

结果：AI 获取认证相关代码，理解实现方式，提供审查建议
```

### 场景 2：Bug 调试

**需求**：定位支付模块的错误处理

```
用户：@acemcp 支付失败时的错误是如何处理的？

AI 助手调用：
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "D:/ecommerce-backend",
    "query": "payment error handling failure rollback"
  }
}

结果：快速定位支付错误处理逻辑，发现潜在问题
```

### 场景 3：新功能开发

**需求**：了解现有 API 路由结构

```
用户：@acemcp 我需要添加一个新的 API 端点，现有的路由是怎么组织的？

AI 助手调用：
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "/home/dev/api-server",
    "query": "API routes endpoints definition express router"
  }
}

结果：理解路由结构，按照现有模式实现新端点
```

### 场景 4：文档生成

**需求**：为工具函数生成文档

```
用户：@acemcp 帮我为 utils 目录下的工具函数生成文档

AI 助手调用：
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/company/shared-utils",
    "query": "utility helper functions in utils directory"
  }
}

结果：获取所有工具函数，自动生成 JSDoc/TSDoc 文档
```

### 场景 5：代码重构

**需求**：找到所有使用旧 API 的地方

```
用户：@acemcp 我们要废弃 legacyApi，找到所有调用它的地方

AI 助手调用：
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "D:/legacy-app",
    "query": "legacyApi function calls usage"
  }
}

结果：列出所有调用点，规划重构策略
```

---

## 🌐 Web 管理界面

### 启动 Web 界面

```bash
# 标准端口 8080
npm start -- --web-port 8080

# 自定义端口
npm start -- --web-port 3000
```

访问：http://localhost:8080

### 功能特性

| 功能模块 | 说明 | 用途 |
|---------|------|------|
| **📊 服务器状态** | 实时显示运行状态、索引项目数、配置信息 | 监控服务器健康状况 |
| **⚙️ 配置管理** | 在线编辑 `settings.toml`，保存后立即生效 | 无需手动编辑配置文件 |
| **📝 实时日志** | WebSocket 推送实时日志，支持过滤和搜索 | 调试和问题诊断 |
| **🛠 工具调试** | 模拟 MCP 工具调用，测试搜索查询 | 开发和测试 |
| **🌍 双语支持** | 中文/英文界面切换 | 国际化支持 |

### 界面预览

#### 服务器状态面板
```
┌─────────────────────────────────────┐
│ 🟢 MCP Server Status                │
│                                     │
│ Status:          Running            │
│ Indexed Projects: 5                 │
│ Port:            8080               │
│ Base URL:        https://api...     │
└─────────────────────────────────────┘
```

#### 配置编辑器
- 语法高亮 TOML 编辑器
- 实时验证
- 一键保存和应用

#### 实时日志查看器
- 彩色日志级别标识（DEBUG/INFO/WARNING/ERROR）
- 自动滚动
- 日志搜索和过滤
- 导出日志

#### 工具调试面板
```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/your/project",
    "query": "your search query"
  }
}
```
点击"测试工具"按钮，查看返回结果。

### 安全建议

⚠️ **重要**：Web 界面**仅绑定 localhost**，不对外网开放。

如需远程访问：
1. 使用 SSH 隧道：`ssh -L 8080:localhost:8080 user@server`
2. 配置反向代理（Nginx/Caddy）并添加认证
3. **不要**直接暴露在公网

---

## 📁 项目结构

```
Ace-Mcp-Node/
├── src/                          # TypeScript 源代码
│   ├── index.ts                  # 🚪 MCP 服务器入口点
│   │                             #    - 初始化 MCP 服务器
│   │                             #    - 注册工具
│   │                             #    - 处理命令行参数
│   │
│   ├── config.ts                 # ⚙️ 配置管理单例
│   │                             #    - 加载 settings.toml
│   │                             #    - 生成默认配置
│   │                             #    - 提供配置访问接口
│   │
│   ├── logger.ts                 # 📝 日志系统单例
│   │                             #    - 文件日志轮转
│   │                             #    - 控制台输出
│   │                             #    - WebSocket 广播集成
│   │
│   ├── index/                    # 📊 索引管理模块
│   │   └── manager.ts            #    - 增量索引逻辑
│   │                             #    - 文件收集和分割
│   │                             #    - .gitignore 解析
│   │                             #    - SHA-256 哈希计算
│   │                             #    - 批量上传
│   │
│   ├── tools/                    # 🛠 MCP 工具实现
│   │   └── searchContext.ts     #    - search_context 工具
│   │                             #    - 参数验证
│   │                             #    - 搜索 API 调用
│   │
│   ├── utils/                    # 🔧 工具函数
│   │   ├── pathUtils.ts          #    - 路径规范化
│   │   │                         #    - WSL 路径转换
│   │   │                         #    - UNC 路径处理
│   │   └── detailedLogger.ts     #    - 详细日志格式化
│   │
│   └── web/                      # 🌐 Web 管理界面
│       ├── app.ts                #    - Express 应用
│       │                         #    - API 路由
│       │                         #    - WebSocket 服务器
│       ├── logBroadcaster.ts     #    - 日志广播器
│       └── templates/
│           └── index.html        #    - 单页应用界面
│
├── dist/                         # 📦 编译输出（发布到 NPM）
│   ├── *.js                      #    - 编译后的 JavaScript
│   ├── *.d.ts                    #    - TypeScript 类型定义
│   ├── *.js.map                  #    - Source Maps
│   └── web/templates/            #    - Web 界面资源
│
├── node_modules/                 # 依赖包（不发布）
│
├── package.json                  # 📋 NPM 包配置
├── tsconfig.json                 # 📋 TypeScript 编译配置
├── LICENSE                       # 📄 ISC 许可证
├── README.md                     # 📖 本文档
│
└── docs/                         # 📚 额外文档
    ├── PATH_TROUBLESHOOTING.md   #    - 路径问题排查
    ├── WSL_PATH_GUIDE.md         #    - WSL 路径指南
    └── USAGE_GUIDE.md            #    - 详细使用指南
```

### 用户数据目录

```
~/.acemcp/                        # 用户配置和数据
├── settings.toml                 # 主配置文件
├── data/
│   └── projects.json             # 项目索引元数据
└── log/
    ├── acemcp.log                # 当前日志
    ├── acemcp.log.1              # 轮转日志
    └── ...                       # 保留最近 10 个
```

---

## 🔄 与 Python 版本的兼容性

Acemcp-Node 与 [Acemcp-Python](https://github.com/yeuxuan/Ace-Mcp-Python) **完全兼容**，可以无缝切换。

| 兼容项 | 说明 | 位置 |
|--------|------|------|
| **配置文件** | 共享同一个 `settings.toml` | `~/.acemcp/settings.toml` |
| **项目数据** | 共享项目索引元数据 | `~/.acemcp/data/projects.json` |
| **API 接口** | 调用相同的索引和搜索 API | `BASE_URL` 配置 |
| **哈希算法** | 使用相同的 SHA-256 计算 `blob_name` | 增量索引 |
| **文件格式** | TOML 配置、JSON 数据 | 通用格式 |

### 切换版本

```bash
# 从 Python 版本切换到 Node.js 版本
# 1. 停止 Python 版本
pkill -f acemcp

# 2. 启动 Node.js 版本（使用相同配置）
npm start

# 配置文件和索引数据自动共享，无需迁移
```

### 差异说明

| 特性 | Python 版本 | Node.js 版本 |
|------|------------|-------------|
| **运行时** | Python 3.10+ | Node.js 18.0+ |
| **性能** | 良好 | 略快（V8 引擎） |
| **内存占用** | 中等 | 略低 |
| **依赖管理** | pip/uv | npm/yarn/pnpm |
| **类型安全** | Type hints | TypeScript 严格模式 |
| **Web 界面** | ✅ | ✅ |
| **WSL 支持** | ✅ | ✅ |

---

## 🛠 开发

### 开发环境设置

```bash
# 1. 克隆仓库
git clone https://github.com/yeuxuan/Ace-Mcp-Node.git
cd Ace-Mcp-Node

# 2. 安装依赖
npm install

# 3. 启动开发模式（热重载）
npm run dev

# 4. 或启动带 Web 界面的开发模式
npm run dev -- --web-port 8080
```

### NPM Scripts

| 命令 | 说明 | 用途 |
|------|------|------|
| `npm run build` | 编译 TypeScript → `dist/` | 生产构建 |
| `npm run dev` | 开发模式 + 热重载 | 开发调试 |
| `npm start` | 运行编译后的代码 | 生产运行 |
| `npm start:web` | 启动带 Web 界面（8080） | Web 管理 |
| `npm test` | 运行测试脚本 | 测试 |
| `npm run copy-templates` | 复制 Web 模板 | 构建步骤 |

### 代码规范

#### TypeScript 配置

- **严格模式** - 启用所有严格类型检查
- **ES2022 目标** - 现代 JavaScript 特性
- **ESM 模块** - 使用 ES 模块系统
- **Source Maps** - 调试支持

#### 命名约定

```typescript
// 类名：PascalCase
class IndexManager {}

// 函数：camelCase
function normalizePath() {}

// 常量：UPPER_SNAKE_CASE
const USER_CONFIG_DIR = '~/.acemcp';

// 接口：PascalCase + 'I' 前缀（可选）
interface IConfig {}
```

#### 导入规范

```typescript
// ✅ 正确：ESM 必须包含 .js 扩展名
import { getConfig } from './config.js';
import { IndexManager } from './index/manager.js';

// ❌ 错误：缺少扩展名
import { getConfig } from './config';
```

### 日志系统

日志文件位置:`~/.acemcp/log/acemcp.log`

#### 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| **DEBUG** | 详细调试信息 | `logger.debug('File hash calculated')` |
| **INFO** | 重要操作记录 | `logger.info('Project indexed successfully')` |
| **WARNING** | 非致命警告 | `logger.warning('File encoding fallback')` |
| **ERROR** | 错误信息 | `logger.error('API request failed')` |
| **EXCEPTION** | 异常堆栈 | `logger.exception('Error in tool', error)` |

#### 日志配置

- **文件轮转** - 单文件最大 5MB
- **保留数量** - 最近 10 个日志文件
- **控制台** - INFO 级别及以上（非 stdio 模式）
- **文件** - DEBUG 级别及以上
- **WebSocket** - 实时广播到 Web 界面

### 添加新工具

```typescript
// 1. 创建工具文件：src/tools/myTool.ts
export async function myTool(args: { param1: string }): Promise<{ type: 'text'; text: string }> {
  try {
    // 参数验证
    if (!args.param1) {
      return { type: 'text', text: 'Error: param1 is required' };
    }
    
    // 业务逻辑
    const result = await doSomething(args.param1);
    
    return { type: 'text', text: result };
  } catch (error: any) {
    logger.exception('Error in myTool', error);
    return { type: 'text', text: `Error: ${error.message}` };
  }
}

// 2. 在 src/index.ts 中注册
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'my_tool') {
    return await myTool(request.params.arguments);
  }
  // ...
});

// 3. 添加到工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'My custom tool',
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string', description: 'Parameter 1' }
        },
        required: ['param1']
      }
    },
    // ...
  ]
}));
```

---

## 🐛 故障排除

### 常见问题速查

| 问题 | 症状 | 解决方案 |
|------|------|---------|
| **路径不存在** | `Project root path does not exist` | [路径问题](#路径问题) |
| **API 连接失败** | `Failed to connect to API` | [连接问题](#连接问题) |
| **编码错误** | `UnsupportedEncoding` | [编码问题](#编码问题) |
| **端口占用** | `EADDRINUSE` | [端口问题](#web-界面无法访问) |
| **权限错误** | `EACCES` | [权限问题](#权限问题) |
| **上传失败** | 批次上传失败 | [上传失败处理](UPLOAD_FAILURE_HANDLING.md) |
| **日志文件过大** | 日志占用空间过多 | [日志轮转配置](LOG_ROTATION_CONFIG.md) |
| **WSL 路径** | 路径转换失败 | [WSL 指南](WSL_PATH_GUIDE.md) |

### 路径问题

#### 症状
```
Error: Project root path does not exist: /invalid/path
```

#### 诊断步骤

1. **检查路径格式**
   ```bash
   # ✅ 正确格式（使用正斜杠）
   C:/Users/username/project
   
   # ❌ 错误格式（使用反斜杠）
   C:\Users\username\project
   
   # ❌ 错误格式（末尾有斜杠）
   C:/Users/username/project/
   ```

2. **验证路径存在**
   ```bash
   # Windows
   dir "C:\Users\username\project"
   
   # Linux/macOS
   ls -la /home/user/project
   
   # WSL
   ls -la /mnt/c/Users/username/project
   ```

3. **使用绝对路径**
   ```json
   {
     "project_root_path": "C:/Users/username/myproject"  // ✅ 绝对路径
   }
   ```

4. **WSL 特殊情况**
   - Windows 访问 WSL: `\\wsl$\Ubuntu\home\user\project` → 自动转换
   - WSL 访问 Windows: `/mnt/c/Users/username/project` → 自动转换

**详细指南**：
- 📄 [路径故障排查指南](PATH_TROUBLESHOOTING.md)
- 📄 [WSL 路径支持指南](WSL_PATH_GUIDE.md)

### 连接问题

#### 症状
```
Error: Failed to connect to API: https://api.example.com
```

#### 解决方案

1. **检查配置文件**
   ```bash
   cat ~/.acemcp/settings.toml
   ```

2. **验证 API 可达性**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://your-api.com/health
   ```

3. **检查网络代理**
   ```bash
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   ```

4. **临时覆盖配置**
   ```bash
   npm start -- --base-url https://your-api.com --token your-token
   ```

### 编码问题

#### 症状
```
Warning: Failed to read file with UTF-8, trying alternative encodings
```

#### 说明

Acemcp-Node **自动处理**多种编码：
1. UTF-8（默认）
2. GBK（简体中文）
3. GB2312（简体中文）
4. Latin-1（西欧语言）

如果所有编码都失败，文件将被跳过并记录警告。

#### 手动指定编码（暂不支持）

如需支持其他编码，请提交 [Issue](https://github.com/yeuxuan/Ace-Mcp-Node/issues)。

### Web 界面无法访问

#### 症状
```
Error: listen EADDRINUSE: address already in use :::8080
```

#### 解决方案

1. **检查端口占用**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   
   # Linux/macOS
   lsof -i :8080
   kill -9 <PID>
   ```

2. **使用其他端口**
   ```bash
   npm start -- --web-port 3000
   ```

3. **检查防火墙**
   ```bash
   # Windows 防火墙
   netsh advfirewall firewall show rule name=all | findstr 8080
   
   # Linux 防火墙
   sudo ufw status
   sudo ufw allow 8080
   ```

### 权限问题

#### 症状
```
Error: EACCES: permission denied
```

#### 解决方案

1. **检查目录权限**
   ```bash
   # Linux/macOS
   ls -la ~/.acemcp
   chmod 755 ~/.acemcp
   chmod 644 ~/.acemcp/settings.toml
   
   # Windows（以管理员身份运行）
   icacls "%USERPROFILE%\.acemcp" /grant %USERNAME%:F
   ```

2. **避免使用 sudo**
   ```bash
   # ❌ 不推荐
   sudo npm install -g acemcp-node
   
   # ✅ 推荐
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   npm install -g acemcp-node
   ```

### 索引失败

#### 症状
```
Error: Failed to index project: timeout
```

#### 解决方案

1. **检查项目大小**
   ```bash
   du -sh /path/to/project
   ```

2. **增加批次大小**（settings.toml）
   ```toml
   BATCH_SIZE = 20  # 默认 10，可增加到 50
   ```

3. **检查网络稳定性**
   ```bash
   ping api.example.com
   ```

4. **查看详细日志**
   ```bash
   tail -f ~/.acemcp/log/acemcp.log
   ```

### 获取帮助

如果以上方法都无法解决问题：

1. **查看日志**
   ```bash
   cat ~/.acemcp/log/acemcp.log
   ```

2. **提交 Issue**
   - 访问 [GitHub Issues](https://github.com/yeuxuan/Ace-Mcp-Node/issues)
   - 提供错误信息和日志片段
   - 描述复现步骤

3. **社区讨论**
   - 参与 [Discussions](https://github.com/yeuxuan/Ace-Mcp-Node/discussions)

---

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献方式

- 🐛 **报告 Bug** - 提交 [Issue](https://github.com/yeuxuan/Ace-Mcp-Node/issues)
- 💡 **建议功能** - 在 [Discussions](https://github.com/yeuxuan/Ace-Mcp-Node/discussions) 中讨论
- 📖 **改进文档** - 修正错误或添加示例
- 🔧 **提交代码** - Fork 并创建 Pull Request

### 开发流程

```bash
# 1. Fork 仓库
gh repo fork yeuxuan/Ace-Mcp-Node --clone

# 2. 创建特性分支
cd Ace-Mcp-Node
git checkout -b feature/my-feature

# 3. 开发和测试
npm install
npm run dev
# 进行修改...
npm run build
npm test

# 4. 提交变更
git add .
git commit -m "feat: add my feature"

# 5. 推送并创建 PR
git push origin feature/my-feature
gh pr create
```

### 代码规范

- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier（如有配置）
- 添加适当的注释和类型定义
- 保持向后兼容性

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---


## 📧 联系方式

- **作者**: yihua
- **Email**: 487735913@qq.com
- **GitHub**: [@yeuxuan](https://github.com/yeuxuan)
- **项目主页**: https://github.com/yeuxuan/Ace-Mcp-Node

---

## 🙏 致谢

- 基于 [Acemcp-Python](https://github.com/yeuxuan/Ace-Mcp-Python) 的设计和实现
- 感谢 [Model Context Protocol](https://github.com/modelcontextprotocol) 团队
- 感谢所有贡献者和使用者

---

## 🔗 相关资源

- **MCP 官方文档**: https://modelcontextprotocol.io/
- **Python 版本**: https://github.com/yeuxuan/Ace-Mcp-Python
- **NPM 包**: https://www.npmjs.com/package/acemcp-node
- **问题追踪**: https://github.com/yeuxuan/Ace-Mcp-Node/issues
- **更新日志**: [CHANGELOG.md](CHANGELOG.md)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个 Star！ ⭐**

Made with ❤️ by [yihua](https://github.com/yeuxuan)

</div>

