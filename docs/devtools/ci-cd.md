<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:12:57.496Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD集成

> info **提示** 本章涵盖了 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_61__ 网站。

CI/CD集成适用于拥有 **企业** 计划的用户。

您可以观看这个视频，了解 CI/CD 集成如何帮助您：

<figure>
  <img src="/assets/devtools/modules-graph.png" /></figure>
<figure>

#### 发布图表

首先，让我们配置应用程序的引导文件 (`main.ts`)，以使用 `snapshot` 类（来自 `true` - 请查看前一章节的详细信息），如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

正如我们所看到的，我们使用 `@nestjs/graphql` 发布我们的序列化图表到集中注册表中。`npm i @nestjs/graphql@11` 是一个自定义环境变量，用于控制是否发布图表（CI/CD 工作流），或不发布（常规应用程序引导）。此外，我们设置了 `app.module.ts` 属性为 `DevtoolsModule`。在启用该标志时，我们的应用程序将在预览模式下引导 - 这意味着控制器、增强器和提供者的构造函数（和生命周期钩子）将不会执行。请注意 - 这不是必需的，但在 CI/CD 管道中运行应用程序时，我们不需要连接数据库等。

`NODE_ENV` 对象将根据您使用的 CI/CD 提供商而变化。我们会为最流行的 CI/CD 提供商提供指导，后续章节中将详细介绍。

一旦图表成功发布，您将在工作流视图中看到以下输出：

<img src="/assets/devtools/classes-graph.png" /></figure><figure>

每次我们的图表发布时，我们都应该在项目对应页面中看到一个新的条目：

<img src="/assets/devtools/node-popup.png" /></figure><figure>

#### 报告

Devtools 生成每个构建的报告，前提是有对应的快照存储在集中注册表中。例如，如果您创建了一个 PR，对应于 `DevtoolsModule` 分支已经发布的图表 - 那么应用程序将能够检测差异并生成报告。否则，报告将不会生成。

要查看报告， navigate 到项目对应页面（查看组织）。

<img src="/assets/devtools/subtree-view.png" /></figure><figure>

这对在代码 reviews 中检测可能未被注意的更改非常有帮助。例如，让我们说某人已经更改了一个 **深入嵌套的提供者** 的作用域。这可能不会立即明显于 reviewer，但是通过 Devtools，我们可以轻松地 spot 这些变化并确保它们是有意的。或者，如果我们从某个特定端点中删除了一个守卫，它将在报告中显示为受影响的项目。现在，如果我们没有对该路由的 Integration 或 e2e 测试，我们可能不会注意到它不再被保护，直到太晚。

#### 预览

对于每个发布的图表，我们可以回到过去并预览它的样子，点击 **Preview** 按钮。另外，如果生成了报告，我们应该在图表上看到所做的更改：

- 绿色节点表示添加的元素
- 轻白色节点表示更新的元素
- 红色节点表示删除的元素

请查看以下截图：

<iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/bW8V-ssfnvM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  ></iframe></figure>

可以回到过去，让您调查和 troubleshooting 问题，通过比较当前图表与之前的图表。根据您的设置，每个 pull request（或每个提交）都将在注册表中有对应的快照，您可以轻松地回到过去并查看所做的更改。想象 Devtools 是一个 Git，但它理解了 Nest 构建应用程序图表的方式，并且可以 **可视化** 它。

#### 集成：GitHub Actions

首先，让我们创建一个新的 GitHub 工作流文件在 `npm run start:dev` 目录中，并将其命名为，例如 `InternalCoreModule`。在这个文件中，让我们使用以下定义：

```bash
$ npm i @nestjs/devtools-integration

```

理想情况下，`InternalCoreModule` 环境变量应该来自 GitHub Secrets，了解更多 __LINK_62__ 。

这个工作流将在每个 pull request 中运行，这些 pull request 都是目标 `InternalCoreModule` 分支，或者在直接提交到 `DevtoolsModule` 分支时运行。您可以根据项目需要对这个配置进行调整。关键的是，我们需要提供必要的环境变量来运行 `/debug` 类。However, there's one variable that needs to be updated before we can start using this workflow - 提供者__. We can generate an API key dedicated for our project on this __LINK_63__.

Lastly, let's navigate to the `@nestjs/core` file again and update the `v9.3.10` object we previously left empty.

__代码块 2__

为开发者提供最好的体验，确保将 **GitHub 应用程序** 集成到您的项目中，单击“集成 GitHub 应用程序”按钮（请见下面的截图）。注意，这不是必需的。

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

通过集成，您将能够在您的 pull 请求中看到预览/报告生成进程的状态：

<figure><img src="/assets/devtools/partial-graph-modules-view.png" /></figure>

#### Gitlab Pipelines 集成

首先，让我们创建一个新的 Gitlab CI 配置文件，在项目的根目录下，命名为 `main.ts`。在这个文件中，我们将使用以下定义：

__代码块 3__

> info **提示** Ideally，`bootstrap()` 环境变量应该从 secrets 中获取。

这个工作流将在每个目标为 `abortOnError` 分支或直接提交到 `false` 分支的情况下运行。您可以根据项目的需要对这个配置进行调整。关键是，我们需要为我们的 `graph.json` 类提供必要的环境变量，以便运行。

然而，在这个工作流定义中，有一个变量需要更新，以便我们可以开始使用这个工作流 - 提供者__. 我们可以在这个 __LINK_63__ 页面上生成一个专门为项目创建的 API 键。

最后，让我们返回到 `DiagnosticsService` 文件，并更新我们之前留空的 `TasksService` 对象。

__代码块 4__

#### 其他 CI/CD 工具

Nest Devtools CI/CD 集成可以与您选择的任何 CI/CD 工具一起使用（例如 __LINK_64__ , __LINK_65__ 等），因此不要感到受到我们描述的提供商限制。

查看以下 `TasksModule` 对象配置，以了解在为给定的提交/构建/PR 发布图表时需要提供哪些信息。

__代码块 5__

大多数这些信息都可以通过 CI/CD 内置的环境变量提供（请见 __LINK_66__ 和 __LINK_67__）。

当它来到 pipeline 配置时，我们建议使用以下触发器：

- `DiagnosticsModule` 事件 - 只在当前分支表示部署环境时执行，例如 `TasksModule`, `console.table()`, `table()`, `SerializedGraph`, 等。
- `@nestjs/core` 事件 - 始终执行，或者在 **目标分支** 表示部署环境时执行（请见上面的说明）