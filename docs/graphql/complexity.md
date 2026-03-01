<!-- 此文件从 content/graphql/complexity.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:25:17.870Z -->
<!-- 源文件: content/graphql/complexity.md -->

### 复杂度

> 警告 **警告** 本章只适用于代码优先方法。

查询复杂度允许您定义某些字段的复杂度，并限制查询的 **最大复杂度**。该想法是使用简单的数字来定义每个字段的复杂度。一个常见的默认值是为每个字段分配复杂度为 __INLINE_CODE_5__。此外，可以使用称为复杂度估算器的简单函数来自定义 GraphQL 查询的复杂度计算。复杂度估算器是一个简单函数，它计算字段的复杂度。您可以添加任意数量的复杂度估算器到规则中，然后执行它们一个接着一个。第一个返回数字复杂度值的估算器确定该字段的复杂度。

__INLINE_CODE_6__ 包含与 __LINK_18__ 类似的工具，该工具提供基于成本分析的解决方案。使用该库，您可以拒绝对 GraphQL 服务器的查询，因为它们被认为太耗费资源以执行。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
```

#### 入门

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

为演示目的，我们指定了最大允许的复杂度为 __INLINE_CODE_8__。在上面的示例中，我们使用了 2 个估算器，即 __INLINE_CODE_9__ 和 `ModuleRef`。

- `ModuleRef`:简单估算器返回每个字段的固定复杂度
- `ModuleRef`:字段扩展估算器提取 schema 中每个字段的复杂度值

> 提示 **提示** 不要忘记将该类添加到 providers 数组中任何模块中。

#### 字段级复杂度

安装插件后，我们现在可以定义任何字段的复杂度，方法是在 `@nestjs/core` 装饰器中指定 `ModuleRef` 属性，例如：

```typescript
this.moduleRef.get(Service, { strict: false });
```

或者，您可以定义估算函数：

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

#### 查询/Mutation级复杂度

此外，`ModuleRef` 和 `get()` 装饰器可能具有 `get()` 属性指定如下：

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