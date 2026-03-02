<!-- 此文件从 content/graphql/complexity.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:17:02.995Z -->
<!-- 源文件: content/graphql/complexity.md -->

### 复杂性

> 警告 **Warning** 本章仅适用于代码优先方法。

查询复杂度允许您定义某些字段的复杂性，并使用 **maximum complexity** 来限制查询。该想法是在使用简单的数字来定义每个字段的复杂性。常见的默认值是为每个字段分配复杂性值 __INLINE_CODE_5__。此外，GraphQL查询的复杂性计算可以使用所谓的复杂度估算器来自定义。复杂度估算器是一个简单的函数，它计算字段的复杂性。您可以将任意数量的复杂度估算器添加到规则中，然后按顺序执行它们。首个返回数字复杂性值的估算器确定该字段的复杂性。

__INLINE_CODE_6__ 包括与 __LINK_18__ 类似工具的集成，该工具提供基于成本分析的解决方案。使用该库，您可以拒绝对 GraphQL 服务器的查询，因为它们被视为太耗费执行。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
```

#### 获取开始

安装过程完成后，我们可以定义 __INLINE_CODE_7__ 类：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```

用于演示目的，我们指定了 __INLINE_CODE_8__ 作为最大允许复杂度。在上面的示例中，我们使用了 2 个估算器，namely __INLINE_CODE_9__ 和 `ModuleRef`。

- `ModuleRef`: 该简单估算器返回每个字段的固定复杂性
- `ModuleRef`: 字段扩展 estimator 提取每个字段的复杂性值

> 提示 **Hint** 不要忘记将该类添加到任何模块的 providers 数组中。

#### 字段级复杂性

安装插件后，我们现在可以定义字段的复杂性，方法是在 `@nestjs/core` 装饰器的 options 对象中指定 `ModuleRef` 属性，如下所示：

```typescript
this.moduleRef.get(Service, { strict: false });
```

Alternatively, you can define the estimator function:

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
```

#### 查询/mutation级复杂性

此外，`ModuleRef` 和 `get()` 装饰器可能具有 `get()` 属性，指定如下：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
```