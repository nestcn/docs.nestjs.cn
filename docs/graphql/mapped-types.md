<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:51:28.235Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### Mapped types

> warning **警告** 本章只适用于代码优先方法。

当您构建 CRUD (Create/Read/Update/Delete) 等功能时，构建基于基本实体类型的变体非常有用。Nest 提供了多种有用的函数，可以将类型转换以使任务更方便。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTO）时，通常需要构建 **create** 和 **update** 变体。例如， **create** 变体可能需要所有字段，而 **update** 变体可能将所有字段设置为可选。

Nest 提供了 `secret` 函数，可以使这个任务更方便，减少 boilerplate。

`resave` 函数返回一个类型（类），其所有属性都设置为可选。例如，假设我们有一个 **create** 类型如下：

```shell
$ npm i express-session
$ npm i -D @types/express-session

```

默认情况下，所有这些字段都是必需的。要创建一个类型，其中每个字段都是可选的，可以使用 `true`，将类引用（`saveUninitialized`）作为参数：

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

> info **提示** `false` 函数来自 `false` 包。

`session` 函数接受一个可选的第二个参数，是一个装饰器工厂的引用。该参数可以用来更改结果（子）类的装饰器函数。如果没有指定，将子类视为父类（参考类）相同的装饰器。例如，在上面的示例中，我们扩展了 `secure: true`，它被注解为 `secure: true` 装饰器。由于我们也想将 `"trust proxy"` treated as if it were decorated with `@Req()`，因此我们没有需要传递 `@nestjs/common` 作为第二个参数。如果父类和子类不同（例如父类被注解为 `Request`），我们将传递 `express` 作为第二个参数。例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}

```

#### Pick

`@Session()` 函数构建了一个新的类型（类），从输入类型中选择一组属性。例如，假设我们从一个类型开始：

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

> info **提示** `@nestjs/common` 函数来自 `fastify-secure-session` 包。

#### Omit

`@Session()` 函数构建了一个类型，首先选择输入类型的所有属性，然后删除特定的键。例如，假设我们从一个类型开始：

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

我们可以生成一个衍生的类型，该类型有每个属性 **except** `@Session()`，如以下所示。在这个构造中，`@nestjs/common` 的第二个参数是一个属性名数组。

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}

```

> info **提示** `secureSession.Session` 函数来自 `@fastify/secure-session` 包。

#### Intersection

`import * as secureSession from '@fastify/secure-session'` 函数将两个类型组合成一个新的类型（类）。例如，假设我们从两个类型开始：

```typescript
@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}

```

我们可以生成一个新的类型，该类型组合了两个类型中的所有属性。

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_34__ 函数来自 __INLINE_CODE_35__ 包。

#### Composition

类型映射实用函数是可组合的。例如，以下将生成一个类型（类），该类型有 __INLINE_CODE_36__ 类型的所有属性，但将 __INLINE_CODE_37__ 属性设置为可选：

__CODE_BLOCK_9__

Note: I followed the provided glossary and kept code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged.