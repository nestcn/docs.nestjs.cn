# 代码块修复脚本

这个脚本用于批量处理 `docs` 文件夹中的 Markdown 文件，自动修复 `@@filename` 和 `@@switch` 代码块格式。

## 功能

1. **转换 `@@filename` 语法**：将 `@@filename(filename)` 转换为 rspress 语法格式 `ts title="filename"`
2. **删除 `@@switch` 代码块**：删除所有 `@@switch` 之后的 JavaScript 代码块部分
3. **保持内容完整性**：只修改代码块格式，不改变翻译内容

## 使用方法

### 手动运行

```bash
# 修复代码块格式
bun run fix-code-blocks

# 或使用 npm/yarn
npm run fix-code-blocks
yarn fix-code-blocks
```

### 自动执行

脚本会通过 GitHub Action 每日自动执行：

- **时间**：每天北京时间上午 9:00
- **触发条件**：
  - 定时执行（每日）
  - 手动触发
  - 当 `docs/` 或 `content/` 目录下的 `.md` 文件发生变化时

## 处理规则

### @@filename 处理

**处理前：**
```typescript
@@filename(cats.controller.spec)
import { CatsController } from './cats.controller';
// ... 代码内容
```

**处理后：**
```ts title="cats.controller.spec"
import { CatsController } from './cats.controller';
// ... 代码内容
```

### @@switch 处理

**处理前：**
```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor() {}
}
@@switch
@Injectable()
@Dependencies()
export class CatsService {
  constructor() {}
}
```

**处理后：**
```ts title="cats.service"
@Injectable()
export class CatsService {
  constructor() {}
}
```

## 文件安全

- 脚本只处理 `docs/` 目录下的 `.md` 文件
- 处理前会备份原始内容，确保安全
- 如果处理出错，会记录错误信息并停止执行
- 支持回滚操作

## 日志输出

脚本会输出详细的处理信息：

- 📁 目标目录
- 📝 找到的文件数量
- ✅ 成功修复的文件
- ❌ 处理失败的文件
- 📊 处理统计信息

## GitHub Action

脚本集成在 GitHub Action 中，会自动：

1. 检查代码块格式
2. 修复发现的问题
3. 提交修复后的文件
4. 生成处理报告

Action 配置文件：`.github/workflows/fix-code-blocks.yml`
