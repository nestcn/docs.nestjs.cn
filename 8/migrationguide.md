# 迁移指南

本文提供了一套从 Nest 7 迁移到 Nest 8 的指南。要了解更多关于 Nest 8 中添加的新功能，请查看此[链接](https://github.com/nestjs/nest/pull/6349)。

## HTTP 模块

从`@nestjs/common`包导出的`HttpModule`已被废弃，将在下一个主要版本中删除。请使用`@nestjs/axios`包（两者API没有任何差别）。

## gRPC 策略

原先的Node gRPC库（`grpc`）已被废弃，将不再接受功能更新。在 Nest 8 中，你应该使用`@grpc/grpc-js`库来代替。

## NATS 策略

NATS已经发布了一个新的主要版本（2.0），它有许多变化，并且和 `nats@1.x.x` API不兼容。如果你使用一个用其他框架编写的服务与Nest微服务（使用NATS作为传输层）交互，请看<a style="color:red;" href="https://github.com/nats-io/nats.js/blob/master/migration.md">迁移文档</a>了解 v2 中的变化。否则，在Nest微服务之间进行通信时，你不会看到任何重大差异。

如果要升级，请确保安装了最新版本的`nats`包（`npm i nats@latest`）。同时，更新你的<a style="color:red;" href="https://github.com/nats-io/nats.js/blob/master/migration.md#changed-configuration-properties">NATS配置</a>。例如：

```typescript
// 之前
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    url: 'nats://localhost:4222',
  },
});

// 现在
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
```

## `@All()` 装饰器

用 `@All()` 装饰器注释的路由将会映射到 `router.all()` 方法，而不是 `router.use()`。

## 异步的监听/启动方法

`listenAsync()` 和 `startAllMicroservicesAsync()` 方法已被弃用。取而代之的是简单地使用 `listen()` 和 `startAllMicroservices()`方法（它们都是异步的）。

## `Socket.io`

`@nestjs/platform-socket.io` 包已升级为使用 `socket.io@4.x.x`版本（Nest v7是基于 `socket.io` v2的）。要了解更多信息，请查看这些文章：<a style="color:red;" href="https://socket.io/blog/socket-io-3-release/">Socket.io 3 Release</a> 和 <a style="color:red;" href="https://socket.io/blog/socket-io-3-release/">Socket.io 4 Release</a>。


## Logger 的突破性变化

为了更好的扩展性，我们把 `Logger` 和 `ConsoleLogger` 类分开（<a style="color:red;" href="https://github.com/nestjs/nest/pull/6221">PR</a> ，在 <a style="color:red;" href="https://docs.nestjs.com/techniques/logger">Logging</a> 章节中了解更多）。如果你的应用程序使用了一个扩展了内置 `Logger` 的自定义日志器类，你应该更新它为扩展 `ConsoleLogger` 。

之前：

```typescript
export class MyLogger extends Logger {}
```

现在：

```typescript
export class MyLogger extends ConsoleLogger {}
```

## `@nestjs/config` 软件包

在`registerAs`函数（类型）中，有一个小的突破性变化（breaking change），你可以在这个 <a style="color:red;" href="https://github.com/nestjs/config/pull/173">PR</a> 中看到具体有什么变化。

## `@nestjs/graphql` 软件包

你自动生成的模式文件看起来可能会有一些小的差别（类型顺序发生变化）。另外，如果你使用模式优先的方法，自动生成的类型定义将发生变化，因为在最新版本中引入了一个新的 `Nullable<T>` 类型。

除此之外，从你的解析器抛出的所有 `HttpException` 错误将自动映射到相应的 `ApolloError` 实例，除非你将 `autoTransformHttpErrors` 配置属性（在你传入 `GraphQLModule#forRoot()` 方法的选项对象中）设置为 `false` 。

## RxJS#

请确保升级到 `rxjs` 包的最新版本（v7）。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
