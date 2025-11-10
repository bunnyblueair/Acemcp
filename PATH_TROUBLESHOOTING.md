# 路径问题排查指南

## 常见路径问题及解决方案

### 问题 1: "Project root path does not exist" 错误

#### 症状
```
Error: Failed to index project before search. 
Project root path does not exist: /mnt/c/Users/username/Desktop/project/
```

#### 原因
1. **末尾斜杠问题**: 路径末尾的斜杠 `/` 可能导致 `fs.existsSync` 检查失败
2. **路径不存在**: 目录确实不存在或路径拼写错误
3. **权限问题**: 没有访问该目录的权限
4. **符号链接问题**: 路径包含失效的符号链接

#### 解决方案

##### 1. 移除末尾斜杠
```javascript
// ❌ 错误：带末尾斜杠
"/mnt/c/Users/username/Desktop/project/"

// ✅ 正确：无末尾斜杠
"/mnt/c/Users/username/Desktop/project"
```

**已修复**: v0.1.5+ 版本自动移除末尾斜杠

##### 2. 检查路径是否存在
```bash
# WSL/Linux
ls -la /mnt/c/Users/username/Desktop/project

# Windows
dir C:\Users\username\Desktop\project
```

##### 3. 检查路径拼写
- 注意大小写（Linux/WSL 区分大小写）
- 检查空格和特殊字符
- 使用 Tab 补全避免拼写错误

##### 4. 检查权限
```bash
# WSL/Linux
ls -ld /mnt/c/Users/username/Desktop/project

# 如果没有权限，尝试
sudo chmod +rx /mnt/c/Users/username/Desktop/project
```

#### 调试步骤

**步骤 1**: 检查日志
```bash
# 查看详细日志
tail -f ~/.acemcp/log/acemcp.log | grep "Path check failed"
```

日志会显示：
```
Path check failed: /mnt/c/Users/username/Desktop/project (original: /mnt/c/Users/username/Desktop/project/)
```

**步骤 2**: 手动测试路径
```bash
# 进入该目录
cd /mnt/c/Users/username/Desktop/project

# 列出文件
ls -la

# 检查是否为目录
test -d /mnt/c/Users/username/Desktop/project && echo "是目录" || echo "不是目录"
```

**步骤 3**: 使用绝对路径
```javascript
// 确保使用完整的绝对路径
{
  "project_root_path": "/mnt/c/Users/username/Desktop/project"
}
```

### 问题 2: WSL 路径在 Windows 上不工作

#### 症状
Windows 环境下使用 `/mnt/c/...` 路径失败

#### 原因
`/mnt/c/` 是 WSL 特有的挂载点，Windows 环境不识别

#### 解决方案

**v0.1.5+ 自动转换** ✅:
```javascript
// ✅ 现在可以工作！自动转换为 Windows 路径
"/mnt/c/Users/username/project"
// → 自动转换为: "C:/Users/username/project"
```

**手动使用 Windows 路径**（推荐）:
```javascript
// ✅ 明确使用 Windows 路径
"C:/Users/username/project"
```

**环境检测**:
```javascript
// 检查当前环境
const isWSL = process.platform === 'linux' && 
              fs.existsSync('/proc/version') &&
              fs.readFileSync('/proc/version', 'utf8').includes('microsoft');

const projectPath = isWSL 
  ? '/mnt/c/Users/username/project'
  : 'C:/Users/username/project';
```

### 问题 3: 特殊字符和空格

#### 症状
路径包含空格或特殊字符时失败

#### 示例
```
/mnt/c/Users/username/My Documents/project  # 包含空格
/mnt/c/Users/用户名/project                 # 包含中文
/mnt/c/Users/username/project (old)         # 包含括号
```

#### 解决方案

**无需转义**: 路径处理已自动支持特殊字符
```javascript
// ✅ 直接使用，无需转义
{
  "project_root_path": "/mnt/c/Users/username/My Documents/project"
}
```

### 问题 4: 符号链接问题

#### 症状
路径是符号链接，但指向的目标不存在或在项目外

#### 解决方案

**使用真实路径**:
```bash
# 查看符号链接指向
readlink -f /path/to/symlink

# 使用真实路径而非符号链接
```

**注意**: 指向项目外部的符号链接会被自动跳过

### 问题 5: 相对路径问题

#### 症状
使用相对路径导致路径解析错误

#### 解决方案

**始终使用绝对路径**:
```javascript
// ❌ 避免：相对路径
"./project"
"../project"

// ✅ 推荐：绝对路径
"/mnt/c/Users/username/project"
"C:/Users/username/project"
```

## 路径格式速查表

