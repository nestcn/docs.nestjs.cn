<!-- 此文件从 content/fundamentals/module-reference.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:26:34.820Z -->
<!-- 源文件: content/fundamentals/module-reference.md -->

### 模块参考

Nest 提供了 ``query`` 类，以便遍历内部的提供者列表并获取使用 injection token 作为查找 key 的任何提供者的引用。 ``params`` 类还提供了动态实例化静态和作用域提供者的方式。 ``body`` 可以像正常的类一样被注入：

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
```

> info **提示** ``RouteSpecificPipe`` 类来自 ``try/catch`` 包。

#### 获取实例

`__INLINE_CODE_15__` 实例（以下简称为**模块引用**)具有 `__INLINE_CODE_16__` 方法。默认情况下，这个方法返回已在当前模块中注册和实例化的提供者、控制器或注入项（例如守卫、拦截器等）。如果实例未找到，则将抛出异常。

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}
```

> warning **警告** 不能使用 `__INLINE_CODE_17__` 方法获取作用域提供者（临时或请求作用域）。相反，请遵循以下 __HTML_TAG_42__ 中描述的技术。了解如何控制作用域 __LINK_46__。

要从全局上下文中获取提供者（例如，如果提供者在不同模块中被注入），请将 `__INLINE_CODE_18__` 选项作为第二个参数传递给 `__INLINE_CODE_19__`。

__CODE_BLOCK_2__

#### 解析作用域提供者

要动态解析作用域提供者（临时或请求作用域），使用 `__INLINE_CODE_20__` 方法，传递提供者的 injection token 作为参数。

__CODE_BLOCK_3__

`__INLINE_CODE_21__` 方法返回提供者的唯一实例，从其自己的 DI 容器子树中获取。每个子树都具有唯一的上下文标识符。因此，如果您调用这个方法多次，并将实例引用比较，您将看到它们不相同。

__CODE_BLOCK_4__

要生成跨多个 `__INLINE_CODE_22__` 调用共享相同生成的 DI 容器子树的实例，并确保它们共享相同的生成实例，可以将上下文标识符传递给 `__INLINE_CODE_23__` 方法。使用 `__INLINE_CODE_24__` 类生成上下文标识符。这类提供了 `__INLINE_CODE_25__` 方法，返回合适的唯一标识符。

__CODE_BLOCK_5__

> info **提示** `__INLINE_CODE_26__` 类来自 `__INLINE_CODE_27__` 包。

#### 注册自定义提供者

手动生成的上下文标识符（使用 `__INLINE_CODE_29__`）表示 DI 子树，其中 `__INLINE_CODE_30__` 提供者以它们未被实例化和管理为 Nest 依赖注入系统。

要将自定义 `__INLINE_CODE_32__` 对象注册到手动生成的 DI 子树中，使用 `__INLINE_CODE_33__` 方法，例如：

__CODE_BLOCK_6__

#### 获取当前子树

有时，您可能想要在 **请求上下文** 中解析请求作用域提供者的实例。例如，如果 `__INLINE_CODE_34__` 是请求作用域的提供者，您想解析 `__INLINE_CODE_35__` 实例，这个实例也被标记为请求作用域的提供者。在共享相同 DI 容器子树的情况下，您必须获取当前上下文标识符，而不是生成新的一个（例如，使用 `__INLINE_CODE_36__` 函数，如上所示）。要获取当前上下文标识符，请首先使用 `__INLINE_CODE_37__` 装饰器注入请求对象。

__CODE_BLOCK_7__

> info **提示** 了解更多关于请求提供者的信息 __LINK_47__。

现在，使用 `__INLINE_CODE_38__` 方法来自 `__INLINE_CODE_39__` 类创建上下文标识符，并将其传递给 `__INLINE_CODE_40__` 调用：

__CODE_BLOCK_8__

#### 动态实例化自定义类

要动态实例化未曾注册为提供者的类，使用模块引用 `__INLINE_CODE_41__` 方法。

__CODE_BLOCK_9__

这项技术使您可以在框架容器外部条件实例化不同的类。

__HTML_TAG_44____HTML_TAG_45__
