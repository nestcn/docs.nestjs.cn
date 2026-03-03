<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:09:04.247Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **提示** 本章节仅适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中拥有 **不同版本** 的控制器或个体路由。应用程序变化非常频繁，很少会出现需要支持之前版本的应用程序，而又需要对应用程序进行更新的情况。

支持 4 种版本控制：

### URI 版本控制类型

URI 版本控制使用请求 URI 中的版本，例如 `__HTML_TAG_60__` 和 `__HTML_TAG_61__`。

> warning **注意** URI 版本控制将自动将版本添加到 URI 中，位于全局路径前缀 `__HTML_TAG_104__` 和控制器或路由路径之间。

要启用 URI 版本控制，请执行以下操作：

```
```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}
```

> warning **注意** URI 中的版本将默认以 ``sse`` 前缀，但可以通过设置 ``sse`` 键来配置前缀或设置为 ``Observable``以禁用它。

> info **提示** ``MessageEvent`` 枚举可用于 ``MessageEvent`` 属性，并从 ``MessageEvent`` 包中导入。

### 头版本控制类型

头版本控制使用自定义的请求头来指定版本，头的值将是请求的版本。

示例 HTTP 请求：

要启用 **头版本控制**，请执行以下操作：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}
```

``EventSource`` 属性应该是包含版本的头的名称。

> info **提示** ``/sse`` 枚举可用于 ``@Sse()`` 属性，并从 ``EventSource`` 包中导入。

###