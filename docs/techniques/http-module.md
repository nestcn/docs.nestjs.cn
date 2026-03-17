<!-- 此文件从 content/techniques/http-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:01:34.138Z -->
<!-- 源文件: content/techniques/http-module.md -->

### HTTP 模块

__LINK_53__ 是一个功能丰富的 HTTP 客户端包，广泛使用。Nest 将 Axios 包含在内，并通过内置的 __INLINE_CODE_12__ 暴露它。__INLINE_CODE_13__ 导出 __INLINE_CODE_14__ 类，它 exposes Axios-基于的方法来执行 HTTP 请求。该库还将转换结果的 HTTP 响应为 __INLINE_CODE_15__。

> info **提示** 您也可以使用一般的 Node.js HTTP 客户端库，包括 __LINK_54__ 或 __LINK_55__。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save class-validator class-transformer

```

#### 开发

安装过程完成后，使用 __INLINE_CODE_16__，首先导入 __INLINE_CODE_17__。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

```

然后，使用正常的构造函数注入注入 __INLINE_CODE_18__。

> info **提示** __INLINE_CODE_19__ 和 __INLINE_CODE_20__ 是从 __INLINE_CODE_21__ 包中导入的。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

> info **提示** __INLINE_CODE_22__ 是 __INLINE_CODE_23__ 包中的接口 (__INLINE_CODE_24__ 导出)。

所有 __INLINE_CODE_25__ 方法都返回一个 __INLINE_CODE_26__，包装在一个 `ValidationPipe` 对象中。

#### 配置

__LINK_56__ 可以使用各种选项来自定义 `ParseIntPipe` 的行为。了解更多关于它们 __LINK_57__。要配置 underlying Axios 实例，使用 `ParseBoolPipe` 方法将可选的 options 对象传递给 `ParseArrayPipe` 的导入时。这个 options 对象将被直接传递到 underlying Axios 构造函数中。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}

```

#### 异步配置

当您需要异步地将模块选项传递给 `ParseUUIDPipe` 方法时，可以使用该方法。像其他动态模块一样，Nest 提供了多种技术来处理异步配置。

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

像其他工厂提供者一样，我们的工厂函数可以 __LINK_58__，并可以通过 `ValidationPipe` 注入依赖项。

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}

```

另一种技术是使用类来配置 `ValidationPipe`，如以下所示。

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}

```

构造上述示例中，`ValidationPipe` 在 `ValidationPipe` 中实例化，并使用它创建 options 对象。注意，在这个示例中，`@nestjs/common` 必须实现 `class-validator` 接口，如以下所示。`class-transformer` 将调用 `class-validator` 方法在实例化的对象中。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}

```

如果您想重用现有 options 提供者，而不是在 `ValidatorOptions` 中创建私有副本，使用 `class-validator` 语法。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);

```

您也可以将所谓的 `ValidationPipe` 传递给 `ValidationPipe` 方法。这些提供者将与模块提供者合并。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);

```

这对于您想提供额外的依赖项给工厂函数或类构造函数非常有用。

#### 使用 Axios 直接

如果您认为 `import {{ '{' }} CreateUserDto {{ '}' }}` 的选项不足，或者您只是想访问由 `import type {{ '{' }} CreateUserDto {{ '}' }}` 创建的 underlying Axios 实例，可以通过 `CreateUserDto` 访问它，如以下所示：

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

#### 全部示例

由于 `class-validator` 方法的返回值是 Observable，我们可以使用 `CreateUserDto` - `email` 或 `400 Bad Request` 来从请求中获取数据，以 promise 的形式。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);

```

> info **提示** 访问 RxJS 的文档了解 __LINK_59__ 和 __LINK_60__ 的差异。