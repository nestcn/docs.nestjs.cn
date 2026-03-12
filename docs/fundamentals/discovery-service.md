<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.390Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

`@nestjs/core` 包提供的 `DiscoveryService` 是一个强大的实用工具，允许开发人员在 NestJS 应用程序中动态检查和检索提供者、控制器和其他元数据。这在构建依赖运行时内省的插件、装饰器或高级功能时特别有用。通过利用 `DiscoveryService`，开发人员可以创建更灵活和模块化的架构，从而在应用程序中实现自动化和动态行为。

#### 入门

在使用 `DiscoveryService` 之前，你需要在你打算使用它的模块中导入 `DiscoveryModule`。这确保了该服务可用于依赖注入。以下是如何在 NestJS 模块中配置它的示例：

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

一旦模块设置完成，`DiscoveryService` 就可以注入到任何需要动态发现的提供者或服务中。

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}

```

#### 发现提供者和控制器

`DiscoveryService` 的关键功能之一是检索应用程序中所有注册的提供者。这对于根据特定条件动态处理提供者很有用。以下代码片段演示了如何访问所有提供者：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

每个提供者对象都包含其实例、令牌和元数据等信息。同样，如果你需要检索应用程序中所有注册的控制器，可以使用：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

此功能对于需要动态处理控制器的场景特别有用，例如分析跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器外，`DiscoveryService` 还可以检索附加到这些组件的元数据。这在使用在运行时存储元数据的自定义装饰器时特别有价值。

例如，考虑一个使用自定义装饰器为提供者标记特定元数据的情况：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

将此装饰器应用于服务可以存储稍后可以查询的元数据：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

一旦以这种方式将元数据附加到提供者，`DiscoveryService` 就可以轻松地根据分配的元数据过滤提供者。以下代码片段演示了如何检索已标记特定元数据值的提供者：

```typescript
const providers = this.discoveryService.getProviders();

const [provider] = providers.filter(
  (item) =>
    this.discoveryService.getMetadataByDecorator(FeatureFlag, item) ===
    'experimental',
);

console.log(
  '具有 "experimental" 功能标志元数据的提供者：',
  provider,
);

```

#### 总结

`DiscoveryService` 是一个多功能且强大的工具，可在 NestJS 应用程序中实现运行时内省。通过允许动态发现提供者、控制器和元数据，它在构建可扩展框架、插件和自动化驱动功能方面发挥着关键作用。无论你需要扫描和处理提供者、提取元数据进行高级处理，还是创建模块化和可扩展的架构，`DiscoveryService` 都提供了一种高效且结构化的方法来实现这些目标。
