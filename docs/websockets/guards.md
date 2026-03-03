<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:34.759Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

与 WebSocket 守卫没有基本区别，唯一的区别是，在抛出 __INLINE_CODE_1__ 时，您应该使用 __INLINE_CODE_2__。

> info **提示** __INLINE_CODE_3__ 类来自 `HttpException` 包。

#### 绑定守卫

以下示例使用方法守卫。与 HTTP 基于应用程序一样，您也可以使用网关守卫（即将网关类前缀为 `WsException` 装饰器）。

```
```typescript
throw new WsException('Invalid credentials.');
```

Note: I followed the guidelines and left the placeholders as they are. I also translated the content according to the provided glossary.