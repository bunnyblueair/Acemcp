# 切片上传失败处理机制

## 功能说明

在索引项目时，如果切片文件上传失败，系统会根据项目的初始化状态采取不同的容错策略：

### 策略概述

| 场景 | 初始化状态 | 上传结果 | 返回状态 | 说明 |
|------|-----------|---------|---------|------|
| **首次索引全失败** | ❌ 未初始化 | ❌ 全部失败 | `error` | 阻止使用，需要修复 |
| **增量索引全失败** | ✅ 已初始化 | ❌ 全部失败 | `partial_success` | 可继续使用旧数据 |
| **增量索引部分失败** | ✅ 已初始化 | ⚠️ 部分失败 | `partial_success` | 新数据部分可用 |
| **索引成功** | 任意 | ✅ 全部成功 | `success` | 正常 |

---

## 实现原理

### 初始化状态判断

```typescript
// 位置: src/index/manager.ts 第 549 行
const isInitialized = existingHashes.size > 0;
```

**判断依据**：
- `existingHashes` 包含项目已索引的所有 blob 哈希
- `size > 0` 表示项目已有数据，可以继续使用
- `size === 0` 表示新项目，没有可用数据

### 容错逻辑

```typescript
if (uploadedBlobNames.length === 0 && blobsToUpload.length > 0) {
  const isInitialized = existingHashes.size > 0;
  
  if (!isInitialized) {
    // 场景 1: 新项目首次索引失败 → 返回 error
    return {
      status: 'error',
      message: 'All batches failed on first indexing'
    };
  } else {
    // 场景 2: 已有项目增量索引失败 → 继续使用旧数据
    logger.warning('Current upload failed but project can still be used with existing data');
    // 继续执行，返回 partial_success
  }
}
```

---

## 场景示例

### 场景 1：首次索引失败（阻止使用）

```bash
# 首次索引一个新项目
用户: 索引项目 /path/to/new-project

# 系统行为:
1. 收集 100 个文件 → 生成 100 个 blob
2. 尝试上传 10 个批次
3. 所有批次失败（网络错误）
4. existingHashes.size = 0（没有旧数据）
5. 返回 error: "All batches failed on first indexing"

# 结果:
- 项目索引失败
- search_context 工具不可用
- 需要修复网络后重新索引
```

**为什么阻止**？
- 新项目没有任何可用数据
- 允许继续会导致搜索返回空结果
- 用户体验差，不如明确报错

### 场景 2：增量索引失败（继续使用旧数据）

```bash
# 项目已经索引过，现在添加新文件
用户: 索引项目 /path/to/existing-project

# 系统行为:
1. 加载已有数据: 200 个旧 blob
2. 收集新文件: 10 个新 blob
3. 尝试上传 1 个批次
4. 批次失败（API 临时故障）
5. existingHashes.size = 200（有旧数据）
6. 记录警告日志
7. 继续执行:
   - allBlobNames = 200 个旧 blob + 0 个新 blob
   - 更新 projects.json（保持 200 个旧 blob）
   - 返回 partial_success

# 结果:
- 项目可以继续使用（基于 200 个旧 blob）
- 新文件暂时不可搜索
- 用户可以稍后重新索引添加新文件
```

**为什么允许**？
- 已有 200 个 blob 可以正常搜索
- 10 个新文件的失败不影响整体可用性
- 用户可以稍后再试，不影响当前工作

### 场景 3：部分批次失败（新旧数据混合）

```bash
# 项目已索引，添加较多新文件
用户: 索引项目 /path/to/existing-project

# 系统行为:
1. 加载已有数据: 150 个旧 blob
2. 收集新文件: 50 个新 blob
3. 尝试上传 5 个批次（每批 10 个）
4. 结果:
   - 批次 1-3 成功 → 30 个新 blob 上传成功
   - 批次 4-5 失败 → 20 个新 blob 上传失败
5. uploadedBlobNames.length = 30（不为 0）
6. 不触发容错逻辑，正常执行:
   - allBlobNames = 150 个旧 blob + 30 个新 blob
   - 返回 partial_success

# 结果:
- 项目可用（180 个 blob：150 旧 + 30 新）
- 20 个新文件暂时不可搜索
- 消息: "existing: 150, new: 30, batches: 3/5 successful. Failed batches: 4, 5"
```

---

## 返回结果详解

### 返回状态说明

```typescript
interface IndexResult {
  status: 'success' | 'partial_success' | 'error';
  message: string;
  project_path?: string;
  failed_batches?: number[];  // 失败的批次编号
  stats?: {
    total_blobs: number;      // 总 blob 数量
    existing_blobs: number;   // 已存在的 blob
    new_blobs: number;        // 新上传的 blob
    skipped_blobs: number;    // 跳过的 blob
  };
}
```

### 状态码含义

| 状态 | 含义 | 何时返回 |
|------|------|---------|
| `success` | 完全成功 | 所有批次上传成功 |
| `partial_success` | 部分成功 | 有批次失败，但项目可用 |
| `error` | 完全失败 | 新项目首次索引失败 |

### 示例返回

