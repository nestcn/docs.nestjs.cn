<!-- 此文件从 content/techniques/cookies.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:05:36.611Z -->
<!-- 源文件: content/techniques/cookies.md -->

### Cookies

cookie 是一个小的数据存储在用户浏览器中。cookie 被设计为网站记忆状态信息的可靠机制。用户再次访问网站时，cookie 将自动与请求一起发送。

#### 使用 Express (默认)

首先安装 __LINK_49__ (TypeScript 用户需要安装其类型):

```bash
$ npm install --save @nestjs/bullmq bullmq

```

安装完成后，在您的 __INLINE_CODE_11__ 文件中将 __INLINE_CODE_10__ 中间件应用为全局中间件。

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}

```

可以将以下选项传递给 __INLINE_CODE_12__ 中间件：

* __INLINE_CODE_13__：用于签名 cookie 的字符串或数组。该选项是可选的，如果不指定，则不会解析签名 cookie。如果提供了字符串，则使用该字符串作为秘密。如果提供了数组，则尝试使用每个秘密来解签名 cookie。
* __INLINE_CODE_14__：将传递给 __INLINE_CODE_15__ 的第二个选项。请查看 __LINK_50__ 进一步了解。

中间件将解析 __INLINE_CODE_16__ 请求头，并将 cookie 数据 exposure 作为 __INLINE_CODE_17__ 和，如果提供了秘密，作为 __INLINE_CODE_18__ 属性。这两个属性是 cookie 名称到 cookie 值的名称-值对。

如果提供了秘密，这个模块将解签名和验证任何签名 cookie 值，并将那些名称-值对从 __INLINE_CODE_19__ 移动到 __INLINE_CODE_20__。签名 cookie 值如果失败签名验证将使用 __INLINE_CODE_22__ 而不是被篡改的值。

现在，您可以在路由处理程序中读取 cookie，例如：

```typescript
BullModule.registerQueue({
  name: 'audio',
});

```

> info **提示** __INLINE_CODE_23__ 装饰器来自 __INLINE_CODE_24__，而 __INLINE_CODE_25__ 来自 __INLINE_CODE_26__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_27__ 方法：

```typescript
BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});

```

> warning **警告** 如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_28__ 选项设置为 __INLINE_CODE_29__，如上所示。阅读更多 __LINK_51__。

> info **提示** __INLINE_CODE_30__ 装饰器来自 __INLINE_CODE_31__，而 __INLINE_CODE_32__ 来自 __INLINE_CODE_33__ 包。

#### 使用 Fastify

首先安装所需的包：

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});

```

安装完成后，注册 __INLINE_CODE_34__ 插件：

```typescript
BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});

```

现在，您可以在路由处理程序中读取 cookie，例如：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});

```

> info **提示** __INLINE_CODE_35__ 装饰器来自 __INLINE_CODE_36__，而 __INLINE_CODE_37__ 来自 __INLINE_CODE_38__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_39__ 方法：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}

```

要了解更多关于 __INLINE_CODE_40__ 方法，请查看 __LINK_52__。

> warning **警告** 如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_41__ 选项设置为 __INLINE_CODE_42__，如上所示。阅读更多 __LINK_53__。

> info **提示** __INLINE_CODE_43__ 装饰器来自 __INLINE_CODE_44__，而 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__ 包。

#### 创建自定义装饰器（跨平台）

为了提供一个便捷、声明性的方式来访问 incoming cookies，我们可以创建一个 __LINK_54__。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});

```

__INLINE_CODE_47__ 装饰器将从 __INLINE_CODE_48__ 对象中提取所有 cookie 或指定名称的 cookie，并将其值 population 到装饰参数中。

现在，我们可以使用装饰器在路由处理程序签名中，例如：

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);

```