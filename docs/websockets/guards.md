<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:15:31.595Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

对 WebSocket 守卫和 __LINK_6__ 之间没有基本差异。唯一的区别是，您应该使用 __INLINE_CODE_2__ 而不是抛出 __INLINE_CODE_1__。

> 信息 **提示** __INLINE_CODE_3__ 类来自 `HttpException` 包。

#### 绑定守卫

以下示例使用方法作用域守卫。与基于 HTTP 的应用程序一样，您也可以使用网关作用域守卫（即在网关类前缀 `WsException` 装饰器）。

```typescript
```typescript
throw new WsException('Invalid credentials.');
```