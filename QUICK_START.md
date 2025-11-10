# ⚡ 快速开始指南

## 🚀 30秒快速启动

### 1. 编译项目
```bash
cd D:/my_project/Ace-Mcp/Ace-Mcp-Node
npm install && npm run build
```

### 2. 运行测试脚本
```bash
node test-server.js
```

如果看到 "🎉 所有测试通过！"，说明环境准备完成。

### 3. 配置 API
```bash
# Windows
notepad %USERPROFILE%\.acemcp\settings.toml

# Linux/Mac
nano ~/.acemcp/settings.toml
```

修改这两个关键配置：
```toml
BASE_URL = "https://your-api-endpoint.com"
TOKEN = "your-actual-api-token"
```

### 4. 启动服务器
```bash
# 启动 Web 管理界面
npm start -- --web-port 8080

# 然后打开浏览器访问：
# http://localhost:8080
```

---

## 📱 在 Cursor 中使用

### 配置 Cursor

在 Cursor 设置中添加 MCP 服务器配置：

**方式 1：标准模式（stdio，强烈推荐）**
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

**方式 2：带 Web 管理界面（需手动打开浏览器）**
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
⚠️ **重要**：使用方式 2 时，需要：
1. 保存配置后重启 Cursor
2. **等待 5-10 秒**让服务器启动
3. **手动打开浏览器**访问：http://localhost:8080
4. Cursor 不会自动打开浏览器！

💡 **推荐做法**：Cursor 用方式 1，Web 界面单独启动：
```bash
# 在终端运行（用于管理和调试）
npm start -- --web-port 8080
```

📖 **详细说明**：[Cursor Web 界面完整指南](./CURSOR_WEB_GUIDE.md)

**方式 3：指定 API 配置**
```json
{
  "mcpServers": {
    "acemcp": {
      "command": "node",
      "args": [
        "D:/my_project/Ace-Mcp/Ace-Mcp-Node/dist/index.js",
        "--base-url",
        "https://your-api.com",
        "--token",
        "your-token"
      ],
      "env": {}
    }
  }
}
```

⚠️ **配置要点**：
- 将路径改为你的实际路径
- 路径必须使用**正斜杠** `/`，即使在 Windows 上
- 如果路径包含空格，不需要额外引号
- 确保 `dist/index.js` 文件已编译生成（运行 `npm run build`）

### 重启 Cursor

配置完成后，重启 Cursor 让配置生效。

### 使用工具

在 Cursor 中，你可以这样使用：

```
搜索这个项目中的日志配置相关代码
```

Cursor 会自动调用 `search_context` 工具。

---

## 🌐 使用 Web 界面

### 启动 Web 界面
```bash
npm start -- --web-port 8080
```

### 访问界面
浏览器打开：http://localhost:8080

### 测试搜索

1. 点击 "Tool Debugger" 标签
2. 输入工具名称：`search_context`
3. 输入参数（JSON）：
   ```json
   {
     "project_root_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node",
     "query": "express web server setup"
   }
   ```
4. 点击 "Execute Tool"
5. 查看返回结果

---

## ✅ 验证检查清单

- [ ] `npm run build` 成功完成
- [ ] `node test-server.js` 所有测试通过
- [ ] `~/.acemcp/settings.toml` 已配置 BASE_URL 和 TOKEN
- [ ] `npm start -- --web-port 8080` 成功启动
- [ ] http://localhost:8080 可以访问
- [ ] Web 界面显示"Server Status: Running"
- [ ] 工具调试器可以执行搜索
- [ ] Cursor 中可以调用 `@acemcp`

如果所有项目都打勾了，恭喜你！🎉 服务器已经完全配置好了！

---

## 🔧 故障排查

### 问题 1: 编译失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2: 测试脚本失败
```bash
# 检查是否已编译
ls dist/

# 如果没有 dist/ 目录
npm run build

# 重新运行测试
node test-server.js
```

### 问题 3: Web 界面无法访问
```bash
# 检查端口是否被占用
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080

# 如果被占用，使用其他端口
npm start -- --web-port 8090
```

### 问题 4: Cursor 中无法使用
1. 检查配置文件路径是否正确
2. 确保使用正斜杠 `/`
3. 重启 Cursor
4. 查看 Cursor 的 MCP 日志

---

## 📖 更多信息

- 详细使用指南：[USAGE_GUIDE.md](./USAGE_GUIDE.md)
- 完整文档：[README.md](./README.md)
- 代码审查报告：[FINAL_CODE_REVIEW.md](./FINAL_CODE_REVIEW.md)

---

## 🎯 下一步

现在你可以：

1. **在 Cursor 中使用**：搜索项目代码
2. **通过 Web 界面管理**：配置、日志、调试
3. **索引其他项目**：指定不同的 `project_root_path`
4. **自定义配置**：调整批量大小、排除模式等

祝使用愉快！🚀

