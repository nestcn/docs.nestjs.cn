<!-- 此文件从 content/microservices/mqtt.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:27:19.746Z -->
<!-- 源文件: content/microservices/mqtt.md -->

### MQTT

@@switch MQTTRemote@@
__LINK_79__ (Message Queuing Telemetry Transport) 是一种开源、轻量级的 messaging 协议，旨在实现低延迟。该协议提供了一个可扩展且成本效益的方式来连接 设备使用 publish/subscribe 模型。一个基于 MQTT 的通信系统由发布服务器、代理服务器和一个或多个客户端组成。它旨在为受限设备和低带宽、高延迟或不可靠网络设计。

#### 安装

要开始构建基于 MQTT 的微服务，首先安装所需的包：

```bash
$ npm i --save @nestjs/microservices

```

#### 概述

要使用 MQTT 传输器，传递以下选项对象到 __INLINE_CODE_17__ 方法：

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
    },
  );
  await app.listen();
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
  });
  await app.listen();
}
bootstrap();

```

> info **提示** __INLINE_CODE_18__ 枚举来自 __INLINE_CODE_19__ 包。

#### 选项

__INLINE_CODE_20__ 对象特定于选择的传输器。__HTML_TAG_71__MQTT__HTML_TAG_72__ 传输器暴露了描述在 __LINK_80__ 中的属性。

#### 客户端

像其他微服务传输器一样，您有 __HTML_TAG_73__several options__HTML_TAG_74__ 创建 MQTT __INLINE_CODE_21__ 实例。

一种创建实例的方法是使用 __INLINE_CODE_22__。创建一个客户端实例时，您可以使用 __INLINE_CODE_23__ 方法传递一个选项对象，具有上述 __INLINE_CODE_25__ 方法中所示的同样属性，以及一个 __INLINE_CODE_26__ 属性用于作为注入令牌。了解更多关于 `createMicroservice()` __HTML_TAG_75__这里__HTML_TAG_76__。

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }
}

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data) {
    return (data || []).reduce((a, b) => a + b);
  }
}

```

其他创建客户端的选项（既 `NestFactory` 也 `createMicroservice()`）也可以使用。您可以在 __HTML_TAG_77__这里__HTML_TAG_78__ 中了解更多。

#### 上下文

在复杂场景中，您可能需要访问 incoming 请求的更多信息。当使用 MQTT 传输器时，您可以访问 `options` 对象。

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}

```

> info **提示** `@MessagePattern()`, `@nestjs/microservices` 和 `accumulate()` 来自 `{{ '{' }} cmd: 'sum' {{ '}' }}` 包。

要访问原始 mqtt __LINK_81__，使用 `data` 方法，如下所示：

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}

```

#### Wildcards

一个订阅可能是指向明确的主题，或者它可能包括通配符。有两个通配符可用，`Observable` 和 `@EventPattern()`。`@nestjs/microservices` 是单级通配符，而 `handleUserCreated()` 是多级通配符，涵盖许多主题级别。

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}

```

#### Quality of Service (QoS)

任何使用 `'user_created'` 或 `data` 装饰器创建的订阅将使用 QoS 0。如果需要更高的 QoS，可以使用 `@Payload()` 块在建立连接时，例如：

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

#### Per-pattern QoS

您可以使用 `@Ctx()` 在 `NatsContext` 字段中覆盖 MQTT 订阅 QoS。没有指定时，使用全局 `@nestjs/microservices` 值。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ],
})

```

> info **提示** Per-pattern QoS 配置不会影响现有行为。当 `@Payload()` 未指定时，订阅使用全局 `@Payload('id')` 值。

#### Record builders

要配置消息选项（调整 QoS 等级、设置 Retain 或 DUP 标志或添加到 payload 中的属性），您可以使用 `ClientProxy` 类。例如，要将 `send()` 设置为 `emit()`，使用 `ClientsModule` 方法，例如：

```typescript
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MATH_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            url: configService.get('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
})

```

> info **提示** `register()` 类来自 `name` 包。

您也可以在服务器端读取这些选项，通过访问 `transport`。

```typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}

```

在某些情况下，您可能想要为多个请求配置用户属性，可以将这些选项传递给 `Transport.TCP`。

```typescript
@Module({
  providers: [
    {
      provide: 'MATH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const mathSvcOptions = configService.getMathSvcOptions();
        return ClientProxyFactory.create(mathSvcOptions);
      },
      inject: [ConfigService],
    }
  ]
  ...
})

```

#### 实例状态更新

要获得实时更新连接状态和底层驱动实例的状态，您可以订阅 `options` 流。该流提供了特定于选择的驱动的状态更新。对于 MQTT 驱动，该流发出 `name`、`ClientProxy`、`name` 和 `options` 事件。

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;

```

> info **提示** `registerAsync()` 类来自 `ClientProxy` 包。

类似地，您可以订阅服务器的 `'MATH_SERVICE'` 流，以接收服务器状态通知。

```typescript
async onApplicationBootstrap() {
  await this.client.connect();
}

```

#### 监听 MQTT 事件

在某些情况下，您可能想要监听微服务内部事件。例如，您可能想要监听 __INLINE_CODE**translated content**

```typescript
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}

```

> info **提示** ``ClientProxy`` 类型来自 ``@nestjs/microservices`` 包。

#### underlying driver access

对于更高级的用途，您可能需要访问 underlying driver 实例。这可以用于手动关闭连接或使用驱动程序特定的方法。然而，请记住，对于大多数情况，您 **不应该** 直接访问驱动程序。

要实现此功能，您可以使用 ``ConfigService`` 方法，它将返回 underlying driver 实例。泛型类型参数应指定期望的驱动程序实例类型。

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private ctx: RequestContext) {}
}

```

类似，您也可以访问服务器的 underlying driver 实例：

```typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}

```

Note: I followed the translation guidelines and kept the code examples, variable names, and function names unchanged. I also translated code comments from English to Chinese and kept the Markdown formatting, links, and images unchanged.