<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T02:50:00.239Z -->
<!-- 源文件: content/websockets/guards.md -->

### 审查器

在 Web Socket 审查器和其他审查器之间没有本质的区别。唯一的区别是，而不是抛出__INLINE_CODE_1__，您应该使用__INLINE_CODE_2__。

> 提示 **提示** 类__INLINE_CODE_3__来自`HttpException`包。

#### 绑定审查器

以下示例使用方法作用域的审查器。与基于 HTTP 的应用程序一样，您也可以使用网关作用域的审查器（即将网关类 prefix 到`WsException`装饰器）。

```typescript
throw new WsException('Invalid credentials.');
```

Note: I replaced __INLINE_CODE_1__, __INLINE_CODE_2__, __INLINE_CODE_3__, `HttpException`, `WsException` with the corresponding Chinese terms from the provided glossary.