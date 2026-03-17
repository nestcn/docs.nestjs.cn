<!-- 此文件从 content/microservices/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:43:20.483Z -->
<!-- 源文件: content/microservices/pipes.md -->

### 管道

与微服务管道没有本质区别。唯一的区别是，您应该使用 `RpcException` 而不是抛出 `HttpException`。

> 提示 **提示** `RpcException` 类是从 `@nestjs/microservices` 包含的。

#### 绑定管道

以下示例使用了手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域管道（即在控制器类前添加 `@UsePipes()` 装饰器）。

```typescript

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

```

Note:

* I kept the code example unchanged, including variable names, function names, and Markdown formatting.
* I translated code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged (will be mapped later).
* I kept relative links unchanged (will be processed later).
* I followed the provided glossary for technical terms.