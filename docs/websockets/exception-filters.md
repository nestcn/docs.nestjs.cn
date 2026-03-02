<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:47.286Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和对应的 Web Sockets 层之间的唯一区别是，而不是抛出，应该使用。

> info **提示** 类是从包中导入的。

Nest 将处理抛出的异常，并将以下结构的消息 emit：

#### 过滤器

Web Sockets 异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用了手动实例化的方法作用域过滤器。与 HTTP 基于应用程序相同，您也可以使用网关作用域过滤器（即将网关类前缀为装饰器）。

#### 继承

通常，您将创建完全自定义的异常过滤器，满足应用程序需求。然而，有些情况下，您可能想简单地继承 **core 异常过滤器**，并根据某些因素Override 行为。

要将异常处理委托给基本过滤器，您需要扩展并调用继承的方法。

```typescript
// Example extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
```

上述实现只是一个示例，演示了该方法。您的扩展异常过滤器实现将包括您定制的 **业务逻辑**（例如，处理各种条件）。
```typescript title="Exception Filters"
```