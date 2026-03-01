<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:26:28.877Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

__INLINE_CODE_7__ 由 __INLINE_CODE_8__ 包提供，是一个强大的实用工具，可以在 NestJS 应用程序中动态地检查和检索提供者、控制器和其他元数据。这在构建插件、装饰器或高级功能时特别有用，需要在运行时进行 introspection。通过使用 __INLINE_CODE_9__，开发者可以创建更加灵活和模块化的架构，启用自动化和动态行为在应用程序中。

#### 获取开始

在使用 __INLINE_CODE_10__ 之前，您需要在要使用它的模块中导入 __INLINE_CODE_11__。这确保了服务可供依赖注射使用。下面是一个在 NestJS 模块中配置它的示例：

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

一旦模块设置好了，__INLINE_CODE_12__ 就可以被注入到任何需要动态发现的提供者或服务中。

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

#### 发现提供者和控制器

__INLINE_CODE_13__ 的一个主要功能是检索应用程序中所有注册的提供者。这在动态地处理提供者时非常有用。以下是访问所有提供者的示例：

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

每个提供者对象都包含了其实例、令牌和元数据。类似地，如果您需要检索应用程序中所有注册的控制器，可以使用以下代码：

```typescript
  constructor(private catsService: CatsService)
```

这项功能特别有用，在控制器需要动态处理时，例如分析追踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器外，__INLINE_CODE_14__ 还允许检索这些组件附加的元数据。这在使用自定义装饰器时特别有用，该装饰器在运行时存储元数据。

例如，考虑一个自定义装饰器，它用于将提供者标记为特定的元数据：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
```

将该装饰器应用于服务，允许它存储元数据，后续可以查询：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
```

一旦元数据附加到提供者中，`@Injectable()` 就可以轻松地根据分配的元数据过滤提供者。以下代码示例演示如何检索具有特定元数据值的提供者：

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

#### 结论

`CatsService` 是一个灵活和强大的工具，可以在 NestJS 应用程序中实现运行时 introspection。通过允许动态发现提供者、控制器和元数据，它在构建可扩展的框架、插件和自动化驱动的功能时扮演了关键角色。无论您需要扫描和处理提供者、提取元数据进行advanced 处理，还是创建模块化和可扩展的架构，`cats.service.ts` 提供了一个高效且结构化的approach 来实现这些目标。