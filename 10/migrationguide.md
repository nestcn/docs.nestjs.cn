# 迁移指南

本文提供了一套从 Nest 8 迁移到 Nest 9 的指南。要了解更多关于 Nest 9 中添加的新功能，请查看此[链接](https://github.com/nestjs/nest/pull/9588)。

## Redis 策略（微服务）

现在 `Redis` 使用 [`ioredis`](https://github.com/luin/ioredis) 驱动，而不是 `redis` 包。 

```typescript
// Before
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.REDIS,
    options: {
      url: 'redis://localhost:6379',
    },
  },
);

// Now
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },
);
```

>? 请确保使用 ioredis 软件包

```typescript
$ npm i ioredis
```

## gRPC client 拦截器

在以前的版本中，配置属性在错误的位置公开。在 v9 中，请确保作为对象的一部分传递，请参阅[此处](https://github.com/nestjs/nest/issues/9079#issuecomment-1078744758)的示例。
`interceptors` `interceptors` `channelOptions`


## Testing 模块

以前，如果要将配置对象提供给该方法，并且使用的是默认的 HTTP 驱动程序（express），则必须按如下方式执行此操作：`TestingModule#createNestApplication`

```typescript
app = moduleFixture.createNestApplication<NestExpressApplication>(undefined, {
  rawBody: true,
});
```

在 v9 中，可以跳过第一个参数 ():`undefined`

```typescript
app = moduleFixture.createNestApplication<NestExpressApplication>({
  rawBody: true,
});

```

## Kafka message/event 处理程序

以前，Kafka 消息和事件处理程序接收有效负载作为封装的 Kafka message，其中包含 `,,,`  和一些其他属性。在 v9 中，这些有效负载会自动封装，您的处理程序将仅接收属性的值。要检索原始的 Kafka 消息，您可以使用该对象（[更多内容](https://docs.nestjs.com/microservices/kafka#context)）。

```typescript
// Before
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  console.log(`Dragon ID: ${message.value.dragonId}`);
}

// Now
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  console.log(`Dragon ID: ${message.dragonId}`);
  // Original message: "context.getMessage()"
}

```

## Fastify

Fastify 已升级到 v4。此外，所有以为前缀的核心 Fastify 插件现在都重命名。（例如： becomes 、 becomes 等）。[在此处阅读更多内容](https://github.com/fastify/fastify/issues/3856)。`fastify` —— `@fastify`    
`fastify-cookie` —— `@fastify/cookie`     
`fastify-helmet` —— `@fastify/helmet`


## @nestjs/swagger 包

包中有一些小的重大更改（并且有些包不再需要引入）。有关更多详细信息，请参阅此 [PR](https://github.com/nestjs/swagger/pull/1886)。   

`@nestjs/swagger` `swagger-ui-express` `fastify-swagger`


## 弃用
所有已弃用的方法和模块都已被删除（例如，已弃用的方法: `listenAsync()` )



>! 此版本放弃了对 Node v10 的支持。我们强烈建议使用最新的 LTS 版本。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
