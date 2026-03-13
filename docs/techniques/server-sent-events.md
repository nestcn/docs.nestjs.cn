<!-- 此文件从 content/techniques/server-sent-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:01:11.289Z -->
<!-- 源文件: content/techniques/server-sent-events.md -->

### 服务端发送事件

服务端发送事件（SSE）是一种服务器推送技术，允许客户端自动从服务器接收更新信息通过 HTTP 连接。每个通知都以一对换行符结尾（了解更多 __LINK_25__）。

#### 使用

要在路由（注册在 **控制器类** 中）中启用服务端发送事件，使用 __INLINE_CODE_3__ 装饰器注解方法处理程序。

```bash
$ npm i --save kafkajs

```

> 信息 **提示** __INLINE_CODE_4__ 装饰器和 __INLINE_CODE_5__ 接口来自 __INLINE_CODE_6__，而 __INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__ 来自 __INLINE_CODE_10__ 包。

> 警告 **警告** 服务端发送事件路由必须返回 __INLINE_CODE_11__ 流。

在上面的示例中，我们定义了名为 __INLINE_CODE_12__ 的路由，可以用来传播实时更新。这些事件可以使用 __LINK_26__ 列听。

__INLINE_CODE_13__ 方法返回一个 __INLINE_CODE_14__，该对象 emit 多个 __INLINE_CODE_15__（在这个示例中，每秒 emit 一个新的 __INLINE_CODE_16__）。__INLINE_CODE_17__ 对象应该遵守以下接口来匹配规范：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});

```

现在，我们可以在客户端应用程序中创建 __INLINE_CODE_18__ 类的实例，并将 __INLINE_CODE_19__ 路由（与上述 __INLINE_CODE_20__ 装饰器中的端点匹配）作为构造函数参数传递。

__INLINE_CODE_21__ 实例打开一个持久的 HTTP 连接，连接发送事件在 __INLINE_CODE_22__ 格式中。连接保持打开直到调用 __INLINE_CODE_23__。

一旦连接打开，来自服务器的消息将以事件形式传递给您的代码。如果 incoming 消息中存在事件字段，则触发的事件与事件字段值相同。如果没有事件字段，则触发一个通用的 `transport` 事件 (__LINK_27__）。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'hero-consumer'
          }
        }
      },
    ]),
  ]
  ...
})

```

#### 示例

有一个可用的 __LINK_28__ 示例。