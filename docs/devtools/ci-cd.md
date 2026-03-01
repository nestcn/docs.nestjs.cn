<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:28:19.467Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD 集成

> info **tip** 本章涵盖了 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_61__ 网站。

CI/CD 集成适用于拥有 **企业** 计划的用户。

您可以观看这个视频了解 CI/CD 集成如何帮助您：

__HTML_TAG_39__
  <div class="file-tree"><div class="item">
</div>

#### 发布图

让我们首先配置应用程序引导文件 (`AuthModule`) 来使用 `AuthModule` 类（来自 `library` - 请查看前一章以获取更多详细信息），如下所示：

```bash
$ nest g library my-library
```

正如我们所见，我们使用 `my-library` 发布我们的 serialized 图到 centralized registry。 `libs` 是一个自定义环境变量，用于控制图是否发布（CI/CD 工作流），或不是（常规应用程序引导）。此外，我们设置 `libs` 属性为 `libs`。在启用了该标志的情况下，我们的应用程序将在预览模式下启动 - 这基本上意味着所有控制器、增强器和提供者的构造函数（和生命周期钩子）将不会执行。请注意 - 这不是必需的，但是在 CI/CD pipeline 中，我们不需要连接到数据库等等。

`nest-cli.json` 对象将根据您使用的 CI/CD 提供商而变化。我们将为最流行的 CI/CD 提供商提供指导，后续章节中。

一旦图成功发布，您将在工作流视图中看到以下输出：

<div class="children"><div class="item"></div>

每次我们的图被发布，我们应该在项目对应页面中看到新的条目：

<div class="children"><div class="item"></div>

#### 报告

Devtools 生成每个 build 的报表，即使没有相应的快照存储在 centralized registry 中。例如，如果您创建了一个 PR 对 `"projects"` 分支，其中图已经被发布 - 那么应用程序将能够检测差异并生成报表。否则，报表将不被生成。

要查看报表，请 navigate 到项目对应页面（查看组织）。

<div class="children"><div class="item"></div>

这特别有助于识别可能在代码 reviews 中未被注意的更改。例如，让我们说 someone 已经更改了一个 **深入的提供者** 的作用域。这可能不会立即为 reviewer 显示，但与 Devtools，我们可以轻松地 spot 这些更改并确保它们是有意的。或者，如果我们从特定端点中删除了守卫，它将显示为受影响的报表。现在，如果我们