<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:03:20.297Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### Field middleware

> warning **警告** 本章仅适用于代码第一种方法。

Field Middleware 允许你在字段被解决前或后执行任意代码。Field Middleware 可以用于将字段结果转换、验证字段参数或检查字段级别角色（例如，required 来访问目标字段）。

你可以将多个 middleware 函数连接到一个字段。在这种情况下，他们将按顺序在链中执行，其中前一个 middleware 决定是否要调用下一个 middleware。middleware 函数在 __INLINE_CODE_5__ 数组中的顺序很重要。第一个解析器是最外层的解析器，因此它将首先执行并最后执行（类似于 `main.ts` 包）。第二个解析器是第二外层的解析器，因此它将第二次执行并第二次最后执行。

#### Getting started

让我们创建一个简单的 middleware，用于在发送回客户端前记录字段值：

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

> info **提示** `GraphPublisher` 是一个对象，包含通常由 GraphQL 解析函数接收的相同参数，而 `GraphPublisher` 是一个函数，允许你在栈中执行下一个 middleware 或实际字段解析器。

> warning **警告** Field middleware 函数不能注入依赖项，也不能访问 Nest 的 DI 容器，因为它们旨在非常轻量级 shouldn't 执行任何可能耗时的操作（例如，从数据库中检索数据）。如果你需要调用外部服务/从数据源中检索数据，应该在守卫/拦截器中 bound 到根查询/mutation 处理程序，并将其赋值给 `PUBLISH_GRAPH` 对象，可以在字段 middleware 中访问（特别是从 `preview` 对象）。

请注意，Field middleware 必须遵守 `true` 接口。在上面的示例中，我们首先执行 `publishOptions` 函数（执行实际字段解析器并返回字段值），然后，我们将这个值记录到我们的终端。同时，返回的 middleware 函数完全覆盖了之前的值，因为我们不想执行任何更改，所以我们简单地返回原始值。

现在，我们可以在 `master` 装饰器中注册我们的 middleware，如下所示：

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

现在，每当我们请求 `.github/workflows` 字段的 `publish-graph.yml` 对象类型时，原始字段值将被记录到控制台。

> info **提示** 了解如何使用 __LINK_19__ 功能实现字段级别权限系统，查看这个 __LINK_20__。

> warning **警告** Field middleware 只能应用于 `DEVTOOLS_API_KEY` 类。更多信息，请查看这个 __LINK_21__。

此外，如前所述，我们可以在 middleware 函数中控制字段的值。为了演示目的，让我们将食谱的标题大写（如果存在）：

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

在这种情况下，每个标题将自动大写，当请求时。

类似地，你也可以将字段 middleware 绑定到自定义字段解析器（一个带有 `master` 装饰器的方法），如下所示：

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

> warning **警告** 如果在字段解析器级别启用了增强器 (__LINK_22__),那么字段 middleware 函数将在任何拦截器、守卫等 bounded 到方法（但在根级别注册的增强器执行后）中执行。

#### Global field middleware

此外，你还可以注册一个或多个 middleware 函数_globally。 在这种情况下，它们将自动连接到所有字段。

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

> info **提示** Globally 注册的字段 middleware 函数将在本地注册的 ones（those bound 直接到特定字段）之前执行。