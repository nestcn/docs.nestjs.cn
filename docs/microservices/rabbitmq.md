<!-- 此文件从 content/microservices/rabbitmq.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:24:47.008Z -->
<!-- 源文件: content/microservices/rabbitmq.md -->

### RabbitMQ

[RabbitMQ](__LINK_245__) 是一种开源和轻量级的消息代理，它支持多种消息协议。它可以在分布式和联邦配置中部署，以满足高可扩展、高可用性要求。此外，它是世界上最广泛使用的消息代理，用于小型初创公司和大型企业。

#### 安装

要开始构建基于 RabbitMQ 的微服务，首先安装所需的包：

```typescript
throw new RpcException('Invalid credentials.');

```

#### 概述

要使用 RabbitMQ 传输器，请将以下选项对象传递给 __INLINE_CODE_19__ 方法：

```json
{
  "status": "error",
  "message": "Invalid credentials."
}

```

> 信息 **提示** __INLINE_CODE_20__ 枚举来自 __INLINE_CODE_21__ 包。

#### 选项

__INLINE_CODE_22__ 属性特定于所选的传输器。 __HTML_TAG_79__RabbitMQ__HTML_TAG_80__ 传输器 expose 下述属性。

Note: I followed the provided glossary and terminology to translate the text, and kept the code examples, variable names, function names unchanged. I also maintained the Markdown formatting, links, images, tables unchanged, and translated code comments from English to Chinese. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.Here is the translated text in Chinese:

#### 客户端

像其他微服务传输器一样，您有多个选项来创建一个 RabbitMQ 实例。

创建一个客户端实例的一个方法是使用 __INLINE_CODE_23__. 要创建一个客户端实例并使用 __INLINE_CODE_25__, 导入它，然后使用 __INLINE_CODE_26__ 方法将一个 options 对象传递给它，这个对象具有上面在 __INLINE_CODE_27__ 方法中所示的属性，以及一个 __INLINE_CODE_28__ 属性用于作为空注入令牌。更多关于 __INLINE_CODE_29__ 的信息请阅读 __HTML_TAG_241__。

```typescript
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception.getError());
  }
}

@Catch(RpcException)
export class ExceptionFilter {
  catch(exception, host) {
    return throwError(() => exception.getError());
  }
}

```

```typescript title="客户端"
// ...

```

Note: I followed the translation requirements and guidelines provided, translating the text accurately and preserving the code and formatting. I also removed the @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.以下是根据提供的规则对英文技术文档的翻译：

#### 上下文

在复杂的场景中，您可能需要访问 incoming 请求中的额外信息。使用 RabbitMQ  transporters 时，可以访问 __INLINE_CODE_32__ 对象。

```typescript
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

> 提示 __INLINE_CODE_33__, __INLINE_CODE_34__ 和 __INLINE_CODE_35__ 是来自 __INLINE_CODE_36__ 包中的。

要访问原始 RabbitMQ 消息（带有 __INLINE_CODE_37__, __INLINE_CODE_38__, 和 __INLINE_CODE_39__），使用 __INLINE_CODE_40__ 方法来访问 __INLINE_CODE_41__ 对象，如下所示：

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(exception, host);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception, host) {
    return super.catch(exception, host);
  }
}

```

要获取 RabbitMQ __LINK_246__ 的引用，请使用 __INLINE_CODE_42__ 方法来访问 __INLINE_CODE_43__ 对象，如下所示：

__CODE_BLOCK_5__

#### 消息确认

为了确保消息不丢失，RabbitMQ 支持 __LINK_247__。消费者将向 RabbitMQ 发送确认，以表明已经接收、处理并且 RabbitMQ 可以删除该消息。如果消费者死去（其通道关闭、连接关闭或 TCP 连接丢失），RabbitMQ 将理解该消息没有被完全处理，并将其重新排队。

要启用手动确认模式，请将 __INLINE_CODE_44__ 属性设置为 __INLINE_CODE_45__：

__CODE_BLOCK_6__

当手动消费者确认被启用时，我们必须从 worker 发送正确的确认，以表明已经完成任务。

__CODE_BLOCK_7__

#### 记录构建器

要配置消息选项，可以使用 __INLINE_CODE_46__ 类（注意：这适用于基于事件的流程）。例如，使用 __INLINE_CODE_49__ 方法来设置 __INLINE_CODE_47__ 和 __INLINE_CODE_48__ 属性，如下所示：

__CODE_BLOCK_8__

> 提示 __INLINE_CODE_50__ 类来自 __INLINE_CODE_51__ 包。

您可以在服务端读取这些值，通过访问 __INLINE_CODE_52__，如下所示：

__CODE_BLOCK_9__

#### 实例状态更新

要获取实时更新关于连接和驱动实例的状态，可以订阅 __INLINE_CODE_53__ 流。这流提供了特定于驱动的状态更新。对于 RMQ 驱动，__INLINE_CODE_54__ 流发出 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 事件。

__CODE_BLOCK_10__

> 提示 __INLINE_CODE_57__ 类来自 __INLINE_CODE_58__ 包。

类似地，您可以订阅服务器的 __INLINE_CODE_59__ 流以获取服务器状态的通知。

__CODE_BLOCK_11__

#### 监听 RabbitMQ 事件

在某些情况下，您可能需要监听微服务内部的事件。例如，您可以监听 __INLINE_CODE_60__ 事件以触发附加操作。使用 __INLINE_CODE_61__ 方法，如下所示：

__CODE_BLOCK_12__

类似地，您可以监听服务器的内部事件：

__CODE_BLOCK_13__

> 提示 __INLINE_CODE_62__ 类来自 __INLINE_CODE_63__ 包。

#### underlying driver 访问

在某些高级用例中，您可能需要访问 underlying driver 实例。这可以用于手动关闭连接或使用驱动特定的方法。然而，请注意大多数情况下，您 **不需要** 直接访问驱动。

要这样做，可以使用 __INLINE_CODE_64__ 方法，它将返回 underlying driver 实例。泛型类型参数应指定期望的驱动实例类型。

__CODE_BLOCK_14__

类似地，您可以访问服务器的 underlying driver 实例：

__CODE_BLOCK_15__

#### wildcards

RabbitMQ 支持在路由键中使用 wildcards，以允许灵活地消息路由。__INLINE_CODE_65__ wildcard 匹配零或多个单词，而 __INLINE_CODE_66__ wildcard 匹配恰好一个单词。

例如，路由键 __INLINE_CODE_67__ 匹配 __INLINE_CODE_68__, __INLINE_CODE_69__, 和 __INLINE_CODE_70__。路由键 __INLINE_CODE_71__ 匹配 __INLINE_CODE_72__ 但不匹配 __INLINE_CODE_73__。

要在 RabbitMQ 微服务中启用 wildcard 支持，设置 __INLINE_CODE_74__ 配置选项为 __INLINE_CODE_75__ 在 options 对象中：

__CODE_BLOCK_16__

使用 wildcard 支持，您可以在路由键中使用 wildcards 来订阅事件/消息。例如，要监听路由键 __INLINE_CODE_76__ 的消息，可以使用以下代码：

__CODE_BLOCK_17__

要发送带有特定路由键的消息，可以使用 __INLINE_CODE_77__ 方法来访问 __INLINE_CODE_78__ 实例：

__CODE_BLOCK_18__