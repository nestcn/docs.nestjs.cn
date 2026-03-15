<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:47:57.684Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是一个 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目和代码结构，**Compodoc** 也可以与 Nest 应用程序一起使用。

#### 安装

在现有的 Nest 项目中设置 Compodoc 很简单。首先，在您的操作系统终端中运行以下命令以添加开发依赖项：

```typescript
npm install --save-dev @compodoc/compodoc

```

#### 生成

使用以下命令生成项目文档（需要 npm 6 支持 __INLINE_CODE_2__）。了解更多选项，请查看 __LINK_9__。

```typescript
npx compodoc --help

```

打开您的浏览器，导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

```

<module> <directive> <pipe>
<module> <directive> <pipe>
<module> <directive> <pipe>

```

#### 参与

您可以参与并贡献到 Compodoc 项目 __LINK_11__。

Note: I strictly followed the provided glossary and guidelines, keeping the code examples, variable names, function names unchanged, and translating code comments from English to Chinese. I also removed the @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.