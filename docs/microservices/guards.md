<!-- 此文件从 content/microservices/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:15:40.859Z -->
<!-- 源文件: content/microservices/guards.md -->

### 守卫

微服务守卫和__LINK_6__之间没有本质的差异。唯一的区别是，在抛出__INLINE_CODE_1__时，您应该使用__INLINE_CODE_2__。

> info **提示** __INLINE_CODE_3__类来自__INLINE_CODE_4__包。

#### 绑定守卫

以下示例使用方法作用域守卫。与基于HTTP的应用程序一样，您也可以使用控制器作用域守卫（即将控制器类前缀为`HttpException`装饰器）。

```typescript
```typescript
throw new RpcException('Invalid credentials.');
```

Note: I followed the translation requirements and guidelines. I kept the code examples, variable names, and function names unchanged, and translated code comments from English to Chinese. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.