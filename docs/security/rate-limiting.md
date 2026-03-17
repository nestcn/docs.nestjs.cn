<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:45:39.645Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 速率限制

保护应用程序免受 brute-force 攻击的一种常见技术是 **速率限制**。要开始，请安装 `@Payload()` 包。

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);

```

安装完成后，可以使用 `@Ctx()` 配置像其他 Nest 包一样，使用 `Transport` 或 `NatsContext` 方法。

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

上述设置将设置全局选项，包括 `@nestjs/microservices`、时间到期毫秒数和 `inheritAppConfig`，对应用程序的路由进行限制。

一旦模块被导入，then 可以选择如何绑定 `connectMicroservice()`。任何在 __LINK_226__ 部分提到的绑定方式都可以。例如，如果您想将守卫绑定到全局，可以在模块中添加以下提供程序：

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

#### 多个 Throttler 定义

可能会出现需要设置多个限制定义的情况，例如每秒不可超过 3 次，10 秒不可超过 20 次，1 分钟不可超过 100 次。要实现，可以在数组中设置名为的选项，这些选项可以在 __INLINE_CODE_20__ 和 __INLINE_CODE_21__ 装饰器中引用以更改选项。

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);

```

#### 自定义

可能会出现需要将守卫绑定到控制器或全局，但同时想要禁用速率限制的某些端点的情况。可以使用 __INLINE_CODE_22__ 装饰器来negate throttler 对于整个类或单个路由。__INLINE_CODE_23__ 装饰器也可以传入一个对象，以便在某些情况下排除大多数控制器，但不是每个路由。 如果没有传入对象，默认将使用 __INLINE_CODE_24__。

__CODE_BLOCK_4__

__INLINE_CODE_25__ 装饰器可以用来跳过路由或类，也可以用来negate 跳过路由在类中。

__CODE_BLOCK_5__

还有一些 __INLINE_CODE_26__ 装饰器，可以用来override __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 设置在全局模块中，以提供更紧密或松散的安全选项。这装饰器可以用于类或函数。从版本 5 开始，这装饰器将接受一个对象，其中包含 throttler 集的名称和 limit 和 ttl 键的整数值。如果没有提供名称，使用 __INLINE_CODE_29__。需要以以下方式配置：

__CODE_BLOCK_6__

#### 代理

如果您的应用程序在代理服务器后运行，请确保配置 HTTP 适配器以信任代理服务器。可以查看 __LINK_227__ 和 __LINK_228__ 中的特定 HTTP 适配器选项以启用 __INLINE_CODE_30__ 设置。

以下是一个示例，演示如何为 Express 适配器启用 __INLINE_CODE_31__：

__CODE_BLOCK_7__

启用 __INLINE_CODE_32__ 可以从 __INLINE_CODE_33__ 头中检索原始 IP 地址。还可以自定义应用程序的行为通过重写 __INLINE_CODE_34__ 方法来提取 IP 地址，而不是依赖 __INLINE_CODE_35__。以下是一个示例，演示如何实现这两种适配器：

__CODE_BLOCK_8__

> info **提示**可以在 __LINK_229__ 和 __LINK_230__ 中找到 __INLINE_CODE_36__ 请求对象的 API。

#### WebSocket

这个模块可以与 WebSocket 一起工作，但是需要一些类的扩展。可以扩展 __INLINE_CODE_37__ 并重写 __INLINE_CODE_38__ 方法：

__CODE_BLOCK_9__

> info **提示**如果您使用 ws，需要将 __INLINE_CODE_39__ 替换为 __INLINE_CODE_40__

使用 WebSocket 时需要注意以下几点：

- cannot register guard with __INLINE_CODE_41__ or __INLINE_CODE_42__
- 当到达限制时，Nest 将 emit __INLINE_CODE_43__ 事件，确保有一个监听器准备好了

> info **提示**如果您使用 __INLINE_CODE_44__ 包，可以使用 __INLINE_CODE_45__。

#### GraphQL

__INLINE_CODE_46__ 也可以用于 GraphQL 请求。同样，可以扩展守卫，但这次将重写 __INLINE_CODE_47__ 方法：

__CODE_BLOCK_10__

#### 配置

以下选项是 __INLINE_CODE_48__ 选项数组中有效的：

(Note: Please let me know if you need any further assistance)Here is the translated Chinese technical documentation:

