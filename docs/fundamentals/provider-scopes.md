### 注入作用域

对于来自不同编程语言背景的开发者来说，可能会惊讶地发现：在 Nest 中，几乎所有内容都是在传入请求间共享的。我们使用数据库连接池、具有全局状态的单例服务等等。需要记住 Node.js 并不遵循请求/响应的多线程无状态模型（即每个请求由独立线程处理）。因此，在我们的应用中使用单例实例是完全**安全**的。

但在某些边缘情况下，基于请求的生命周期可能是更理想的行为，例如 GraphQL 应用中的请求级缓存、请求追踪和多租户场景。注入作用域机制提供了实现所需提供者生命周期行为的方式。

#### 提供者作用域

一个提供者可以具有以下任意作用域：

<table data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9"><tbody data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9"><tr data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9"><td>DEFAULT</td><td data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9" data-immersive-translate-paragraph="1">在整个应用中共享该提供者的单一实例。实例生命周期与应用程序生命周期直接绑定。一旦应用完成启动，所有单例作用域的提供者便完成了实例化。默认使用单例作用域。</td></tr><tr data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9"><td>REQUEST</td><td data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9" data-immersive-translate-paragraph="1">会为每个传入的请求专属创建新的提供者实例。该实例在请求处理完成后会被垃圾回收。</td></tr><tr data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9"><td>TRANSIENT</td><td data-immersive-translate-walked="9c4f0294-21fb-422c-8115-4253d4b29cb9" data-immersive-translate-paragraph="1">瞬时提供者不会在多个消费者之间共享。每个注入瞬时提供者的消费者都会获得一个全新的专属实例。</td></tr></tbody></table>

> info **提示** 对于大多数使用场景， **推荐**使用单例作用域。在多个消费者和请求之间共享提供者意味着实例可以被缓存，且其初始化仅在应用启动时发生一次。

#### 用法

通过向 `@Injectable()` 装饰器的选项对象传递 `scope` 属性来指定注入作用域：

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

同样地，对于[自定义提供者](/fundamentals/custom-providers) ，在提供者注册的长格式中设置 `scope` 属性：

```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}
```

> info **提示** 从 `@nestjs/common` 导入 `Scope` 枚举

单例作用域是默认使用的，无需显式声明。如需明确声明提供者为单例作用域，请将 `scope` 属性设为 `Scope.DEFAULT` 值。

> warning **注意** WebSocket 网关不应使用请求作用域的提供者，因为它们必须作为单例运行。每个网关都封装了一个真实的 socket 连接且不能被多次实例化。此限制同样适用于其他一些提供者，如 [_Passport 策略_](../security/authentication#request-scoped-strategies) 或 _Cron 控制器_ 。

#### 控制器作用域

控制器也可以拥有作用域，该作用域适用于该控制器中声明的所有请求方法处理程序。与提供者作用域类似，控制器的作用域声明了其生命周期。对于请求作用域的控制器，每个传入请求都会创建一个新实例，并在请求处理完成后进行垃圾回收。

通过 `ControllerOptions` 对象的 `scope` 属性来声明控制器作用域：

```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}
```

#### 作用域层次结构

`REQUEST` 作用域会沿着注入链向上冒泡。依赖于请求作用域提供者的控制器自身也将成为请求作用域。

想象以下依赖关系图： `CatsController <- CatsService <- CatsRepository` 。如果 `CatsService` 是请求作用域的（而其他服务是默认单例），那么 `CatsController` 也会变成请求作用域，因为它依赖于注入的服务。而 `CatsRepository` 由于不依赖该服务，将保持单例作用域。

瞬时作用域的依赖不遵循这种模式。如果一个单例作用域的 `DogsService` 注入了瞬时作用域的 `LoggerService` 提供者，它将获得该提供者的新实例。然而，`DogsService` 本身仍保持单例作用域，因此无论在哪里注入它，都*不会*解析为新的 `DogsService` 实例。如果需要这种行为，必须显式地将 `DogsService` 也标记为 `TRANSIENT`。

#### 请求提供者

在基于 HTTP 服务器的应用程序中（例如使用 `@nestjs/platform-express` 或 `@nestjs/platform-fastify`），当使用请求作用域的提供者时，您可能需要访问原始请求对象的引用。这可以通过注入 `REQUEST` 对象来实现。

`REQUEST` 提供者本质上是请求作用域的，这意味着在使用时无需显式指定 `REQUEST` 作用域。此外，即使尝试指定也会被忽略。任何依赖请求作用域提供者的提供者都会自动采用请求作用域，且此行为不可更改。

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

由于底层平台/协议的差异，在微服务或 GraphQL 应用中访问入站请求的方式略有不同。在 [GraphQL](/graphql/quick-start) 应用中，应注入 `CONTEXT` 而非 `REQUEST`：

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private context) {}
}
```

随后需在 `GraphQLModule` 中将 `context` 值配置为包含 `request` 属性。

#### Inquirer 提供者

若想获取提供者被构造时所在的类，例如在日志或指标提供者中，你可以注入 `INQUIRER` 令牌。

```typescript
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class HelloService {
  constructor(@Inject(INQUIRER) private parentClass: object) {}

  sayHello(message: string) {
    console.log(`${this.parentClass?.constructor?.name}: ${message}`);
  }
}
```

并按如下方式使用：

```typescript
import { Injectable } from '@nestjs/common';
import { HelloService } from './hello.service';

@Injectable()
export class AppService {
  constructor(private helloService: HelloService) {}

  getRoot(): string {
    this.helloService.sayHello('My name is getRoot');

    return 'Hello world!';
  }
}
```

在上例中，当调用 `AppService#getRoot` 时， `"AppService: My name is getRoot"` 将被记录到控制台。

