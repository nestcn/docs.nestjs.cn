<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:29:14.779Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### Mapped types

> warning **Warning** This chapter applies only to the code first approach.

在构建 CRUD 等功能时，通常有用构建基于基本实体类型的变体。Nest 提供了一些有用的函数来实现类型转换，以便简化这个任务。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTO）时，通常有用构建 **create** 和 **update** 变体，以便在同一个类型上实现。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `secret` 函数来简化此任务并减少 boilerplate。

`resave` 函数返回一个类型（类），其所有属性都被设置为可选。例如，假设我们有一个 **create** 类型，如下所示：

```shell
$ npm i express-session
$ npm i -D @types/express-session

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段可选的类型，请使用 `true`，将类引用（`saveUninitialized`）作为参数：

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

`session` 函数具有可选的第二个参数，这是一个装饰器工厂的引用。这个参数可以用来更改装饰器函数应用于结果（子）类。如果不指定，子类将使用同样装饰器的父类（被引用的类）。在上面的示例中，我们扩展了 `secure: true`，这个类被注解了 `secure: true` 装饰器。由于我们想 `"trust proxy"` 也被视为 `@Req()` 装饰器，我们没有必要将 `@nestjs/common` 作为第二个参数。如果父类和子类不同（例如父类被 `Request` 装饰），我们将 `express` 作为第二个参数。例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}

```

#### Pick

`@Session()` 函数构建一个新的类型（类），从输入类型中选择一组属性。例如，假设我们开始于一个类型似：

```typescript
@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}

```

我们可以使用 `@Session()` 实用函数选择一组属性：

```shell
$ npm i @fastify/secure-session

```

> info **Hint** `@nestjs/common` 函数来自 `fastify-secure-session` 包。

#### Omit

`@Session()` 函数构建一个类型，通过从输入类型中选择所有属性，然后删除特定的键。例如，假设我们开始于一个类型似：

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

我们可以生成一个衍生的类型，该类型具有除 `@Session()` 外的所有属性，如下所示。在这个构建中，`@nestjs/common` 的第二个参数是一个属性名称数组。

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}

```

> info **Hint** `secureSession.Session` 函数来自 `@fastify/secure-session` 包。

#### Intersection

`import * as secureSession from '@fastify/secure-session'` 函数组合两个类型到一个新的类型（类）。例如，假设我们开始于两个类型似：

```typescript
@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}

```

我们可以生成一个新的类型，该类型组合了两个类型的所有属性。

__CODE_BLOCK_8__

> info **Hint** __INLINE_CODE_34__ 函数来自 __INLINE_CODE_35__ 包。

#### Composition

类型映射实用函数是可组合的。例如，下面的示例将生成一个类型（类），该类型具有 __INLINE_CODE_36__ 类的所有属性，除了 __INLINE_CODE_37__，并将其设置为可选：

__CODE_BLOCK_9__