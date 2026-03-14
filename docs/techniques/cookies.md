<!-- 此文件从 content/techniques/cookies.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:51:48.083Z -->
<!-- 源文件: content/techniques/cookies.md -->

### Cookies

HTTP cookie 是用户浏览器中存储的一小块数据。Cookies 设计用于网站记住状态信息。当用户再次访问网站时，cookie 会自动随请求一起发送。

#### 使用 Express (默认)

首先，安装 __LINK_49__ (TypeScript 用户需要安装类型):

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

您可以将多个选项传递给 __INLINE_CODE_12__ 中间件：

- __INLINE_CODE_13__：用于签名 Cookies 的字符串或数组。这个选项是可选的，如果不指定，中间件将不会解析签名 Cookies。如果提供了字符串，将使用该字符串作为密钥。如果提供了数组，中间件将尝试使用每个密钥解签名 Cookies。
- __INLINE_CODE_14__：一个对象，作为 __INLINE_CODE_15__ 的第二个选项。请查看 __LINK_50__ 获取更多信息。

中间件将解析请求的 __INLINE_CODE_16__ 头，并将 Cookie 数据 exposures 作为 __INLINE_CODE_17__ 属性，如果提供了密钥，则作为 __INLINE_CODE_18__ 属性。这些属性是 Cookie 名称到 Cookie 值的名称值对。

如果提供了密钥，中间件将解签名和验证任何签名 Cookie 值，并将名称值对从 __INLINE_CODE_19__ 移动到 __INLINE_CODE_20__。签名 Cookies 如果签名验证失败，将使用 __INLINE_CODE_22__ 而不是被篡改的值。

现在，您可以在路由处理程序中读取 Cookies，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
});

```

> info 提示： __INLINE_CODE_23__ 装饰器来自 __INLINE_CODE_24__，而 __INLINE_CODE_25__ 来自 __INLINE_CODE_26__ 包。

要将 Cookie 附加到出站响应中，使用 __INLINE_CODE_27__ 方法：

```typescript
BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});

```

> warning 警告：如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_28__ 选项设置为 __INLINE_CODE_29__，如上所示。更多信息请查看 __LINK_51__。

> info 提示： __INLINE_CODE_30__ 装饰器来自 __INLINE_CODE_31__，而 __INLINE_CODE_32__ 来自 __INLINE_CODE_33__ 包。

#### 使用 Fastify

首先，安装所需的包：

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

现在，您可以在路由处理程序中读取 Cookies，如下所示：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});

```

> info 提示： __INLINE_CODE_35__ 装饰器来自 __INLINE_CODE_36__，而 __INLINE_CODE_37__ 来自 __INLINE_CODE_38__ 包。

要将 Cookie 附加到出站响应中，使用 __INLINE_CODE_39__ 方法：

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

> warning 警告：如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_41__ 选项设置为 __INLINE_CODE_42__，如上所示。更多信息请查看 __LINK_53__。

> info 提示： __INLINE_CODE_43__ 装饰器来自 __INLINE_CODE_44__，而 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__ 包。

#### 创建自定义装饰器（跨平台）

为了提供一个便捷的、声明式方式来访问 incoming Cookies，我们可以创建一个 __LINK_54__。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});

```

__INLINE_CODE_47__ 装饰器将从 __INLINE_CODE_48__ 对象中提取所有 Cookies 或指定的 Cookies，并将该值填充到装饰参数中。

现在，我们可以使用装饰器在路由处理程序签名中，如下所示：

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);

```