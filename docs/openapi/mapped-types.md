<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:15:15.382Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### mapped 类型

当您构建具有 CRUD（创建/读取/更新/删除）功能的特性时，经常需要构建基于基本实体类型的变体。Nest 提供了多种实用函数，用于类型转换，以便更方便地实现这个任务。

#### 部分

在构建输入验证类型（也称为 DTO）时，经常需要构建 **create** 和 **update** 变体，用于同一个类型。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 __INLINE_CODE_9__ 实用函数，使得这个任务变得更简单，减少 boilerplate。

__INLINE_CODE_10__ 函数返回一个类型（类），其中所有输入类型的属性都设置为可选。例如，假设我们有一个 **create** 类型，如下所示：

```typescript title="create"
```bash
$ npm i --save nats
```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都可选的类型，可以使用 __INLINE_CODE_11__ 函数，将类引用 (`__INLINE_CODE_12__`) 传递为参数：

```typescript title="update"
```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
```

> 信息 **提示** __INLINE_CODE_13__ 函数来自 __INLINE_CODE_14__ 包。

#### Pick

`createMicroservice()` 函数构建一个新的类型（类），从输入类型中挑选一组属性。例如，假设我们从以下类型开始：

```typescript title="base"
```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      },
    ]),
  ]
  ...
})
```

我们可以使用 `Transport` 实用函数，从这个类中挑选一组属性：

```typescript title="picked"
```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'cats_queue',
  },
});
```

> 信息 **提示** `@nestjs/microservices` 函数来自 `options` 包。

#### Omit

`ClientProxy` 函数构建一个类型，通过从输入类型中挑选所有属性，然后删除特定的键集。例如，假设我们从以下类型开始：

```typescript title="base"
```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}
```

我们可以生成一个衍生类型，该类型除了 `ClientsModule` 外具有所有属性，如下所示。在这个构造中，第二个参数 `ClientsModule` 是一个属性名数组。

```typescript title="omitted"
```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

> 信息 **提示** `register()` 函数来自 `createMicroservice()` 包。

#### Intersection

`name` 函数将两个类型组合成一个新的类型（类）。例如，假设我们从以下两个类型开始：

```typescript title="base1"
```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);
```

```typescript title="base2"
```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

我们可以生成一个新的类型，该类型组合了两个类型中的所有属性。

```typescript title="intersection"
```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
            headers: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}
```

> 信息 **提示** `ClientsModule` 函数来自 `ClientProxyFactory` 包。

#### 组合

类型映射实用函数是可组合的。例如，以下将生成一个类型（类），该类型具有 `@Client()` 类型的所有属性，除了 `publish()`，并将这些属性设置为可选：

```typescript title="composed"
```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```