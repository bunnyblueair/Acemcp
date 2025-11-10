# Acemcp Node.js 实现

> MCP 服务器，用于代码库索引和语义搜索 - Node.js 实现

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## 📖 简介

Acemcp 是一个 MCP (Model Context Protocol) 服务器，提供代码库索引和语义搜索功能。此 Node.js 实现与 Python 版本完全兼容，共享相同的配置文件和数据格式。

### 主要特性

- ✅ **完整的 MCP 服务器功能** - 实现 `search_context` 工具
- ✅ **增量索引** - 仅索引新文件或修改的文件
- ✅ **文件分割** - 大文件自动分割为多个块
- ✅ **.gitignore 支持** - 自动排除 .gitignore 中的文件
- ✅ **多编码支持** - 支持 UTF-8, GBK, GB2312, Latin-1
- ✅ **批量上传** - 支持批量上传和自动重试
- ✅ **Web 管理界面** - 配置管理、实时日志、工具调试
- ✅ **数据兼容** - 与 Python 版本共享数据格式
- ✅ **WSL 路径支持** - 完全支持 Windows Subsystem for Linux 路径

## 📦 安装

### 前置要求

- Node.js >= 18.0.0
- npm 或其他包管理器

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/Ace-Mcp.git
cd Ace-Mcp/Ace-Mcp-Node

# 安装依赖
npm install

# 编译 TypeScript
npm run build
```

## 🚀 使用

### 配置

首次运行时，程序会在 `~/.acemcp/` 目录下创建配置文件：

```toml
# ~/.acemcp/settings.toml

BASE_URL = "https://api.example.com"
TOKEN = "your-token-here"
BATCH_SIZE = 10
MAX_LINES_PER_BLOB = 800

TEXT_EXTENSIONS = [
  ".py", ".js", ".ts", ".jsx", ".tsx",
  ".java", ".go", ".rs", ".cpp", ".c",
  ".h", ".hpp", ".cs", ".rb", ".php",
  ".md", ".txt", ".json", ".yaml", ".yml",
  ".toml", ".xml", ".html", ".css", ".scss",
  ".sql", ".sh", ".bash"
]

EXCLUDE_PATTERNS = [
  ".venv", "venv", ".env", "env",
  "node_modules", ".git", ".svn", ".hg",
  "__pycache__", ".pytest_cache", ".mypy_cache",
  ".tox", ".eggs", "*.egg-info",
  "dist", "build", ".idea", ".vscode",
  ".DS_Store", "*.pyc", "*.pyo", "*.pyd"
]
```

### 启动 MCP 服务器

```bash
# 标准模式（stdio）
npm start

# 或使用开发模式（带自动重载）
npm run dev

# 使用自定义配置
npm start -- --base-url https://your-api.com --token your-token

# 启动 Web 管理界面
npm start -- --web-port 8080
```

### WSL 路径支持

Ace-Mcp-Node 完全支持 Windows Subsystem for Linux (WSL) 路径格式：

| 路径类型 | 示例 | 说明 |
|---------|------|------|
| **Windows 本地** | `C:\Users\username\project` | 自动转换为 `C:/Users/username/project` |
| **WSL 内部** | `/home/user/project` | 保持不变（仅 WSL 环境） |
| **WSL 访问 Windows** | `/mnt/c/Users/username/project` | Windows 环境自动转为 `C:/Users/username/project` ⭐ |
| **Windows 访问 WSL** | `\\wsl$\Ubuntu\home\user\project` | 自动转换为 `/home/user/project` |

**使用示例**:

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "\\\\wsl$\\Ubuntu\\home\\user\\myproject",
    "query": "function definition"
  }
}
```

**注意**: 
- 路径将自动规范化为统一格式（使用正斜杠）
- 末尾斜杠会被自动移除
- 遇到路径问题请参考 [路径故障排查指南](PATH_TROUBLESHOOTING.md)

### 在 MCP 客户端中配置

