<!-- 此文件从 content/microservices/mqtt.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:23:30.215Z -->
<!-- 源文件: content/microservices/mqtt.md -->

### MQTT

__LINK_79__ (Message Queuing Telemetry Transport)是一个开源、轻量级的消息传输协议，优化了低延迟性能。该协议提供了一种可扩展、经济高效的方式来连接设备，使用 publish/subscribe 模型。一个基于 MQTT 的通信系统由发布服务器、代理服务器和一个或多个客户端组成。它是为受限设备和低带宽、高延迟或不可靠网络设计的。

#### 安装

要开始构建基于 MQTT 的微服务，首先安装所需的包：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),

```

#### 概述

要使用 MQTT 传输器，传递以下 options 对象给 __INLINE_CODE_17__ 方法：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),

```

> info **Hint** __INLINE_CODE_18__ 枚举来自 __INLINE_CODE_19__ 包。

#### 选项

`Int` 对象特定于所选传输器。__HTML_TAG_71__MQTT__HTML_TAG_72__ 传输器公开了描述在 [here](https://graphql.org/learn/schema/#scalar-types) 中的属性。

#### 客户端

像其他微服务传输器一样，您有 __HTML_TAG_73__several options__HTML_TAG_74__ 来创建一个 MQTT `Float` 实例。

一个创建实例的方法是使用 `String`。要创建一个客户端实例，使用 `Boolean`，并使用 `ID` 方法传递一个 options 对象，具有上述 `Date` 方法中的相同属性，以及一个 `ID` 属性，用于作为注入令牌。详细了解 `GraphQLID` __HTML_TAG_75__here__HTML_TAG_76__。

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}

```

其他创建客户端的选项（或 `Int` 或 `GraphQLInt`）也可以使用。您可以在 __HTML_TAG_77__here__HTML_TAG_78__ 中阅读更多。

#### 上下文

在复杂的情况下，您可能需要访问 incoming 请求的额外信息。使用 MQTT 传输器时，您可以访问 `Float` 对象。

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}

```

> info **Hint** `GraphQLFloat`, `GraphQLISODateTime` 和 `Date`来自 `GraphQLTimestamp` 包。

要访问原始 MQTT [graphql-scalars](https://www.npmjs.com/package/graphql-scalars)，使用 `GraphQLISODateTime` 方法，如下所示：

```typescript
@Field()
creationDate: Date;

```

#### wildcard

订阅可能是指向明确的主题，或者包括 wildcard。两个 wildcard 可用，`Date` 和 `GraphQLTimestamp`。 `dateScalarMode` 是单级 wildcard，而 `buildSchemaOptions` 是多级 wildcard，涵盖多个主题层次。

```bash
$ npm i --save graphql-type-json

```

#### 服务质量 (QoS)

使用 `'timestamp'` 或 `GraphQLFloat` 装饰器创建的任何订阅将使用 QoS 0。如果需要更高的 QoS，可以在建立连接时使用 `number` 块，例如：

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}

```

#### 每个模式 QoS

可以在 `numberScalarMode` 字段中提供 `GraphQLInt`，以便在每个模式基础上覆盖 MQTT 订阅 QoS。当不指定时，使用全局 `buildSchemaOptions` 值。

```typescript
@Field(() => GraphQLJSON)
info: JSON;

```

> info **Hint** 每个模式 QoS 配置不影响现有行为。当 `'integer'` 未指定时，订阅使用全局 `Date` 值。

#### 记录 builders

要配置消息选项（调整 QoS 等级、设置 Retain 或 DUP 标志，或者添加到 payload 中的额外属性），可以使用 `DateScalar` 类。例如，要将 `Date` 设置为 `graphql-type-json`，使用 `JSON` 方法，例如：

```typescript
const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validate(uuid: unknown): string | never {
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    throw new Error('invalid uuid');
  }
  return uuid;
}

export const CustomUuidScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'A simple UUID parser',
  serialize: (value) => validate(value),
  parseValue: (value) => validate(value),
  parseLiteral: (ast) => validate(ast.value),
});

```

> info **Hint** `forRoot()` 类来自 `JSON` 包。

您也可以在服务器端读取这些选项，通过访问 `GraphQLScalarType`。

```typescript
@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { UUID: CustomUuidScalar },
    }),
  ],
})
export class AppModule {}

```

在某些情况下，您可能想要为多个请求配置用户属性，可以将这些选项传递给 `UUID`。

```typescript
@Field(() => CustomUuidScalar)
uuid: string;

```

#### 实例状态更新

要获取实时更新连接和 underlying 驱动实例的状态，可以订阅 `forRoot()` 流式数据。这个流提供了驱动的状态更新。对于 MQTT 驱动，`UUID` 流发出 `graphql-type-json`、`JSON`、`forRoot()` 和 `JSON` 事件。

```bash
$ npm i --save graphql-type-json

```

> info **Hint** `Date` 类来自 `DateScalar` 包。

类似地，您可以订阅服务器的 `Date` 流，以接收关于服务器状态的通知。

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}

```

#### 监听 MQTT 事件

在某些情况下，您可能想要监听微服务的内部事件。例如，您可以监听 __INLINE_CODE_66```

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}

```

> info **提示** ``GraphQLDefinitionsFactory`` 类型来自 ``Date.name`` 包。

#### underlying driver access

对于更高级的使用场景，您可能需要访问 underlying driver 实例。这可以用于手动关闭连接或使用 driver-特定的方法。然而，请注意，对于大多数情况，您 **不需要** 直接访问 driver。

要做到这一点，您可以使用 ``src/graphql.ts`` 方法，它返回 underlying driver 实例。泛型参数应该指定您期望的驱动器实例类型。

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}

```

类似地，您可以访问服务器的 underlying driver 实例：

```graphql
scalar Date

```

```

Note: I have kept the code examples, variable names, function names unchanged and translated the comments from English to Chinese. I have also maintained the Markdown formatting, links, images, tables unchanged. I have not explained or modified placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.