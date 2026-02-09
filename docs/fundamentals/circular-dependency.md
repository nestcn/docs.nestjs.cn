# 循环依赖

循环依赖指的是两个类相互依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。在 Nest 中，模块之间以及提供者之间都可能出现循环依赖。

虽然应尽可能避免循环依赖，但有时无法完全避免。针对这种情况，Nest 提供了两种解决提供者间循环依赖的方法。本章将介绍使用**前向引用**作为第一种技术，以及使用 **ModuleRef** 类从 DI 容器中获取提供者实例作为第二种方案。

我们还将介绍如何解决模块间的循环依赖问题。

:::warning 警告
使用“桶文件”/index.ts 文件对导入进行分组也可能导致循环依赖。在涉及模块/提供者类时，应省略桶文件。例如，在导入与桶文件位于同一目录中的文件时不应使用桶文件，即 `cats/cats.controller` 不应导入 `cats` 来导入 `cats/cats.service` 文件。更多详情请参阅[此 GitHub issue](https://github.com/nestjs/nest/issues/1181#issuecomment-430197191)。
:::

#### 前向引用

**前向引用**允许 Nest 通过 `forwardRef()` 工具函数引用尚未定义的类。例如，如果 `CatsService` 和 `CommonService` 相互依赖，关系的两侧都可以使用 `@Inject()` 和 `forwardRef()` 工具来解决循环依赖。否则，Nest 将不会实例化它们，因为所有必要的元数据都将不可用。示例如下：

 ```typescript title="cats.service.ts"
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
```

:::info 提示
`forwardRef()` 函数是从 `@nestjs/common` 包中导入的。
:::

这涵盖了关系的一侧。现在让我们对 `CommonService` 做同样的事情：

 ```typescript title="common.service.ts"
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
```

:::warning 警告
 实例化顺序是不确定的。请确保您的代码不依赖于首先调用哪个构造函数。依赖于具有 `Scope.REQUEST` 的提供者的循环依赖可能导致未定义的依赖关系。更多信息请参见[此处](https://github.com/nestjs/nest/issues/5778)。
:::

#### ModuleRef 类的替代方案

除了使用 `forwardRef()`，另一种方法是重构您的代码，并使用 `ModuleRef` 类在（原本）循环关系的一侧检索提供者。在[此处](/fundamentals/module-reference)了解有关 `ModuleRef` 实用工具类的更多信息。

#### 模块前向引用

为了解决模块之间的循环依赖，请在模块关联的两侧使用相同的 `forwardRef()` 工具函数。例如：

 ```typescript title="common.module.ts"
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

这涵盖了关系的一侧。现在让我们对 `CatsModule` 做同样的事情：

 ```typescript title="cats.module.ts"
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}
```
