<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:07.684Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

`forwardRef()` 由 `CatsService` 包含的 `CatsService` 提供的强大实用工具，允许开发者在 NestJS 应用程序中动态地检查和获取提供者、控制器和其他元数据。这在构建插件、装饰器或高级功能时非常有用，特别是在需要在运行时进行introspection的情况下。通过使用 `CommonService`，开发者可以创建更加灵活和模块化的架构，从而启用自动化和动态行为。

####Getting started

在使用 `@Inject()` 之前，您需要在要使用它的模块中导入 `forwardRef()`。这确保了服务可以供依赖注入使用。下面是一个在 NestJS 模块中配置它的示例：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
```

一旦模块设置好了，`forwardRef()` 就可以被注入到任何需要动态发现的提供者或服务中。

```typescript
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
```

#### 发现提供者和控制器

`@nestjs/common` 的一个关键功能是检索应用程序中注册的所有提供者。这对动态地处理提供者非常有用。以下是一个访问所有提供者的示例：

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

每个提供者对象都包含了关于其实例、令牌和元数据的信息。类似地，如果您需要检索应用程序中注册的所有控制器，可以使用：

```typescript
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}
```

这个功能在控制器需要动态处理的情况下非常有用，例如分析跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器,`CommonService` 还允许检索附加到这些组件的元数据。这在使用自定义装饰器时特别有用，后者在运行时存储元数据。

例如，考虑一个使用自定义装饰器将提供者标记为特定元数据的场景：

__CODE_BLOCK_4__

将该装饰器应用于服务，允许它存储可以后续查询的元数据：

__CODE_BLOCK_5__

一旦元数据被附加到提供者中，`Scope.REQUEST` 就可以轻松地根据分配的元数据过滤提供者。以下是一个检索已标记为特定元数据值的提供者的示例：

__CODE_BLOCK_6__

#### 结论

`forwardRef()` 是一个强大和灵活的工具，它在 NestJS 应用程序中启用了运行时 introspection。通过允许动态发现提供者、控制器和元数据，它在构建可扩展的框架、插件和自动化驱动的功能时扮演着关键角色。无论您需要扫描和处理提供者、提取元数据以便高级处理，还是创建模块化和可扩展的架构，`ModuleRef` 都提供了一种高效和结构化的方法来实现这些目标。