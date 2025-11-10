# Bug 修复总结

## 🐛 问题

### 问题 1: iconv.decode is not a function
**错误日志**：
```
WARNING - Failed to read file: index.html - TypeError: iconv.decode is not a function
```

**原因**：`iconv-lite` 库的导入方式错误。

**修复**：
```typescript
// 修改前 ❌
import * as iconv from 'iconv-lite';

// 修改后 ✅
import iconv from 'iconv-lite';
```

**文件**：`src/index/manager.ts` 第 11 行

---

### 问题 2: MCP stdio 通信被日志污染
**错误日志**：
```
Error from MCP server: SyntaxError: Unexpected token '2025-"... is not valid JSON
```

**原因**：
- MCP 通过 **stdio** (标准输入输出) 通信
- 所有 **stdout** 输出必须是 JSON-RPC 格式
- Logger 向 `console.log()` 输出文本日志，污染了 stdout
- MCP 客户端无法解析这些文本，导致 JSON 解析错误

**修复**：
1. 添加 `enableConsole` 配置（默认 `false`）
2. 将 `console.log()` 改为 `process.stderr.write()`
3. 仅在 Web 模式下启用控制台输出

**关键改动**：

```typescript
// logger.ts
interface LoggerConfig {
  enableConsole: boolean; // 新增：是否启用控制台输出
}

// 默认禁用控制台输出（MCP stdio 模式）
const defaultConfig: LoggerConfig = {
  enableConsole: false, // ✅ 关键：避免污染 stdio
};

// 使用 stderr 而不是 stdout
if (this.config.enableConsole && level >= this.config.consoleLevel) {
  process.stderr.write(`${timeStr} | ${levelStr} | ${msgStr}\n`); // ✅ 输出到 stderr
}
```

**文件**：`src/logger.ts`

---

## ✅ 验证修复

### 1. 编译
```bash
npm run build
```

### 2. 测试
```bash
npm test
```
**预期输出**：
```
🎉 所有测试通过！
```

### 3. 在 Cursor 中使用

#### 步骤 1：完全退出 Cursor
- 不是重启，是**完全退出**
- Windows: 右键任务栏图标 → 退出

#### 步骤 2：确认配置
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

#### 步骤 3：重新启动 Cursor

#### 步骤 4：测试搜索
```
搜索项目中的 HTML 文件内容
```

---

## 🎯 预期结果

### 修复前 ❌
```
WARNING - Failed to read file: index.html - TypeError: iconv.decode is not a function
WARNING - Collected 0 blobs
Error: Unexpected token '2025-"... is not valid JSON
```

### 修复后 ✅
```
INFO - Collected 2 blobs from C:/Users/liuqiang/Desktop/天气9
INFO - Successfully uploaded 2 blobs
INFO - Search completed successfully
```

---

## 📝 技术细节

### stdio vs stderr vs stdout

- **stdout** (标准输出)：MCP 用于 JSON-RPC 通信
- **stderr** (标准错误)：可用于日志输出，不影响 MCP
- **stdio** (标准输入输出)：stdin + stdout 的组合

### MCP 通信机制

```
[MCP 客户端] <--JSON-RPC via stdout/stdin--> [MCP 服务器]
```

任何非 JSON-RPC 的 stdout 输出都会破坏协议！

---

## 🔧 如果还有问题

### 1. 清理并重建
```bash
cd D:\my_project\Ace-Mcp\Ace-Mcp-Node
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
npm test
```

### 2. 查看日志
```bash
# 服务器日志
Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log -Tail 50

# 或使用 Web 界面
node dist/index.js --web-port 8900
# 访问 http://localhost:8900
```

### 3. 使用 MCP Inspector 调试
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## 📊 修复文件列表

1. ✅ `src/index/manager.ts` - 修复 iconv 导入
2. ✅ `src/logger.ts` - 修复 stdio 污染
3. ✅ 已重新编译 `npm run build`
4. ✅ 测试通过 `npm test`

---

## 🚀 现在可以正常使用了！

重启 Cursor，享受完整的代码搜索功能！🎉

