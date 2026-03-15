<!-- 此文件从 content/microservices/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:25:12.205Z -->
<!-- 源文件: content/microservices/exception-filters.md -->

### 异常过滤器

HTTP 层和微服务层之间唯一的区别在于，而不是抛出__INLINE_CODE_5__,您应该使用__INLINE_CODE_6__。

```bash
$ npm i --save ioredis

```

> info **提示**类是从__INLINE_CODE_8__包中导入的。

Nest 将处理抛出的异常并将返回__INLINE_CODE_9__对象，该对象具有以下结构：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});

```

#### 过滤器

微服务异常过滤器与 HTTP 异常过滤器类似，只有一个小区别。__INLINE_CODE_10__方法必须返回__INLINE_CODE_11__。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
    ]),
  ]
  ...
})

```

> warning **警告**使用__LINK_16__时，全球微服务异常过滤器默认 disabled。

以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，您也可以使用控制器作用域过滤器（即在控制器类前加上`createMicroservice()`装饰器）。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}

```

#### 继承

通常，您将创建完全自定义的异常过滤器，满足应用程序的需求。然而，有些情况下，您可能想简单地扩展**核心异常过滤器**，并根据某些因素重写行为。

为了将异常处理委派给基础过滤器，您需要继承`Transport`并调用继承的`@nestjs/microservices`方法。

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});

```

上述实现只是一个 shell，展示了该方法。您的扩展异常过滤器实现将包括您定制的**业务逻辑**（例如，处理各种条件）。