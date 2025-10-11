### CI/CD 集成

:::info 提示
本章介绍 Nest Devtools 与 Nest 框架的集成。如需了解 Devtools 应用程序，请访问 [Devtools](https://devtools.nestjs.com) 官网。
:::

CI/CD 集成功能适用于**[企业版](/settings)**计划的用户。

您可以通过观看此视频了解 CI/CD 集成如何帮助您及其原因：

<figure>
  <iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/r5RXcBrnEQ8"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  ></iframe>
</figure>

#### 发布图表

首先配置应用程序的启动文件(`main.ts`)以使用 `GraphPublisher` 类（从 `@nestjs/devtools-integration` 导出 - 详见前一章节），如下所示：

```typescript
async function bootstrap() {
  const shouldPublishGraph = process.env.PUBLISH_GRAPH === "true";

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    preview: shouldPublishGraph,
  });

  if (shouldPublishGraph) {
    await app.init();

    const publishOptions = { ... } // NOTE: this options object will vary depending on the CI/CD provider you're using
    const graphPublisher = new GraphPublisher(app);
    await graphPublisher.publish(publishOptions);

    await app.close();
  } else {
    await app.listen(process.env.PORT ?? 3000);
  }
}
```

可以看到，我们在此使用 `GraphPublisher` 将序列化的图发布到中央注册表。`PUBLISH_GRAPH` 是一个自定义环境变量，用于控制是否应发布该图（CI/CD 工作流）或不发布（常规应用程序启动）。此外，我们在此将 `preview` 属性设置为 `true`。启用此标志后，我们的应用程序将以预览模式启动 - 这意味着应用程序中所有控制器、增强器和提供者的构造函数（及生命周期钩子）都不会被执行。注意 - 这并非**必需** ，但对我们来说会简化操作，因为在这种情况下，在 CI/CD 流水线中运行应用程序时，我们实际上无需连接数据库等操作。

`publishOptions` 对象会根据您使用的 CI/CD 提供商而有所不同。我们将在后面章节中为您提供流行 CI/CD 提供商的具体配置说明。

当图表成功发布后，您将在工作流视图中看到以下输出：

<figure><img src="/assets/devtools/graph-published-terminal.png" /></figure>

每次我们的图表发布时，都应在项目的对应页面看到新的条目：

<figure><img src="/assets/devtools/project.png" /></figure>

#### 报告

Devtools 会为每次构建生成报告**前提是**中央注册表中已存储了对应的快照。例如，如果您针对 `master` 分支创建 PR 且该分支的依赖图已发布，应用程序就能检测差异并生成报告。否则，将不会生成报告。

要查看报告，请导航至项目的对应页面（参见组织架构）。

<figure><img src="/assets/devtools/report.png" /></figure>

这对于识别代码审查中可能被忽略的变更特别有帮助。例如，假设有人修改了**深层嵌套 provider** 的作用域，这种变更可能不会立即引起审查者的注意，但通过 Devtools，我们可以轻松发现这类变更并确认它们是有意为之。又或者，如果我们移除了特定端点的防护措施，报告中会显示该端点受到影响。若此时我们没有为该路由配置集成测试或端到端测试，就可能无法注意到它已失去保护，等到发现时可能为时已晚。

同样地，如果我们正在处理一个**大型代码库**并将某个模块修改为全局作用域，我们会看到图中新增了多少条边——在大多数情况下，这都表明我们的操作存在问题。

#### 构建预览

对于每个已发布的图表，我们可以通过点击**预览**按钮查看其历史版本。此外，如果生成了报告，我们应该能在图表上看到高亮显示的差异：

- 绿色节点代表新增元素
- 浅色白色节点表示已更新的元素
- 红色节点表示已删除的元素

请看下面的截图：

<figure><img src="/assets/devtools/nodes-selection.png" /></figure>

时光回溯功能允许您通过比较当前图表与前一个图表来调查和解决问题。根据您的设置，每个拉取请求（甚至每次提交）都将在注册表中有一个对应的快照，因此您可以轻松回溯时间查看变更内容。将开发者工具视为具备理解 Nest 如何构建应用图表能力的 Git 工具，并且能够**可视化**展示这个过程。

#### 集成：GitHub Actions

首先，我们从在项目的 `.github/workflows` 目录下创建一个新的 GitHub 工作流开始，例如命名为 `publish-graph.yml`。在该文件中，我们使用以下定义：

```yaml
name: Devtools

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - '*'

jobs:
  publish:
    if: github.actor!= 'dependabot[bot]'
    name: Publish graph
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Setup Environment (PR)
        if: {{ '${{' }} github.event_name == 'pull_request' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA={{ '${{' }} github.event.pull_request.head.sha {{ '}}' }}" >>${GITHUB_ENV}
      - name: Setup Environment (Push)
        if: {{ '${{' }} github.event_name == 'push' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA=${GITHUB_SHA}" >> ${GITHUB_ENV}
      - name: Publish
        run: PUBLISH_GRAPH=true npm run start
        env:
          DEVTOOLS_API_KEY: CHANGE_THIS_TO_YOUR_API_KEY
          REPOSITORY_NAME: {{ '${{' }} github.event.repository.name {{ '}}' }}
          BRANCH_NAME: {{ '${{' }} github.head_ref || github.ref_name {{ '}}' }}
          TARGET_SHA: {{ '${{' }} github.event.pull_request.base.sha {{ '}}' }}
```

理想情况下，`DEVTOOLS_API_KEY` 环境变量应从 GitHub Secrets 中获取，更多信息请参阅[此处](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) 。

该工作流将在每个针对 `master` 分支的拉取请求时运行，或者当有代码直接提交到 `master` 分支时触发。您可以根据项目需求自由调整此配置。关键是要为我们的 `GraphPublisher` 类提供必要的环境变量（以便运行）。

不过，在使用此工作流之前，我们需要先更新一个变量——`DEVTOOLS_API_KEY`。我们可以在这个[页面](https://devtools.nestjs.com/settings/manage-api-keys)上为项目生成专属的 API 密钥。

最后，让我们再次导航到 `main.ts` 文件，更新之前留空的 `publishOptions` 对象。

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.REPOSITORY_NAME,
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  sha: process.env.COMMIT_SHA,
  target: process.env.TARGET_SHA,
  trigger: process.env.GITHUB_BASE_REF ? 'pull' : 'push',
  branch: process.env.BRANCH_NAME,
};
```

为了获得最佳开发者体验，请确保通过点击"集成 GitHub 应用"按钮（见下方截图）为项目集成 **GitHub 应用程序** 。注意——此步骤非必需。

<figure><img src="/assets/devtools/integrate-github-app.png" /></figure>

完成此集成后，您将能在拉取请求中直接查看预览/报告生成过程的状态：

<figure><img src="/assets/devtools/actions-preview.png" /></figure>

#### 集成：Gitlab 流水线

首先，我们在项目根目录下创建一个新的 Gitlab CI 配置文件，例如命名为 `.gitlab-ci.yml`。在该文件中，我们使用以下定义：

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.REPOSITORY_NAME,
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  sha: process.env.COMMIT_SHA,
  target: process.env.TARGET_SHA,
  trigger: process.env.GITHUB_BASE_REF ? 'pull' : 'push',
  branch: process.env.BRANCH_NAME,
};
```

:::info 提示
理想情况下，`DEVTOOLS_API_KEY` 环境变量应从机密信息中获取。
:::



该工作流将在每个针对 `master` 分支的拉取请求时运行，或者当有代码直接提交到 `master` 分支时触发。您可以根据项目需求自由调整此配置。关键在于我们需要为 `GraphPublisher` 类提供必要的环境变量（以便运行）。

不过，在使用此工作流之前，我们需要先更新一个变量（在此工作流定义中）——`DEVTOOLS_API_KEY`。我们可以在这个**页面**上为项目生成专属的 API 密钥。

最后，让我们再次导航到 `main.ts` 文件，更新之前留空的 `publishOptions` 对象。

```yaml
image: node:16

stages:
  - build

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: always
    - if: $CI_COMMIT_BRANCH == "master" && $CI_PIPELINE_SOURCE == "push"
      when: always
    - when: never

install_dependencies:
  stage: build
  script:
    - npm ci

publish_graph:
  stage: build
  needs:
    - install_dependencies
  script: npm run start
  variables:
    PUBLISH_GRAPH: 'true'
    DEVTOOLS_API_KEY: 'CHANGE_THIS_TO_YOUR_API_KEY'
```

#### 其他 CI/CD 工具

Nest Devtools 的 CI/CD 集成可与您选择的任何 CI/CD 工具（如 [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines)、[CircleCI](https://circleci.com/) 等）配合使用，因此不必局限于我们在此描述的提供商。

查看以下 `publishOptions` 对象配置，了解发布特定提交/构建/PR 的图表所需信息。

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.CI_PROJECT_NAME,
  owner: process.env.CI_PROJECT_ROOT_NAMESPACE,
  sha: process.env.CI_COMMIT_SHA,
  target: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA,
  trigger: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA ? 'pull' : 'push',
  branch: process.env.CI_COMMIT_BRANCH ?? process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME,
};
```

这些信息大多通过 CI/CD 内置环境变量提供（参见 [CircleCI 内置环境变量列表](https://circleci.com/docs/variables/#built-in-environment-variables)和 [Bitbucket 变量](https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/) ）。

关于发布图表的流水线配置，我们建议使用以下触发器：

- `push` 事件 - 仅当当前分支代表部署环境时使用，例如 `master`、`main`、`staging`、`production` 等。
- `pull request` 事件 - 始终触发，或当**目标分支**代表部署环境时触发（参见上文）
