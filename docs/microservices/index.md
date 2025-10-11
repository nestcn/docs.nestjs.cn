# 微服务

除了传统的（有时称为单体）应用程序架构外，Nest 原生支持微服务架构风格的开发。本文档其他地方讨论的大多数概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，同样适用于微服务。无论在哪里，Nest 都会抽象实现细节，以便相同的组件可以在基于 HTTP 的平台、WebSocket 和微服务上运行。本节涵盖 Nest 中特定于微服务的方面。

在 Nest 中，微服务本质上是一个使用不同于 HTTP 的传输层的应用程序。

![微服务架构图](https://docs.nestjs.com/assets/Microservices_1.png)

Nest 支持几种内置的传输层实现，称为传输器，它们负责在不同微服务实例之间传输消息。大多数传输器原生支持请求-响应和基于事件的消息样式。Nest 在请求-响应和基于事件的消息传递的规范接口后面抽象每个传输器的实现细节。这使得从一个传输层切换到另一个传输层变得容易——例如，利用特定传输层的特定可靠性或性能特性——而不会影响您的应用程序代码。

## 安装

要开始构建微服务，首先安装所需的包：

```bash
$ npm i --save @nestjs/microservices
```

## 支持的传输层

NestJS 支持多种传输层，满足不同的应用场景：

### 核心传输器

- **TCP** - 基于 TCP 的通信（默认）
- **Redis** - 使用 Redis 作为消息代理
- **NATS** - 高性能消息系统
- **RabbitMQ** - 企业级消息队列
- **Apache Kafka** - 分布式流处理平台
- **MQTT** - 物联网消息协议

### 高级传输器

- **gRPC** - 高性能 RPC 框架
- **自定义传输器** - 支持自定义传输层实现

## 主要特性

### 核心功能

- **传输层无关** - 支持多种消息传输协议
- **请求-响应模式** - 同步通信模式
- **事件驱动架构** - 基于事件的异步通信
- **异常处理** - 分布式系统中的异常处理
- **管道和守卫** - 复用 HTTP 应用的组件

### 高级功能

- **负载均衡** - 自动请求分发
- **容错机制** - 连接重试和错误恢复
- **TLS 支持** - 安全通信
- **动态配置** - 运行时配置
- **健康检查** - 服务状态监控

## 快速开始

### 创建微服务

要实例化微服务，请使用 `NestFactory` 类的 `createMicroservice()` 方法：

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
```

:::info 提示
微服务默认使用 TCP 传输层。
:::



### 消息处理器

#### 请求-响应模式

使用 `@MessagePattern()` 装饰器创建基于请求-响应范式的消息处理器：

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
```

#### 事件驱动模式

使用 `@EventPattern()` 装饰器创建事件处理器：

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // 业务逻辑
}
```

### 客户端通信

#### 发送消息

```typescript
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}
```

#### 发布事件

```typescript
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}
```

## 配置选项

### TCP 传输器选项

| 选项 | 描述 |
|------|------|
| host | 连接主机名 |
| port | 连接端口 |
| retryAttempts | 消息重试次数（默认：0） |
| retryDelay | 消息重试间隔（毫秒）（默认：0） |
| serializer | 传出消息的自定义序列化器 |
| deserializer | 传入消息的自定义反序列化器 |
| socketClass | 扩展 TcpSocket 的自定义 Socket（默认：JsonSocket） |
| tlsOptions | 配置 TLS 协议的选项 |

### 客户端配置

```typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ],
})
export class AppModule {}
```

## 消息模式

微服务通过**模式**识别消息和事件。模式是一个普通值，例如字面对象或字符串。模式会自动序列化并与消息的数据部分一起通过网络发送。通过这种方式，消息发送者和消费者可以协调哪些请求由哪些处理器消费。

### 请求-响应

当您需要在各种外部服务之间交换消息时，请求-响应消息样式很有用。这种范式确保服务实际接收到消息（无需手动实现确认协议）。

### 事件驱动

当您只想发布事件而不等待响应时，基于事件的消息样式是理想的。在这种情况下，为请求-响应维护两个通道的开销是不必要的。

## 高级功能

### 异步响应

消息处理器可以同步或异步响应：

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}
```

### Observable 响应

消息处理器也可以返回 `Observable`：

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}
```

### 请求上下文

在更高级的场景中，您可能需要访问有关传入请求的其他详细信息：

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // 例如 "time.us.east"
  return new Date().toLocaleTimeString();
}
```

### 超时处理

在分布式系统中，应用超时防止无限期等待：

```typescript
this.client
  .send<TResult, TInput>(pattern, data)
  .pipe(timeout(5000));
```

### TLS 支持

在私有网络外部通信时，加密流量以确保安全很重要。在 NestJS 中，可以使用 Node 内置的 [TLS](https://nodejs.org/api/tls.html) 模块通过 TCP 实现 TLS。Nest 在其 TCP 传输中提供了对 TLS 的内置支持，允许我们加密微服务或客户端之间的通信。

要为 TCP 服务器启用 TLS，您需要 PEM 格式的私钥和证书。这些通过设置 `tlsOptions` 并指定密钥和证书文件添加到服务器选项中：

```typescript
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const key = fs.readFileSync('<pathToKeyFile>', 'utf8').toString();
  const cert = fs.readFileSync('<pathToCertFile>', 'utf8').toString();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        tlsOptions: {
          key,
          cert,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
```

对于客户端通过 TLS 进行安全通信，我们也定义 `tlsOptions` 对象，但这次使用 CA 证书。这是签署服务器证书的机构的证书。这确保客户端信任服务器的证书并可以建立安全连接：

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as fs from 'fs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.TCP,
        options: {
          tlsOptions: {
            ca: [fs.readFileSync('<pathToCaFile>', 'utf-8').toString()],
          },
        },
      },
    ]),
  ],
})
export class AppModule {}
```

如果您的设置涉及多个受信任的机构，您也可以传递 CA 数组。

设置完成后，您可以像往常一样使用 `@Inject()` 装饰器注入 `ClientProxy` 以在服务中使用客户端。这确保了 NestJS 微服务之间的加密通信，Node 的 `TLS` 模块处理加密细节。

更多信息请参考 Node 的 [TLS 文档](https://nodejs.org/api/tls.html)。
```

## 企业级支持

### 官方企业支持

NestJS 提供专业的企业级支持服务：

- 技术指导
- 深度代码审查
- 团队成员指导
- 最佳实践建议

[了解更多](https://enterprise.nestjs.com/)

### NestJS 开发工具

使用 NestJS Devtools 探索您的微服务架构：

- 图形可视化
- 路由导航器
- 交互式游乐场
- CI/CD 集成

[立即注册](https://devtools.nestjs.com/)

## 相关章节

- [概览](./basics.md) - 微服务基础
- [Redis](./redis.md) - Redis 传输器
- [MQTT](./mqtt.md) - MQTT 传输器
- [NATS](./nats.md) - NATS 传输器
- [RabbitMQ](./rabbitmq.md) - RabbitMQ 传输器
- [Kafka](./kafka.md) - Kafka 传输器
- [gRPC](./grpc.md) - gRPC 传输器
- [自定义传输器](./custom-transport.md) - 自定义传输器
- [异常过滤器](./exception-filters.md) - 微服务异常处理
- [管道](./pipes.md) - 微服务管道
- [守卫](./guards.md) - 微服务守卫
- [拦截器](./interceptors.md) - 微服务拦截器

通过 NestJS 的微服务支持，您可以构建高性能、可扩展的分布式系统，同时保持代码的简洁性和可维护性。
