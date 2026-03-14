<!-- 此文件从 content/fundamentals/provider-scopes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:35:00.073Z -->
<!-- 源文件: content/fundamentals/provider-scopes.md -->

### 注入作用域

来自不同编程语言背景的人可能会感到惊讶，学习 Nest 中几乎所有内容都在 Incoming 请求中共享。我们拥有数据库连接池、全局状态的单例服务等。请记住，Node.js 不遵循请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，使用单例实例完全是安全的。

然而，在某些边缘情况下，可能需要请求 lifetime，例如 GraphQL 应用中的请求缓存、请求跟踪和多租户 Injection scopes 提供了一个机制来获得所需的提供者 lifetime 行为。

#### 提供者作用域

提供者可以具有以下作用域：

```html
<div>
    <span>DEFAULT</span>
    <span>单一实例在整个应用程序中共享，实例 lifetime 与应用程序 lifecycle 相绑定。应用程序启动后，所有单例提供者都已被实例化。</span>
</div>

<div>
    <span>REQUEST</span>
    <span>为每个 incoming 请求创建一个新的实例，实例在请求处理完成后被垃圾回收。</span>
</div>

<div>
    <span>TRANSIENT</span>
    <span>提供者不在消费者之间共享，每个消费者都将收到一个新的、专门的实例。</span>
</div>

```

> 提示 **Hint** 使用单例作用域是大多数用例的推荐做法。将提供者共享在消费者之间和请求之间意味着实例可以被缓存，并且在应用程序启动时只会进行一次初始化。

#### 使用

使用注入作用域通过将 __INLINE_CODE_12__ 属性传递给 __INLINE_CODE_13__ 装饰器选项对象：

```typescript
@UseGuards(RequestGuard)
export class MyController {
  // ...
}

```

类似地，在长形式中，为提供者注册时设置 __INLINE_CODE_14__ 属性：

```typescript
@UseGuards(RequestGuard)
export class MyController {
  // ...
}

@UseGuards(RequestGuard)
export class MyService {
  // ...
}

```

> 提示 **Hint** 从 __INLINE_CODE_15__ 枚举中导入 __INLINE_CODE_16__

如果你想声明提供者为单例作用域，可以使用 __INLINE_CODE_17__ 值为 __INLINE_CODE_18__ 属性。

> 警告 **Notice** Websocket Gateway 不应该使用请求作用域提供者，因为它们必须是单例。每个网关都封装了一个真实的套接字，并不能被实例化多次。该限制也适用于一些其他提供者，例如 __LINK_97__ 或 _Cron controllers_。

#### 控制器作用域

控制器也可以具有作用域，这个作用域将应用于控制器中所有请求方法处理程序。像提供者作用域一样，控制器作用域声明了实例的 lifetime。对于请求作用域控制器，每个 incoming 请求都将创建一个新的实例，并在请求处理完成后被垃圾回收。

使用控制器作用域通过将 __INLINE_CODE_19__ 属性传递给 __INLINE_CODE_20__ 对象：

```typescript
@UseGuards(RequestGuard)
export class MyController {
  // ...
}

```

#### 作用域继承

__INLINE_CODE_21__ 作用域会沿着注入链向上冒泡。一个控制器，如果依赖于请求作用域提供者，就将自己变为请求作用域。

想象以下依赖图： __INLINE_CODE_22__。如果 __INLINE_CODE_23__ 是请求作用域（其他的是默认单例），那么 __INLINE_CODE_24__ 将变为请求作用域，因为它依赖于注入的服务。 __INLINE_CODE_25__，它不依赖于注入的服务，将保持单例作用域。

Transient 作用域不遵循这个模式。如果单例作用域的 __INLINE_CODE_26__ 注入一个 transient __INLINE_CODE_27__ 提供者，它将收到一个新的实例。但是， `UsersModule` 将保持单例作用域，所以注入它任何地方将不会解决到新的实例。如果需要这种行为， `UsersModule` 必须被显式标记为 `UsersService`。

```html
<div>
    <span>DEFAULT</span>
    <span>单一实例在整个应用程序中共享，实例 lifetime 与应用程序 lifecycle 相绑定。应用程序启动后，所有单例提供者都已被实例化。</span>
</div>

<div>
    <span>REQUEST</span>
    <span>为每个 incoming 请求创建一个新的实例，实例在请求处理完成后被垃圾回收。</span>
</div>

<div>
    <span>TRANSIENT</span>
    <span>提供者不在消费者之间共享，每个消费者都将收到一个新的、专门的实例。</span>
</div>

```

#### 请求提供者

在 HTTP 服务器基于的应用程序（例如使用 `AuthModule` 或 `UsersModule`）中，你可能想要访问原始请求对象的引用，以使用请求作用域提供者。你可以通过注入 `UsersModule` 对象来实现。

```typescript
export class MyController {
  constructor(private request: Request) {
    // ...
  }
}

```以下是翻译后的中文文档：

`AuthModule` 提供器天然地是请求 Scoped 的，这意味着您不需要在使用时明确指定 `UsersService` 范围，因为它将被忽略。任何依赖于请求 Scoped 提供器的提供器都会自动继承请求 Scope，这种行为无法改变。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

