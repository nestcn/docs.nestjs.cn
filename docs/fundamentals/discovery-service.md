<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:33:38.361Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

`DiscoveryService` 提供的 `@nestjs/core` 包中的 `DiscoveryService` 是一个功能强大的实用工具，允许开发者在 NestJS 应用程序中动态检查和检索提供者、控制器和其他元数据。这对构建插件、装饰器或高级功能，特别是 runtime introspection 时非常有用。通过使用 `DiscoveryService`，开发者可以创建更加灵活和模块化的架构，启用自动化和动态行为在应用程序中。

#### 入门

在使用 `DiscoveryService` 之前，您需要在计划使用它的模块中导入 `DiscoveryModule`。这确保了服务可用于依赖注射。下面是一个在 NestJS 模块中配置它的示例：

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

`DiscoveryService` 的一个主要功能是检索应用程序中注册的所有提供者。这对动态处理提供者根据特定条件非常有用。以下是检索所有提供者的示例：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

每个提供者对象包含 instance、token 和元数据等信息。类似地，如果您需要检索应用程序中注册的所有控制器，可以使用：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

这个特性在处理动态控制器时非常有用，例如 analytics 跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器，`DiscoveryService` 还可以检索这些组件附加的元数据。这在使用自定义装饰器时非常有用，该装饰器在 runtime 存储元数据。

例如，考虑一个自定义装饰器，用于将提供者标记为特定的元数据：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

将该装饰器应用于服务，允许它存储元数据，可以后续查询：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

一旦提供者在这种方式下附加元数据，`DiscoveryService` 就可以轻松地根据分配的元数据过滤提供者。以下是检索具有特定元数据值的提供者的代码示例：

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

`DiscoveryService` 是一个功能强大的工具，允许在 NestJS 应用程序中进行 runtime introspection。通过动态发现提供者、控制器和元数据，它在构建可扩展框架、插件和自动化驱动的功能时扮演着关键角色。无论您需要扫描和处理提供者、提取元数据用于高级处理还是创建模块化和可扩展的架构，`DiscoveryService` 都提供了一种高效且结构化的方法来实现这些目标。