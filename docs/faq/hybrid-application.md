<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:07:10.886Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### 混合应用程序

混合应用程序是指监听来自两个或多个不同的来源的请求。这种情况可以将 HTTP 服务器与微服务监听器结合在一起，或者只是多个不同的微服务监听器。默认的 `createMicroservice` 方法不允许多个服务器，因此在这种情况下，每个微服务都需要手动创建和启动。为了实现这个目标，可以使用 `INestApplication` 实例连接 `INestMicroservice` 实例通过 `connectMicroservice()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);

```

> info **提示** `app.listen(port)` 方法在指定地址上启动 HTTP 服务器。如果您的应用程序不处理 HTTP 请求，那么您应该使用 `app.init()` 方法。

要连接多个微服务实例，需要对每个微服务调用 `connectMicroservice()`：

```typescript
const app = await NestFactory.create(AppModule);
// microservice #1
const microserviceTcp = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: {
    port: 3001,
  },
});
// microservice #2
const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});

await app.startAllMicroservices();
await app.listen(3001);

```

要将 `@MessagePattern()` 只绑定到一个传输策略（例如 MQTT）在具有多个微服务的混合应用程序中，我们可以将第二个参数指定为类型 `Transport` 的枚举，该枚举包含了所有内置传输策略的定义。

```typescript
@MessagePattern('time.us.*', Transport.NATS)
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(@Payload() data: number[]) {
  return new Date().toLocaleTimeString(...);
}

```

> info **提示** `@Payload()`, `@Ctx()`, `Transport` 和 `NatsContext` 是从 `@nestjs/microservices` 导入的。

#### 配置共享

默认情况下，混合应用程序不会继承来自主要应用程序（基于 HTTP 的应用程序）的全局管道、拦截器、守卫和过滤器。
要继承这些配置属性从主要应用程序，需要在 `connectMicroservice()` 调用中将 `inheritAppConfig` 属性设置为可选选项对象的第二个参数，例如：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);

```