```

__HTML_TAG_78__
  __HTML_TAG_79__
    __HTML_TAG_80____HTML_TAG_81__name__HTML_TAG_82____HTML_TAG_83__
    __HTML_TAG_84__为内部跟踪的速率限制器集的名称。默认为 __HTML_TAG_85__default__HTML_TAG_86__ 如果没有传递__HTML_TAG_87__
  __HTML_TAG_88__
  __HTML_TAG_89__
    __HTML_TAG_90____HTML_TAG_91__ttl__HTML_TAG_92____HTML_TAG_93__
    __HTML_TAG_94__每个请求在存储中保持的毫秒数__HTML_TAG_95__
  __HTML_TAG_96__
  __HTML_TAG_97__
    __HTML_TAG_98____HTML_TAG_99__limit__HTML_TAG_100____HTML_TAG_101__
    __HTML_TAG_102__在 TTL 限制内的最大请求数__HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106____HTML_TAG_107__blockDuration__HTML_TAG_108____HTML_TAG_109__
    __HTML_TAG_110__请求将被阻塞的毫秒数__HTML_TAG_111__
  __HTML_TAG_112__
  __HTML_TAG_113__
    __HTML_TAG_114____HTML_TAG_115__ignoreUserAgents__HTML_TAG_116____HTML_TAG_117__
    __HTML_TAG_118__要忽略的用户代理数组__HTML_TAG_119__
  __HTML_TAG_120__
  __HTML_TAG_121__
    __HTML_TAG_122____HTML_TAG_123__skipIf__HTML_TAG_124____HTML_TAG_125__
    __HTML_TAG_126__一个函数，用于在 ExecutionContext 中返回一个 boolean 值，以短路速率限制逻辑。类似于 __HTML_TAG_127__@SkipThrottler()__HTML_TAG_128__，但基于请求__HTML_TAG_129__
  __HTML_TAG_130__
__HTML_TAG_131__

如果需要设置存储或在更高级别上使用上述选项，可以通过 __INLINE_CODE_49__ 选项键将选项传递，并使用以下表格

__HTML_TAG_136__
  __HTML_TAG_137__
    __HTML_TAG_138____HTML_TAG_139__storage__HTML_TAG_140____HTML_TAG_141__
    __HTML_TAG_142__自定义存储服务，以便跟踪速率限制。 __HTML_TAG_143__查看这里。__HTML_TAG_144____HTML_TAG_145__
  __HTML_TAG_146__
  __HTML_TAG_147__
    __HTML_TAG_148____HTML_TAG_149__ignoreUserAgents__HTML_TAG_150____HTML_TAG_151__
    __HTML_TAG_152__要忽略的用户代理数组__HTML_TAG_153__
  __HTML_TAG_154__
  __HTML_TAG_155__
    __HTML_TAG_156____HTML_TAG_157__skipIf__HTML_TAG_158____HTML_TAG_159__
    __HTML_TAG_160__一个函数，用于在 ExecutionContext 中返回一个 boolean 值，以短路速率限制逻辑。类似于 __HTML_TAG_161__@SkipThrottler()__HTML_TAG_162__，但基于请求__HTML_TAG_163__
  __HTML_TAG_164__
  __HTML_TAG_165__
    __HTML_TAG_166____HTML_TAG_167__throttlers__HTML_TAG_168____HTML_TAG_169__
    __HTML_TAG_170__一个速率限制器集数组，使用上述表格定义__HTML_TAG_171__
  __HTML_TAG_172__
  __HTML_TAG_173__
    __HTML_TAG_174____HTML_TAG_175__errorMessage__HTML_TAG_176____HTML_TAG_177__
    __HTML_TAG_178__字符串或 ExecutionContext 和 ThrottlerLimitDetail 的函数，返回一个字符串，override 默认速率限制错误消息__HTML_TAG_179__
  __HTML_TAG_180__
  __HTML_TAG_181__
    __HTML_TAG_182____HTML_TAG_183__getTracker__HTML_TAG_184____HTML_TAG_185__
    __HTML_TAG_186__一个函数，用于在 Request 中返回一个字符串，以override 默认 getTracker 方法逻辑__HTML_TAG_Here is the translation of the English technical documentation to Chinese:

内存缓存是内置的存储方式，它将跟踪直到请求超时时间（由全局选项设置）超时的请求。您可以将自己的存储选项添加到 __INLINE_CODE_55__ 的 __INLINE_CODE_56__ 中，只要该类实现了 __INLINE_CODE_57__ 接口。

对于分布式服务器，您可以使用 __LINK_231__ 社区存储提供商来获取单个真实来源。

> 信息 **注意** __INLINE_CODE_58__ 可以从 __INLINE_CODE_59__ 导入。

#### 时间帮助器

如果您 prefers 使用可读性更好的时间 helpers，它们将在 __INLINE_CODE_60__ 中导出五个不同的帮助器，分别是 __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__。要使用它们，简单地调用 __INLINE_CODE_66__ 或其他帮助器，并返回正确的毫秒数。

#### migraiton 指南

对于大多数人，包装选项数组将足够。

如果您使用的是自定义存储，应该将您的 __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 包装在数组中，并将其分配给选项对象的 __INLINE_CODE_69__ 属性。

任何 __INLINE_CODE_70__ 装饰器都可以用来绕过特定路由或方法的限流。它接受可选的布尔参数， defaults to __INLINE_CODE_71__.这在您想在特定端点上跳过速率限制时非常有用。

任何 __INLINE_CODE_72__ 装饰器现在都应该接受一个对象，其中的字符串键与限流上下文名称相关（如果没有名称，则使用 __INLINE_CODE_73__），值为对象具有 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 键的对象。

> 警告 **重要** __INLINE_CODE_76__ 现在以毫秒为单位。如果您想将ttl保留在秒中以提高可读性，请使用该包中的 __INLINE_CODE_77__ 帮助器，它将将ttl乘以1000以将其转换为毫秒。

更多信息，请参阅 __LINK_232__。