<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:04:48.593Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是一个 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目结构和代码结构，**Compodoc** 也可以与 Nest 应用程序一起使用。

#### 设置

在现有 Nest 项目中设置 Compodoc 非常简单。首先，在操作系统终端中使用以下命令添加 dev-依赖项：

```bash
$ npm install --save @nestjs/cqrs

```

#### 生成

使用以下命令生成项目文档（需要 npm 6 支持__INLINE_CODE_2__）。更多选项请见 __LINK_9__。

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}

```

打开浏览器，导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

__HTML_TAG_3____HTML_TAG_4____HTML_TAG_5__
__HTML_TAG_6____HTML_TAG_7____HTML_TAG_8__

#### 贡献

您可以参与和贡献到 Compodoc 项目 __LINK_11__。