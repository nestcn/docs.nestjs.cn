<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:40:09.213Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

`DiscoveryService` 提供了由 `@nestjs/core` 包含的强大工具，可以让开发者在 NestJS 应用程序中动态地查看和检索提供者、控制器和其他元数据。这在构建插件、装饰器或高级功能时特别有用。通过使用 `DiscoveryService`，开发者可以创建更加灵活和模块化的架构，从而实现自动化和动态行为。

#### 开发

在使用 `DiscoveryService` 之前，您需要在要使用它的模块中导入 `DiscoveryModule`。这样可以确保服务可供依赖注入。以下是一个在 NestJS 模块中配置它的示例：

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

一旦模块设置好了，`DiscoveryService` 就可以被注入到任何需要动态发现的提供者或服务中。

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}

```

#### 发现提供者和控制器

`DiscoveryService` 的一个关键功能是检索应用程序中注册的所有提供者。这对于动态处理提供者非常有用。以下是一种访问所有提供者的示例：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

每个提供者对象都包含了关于其实例、令牌和元数据的信息。类似地，如果需要检索应用程序中注册的所有控制器，可以使用：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

这项功能在需要动态处理控制器的情况下非常有用，例如分析跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器,`DiscoveryService` 还可以检索附加到这些组件的元数据。这在工作中使用自定义装饰器时非常有用，该装饰器在运行时存储元数据。

例如，考虑使用自定义装饰器将 providers 标记为特定的元数据：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

将该装饰器应用于服务后，可以将元数据存储在 providers 上：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

一旦 providers 将元数据附加到 providers 上，`DiscoveryService` 就可以轻松地过滤 providers，以便根据分配的元数据值检索 providers。以下是一个检索具有特定元数据值的 providers 的示例：

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

`DiscoveryService` 是一个功能强大和灵活的工具，允许在 NestJS 应用程序中实现运行时 introspection。通过动态发现提供者、控制器和元数据，它在构建可扩展的框架、插件和自动化驱动的功能时扮演着关键角色。无论您需要扫描和处理提供者、提取元数据以进行高级处理，还是创建模块化和可扩展的架构，`DiscoveryService` 都提供了一种高效且结构化的方法来实现这些目标。