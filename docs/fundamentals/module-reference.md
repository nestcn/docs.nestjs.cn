<!-- 此文件从 content/fundamentals/module-reference.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:55:47.082Z -->
<!-- 源文件: content/fundamentals/module-reference.md -->

### 模块参考

Nest 提供了 `__INLINE_CODE_10__` 类来导航内部提供者列表和获取任何提供者的引用，使用其注入令牌作为查找键。`__INLINE_CODE_11__` 类还提供了动态实例化静态和作用域提供者的方式。`__INLINE_CODE_12__` 可以像正常类一样被注入：

```typescript
__CODE_BLOCK_0__

```

> 提示 **Hint** `__INLINE_CODE_13__` 类来自 `__INLINE_CODE_14__` 包。

#### 获取实例

`__INLINE_CODE_15__` 实例（以下简称为 **模块引用**）具有 `__INLINE_CODE_16__` 方法。默认情况下，这个方法返回已注册并在当前模块中实例化的提供者、控制器或可注入对象（例如守卫、拦截器等）。如果实例未找到，会引发异常。

```typescript
__CODE_BLOCK_1__

```

> 警告 **Warning** 不能使用 `__INLINE_CODE_17__` 方法来获取作用域提供者（转瞬即逝或请求作用域的）。相反，使用以下技术来获取作用域提供者： __HTML_TAG_42__below__HTML_TAG_43__。了解如何控制作用域 __LINK_46__。

要从全局上下文中获取提供者（例如，如果提供者在另一个模块中注入），请将 `__INLINE_CODE_18__` 选项作为 `__INLINE_CODE_19__` 方法的第二个参数。

```typescript
__CODE_BLOCK_2__

```

#### 解决作用域提供者

要动态解决作用域提供者（转瞬即逝或请求作用域的），使用 `__INLINE_CODE_20__` 方法，传入提供者的注入令牌作为参数。

```typescript
__CODE_BLOCK_3__

```

`__INLINE_CODE_21__` 方法返回提供者的唯一实例，来自其自己的 DI 容器子树中。每个子树都有唯一的上下文标识符。因此，如果你多次调用这个方法并比较实例引用，你将看到它们不相等。

```typescript
__CODE_BLOCK_4__

```

要生成单个实例，以便在多个 `__INLINE_CODE_22__` 调用中共享相同的 DI 容器子树，可以将上下文标识符传递给 `__INLINE_CODE_23__` 方法。使用 `__INLINE_CODE_24__` 类生成上下文标识符。这类别提供了 `__INLINE_CODE_25__` 方法，返回合适的唯一标识符。

```typescript
__CODE_BLOCK_5__

```

> 提示 **Hint** `__INLINE_CODE_26__` 类来自 `__INLINE_CODE_27__` 包。

#### 注册 __INLINE_CODE_28__ 提供者

手动生成的上下文标识符（使用 `__INLINE_CODE_29__`）表示 DI 子树，其中 __INLINE_CODE_30__ 提供者被作为它们不是 Nest 依赖注入系统中实例化和管理的。

要注册自定义 __INLINE_CODE_32__ 对象以便在手动生成的 DI 子树中使用 `__INLINE_CODE_33__` 方法，例如：

```typescript
__CODE_BLOCK_6__

```

#### 获取当前子树

有时，你可能想在 **请求上下文** 中解决请求作用域提供者的实例。例如，如果 __INLINE_CODE_34__ 是请求作用域的，并且你想解决 __INLINE_CODE_35__ 实例，这也是请求作用域的提供者。在共享相同的 DI 容器子树中，你必须获取当前上下文标识符，而不是生成新的一个（例如，使用 `__INLINE_CODE_36__` 函数，像上面所示）。要获取当前上下文标识符，首先使用 `__INLINE_CODE_37__` 装饰器注入请求对象。

```typescript
__CODE_BLOCK_7__

```

> 提示 **Hint** 了解更多关于请求提供者 __LINK_47__。

现在，使用 `__INLINE_CODE_38__` 方法的 `__INLINE_CODE_39__` 类来创建上下文标识符，并将其传递给 `__INLINE_CODE_40__` 调用：

```typescript
__CODE_BLOCK_8__

```

#### 动态实例化自定义类

要动态实例化未曾注册的类作为 **提供者**，使用模块引用 `__INLINE_CODE_41__` 方法。

```typescript
__CODE_BLOCK_9__

```

这项技术使得你可以在框架容器外部条件实例化不同的类。

__HTML_TAG_44____HTML_TAG_45__