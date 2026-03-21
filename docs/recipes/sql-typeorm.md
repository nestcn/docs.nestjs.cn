<!-- 此文件从 content/recipes/sql-typeorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:13:50.362Z -->
<!-- 源文件: content/recipes/sql-typeorm.md -->

### SQL (TypeORM)

##### 这个章节仅适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义提供商机制从头开始创建一个基于 **TypeORM** 包的 __INLINE_CODE_7__。由于这个解决方案包含了许多可以省略的冗余内容，您可以使用现有且可用的专门 __INLINE_CODE_8__ 包。要了解更多信息，请查看 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的 Object Relational Mapper (ORM)，因为它是使用 TypeScript 编写的，因此与 Nest 框架非常适合。

#### 开始

要开始使用这个库，我们需要安装所有所需的依赖项：

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

首先，我们需要使用 __INLINE_CODE_9__ 类从 `repl.ts` 包中导入，来建立与我们的数据库的连接。`main.ts` 函数返回 `repl`，因此我们需要创建一个 [Node.js REPL server](https://nodejs.org/api/repl.html)。

```bash
$ npm run start -- --entryFile repl

```

> 警告 **警告** 在生产环境中不要使用 `AppService`，否则可能会丢失生产数据。

> 提示 **提示** 我们将自定义提供商在单独的文件中声明，它有一个 `getHello()` 后缀。

然后，我们需要将这些提供商导出，以使其在应用程序的其余部分可访问。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

现在，我们可以使用 `AppController` 装饰器注入 `await` 对象。每个依赖于 async 提供商的类都将等待 `debug()` 解决。

#### 仓储模式

[TypeScript function type expression syntax](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) 支持仓储设计模式，每个实体都有自己的仓储。这些仓储可以从数据库连接中获取。

但是，首先，我们需要至少一个实体。我们将重新使用官方文档中的 `help()` 实体。

```typescript
> get(AppService).getHello()
'Hello World!'

```

`<function_name>.help` 实体属于 `debug` 目录，这个目录表示 `debug(moduleCls?: ClassRef \| string) => void`。现在，让我们创建一个 **仓储** 提供商：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> 警告 **警告** 在实际应用中，您应该避免 **magic strings**。`get` 和 `### SQL (TypeORM)

##### 这个章节仅适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义提供商机制从头开始创建一个基于 **TypeORM** 包的 __INLINE_CODE_7__。由于这个解决方案包含了许多可以省略的冗余内容，您可以使用现有且可用的专门 __INLINE_CODE_8__ 包。要了解更多信息，请查看 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的 Object Relational Mapper (ORM)，因为它是使用 TypeScript 编写的，因此与 Nest 框架非常适合。

#### 开始

要开始使用这个库，我们需要安装所有所需的依赖项：

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

首先，我们需要使用 __INLINE_CODE_9__ 类从 `repl.ts` 包中导入，来建立与我们的数据库的连接。`main.ts` 函数返回 `repl`，因此我们需要创建一个 [Node.js REPL server](https://nodejs.org/api/repl.html)。

```bash
$ npm run start -- --entryFile repl

```

> 警告 **警告** 在生产环境中不要使用 `AppService`，否则可能会丢失生产数据。

> 提示 **提示** 我们将自定义提供商在单独的文件中声明，它有一个 `getHello()` 后缀。

然后，我们需要将这些提供商导出，以使其在应用程序的其余部分可访问。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

现在，我们可以使用 `AppController` 装饰器注入 `await` 对象。每个依赖于 async 提供商的类都将等待 `debug()` 解决。

#### 仓储模式

[TypeScript function type expression syntax](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) 支持仓储设计模式，每个实体都有自己的仓储。这些仓储可以从数据库连接中获取。

但是，首先，我们需要至少一个实体。我们将重新使用官方文档中的 `help()` 实体。

```typescript
> get(AppService).getHello()
'Hello World!'

```

`<function_name>.help` 实体属于 `debug` 目录，这个目录表示 `debug(moduleCls?: ClassRef \| string) => void`。现在，让我们创建一个 **仓储** 提供商：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> 警告 **警告** 在实际应用中，您应该避免 **magic strings**。`get` 和  应该在单独的 `get(token: InjectionToken) => any` 文件中保存。

现在，我们可以使用 `resolve` 装饰器将 `methods` 注入到 `methods(token: ClassRef \| string) => void` 中：

```typescript
> methods(AppController)

Methods:
 ◻ getHello

```

数据库连接是 **异步** 的，但 Nest 使这个过程对用户完全透明。`resolve(token: InjectionToken, contextId: any) => Promise<any>` 等待数据库连接，而 `select` 只有在仓储准备好时才会延迟。整个应用程序可以在每个类实例化时启动。

以下是一个最终的 `select(token: DynamicModule \| ClassRef) => INestApplicationContext`：

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService

```

> 提示 **提示** 不要忘记将 `bootstrap` 导入到根 __INLINE_CODE_33__ 中。