### 模块参考

Nest 提供了 `ModuleRef` 类来导航内部提供者列表，并使用其注入令牌作为查找键获取任何提供者的引用。`ModuleRef` 类还提供了一种动态实例化静态和范围提供者的方法。`ModuleRef` 可以以常规方式注入到类中：

```typescript title="cats.service"
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
```

> info **提示** `ModuleRef` 类是从 `@nestjs/core` 包中导入的。

#### 获取实例

`ModuleRef` 实例（以下简称**模块引用** ）具有一个 `get()` 方法。默认情况下，该方法会返回一个已注册并在*当前模块*中使用其注入令牌/类名实例化的提供者、控制器或可注入对象（如守卫、拦截器等）。如果找不到实例，则会抛出异常。

```typescript title="cats.service"
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```

> warning **警告** 无法通过 `get()` 方法检索作用域提供者（瞬时或请求作用域）。请改用下文[所述技术](https://docs.nestjs.com/fundamentals/module-ref#resolving-scoped-providers) 。了解如何控制作用域请参阅[此处](/fundamentals/injection-scopes) 。

要从全局上下文中检索提供者（例如，如果该提供者已注入到其他模块中），请将 `{ strict: false }` 选项作为第二个参数传递给 `get()`。

```typescript
this.moduleRef.get(Service, { strict: false });
```

#### 解析作用域提供者

要动态解析一个作用域提供者（瞬态或请求作用域），请使用 `resolve()` 方法，并将提供者的注入令牌作为参数传入。

```typescript title="cats.service"
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
```

`resolve()` 方法会从它自己的**依赖注入容器子树**中返回该提供者的唯一实例。每个子树都有一个唯一的**上下文标识符** 。因此，如果多次调用此方法并比较实例引用，你会发现它们并不相同。

```typescript title="cats.service"
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
```

要在多个 `resolve()` 调用间生成单一实例，并确保它们共享相同的依赖注入容器子树，你可以向 `resolve()` 方法传入一个上下文标识符。使用 `ContextIdFactory` 类来生成上下文标识符，该类提供了 `create()` 方法，可返回一个合适的唯一标识符。

```typescript title="cats.service"
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}
```

> info **注意** `ContextIdFactory` 类是从 `@nestjs/core` 包导入的。

#### 注册 `REQUEST` 提供者

手动生成的上下文标识符（使用 `ContextIdFactory.create()`）代表 DI 子树，在这些子树中 `REQUEST` 提供者为 `undefined`，因为它们不是由 Nest 依赖注入系统实例化和管理的。

要为手动创建的 DI 子树注册自定义 `REQUEST` 对象，请使用 `ModuleRef#registerRequestByContextId()` 方法，如下所示：

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);
```

#### 获取当前子树

有时，你可能需要在**请求上下文**中解析一个请求作用域提供者的实例。假设 `CatsService` 是请求作用域的，而你想解析同样标记为请求作用域提供者的 `CatsRepository` 实例。为了共享同一个 DI 容器子树，你必须获取当前上下文标识符，而不是生成新的标识符（例如使用上文所示的 `ContextIdFactory.create()` 函数）。要获取当前上下文标识符，首先使用 `@Inject()` 装饰器注入请求对象。

```typescript title="cats.service"
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}
```

> info **了解**请求提供者的更多信息，请点击[此处](https://docs.nestjs.com/fundamentals/injection-scopes#request-provider) 。

现在，使用 `ContextIdFactory` 类的 `getByRequest()` 方法基于请求对象创建上下文 ID，并将其传递给 `resolve()` 调用：

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);
```

#### 动态实例化自定义类

要动态实例化一个**先前未注册**为**提供者**的类，可使用模块引用的 `create()` 方法。

```typescript title="cats.service"
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}
```

该技术使您能够在框架容器之外有条件地实例化不同的类。
