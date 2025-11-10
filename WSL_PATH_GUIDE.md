# WSL 路径支持指南

Ace-Mcp-Node 完全支持 Windows Subsystem for Linux (WSL) 路径格式，实现跨平台无缝集成。

## 📋 支持的路径格式

### 1. Windows 本地路径
```
输入: C:\Users\username\project
输出: C:/Users/username/project
```
- 自动转换反斜杠为正斜杠
- 保持盘符和路径结构

### 2. WSL 内部路径
```
输入: /home/user/project
输出: /home/user/project
```
- Unix 风格路径保持不变
- 适用于在 WSL 环境内运行

### 3. WSL 访问 Windows 路径（自动转换 🔄）
```
输入: /mnt/c/Users/username/project
输出 (Windows 环境): C:/Users/username/project
输出 (WSL 环境): /mnt/c/Users/username/project
```
- WSL 挂载的 Windows 驱动器
- **v0.1.5+**: Windows 环境自动转换为 Windows 路径
- WSL 环境保持原样

### 4. Windows 访问 WSL 路径 ⭐
```
输入: \\wsl$\Ubuntu\home\user\project
输出: /home/user/project
```
- 自动提取 WSL 文件系统路径
- 支持所有 Linux 分发版（Ubuntu、Debian、SUSE 等）
- 支持带版本号的分发版（如 Ubuntu-20.04）

## 🚀 使用示例

### 自动路径转换（v0.1.5+）

**在 Windows 环境下，`/mnt/c/` 路径会自动转换为 Windows 路径**：

```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "/mnt/c/Users/username/myproject",
    "query": "search query"
  }
}
```

自动转换为：`C:/Users/username/myproject` ✅

这意味着您可以在 Windows 和 WSL 之间使用相同的路径配置！

### MCP 工具调用

#### 从 Windows 访问 WSL 项目
```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "\\\\wsl$\\Ubuntu\\home\\user\\myproject",
    "query": "authentication logic"
  }
}
```

#### WSL 内部项目
```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "/home/user/myproject",
    "query": "database connection"
  }
}
```

#### Windows 本地项目
```json
{
  "tool": "search_context",
  "arguments": {
    "project_root_path": "C:/Users/username/myproject",
    "query": "error handling"
  }
}
```

### MCP 客户端配置

#### 标准 Windows 配置
```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": ["C:/Projects/Ace-Mcp-Node/dist/index.js"],
      "env": {}
    }
  }
}
```

#### WSL 环境配置
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

## 🔍 路径转换详解

### WSL UNC 路径解析

Windows 使用特殊的 UNC 路径访问 WSL 文件系统：

```
\\wsl$\<Distribution>\<Path>
  ↓
/<Path>
```

**示例**:
```
\\wsl$\Ubuntu\home\user\project
  → 分发版: Ubuntu
  → WSL 路径: /home/user/project

\\wsl$\Debian\srv\app
  → 分发版: Debian
  → WSL 路径: /srv/app

\\wsl$\Ubuntu-20.04\opt\data
  → 分发版: Ubuntu-20.04
  → WSL 路径: /opt/data
```

### 路径规范化流程

```typescript
// 1. 检测路径类型
if (path.startsWith('\\\\wsl$\\')) {
  // WSL UNC 路径
  extractWSLPath();
} else if (path.startsWith('/')) {
  // Unix 风格路径
  keepUnchanged();
} else {
  // Windows 路径
  convertSlashes();
}

// 2. 统一格式
// 所有路径最终使用正斜杠 (/)
```

## ⚠️ 常见问题

### Q1: 为什么 Windows 路径要使用正斜杠？
**A**: 正斜杠是跨平台标准，确保路径在不同系统间的一致性。Windows 和 Node.js 都支持正斜杠路径。

### Q2: 路径中的中文字符会有问题吗？
**A**: 不会。路径处理完全支持 Unicode 字符，包括中文、日文等多语言路径。

### Q3: 相对路径可以使用吗？
**A**: 相对路径会自动转换为绝对路径。建议直接使用绝对路径以避免歧义。

### Q4: 符号链接会被跟随吗？
**A**: 符号链接指向项目外部的文件会被跳过，并记录警告日志。

### Q5: 不完整的 WSL 路径会怎样？
**A**: 例如 `\\wsl$\Ubuntu`（缺少实际路径）会触发警告并回退到标准路径解析。

## 🔧 技术实现

### 核心模块
路径处理逻辑集中在 `src/utils/pathUtils.ts`：

```typescript
import { normalizeProjectPath } from './utils/pathUtils.js';

// 自动处理所有路径格式
const normalized = normalizeProjectPath(userInput);
```

### 输入验证
- ✅ 拒绝空字符串
- ✅ 拒绝 null/undefined
- ✅ 类型检查（必须为字符串）
- ✅ trim 空白字符

### 错误处理
```typescript
try {
  const normalized = normalizeProjectPath(input);
} catch (error) {
  // 友好的错误消息
  console.error(`Invalid path: ${error.message}`);
}
```

### 日志记录
- **DEBUG**: WSL 路径转换详情
- **WARNING**: 不完整或异常路径
- **INFO**: 项目索引操作

## 📊 兼容性矩阵

| 场景 | 支持 | 自动转换 | 说明 |
|------|------|---------|------|
| Windows → Windows 项目 | ✅ | ✅ | 反斜杠转正斜杠 |
| Windows → WSL 项目 | ✅ | ✅ | UNC 路径转 Unix 路径 |
| WSL → WSL 项目 | ✅ | - | 保持原样 |
| WSL → Windows 项目 | ✅ | - | /mnt/c/ 格式保持原样 |
| 混合环境 | ✅ | ✅ | 路径自动规范化 |

## 🎯 最佳实践

1. **推荐路径格式**:
   - Windows: `C:/Users/username/project`
   - WSL: `/home/user/project`

2. **避免**:
   - 混合使用反斜杠和正斜杠
   - 相对路径（除非必要）
   - 手动拼接路径字符串

3. **调试技巧**:
   - 检查日志文件：`~/.acemcp/log/acemcp.log`
   - 查找 "Converted Windows WSL UNC path" 消息
   - 确认规范化后的路径格式

## 📚 相关文档

- [Ace-Mcp-Node 路径处理规范](../.cursor/rules/acemcp-node-path-handling.mdc)
- [README.md](README.md) - 主要文档
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - 使用指南

## 🔗 技术参考

- 核心实现: `src/utils/pathUtils.ts`
- 工具使用: `src/tools/searchContext.ts`
- Web API: `src/web/app.ts`
- IndexManager: `src/index/manager.ts`

---

**版本**: 1.0.0  
**最后更新**: 2025-01-10  
**适用于**: Ace-Mcp-Node v0.1.4+

