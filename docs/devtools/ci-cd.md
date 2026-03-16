<!-- 此文件从 content/devtools/ci-cd.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:19:14.921Z -->
<!-- 源文件: content/devtools/ci-cd.md -->

### CI/CD_integration

> info **Hint** This chapter covers the Nest Devtools integration with the Nest framework. If you are looking for the Devtools application, please visit the [docs.nestjs.com](./) website.

CI/CD integration is available for users with the **Enterprise** plan.

You can watch this video to learn why & how CI/CD integration can help you:

```html
__HTML_TAG_39__
  __HTML_TAG_40____HTML_TAG_41__
__HTML_TAG_42__

```

#### Publishing graphs

Let's first configure the application bootstrap file (`__INLINE_CODE_6__`) to use the `__INLINE_CODE_7__` class (exported from the `__INLINE_CODE_8__` - see previous chapter for more details), as follows:

```code

```typescript
import { CustomTransportStrategy, Server } from '@nestjs/microservices';

class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  /**
   * Triggered when you run "app.listen()".
   */
  listen(callback: () => void) {
    callback();
  }

  /**
   * Triggered on application shutdown.
   */
  close() {}

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to register event listeners. Most custom implementations
   * will not need this.
   */
  on(event: string, callback: Function) {
    throw new Error('Method not implemented.');
  }

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to retrieve the underlying native server. Most custom implementations
   * will not need this.
   */
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}

```

```

As we can see, we're using the `__INLINE_CODE_9__` here to publish our serialized graph to the centralized registry. The `__INLINE_CODE_10__` is a custom environment variable that will let us control whether the graph should be published (CI/CD workflow), or not (regular application bootstrap). Also, we set the `__INLINE_CODE_11__` attribute here to `__INLINE_CODE_12__`. With this flag enabled, our application will bootstrap in the preview mode - which basically means that constructors (and lifecycle hooks) of all controllers, enhancers, and providers in our application will not be executed. Note - this isn't **required**, but makes things simpler for us since in this case we won't really have to connect to the database etc. when running our application in the CI/CD pipeline.

The `__INLINE_CODE_13__` object will vary depending on the CI/CD provider you're using. We will provide you with instructions for the most popular CI/CD providers below, in later sections.

Once the graph is successfully published, you'll see the following output in your workflow view:

```html
__HTML_TAG_43____HTML_TAG_44____HTML_TAG_45__

```

Every time our graph is published, we should see a new entry in the project's corresponding page:

```html
__HTML_TAG_46____HTML_TAG_47____HTML_TAG_48__

```

#### Reports

Devtools generate a report for every build **IF** there's a corresponding snapshot already stored in the centralized registry. So for example, if you create a PR against the `__INLINE_CODE_14__` branch for which the graph was already published - then the application will be able to detect differences and generate a report. Otherwise, the report will not be generated.

To see reports, navigate to the project's corresponding page (see organizations).

```html
__HTML_TAG_49____HTML_TAG_50____HTML_TAG_51__

```

This is particularly helpful in identifying changes that may have gone unnoticed during code reviews. For instance, let's say someone has changed the scope of a **deeply nested provider**. This change might not be immediately obvious to the reviewer, but with Devtools, we can easily spot such changes and make sure that they're intentional. Or if we remove a guard from a specific endpoint, it will show up as affected in the report. Now if we didn't have integration or e2e tests for that route, we might not notice that it's no longer protected, and by the time we do, it could be too late.

Similarly, if we're working on a **large codebase** and we modify a module to be global, we'll see how many edges were added to the graph, and this - in most cases - is a sign that we're doing something wrong.

#### Build preview

For every published graph we can go back in time and preview how it looked before by clicking at the **Preview** button. Furthermore, if the report was generated, we should see the differences highlighted on our graph:

- green nodes represent added elements
- light white nodes represent updated elements
- red nodes represent deleted elements

See screenshot below:

```html
__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

```

The ability to go back in time lets you investigate and troubleshoot the issue by comparing the current graph with the previous one. Depending on how you set things up, every pull request (or even every commit) will have a corresponding snapshot in the registry, so you can easily go back in time and see what changed. Think of Devtools as a Git but with an understanding of how Nest constructs your application graph, and with the ability to **visualize** it.

#### Integrations: GitHub Actions

First let's start from creating a new GitHub workflow in the `__INLINE_CODE_15__` directory in our project and call it, for example, `__INLINE_CODE_16__`. Inside this file, let's use the following definition:

```code

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);

```

```

Ideally, `__INLINE_CODE_17__` environment variable should be retrieved from GitHub Secrets, read more [here](./).

This workflow will run per each pull request that's targeting the ``@nestjs/microservices`` branch OR in case there's a direct commit to the ``@nestjs/microservice`` branch. Feel free to align this configuration to whatever your project needs. What's essential here is that we provide necessary environment variables for our ``@EventPattern`` class (to run).Here is the translation of the English technical documentation to Chinese:

然而，需要在使用这个工作流程之前更新一个变量 - `@MessagePattern`。我们可以在这个 __LINK_63__ 上生成一个专门为我们的项目创建的 API 密钥。

最后，让我们再次导航到 `GoogleCloudPubSubServer` 文件，并更新我们之前留空的 `listen()` 对象。

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}

```

为了获得最佳开发体验，请将 GitHub 应用程序集成到您的项目中，单击“集成 GitHub 应用程序”按钮（见下面的屏幕截图）。注意，这不是必需的。

__HTML_TAG_55____HTML_TAG_56____HTML_TAG_57__

通过集成，您将能够在 pull 请求中看到预览/报告生成进程的状态：

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

####  Integrations: Gitlab Pipelines

首先，让我们从创建一个新的 Gitlab CI 配置文件，位于我们的项目根目录，并将其命名为 `close()`。在这个文件中，让我们使用以下定义：

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}

```

> info **提示** Ideally, `CustomTransportStrategy` 环境变量应该从 secrets 中获取。

这个工作流程将在每个目标 `Server` 分支或直接提交到 `@nestjs/microservices` 分支时运行。请根据您的项目需求对这个配置进行调整。关键是提供必要的环境变量，以便我们的 `ServerRedis` 类 (以运行)。

然而，在这个工作流程定义中，有一个变量需要在使用这个工作流程之前更新 - `"Server"`。我们可以在这个 **页面** 上生成一个专门为我们的项目创建的 API 密钥。

最后，让我们再次导航到 `transport` 文件，并更新我们之前留空的 `options` 对象。

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }

```

#### 其他 CI/CD 工具

Nest Devtools CI/CD 集成可以与任意 CI/CD 工具结合使用（例如 __LINK_64__ , __LINK_65__ 等），因此不要感到受到我们描述的提供商的限制。

查看以下 `strategy` 对象配置，以了解在给定提交/构建/PR 中发布图表所需的信息。

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}

```

大多数这些信息通过 CI/CD 内置的环境变量提供（见 __LINK_66__ 和 __LINK_67__ ）。

在发布图表的 pipeline 配置中，我们建议使用以下触发器：

- `GoogleCloudPubSubServer` 事件 - 只在当前分支表示部署环境时，例如 `listen()` , `close()` , `Server` , `Server` , 等。
- `console.log` 事件 - 总是，或者在 **目标分支** 表示部署环境时（见上述）