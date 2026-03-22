<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.335Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### 混合应用

混合应用是指监听来自两个或多个不同来源请求的应用。这可以将 HTTP 服务器与微服务监听器结合，甚至可以结合多个不同的微服务监听器。默认的 `createMicroservice` 方法不支持多个服务器，因此在这种情况下，每个微服务必须手动创建和启动。为此，可以通过 `connectMicroservice()` 方法将 `INestApplication` 实例与 `INestMicroservice` 实例连接起来。

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);

```

:::info 提示
`app.listen(port)` 方法在指定地址启动 HTTP 服务器。如果你的应用不处理 HTTP 请求，则应该使用 `app.init()` 方法代替。
:::

要连接多个微服务实例，需要为每个微服务调用 `connectMicroservice()`：

```typescript
const app = await NestFactory.create(AppModule);
// 微服务 #1
const microserviceTcp = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: {
    port: 3001,
  },
});
// 微服务 #2
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

在具有多个微服务的混合应用中，要将 `@MessagePattern()` 仅绑定到一个传输策略（例如 MQTT），我们可以传递 `Transport` 类型的第二个参数，这是一个定义了所有内置传输策略的枚举。

```typescript
@MessagePattern('time.us.*', Transport.NATS)
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // 例如 "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(@Payload() data: number[]) {
  return new Date().toLocaleTimeString(...);
}

```

:::info 提示
`@Payload()`、`@Ctx()`、`Transport` 和 `NatsContext` 从 `@nestjs/microservices` 导入。
:::

#### 共享配置

默认情况下，混合应用不会继承为主（基于 HTTP 的）应用配置的全局管道、拦截器、守卫和过滤器。

要从主应用继承这些配置属性，请在 `connectMicroservice()` 调用的第二个参数（可选的选项对象）中设置 `inheritAppConfig` 属性，如下所示：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);

```
