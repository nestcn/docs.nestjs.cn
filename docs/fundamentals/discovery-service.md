<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:19:09.322Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

`DiscoveryService` 提供由 `@nestjs/core` 包含的强大工具，可以让开发者在 NestJS 应用程序中动态地检查和检索提供者、控制器和其他元数据。这在构建插件、装饰器或高级功能时特别有用，需要在 runtime 进行反射。通过使用 `DiscoveryService`，开发者可以创建更灵活和模块化的架构，启用自动化和动态行为在应用程序中。

#### 入门

在使用 `DiscoveryService` 之前，您需要在要使用它的模块中导入 `DiscoveryModule`。这样可以确保服务可供依赖注射使用。下面是一个在 NestJS 模块中配置它的示例：

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

一旦模块设置好",`DiscoveryService`"就可以被注入到任何需要动态发现的提供者或服务中。

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}

```

#### 发现提供者和控制器

`DiscoveryService` 的一个关键功能是检索应用程序中所有已注册的提供者。这对于动态处理提供者根据特定条件非常有用。以下是检索所有提供者的示例：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

每个提供者对象包含了关于其实例、令牌和元数据的信息。类似地，如果您需要检索应用程序中所有已注册的控制器，可以这样做：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

该功能在控制器需要动态处理时特别有用，例如，跟踪 analytics 或自动注册机制。

#### 提取元数据

除了发现提供者和控制器,`DiscoveryService` 还使得检索到这些组件的元数据。这在使用自定义装饰器时特别有用，该装饰器可以在 runtime 存储元数据。

例如，考虑一个情况，在服务中应用自定义装饰器以将提供者标记为特定元数据：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

将该装饰器应用于服务，允许将元数据附加到提供者中：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

一旦元数据被附加到提供者中,`DiscoveryService` 就可以轻松地根据分配的元数据过滤提供者。以下是检索具有特定元数据值的提供者的示例：

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

`DiscoveryService` 是一个强大且灵活的工具，允许在 NestJS 应用程序中进行 runtime 反射。通过允许动态发现提供者、控制器和元数据，它在构建可扩展框架、插件和自动化驱动特性的过程中扮演着关键角色。无论您需要扫描和处理提供者、提取元数据以进行高级处理还是创建模块化和可扩展的架构,`DiscoveryService` 都提供了一个高效且结构化的方法来实现这些目标。