| 环境 | 路径格式 | 示例 | 注意事项 |
|------|---------|------|---------|
| **Windows** | `C:/path/to/project` | `C:/Users/username/project` | 使用正斜杠或反斜杠均可 |
| **WSL (访问 Windows)** | `/mnt/c/path/to/project` | `/mnt/c/Users/username/project` | 注意盘符小写 |
| **WSL (内部)** | `/home/user/project` | `/home/user/myproject` | 标准 Unix 路径 |
| **Windows (访问 WSL)** | `\\wsl$\Ubuntu\home\...` | `\\wsl$\Ubuntu\home\user\project` | UNC 路径 |

## 路径规范化规则

### 自动处理
- ✅ 移除末尾斜杠
- ✅ 统一使用正斜杠
- ✅ 展开相对路径为绝对路径
- ✅ 转换 Windows 反斜杠为正斜杠
- ✅ 提取 WSL UNC 路径

### 保留原样
- Unix 绝对路径 `/home/...`
- WSL 挂载路径 `/mnt/c/...`
- Windows 盘符 `C:/...`

## 诊断工具

### 1. 官方诊断脚本 `diagnose-path.js`

项目内置了路径诊断工具，使用方法：

```bash
cd Ace-Mcp-Node
node diagnose-path.js "/mnt/c/Users/username/Desktop/project"
```

该工具会自动：
- ✅ 检测系统环境（Windows/WSL）
- ✅ 测试多种路径变体
- ✅ 显示路径是否存在和可访问
- ✅ 提供 Windows 等效路径（如果适用）
- ✅ 显示目录权限和内容
- ✅ 给出具体的修复建议

### 2. 自定义路径验证脚本

如需创建自定义测试脚本 `test-path.js`:

```javascript
import fs from 'fs';

const testPath = '/mnt/c/Users/username/Desktop/project/';

console.log('原始路径:', testPath);

// 移除末尾斜杠
let normalized = testPath;
if (normalized.endsWith('/') && normalized.length > 1) {
  normalized = normalized.slice(0, -1);
}
console.log('规范化路径:', normalized);

// 检查是否存在
console.log('路径存在:', fs.existsSync(normalized));

// 检查是否为目录
if (fs.existsSync(normalized)) {
  const stats = fs.statSync(normalized);
  console.log('是目录:', stats.isDirectory());
  console.log('权限:', stats.mode.toString(8));
}
```

运行:
```bash
node test-path.js
```

### 2. 日志分析

查看详细日志:
```bash
# 实时查看
tail -f ~/.acemcp/log/acemcp.log

# 搜索路径相关错误
grep -i "path" ~/.acemcp/log/acemcp.log | grep -i "error"

# 查看最近的路径检查
grep "Path check failed" ~/.acemcp/log/acemcp.log | tail -20
```

### 3. 权限检查

```bash
# 检查目录权限
ls -ld /mnt/c/Users/username/Desktop/project

# 检查父目录权限
ls -ld /mnt/c/Users/username/Desktop

# 递归检查权限
namei -l /mnt/c/Users/username/Desktop/project
```

## 最佳实践

### ✅ 推荐做法

1. **使用绝对路径**
   ```javascript
   "project_root_path": "/mnt/c/Users/username/project"
   ```

2. **不要包含末尾斜杠**
   ```javascript
   "/mnt/c/Users/username/project"  // ✅
   ```

3. **使用正斜杠作为分隔符**
   ```javascript
   "C:/Users/username/project"  // ✅
   ```

4. **验证路径存在后再使用**
   ```bash
   ls -la /mnt/c/Users/username/project
   ```

### ❌ 避免做法

1. **使用相对路径**
   ```javascript
   "./project"  // ❌
   ```

2. **包含末尾斜杠**
   ```javascript
   "/mnt/c/Users/username/project/"  // ❌ (v0.1.4 及以下)
   ```

3. **混合使用斜杠**
   ```javascript
   "C:/Users\\username/project"  // ❌
   ```

4. **假设路径存在**
   ```javascript
   // ❌ 未验证就使用
   searchContext({ project_root_path: guessedPath })
   ```

## 更新日志

### v0.1.5 (2025-01-10)
- ✅ **自动转换 `/mnt/c/` 路径为 Windows 路径**（Windows 环境下）
- ✅ 自动移除路径末尾斜杠
- ✅ 改进路径存在性检查
- ✅ 增强错误消息（显示原始和处理后的路径）
- ✅ 添加目录类型检查
- ✅ 创建路径诊断工具 `diagnose-path.js`

### v0.1.4
- ✅ 添加 WSL 路径支持
- ✅ 统一路径处理模块

## 获取帮助

如果以上方法都无法解决问题：

1. **查看完整日志**: `~/.acemcp/log/acemcp.log`
2. **检查 GitHub Issues**: 搜索类似问题
3. **提交 Issue**: 包含以下信息
   - 操作系统和版本
   - 路径示例（隐藏敏感信息）
   - 完整错误消息
   - 相关日志片段

## 相关文档

- [WSL 路径支持指南](WSL_PATH_GUIDE.md)
- [路径处理规范](.cursor/rules/acemcp-node-path-handling.mdc)
- [README](README.md)

