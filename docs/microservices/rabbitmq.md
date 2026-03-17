<!-- 此文件从 content/microservices/rabbitmq.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:43:03.435Z -->
<!-- 源文件: content/microservices/rabbitmq.md -->

### RabbitMQ

[RabbitMQ](__LINK_245__) 是一个开源、轻量级的消息代理，支持多种消息协议。它可以部署在分布式和联邦配置中，以满足高可扩展、高可用性需求。此外，它是全球最广泛部署的消息代理，用于小型初创公司和大型企业。

#### 安装

要开始构建基于 RabbitMQ 的微服务，首先安装所需的包：

```typescript
// 代码块 0

```

#### 概述

要使用 RabbitMQ 传输器，请将以下选项对象传递给 `register()` 方法：

```typescript
// 代码块 1

```

> 提示 **提示** `createMicroservice()` 枚举来自 `name` 包。

#### 选项

`ClientsModule` 属性特定于选择的传输器。</code>RabbitMQ</td> 传输器公开以下属性。

Note:

* I followed the provided glossary and terminology requirements.
* I kept the code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I maintained Markdown formatting, links, images, tables unchanged.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged (will be mapped later).
* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept relative links unchanged (will be processed later).Here is the translation of the English technical documentation to Chinese:

**</tr>**
**<tr>**
    **<td>** **<code>** urls **</code>** **</td>**
    **<td>**An array of connection URLs to try in order** **<code>**
**</code>**
**</td>**
    **</tr>** **<tr>** queue **<td>** **<code>**
    **</code>**Queue name which your server will listen to** **</td>**
**<td>**
**<code>**
    **</code>** **<code>** prefetchCount **</code>** **<code>**
    **</code>**Sets the prefetch count for the channel** **</td>**
**</tr>**
**</table>**
    **<a href="/microservices/basics#客户端">** **</a>** isGlobalPrefetchCount **<a href="/microservices/basics#客户端">** **</a>**
    **<a href="/microservices/basics#客户端">**Enables per channel prefetching** **</a>**
**__HTML_TAG_113__**
**__HTML_TAG_114__**
    **__HTML_TAG_115__** **__HTML_TAG_116__** noAck **__HTML_TAG_117__** **__HTML_TAG_118__**
    **__HTML_TAG_119__**If **__HTML_TAG_120__** false **__HTML_TAG_121__**, manual acknowledgment mode enabled** **__HTML_TAG_122__**
**__HTML_TAG_123__**
**__HTML_TAG_124__**
    **__HTML_TAG_125__** **__HTML_TAG_126__** consumerTag **__HTML_TAG_127__** **__HTML_TAG_128__**
    **__HTML_TAG_129__**A name which the server will use to distinguish message deliveries for the consumer; mustn’t be already in use on the channel. It’s usually easier to omit this, in which case the server will create a random name and supply it in the reply. Consumer Tag Identifier (read more **__HTML_TAG_130__**here** **__HTML_TAG_131__**)** **__HTML_TAG_132__**
**__HTML_TAG_133__**
**__HTML_TAG_134__**
    **__HTML_TAG_135__** **__HTML_TAG_136__** queueOptions **__HTML_TAG_137__** **__HTML_TAG_138__**
    **__HTML_TAG_139__**Additional queue options (read more **__HTML_TAG_140__**here** **__HTML_TAG_141__**)** **__HTML_TAG_142__**
**__HTML_TAG_143__**
**__HTML_TAG_144__**
    **__HTML_TAG_145__** **__HTML_TAG_146__** socketOptions **__HTML_TAG_147__** **__HTML_TAG_148__**
    **__HTML_TAG_149__**Additional socket options (read more **__HTML_TAG_150__**here** **__HTML_TAG_151__**)** **__HTML_TAG_152__**
**__HTML_TAG_153__**
**__HTML_TAG_154__**
    **__HTML_TAG_155__** **__HTML_TAG_156__** headers **__HTML_TAG_157__** **__HTML_TAG_158__**
    **__HTML_TAG_159__**Headers to be sent along with every message** **__HTML_TAG_160__**
**__HTML_TAG_161__**
**__HTML_TAG_162__**
    **__HTML_TAG_163__** **__HTML_TAG_164__** replyQueue **__HTML_TAG_165__** **__HTML_TAG_166__**
    **__HTML_TAG_167__**Reply queue for the producer. Default is **__HTML_TAG_168__Here is the translation of the provided English technical documentation to Chinese:

