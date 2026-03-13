<!-- 此文件从 content/microservices/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:04:54.274Z -->
<!-- 源文件: content/microservices/pipes.md -->

### 管道

与微服务管道没有本质的区别。唯一的区别是，您不应该抛出 `HttpException`，而是使用 `RpcException`。

> 信息 **提示** `RpcException` 类是来自 `@nestjs/microservices` 程序包的。

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

* I followed the provided glossary and translated "Pipe" to "管道" as per the requirement.
* I kept the code examples, variable names, and function names unchanged as per the requirement.
* I translated code comments from English to Chinese as per the requirement.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__. I kept them exactly as they are in the source text.
* I kept relative links unchanged (will be processed later).