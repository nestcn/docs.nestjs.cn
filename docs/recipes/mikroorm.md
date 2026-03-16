<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:03:19.159Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

MikroORM 是一份 TypeScript ORM，基于数据映射器、工作单元和身份映射器模式，为 Node.js 提供支持。它是 TypeORM 的一个不错的替代品，TypeORM 的迁移应该相对容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **信息** `getHello()` 是第三方包，不受 NestJS 核心团队管理。请将与库相关的任何问题报告到 __LINK_60__。

#### 安装

将 MikroORM 集成到 Nest 中的最简单方法是通过 __LINK_61__。只需将其安装到 Nest、MikroORM 和底层驱动器旁边：

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

MikroORM 还支持 `await`、`methods()` 和 `debug()`。请查看 __LINK_62__ 以获取所有驱动器的信息。

安装完成后，我们可以将 `help()` 导入到根 `<function_name>.help` 中。

```bash
$ npm run start -- --entryFile repl

```

`debug` 方法接受与 MikroORM 包中的 `debug(moduleCls?: ClassRef \| string) => void` 配置对象相同的配置对象。请查看 __LINK_63__以获取完整的配置文档。

或者，我们可以 __LINK_64__ 创建一个配置文件 `get`，然后调用 `### MikroORM

MikroORM 是一份 TypeScript ORM，基于数据映射器、工作单元和身份映射器模式，为 Node.js 提供支持。它是 TypeORM 的一个不错的替代品，TypeORM 的迁移应该相对容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **信息** `getHello()` 是第三方包，不受 NestJS 核心团队管理。请将与库相关的任何问题报告到 __LINK_60__。

#### 安装

将 MikroORM 集成到 Nest 中的最简单方法是通过 __LINK_61__。只需将其安装到 Nest、MikroORM 和底层驱动器旁边：

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

MikroORM 还支持 `await`、`methods()` 和 `debug()`。请查看 __LINK_62__ 以获取所有驱动器的信息。

安装完成后，我们可以将 `help()` 导入到根 `<function_name>.help` 中。

```bash
$ npm run start -- --entryFile repl

```

`debug` 方法接受与 MikroORM 包中的 `debug(moduleCls?: ClassRef \| string) => void` 配置对象相同的配置对象。请查看 __LINK_63__以获取完整的配置文档。

或者，我们可以 __LINK_64__ 创建一个配置文件 `get`，然后调用  不带参数。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

然而，这在使用 Tree Shaking 的构建工具时不会工作。在这种情况下，提供 config.explicitly 是更好的选择：

```typescript
> get(AppService).getHello()
'Hello World!'

```

完成后，`get(token: InjectionToken) => any` 将可在整个项目中注入（不需要在其他模块中导入）。

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> 信息 **信息** 注意 `methods` 是从 `methods(token: ClassRef \| string) => void` 包中导入的，其中驱动器是 `resolve`、`resolve(token: InjectionToken, contextId: any) => Promise<any>`、`select` 或您使用的驱动器。假设您已经安装了 `select(token: DynamicModule \| ClassRef) => INestApplicationContext` 作为依赖项，可以从那里导入 `bootstrap`。

#### 仓储

MikroORM 支持仓储设计模式。对于每个实体，我们可以创建一个仓储。请查看 __LINK_65__以获取完整的仓储文档。要定义当前作用域中的哪些仓储应该注册，可以使用 __INLINE_CODE_33__ 方法。例如：

> 信息 **信息** 您不应该通过 __INLINE_CODE_34__ 注册基本实体，因为没有仓储可供选择。另一方面，基本实体需要在 __INLINE_CODE_35__ (或 ORM 配置中)中包含在内。

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

使用自定义仓储时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 基于类引用进行 resolve。

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

手动将实体添加到连接选项的实体数组中可能很麻烦。此外，引用实体从根模块中会破坏应用程序域边界，并将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

请注意，glob 路径不受 Webpack 支持，如果您是在 monorepo 中构建应用程序，您就不能使用它们。为了解决这个问题，提供了一个 alternative 解决方案。要自动加载实体，可以将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如下所示：

__CODE_BLOCK_10__

设置该选项后，每个通过 __INLINE_CODE_46__ 方法注册的实体都会自动添加到配置对象的实体数组中。

> 信息 **信息** 注意，通过 __INLINE_CODE_47__ 方法注册的实体，但不是通过 __INLINE_CODE_48__ 方法注册的实体，仍然不会被包含在 __INLINE_CODE_49__ 中。

> 信息 **信息** 使用 __INLINE_CODE_50__ 也不会影响 MikroORM CLI - 在 CLI 中，我们仍然需要提供完整的实体列表。另一方面，我们可以使用 globs 在 CLI 中，因为 CLI 不会经过 Webpack。

#### 序列化

> 警告 **注意** MikroORM 将每个实体关系包装在 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全性。这将使 __LINK_66__ 对任何包装关系一无所知。在其他字词，如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，所有关系都将不会被序列化。

幸运的是，MikroORM 提供了一个 __LINK_67__，可以在 __INLINE_CODE_52__ 中As mentioned in [docs.nestjs.com/guide/](/guide/)68__, we need a clean state for each request. That is handled automatically thanks to the `@NestMiddleware` helper registered via middleware.

But middlewares are executed only for regular HTTP request handles, what if we need a request scoped method outside of that? One example of that is queue handlers or scheduled tasks.

We can use the `@RequestScope` decorator. It requires you to first inject the `ExecutionContext` instance to current context, it will be then used to create the context for you. Under the hood, the decorator will register new request context for your method and execute it inside the context.

```typescript
@RequestScope()
async myMethod() {
  // 方法执行在request上下文中
}

```

**Note** As the name suggests, this decorator always creates new context, as opposed to its alternative `@OptionalRequestScope` that only creates it if it's already not inside another one.

#### 测试

`@NestModule` 包含 `prepareToken` 函数，该函数返回根据给定的实体准备好的令牌，以便模拟存储库。

#### 示例

NestJS 和 MikroORM 的真实世界示例可以在 [docs.nestjs.com/guide/](/guide/)69__ 中找到