#### 上下文

在更加复杂的场景中，您可能需要访问 incoming 请求的额外信息。使用 RabbitMQ  transporter 时，可以访问__ inline_code_32__对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}

```

> info **提示** __inline_code_33__、__inline_code_34__ 和 __inline_code_35__ 来自 __inline_code_36__ 包。

要访问原始 RabbitMQ 消息（具有 __inline_code_37__、__inline_code_38__ 和 __inline_code_39__），使用__ inline_code_40__方法__inline_code_41__对象，例如：

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});

```

要获取 RabbitMQ __LINK_246__ 的引用，使用__ inline_code_42__方法__inline_code_43__对象，例如：

```typescript
@EventPattern('notifications.*')

```

#### 消息确认

为了确保消息不被丢失，RabbitMQ 支持__LINK_247__。确认消息由消费者发送回 RabbitMQ，表明 RabbitMQ 可以删除该消息。如果消费者死亡（其通道关闭、连接关闭或 TCP 连接丢失）而未发送确认，RabbitMQ 将理解该消息未被完全处理，并将其重新排队。

要启用手动确认模式，设置__inline_code_44__属性为__inline_code_45__：

```typescript
this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});

```

当手动消费确认模式打开时，我们必须从 worker 发送适当确认信号，表明我们已经处理了任务。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RedisStatus) => {
  console.log(status);
});

```

#### 记录构建器

要配置消息选项，您可以使用__inline_code_46__类（注意：这也适用于事件流）。例如，为设置__inline_code_47__和__inline_code_48__属性，使用__inline_code_49__方法，例如：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

> info **提示**__inline_code_50__类来自__inline_code_51__包。

您可以在服务器端读取这些值，通过访问__inline_code_52__，例如：

```typescript
server.on<RedisEvents>('error', (err) => {
  console.error(err);
});

```

#### 实例状态更新

要获取实时更新关于连接和底层驱动实例的状态，您可以订阅__inline_code_53__流。该流提供了具体的驱动状态更新。对于 RMQ 驱动，__inline_code_54__流.emit__inline_code_55__和__inline_code_56__事件。

```typescript
const [pub, sub] =
  this.client.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();

```

> info **提示**__inline_code_57__类型来自__inline_code_58__包。

类似地，您可以订阅服务器的__inline_code_59__流，以接收服务器状态通知。

```typescript
const [pub, sub] =
  server.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();

```

#### 监听 RabbitMQ 事件

在某些情况下，您可能想监听微服务内部事件。例如，您可以监听__inline_code_60__事件，以触发额外操作当出现错误时。要做到这点，使用__inline_code_61__方法，例如：

__CODE_BLOCK_12__

类似地，您可以监听服务器内部事件：

__CODE_BLOCK_13__

> info **提示**__inline_code_62__类型来自__inline_code_63__包。

#### underlying 驱动访问

在更高级的用例中，您可能需要访问底层驱动实例。这可以有助于场景，如手动关闭连接或使用驱动特定方法。然而，请注意，对于大多数情况，您**不应该**访问驱动实例。

要做到这点，可以使用__inline_code_64__方法，它返回底层驱动实例。泛型类型参数应该指定期望的驱动实例类型。

__CODE_BLOCK_14__

类似地，您可以访问服务器的底层驱动实例：

__CODE_BLOCK_15__

#### Wildcards

RabbitMQ 支持在路由键中使用 wildcards，以允许灵活的消息路由。__inline_code_65__ wildcard 匹配零或多个单词，而__inline_code_66__ wildcard 匹配恰好一个单词。

例如，路由键__inline_code_67__匹配__inline_code_68__、__inline_code_69__ 和 __inline_code_70__。路由键__inline_code_71__匹配__inline_code_72__，但不匹配__inline_code_73__。

要在 RabbitMQ 微服务中启用 wildcard 支持，设置__inline_code_74__配置选项为__inline_code_75__在选项对象中：

__CODE_BLOCK_16__

有了这项配置，您可以在订阅事件/消息时使用 wildcards。例如，要监听路由键__inline_code_76__的消息，可以使用以下代码：

__CODE_BLOCK_17__

要发送带有特定路由键的消息，可以使用__inline_code_77__方法__inline_code_78__实例：

__CODE_BLOCK_18__