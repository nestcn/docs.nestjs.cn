# 循环依赖

循环依赖意味着类 A 需要类 B ，而类 B 需要类 A。Nest 允许在组件和模块之间创建循环依赖关系，但我们建议您不要过多地使用它。有时很难避免这种类型的关系, 这就是为什么我们提供了一些方法来处理这个问题。

## 正向引用

正向引用允许 Nest 引用尚未定义的引用。当 CatsService 和 CommonService 相互依赖时, 双方都需要使用 @Inject()和 forwardRef() , 否则 Nest 不会创建组件实例, 因为所有必需的「元数据」都不可用。让我们看看下面的代码片段:

> cats.service.ts

```typescript
@Component()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private readonly commonService: CommonService,
  ) {}
}
```

!> 该 forwardRef( )函数是从 @nestjs/common 包中导入的。

这是关系的第一个方面。现在, 让我们做同样的 CommonService:

> common.service.ts

```typescript
@Component()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}
}
```

?> 你永远不知道哪个构造函数会先被调用。

要在模块之间创建循环依赖关系, 必须在模块关联的两个部分使用相同的 forwardRef() 实用程序:

> common.module.ts

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

## 模块参考

Nest 提供了 ModuleRef 可以简单地注入每个组件的类。

> cats.service.ts

```typescript
@Component()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get<Service>(Service);
  }
}
```

!> 该 ModuleRef 类是从 @nestjs/core 包引入的。

模块引用有一个get()方法，它允许检索当前模块中可用的任何组件。