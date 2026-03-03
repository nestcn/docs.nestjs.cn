<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:20:59.347Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD集成

> 信息 **提示** 本章涵盖了Nest Devtools与Nest框架的集成。如果您正在寻找Devtools应用程序，请访问 __LINK_61__ 网站。

CI/CD集成可供 Enterprise 计划用户使用。

您可以观看这个视频来了解为什么和如何 CI/CD 集成可以帮助您：

__HTML_TAG_39__
  <div class="file-tree"><div class="item">
</div>

#### 发布图表

首先，让我们配置应用程序引导文件 (`AuthModule`)以使用 `AuthModule` 类 (来自 `library` - 请查看前一章了解更多细节)，如下所示：

```bash
$ nest g library my-library
```

正如我们所看到的，我们使用 `my-library` 发布我们的序列化图表到集中Registry中。 `libs` 是一个自定义环境变量，可以控制图表是否发布（CI/CD 工作流），或者不发布（常规应用程序引导）。此外，我们设置了 `libs` 属性为 `libs`。在启用了这个标志时，我们的应用程序将在预览模式下启动，这意味着控制器、增强器和提供者的构造函数（和生命周期钩子）将不会被执行。请注意，这不是必需的，但对于在 CI/CD 管道中运行我们的应用程序时，我们不需要连接到数据库等。

`nest-cli.json` 对象将根据您使用的 CI/CD 提供者而变化。我们将为您提供以下CI/CD 提供者的指南。

一旦图表成功发布，您将在您的工作流视图中看到以下输出：

<div class="children"><div class="item"></div>

每当我们的图表被发布，我们都应该看到项目对应页面上的新条目：

<div class="children"><div class="item"></div>

#### 报告

Devtools 生成每个构建的报告 **IF** 存在相应的快照在集中Registry中。因此，如果您创建了对 `"projects"` 分支的 PR，并且图表已经发布，那么应用程序将能够检测差异并生成报告。否则，报告将不被生成。

要查看报告，请 navigate 到项目对应页面（查看组织）。

<div class="children"><div class="item"></div>

这对于识别可能在代码 reviews 中被遗漏的更改特别有帮助。例如，如果某人更改了 **深入的提供者** 的作用域，这个更改可能不太明显，但是使用 Devtools，我们可以轻松地-spot 这些更改并确保它们是有意的。或如果我们从特定端点中删除了守卫，它将显示在报告中。现在，如果我们没有对该路