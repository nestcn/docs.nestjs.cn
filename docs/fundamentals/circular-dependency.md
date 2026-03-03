<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:49.430Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类相互依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 之间的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但是在某些情况下你无法避免。在这种情况下，Nest 可以通过两种方式来解决循环依赖之间的提供者实例。 在本章中，我们将描述使用 **forward referencing** 技术和使用 **ModuleRef** 类来从 DI 容器中检索提供者实例作为另外一种技术。

我们还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖也可能是使用 "barrel files"/index.ts 文件来组合导入的结果。建议在模块/提供者类中不要使用 barrel files。例如，在同一目录下使用 barrel files 时，不能将 `createMicroservice` 文件导入 `INestApplication` 文件以导入 `INestMicroservice` 文件。更多信息请见 __LINK_21__。

#### 前向引用

**前向引用**允许 Nest 参考尚未定义的类使用 `connectMicroservice()` 实用函数。例如，如果 `app.listen(port)` 和 `app.init()` 依赖于对方，双方可以使用 `connectMicroservice()` 和 `@MessagePattern()` 实用函数来解决循环依赖。否则，Nest won't instantiate them，因为所有必要的元数据都不可用。下面是一个示例：

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);
```

> 提示 **提示** `Transport` 函数来自 `@Payload()` 包。

这便是关系的一半。现在让我们来处理 `@Ctx()`：

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

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数被调用首先。拥有循环依赖的提供者可以导致 undefined 依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `NatsContext` 的alternative 是将代码重构并使用 `@nestjs/microservices` 类来检索提供者实例在循环关系的另一侧。了解更多关于 `inheritAppConfig` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，使用相同的 `connectMicroservice()` 实用函数在模块关联的两侧。例如：

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

这便是关系的一半。现在让我们来处理 __INLINE_CODE_20__：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);
```