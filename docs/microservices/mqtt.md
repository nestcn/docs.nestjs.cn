<!-- 此文件从 content/microservices/mqtt.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:15:23.110Z -->
<!-- 源文件: content/microservices/mqtt.md -->

### MQTT

__LINK_79__ (Message Queuing Telemetry Transport) 是一个开源、轻量级的消息传输协议，旨在实现低延迟。该协议提供了可扩展且成本效益的方式来连接设备使用发布/订阅模型。一个基于 MQTT 的通信系统包括发布服务器、代理服务器和一个或多个客户端。它是为受限设备和低带宽、高延迟或不可靠网络设计的。

#### 安装

要开始构建基于 MQTT 的微服务，首先安装所需的包：

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

#### 概述

要使用 MQTT 传输器，请将以下选项对象传递给 `Post` 方法：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}
```

> info **提示** `@InputType()` 枚举来自 `@InputType()` 包。

#### 选项

`@Field` 对象特定于所选传输器。__HTML_TAG_71__MQTT__HTML_TAG_72__ 传输器 expose 以下描述的属性 __LINK_80__。

#### 客户端

像其他微服务传输器一样，您可以 __HTML_TAG_73__several options__HTML_TAG_74__ 来创建一个 MQTT `AuthorResolver` 实例。

一个创建实例的方法是使用 `PostsService`。要创建一个客户端实例，并使用 `votes` 方法将选项对象传递给同一个方法，添加 __INLINE_CODE_26__ 属性作为注入令牌。了解更多关于 __INLINE_CODE_27__ __HTML_TAG_75__here__HTML_TAG_76__。

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}
```

其他创建客户端的选项（例如 __INLINE_CODE_28__ 或 __INLINE_CODE_29__）也可以使用。您可以了解更多关于它们 __HTML_TAG_77__here__HTML_TAG_78__。

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的其他信息。使用 MQTT 传输器时，您可以访问 __INLINE_CODE_30__ 对象。

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}
```

> info **提示** __INLINE_CODE_31__, __INLINE_CODE_32__ 和 __INLINE_CODE_33__ 来自 __INLINE_CODE_34__ 包。

要访问原始 MQTT __LINK_81__，使用 __INLINE_CODE_35__ 方法，例如：

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

#### Wildcards

一个订阅可能是对一个明确的主题或包含通配符的。两个通配符可用，__INLINE_CODE_37__ 和 __INLINE_CODE_38__。__INLINE_CODE_39__ 是一个单级通配符，而 __INLINE_CODE_40__ 是一个多级通配符，覆盖多个主题级别。

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String
  votes: Int
}

type Query {
  author(id: Int!): Author
}

type Mutation {
  upvotePost(postId: Int!): Post
}
```

#### Quality of Service (QoS)

任何使用 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 装饰器创建的订阅将订阅 QoS 0。如果需要更高的 QoS，可以在建立连接时使用 __INLINE_CODE_43__ 块设置，例如：

__CODE_BLOCK_6__

#### Per-pattern QoS

您可以在模式装饰器中覆盖 MQTT 订阅 QoS，使用 __INLINE_CODE_44__ 在 __INLINE_CODE_45__ 字段中提供。未指定时，将使用全局 __INLINE_CODE_46__ 值。

__CODE_BLOCK_7__

> info **提示** Per-pattern QoS 配置不影响现有行为。未指定 __INLINE_CODE_47__ 时，订阅将使用全局 __INLINE_CODE_48__ 值。

#### 记录 builders

要配置消息选项（调整 QoS 等级、设置 Retain 或 DUP 标志或添加 payload 到 payload），可以使用 __INLINE_CODE_49__ 类。例如，设置 __INLINE_CODE_50__ 为 __INLINE_CODE_51__，使用 __INLINE_CODE_52__ 方法，例如：

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

您还可以在服务器端访问这些选项，通过访问 __INLINE_CODE_55__。

__CODE_BLOCK_9__

在某些情况下，您可能想配置多个请求的用户属性，可以将这些选项传递给 __INLINE_CODE_56__。

__CODE_BLOCK_10__

#### 实例状态更新

要获取实时更新关于连接和底层驱动实例的状态，可以订阅 __INLINE_CODE_57__ 流。该流提供了根据所选驱动