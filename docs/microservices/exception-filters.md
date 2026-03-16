<!-- 此文件从 content/microservices/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:21:45.643Z -->
<!-- 源文件: content/microservices/exception-filters.md -->

### 异常过滤器

HTTP 层和对应的微服务层唯一的区别是，而不是抛出__INLINE_CODE_5__，你应该使用__INLINE_CODE_6__。

```bash
$ npm i --save ioredis

```

> 信息 **提示** 类从 __INLINE_CODE_8__ 包中被导入。

Nest 将处理抛出的异常并将 __INLINE_CODE_9__ 对象返回，以以下结构：

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

微服务异常过滤器与 HTTP 异常过滤器类似，唯一的小区别是__INLINE_CODE_10__ 方法必须返回__INLINE_CODE_11__。

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

> 警告 **警告** 使用 __LINK_16__ 时，global 微服务异常过滤器默认不被启用。

以下示例使用了手动实例化的方法作用域过滤器。与 HTTP 基于应用程序相同，你也可以使用 controller作用域过滤器（即在控制器类前添加`createMicroservice()` 装饰器）。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}

```

#### 继承

通常，你将创建完全定制的异常过滤器，满足你的应用程序要求。然而，有些情况下，你可能想简单地扩展 **core 异常过滤器**，并根据某些因素Override行为。

为了委派异常处理到基本过滤器，你需要继承 `Transport` 并调用继承的 `@nestjs/microservices` 方法。

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});

```

上述实现只是一个 shell，展示了这种方法。你的扩展异常过滤器实现将包括你的定制 **业务逻辑**（例如，处理各种情况）。