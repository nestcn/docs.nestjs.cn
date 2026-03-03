<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:19:57.523Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD 集成

> info **提示** 本章涵盖了 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_61__ 网站。

CI/CD 集成可供 Enterprise 计划用户使用。

您可以观看这个视频来了解为什么和如何 CI/CD 集成可以帮助您：

__HTML_TAG_39__
  <div class="file-tree"><div class="item">
</div>

#### 发布图

首先，让我们在应用程序引导文件（`AuthModule`）中使用 `AuthModule` 类（来自 `library` - 详见上一章），如下所示：

```bash
$ nest g library my-library
```

正如我们所看到的，我们使用 `my-library` 发布我们的序列化图形到集中注册表中。 `libs` 是一个自定义环境变量，它将让我们控制是否发布图形（CI/CD 工作流），或不（常规应用程序引导）。此外，我们将 `libs` 属性设置为 `libs`。在启用这个标志时，我们的应用程序将在预览模式下引导 - 在这种情况下，我们的控制器、增强器和提供器的构造函数（和生命周期钩子）将不会被执行。注意 - 这不是必需的，但是使事情变得简单，因为在这种情况下，我们不需要连接到数据库等时运行应用程序在 CI/CD 管道中。

`nest-cli.json` 对象将根据您使用的 CI/CD 提供商而异。我们将在后续部分为您提供最流行的 CI/CD 提供商的指南。

一旦图形成功发布，您将在工作流视图中看到以下输出：

<div class="children"><div class="item"></div>

每次我们发布图形，我们都应该在项目对应页面中看到新的条目：

<div class="children"><div class="item"></div>

#### 报告

Devtools 生成每个构建的报告，如果有相应的快照已经存储在集中注册表中。例如，如果您对 `"projects"` 分支创建了 PR，则应用程序将能够检测差异并生成报告。否则，报告将不被生成。

要查看报告，请navigate 到项目对应页面（see organizations）。

<div class="children"><div class="item"></div>

这非常有助于识别可能未被注意到的更改。例如，如果 someone 改变了一个深入的提供器的作用域。这可能不 immediate 显而易见于 reviewer，但通过 Devtools，我们可以轻松地 spot 这些更改并确保它们是有意的。或如果我们从某个端点中删除守卫，它将显示在报告中。现在