在你的 MCP 客户端配置文件中添加：

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": ["/path/to/Ace-Mcp-Node/dist/index.js"],
      "env": {}
    }
  }
}
```

**WSL 环境配置示例**:

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

或使用 Web 管理界面：

```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "/path/to/Ace-Mcp-Node/dist/index.js",
        "--web-port",
        "8080"
      ],
      "env": {}
    }
  }
}
```

## 🔧 工具说明

### search_context

搜索项目代码库中与查询相关的代码片段。

**参数：**

- `project_root_path` (string, 必需): 项目根目录的绝对路径，使用正斜杠 `/` 作为路径分隔符
  - 示例: `C:/Users/username/projects/myproject`
- `query` (string, 必需): 自然语言搜索查询
  - 示例: `"logging configuration setup"`, `"user authentication login"`

**功能：**

1. 自动对项目进行增量索引
2. 执行语义搜索
3. 返回格式化的代码片段，包含文件路径和行号

**使用示例：**

```typescript
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/Users/username/projects/myproject",
    "query": "logging configuration setup initialization"
  }
}
```

## 🌐 Web 管理界面

启动 Web 界面：

```bash
npm start -- --web-port 8080
```

然后访问 http://localhost:8080

### Web 界面功能

- **服务器状态** - 查看运行状态和已索引项目数量
- **配置管理** - 在线编辑和保存配置
- **实时日志** - 通过 WebSocket 查看实时日志
- **工具调试** - 调试 MCP 工具调用
- **双语支持** - 支持中文和英文界面

## 📁 项目结构

```
Ace-Mcp-Node/
├── src/
│   ├── index.ts              # MCP 服务器入口
│   ├── config.ts             # 配置管理
│   ├── logger.ts             # 日志系统
│   ├── index/
│   │   └── manager.ts        # 索引管理器
│   ├── tools/
│   │   └── searchContext.ts # search_context 工具
│   └── web/
│       ├── app.ts            # Express 应用
│       ├── logBroadcaster.ts # WebSocket 日志广播
│       └── templates/
│           └── index.html    # Web 界面
├── dist/                     # 编译后的 JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 与 Python 版本的兼容性

Node.js 实现与 Python 版本完全兼容：

- **共享配置文件** - 使用相同的 `~/.acemcp/settings.toml`
- **共享数据格式** - 使用相同的 `~/.acemcp/data/projects.json`
- **相同的 API 接口** - 调用相同的索引和搜索 API
- **相同的哈希算法** - 使用相同的 SHA-256 计算 blob_name

可以在 Python 和 Node.js 版本之间无缝切换。

## 🛠 开发

### 开发模式

```bash
# 启动开发服务器（自动重载）
npm run dev

# 构建项目
npm run build

# 启动 Web 界面（开发模式）
npm run dev -- --web-port 8080
```

### 脚本说明

- `npm run build` - 编译 TypeScript 到 dist/
- `npm run dev` - 开发模式（使用 tsx watch）
- `npm start` - 运行编译后的代码
- `npm start:web` - 启动带 Web 界面的服务器

## 📝 日志

日志文件位置：`~/.acemcp/log/acemcp.log`

- 自动日志轮转（单文件最大 5MB）
- 保留最近 10 个日志文件
- 控制台输出 INFO 级别及以上
- 文件输出 DEBUG 级别及以上

## 🐛 故障排除

### 路径问题

如果遇到 "Project root path does not exist" 错误：

1. **检查路径末尾是否有斜杠** - 路径末尾不应包含 `/` 或 `\`（v0.1.5+ 自动移除）
2. **验证路径存在** - 使用 `ls` (Unix) 或 `dir` (Windows) 检查
3. **使用绝对路径** - 避免使用相对路径
4. **参考文档** - 查看 [路径故障排查指南](PATH_TROUBLESHOOTING.md)

**相关文档**:
- [WSL 路径支持指南](WSL_PATH_GUIDE.md) - WSL 环境专用指南
- [路径故障排查指南](PATH_TROUBLESHOOTING.md) - 详细的路径问题诊断

### 编码问题

如果遇到文件编码错误，程序会自动尝试多种编码（UTF-8, GBK, GB2312, Latin-1）。

### 连接问题

检查 `BASE_URL` 和 `TOKEN` 配置是否正确：

```bash
cat ~/.acemcp/settings.toml
```

### Web 界面无法访问

确保指定的端口未被占用：

```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

## 📄 许可证

ISC License

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📧 联系方式

- 作者: wmymz
- Email: wmymz@icloud.com

## 🙏 致谢

基于 Python 版本的 Acemcp 项目实现。

