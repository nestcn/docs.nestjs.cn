<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:45:55.190Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD集成

> info **提示** 本章将涵盖 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_61__ 网站。

CI/CD 集成适用于拥有 **企业** 计划的用户。

您可以观看这个视频来了解为什么和如何 CI/CD 集成可以帮助您：

<figure>
  <img src="/assets/devtools/modules-graph.png" /></figure>
<figure>

#### 发布图形

首先，让我们在应用程序引导文件(`main.ts`)中使用 `snapshot` 类（来自 `true` - 请查看前一章以获取更多信息），如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

正如我们所看到的，我们使用 `@nestjs/graphql` 发布我们的序列化图形到集中式注册表中。 `npm i @nestjs/graphql@11` 是一个自定义环境变量，用于控制是否发布图形（CI/CD 工作流），或不发布（常规应用程序引导）。此外，我们将 `app.module.ts` 属性设置为 `DevtoolsModule`。在启用此标志时，我们的应用程序将在预览模式下引导，这基本上意味着所有控制器、增强器和提供者的构造函数（和生命周期钩子）将不会被执行。请注意，这不是必需的，但在 CI/CD 管道中运行应用程序时，我们不需要连接到数据库等。

`NODE_ENV` 对象将根据您使用的 CI/CD 提供商而变化。我们将在后续部分为您提供最流行的 CI/CD 提供商的使用说明。

一旦图形成功发布，您将在工作流视图中看到以下输出：

<img src="/assets/devtools/classes-graph.png" /></figure><figure>

每当我们的图形被发布时，我们都应该在对应的页面中看到新的条目：

<img src="/assets/devtools/node-popup.png" /></figure><figure>

#### 报告

Devtools 生成每个构建的报告 **如果** 对应的快照已经存储在集中式注册表中。因此，如果您创建了一个对 `DevtoolsModule` 分支的 PR，然后应用程序将能够检测差异并生成报告。否则，报告将不会被生成。

要查看报告，请导航到对应的页面（查看组织）。

<img src="/assets/devtools/subtree-view.png" /></figure><figure>

这对于识别可能在代码评审中未被注意的变化非常有帮助。例如，让我们说某人已经更改了一个 **深度嵌套提供者的** 范围。这个变化可能不会立即对评审员显而易见，但使用 Devtools，我们可以轻松地 spotting 这些变化并确保它们是有意的。或者，如果我们从某个特定端点中移除守卫，它将在报告中显示为受影响的项。现在，如果我们没有对该路由的集成或 e2e 测试，我们可能不会注意到它不再受保护，直到它太晚。

同样，如果我们在 **大型代码库** 中修改一个模块，使其变为全局，我们将看到添加的边缘数量，这在大多数情况下是一个错误的征兆。

#### 预览构建

对于每个已发布的图形，我们可以回溯到过去并预览它的样子。另外，如果报告已经生成，我们应该在图形上看到所作出的更改：

- 绿色节点表示添加的元素
- 轻白色节点表示更新的元素
- 红色节点表示删除的元素

请见以下截图：

<iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/bW8V-ssfnvM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  ></iframe></figure>

可以回溯到过去，让您调查和解决问题，通过比较当前图形与之前的图形。根据您如何设置，每个 pull 请求（或每个提交）都将有一个对应的快照在注册表中，因此您可以轻松地回溯到过去并看到所作出的更改。想象 Devtools 作为一个 Git，但它理解 Nest 构建应用程序图形，并且具有可视化能力。

#### 集成：GitHub Actions

首先，让我们从创建一个新的 GitHub 工作流文件在项目的 `npm run start:dev` 目录中，并将其命名为 `InternalCoreModule`。在这个文件中，让我们使用以下定义：

```bash
$ npm i @nestjs/devtools-integration

```

理想情况下，`InternalCoreModule` 环境变量应该从 GitHub 私密变量中获取，更多信息请查看 __LINK_62__ 。

这个工作流将在每个目标 `InternalCoreModule` 分支的 pull 请求中运行，或者在直接提交到 `DevtoolsModule` 分支时运行。请自由地对齐这个配置以满足您的项目需求。关键是提供必要的环境变量供我们的 `/debug` 类（以运行）使用。Here is the translation of the English technical documentation to Chinese:

然而，在我们开始使用这个工作流程之前，我们需要更新一个变量 - `TasksModule`。我们可以在这个 __LINK_63__ 页面上生成一个专门用于我们的项目的 API 密钥。

最后，让我们再次导航到 `@nestjs/core` 文件，并更新之前留空的 `v9.3.10` 对象。

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

为了获得最好的开发体验，请确保将 GitHub 应用程序集成到您的项目中，单击“集成 GitHub 应用程序”按钮（见下面的截图）。注意，这不是必需的。

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

通过集成，您将能够在pull请求中看到预览/报告生成进程的状态：

<figure><img src="/assets/devtools/partial-graph-modules-view.png" /></figure>

#### Gitlab Pipelines 集成

首先，让我们创建一个新的 Gitlab CI 配置文件，在项目的根目录中命名为 `main.ts`。在这个文件中，让我们使用以下定义：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

> info **提示** Ideally，`bootstrap()` 环境变量应该从 secrets 中检索。

这个工作流程将按每个目标 branch `abortOnError` 或直接提交到 `false` branch 运行。您可以根据项目需要对这个配置进行调整。关键是我们为我们的 `graph.json` 类提供必要的环境变量以便运行。

然而，在这个工作流程定义中，有一个变量需要更新，以便我们可以开始使用这个工作流程 - `TasksModule`。我们可以在这个 **页面** 上生成一个专门用于我们的项目的 API 密钥。

最后，让我们再次导航到 `DiagnosticsService` 文件，并更新之前留空的 `TasksService` 对象。

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

#### 其他 CI/CD 工具

Nest Devtools CI/CD 集成可以与任何 CI/CD 工具结合使用（例如 __LINK_64__、__LINK_65__ 等），因此不要感到被限制于我们描述的提供商。

查看以下 `TasksModule` 对象配置，以了解在给定提交/构建/PR 中发布图表所需的信息。

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

大多数这类信息通过 CI/CD 内置环境变量提供（见 __LINK_66__ 和 __LINK_67__）。

当它来到 pipeline 配置时，我们建议使用以下触发器：

- `DiagnosticsModule` 事件 - 只要当前 branch 表示一个部署环境，例如 `TasksModule`、`console.table()`、`table()`、`SerializedGraph`、等。
- `@nestjs/core` 事件 - 始终或当 **目标 branch** 表示一个部署环境（见上面）