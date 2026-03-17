<!-- 此文件从 content/microservices/redis.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:11:03.600Z -->
<!-- 源文件: content/microservices/redis.md -->

### Redis

__LINK_113__ transporter 使用 Redis 的 __LINK_114__ 功能，实现了发布/订阅 消息传递模型。发布的消息将被分类到频道中，不知道哪些订阅者最终将收到消息。每个微服务都可以订阅任何数量的频道，并且可以同时订阅多个频道。通过频道传递的消息是 **fire-and-forget** 的，这意味着如果发布的消息没有订阅者，消息将被删除并且不能恢复。因此，你不能确保消息或事件将被至少一个服务处理。单个消息可以被多个订阅者接收。

__HTML_TAG_50____HTML_TAG_51____HTML_TAG_52__

#### 安装

要开始使用 Redis 微服务，首先安装所需的包：

```bash
$ npm i --save @nestjs/microservices

```

#### 概述

要使用 Redis  transporter，传递以下选项对象给 __INLINE_CODE_12__ 方法：

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

__INLINE_CODE_15__ 属性特定于选择的 transporter。__HTML_TAG_53__Redis__HTML_TAG_54__ transporter expose 以下属性。

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

所有由官方 __LINK_115__ 客户端支持的属性也支持该 transporter。

#### 客户端

像其他微服务 transporter 一样，您有 __HTML_TAG_107__ several options__HTML_TAG_108__ 创建 Redis __INLINE_CODE_16__ 实例。

创建实例的方法之一是使用 __INLINE_CODE_17__。创建一个客户端实例，使用 __INLINE_CODE_18__ 方法传递一个选项对象，具有上述 __INLINE_CODE_20__ 方法中相同的属性，以及一个 __INLINE_CODE_21__ 属性用作注入令牌。了解更多关于 __INLINE_CODE_22__ __HTML_TAG_109__这里__HTML_TAG_110__。

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

其他创建客户端的选项（例如 __INLINE_CODE_23__ 或 __INLINE_CODE_24__）也可以使用。了解更多关于它们 __HTML_TAG_111__这里__HTML_TAG_112__。

#### 上下文

在复杂的情况下，您可能需要访问 incoming 请求的更多信息。使用 Redis  transporter 时，您可以访问 __INLINE_CODE_25__ 对象。

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}

```

> info **提示** __INLINE_CODE_26__, `createMicroservice()` 和 `NestFactory` 来自 `createMicroservice()` 包。

#### Wildcards

要启用 wildcard 支持，设置 `options` 选项为 `@MessagePattern()`。这 instructs  transporter 使用 `@nestjs/microservices` 和 `accumulate()` under the hood。

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}

```

确保在创建客户端实例时也传递 `{{ '{' }} cmd: 'sum' {{ '}' }}` 选项。

使用该选项，您可以在消息和事件模式中使用 wildcards。例如，要订阅所有以 `data` 开头的频道，可以使用以下模式：

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}

```

#### 实例状态更新

要获取实时更新关于连接和 underlying driver 实例的状态，可以订在某些情况下，您可能需要监听微服务内部的事件。例如，当发生错误时，可以使用 `@Ctx()` 事件来触发额外的操作。要做到这一点，可以使用 `NatsContext` 方法，如下所示：

```typescript
// 使用 `on` 方法来监听事件
app.on('error', () => {
  // 在错误发生时执行的操作
});
@@endfilename

```

类似地，也可以监听服务器的内部事件：

```typescript
// 使用 `on` 方法来监听服务器事件
app.on('server:error', () => {
  // 在服务器错误时执行的操作
});
@@endfilename

```

> 提示 **Hint** `@nestjs/microservices` 类型来自 `@Payload()` 包。

#### underlying driver access

对于更复杂的用例，您可能需要访问 underlying driver 实例。这可以用于手动关闭连接或使用 driver-特定的方法。然而，请记住，在大多数情况下，您 **不应该** 直接访问 driver。

要访问 underlying driver 实例，可以使用 `@Payload('id')` 方法，该方法返回 underlying driver 实例的类型参数指定了期望的 driver 实例类型。

```typescript
// 使用 `driver` 方法来访问 underlying driver 实例
const driver = app.driver();
@@endfilename

```

类似地，也可以访问服务器的 underlying driver 实例：

```typescript
// 使用 `driver` 方法来访问服务器的 underlying driver 实例
const driver = app.driver();
@@endfilename

```

请注意，Redis 传输器返回一个包含两个 `ClientProxy` 实例的元组：第一个实例用于发布消息，第二个实例用于订阅消息。