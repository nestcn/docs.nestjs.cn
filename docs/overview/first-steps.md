---
title: 第一步
---

| 文件名                   | 描述                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `app.controller.ts`      | 一个具有单个路由的基本控制器。                                              |
| `app.controller.spec.ts` | 控制器的单元测试。                                                          |
| `app.module.ts`          | 应用程序的根模块。                                                          |
| `app.service.ts`         | 一个具有单个方法的基本服务。                                                |
| `main.ts`                | 应用程序的入口文件，它使用核心函数 `NestFactory` 来创建 Nest 应用程序实例。 |

`main.ts` 包含一个异步函数，它将**引导**我们的应用程序：

```ts title="main.ts"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

要创建 Nest 应用程序实例，我们使用核心的 `NestFactory` 类。`NestFactory` 暴露了几个静态方法，允许创建应用程序实例。`create()` 方法返回一个应用程序对象，该对象实现了 `INestApplication` 接口。该对象提供了一组方法，这些方法将在后续章节中描述。在上面的 `main.ts` 示例中，我们只是启动了 HTTP 监听器，这让应用程序可以等待入站的 HTTP 请求。

请注意，使用 Nest CLI 搭建的项目会创建一个初始项目结构，鼓励开发者遵循将每个模块保存在其自己的专用目录中的约定。

:::info 提示
 默认情况下，如果在创建应用程序时发生任何错误，你的应用程序将以代码 `1` 退出。如果你希望它抛出错误，请禁用 `abortOnError` 选项（例如，`NestFactory.create(AppModule, { abortOnError: false })`）。
:::

## 平台

Nest 旨在成为一个平台无关的框架。平台独立性使得创建可重用的逻辑部分成为可能，开发者可以在几种不同类型的应用程序中利用这些部分。从技术上讲，一旦创建了适配器，Nest 就能够与任何 Node HTTP 框架一起工作。开箱即用支持两个 HTTP 平台：[express](https://expressjs.com/) 和 [fastify](https://www.fastify.io)。你可以选择最适合你需求的平台。

| 平台               | 描述                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `platform-express` | [Express](https://expressjs.com/) 是一个著名的 Node.js 极简主义 Web 框架。它是一个经过实战检验、可用于生产的库，拥有大量由社区实现的资源。默认使用 `@nestjs/platform-express` 包。许多用户都能很好地使用 Express，无需采取任何行动来启用它。 |
| `platform-fastify` | [Fastify](https://www.fastify.io/) 是一个高性能、低开销的框架，高度专注于提供最大的效率和速度。在此处阅读如何使用它[《性能》](/techniques/performance)。                                                                                     |

无论使用哪个平台，它都会暴露自己的应用程序接口。这些分别被看作 `NestExpressApplication` 和 `NestFastifyApplication`。

当您将类型传递给 `NestFactory.create()` 方法时，如下面的示例所示，`app` 对象将具有专门用于该特定平台的方法。但是请注意，除非您实际想要访问底层平台 API，否则您**不**需要指定类型。

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

## 运行应用程序

安装过程完成后，您可以在操作系统命令提示符下运行以下命令来启动监听入站 HTTP 请求的应用程序：

```bash
$ npm run start

```

> 提示 为了加快开发过程（构建速度快 20 倍），您可以通过在 `start` 脚本中传递 `-b swc` 标志来使用 [SWC 构建器](/recipes/swc)，如下所示 `npm run start -- -b swc`。

此命令启动应用程序，HTTP 服务器监听 `src/main.ts` 文件中定义的端口。应用程序运行后，打开浏览器并导航到 `http://localhost:3000/`。您应该看到 `Hello World!` 消息。

要监视文件中的更改，您可以运行以下命令来启动应用程序：

```bash
$ npm run start:dev

```

此命令将监视您的文件，自动重新编译并重新加载服务器。

## 代码检查与格式化

[CLI](/cli/overview) 致力于为大规模开发提供可靠的工作流脚手架。因此，生成的 Nest 项目预装了代码**检查工具**和**格式化工具**（分别是 [eslint](https://eslint.org/) 和 [prettier](https://prettier.io/)）。

> 提示 不确定格式化工具与代码检查工具的区别？请查看[此处](https://prettier.io/docs/en/comparison.html)了解。

为了确保最大的稳定性和可扩展性，我们使用基础的 [`eslint`](https://www.npmjs.com/package/eslint) 和 [`prettier`](https://www.npmjs.com/package/prettier) cli 包。这种设置允许与官方扩展进行良好的 IDE 集成。

对于不依赖 IDE 的无头环境（持续集成、Git hooks 等），Nest 项目附带了可立即使用的 `npm` 脚本：

```bash
# 使用 eslint 进行代码检查和自动修复
$ npm run lint

# 使用 prettier 进行代码格式化
$ npm run format

```
