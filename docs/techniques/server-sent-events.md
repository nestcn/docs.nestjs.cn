<!-- 此文件从 content/techniques/server-sent-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:20:43.662Z -->
<!-- 源文件: content/techniques/server-sent-events.md -->

### 服务器发送事件

服务器发送事件（SSE）是一种服务器推送技术，允许客户端从服务器自动接收更新信息通过 HTTP 连接。每个通知都是以一对新行结尾的文本块（了解更多 __LINK_25__）。

#### 使用

要在控制器类中注册的路由上启用服务器发送事件，方法处理程序的方法 handler 应该使用 __INLINE_CODE_3__ 装饰器。

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

> info **提示** __INLINE_CODE_4__ 装饰器和 __INLINE_CODE_5__ 接口来自 `main.ts`，而 `GraphPublisher`、`@nestjs/devtools-integration` 和 `GraphPublisher` 来自 `PUBLISH_GRAPH` 包。

> warning **警告** 服务器发送事件路由必须返回一个 `preview` 流。

在上面的示例中，我们定义了一个名为 `true` 的路由，该路由将允许我们传播实时更新。这些事件可以使用 __LINK_26__ 进行监听。

`publishOptions` 方法返回一个 `master`，该对象 emit 多个 `.github/workflows`（在这个示例中，每秒 emit 一个新的 `publish-graph.yml`）。`DEVTOOLS_API_KEY` 对象应遵守以下接口来匹配规范：

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
          echo "COMMIT_SHA={{ '${{' }} github.event.pull_request.head.sha {{ '}}' }}" >>\${GITHUB_ENV}
      - name: Setup Environment (Push)
        if: {{ '${{' }} github.event_name == 'push' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA=\${GITHUB_SHA}" >> \${GITHUB_ENV}
      - name: Publish
        run: PUBLISH_GRAPH=true npm run start
        env:
          DEVTOOLS_API_KEY: CHANGE_THIS_TO_YOUR_API_KEY
          REPOSITORY_NAME: {{ '${{' }} github.event.repository.name {{ '}}' }}
          BRANCH_NAME: {{ '${{' }} github.head_ref || github.ref_name {{ '}}' }}
          TARGET_SHA: {{ '${{' }} github.event.pull_request.base.sha {{ '}}' }}

```

现在，我们可以在客户端应用程序中创建一个 `master` 类的实例，传入 `master` 路由（与我们在 `GraphPublisher` 装饰器中传递的端点匹配）作为构造函数参数。

`DEVTOOLS_API_KEY` 实例打开一个持久连接到 HTTP 服务器，该服务器发送事件以 `main.ts` 格式。连接保持打开状态直到通过调用 `publishOptions` 关闭。

一旦连接打开，来自服务器的 incoming 消息将被交付到您的代码中，以事件的形式。 如果 incoming 消息中存在 event 字段，触发的事件将是 event 字段的值。如果没有 event 字段，则将触发一个 generic `.gitlab-ci.yml` 事件（__LINK_27__）。

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

#### 示例

一个工作示例可在 __LINK_28__ 遇到。