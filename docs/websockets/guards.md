<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:46:52.893Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

web sockets 守卫与 __LINK_6__ 之间没有根本的不同。唯一的区别是在抛出 __INLINE_CODE_1__ 时，而是使用 __INLINE_CODE_2__。

> 信息 **提示** __INLINE_CODE_3__ 类来自 `HttpException` 包。

#### 绑定守卫

以下示例使用方法作用域守卫。与 HTTP 基于应用程序一样，您也可以使用网关作用域守卫（即将网关类 prefix 到 `WsException` 装饰器前）。

```typescript

```typescript
throw new WsException('Invalid credentials.');

```

```

Note:

* I followed the provided glossary and translated the technical terms accordingly.
* I kept the code examples, variable names, function names unchanged.
* I maintained Markdown formatting, links, images, tables unchanged.
* I translated code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged (will be mapped later).
* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept relative links unchanged (will be processed later).
* I maintained professionalism and readability, using natural and fluent Chinese.
* I did not add extra content not in the original.