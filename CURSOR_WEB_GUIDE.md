# Cursor 中使用 Web 界面的完整指南

## 问题说明

当在 Cursor 的 MCP 配置中添加 `--web-port 8080` 参数后，服务器会在后台启动并监听 8080 端口，但：

✅ **正常现象**：
- Cursor 不会自动打开浏览器
- 需要手动访问 http://localhost:8080
- 服务器在 Cursor 运行时持续运行
- 关闭 Cursor 时服务器会自动停止

❌ **常见误解**：
- 以为配置后 Cursor 会自动打开 Web 界面
- 不知道需要手动在浏览器中访问

## ✅ 正确的使用流程

### 方案 1：推荐配置（标准 stdio 模式）

**最佳实践**：在 Cursor 中使用纯 stdio 模式，Web 界面单独启动

#### Cursor 配置（只用于 AI 对话）
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

#### Web 界面单独启动（用于管理和调试）
在终端中运行：
```bash
cd D:/my_project/Ace-Mcp/Ace-Mcp-Node
npm start -- --web-port 8080
```

然后在浏览器访问：http://localhost:8080

**优点**：
- ✅ Cursor AI 对话和 Web 管理完全独立
- ✅ Web 界面可以随时关闭和重启，不影响 Cursor 使用
- ✅ 更容易调试和排查问题
- ✅ 日志输出更清晰

---

### 方案 2：Cursor 启动带 Web 界面

如果坚持要在 Cursor 中启动 Web 界面：

#### Cursor 配置
```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js",
        "--web-port",
        "8080"
      ],
      "env": {}
    }
  }
}
```

#### 使用步骤
1. **保存配置后重启 Cursor**
2. **等待 5-10 秒**（让服务器完全启动）
3. **手动打开浏览器**，访问：http://localhost:8080
4. **验证服务器运行**：
   - 在 Cursor 的输出面板查看 MCP 日志
   - 或检查日志文件：`%USERPROFILE%\.acemcp\log\acemcp.log`

**注意事项**：
- ⚠️ Cursor 启动 MCP 服务器可能需要几秒钟
- ⚠️ 如果立即访问可能看到"无法连接"错误
- ⚠️ 关闭 Cursor 时 Web 界面也会停止
- ⚠️ 日志输出会混合在 Cursor 的 MCP 日志中

---

## 🔍 验证服务器是否正常运行

### 方法 1：检查端口占用
```bash
# Windows PowerShell
netstat -ano | findstr :8080

# 如果看到类似输出，说明服务器正在运行：
# TCP    0.0.0.0:8080          0.0.0.0:0              LISTENING       12345
```

### 方法 2：查看日志文件
```bash
# Windows
type %USERPROFILE%\.acemcp\log\acemcp.log

# 查找以下关键日志：
# - "正在启动 acemcp MCP 服务器..."
# - "正在启动 Web 管理界面，端口 8080"
# - "Web management interface running on http://localhost:8080"
# - "MCP 服务器已通过 stdio 连接"
```

### 方法 3：Cursor MCP 日志
1. 在 Cursor 中打开 **输出** 面板
2. 选择 **MCP Servers** 频道
3. 查找 `acemcp` 服务器的启动日志

---

## 🐛 常见问题排查

### 问题 1：浏览器显示"无法访问此网站"

**原因**：服务器还未完全启动

**解决**：
1. 等待 10 秒后重试
2. 检查端口是否被占用（见上方验证方法）
3. 查看日志文件是否有错误

### 问题 2：端口已被占用

**错误信息**：`Error: listen EADDRINUSE: address already in use :::8080`

**解决方法 A**：停止占用端口的进程
```bash
# Windows - 找到占用进程
netstat -ano | findstr :8080

# 假设 PID 是 12345，停止该进程
taskkill /PID 12345 /F
```

**解决方法 B**：使用其他端口
```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js",
        "--web-port",
        "8090"
      ],
      "env": {}
    }
  }
}
```

### 问题 3：配置文件错误

**错误信息**：`Error: BASE_URL must be configured` 或 `Error: TOKEN must be configured`

**解决**：
1. 编辑配置文件：`%USERPROFILE%\.acemcp\settings.toml`
2. 确保配置了有效的 `BASE_URL` 和 `TOKEN`：
   ```toml
   BASE_URL = "https://your-api-endpoint.com"
   TOKEN = "your-actual-token"
   ```
3. 保存后重启 Cursor

### 问题 4：日志文件路径错误

**现象**：找不到日志文件

**日志文件位置**：
- Windows: `C:\Users\你的用户名\.acemcp\log\acemcp.log`
- Linux/Mac: `~/.acemcp/log/acemcp.log`

---

## 📊 Web 界面功能说明

访问 http://localhost:8080 后，您可以：

### 1. Server Status（服务器状态）
- 查看运行状态
- 查看已索引项目数量
- 查看存储路径

### 2. Configuration（配置管理）
- 在线编辑 `settings.toml`
- 实时保存并重新加载配置
- 修改 API 地址、Token、批量大小等

### 3. Real-time Logs（实时日志）
- 通过 WebSocket 查看实时日志
- 自动滚动到最新日志
- 查看所有 INFO 级别及以上的日志

### 4. Tool Debugger（工具调试）
- 测试 `search_context` 工具
- 输入项目路径和查询
- 查看搜索结果

---

## 💡 最佳实践建议

### 开发阶段
```bash
# 终端 1：启动带 Web 界面的服务器（用于调试）
npm start -- --web-port 8080

# 浏览器：打开 http://localhost:8080 进行配置和测试

# Cursor：使用标准 stdio 模式（不带 --web-port）
```

### 生产使用
```bash
# Cursor 配置：标准 stdio 模式
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": {}
    }
  }
}

# 需要管理时，单独启动 Web 界面
npm start -- --web-port 8080
```

---

## 🔗 相关文档

- [快速开始指南](./QUICK_START.md)
- [详细使用指南](./USAGE_GUIDE.md)
- [完整 README](./README.md)

---

## ✅ 快速检查清单

在报告问题前，请确认：

- [ ] 已运行 `npm run build` 编译项目
- [ ] 配置文件 `~/.acemcp/settings.toml` 存在且正确
- [ ] Cursor 配置中的路径使用正斜杠 `/`
- [ ] 已重启 Cursor 让配置生效
- [ ] 等待至少 10 秒让服务器完全启动
- [ ] 使用浏览器手动访问 http://localhost:8080
- [ ] 检查端口未被其他程序占用
- [ ] 查看日志文件确认无错误

如果以上都确认无误，请提供：
- Cursor MCP 日志
- `~/.acemcp/log/acemcp.log` 文件内容
- 浏览器控制台错误信息

