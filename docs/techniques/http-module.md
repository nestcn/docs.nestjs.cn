<!-- 此文件从 content/techniques/http-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:34:13.225Z -->
<!-- 源文件: content/techniques/http-module.md -->

### HTTP 模块

__LINK_53__ 是一个功能-rich 的 HTTP 客户端包，广泛使用。Nest 将 Axios 包含在内，通过内置的 __INLINE_CODE_12__ 暴露它。__INLINE_CODE_13__ 导出 __INLINE_CODE_14__ 类， expose Axios-based 方法来执行 HTTP 请求。该库还将结果 HTTP 响应转换为 __INLINE_CODE_15__。

> 提示 **Hint** 你也可以使用任何一般 Node.js HTTP 客户端库，包括 __LINK_54__ 或 __LINK_55__。

#### 安装

要开始使用它，我们首先安装必要的依赖项。

```bash
$ npm i --save class-validator class-transformer

```

#### 入门

安装过程完成后，使用 __INLINE_CODE_16__ 前，先导入 __INLINE_CODE_17__。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

```

然后，使用正常的构造函数注入注入 __INLINE_CODE_18__。

> 提示 **Hint** __INLINE_CODE_19__ 和 __INLINE_CODE_20__ 来自 __INLINE_CODE_21__ 包。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

> 提示 **Hint** __INLINE_CODE_22__ 是由 __INLINE_CODE_23__ 包导出的接口 (__INLINE_CODE_24__）。

所有 __INLINE_CODE_25__ 方法都返回一个 __INLINE_CODE_26__，包装在 `ValidationPipe` 对象中。

#### 配置

__LINK_56__ 可以通过多种选项来自定义 `ParseIntPipe` 的行为。了解更多关于它们 __LINK_57__。要配置 underlying Axios实例，使用 `ParseBoolPipe` 方法，向 `ParseArrayPipe` 导入时传递可选的选项对象。这个选项对象将被直接传递给 underlying Axios 构造函数。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}

```

#### 异步配置

当你需要异步地传递模块选项，而不是静态地时，使用 `ParseUUIDPipe` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

```

像其他工厂提供程序一样，我们的工厂函数可以 __LINK_58__ 并通过 `ValidationPipe` 注入依赖项。

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}

```

或者，你可以使用类来配置 `ValidationPipe`，如下所示。

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}

```

构造过程中， `ValidationPipe` 在 `ValidationPipe` 内部实例化，使用它来创建选项对象。请注意，在这个示例中， `@nestjs/common` 必须实现 `class-validator` 接口，如下所示。 `class-transformer` 将在实例化对象的 `class-validator` 方法中调用。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}

```

如果你想重用现有的选项提供程序，而不是在 `ValidatorOptions` 内部创建私有副本，使用 `class-validator` 语法。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);

```

你也可以将所谓的 `ValidationPipe` 传递给 `ValidationPipe` 方法。这些提供程序将与模块提供程序合并。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);

```

这在你想为工厂函数或类构造函数提供额外依赖项时非常有用。

#### 使用 Axios 直接

如果你认为 `import {{ '{' }} CreateUserDto {{ '}' }}` 的选项不足，你还是想访问 underlying Axios 实例，创建了 `import type {{ '{' }} CreateUserDto {{ '}' }}`，你可以通过 `CreateUserDto` 来访问它，如下所示：

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

#### 全部示例

由于 `class-validator` 方法的返回值是一个可观察对象，我们可以使用 `CreateUserDto` - `email` 或 `400 Bad Request` 来检索请求数据的形式为 promise。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);

```

> 提示 **Hint** 访问 RxJS 的文档，了解 __LINK_59__ 和 __LINK_60__ 之间的差异。