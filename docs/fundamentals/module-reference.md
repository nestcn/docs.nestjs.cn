<!-- 此文件从 content/fundamentals/module-reference.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:03.754Z -->
<!-- 源文件: content/fundamentals/module-reference.md -->

### 模块参考

Nest 提供了 `__INLINE_CODE_10__` 类来导航内部提供者列表，获取任何提供者的引用，使用其注入令牌作为查找键。`__INLINE_CODE_11__` 类还提供了动态实例化静态和作用域提供者的方法。`__INLINE_CODE_12__` 可以像正常类一样被注入到一个类中。

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }
}

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  findAll() {
    return this.cats;
  }
}
```

> info **提示** `__INLINE_CODE_13__` 类来自 `__INLINE_CODE_14__` 包。

#### 获取实例

``@Injectable()`` 实例（在下文中将其称为**模块引用**)具有 ``CatsService`` 方法。默认情况下，这个方法返回注册在当前模块中的提供者、控制器或可注入对象（例如守卫、拦截器等），使用其注入令牌或类名。 如果实例找不到，会抛出异常。

```typescript
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}

@Controller('cats')
@Dependencies(CatsService)
export class CatsController {
  constructor(catsService) {
    this.catsService = catsService;
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}
```

> warning **警告** 不能使用 ``cats.service.ts`` 方法获取作用域提供者（瞬态或请求作用域）。相反，使用以下描述的技术 __HTML_TAG_42__下__HTML_TAG_43__。了解如何控制作用域 __LINK_46__。

要从全局上下文中获取提供者（例如，如果提供者在不同的模块中被注入），将 ``@Injectable()`` 选项作为 ``CatsService`` 方法的第二个参数。

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

#### 解决作用域提供者

要动态解决作用域提供者（瞬态或请求作用域），使用 ``cats.controller.ts`` 方法，传递提供者的注入令牌作为参数。

```typescript
  constructor(private catsService: CatsService)
```

``CatsController`` 方法返回提供者的唯一实例，从其自己的**DI 容器子树**中。每个子树都有唯一的**上下文标识符**。因此，如果您多次调用这个方法，并比较实例引用，您将看到它们不相等。

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
```

要生成单个实例，以便在多次调用 ``CatsService`` 时共享相同的生成的 DI 容器子树，可以将上下文标识符传递给 ``app.module.ts`` 方法。使用 ``CatsService`` 类生成上下文标识符。这类提供了 ``CatsService`` 方法，返回合适的唯一标识符。

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
```

> info **提示** ``cats.service.ts`` 类来自 ``CatsController`` 包。

#### 注册提供者

手动生成的上下文标识符（使用 ``CatsService``）表示 DI 子树，在其中提供者 `CatsService` 作为它们没有被实例化和管理的 Nest 依赖注入系统。

要注册自定义 ``CatsService`` 对象为手动生成的 DI 子树，使用 ``CatsService`` 方法，例如：

```typescript
import { CatsService } from './cats.service';

const mockCatsService = {
  /* mock implementation
  ...
  */
};

@Module({
  imports: [CatsModule],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class AppModule {}
```

#### 获取当前子树

有时，您可能想要在**请求上下文**中解决请求作用域提供者的实例。让我们假设 ``@Module()`` 是请求作用域的提供者，您想解决 ``app.module`` 实例，该实例也被标记为请求作用域提供者。在共享相同的 DI 容器子树中，您必须获取当前上下文标识符，而不是生成新的一个（例如，使用 ``providers`` 函数，如上所示）。要获取当前上下文标识符，首先使用 ``providers`` 装饰器注入请求对象。

```typescript
import { connection } from './connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}
```

> info **提示** 了解请求提供者的更多信息 __LINK_47__。

现在，使用 ``providers: [CatsService]`` 方法中的 ``CatsService`` 类创建上下文 id，基于请求对象，然后将其传递给 ``CatsService`` 调用：

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

#### 动态实例化自定义类

要动态实例化未事先注册的类作为**提供者**，使用模块引用方法 ``NEST_DEBUG``。

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class AppModule {}
```

这项技术使您能够根据条件实例化不同的类，离开框架容器。

__HTML_TAG_44____HTML_TAG_45__