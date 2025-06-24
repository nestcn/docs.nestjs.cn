### 混合应用

混合应用是指能够监听来自两个或多个不同来源请求的应用。它可以组合 HTTP 服务器与微服务监听器，甚至只是多个不同的微服务监听器。默认的 `createMicroservice` 方法不支持多个服务器，因此在这种情况下，每个微服务都必须手动创建和启动。为此，可以通过 `connectMicroservice()` 方法将 `INestApplication` 实例与 `INestMicroservice` 实例连接起来。

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);
```

> info **注意** `app.listen(port)` 方法会在指定地址启动 HTTP 服务器。如果您的应用不处理 HTTP 请求，则应改用 `app.init()` 方法。

要连接多个微服务实例，需为每个微服务调用 `connectMicroservice()` 方法：

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

要将 `@MessagePattern()` 绑定到混合应用中多个微服务里的单一传输策略（例如 MQTT），我们可以传入类型为 `Transport` 的第二个参数，这是一个包含所有内置传输策略定义的枚举。

```typescript
@@filename()
@MessagePattern('time.us.*', Transport.NATS)
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(@Payload() data: number[]) {
  return new Date().toLocaleTimeString(...);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('time.us.*', Transport.NATS)
getDate(data, context) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@Bind(Payload(), Ctx())
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(data, context) {
  return new Date().toLocaleTimeString(...);
}
```

> info **提示**`@Payload()`、`@Ctx()`、`Transport` 和 `NatsContext` 都是从 `@nestjs/microservices` 导入的。

#### 共享配置

默认情况下，混合应用不会继承为主应用（基于 HTTP）配置的全局管道、拦截器、守卫和过滤器。要从主应用继承这些配置属性，需在 `connectMicroservice()` 调用的第二个参数（可选配置对象）中设置 `inheritAppConfig` 属性，如下所示：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true }
);
```
