<!-- 此文件从 content/openapi/operations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:20.853Z -->
<!-- 源文件: content/openapi/operations.md -->

### 操作

OpenAPI 规范中，路径是 API 暴露的端点（资源），如 `ClientProxy` 或 `ClientsModule`，操作是用于 manipulation 这些路径的 HTTP 方法，如 `ClientsModule`、`register()` 或 `createMicroservice()`。

#### 标签

要将控制器附加到特定标签上，使用 `name` 装饰器。

```bash
$ npm i --save mqtt
```

#### 头信息

要定义自定义的请求头信息，使用 `ClientsModule`。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});
```

#### 响应

要定义自定义的 HTTP 响应，使用 `ClientProxyFactory` 装饰器。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
        }
      },
    ]),
  ]
  ...
})
```

Nest 提供了一个简洁的 API 响应装饰器集，继承自 `@Client()` 装饰器：

- `MqttContext`
- `@Payload()`
- `@Ctx()`
- `MqttContext`
- `@nestjs/microservices`
- `getPacket()`
- `MqttContext`
- `+`
- `#`
- `+`
- `#`
- `@MessagePattern`
- `@EventPattern`
- `subscribeOptions`
- `qos`
- `extras`
- `subscribeOptions.qos`
- `extras.qos`
- `subscribeOptions.qos`
- `MqttRecordBuilder`
- `QoS`
- `2`
- `setQoS`
- `MqttRecordBuilder`
- `@nestjs/microservices`
- `MqttContext`

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

要指定请求的返回模型，我们需要创建一个类并将所有属性标注为 `ClientProxyFactory` 装饰器。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}
```

然后，可以将 `status` 模型与 `status` 属性结合使用，以便在响应装饰器中使用。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

现在，让我们在浏览器中验证生成的 `connected` 模型：

__HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__

而不是为每个端点或控制器单独定义响应，可以定义一个全局响应来适用于所有端点，使用 `disconnected` 类。这种方法在您想要为所有端点定义一个全局响应时非常有用（例如，捕捉 `reconnecting` 或 `closed` 异常）。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
    subscribeOptions: {
      qos: 2
    },
  },
});
```

#### 文件上传

可以使用 `MqttStatus` 装饰器来启用文件上传，合并 `@nestjs/microservices`。以下是一个使用 __LINK_97__ 技术的完整示例：

```typescript
@EventPattern('critical-events', { extras: { qos: 2 } })
handleCriticalEvent(@Payload() data: any) {
  // This subscription uses QoS 2
}

@EventPattern('metrics', { extras: { qos: 0 } })
handleMetrics(@Payload() data: any) {
  // This subscription uses QoS 0
}

@Bind(Payload())
@EventPattern('metrics', { extras: { qos: 0 } })
handleMetrics(data) {
  // This subscription uses QoS 0
}
```

其中 `status` 定义如下：

```typescript
const userProperties = { 'x-version': '1.0.0' };
const record = new MqttRecordBuilder(':cat:')
  .setProperties({ userProperties })
  .setQoS(1)
  .build();
client.send('replace-emoji', record).subscribe(...);
```

要处理多个文件上传，可以定义 `error`如下：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

#### 扩展

要将扩展添加到请求中，使用 `on()` 装饰器。扩展名称必须以 `MqttEvents` 前缀开头。

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.MQTT,
          options: {
            url: 'mqtt://localhost:1833',
            userProperties: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}
```

#### 高级：通用 `@nestjs/microservices`

使用提供 `unwrap()`，我们可以定义通用架构以供 Swagger UI 使用。假设我们有以下 DTO：

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});
```

我们跳过 __INLINE_CODE_71__ 的装饰，因为我们将在后面提供一个 raw 定义。现在，让我们定义另一个 DTO 并命名为 __INLINE_CODE_72__，如下所示：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});
```

这样，我们可以定义一个 __INLINE_CODE_73__ 响应，如下所示：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

在这个示例中，我们指定响应将具有 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 属性。

- __INLINE_CODE_76__ 函数返回 OpenAPI 架构路径，从 OpenAPI 规范文件中获取给定模型。
- __INLINE_CODE_77__ 是 OAS 3 提供的继承相关用例的概念。

最后，因为 __INLINE_CODE_78__ 不是任何控制器直接引用，我们不能生成对应的模型定义。因此，我们必须将其添加为一个 __LINK_99__。例如，我们可以使用 __INLINE_CODE_80__ 装饰器在控制器级别，如下所示：

```typescript
server.on<MqttEvents>('error', (err) => {
  console.error(err);
});
```

如果您现在运行 Swagger，生成的 __INLINE_CODE_81__ 将具有以下响应定义：

```typescript
const mqttClient = this.client.unwrap<import('mqtt').MqttClient>();
```

为了使其可重用，我们可以创建一个自定义装饰器来 __INLINE_CODE_82__，如下所示：

```typescript
const mqttClient = server.unwrap<import('mqtt').MqttClient>();
```

> info **提示** __INLINE_CODE_83__ 接口和