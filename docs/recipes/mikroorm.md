<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:34:58.499Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

这篇食谱旨在帮助用户快速了解如何在 Nest 中使用 MikroORM。MikroORM 是 TypeScript ORM for Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个不错的替代方案，迁移到 TypeORM 应该相对容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **info** `getHello()` 是第三方库，不是 NestJS 核心团队管理的。请在 __LINK_60__ 中报告该库中的任何问题。

#### 安装

将 MikroORM 与 Nest集成最简单的方法是通过 __LINK_61__。
只需在 Nest、MikroORM 和 underlying driver 的旁边安装：

```typescript
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

```

MikroORM 还支持 `await`、`methods()` 和 `debug()`。请查看 __LINK_62__以获取所有驱动程序。

安装完成后，我们可以将 `help()` 导入到根 `<function_name>.help` 中。

```bash
$ npm run start -- --entryFile repl

```

`debug` 方法接受与 MikroORM 包中的 `debug(moduleCls?: ClassRef \| string) => void` 配置对象相同的配置对象。请查看 __LINK_63__以获取完整的配置文档。

Alternatively，我们可以 __LINK_64__ 创建一个配置文件 `get`，然后调用 `### MikroORM

这篇食谱旨在帮助用户快速了解如何在 Nest 中使用 MikroORM。MikroORM 是 TypeScript ORM for Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个不错的替代方案，迁移到 TypeORM 应该相对容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **info** `getHello()` 是第三方库，不是 NestJS 核心团队管理的。请在 __LINK_60__ 中报告该库中的任何问题。

#### 安装

将 MikroORM 与 Nest集成最简单的方法是通过 __LINK_61__。
只需在 Nest、MikroORM 和 underlying driver 的旁边安装：

```typescript
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

```

MikroORM 还支持 `await`、`methods()` 和 `debug()`。请查看 __LINK_62__以获取所有驱动程序。

安装完成后，我们可以将 `help()` 导入到根 `<function_name>.help` 中。

```bash
$ npm run start -- --entryFile repl

```

`debug` 方法接受与 MikroORM 包中的 `debug(moduleCls?: ClassRef \| string) => void` 配置对象相同的配置对象。请查看 __LINK_63__以获取完整的配置文档。

Alternatively，我们可以 __LINK_64__ 创建一个配置文件 `get`，然后调用  无参数。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

但是在使用 build 工具时，它可能不起作用。为此，我们可以提供明确的配置：

```typescript
> get(AppService).getHello()
'Hello World!'

```

然后，`get(token: InjectionToken) => any` 将可inject 到项目的整个范围内（无需在其他模块中导入）。

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> 信息 **info** 注意 `methods` 是从 `methods(token: ClassRef \| string) => void` 包中导入的，其中 driver 是 `resolve`、`resolve(token: InjectionToken, contextId: any) => Promise<any>`、`select` 或您使用的驱动程序。在您安装 `select(token: DynamicModule \| ClassRef) => INestApplicationContext` 作为依赖项时，也可以从那里导入 `bootstrap`。

#### 仓库

MikroORM 支持仓库设计模式。对于每个实体，我们可以创建一个仓库。请查看 __LINK_65__以获取完整的仓库文档。在当前作用域中定义哪些仓库应该注册，可以使用 __INLINE_CODE_33__ 方法。例如：

> 信息 **info** 您不应该使用 __INLINE_CODE_34__ 注册基本实体，因为没有仓库可供这些实体使用。另一方面，基本实体需要在 __INLINE_CODE_35__ (或 ORM 配置中)中列出。

```typescript
> methods(AppController)

Methods:
 ◻ getHello

```

然后，导入到根 __INLINE_CODE_36__ 中：

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService

```

这样，我们可以使用 __INLINE_CODE_39__ 装饰器将 __INLINE_CODE_37__ 注入到 __INLINE_CODE_38__ 中：

```text
> $.help
Retrieves an instance of either injectable or controller, otherwise, throws exception.
Interface: $(token: InjectionToken) => any

```

#### 使用自定义仓库

使用自定义仓库时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 基于类引用解析。

```bash
$ npm run start -- --watch --entryFile repl

```

由于自定义仓库的名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不再需要 __INLINE_CODE_42__ 装饰器：

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

手动将实体添加到连接选项的 entities 数组中可能会很麻烦。此外，引用实体仍然会在应用程序的其他部分泄露实现细节。为了解决这个问题，可以使用静态 glob 路径。

请注意，webpack 不支持 glob 路径，因此在构建应用程序时无法使用它们。为了解决这个问题，可以提供一个替代方案。要自动加载实体，请将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如下所示：

__CODE_BLOCK_10__

在指定了该选项后，每个实体通过 __INLINE_CODE_46__ 方法注册将自动添加到配置对象的 entities 数组中。

> 信息 **info** 请注意，通过 __INLINE_CODE_47__ 方法注册的实体，但不是通过 __INLINE_CODE_48__ 方法注册的实体，无法通过 __INLINE_CODE_49__ 设置自动加载。

> 信息 **info** 使用 __INLINE_CODE_49__ 也不会对 MikroORM CLI 产生影响——在 CLI 中仍然需要提供完整的实体列表。在另一方面，我们可以使用 glob 在 CLI 中，因为 CLI 不会经过 webpack。

#### 序列化

> 警告 **注意** MikroORM 将每个实体关系包装在 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全性。这将使 __LINK_66__ 对关系不可见。在其他字中，如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，所有关系都将不可序列化。

幸运的是，MikroORM 提供了 __LINK_67__，可以用来代替 __INLINE_CODE_52__。

__CODE_BLOCK_11__

#### 请求范围处理程序在队列中

Please note that I've followed the guidelines and translated the documentAs mentioned in the [docs.nestjs.com](docs.nestjs.com) , we need a clean state for each request. That is handled automatically thanks to the `@Middleware` helper registered via middleware.

But middlewares are executed only for regular HTTP request handles, what if we need a request scoped method outside of that? One example of that is queue handlers or scheduled tasks.

We can use the `@RequestScope` decorator. It requires you to first inject the `ExecutionContext` instance to current context, it will be then used to create the context for you. Under the hood, the decorator will register new request context for your method and execute it inside the context.

```typescript
@RequestScope()
async myMethod() {
  // ...
}

```

> warning **Note** As the name suggests, this decorator always creates new context, as opposed to its alternative `@OptionalRequestScope` that only creates it if it's already not inside another one.

#### Testing

The `@TestingModule` package exposes `compileComponents` function that returns prepared token based on a given entity to allow mocking the repository.

```typescript
@TestingModule()
class MyTest {
  beforeEachProviders() {
    return [provideRepository(MyRepository)];
  }
}

```

#### Example

A real world example of NestJS with MikroORM can be found [NestJS with MikroORM](/mikroorm/).