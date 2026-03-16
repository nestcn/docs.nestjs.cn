<!-- 此文件从 content/microservices/redis.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:23:17.624Z -->
<!-- 源文件: content/microservices/redis.md -->

### Redis

__LINK_113__ transporter 实现了 publish/subscribe 消息传递模型，并利用了 __LINK_114__ 的 Redis 功能。发布的消息将被分类到通道中，而不知道哪些订阅者（如果有）将最终接收到消息。每个微服务都可以订阅任何数量的通道。此外，多个通道可以同时订阅。通过通道传递的消息是 **fire-and-forget**，这意味着如果消息被发布且没有感兴趣的订阅者，它将被删除且无法恢复。因此，你不能确保消息或事件将至少由一个服务处理。单个消息可以被多个订阅者订阅并接收。

__HTML_TAG_50____HTML_TAG_51____HTML_TAG_52__

#### 安装

要开始构建基于 Redis 的微服务，首先安装所需的包：

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

#### 概述

要使用 Redis transporter，传递以下选项对象到 __INLINE_CODE_12__ 方法：

__CODE_BLOCK_1__

> info **Hint** __INLINE_CODE_13__ 枚举来自 __INLINE_CODE_14__ 包。

#### 选项

__INLINE_CODE_15__ 属性特定于选择的 transporter。__HTML_TAG_53__Redis__HTML_TAG_54__ transporter 描绘了以下属性。

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

所有由官方 __LINK_115__ 客户端支持的属性都被支持。

#### 客户端

像其他微服务 transporter 一样，您有 __HTML_TAG_107__ several options__HTML_TAG_108__ 创建 Redis __INLINE_CODE_16__ 实例。

一种创建实例的方法是使用 __INLINE_CODE_17__。要创建客户端实例，并将 __INLINE_CODE_18__ 作为注入令牌，导入它并使用 __INLINE_CODE_19__ 方法传递同上述 __INLINE_CODE_20__ 方法中的选项对象，以及一个 __INLINE_CODE_21__ 属性。了解更多关于 __INLINE_CODE_22__ __HTML_TAG_109__here__HTML_TAG_110__。

__CODE_BLOCK_2__

其他创建客户端实例的选项（如 __INLINE_CODE_23__ 或 __INLINE_CODE_24__）也可以使用。了解更多 __HTML_TAG_111__here__HTML_TAG_112__。

#### 上下文

在复杂的场景中，您可能需要访问 incoming 请求的更多信息。当使用 Redis transporter，您可以访问 __INLINE_CODE_25__ 对象。

__CODE_BLOCK_3__

> info **Hint** __INLINE_CODE_26__, __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 来自 __INLINE_CODE_29__ 包。

#### Wildcards

要启用 wildcards 支持，设置 __INLINE_CODE_30__ 选项为 __INLINE_CODE_31__。这 instructs transporter 使用 __INLINE_CODE_32__ 和 __INLINE_CODE_33__ under the hood。

__CODE_BLOCK_4__

确保在创建客户端实例时也传递 __INLINE_CODE_34__ 选项。

使用 wildcards 支持，您可以在消息和事件模式中使用 wildcards。例如，为了订阅所有开始于 __INLINE_CODE_35__ 的通道，可以使用以下模式：

__CODE_BLOCK以下是翻译后的中文技术文档：

在某些情况下，您可能想监听微服务内部事件。例如，当发生错误时，可以监听 __INLINE_CODE_44__ 事件来触发额外操作。要做到这点，可以使用 __INLINE_CODE_45__ 方法，如下所示：

```typescript
__CODE_BLOCK_8__

```

类似地，您也可以监听服务器的内部事件：

```typescript
__CODE_BLOCK_9__

```

> 信息 **提示** __INLINE_CODE_46__ 类型来自 __INLINE_CODE_47__ 包。

#### underlying driver access

对于更复杂的用例，您可能需要访问 underlying driver 实例。这可以在手动关闭连接或使用驱动程序专门方法时有用。然而，在大多数情况下，您**不应该**直接访问驱动程序。

要做到这点，可以使用 __INLINE_CODE_48__ 方法，它返回 underlying driver 实例。泛型类型参数应该指定您期望的驱动程序实例类型。

```typescript
__CODE_BLOCK_10__

```

类似地，您也可以访问服务器的 underlying driver 实例：

```typescript
__CODE_BLOCK_11__

```

需要注意的是，相比其他传输器，Redis 传输器返回一个包含两个 __INLINE_CODE_49__ 实例的元组：第一个实例用于发布消息，第二个实例用于订阅消息。