#### 性能

使用请求作用域的提供者会影响应用程序性能。虽然 Nest 会尽可能缓存元数据，但仍需在每个请求中创建类实例。因此这会降低平均响应时间并影响整体基准测试结果。除非必须使用请求作用域，否则强烈建议采用默认的单例作用域。

> **提示** 尽管听起来有些令人担忧，但合理设计的使用请求作用域提供者的应用程序，其延迟增加通常不会超过约 5%。

#### 持久化提供者

如前文所述，请求作用域的提供者可能导致延迟增加——只要存在至少 1 个请求作用域提供者（注入到控制器实例中，或更深层地注入到其某个提供者中），就会使控制器也成为请求作用域的。这意味着必须为每个独立请求重新创建（实例化）控制器（并在之后进行垃圾回收）。举例来说，对于 3 万个并行请求，将会产生 3 万个临时性的控制器实例（及其请求作用域的提供者）。

当大多数提供者都依赖于一个公共提供者（例如数据库连接或日志服务）时，这些提供者会自动转换为请求作用域提供者。这在**多租户应用**中可能带来挑战，特别是对于那些拥有中央请求作用域"数据源"提供者的应用——该提供者会从请求对象中获取头信息/令牌，并根据其值检索对应的数据库连接/模式（特定于该租户）。

例如，假设您有一个应用程序被 10 个不同的客户交替使用。每位客户都拥有**自己专属的数据源** ，而您需要确保客户 A 永远无法访问客户 B 的数据库。实现这一目标的一种方法是声明一个请求作用域的"数据源"提供程序，该程序基于请求对象确定"当前客户"并检索其对应的数据库。通过这种方法，您可以在几分钟内将应用程序转变为多租户应用。但这种方法的主要缺点是，由于应用程序中大部分组件很可能都依赖于"数据源"提供程序，这些组件会隐式地变为"请求作用域"，因此无疑会对应用程序性能产生影响。

但如果我们有更好的解决方案呢？既然只有 10 个客户，我们能否为每个客户维护 10 个独立的 [DI 子树](/fundamentals/module-ref#resolving-scoped-providers) （而不是为每个请求重新创建）？如果你的提供者不依赖于每个连续请求中真正唯一的属性（例如请求 UUID），而是存在一些可让我们聚合（分类）请求的特定属性，那就没有理由在每次收到请求时都*重新创建 DI 子树* 。

而这正是**持久化提供者**派上用场的时候。

在开始将提供者标记为持久化之前，我们必须先注册一个**策略** ，该策略会指示 Nest 哪些是"公共请求属性"，并提供将请求分组——使其与对应 DI 子树关联的逻辑。

```typescript
import {
  HostComponentInfo,
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
} from '@nestjs/core';
import { Request } from 'express';

const tenants = new Map<string, ContextId>();

export class AggregateByTenantContextIdStrategy implements ContextIdStrategy {
  attach(contextId: ContextId, request: Request) {
    const tenantId = request.headers['x-tenant-id'] as string;
    let tenantSubTreeId: ContextId;

    if (tenants.has(tenantId)) {
      tenantSubTreeId = tenants.get(tenantId);
    } else {
      tenantSubTreeId = ContextIdFactory.create();
      tenants.set(tenantId, tenantSubTreeId);
    }

    // If tree is not durable, return the original "contextId" object
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? tenantSubTreeId : contextId;
  }
}
```

> info **注意** 与请求作用域类似，持久化特性会沿依赖链向上传递。这意味着如果 A 依赖于被标记为 `durable` 的 B，那么 A 也会隐式成为持久化的（除非 A 提供者被显式设置为 `durable` 为 `false`）。

> warning **警告** 请注意此策略不适用于处理大量租户的应用程序。

`attach` 方法返回的值指示 Nest 应为给定宿主使用何种上下文标识符。在本例中，我们指定当宿主组件（例如请求范围的控制器）被标记为持久时，应使用 `tenantSubTreeId` 而非原始自动生成的 `contextId` 对象（您可以在下方了解如何将提供者标记为持久）。此外，在上例中， **不会注册任何有效载荷** （其中有效载荷 = 表示"根"的 `REQUEST`/`CONTEXT` 提供者 - 子树父级）。

若要为持久树注册有效载荷，请改用以下构造：

```typescript
// The return of `AggregateByTenantContextIdStrategy#attach` method:
return {
  resolve: (info: HostComponentInfo) =>
    info.isTreeDurable ? tenantSubTreeId : contextId,
  payload: { tenantId },
};
```

现在，当您使用 `@Inject(REQUEST)`/`@Inject(CONTEXT)` 注入 `REQUEST` 提供者（或 GraphQL 应用的 `CONTEXT`）时，将注入 `payload` 对象（在本例中由单一属性 `tenantId` 组成）。

好的，采用此策略后，你可以在代码的某个位置（由于它是全局应用的）进行注册，例如可以将其放置在 `main.ts` 文件中：

```typescript
ContextIdFactory.apply(new AggregateByTenantContextIdStrategy());
```

> info **注意** `ContextIdFactory` 类是从 `@nestjs/core` 包导入的。

只要注册操作发生在任何请求到达你的应用之前，一切都会按预期工作。

最后，要将普通提供者转换为持久化提供者，只需将 `durable` 标志设为 `true`，并将其作用域改为 `Scope.REQUEST`（如果注入链中已存在 REQUEST 作用域则无需修改）：

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST, durable: true })
export class CatsService {}
```

同理，对于[自定义提供者](/fundamentals/custom-providers) ，需要在提供者注册的长格式中设置 `durable` 属性：

```typescript
{
  provide: 'foobar',
  useFactory: () => { ... },
  scope: Scope.REQUEST,
  durable: true,
}
```