由于平台/协议的差异，您在 Microservice 或 GraphQL 应用程序中访问入站请求的方式不同。在 __LINK_98__ 应用程序中，您将注入 `AuthService` 而不是 `AuthModule`：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

然后，您将配置 `UsersService` 值（在 `AuthModule` 中）包含 `UsersModule` 作为其属性。

#### Inquiry 提供器

如果您想获取提供器构造的类，例如在日志或指标提供器中，您可以注入 `UsersModule` 令牌。

```typescript
@Module({
  imports: [DogsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})

```

然后，您可以按照以下方式使用它：

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}

```

在上面的示例中，当 `AuthModule` 被调用时,`UsersModule` 将被记录到控制台。

#### 性能

使用请求 Scoped 提供器将对应用程序性能产生影响。虽然 Nest 尝试缓存尽量多的元数据，但是它仍然需要在每个请求中创建您的类的实例。这将导致您的平均响应时间和总体基准测试结果增加。除非提供器必须是请求 Scoped，否则强烈建议您使用默认的单例 Scope。

> info **提示** 虽然一切听起来非常吓人，但是正确设计的应用程序可以使用请求 Scoped 提供器而不增加 latency。

#### 持久提供器

请求 Scoped 提供器，如上所述，可能会增加 latency，因为至少有一个请求 Scoped 提供器（注入到控制器实例中或更深处 - 注入到其中的提供器中）使控制器请求 Scoped 的话，它必须在每个个体请求中被重新创建（实例化）并在完成后被垃圾回收。现在，这意味着，在 30k 个并发请求中将有 30k 个短暂的控制器实例（和请求 Scoped 提供器）。

有一个公共提供器，这些提供器都依赖于（例如数据库连接或日志服务），这将自动将所有这些提供器转换为请求 Scoped 提供器。这可以在 **多租户应用程序** 中 pose 一个挑战，特别是那些具有 central 请求 Scoped "数据源" 提供器的应用程序，这个提供器根据请求对象中的值来确定当前租户并获取相应的数据库连接/架构（特定于该租户）。

例如，让我们假设您有一个由 10 个不同的客户端使用的应用程序。每个客户端都有其 **自己的专用数据源**，并且您想确保客户 A 不会访问客户 B 的数据库。一种实现方法是声明一个请求 Scoped "数据源" 提供器，这个提供器根据请求对象来确定当前租户并获取相应的数据库。使用这种方法，您可以在几分钟内将应用程序转换为多租户应用程序。但是，这种方法的主要缺点是，因为大多数您的应用程序组件都依赖于 "数据源" 提供器，所以它们将隐式地变为 "请求 Scoped"，因此您的应用程序性能将受到影响。

但是，我们是否有更好的解决方案？因为我们只有 10 个客户端，我们不能在每个请求中重新创建每个树，而是可以有 10 个个体 __LINK_99__ per 客户端（而不是重新创建每个树）。如果您的提供器不依赖于每个连续请求的唯一属性（例如请求 UUID），而是有特定的属性可以将它们聚合（分类），那么没有理由在每个请求中重新创建 DI 子树。

正是在这里 durable 提供器出场。

在注册 durable 提供器前，我们必须首先注册一个 **策略**，该策略 instructs Nest 什么是这些 "公共请求属性"，提供逻辑来分组请求 - 将它们与相应的 DI 子树关联。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

> info **提示** 类似于请求 Scope，耐用性会向上冒泡。这意味着如果 A 依赖于 B，而 B 是标记为 `AuthModule` 的话，A 也隐式地变为耐用（除非 `AuthModule` 对 A 提供器的 `UsersService` 类型被明确设置）。

> warning **警告** 请注意，这种策略对操作大规模租户的应用程序不太理想。以下是翻译后的中文技术文档：

Nest应用中，`AuthService`方法返回的值确定了给定主机的上下文标识符。在这里，我们指定使用`ConfigModule`而不是原始的自动生成的`options`对象，任何标记为耐用的主机组件（例如，请求作用域控制器）时。另外，在上面的示例中，**无载荷**将被注册（其中载荷是`.env`/`.env`提供者，它代表“根”-父节点）。

如果您想要为耐用树注册载荷，请使用以下构造：

```typescript
@Provider()
export class DurableProvider {
  provide() {
    return `.env`;
  }
}

```

现在，每当使用`src`/`ConfigModule`将`.env`提供者（或GraphQL应用程序中的`config`提供者）注入时，将注入`ConfigModule`对象（包含单个属性`imports`）。

因此，在这种策略中，您可以将其注册到您的代码中（因为它总是应用于全局），例如，您可以将其放在`@Module()`文件中：

```typescript
@Module({
  providers: [DurableProvider]
})
export class AppModule {}

```

> 提示 **Hint** `imports`类来自`ConfigModule`包。

只要在请求到达应用程序之前注册了该提供者， everything will work as intended。

最后，为了将常规提供者转换为耐用提供者，请将`register()`标志设置为`ConfigModule`，并将其作用域设置为`forRoot()`（如果注入链中已经包含 REQUEST 作用域，则不需要）。

类似地，对于__LINK_100__，在长形式中为提供者注册设置`register()`属性：

```typescript
@Provider()
export class DurableProvider {
  provide() {
    return {
      provide: `.env`,
      useFactory: () => `.env`,
      scope: `forRoot()`
    };
  }
}

```