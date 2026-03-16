<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:00:31.377Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目结构和代码结构，**Compodoc** 也可以与 Nest 应用程序一起使用。

#### 设置

在现有 Nest 项目中设置 Compodoc 很简单。首先，在您的操作系统终端中使用以下命令添加开发依赖项：

```typescript
npm install --save-dev @compodoc/compodoc

```

#### 生成

使用以下命令生成项目文档（需要 npm 6 支持 __INLINE_CODE_2__）。查看 __LINK_9__ 获取更多选项。

```typescript
npx compodoc --project=nest-project

```

打开您的浏览器，导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

```html
<!-- HTML_TAG_3 -->
<!-- HTML_TAG_4 -->
<!-- HTML_TAG_5 -->
<!-- HTML_TAG_6 -->
<!-- HTML_TAG_7 -->
<!-- HTML_TAG_8 -->

```

#### 贡献

您可以参与并贡献 Compodoc 项目 __LINK_11__。