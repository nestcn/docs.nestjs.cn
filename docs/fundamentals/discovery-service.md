<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:36:43.870Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

``DiscoveryService`` 提供了由 ``@nestjs/core`` 包提供的强大工具，可以让开发者在 NestJS 应用程序中动态地检查和获取提供者、控制器和其他元数据。这在构建插件、装饰器或高级功能时非常有用，特别是在使用 runtime 敏感信息时。通过使用 ``DiscoveryService``，开发者可以创建更加灵活和模块化的架构，从而实现自动化和动态行为。

#### 入门

在使用 ``DiscoveryService`` 之前，您需要在要使用它的模块中导入 ``DiscoveryModule``。这确保了服务可以被依赖注入。下面是一个在 NestJS 模块中配置它的示例：

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

一旦模块设置好了，``DiscoveryService`` 就可以被注入到任何需要动态发现的提供者或服务中。

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}

```

#### 发现提供者和控制器

``DiscoveryService`` 的一个关键功能是检索应用程序中注册的所有提供者。这对于动态地处理提供者非常有用。以下是访问所有提供者的示例：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

每个提供者对象都包含了其实例、令牌和元数据信息。类似地，如果您需要检索应用程序中注册的所有控制器，可以使用：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

这个功能对于需要动态地处理控制器的场景非常有用，例如分析追踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器，``DiscoveryService`` 还允许检索附加到这些组件的元数据。这对于使用自定义装饰器存储元数据的场景非常有用。

例如，考虑一个场景，其中自定义装饰器用于将提供者标记为特定的元数据：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

将这个装饰器应用于服务后，可以将元数据存储在提供者中：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

一旦元数据被附加到提供者中，``DiscoveryService`` 就可以轻松地根据分配的元数据过滤提供者。以下是检索具有特定元数据值的提供者的示例：

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

``DiscoveryService`` 是一个功能强大和灵活的工具，可以在 NestJS 应用程序中实现 runtime 敏感信息。通过允许动态地发现提供者、控制器和元数据，它在构建可扩展的框架、插件和自动化驱动的功能时扮演着关键角色。无论您需要扫描和处理提供者、提取元数据进行高级处理还是创建模块化和可扩展的架构，``DiscoveryService`` 都提供了一个高效和结构化的方法来实现这些目标。