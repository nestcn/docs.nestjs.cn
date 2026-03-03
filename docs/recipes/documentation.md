<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:13:34.584Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是一个 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享类似的项目结构和代码结构，因此 **Compodoc** 也可以与 Nest 应用程序一起使用。

#### 设置

在现有的 Nest 项目中设置 Compodoc 非常简单。首先，在您的操作系统终端中使用以下命令添加 dev 依赖项：

```typescript
npm install --save-dev @compodoc/compodoc
```

#### 生成

使用以下命令生成项目文档（需要 npm 6 进行 __INLINE_CODE_2__ 支持）。查看 __LINK_9__ 获取更多选项。

```typescript
npx compodoc --help
```

打开您的浏览器，导航至 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Document</h1>
    <script src="main.js"></script>
</body>
</html>
```

#### 贡献

您可以参与并贡献 Compodoc 项目 __LINK_11__。