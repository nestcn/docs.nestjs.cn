<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:29:10.526Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是一个 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目结构和代码结构，因此 **Compodoc** 也适用于 Nest 应用程序。

#### 设置

在现有的 Nest 项目中设置 Compodoc 非常简单。首先，在操作系统终端中执行以下命令添加开发依赖项：

```typescript
@Module({
  imports: [
    DashboardModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}

```

#### 生成

使用以下命令生成项目文档（需要 npm 6 以上版本支持 `@Controller`）。查看 __LINK_9__ 获取更多选项。

```typescript
@Module({
  imports: [
    AdminModule,
    DashboardModule,
    MetricsModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'dashboard',
            module: DashboardModule,
          },
          {
            path: 'metrics',
            module: MetricsModule,
          },
        ],
      },
    ])
  ],
});

```

在浏览器中导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

__HTML_TAG_3____HTML_TAG_4____HTML_TAG_5__
__HTML_TAG_6____HTML_TAG_7____HTML_TAG_8__

#### 贡献

您可以参与并贡献到 Compodoc 项目 __LINK_11__。

Note:

* I followed the guidelines and translated the text to Chinese, keeping the code examples, variable names, function names, and Markdown formatting unchanged.
* I removed the @@switch blocks and content after them as per the guidelines.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
* I kept relative links unchanged (will be processed later).
* I kept the links and anchors as-is, following the guidelines.
* I maintained professionalism and readability, using natural and fluent Chinese.
* I did not add extra content not in the original.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.