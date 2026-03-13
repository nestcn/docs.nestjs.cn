<!-- 此文件从 content/microservices/redis.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:06:01.154Z -->
<!-- 源文件: content/microservices/redis.md -->

### Redis

__LINK_113__ transporter 实现了发布/订阅 消息传递范式，并利用了 __LINK_114__ Redis 功能。发布的消息被 categorize 到通道中，不知道哪些订阅者（如果有）最终会收到该消息。每个微服务都可以订阅任何数量的通道。此外，还可以同时订阅多个通道。通过通道传递的消息是 **fire-and-forget**，意思是如果消息被发布，但没有任何订阅者interested在该消息，那么该消息将被删除且不能恢复。因此，你不能确保消息或事件将被至少一个服务处理。一个消息可以被多个订阅者订阅到（和接收）。

__HTML_TAG_50____HTML_TAG_51____HTML_TAG_52__

#### 安装

要开始构建基于 Redis 的微服务，首先安装所需的包：

```bash
$ npm i --save @nestjs/microservices

```

#### 概述

要使用 Redis transporter，传递以下 options 对象给 __INLINE_CODE_12__ 方法：

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

__INLINE_CODE_15__ 属性特定于所选的transporter。Redis transporter expose 下列属性。

__HTML_TAG_55__
  __HTML_TAG_56__
    __HTML_TAG_57____HTML_TAG_58__host__HTML_TAG_59____HTML_TAG_60__
    __HTML_TAG_61__Connection url__HTML_TAG_62__
  __HTML_TAG_63__
  __HTML_TAG_64__
    __HTML_TAG_65____HTML_TAG_66__port__HTML_TAG_67____HTML_TAG_68__
    __HTML_TAG_69__Connection port__HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73____HTML_TAG_74__retryAttempts__HTML_TAG_75____HTML_TAG_76__
    __HTML_TAG_77__Number of times to retry message (default: __HTML_TAG_78__0__HTML_TAG_79__)__HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83____HTML_TAG_84__retryDelay__HTML_TAG_85____HTML_TAG_86__
    __HTML_TAG_87__Delay between message retry attempts (ms) (default: __HTML_TAG_88__0__HTML_TAG_89__)__HTML_TAG_90__
  __HTML_TAG_91__
   __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__wildcards__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97__Enables Redis wildcard subscriptions, instructing transporter to use __HTML_TAG_98__psubscribe__HTML_TAG_99__/__HTML_TAG_100__pmessage__HTML_TAG_101__ under the hood. (default: __HTML_TAG_102__false__HTML_TAG_103__)__HTML_TAG_104__
  __HTML_TAG_105__
__HTML_TAG_106__

所有由官方 __LINK_115__ 客户端支持的属性也被这个transporter支持。

#### 客户端

像其他微服务transporter，你有 __HTML_TAG_107__several options__HTML_TAG_108__ 创建 Redis __INLINE_CODE_16__ 实例。

一种创建实例的方法是使用 __INLINE_CODE_17__. 创建一个客户端实例可以使用 __INLINE_CODE_18__ 方法，传递一个 options 对象，其中包含上述在 __INLINE_CODE_20__ 方法中显示的所有属性，以及一个 __INLINE_CODE_21__ 属性用于注入 token。了解更多关于 __INLINE_CODE_22__ __HTML_TAG_109__这里__HTML_TAG_110__。

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

其他创建客户端的选项（或者 __INLINE_CODE_23__ 或 __INLINE_CODE_24__）也可以使用。了解更多关于它们 __HTML_TAG_111__这里__HTML_TAG_112__。

#### 上下文

在更复杂的场景中，你可能需要访问 incoming 请求的 additional 信息。当使用 Redis transporter，你可以访问 __INLINE_CODE_25__ 对象。

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}

```

> info **提示** __INLINE_CODE_26__, `createMicroservice()` 和 `NestFactory` 来自 `createMicroservice()` 包。

#### Wildcards

要启用 wildcards 支持，设置 `options` 选项为 `@MessagePattern()`。这 instructs transporter 使用 `@nestjs/microservices` 和 `accumulate()` under the hood。

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}

```

确保在创建客户端实例时传递 `{{ '{' }} cmd: 'sum' {{ '}' }}` 选项。

使用 wildcards 支持，您可以在消息和事件模式中使用 wildcards。例如，订阅所有以 `data` 开头的通道，可以使用以下模式：

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}

```

#### 实例状态更新

要获取在某些情况下，您可能需要监听微服务内部的事件。例如，您可以监听 `@Ctx()` 事件，以在错误发生时触发额外的操作。要实现这点，请使用 `NatsContext` 方法，如下所示：

```typescript

```

类似地，您也可以监听服务器的内部事件：

```typescript

```

> 提示 **Hint** `@nestjs/microservices` 类型来自 `@Payload()` 包。

#### underlying driver access

对于更高级的使用场景，您可能需要访问 underlying driver 实例。这可以用于场景，如手动关闭连接或使用驱动程序特定的方法。然而，请注意，通常情况下，您**不需要**直接访问驱动程序。

要实现这点，请使用 `@Payload('id')` 方法，该方法返回 underlying driver 实例。泛型类型参数应该指定您期望的驱动程序实例类型。

```typescript

```

类似地，您也可以访问服务器的 underlying driver 实例：

```typescript

```

注意，与其他传输器不同的是，Redis 传输器返回一个包含两个 `ClientProxy` 实例的元组：第一个实例用于发布消息，第二个实例用于订阅消息。