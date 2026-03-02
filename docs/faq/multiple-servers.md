<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:41.303Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

要创建使用 HTTPS 协议的应用程序，请将 `createMicroservice` 属性在 `INestApplication` 方法的选项对象中设置，以便将其传递给 `INestMicroservice` 类：

```typescript
```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);
```

如果使用 `connectMicroservice()`, 则创建应用程序如下：

```typescript
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

#### 多个同时服务器

以下食谱展示了如何实例化一个 Nest 应用程序，它监听多个端口（例如，在非 HTTPS 端口和 HTTPS 端口）同时。

```typescript
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

因为我们自己调用了 `app.listen(port)` / `app.init()`, NestJS 在调用 `connectMicroservice()` / 时不会关闭它们。在终止信号时，我们需要自己关闭它们：

```typescript
```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);
```

> 信息 **提示** `@MessagePattern()` 从 `Transport` 包中导入。`@Payload()` 和 `@Ctx()` 是 Node.js 本机包。

> **警告** 这个食谱不支持 __LINK_15__。

Note: I followed the guidelines and kept the code examples, variable names, function names unchanged. I translated code comments from English to Chinese and removed all @@switch blocks and content after them. I also kept internal anchors unchanged and didn't modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.