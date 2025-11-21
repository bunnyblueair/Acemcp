# 日志轮转配置说明

## 问题说明

日志文件会随着使用时间累积越来越大。Ace-Mcp-Node 已经实现了自动日志轮转功能，但现在支持用户自定义配置。

## 配置方法

### 1. 编辑配置文件

打开配置文件：
- **Windows**: `C:\Users\<用户名>\.acemcp\settings.toml`
- **Linux/Mac**: `~/.acemcp/settings.toml`

### 2. 添加日志配置（如果不存在）

在配置文件中添加以下配置项：

```toml
# 日志配置
LOG_MAX_FILE_SIZE_MB = 1    # 单个日志文件最大大小（MB）
LOG_MAX_FILES = 5            # 保留的日志文件数量
```

### 3. 配置说明

#### `LOG_MAX_FILE_SIZE_MB`
- **默认值**: 1 MB
- **说明**: 单个日志文件达到此大小后会自动轮转
- **推荐值**:
  - 轻量使用：1 MB（默认）
  - 中等使用：2-3 MB
  - 重度使用：5 MB

#### `LOG_MAX_FILES`
- **默认值**: 5 个
- **说明**: 保留最近 N 个日志文件，超过的会被自动删除
- **推荐值**:
  - 节省空间：3-5 个（默认）
  - 长期保留：10-15 个
  - 临时调试：1-2 个

#### 总占用空间计算
```
总空间 = LOG_MAX_FILE_SIZE_MB × LOG_MAX_FILES
```

示例：
- 默认配置（1 MB × 5）= 最多 5 MB
- 中等配置（2 MB × 10）= 最多 20 MB
- 重度配置（5 MB × 15）= 最多 75 MB

## 日志文件位置

日志文件存储在：
- **Windows**: `C:\Users\<用户名>\.acemcp\log\`
- **Linux/Mac**: `~/.acemcp/log/`

文件命名：
```
acemcp.log         # 当前日志文件
acemcp.log.1       # 第 1 个轮转文件（最新）
acemcp.log.2       # 第 2 个轮转文件
...
acemcp.log.5       # 第 5 个轮转文件（最旧）
```

## 立即清理日志（如果空间紧张）

### 方法 1：删除旧日志文件
```bash
# Windows PowerShell
Remove-Item $env:USERPROFILE\.acemcp\log\acemcp.log.* -Force

# Linux/Mac
rm ~/.acemcp/log/acemcp.log.*
```

### 方法 2：减小配置值并重启服务
1. 修改 `settings.toml`：
   ```toml
   LOG_MAX_FILE_SIZE_MB = 1
   LOG_MAX_FILES = 3
   ```
2. 重启 MCP 服务器（完全退出 Cursor 并重新打开）

## 配置示例

### 示例 1：节省空间（最小配置）
```toml
# 最多占用 500KB × 2 = 1 MB
LOG_MAX_FILE_SIZE_MB = 0.5
LOG_MAX_FILES = 2
```

### 示例 2：平衡配置（推荐）
```toml
# 最多占用 1 MB × 5 = 5 MB
LOG_MAX_FILE_SIZE_MB = 1
LOG_MAX_FILES = 5
```

### 示例 3：调试模式（详细日志）
```toml
# 最多占用 5 MB × 10 = 50 MB
LOG_MAX_FILE_SIZE_MB = 5
LOG_MAX_FILES = 10
```

## 常见问题

### Q: 修改配置后需要重启吗？
**A**: 是的，需要完全退出 Cursor 并重新打开。修改配置文件后，必须重启 MCP 服务器才能生效。

### Q: 我可以禁用日志吗？
**A**: 不推荐禁用日志。但如果确实需要，可以设置：
```toml
LOG_MAX_FILE_SIZE_MB = 0.1
LOG_MAX_FILES = 1
```
这将最小化日志占用（约 100KB）。

### Q: 日志轮转是实时的吗？
**A**: 是的。每次写入日志时都会检查文件大小，超过限制立即轮转。

### Q: 旧日志会自动删除吗？
**A**: 是的。超过 `LOG_MAX_FILES` 数量的旧日志文件会被自动删除。

## 更新说明

- **版本**: v0.1.6+
- **首次配置**: 如果配置文件中没有日志配置项，将使用默认值（1 MB × 5）
- **兼容性**: 旧版本用户升级后，默认会使用更小的日志文件（从 5 MB 降为 1 MB）

## 技术细节

### 轮转机制
1. 每次写入日志时检查当前文件大小
2. 如果超过 `LOG_MAX_FILE_SIZE_MB`，触发轮转：
   - 关闭当前文件流
   - 重命名：`acemcp.log` → `acemcp.log.1`
   - 旧文件顺延：`acemcp.log.1` → `acemcp.log.2`（依此类推）
   - 删除超过 `LOG_MAX_FILES` 数量的最旧文件
   - 创建新的 `acemcp.log`

### 配置加载顺序
1. 读取 `~/.acemcp/settings.toml`
2. 如果没有日志配置项，使用默认值
3. 在 MCP 服务器启动时初始化日志系统

## 相关文件

- 配置实现：[src/config.ts](src/config.ts)
- 日志实现：[src/logger.ts](src/logger.ts)
- 服务器入口：[src/index.ts](src/index.ts)

