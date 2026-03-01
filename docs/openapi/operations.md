<!-- 此文件从 content/openapi/operations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:22:28.976Z -->
<!-- 源文件: content/openapi/operations.md -->

### 操作

在 OpenAPI 规范中，path 是 API 暴露的端点（资源），例如 `ClientsModule` 或 `register()`，操作是用来操作这些路径的 HTTP 方法，例如 `createMicroservice()`、`name` 或 `ClientsModule`。

#### 标签

要将控制器附加到特定的标签，请使用 `ClientProxyFactory` 装饰器。

```bash
$ npm i --save nats
```

#### 头信息

要定义期望作为请求的一部分的自定义头信息，请使用 `@Client()`。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
```

#### 响应

要定义自定义的 HTTP 响应，请使用 `publish()` 装饰器。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      },
    ]),
  ]
  ...
})
```

Nest 提供了一组简化的 API 响应装饰器，继承自 `queue` 装饰器：

- `NatsContext`
- `@Payload()`
- `@Ctx()`
- `NatsContext`
- `@nestjs/microservices`
- `NatsRecordBuilder`
- `x-version`
- `setHeaders`
- `NatsRecordBuilder`
- `@nestjs/microservices`
- `NatsContext`
- `ClientProxyFactory`
- `status`
- `status`
- `connected`
- `disconnected`
- `reconnecting`
- `NatsStatus`
- `@nestjs/microservices`
- `status`
- `error`
- `on()`
- `NatsEvents`
- `@nestjs/microservices`
- `unwrap()`
- __INLINE_CODE_55__

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'cats_queue',
  },
});
```

要指定请求的返回模型，我们必须创建一个类，并将所有属性注释为 __INLINE_CODE_56__ 装饰器。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}
```

然后， __INLINE_CODE_57__ 模型可以与 __INLINE_CODE_58__ 属性结合使用，以定义响应装饰器。

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

现在，让我们在浏览器中验证生成的 __INLINE_CODE_59__ 模型：

</a>__HTML_TAG_95____HTML_TAG_96__

而不是为每个端点或控制器单独定义响应，可以为所有端点定义一个全局响应使用 __INLINE_CODE_60__ 类。这approach 对于在应用程序中定义全局响应非常有用（例如，错误处理）。

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);
```

#### 文件上传

可以使用 __INLINE_CODE_63__ 装饰器和 __INLINE_CODE_64__ 来启用文件上传特性。以下是一个使用 [read more](/microservices/basics#request-response) 技术的完整示例：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

其中 __INLINE_CODE_65__ 定义如下：

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
            headers: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}
```

要处理多个文件上传，可以将 __INLINE_CODE_66__ 定义如下：

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```

#### 扩展

要将扩展添加到请求中，请使用 __INLINE_CODE_67__ 装饰器。扩展名称必须以 __INLINE_CODE_68__ 前缀开头。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```

#### 高级：通用 __INLINE_CODE_69__

通过提供 __INLINE_CODE_70__，我们可以定义通用 schema 对 Swagger UI。假设我们有以下 DTO：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

我们跳过装饰 __INLINE_CODE_71__，因为我们将在后面提供 raw 定义。现在，让我们定义另一个 DTO，并将其命名为 __INLINE_CODE_72__，如下所示：

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});
```

在这个示例中，我们指定响应将具有 allOf __INLINE_CODE_73__，并且 __INLINE_CODE_74__ 属性将是 __INLINE_CODE_75__ 类型。

- __INLINE_CODE_76__ 函数返回 OpenAPI Schema 路径，从 OpenAPI 规范文件中获取该模型。
- __INLINE_CODE_77__ 是 OAS 3 提供的一种继承相关用例的概念。

最后，因为 __INLINE_CODE_78__ 并不直接引用任何控制器，因此 __INLINE_CODE_79__ 将无法生成对应的模型定义。因此，我们必须将其添加到 [read more](/microservices/basics#event-based) 中。例如，我们可以在控制器级别使用 __INLINE_CODE_80__ 装饰器，如下所示：

```typescript
const natsConnection = server.unwrap<import('nats').NatsConnection>();
```

如果您现在运行 Swagger，生成的 __INLINE_CODE_81__ 对于该特定端点将具有以下响应定义：

__CODE_BLOCK_15__

为了使其可重用，我们可以创建一个自定义装饰器来 __INLINE_CODE_82__，如下所示：

__CODE_BLOCK_16__

> info **Hint** __INLINE_CODE_83__ 接口和 __INLINE_CODE_84__ 函数来自 __INLINE_CODE_85__ 包。

为了确保