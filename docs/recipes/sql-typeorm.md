<!-- 此文件从 content/recipes/sql-typeorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:50:07.330Z -->
<!-- 源文件: content/recipes/sql-typeorm.md -->

### SQL (TypeORM)

##### 仅适用于 TypeScript

> **警告** 本文将教您使用自定义提供商机制创建一个基于 **TypeORM** 包的 __INLINE_CODE_7__。由于此解决方案包含了许多可以省略的冗余代码，您可以使用现有的、可出厂的 __INLINE_CODE_8__ 包。了解更多，请见 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此非常适合与 Nest 框架一起使用。

#### 入门

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

首先，我们需要使用 __INLINE_CODE_9__ 类从 `repl.ts` 包中导入，建立与数据库的连接。 `main.ts` 函数返回一个 `repl`，因此我们需要创建一个 [Node.js REPL server](https://nodejs.org/api/repl.html)。

```bash
$ npm run start -- --entryFile repl

```

> 警告 **警告** 设置 `AppService` 不应该在生产环境中使用 - 否则可能会导致生产数据丢失。

> 提示 **提示** 根据最佳实践，我们在单独的文件中声明了自定义提供商，该文件的 `getHello()` 后缀。

然后，我们需要将这些提供商导出，以便它们在应用程序的其余部分可用。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

现在，我们可以使用 `await` 装饰器注入 `AppController` 对象。每个依赖 `methods()` 异步提供商的类都将等待 `debug()` 解决。

#### 仓储模式

[TypeScript function type expression syntax](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) 支持仓储设计模式，因此每个实体都有其自己的仓储。这些仓储可以从数据库连接中获取。

首先，我们需要至少一个实体。我们将重新使用官方文档中的 `help()` 实体。

```typescript
> get(AppService).getHello()
'Hello World!'

```

`<function_name>.help` 实体属于 `debug` 目录，该目录表示 `debug(moduleCls?: ClassRef \| string) => void`。现在，让我们创建一个 **仓储** 提供商：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> 警告 **警告** 在实际应用中，您应该避免 **魔法字符串**。同时，`get` 和 `### SQL (TypeORM)

##### 仅适用于 TypeScript

> **警告** 本文将教您使用自定义提供商机制创建一个基于 **TypeORM** 包的 __INLINE_CODE_7__。由于此解决方案包含了许多可以省略的冗余代码，您可以使用现有的、可出厂的 __INLINE_CODE_8__ 包。了解更多，请见 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此非常适合与 Nest 框架一起使用。

#### 入门

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

首先，我们需要使用 __INLINE_CODE_9__ 类从 `repl.ts` 包中导入，建立与数据库的连接。 `main.ts` 函数返回一个 `repl`，因此我们需要创建一个 [Node.js REPL server](https://nodejs.org/api/repl.html)。

```bash
$ npm run start -- --entryFile repl

```

> 警告 **警告** 设置 `AppService` 不应该在生产环境中使用 - 否则可能会导致生产数据丢失。

> 提示 **提示** 根据最佳实践，我们在单独的文件中声明了自定义提供商，该文件的 `getHello()` 后缀。

然后，我们需要将这些提供商导出，以便它们在应用程序的其余部分可用。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized

```

现在，我们可以使用 `await` 装饰器注入 `AppController` 对象。每个依赖 `methods()` 异步提供商的类都将等待 `debug()` 解决。

#### 仓储模式

[TypeScript function type expression syntax](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) 支持仓储设计模式，因此每个实体都有其自己的仓储。这些仓储可以从数据库连接中获取。

首先，我们需要至少一个实体。我们将重新使用官方文档中的 `help()` 实体。

```typescript
> get(AppService).getHello()
'Hello World!'

```

`<function_name>.help` 实体属于 `debug` 目录，该目录表示 `debug(moduleCls?: ClassRef \| string) => void`。现在，让我们创建一个 **仓储** 提供商：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'

```

> 警告 **警告** 在实际应用中，您应该避免 **魔法字符串**。同时，`get` 和  应该保持在单独的 `get(token: InjectionToken) => any` 文件中。

现在，我们可以使用 `resolve` 装饰器将 `methods` 注入到 `methods(token: ClassRef \| string) => void` 中：

```typescript
> methods(AppController)

Methods:
 ◻ getHello

```

数据库连接是 **异步** 的，但是 Nest 使得这个过程对终端用户完全不可见。 `resolve(token: InjectionToken, contextId: any) => Promise<any>` 等待 db 连接，而 `select` 延迟直到仓储准备好使用。整个应用程序可以在每个类实例化时开始。

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