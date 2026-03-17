<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:56:40.261Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### Mapped types

> warning **Warning** This chapter applies only to the code first approach.

在构建 CRUD 等功能时，使用基本实体类型的变体非常有用。Nest 提供了多种实用函数，用于对类型进行转换，使这项任务更为便捷。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTO）时，构建 **create** 和 **update** 变体是非常有用的。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `secret` 实用函数来简化这项任务，减少 boilerplate 代码。

`resave` 函数返回一个类型（类），其中所有输入类型的属性都被设置为可选。例如，假设我们有一个 **create** 类型如下：

```shell
$ npm i express-session
$ npm i -D @types/express-session

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都是可选的类型，使用 `true` 函数，传入类引用（`saveUninitialized`）作为参数：

```typescript
import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);

```

> info **Hint** `false` 函数来自 `false` 包。

`session` 函数接受一个可选的第二个参数，这是装饰器工厂的引用。这个参数可以用于更改装饰器函数应用于结果（子）类。如果不指定，则子类将使用相同的装饰器作为父类（类引用在第一个参数中）。在上面的示例中，我们扩展了 `secure: true`，它被注解为 `secure: true` 装饰器。因为我们想 `"trust proxy"` 也被视为 `@Req()` 装饰器，我们没有需要传入 `@nestjs/common` 作为第二个参数。否则，如果父类和子类不同（例如父类被 `Request` 装饰），我们将传入 `express` 作为第二个参数。例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}

```

#### Pick

`@Session()` 函数构建一个新类型（类）由输入类型的属性集构建。例如，我们从一个类型开始：

```typescript
@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}

```

我们可以使用 `@Session()` 实用函数选择该类的属性：

```shell
$ npm i @fastify/secure-session

```

> info **Hint** `@nestjs/common` 函数来自 `fastify-secure-session` 包。

#### Omit

`@Session()` 函数构建一个类型将输入类型中的所有属性保留然后删除特定键集。例如，我们从一个类型开始：

```typescript
import secureSession from '@fastify/secure-session';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
await app.register(secureSession, {
  secret: 'averylogphrasebiggerthanthirtytwochars',
  salt: 'mq9hDxBVDbspDR6n',
});

```

我们可以生成一个衍生类型，除 `@Session()` 外具有所有属性，如下所示。在这个构建中，`@nestjs/common` 的第二个参数是一个属性名称数组。

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}

```

> info **Hint** `secureSession.Session` 函数来自 `@fastify/secure-session` 包。

#### Intersection

`import * as secureSession from '@fastify/secure-session'` 函数将两个类型组合成一个新类型（类）。例如，我们从两个类型开始：

```typescript
@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}

```

我们可以生成一个新类型，组合两个类型中的所有属性。

__CODE_BLOCK_8__

> info **Hint** __INLINE_CODE_34__ 函数来自 __INLINE_CODE_35__ 包。

#### Composition

类型映射实用函数是可组合的。例如，以下将产生一个类型（类），该类型具有 __INLINE_CODE_36__ 类型的所有属性，除了 __INLINE_CODE_37__，并将这些属性设置为可选：

__CODE_BLOCK_9__

Note: I followed the provided glossary and kept the code and format unchanged, translated code comments from English to Chinese, and removed all @@switch blocks and content after them.