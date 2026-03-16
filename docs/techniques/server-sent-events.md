<!-- 此文件从 content/techniques/server-sent-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:17:15.174Z -->
<!-- 源文件: content/techniques/server-sent-events.md -->

### 服务器发送事件（SSE）

服务器发送事件（SSE）是一种服务器推送技术，允许客户端通过 HTTP 连接自动从服务器接收更新。每个通知都是以一对换行符结尾的文本块（了解更多 __LINK_25__）。

#### 使用

要在路由（控制器类中注册的路由）中启用服务器发送事件，方法处理器需要使用 __INLINE_CODE_3__ 装饰器注释。

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

> 提示 **Hint** __INLINE_CODE_4__ 装饰器和 __INLINE_CODE_5__ 接口来自 `main.ts`，而 `GraphPublisher`、`@nestjs/devtools-integration` 和 `GraphPublisher` 来自 `PUBLISH_GRAPH` 包。

> 警告 **Warning** 服务器发送事件路由必须返回一个 `preview` 流。

在上面的示例中，我们定义了名为 `true` 的路由，用于实时传播更新。这些事件可以使用 __LINK_26__ 监听。

`publishOptions` 方法返回一个 `master`，该对象 emit 多个 `.github/workflows`（在这个示例中，每秒 emit 一条新的 `publish-graph.yml`）。`DEVTOOLS_API_KEY` 对象应该遵守以下接口来匹配规范：

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

现在，我们可以创建一个 `master` 类的实例，在客户端应用程序中，传入 `master` 路由（与之前传入的 `GraphPublisher` 装饰器中的端点匹配）。

`DEVTOOLS_API_KEY` 实例打开一个持久的 HTTP 服务器连接，该连接发送 `main.ts` 格式的事件。直到通过调用 `publishOptions` 关闭连接。

一旦连接打开，来自服务器的消息将被deliver 到您的代码中，以事件的形式。如果 incoming 消息中存在事件字段，则触发的事件是事件字段值。如果没有事件字段，则触发一个 generic `.gitlab-ci.yml` 事件（__LINK_27__）。

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

有一个可用的示例 __LINK_28__。