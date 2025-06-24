### 循环依赖

循环依赖指的是两个类相互依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。在 Nest 中，模块之间以及提供者之间都可能出现循环依赖。

虽然应尽可能避免循环依赖，但有时无法完全避免。针对这种情况，Nest 提供了两种解决提供者间循环依赖的方法。本章将介绍使用**前向引用**作为第一种技术，以及使用 **ModuleRef** 类从 DI 容器中获取提供者实例作为第二种方案。

我们还将介绍如何解决模块间的循环依赖问题。

> warning **警告** 使用"barrel files"/index.ts 文件分组导入时也可能导致循环依赖。涉及模块/提供者类时应忽略 barrel 文件。例如，在导入与 barrel 文件同目录下的文件时不应使用 barrel 文件，即 `cats/cats.controller` 不应通过导入 `cats` 来引入 `cats/cats.service` 文件。更多详情请参阅[此 GitHub issue](https://github.com/nestjs/nest/issues/1181#issuecomment-430197191)。

#### 前向引用

**前向引用**允许 Nest 通过 `forwardRef()` 工具函数引用尚未定义的类。例如，若 `CatsService` 与 `CommonService` 相互依赖，双方都可以使用 `@Inject()` 和 `forwardRef()` 工具来解决循环依赖。否则 Nest 将无法实例化它们，因为所有必要的元数据都不可用。示例如下：

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
@@switch
@Injectable()
@Dependencies(forwardRef(() => CommonService))
export class CatsService {
  constructor(commonService) {
    this.commonService = commonService;
  }
}
```

> info **提示** `forwardRef()` 函数是从 `@nestjs/common` 包中导入的。

这涵盖了关系的一侧。现在让我们对 `CommonService` 进行同样的操作：

```typescript
@@filename(common.service)
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
@@switch
@Injectable()
@Dependencies(forwardRef(() => CatsService))
export class CommonService {
  constructor(catsService) {
    this.catsService = catsService;
  }
}
```

> warning **警告** 实例化顺序是不确定的。请确保您的代码不依赖于哪个构造函数先被调用。循环依赖若依赖于具有 `Scope.REQUEST` 的提供者，可能导致未定义的依赖关系。更多信息请参见 [此处](https://github.com/nestjs/nest/issues/5778)

#### ModuleRef 类的替代方案

An alternative to using `forwardRef()` is to refactor your code and use the `ModuleRef` class to retrieve a provider on one side of the (otherwise) circular relationship. Learn more about the `ModuleRef` utility class [here](/fundamentals/module-ref).

#### Module forward reference

In order to resolve circular dependencies between modules, use the same `forwardRef()` utility function on both sides of the modules association. For example:

```typescript
@@filename(common.module)
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

That covers one side of the relationship. Now let's do the same with `CatsModule`:

```typescript
@@filename(cats.module)
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}
```
