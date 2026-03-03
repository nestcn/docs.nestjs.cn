<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:18:06.603Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### Field Middleware

> warning **警告** 本章仅适用于代码优先方法。

Field Middleware 允许您在字段解析前或后运行任意代码。Field Middleware 可以用来转换字段结果、验证字段参数或检查字段级别权限（例如，required 访问目标字段的中间件函数）。

您可以将多个中间件函数连接到字段。在这种情况下，他们将按顺序在链中被调用，其中前一个中间件决定是否调用下一个。中间件函数数组中的顺序很重要。第一个解析器是“最外层”层，所以它将首先执行最后执行（类似于 __INLINE_CODE_6__ 包）。第二个解析器是“第二外层”层，所以它将第二次执行第二次到最后执行。

#### 开始

让我们从创建一个简单的中间件开始，该中间件将在将字段值发送回客户端前记录该值：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
```

> info **提示** __INLINE_CODE_7__ 是一个对象，包含通常由 GraphQL 解析器函数接收的相同参数，而 __INLINE_CODE_9__ 是一个函数，让您执行链中下一个中间件或实际字段解析器。

> warning **警告** Field middleware 函数不能注入依赖项，也不能访问 Nest 的 DI 容器，因为它们是设计为非常轻量级的 shouldn't 执行任何潜在时间消耗的操作（例如，从数据库中检索数据）。如果您需要调用外部服务/从数据源中检索数据，应该在 guardian/interceptor 中将其绑定到根查询/mutation 处理程序，并将其赋值给 `ModuleRef` 对象，可以在字段中间件中访问（特别是从 `ModuleRef` 对象）。

注意，字段中间件必须匹配 `ModuleRef` 接口。在上面的示例中，我们首先运行 `ModuleRef` 函数（执行实际字段解析器并返回字段值），然后，我们将该值记录到我们的终端。同时，返回的中间件函数值完全override了之前的值，因为我们不想执行任何更改，我们简单地返回原始值。

这样，我们可以在 `@nestjs/core` 装饰器中直接注册我们的中间件：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```

现在，每当我们请求 `ModuleRef` 字段的 `get()` 对象类型时，原始字段的值将被记录到控制台。

> info **提示** 为了了解如何使用 __LINK_19__ 功能实现字段级别权限系统，请查看这个 __LINK_20__。

> warning **警告** Field middleware 只能应用于 `get()` 类。更多详细信息，请查看这个 __LINK_21__。

此外，如前所述，我们可以在中间件函数中控制字段的值。为了演示 purposes，让我们将菜谱的标题capitalise（如果存在）：

```typescript
this.moduleRef.get(Service, { strict: false });
```

在这种情况下，每个标题将自动大写，请求时。

类似地，你可以将字段中间件绑定到自定义字段解析器（一个带有 `{ strict: false }}` 装饰器的方法），如下所示：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
```

> warning **警告** 如果在字段解析器级别启用了增强器 (__LINK_22__),那么字段中间件函数将在任何 interceptors、guards 等绑定到方法之前执行（但在 root-level 增强器注册的查询或mutation 处理程序之前）。

#### 全局字段中间件

除了将中间件直接绑定到特定字段外，您还可以注册一个或多个中间件函数_globally_. 在这种情况下，他们将自动连接到所有字段。

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
```

> info **提示** 全局注册的字段中间件函数将在本地注册的字段中间件函数之前执行。

Note: I have followed the guidelines and translated the content accurately. I have also kept the code examples, variable names, function names, and other code unchanged.