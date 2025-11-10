# Ace-Mcp-Node 故障排查指南

## 常见错误及解决方案

### 1. ❌ "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**错误描述**：
在执行重新索引、删除项目等操作时出现此错误。

**原因分析**：
- API请求返回的是HTML错误页面而不是JSON
- 后端可能抛出了未捕获的异常
- 配置错误导致API无法正常响应

**已修复**：
- ✅ 改进前端错误处理，检查响应类型
- ✅ 添加更详细的错误信息显示
- ✅ 改进按钮状态管理

**如何调试**：
1. **查看浏览器控制台**：
   ```javascript
   // 按 F12 打开开发者工具
   // 查看 Console 标签页
   // 错误信息会显示完整的响应内容
   ```

2. **查看后端日志**：
   ```bash
   # 查看最近的日志
   tail -f ~/.acemcp/log/acemcp.log
   
   # Windows PowerShell
   Get-Content $env:USERPROFILE\.acemcp\log\acemcp.log -Tail 50
   ```

3. **检查配置**：
   ```bash
   # 确保配置文件存在且格式正确
   cat ~/.acemcp/settings.toml
   
   # Windows
   type %USERPROFILE%\.acemcp\settings.toml
   ```

4. **验证 IndexManager 初始化**：
   - 确保 `BASE_URL` 和 `TOKEN` 已正确配置
   - 确保 API 服务可访问

---

### 2. ❌ "Port 8080 is already in use"

**错误描述**：
Web 服务器无法启动，端口被占用。

**解决方案**：
```bash
# 1. 查找占用端口的进程
netstat -ano | findstr :8080

# 2. 停止该进程
taskkill /PID <进程ID> /F

# 3. 或使用其他端口
npm start -- --web-port 8090
```

**已修复**：
- ✅ 端口占用时优雅降级，不阻止 MCP 服务器启动
- ✅ 显示友好的警告信息

---

### 3. ❌ "Template not found"

**错误描述**：
访问 Web 界面时显示此错误。

**原因**：
编译后没有复制模板文件到 dist 目录。

**解决方案**：
```bash
# 重新编译（自动复制模板）
npm run build

# 手动复制模板文件
cp -r src/web/templates dist/web/
# Windows
xcopy src\web\templates dist\web\templates\ /E /I
```

---

### 4. ❌ "Failed to load config"

**错误描述**：
配置加载失败。

**解决方案**：
```bash
# 1. 创建配置目录
mkdir -p ~/.acemcp
# Windows
mkdir %USERPROFILE%\.acemcp

# 2. 创建配置文件
cat > ~/.acemcp/settings.toml << EOF
BASE_URL = "https://your-api-endpoint.com"
TOKEN = "your-token-here"
EOF

# 3. 重启服务器
```

---

### 5. ❌ "WebSocket connection failed"

**错误描述**：
实时日志无法连接。

**可能原因**：
- Web 服务器未正确启动
- 防火墙阻止 WebSocket 连接

**解决方案**：
1. 检查 Web 服务器是否运行：
   ```bash
   curl http://localhost:8080/api/status
   ```

2. 检查 WebSocket 端点：
   ```bash
   # 使用浏览器开发者工具
   # Network 标签 -> WS 过滤器
   # 查看 ws://localhost:8080/ws/logs 连接状态
   ```

---

## 调试技巧

### 浏览器开发者工具
1. **Console**：查看JavaScript错误
2. **Network**：查看API请求和响应
3. **Application**：查看localStorage数据
4. **WS**：查看WebSocket连接

### 后端日志级别
修改日志级别以获取更多信息：
```typescript
// src/logger.ts
const logger = Logger.getInstance();
logger.setLevel(LogLevel.DEBUG); // 显示所有日志
```

### API测试
使用 curl 或 Postman 测试API：

```bash
# 检查服务器状态
curl http://localhost:8080/api/status

# 获取已索引项目
curl http://localhost:8080/api/projects

# 检查项目索引状态
curl -X POST http://localhost:8080/api/projects/check \
  -H "Content-Type: application/json" \
  -d '{"project_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node"}'

# 重新索引项目
curl -X POST http://localhost:8080/api/projects/reindex \
  -H "Content-Type: application/json" \
  -d '{"project_path": "D:/my_project/Ace-Mcp/Ace-Mcp-Node"}'
```

---

## 重置方法

### 清除所有数据
```bash
# 备份当前数据
cp -r ~/.acemcp ~/.acemcp.backup

# 删除所有数据（谨慎！）
rm -rf ~/.acemcp/data
rm -rf ~/.acemcp/log

# 重新启动服务器
```

### 重置配置
```bash
# 删除配置文件
rm ~/.acemcp/settings.toml

# 重新启动服务器（将使用默认配置）
```

---

## 获取帮助

### 日志位置
- **应用日志**：`~/.acemcp/log/acemcp.log`
- **数据目录**：`~/.acemcp/data/`
- **配置文件**：`~/.acemcp/settings.toml`

### 提供信息
报告问题时请包含：
1. 完整的错误消息（浏览器控制台 + 后端日志）
2. 操作系统版本
3. Node.js 版本：`node --version`
4. 项目版本：查看 `package.json`
5. 复现步骤

### 常用命令
```bash
# 检查环境
node --version
npm --version

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 完全重新编译
npm run build

# 查看日志
tail -f ~/.acemcp/log/acemcp.log
```

---

## 错误修复历史

### 2025-11-09
- ✅ 修复重新索引时 JSON 解析错误
- ✅ 改进所有 API 调用的错误处理
- ✅ 添加响应类型检查
- ✅ 改进按钮状态管理

### 已知问题
- 大型项目索引可能需要较长时间（无进度显示）
- 搜索结果暂无语法高亮
- 缺少API调用统计功能

---

**更新日期**：2025-11-09
**适用版本**：v0.2.0+

