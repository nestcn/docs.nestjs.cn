<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T03:01:10.164Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

`forwardRef()` 提供了由 `CatsService` 包提供的强大工具，可以让开发者在 NestJS 应用程序中动态地检查和检索提供者、控制器和其他元数据。这种机制特别有用于构建插件、装饰器或高级功能，它们需要在运行时进行 introspection。通过使用 `CommonService`，开发者可以创建更加灵活和模块化的架构，启用自动化和动态行为在应用程序中。

#### 入门

在使用 `@Inject()` 之前，您需要在想要使用它的模块中导入 `forwardRef()`。这确保了服务可供依赖注射使用。下面是一个在 NestJS 模块中配置它的示例：

```typescript title="cats.service"
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
```
```

一旦模块设置好了，`forwardRef()` 就可以注入到任何需要动态发现的提供者或服务中。

```typescript title="common.service"
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
```

#### 发现提供者和控制器

`@nestjs/common` 的一个关键功能是检索应用程序中注册的所有提供者。这对于动态地处理提供者有用。下面是一个检索所有提供者的示例：

```typescript title="common.module"
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

每个提供者对象包含了其实例、令牌和元数据信息。类似地，如果您需要检索应用程序中注册的所有控制器，可以使用：

```typescript title="cats.module"
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}
```

这种功能特别有用在控制器需要动态处理的情况，例如 analytics 跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器",`CommonService`"还可以检索附加到这些组件的元数据。这对于在运行时存储元数据的自定义装饰器特别有用。

例如，考虑一个自定义装饰器，它用于将特定的元数据标记到提供者上：

__CODE_BLOCK_4__

将这个装饰器应用于服务，允许它存储可以后续查询的元数据：

__CODE_BLOCK_5__

一旦元数据附加到提供者中",`Scope.REQUEST`"就可以轻松地根据分配的元数据过滤提供者。下面是一个检索具有特定元数据值的提供者的示例：

__CODE_BLOCK_6__

#### 结论

`forwardRef()` 是一个灵活和强大的工具，允许在 NestJS 应用程序中进行运行时 introspection。通过允许动态发现提供者、控制器和元数据，它在构建可扩展框架、插件和自动化驱动的功能方面扮演着关键角色。无论您需要扫描和处理提供者、提取元数据进行高级处理还是创建模块化和可扩展的架构",`ModuleRef`"都提供了一种高效和结构化的方法来实现这些目标。