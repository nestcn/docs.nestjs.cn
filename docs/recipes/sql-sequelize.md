<!-- 此文件从 content/recipes/sql-sequelize.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:19:18.464Z -->
<!-- 源文件: content/recipes/sql-sequelize.md -->

### SQL (Sequelize)

##### 仅适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义组件从头开始创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于这种技术包含了许多可以避免的 overhead，您可以使用专门的、现成的 __INLINE_CODE_8__ 包。了解更多信息，请见 __LINK_30__。

__LINK_31__ 是一个流行的对象关系映射器（ORM），使用 vanilla JavaScript 编写，但有一个 __LINK_32__ TypeScript 包装器，提供了基于 sequelize 的装饰器和其他 extras。

#### 开始

要开始使用这个库，我们需要安装以下依赖项：

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

首先，我们需要创建一个 **Sequelize** 实例，并将选项对象传递给构造函数。然后，我们需要添加所有模型（或者使用 __INLINE_CODE_9__ 属性）和 `repl.ts` 数据库表。

```bash
$ npm run start -- --entryFile repl
```

> 提示 **Hint** 我们遵循最佳实践，在单独的文件中声明自定义提供者，该文件具有 `main.ts` 后缀。

然后，我们需要将这些提供者导出，以使它们在应用程序的其余部分可访问。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized
```

现在，我们可以使用 `repl` 对象进行注入，使用 `AppService` 装饰器。每个依赖于 `getHello()` 异步提供者的类将等待 `AppController` 解决。

#### 模型注入

在 __LINK_33__ 中，**Model** 定义了一个数据库表。该类的实例表示一个数据库行。首先，我们需要至少一个实体：

```typescript
> get(AppService).getHello()
'Hello World!'
```

`await` 实体属于 `methods()` 目录，该目录代表 `debug()`。现在是时候创建一个 **Repository** 提供者：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'
```

> 警告 **Warning** 在实际应用中，您应该避免使用 **magic strings**。 `help()` 和 `<function_name>.help` 应该在单独的 `debug` 文件中。

在 Sequelize 中，我们使用静态方法来操作数据，因此我们创建了一个 **alias**。

现在，我们可以使用 `debug(moduleCls?: ClassRef \| string) => void` 装饰器将 `get` 注入到 `### SQL (Sequelize)

##### 仅适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义组件从头开始创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于这种技术包含了许多可以避免的 overhead，您可以使用专门的、现成的 __INLINE_CODE_8__ 包。了解更多信息，请见 __LINK_30__。

__LINK_31__ 是一个流行的对象关系映射器（ORM），使用 vanilla JavaScript 编写，但有一个 __LINK_32__ TypeScript 包装器，提供了基于 sequelize 的装饰器和其他 extras。

#### 开始

要开始使用这个库，我们需要安装以下依赖项：

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

首先，我们需要创建一个 **Sequelize** 实例，并将选项对象传递给构造函数。然后，我们需要添加所有模型（或者使用 __INLINE_CODE_9__ 属性）和 `repl.ts` 数据库表。

```bash
$ npm run start -- --entryFile repl
```

> 提示 **Hint** 我们遵循最佳实践，在单独的文件中声明自定义提供者，该文件具有 `main.ts` 后缀。

然后，我们需要将这些提供者导出，以使它们在应用程序的其余部分可访问。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized
```

现在，我们可以使用 `repl` 对象进行注入，使用 `AppService` 装饰器。每个依赖于 `getHello()` 异步提供者的类将等待 `AppController` 解决。

#### 模型注入

在 __LINK_33__ 中，**Model** 定义了一个数据库表。该类的实例表示一个数据库行。首先，我们需要至少一个实体：

```typescript
> get(AppService).getHello()
'Hello World!'
```

`await` 实体属于 `methods()` 目录，该目录代表 `debug()`。现在是时候创建一个 **Repository** 提供者：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'
```

> 警告 **Warning** 在实际应用中，您应该避免使用 **magic strings**。 `help()` 和 `<function_name>.help` 应该在单独的 `debug` 文件中。

在 Sequelize 中，我们使用静态方法来操作数据，因此我们创建了一个 **alias**。

现在，我们可以使用 `debug(moduleCls?: ClassRef \| string) => void` 装饰器将 `get` 注入到  中：

```typescript
> methods(AppController)

Methods:
 ◻ getHello
```

数据库连接是 **异步** 的，但 Nest 使得这个过程对用户完全透明。 `get(token: InjectionToken) => any` 提供者等待 db 连接，而 `methods` 将延迟到仓库准备使用时。整个应用程序可以在每个类实例化时启动。

以下是一个最终的 `methods(token: ClassRef \| string) => void`：

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService
```

> 提示 **Hint** 不要忘记将 `resolve` 导入到 root `resolve(token: InjectionToken, contextId: any) => Promise<any>` 中。