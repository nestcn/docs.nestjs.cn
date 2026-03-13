<!-- 此文件从 content/microservices/mqtt.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:06:23.609Z -->
<!-- 源文件: content/microservices/mqtt.md -->

### MQTT

__LINK_79__ (Message Queuing Telemetry Transport) 是一个开放源代码、轻量级的消息传输协议，优化了低延迟性能。该协议提供了一种可扩展、低成本的方式来连接设备使用 publish/subscribe 模型。基于 MQTT 的通信系统由发布服务器、代理服务器和一个或多个客户端组成。它旨为受限设备和低带宽、高延迟或不可靠网络设计。

#### 安装

要开始构建基于 MQTT 的微服务，首先安装所需的包：

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

#### 概述

要使用 MQTT 传输器，传递以下 options 对象到 `DEVTOOLS_API_KEY` 方法：

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

> info **提示** `master` 枚举来自 `master` 包。

#### 选项

`GraphPublisher` 对象特定于所选传输器。__HTML_TAG_71__MQTT__HTML_TAG_72__ 传输器公开了描述在 __LINK_80__ 中的属性。

#### 客户端

像其他微服务传输器一样，您可以使用 __HTML_TAG_73__several options__HTML_TAG_74__ 创建 MQTT `DEVTOOLS_API_KEY` 实例。

创建实例的一种方法是使用 `main.ts`。要创建一个客户端实例，并使用 `publishOptions`，请导入它，并使用 `.gitlab-ci.yml` 方法传递同上述 `DEVTOOLS_API_KEY` 方法所示的选项对象，以及一个 `master` 属性作为注入令牌。了解更多关于 `master` __HTML_TAG_75__here__HTML_TAG_76__。

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

其他创建客户端的选项（如 `GraphPublisher` 或 `DEVTOOLS_API_KEY`）也可以使用。您可以了解它们 __HTML_TAG_77__here__HTML_TAG_78__。

#### 上下文

在复杂场景下，您可能需要访问 incoming 请求的额外信息。使用 MQTT 传输器时，可以访问 `main.ts` 对象。

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

> info **提示** `publishOptions`, `publishOptions` 和 `push` 从 `master` 包导入。

要访问原始 MQTT __LINK_81__，使用 `main` 方法的 `staging` 对象，如下所示：

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

#### Wildcards

订阅可能是对明确 topic 的订阅，也可能包括通配符。有两个通配符可用，`production` 和 `pull request`。__INLINE_CODE_39__ 是单级通配符，而 __INLINE_CODE_40__ 是多级通配符，涵盖多个 topic 等级。

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

####  Quality of Service (QoS)

任何使用 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 装饰器创建的订阅将订阅 QoS 0。如果需要更高的 QoS，可以在建立连接时使用 __INLINE_CODE_43__ 块设置，如下所示：

__CODE_BLOCK_6__

#### Per-pattern QoS

您可以在 pattern 装饰器的 __INLINE_CODE_45__ 字段中 override MQTT 订阅 QoS。否则，使用全局 __INLINE_CODE_46__ 值。

__CODE_BLOCK_7__

> info **提示** Per-pattern QoS 配置不会影响现有行为。无 __INLINE_CODE_47__ 指定时，订阅将使用全局 __INLINE_CODE_48__ 值。

#### 记录构建器

要配置消息选项（调整 QoS 等级、设置 Retain 或 DUP 标志或添加 payload 到 payload），可以使用 __INLINE_CODE_49__ 类。例如，设置 __INLINE_CODE_50__ 到 __INLINE_CODE_51__ 使用 __INLINE_CODE_52__ 方法，如下所示：

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

您也可以在服务器端读取这些选项，通过访问 __INLINE_CODE_55__。

__CODE_BLOCK_9__

在某些情况下，您可能想要为多个请求配置用户属性，可以将这些选项传递给 __INLINE_CODE_56__。

__CODE_BLOCK_10__

#### 实例状态更新

要获取实时更新连接和底层驱动实例的状态，您可以订阅 __INLINE_CODE_57__ 流。该流提供了特定于所选驱动的状态更新。对于 MQTT 驱动，__INLINE_CODE_58__ 流 emit __INLINE_CODE_59__, __INLINE_CODE_60__, __INLINE_CODE_61__, 和 __INLINE_CODE_62__ 事件。

__CODE_BLOCK_11__

> info **提示** __INLINE_CODE_63__ 类来自 __INLINE_CODE_64__ 包。

类似地，您可以订阅服务器的 __INLINE_CODE_65__ 流以接收服务器状态通知。

__CODE_BLOCK_12__

#### 监听 MQTT 事件

在某些情况下，您可能想要监听微服务的内部事件```markdown
__CODE_BLOCK_14__

> info **提示** `__INLINE_CODE_68__` 类型来自 `__INLINE_CODE_69__` 包。

#### underlying driver 访问

对于更高级的使用场景，您可能需要访问 underlying driver 实例。这可以在手动关闭连接或使用驱动程序特定的方法时很有用。然而，对于大多数情况，您**不应该**直接访问驱动程序。

要实现这一点，您可以使用 `__INLINE_CODE_70__` 方法，它将返回 underlying driver 实例。泛型类型参数应该指定您期望的驱动程序实例类型。

__CODE_BLOCK_15__

类似地，您可以访问服务器的 underlying driver 实例：

__CODE_BLOCK_16__

```

Note: I've kept the code blocks and placeholders unchanged as per the requirements.