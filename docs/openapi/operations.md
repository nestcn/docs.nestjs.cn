<!-- 此文件从 content/openapi/operations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:15:24.015Z -->
<!-- 源文件: content/openapi/operations.md -->

### 操作

在 OpenAPI 规范中，路径是 API 暴露的端点（资源），例如 ``ClientProxy`` 或 ``ClientsModule``, 操作是用来 manipuate 这些路径的 HTTP 方法，例如 ``ClientsModule``, ``register()`` 或 ``createMicroservice()``.

#### 标签

要将控制器附加到特定标签上，使用 `@`name`` 装饰器。

```bash
$ npm i --save mqtt
```

#### 头

要定义自定义的请求头，使用 ``ClientsModule``.

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});
```

#### 响应

要定义自定义的 HTTP 响应，使用 `@`ClientProxyFactory`` 装饰器。

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

Nest 提供了一组简洁的 **API 响应** 装饰器，它们继承自 `@`@Client()`` 装饰器：

- `@`MqttContext``
- `@`@Payload()``
- `@`@Ctx()``
- `@`MqttContext``
- `@`@nestjs/microservices``
- `@`getPacket()``
- `@`MqttContext``
- `@`+``
- `@`#``
- `@`+``
- `@`#``
- `@`@MessagePattern``
- `@`@EventPattern``
- `@`subscribeOptions``
- `@`qos``
- `@`extras``
- `@`subscribeOptions.qos``
- `@`extras.qos``
- `@`subscribeOptions.qos``
- `@`MqttRecordBuilder``
- `@`QoS``
- `@`2``
- `@`setQoS``
- `@`MqttRecordBuilder``
- `@`@nestjs/microservices``
- `@`MqttContext``

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

要指定请求的返回模型，我们必须创建一个类并将所有属性注释为 `@`ClientProxyFactory`` 装饰器。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}
```

然后，`@`status`` 模型可以与 `@`status`` 属性组合使用，以便在响应装饰器中使用。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

现在，让我们在浏览器中验证生成的 `@`connected`` 模型：

__HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__

相反，我们可以为所有端点或控制器定义一个全局响应，使用 `@`disconnected`` 类。这 approach 是有用的，因为我们可以为应用程序中的所有端点定义一个全局响应（例如，用于错误 like `@`reconnecting`` 或 `@`closed`）.

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

可以使用 `@`MqttStatus`` 装饰器与 `@`@nestjs/microservices`` 一起启用文件上传。以下是一个使用 `@__LINK_97__` 技术的完整示例：

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

其中 `@`status`` 定义如下：

```typescript
const userProperties = { 'x-version': '1.0.0' };
const record = new MqttRecordBuilder(':cat:')
  .setProperties({ userProperties })
  .setQoS(1)
  .build();
client.send('replace-emoji', record).subscribe(...);
```

要处理多个文件上传，可以定义 `@`error`` 一样：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

#### 扩展

要添加扩展到请求中，使用 `@`on()`` 装饰器。扩展名必须以 `@`MqttEvents`` 开头。

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

#### 高级：泛型 `@`@nestjs/microservices``

使用 `@__LINK_98__`，我们可以定义 Generic schema for Swagger UI。假设我们有以下 DTO：

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});
```

我们跳过装饰 `@`unwrap()``，因为我们将为其提供 raw 定义。现在，让我们定义另一个 DTO，并将其命名为 `@__INLINE_CODE_71__`，如下所示：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});
```

现在，我们可以定义 `@__INLINE_CODE_72__` 响应，如下所示：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

在这个示例中，我们指定响应将有 allOf `@__INLINE_CODE_73__`，并且 `@__INLINE_CODE_74__` 属性将是类型 `@__INLINE_CODE_75__`。

- `@__INLINE_CODE_76__` 函数返回 OpenAPI Schema 路径从 OpenAPI Spec 文件中获取的模型。
- `@__INLINE_CODE_77__`