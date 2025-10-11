### 发现服务

由 `@nestjs/core` 包提供的 `DiscoveryService` 是一个强大的工具，允许开发者动态检查和检索 NestJS 应用程序中的提供者、控制器和其他元数据。这在构建依赖运行时自省的插件、装饰器或高级功能时特别有用。通过利用 `DiscoveryService`，开发者可以创建更灵活和模块化的架构，实现应用程序中的自动化和动态行为。

#### 快速开始

在使用 `DiscoveryService` 之前，您需要在打算使用它的模块中导入 `DiscoveryModule`。这确保了该服务可用于依赖注入。以下是在 NestJS 模块中配置的示例：

```typescript
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ExampleService } from './example.service';

@Module({
  imports: [DiscoveryModule],
  providers: [ExampleService],
})
export class ExampleModule {}
```

模块设置完成后，`DiscoveryService` 可以被注入到任何需要动态发现的提供者或服务中。

 ```typescript title="example.service.ts"
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}
```

#### 发现提供者和控制器

`DiscoveryService` 的一个关键能力是检索应用中所有已注册的提供者。这对于基于特定条件动态处理提供者非常有用。以下代码片段展示了如何访问所有提供者：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);
```

每个提供者对象包含其实例、令牌和元数据等信息。同样，如果需要检索应用中所有已注册的控制器，可以通过以下方式实现：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);
```

该特性对于需要动态处理控制器的场景特别有用，例如分析跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器外，`DiscoveryService` 还能获取附加在这些组件上的元数据。这对于处理在运行时存储元数据的自定义装饰器特别有价值。

例如，考虑使用自定义装饰器为提供者标记特定元数据的情况：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();
```

将此装饰器应用于服务后，可以存储后续可查询的元数据：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}
```

当以这种方式将元数据附加到提供者后，`DiscoveryService` 可以轻松根据分配的元数据筛选提供者。以下代码片段演示了如何检索标记了特定元数据值的提供者：

```typescript
const providers = this.discoveryService.getProviders();

const [provider] = providers.filter(
  (item) =>
    this.discoveryService.getMetadataByDecorator(FeatureFlag, item) ===
    'experimental',
);

console.log(
  'Providers with the "experimental" feature flag metadata:',
  provider,
);
```

#### 结论

`DiscoveryService` 是一个多功能且强大的工具，能够在 NestJS 应用程序中实现运行时内省。通过支持动态发现提供者、控制器和元数据，它在构建可扩展框架、插件和自动化驱动功能方面发挥着关键作用。无论是需要扫描和处理提供者、提取元数据进行高级处理，还是创建模块化和可扩展的架构，`DiscoveryService` 都为实现这些目标提供了高效且结构化的方法。
