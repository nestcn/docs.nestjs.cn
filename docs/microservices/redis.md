<!-- 此文件从 content/microservices/redis.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:26:50.354Z -->
<!-- 源文件: content/microservices/redis.md -->

### Redis

__LINK_113__ transporter 使用 Redis 的 __LINK_114__ 功能来实现 publish/subscribe 消息传递模式。发布的消息将被 categorize 到 channels 中，而不知道哪些订阅者将最终接收到消息。每个微服务都可以订阅任意数量的 channels。同时，也可以订阅多个 channels。通过 channels 传递的消息是 **fire-and-forget** 的，这意味着如果一个消息被发布，但没有任何订阅者interested 在它，那么这个消息将被删除并且不能被恢复。因此，你不能保证消息或事件将被至少一个服务处理。一个消息可以被多个订阅者订阅和接收。

__HTML_TAG_50__<p>__HTML_TAG_51__Redis__HTML_TAG_52__</p>__

#### 安装

要开始构建基于 Redis 的微服务，首先安装所需的包：

```bash
$ npm i --save @nestjs/microservices

```

#### 概述

要使用 Redis Transporter，传递以下选项对象给 __INLINE_CODE_12__ 方法：

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

> info **提示** __INLINE_CODE_13__ 枚举来自 __INLINE_CODE_14__ 包。

#### 选项

__INLINE_CODE_15__ 属性特定于所选的 Transporter。Redis Transporter expose 以下属性。

__HTML_TAG_55__
  __HTML_TAG_56__
    __HTML_TAG_57__host__HTML_TAG_60__
    __HTML_TAG_61__Connection url__HTML_TAG_62__
  __HTML_TAG_63__
  __HTML_TAG_64__
    __HTML_TAG_65__port__HTML_TAG_68__
    __HTML_TAG_69__Connection port__HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__retryAttempts__HTML_TAG_76__
    __HTML_TAG_77__Number of times to retry message (default: __HTML_TAG_78__0__HTML_TAG_79__)__HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__retryDelay__HTML_TAG_86__
    __HTML_TAG_87__Delay between message retry attempts (ms) (default: __HTML_TAG_88__0__HTML_TAG_89__)__HTML_TAG_90__
  __HTML_TAG_91__
   __HTML_TAG_92__
    __HTML_TAG_93__wildcards__HTML_TAG_96__
    __HTML_TAG_97__Enables Redis wildcard subscriptions, instructing transporter to use __HTML_TAG_98__psubscribe__HTML_TAG_99__/__HTML_TAG_100__pmessage__HTML_TAG_101__ under the hood. (default: __HTML_TAG_102__false__HTML_TAG_103__)__HTML_TAG_104__
  __HTML_TAG_105__
__HTML_TAG_106__

官方 __LINK_115__ 客户端支持的所有属性也支持这个 Transporter。

#### 客户端

像其他微服务 Transporter 一样，你有 __HTML_TAG_107__several options__HTML_TAG_108__ 来创建一个 Redis __INLINE_CODE_16__ 实例。

创建实例的一种方法是使用 __INLINE_CODE_17__。创建一个客户端实例，传递一个 options 对象，其中包含的属性与 __INLINE_CODE_20__ 方法中的属性相同，包括一个 __INLINE_CODE_21__ 属性来使用作 injection token。更多关于 __INLINE_CODE_22__ __HTML_TAG_109__here__HTML_TAG_110__。

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

其他创建客户端的选项（__INLINE_CODE_23__ 或 __INLINE_CODE_24__）也可以使用。可以在 __HTML_TAG_111__here__HTML_TAG_112__ 中阅读它们。

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。使用 Redis Transporter 时，可以访问 __INLINE_CODE_25__ 对象。

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}

```

> info **提示** __INLINE_CODE_26__, `createMicroservice()` 和 `NestFactory` 来自 `createMicroservice()` 包。

#### Wildcards

要启用 wildcards 支持，设置 `options` 选项为 `@MessagePattern()`。这 instructs Transporter 使用 `@nestjs/microservices` 和 `accumulate()` under the hood。

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}

```

确保在创建客户端实例时传递 `{{ '{' }} cmd: 'sum' {{ '}' }}` 选项。

启用 wildcards 支持后，您可以在 消息和事件模式中使用 wildcards。例如，要订阅所有 channels，starting with `data`，可以使用以下模式：

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}

```

#### 实例状态更新

要获取连接和 underlying driver 实例状态的实时更新，可以订阅 `async` 流。这个流提供了与所选驱动器相关的状态更新。对于 Redis 驱动器，`Observable`以下是翻译后的中文技术文档：

在某些情况下，您可能想要监听微服务内部的事件。例如，当错误发生时，您可以监听`@Ctx()`事件来触发额外的操作。要实现此操作，请使用`NatsContext`方法，如下所示：

```

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

```

类似地，您也可以监听服务器的内部事件：

```

```typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}

```

```

> 提示 **Hint** `@nestjs/microservices`类型来自`@Payload()`包。

#### underlying driver access

对于更高级的用例，您可能需要访问 underlying driver 实例。这可以用于手动关闭连接或使用驱动程序特定的方法。然而，除非您需要访问驱动程序实例，否则通常情况下您 **不需要** 访问驱动程序实例。

要访问 underlying driver 实例，您可以使用`@Payload('id')`方法，该方法返回 underlying driver 实例。泛型类型参数应该指定您期望的驱动程序实例类型。

```

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

```

类似地，您也可以访问服务器的 underlying driver 实例：

```

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;

```

```

请注意，相比其他传输器，Redis 传输器返回两个`ClientProxy`实例：第一个实例用于发布消息，第二个实例用于订阅消息。

Note: I have kept the placeholders unchanged as per the requirements.