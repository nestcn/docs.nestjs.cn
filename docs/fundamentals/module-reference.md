<!-- 此文件从 content/fundamentals/module-referenceerence.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:12.086Z -->
<!-- 源文件: content/fundamentals/module-referenceerence.md -->

### 模块参考

Nest 提供了 `__INLINE_CODE_10__` 类来遍历内部提供者列表，使用注入 token 作为查找 key 获取任何提供者的引用。 `__INLINE_CODE_11__` 类还提供了动态实例化静态和作用域提供者的方式。 `__INLINE_CODE_12__` 可以像普通类一样被注入到类中：

```
```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```

> 提示 **Hint** `__INLINE_CODE_13__` 类来自 `__INLINE_CODE_14__` 包。

#### 获取实例

`__INLINE_CODE_15__` 实例（以下简称为 **模块引用**）具有 `__INLINE_CODE_16__` 方法。默认情况下，这个方法返回已注册和实例化在当前模块中的提供者、控制器或可 inject 对象（例如，守卫、拦截器等）。如果实例不可用，会抛出异常。

```
__CODE_BLOCK_1__
```

> 警告 **Warning** 使用 `__INLINE_CODE_17__` 方法无法获取作用域提供者（临时或请求作用域）。相反，使用以下技术描述__HTML_TAG_42__下__HTML_TAG_43__。了解如何控制作用域 __LINK_46__。

要从全局上下文中获取提供者（例如，如果提供者在不同的模块中被注入），将 `__INLINE_CODE_18__` 选项作为第二个参数传递给 `__INLINE_CODE_19__`。

```
__CODE_BLOCK_2__
```

#### 解析作用域提供者

要动态解析作用域提供者（临时或请求作用域），使用 `__INLINE_CODE_20__` 方法，传递提供者的注入 token 作为参数。

```
__CODE_BLOCK_3__
```

`__INLINE_CODE_21__` 方法返回提供者的唯一实例，从其自己的 DI 容器子树中。每个子树都有唯一的 **上下文标识符**。因此，如果您多次调用这个方法并比较实例引用，您将看到它们不相等。

```
__CODE_BLOCK_4__
```

要生成多次调用 `__INLINE_CODE_22__` 方法后共享的实例，并确保它们共享同一个生成的 DI 容器子树，您可以将上下文标识符传递给 `__INLINE_CODE_23__` 方法。使用 `__INLINE_CODE_24__` 类生成上下文标识符。这个类提供了 `__INLINE_CODE_25__` 方法，该方法返回适当的唯一标识符。

```
__CODE_BLOCK_5__
```

> 提示 **Hint** `__INLINE_CODE_26__` 类来自 `__INLINE_CODE_27__` 包。

#### 注册自定义提供者

手动生成的上下文标识符（使用 `__INLINE_CODE_29__`）表示 DI 子树，其中 `__INLINE_CODE_30__` 提供者作为它们不被实例化和管理 Nest 依赖注入系统。

要注册自定义 `__INLINE_CODE_32__` 对象用于手动生成的 DI 子树，使用 `__INLINE_CODE_33__` 方法，例如：

```
__CODE_BLOCK_6__
```

#### 获取当前子树

有时，您可能想在 **请求上下文** 中解析请求作用域提供者的实例。例如，如果 `__INLINE_CODE_34__` 是请求作用域的提供者，而您想要解析 `__INLINE_CODE_35__` 实例，它也标记为请求作用域的提供者。在共享同一个 DI 容器子树时，您必须获取当前上下文标识符，而不是生成新的一个（例如，使用 `__INLINE_CODE_36__` 函数，如上所示）。要获取当前上下文标识符，请使用 `__INLINE_CODE_37__` 装饰器注入请求对象。

```
__CODE_BLOCK_7__
```

> 提示 **Hint** 了解更多关于请求提供者的信息 __LINK_47__。

现在，使用 `__INLINE_CODE_38__` 方法创建基于请求对象的上下文标识符，并将其传递给 `__INLINE_CODE_40__` 调用：

```
__CODE_BLOCK_8__
```

#### 动态实例化自定义类

要动态实例化未 previously registered 作为 **提供者** 的类，使用模块引用 `__INLINE_CODE_41__` 方法。

```
__CODE_BLOCK_9__
```

这个技术使您可以在框架容器外conditionally 实例化不同的类。

__HTML_TAG_44____HTML_TAG_45__