#### 成功示例
```json
{
  "status": "success",
  "message": "Project indexed with 230 total blobs (existing: 200, new: 30, batches: 3/3 successful)",
  "project_path": "C:/Users/username/project",
  "failed_batches": [],
  "stats": {
    "total_blobs": 230,
    "existing_blobs": 200,
    "new_blobs": 30,
    "skipped_blobs": 200
  }
}
```

#### 部分成功示例（已初始化项目，全部失败）
```json
{
  "status": "partial_success",
  "message": "Project indexed with 200 total blobs (existing: 200, new: 0, batches: 0/5 successful). Failed batches: 1, 2, 3, 4, 5",
  "project_path": "C:/Users/username/project",
  "failed_batches": [1, 2, 3, 4, 5],
  "stats": {
    "total_blobs": 200,
    "existing_blobs": 200,
    "new_blobs": 0,
    "skipped_blobs": 200
  }
}
```

#### 错误示例（新项目，全部失败）
```json
{
  "status": "error",
  "message": "All batches failed on first indexing. Failed batches: 1, 2, 3"
}
```

---

## 日志输出

### 场景 1：新项目首次索引失败
```
[ERROR] Batch 1 failed after retries: ECONNREFUSED. Continuing with next batch...
[ERROR] Batch 2 failed after retries: ECONNREFUSED. Continuing with next batch...
[ERROR] Batch 3 failed after retries: ECONNREFUSED. Continuing with next batch...
[ERROR] Failed to index project C:/Users/username/project: All batches failed on first indexing
```

### 场景 2：已有项目增量索引失败
```
[ERROR] Batch 1 failed after retries: ETIMEDOUT. Continuing with next batch...
[ERROR] Batch 2 failed after retries: ETIMEDOUT. Continuing with next batch...
[WARNING] Project C:/Users/username/project has 200 existing blobs. Current upload failed but project can still be used with existing data.
[WARNING] Project C:/Users/username/project indexed with some failures: Project indexed with 200 total blobs (existing: 200, new: 0, batches: 0/2 successful). Failed batches: 1, 2
```

---

## 常见问题

### Q: 如果已有项目的增量索引全部失败，我还能搜索吗？
**A**: 可以！系统会使用已有的旧数据，你仍然可以搜索之前索引的内容。只是新添加的文件暂时不可搜索。

### Q: 如何知道有哪些新文件没有索引成功？
**A**: 查看返回结果中的 `failed_batches`，然后查看日志文件 `~/.acemcp/log/acemcp.log`，搜索对应批次的错误信息。

### Q: 增量索引失败后，如何重新索引新文件？
**A**: 只需再次调用 `search_context` 工具（它会自动触发增量索引），系统会重新尝试上传失败的文件。

### Q: 为什么新项目首次索引失败会阻止使用？
**A**: 因为新项目没有任何可用数据，允许继续会导致搜索返回空结果，用户体验很差。明确报错可以让用户及时修复网络问题。

### Q: partial_success 状态会影响 MCP 工具的使用吗？
**A**: 不会。`partial_success` 表示项目部分可用，`search_context` 工具可以正常使用（基于已有数据）。

---

## 最佳实践

### 1. 监控失败率
```bash
# 查看最近的失败日志
grep "failed after retries" ~/.acemcp/log/acemcp.log

# 统计失败批次
grep "Failed batches" ~/.acemcp/log/acemcp.log
```

### 2. 处理 partial_success
```typescript
// 在 MCP 客户端中处理返回结果
const result = await indexProject('/path/to/project');

if (result.status === 'partial_success') {
  console.warn('部分文件索引失败，项目可用但不完整');
  console.warn(`失败批次: ${result.failed_batches.join(', ')}`);
  
  // 可选：稍后重试
  setTimeout(() => {
    indexProject('/path/to/project');
  }, 60000); // 1 分钟后重试
}
```

### 3. 优化网络稳定性
```toml
# 在 settings.toml 中减小批次大小（减少单次请求失败影响）
BATCH_SIZE = 5  # 默认 10

# 或增加批次大小（减少请求次数）
BATCH_SIZE = 20
```

---

## 技术细节

### 实现位置
- **文件**: `src/index/manager.ts`
- **方法**: `indexProject()`
- **行号**: 547-567

### 关键变量
- `existingHashes`: Set<string> - 已索引的 blob 哈希集合
- `uploadedBlobNames`: string[] - 此次成功上传的 blob 名称
- `blobsToUpload`: Blob[] - 待上传的 blob 数组
- `failedBatches`: number[] - 失败的批次编号

### 容错触发条件
```typescript
uploadedBlobNames.length === 0 &&  // 此次上传全部失败
blobsToUpload.length > 0           // 确实有文件待上传（排除"无需上传"情况）
```

---

## 更新说明

- **版本**: v0.1.7+
- **更新日期**: 2025-01-21
- **向后兼容**: 是（不影响现有功能，仅增强容错能力）

---

## 相关文件

- 索引管理器实现：[src/index/manager.ts](src/index/manager.ts)
- 重试机制说明：[FEATURE_CHECK.md](FEATURE_CHECK.md)
- 错误处理规范：[.cursor/rules/acemcp-node-error-handling.mdc](.cursor/rules/acemcp-node-error-handling.mdc)

