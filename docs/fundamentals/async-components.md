<!-- 此文件从 content/fundamentals/async-components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:26:47.291Z -->
<!-- 源文件: content/fundamentals/async-components.md -->

### 异步提供者

在某些情况下，应用程序的启动可能需要延迟，直到某些异步任务完成。例如，您可能不想直到与数据库建立连接后才开始接受请求。可以使用异步提供者来实现这个功能。

语法是使用 `__INLINE_CODE_1__` 和 `__INLINE_CODE_2__` 语法。工厂函数返回 `__INLINE_CODE_3__`，工厂函数可以 `httpsOptions` 异步任务。Nest 将等待 promise 解决后再实例化依赖于该提供者的类。

```typescript
```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(AppModule, {
  httpsOptions,
});
await app.listen(process.env.PORT ?? 3000);
```

> 提示 **信息** 了解自定义提供者语法更多信息 __LINK_6__。

#### 注入

异步提供者可以像任何其他提供者一样通过令牌注入到其他组件中。在上面的示例中，您将使用 ``create()`` 构造函数。

#### 示例

__LINK_7__ 中有一个异步提供者的更大示例。

Note: I've kept the placeholders as they are, as per the requirements.