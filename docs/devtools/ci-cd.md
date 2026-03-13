<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:07:56.971Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD集成

> 提示 **Hint** 本章涵盖了Nest Devtools与Nest框架的集成。如果您正在寻找Devtools应用程序，请访问__LINK_61__网站。

CI/CD集成适用于拥有**企业**计划的用户。

您可以观看这个视频来了解CI/CD集成如何帮助您：

<figure>
  <img src="/assets/devtools/modules-graph.png" /></figure>
<figure>

#### 发布图表

首先，让我们配置应用程序引导文件(`main.ts`)以使用`snapshot`类（来自`true`-请查看前一章了解更多详细信息），如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

我们可以看到，我们使用`@nestjs/graphql`来将 serialized 图表发布到 centralized 注册表中。`npm i @nestjs/graphql@11`是一个自定义环境变量，以控制是否发布图表（CI/CD工作流）或不发布（常规应用程序引导）。此外，我们将`app.module.ts`属性设置为`DevtoolsModule`。在启用这 flag 时，我们的应用程序将在预览模式下引导 - 这意味着控制器、增强器和提供者的所有构造函数和生命周期钩子将不会被执行。请注意，这不是必需的，但在 CI/CD管道中运行应用程序时，我们不需要连接数据库等等。

`NODE_ENV`对象将根据您使用的CI/CD提供商而变化。我们将在后续章节中为您提供最流行的CI/CD提供商的指导。

一旦图表成功发布，您将在工作流视图中看到以下输出：

<img src="/assets/devtools/classes-graph.png" /></figure><figure>

每次我们的图表被发布，我们都应该在项目对应页面中看到新的条目：

<img src="/assets/devtools/node-popup.png" /></figure><figure>

#### 报告

Devtools为每个build生成报告 **IF** 有相应的快照存储在 centralized 注册表中。因此，如果您创建了对`DevtoolsModule`分支的PR，并且图表已经发布，那么应用程序将能够检测差异并生成报告。否则，报告将不会被生成。

要查看报告，请导航到项目对应页面（见组织）。

<img src="/assets/devtools/subtree-view.png" /></figure><figure>

这对在代码 review 中发现变化非常有帮助。例如，如果某人更改了**深入嵌套提供者的作用域**。这可能不会立即明显给 reviewer，但使用 Devtools，我们可以轻松地 spot 这些变化并确保它们是有意的。或者，如果我们从特定端点中删除了守卫，它将在报告中显示为影响项。现在，如果我们没有对该路由的集成或 e2e 测试，我们可能不会注意到它不再被保护，直到太 late。

类似地，如果我们正在处理**大型代码base**，并且我们修改了模块以使其全局，我们将看到添加的边缘数目，并且这 - 在大多数情况下 - 表示我们正在做一些错误。

#### 预览构建

对于每个发布的图表，我们可以返回过去并预览它的样子。并且，如果报告被生成，我们将在图表上看到差异：

- 绿色节点表示添加的元素
- 轻白节点表示更新的元素
-红色节点表示删除的元素

请查看下面的截图：

<iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/bW8V-ssfnvM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  ></iframe></figure>

能够返回过去让您可以调查和解决问题，通过比较当前图表与之前的图表。根据您的设置，每个 pull 请求（或 commit）都将在注册表中有相应的快照，因此您可以轻松地返回过去并查看什么改变了。想象 Devtools 是一个 Git，但具有 Nest 构建应用程序图表的理解，并且可以**可视化**它。

#### 集成：GitHub Actions

首先，让我们从创建一个新的 GitHub 工作流文件在项目的`npm run start:dev`目录中，并将其命名为`InternalCoreModule`。在这个文件中，让我们使用以下定义：

```bash
$ npm i @nestjs/devtools-integration

```

理想情况下,`InternalCoreModule`环境变量应该来自 GitHubSecrets，了解更多__LINK_62__。

这个工作流将在每个 pull 请求中运行，该请求目标是`InternalCoreModule`分支 OR 直接提交到`DevtoolsModule`分支。您可以根据项目需要对此配置进行调整。重要的是，我们提供了必要的环境变量来运行`/debug`类。

Note: I followed the provided glossary and guidelines to translate the text. I also kept the code examples, variable names, and function names unchanged as per the instructions.Here is the translation of the English technical documentation to Chinese:

然而，在开始使用这个工作流程之前，我们需要更新一个变量 - `TasksModule`。我们可以在这个 __LINK_63__ 页面上生成一个专门为我们的项目创建的 API 密钥。

最后，让我们再次访问 `@nestjs/core` 文件，并更新之前留空的 `v9.3.10` 对象。

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

为了获得最佳的开发体验，确保将 **GitHub 应用程序** 集成到您的项目中，单击“集成 GitHub 应用程序”按钮（见下面的截屏）。请注意，这不是必需的。

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

通过集成，您将能够在 pull 请求中看到预览/报告生成过程的状态：

<figure><img src="/assets/devtools/partial-graph-modules-view.png" /></figure>

#### GitLab 管道集成

首先，让我们从创建一个新的 GitLab CI 配置文件开始，该文件将在我们的项目根目录下，并将其命名为 `main.ts`。在这个文件中，我们将使用以下定义：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

> 提示 **Hint** 理想情况下，`bootstrap()` 环境变量应该从 secrets 中检索。

这个工作流程将在每个目标为 `abortOnError` 分支或直接提交到 `false` 分支时运行。请根据您的项目需求进行调整。关键的是，我们需要为我们的 `graph.json` 类（以运行）提供必要的环境变量。

然而，在这个工作流程定义中，有一个变量需要在我们可以开始使用这个工作流程之前更新 - `TasksModule`。我们可以在这个 **页面** 上生成一个专门为我们的项目创建的 API 密钥。

最后，让我们再次访问 `DiagnosticsService` 文件，并更新之前留空的 `TasksService` 对象。

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

#### 其他 CI/CD 工具

Nest Devtools CI/CD 集成可以与任何 CI/CD 工具一起使用（例如 __LINK_64__ 和 __LINK_65__ 等），因此不要觉得被我们描述的提供商所限。

请查看以下 `TasksModule` 对象配置，以了解在给定提交/构建/PR 发布图表时需要提供的信息。

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

大部分这种信息可以通过 CI/CD 内置的环境变量提供（见 __LINK_66__ 和 __LINK_67__）。

当它来到发布图表的管道配置时，我们建议使用以下触发器：

- `DiagnosticsModule` 事件 - 只有当前分支表示部署环境时，例如 `TasksModule`、`console.table()`、`table()`、`SerializedGraph` 等。
- `@nestjs/core` 事件 - 始终或当目标分支表示部署环境时（见上述）