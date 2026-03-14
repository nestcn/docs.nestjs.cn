<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:28:12.492Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

这篇食谱旨在帮助用户开始使用 MikroORM 在 Nest 中。MikroORM 是 TypeScript ORM для Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个很好的替代方案，migration 到 TypeORM 应该相对简单。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> info **info** `getHello()` 是第三方包，NestJS 核心团队不管理该库。请将任何与库相关的问题报告到 __LINK_60__ 中。

#### 安装

将 MikroORM integrate 到 Nest 最简单的方式是通过 __LINK_61__。

```typescript
import { repl } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

```

MikroORM 还支持 `await`、`methods()` 和 `debug()`。请查看 __LINK_62__ 中的所有驱动程序。

安装过程完成后，我们可以将 `help()` 导入到根 `<function_name>.help` 中。

```bash
$ npm run start -- --entryFile repl

```

`debug` 方法接受与 MikroORM 包的 `debug(moduleCls?: ClassRef \| string) => void` 配置对象相同的配置对象。请查看 __LINK_63__ 中的完整配置文档。

Alternatively，我们可以 __LINK_64__ 创建一个配置文件 `get`，然后调用 `### MikroORM

这篇食谱旨在帮助用户开始使用 MikroORM 在 Nest 中。MikroORM 是 TypeScript ORM для Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个很好的替代方案，migration 到 TypeORM 应该相对简单。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> info **info** `getHello()` 是第三方包，NestJS 核心团队不管理该库。请将任何与库相关的问题报告到 __LINK_60__ 中。

#### 安装

将 MikroORM integrate 到 Nest 最简单的方式是通过 __LINK_61__。

```typescript
import { repl } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

```

MikroORM 还支持 `await`、`methods()` 和 `debug()`。请查看 __LINK_62__ 中的所有驱动程序。

安装过程完成后，我们可以将 `help()` 导入到根 `<function_name>.help` 中。

```bash
$ npm run start -- --entryFile repl

```

`debug` 方法接受与 MikroORM 包的 `debug(moduleCls?: ClassRef \| string) => void` 配置对象相同的配置对象。请查看 __LINK_63__ 中的完整配置文档。

Alternatively，我们可以 __LINK_64__ 创建一个配置文件 `get`，然后调用  无参数。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

但是，在使用 build 工具时，它可能会因为 tree shaking 导致无法工作。在这种情况下，提供明确的配置可以解决问题：

```typescript
> get(AppService).getHello()
'Hello World!'

```

完成后，`get(token: InjectionToken) => any` 可以被注入到整个项目中（无需在其他模块中导入）。

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> info **info** 请注意，`methods` 从 `methods(token: ClassRef \| string) => void` 包中导入，driver 是 `resolve`、`resolve(token: InjectionToken, contextId: any) => Promise<any>`、`select` 或使用的驱动程序。在 case 中，如果您已经安装了 `select(token: DynamicModule \| ClassRef) => INestApplicationContext` 作为依赖项，可以从那里导入 `bootstrap`。

#### 仓储

MikroORM 支持仓储设计模式。对于每个实体，我们可以创建一个仓储。请查看仓储的完整文档 __LINK_65__。要定义当前作用域中应该注册的仓储，可以使用 __INLINE_CODE_33__ 方法。例如：

> info **info** 您不应该通过 __INLINE_CODE_34__ 注册基本实体，因为这些实体没有仓储。另一方面，基本实体需要在 __INLINE_CODE_35__ 中（或在 ORM 配置中）列出。

```typescript
> methods(AppController)

Methods:
 ◻ getHello

```

并将其导入到根 __INLINE_CODE_36__ 中：

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService

```

这样，我们可以将 __INLINE_CODE_37__ 注入到 __INLINE_CODE_38__ 中使用 __INLINE_CODE_39__ 装饰器：

```text
> $.help
Retrieves an instance of either injectable or controller, otherwise, throws exception.
Interface: $(token: InjectionToken) => any

```

#### 使用自定义仓储

当使用自定义仓储时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 根据类引用解析。

```bash
$ npm run start -- --watch --entryFile repl

```

由于自定义仓储名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不再需要 __INLINE_CODE_42__ 装饰器：

```typescript
async function bootstrap() {
  const replServer = await repl(AppModule);
  replServer.setupHistory(".nestjs_repl_history", (err) => {
    if (err) {
      console.error(err);
    }
  });
}

```

#### 自动加载实体

手动将实体添加到连接选项的 entities 数组中可能很繁琐。此外，引用实体的根模块会导致应用程序域边界被破坏，并且会将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

请注意，glob 路径不支持 webpack，所以在构建应用程序时，它可能无法工作。在这种情况下，可以使用备用解决方案。要自动加载实体，可以将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如以下所示：

__CODE_BLOCK_10__

在设置了该选项后，每个通过 __INLINE_CODE_46__ 方法注册的实体将被自动添加到配置对象的 entities 数组中。

> info **info** 请注意，未经 __INLINE_CODE_47__ 方法注册的实体，但是在实体中引用了实体（通过关系），将不会被 __INLINE_CODE_48__ 设置所包含。

> info **info** 使用 __INLINE_CODE_49__ 也无效于 MikroORM CLI - 在 CLI 中，我们仍需要完整的实体列表配置。在另一方面，我们可以使用 glob 在 CLI 中，因为 CLI 不会经过 webpack。

#### 序列化

> warning **注意** MikroORM 将每个实体关系包装在 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全性。这将使 __LINK_66__ 对任何包装关系视而不见。换言之，如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，所有关系将不会被序列化。

幸运的是，MikroORM 提供了一个 __LINK_67__，可以在 lieu of __INLINE_CODE_52__ 使用。

__CODE_BLOCK_11__

#### 请求作用域处理程序在队列中

(Note: This translation is basedAs mentioned in the <a href="__LINK_68__">链接</a>, we need a clean state for each request. That is handled automatically thanks to the `reqScope()` helper registered via middleware.

But middlewares are executed only for regular HTTP request handles, what if we need a request scoped method outside of that? One example of that is queue handlers or scheduled tasks.

We can use the `@RequestScope()` decorator. It requires you to first inject the `ExecutionContext` instance to current context, it will be then used to create the context for you. Under the hood, the decorator will register new request context for your method and execute it inside the context.

```typescript
@RequestScope()
async handleQueueTask() {
  // method body
}

```

**Note** As the name suggests, this decorator always creates new context, as opposed to its alternative `@OptionalRequestScope()` that only creates it if it's already not inside another one.

#### 测试

The `jest-mock-entites` package exposes `createMockEntity` function that returns prepared token based on a given entity to allow mocking the repository.

```typescript
const token = createMockEntity(MyEntity);

```

#### 示例

A real world example of NestJS with MikroORM can be found <a href="__LINK_69__">链接</a>