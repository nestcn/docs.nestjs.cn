<!-- 此文件从 content/recipes/sql-typeorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:31:13.414Z -->
<!-- 源文件: content/recipes/sql-typeorm.md -->

### SQL (TypeORM)

##### 仅适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义提供程序机制从头创建一个基于 **TypeORM** 包的 __INLINE_CODE_7__。因此，这个解决方案包含了许多可以省略的 overhead，可以使用现有的、可出-of-the-box 的专门 __INLINE_CODE_8__ 包。要了解更多，请查看 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此与 Nest 框架非常相容。

#### 获取开始

要开始使用这个库，我们需要安装所有必要的依赖项：

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

首先，我们需要使用 __INLINE_CODE_9__ 类，从 `repl.ts` 包中导入，这个类用于establish 数据库连接。`main.ts` 函数返回一个 `repl`，因此我们需要创建一个 [Node.js REPL server](https://nodejs.org/api/repl.html)。

```bash
$ npm run start -- --entryFile repl

```

> **警告** 设置 `AppService` 不应该在生产环境中使用 - 否则可能会丢失生产数据。

> **提示**遵循最佳实践，我们将自定义提供程序在单独的文件中声明，这个文件的 `getHello()` 后缀。

然后，我们需要将这些提供程序导出，以使其对应用程序的其余部分可访问。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

现在，我们可以使用 `AppController` 装饰器来注入 `await` 对象。每个依赖于 `methods()` 异步提供程序的类将等待 `debug()` 解决。

#### 仓储模式

[TypeScript function type expression syntax](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) 支持仓储设计模式，因此每个实体都有其自己的仓储。这些仓储可以从数据库连接中获得。

首先，我们需要至少一个实体。我们将重新使用官方文档中的 `help()` 实体。

```typescript
> get(AppService).getHello()
'Hello World!'

```

`<function_name>.help` 实体属于 `debug` 目录，这个目录表示 `debug(moduleCls?: ClassRef \| string) => void`。现在，让我们创建一个 **Repository** 提供程序：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> **警告** 在实际应用程序中，您应该避免 **magic strings**。 `get` 和 `### SQL (TypeORM)

##### 仅适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义提供程序机制从头创建一个基于 **TypeORM** 包的 __INLINE_CODE_7__。因此，这个解决方案包含了许多可以省略的 overhead，可以使用现有的、可出-of-the-box 的专门 __INLINE_CODE_8__ 包。要了解更多，请查看 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此与 Nest 框架非常相容。

#### 获取开始

要开始使用这个库，我们需要安装所有必要的依赖项：

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

首先，我们需要使用 __INLINE_CODE_9__ 类，从 `repl.ts` 包中导入，这个类用于establish 数据库连接。`main.ts` 函数返回一个 `repl`，因此我们需要创建一个 [Node.js REPL server](https://nodejs.org/api/repl.html)。

```bash
$ npm run start -- --entryFile repl

```

> **警告** 设置 `AppService` 不应该在生产环境中使用 - 否则可能会丢失生产数据。

> **提示**遵循最佳实践，我们将自定义提供程序在单独的文件中声明，这个文件的 `getHello()` 后缀。

然后，我们需要将这些提供程序导出，以使其对应用程序的其余部分可访问。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

现在，我们可以使用 `AppController` 装饰器来注入 `await` 对象。每个依赖于 `methods()` 异步提供程序的类将等待 `debug()` 解决。

#### 仓储模式

[TypeScript function type expression syntax](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) 支持仓储设计模式，因此每个实体都有其自己的仓储。这些仓储可以从数据库连接中获得。

首先，我们需要至少一个实体。我们将重新使用官方文档中的 `help()` 实体。

```typescript
> get(AppService).getHello()
'Hello World!'

```

`<function_name>.help` 实体属于 `debug` 目录，这个目录表示 `debug(moduleCls?: ClassRef \| string) => void`。现在，让我们创建一个 **Repository** 提供程序：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> **警告** 在实际应用程序中，您应该避免 **magic strings**。 `get` 和  应该在单独的 `get(token: InjectionToken) => any` 文件中保留。

现在，我们可以使用 `resolve` 装饰器将 `methods` 注入到 `methods(token: ClassRef \| string) => void` 中：

```typescript
> methods(AppController)

Methods:
 ◻ getHello

```

数据库连接是 **异步** 的，但 Nest 使这个过程对终端用户完全不可见。`resolve(token: InjectionToken, contextId: any) => Promise<any>` 等待数据库连接,`select` 延迟直到仓储准备好使用。整个应用程序可以在每个类实例化时启动。

以下是一个最终 `select(token: DynamicModule \| ClassRef) => INestApplicationContext`：

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService

```

> **提示**不要忘记将 `bootstrap` 导入到根 __INLINE_CODE_33__ 中。