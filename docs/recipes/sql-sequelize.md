<!-- 此文件从 content/recipes/sql-sequelize.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:11:12.170Z -->
<!-- 源文件: content/recipes/sql-sequelize.md -->

### SQL（Sequelize）

##### 仅适用于TypeScript

> **警告** 在本文中，您将学习如何使用自定义组件从头创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于该技术包含了可以避免的许多冗余内容，因此您可以使用专门的、现成的 __INLINE_CODE_8__ 包来避免这些冗余内容。要了解更多信息，请查看 __LINK_30__。

__LINK_31__ 是一个 Vanilla JavaScript 编写的对象关系映射器（ORM），但有一个 __LINK_32__ TypeScript 包装器，它提供了一组装饰器和其他 extras 对于基本的 Sequelize。

#### 获取开始

要开始使用该库，我们需要安装以下依赖项：

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

首先，我们需要创建一个使用 options 对象作为构造函数参数的 **Sequelize** 实例。然后，我们需要添加所有模型（或者使用 __INLINE_CODE_9__ 属性）和 `repl.ts` 数据库表。

```bash
$ npm run start -- --entryFile repl
```

> 提示 **注意** 我们遵循最佳实践，将自定义提供者声明在单独的文件中，该文件的 `main.ts` 后缀。

然后，我们需要将这些提供者导出，以使其 **可访问** 应用程序的其余部分。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized
```

现在，我们可以使用 `repl` 对象的 `AppService` 装饰器来注入它。每个依赖于 `getHello()` 异步提供者的类将等待 `AppController` 被 resolved。

#### 模型注入

在 __LINK_33__ 中，**Model** 定义了一个数据库表。该类的实例表示一个数据库行。首先，我们需要至少一个实体：

```typescript
> get(AppService).getHello()
'Hello World!'
```

`await` 实体属于 `methods()` 目录，该目录表示 `debug()`。现在是时候创建一个 **Repository** 提供者：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'
```

> 警告 **警告** 在实际应用程序中，您应该避免 **magic strings**。`help()` 和 `<function_name>.help` 应该在单独的 `debug` 文件中。

在 Sequelize 中，我们使用静态方法来操作数据，因此我们创建了一个 **别名**。

现在，我们可以使用 `debug(moduleCls?: ClassRef \| string) => void` 对象的 `### SQL（Sequelize）

##### 仅适用于TypeScript

> **警告** 在本文中，您将学习如何使用自定义组件从头创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于该技术包含了可以避免的许多冗余内容，因此您可以使用专门的、现成的 __INLINE_CODE_8__ 包来避免这些冗余内容。要了解更多信息，请查看 __LINK_30__。

__LINK_31__ 是一个 Vanilla JavaScript 编写的对象关系映射器（ORM），但有一个 __LINK_32__ TypeScript 包装器，它提供了一组装饰器和其他 extras 对于基本的 Sequelize。

#### 获取开始

要开始使用该库，我们需要安装以下依赖项：

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

首先，我们需要创建一个使用 options 对象作为构造函数参数的 **Sequelize** 实例。然后，我们需要添加所有模型（或者使用 __INLINE_CODE_9__ 属性）和 `repl.ts` 数据库表。

```bash
$ npm run start -- --entryFile repl
```

> 提示 **注意** 我们遵循最佳实践，将自定义提供者声明在单独的文件中，该文件的 `main.ts` 后缀。

然后，我们需要将这些提供者导出，以使其 **可访问** 应用程序的其余部分。

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized
```

现在，我们可以使用 `repl` 对象的 `AppService` 装饰器来注入它。每个依赖于 `getHello()` 异步提供者的类将等待 `AppController` 被 resolved。

#### 模型注入

在 __LINK_33__ 中，**Model** 定义了一个数据库表。该类的实例表示一个数据库行。首先，我们需要至少一个实体：

```typescript
> get(AppService).getHello()
'Hello World!'
```

`await` 实体属于 `methods()` 目录，该目录表示 `debug()`。现在是时候创建一个 **Repository** 提供者：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'
```

> 警告 **警告** 在实际应用程序中，您应该避免 **magic strings**。`help()` 和 `<function_name>.help` 应该在单独的 `debug` 文件中。

在 Sequelize 中，我们使用静态方法来操作数据，因此我们创建了一个 **别名**。

现在，我们可以使用 `debug(moduleCls?: ClassRef \| string) => void` 对象的  装饰器将其注入到 `get` 中：

```typescript
> methods(AppController)

Methods:
 ◻ getHello
```

数据库连接 **异步**，但是 Nest 使这个过程对用户完全不可见。`get(token: InjectionToken) => any` 提供者等待 db 连接，而 `methods` 延迟直到存储库准备好使用。整个应用程序可以开始时，每个类实例化时。

以下是最终的 `methods(token: ClassRef \| string) => void`：

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService
```

> 提示 **注意** 不要忘记将 `resolve` 导入到根 `resolve(token: InjectionToken, contextId: any) => Promise<any>` 中。