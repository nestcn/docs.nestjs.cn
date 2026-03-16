<!-- 此文件从 content/techniques/http-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:12:46.968Z -->
<!-- 源文件: content/techniques/http-module.md -->

### HTTP 模块

__LINK_53__ 是一个功能丰富的 HTTP 客户端包，广泛使用。Nest 使用 Axios 并将其暴露给内置的 __INLINE_CODE_12__。__INLINE_CODE_13__ 导出 __INLINE_CODE_14__ 类，它暴露 Axios 基于的方法来执行 HTTP 请求。库还将结果 HTTP 响应转换为 __INLINE_CODE_15__。

> info **Hint** 你也可以使用任何一般-purpose Node.js HTTP 客户端库，包括 __LINK_54__ 或 __LINK_55__。

#### 安装

要开始使用它，我们首先安装必要的依赖项。

```bash
$ npm i --save class-validator class-transformer

```

#### 获取 started

安装过程完成后，使用 __INLINE_CODE_16__，首先导入 __INLINE_CODE_17__。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

```

然后，使用正常的构造函数注入注入 __INLINE_CODE_18__。

> info **Hint** __INLINE_CODE_19__ 和 __INLINE_CODE_20__来自 __INLINE_CODE_21__ 包。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

> info **Hint** __INLINE_CODE_22__ 是来自 __INLINE_CODE_23__ 包的接口 (__INLINE_CODE_24__)

所有 __INLINE_CODE_25__ 方法返回一个 __INLINE_CODE_26__，裹在 `ValidationPipe` 对象中。

#### 配置

__LINK_56__ 可以使用多种选项来自定义 `ParseIntPipe` 的行为。阅读更多关于它们的信息 __LINK_57__。要配置 underlying Axios 实例，使用可选的 options 对象在导入 `ParseBoolPipe` 方法时，传递给 `ParseArrayPipe`。这个 options 对象将被直接传递给 underlying Axios 构造函数。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}

```

#### 异步配置

当您需要异步传递模块选项而不是静态时，使用 `ParseUUIDPipe` 方法。像其他动态模块一样，Nest 提供了多种技术来处理异步配置。

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

像其他工厂提供者一样，我们的工厂函数可以 __LINK_58__ 并可以通过 `ValidationPipe` 注入依赖项。

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}

```

或者，您可以使用类来配置 `ValidationPipe`，如以下所示。

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}

```

构建上述实例化 `ValidationPipe` 在 `ValidationPipe` 内部，使用它创建一个选项对象。请注意，在这个示例中，`@nestjs/common` 必须实现 `class-validator` 接口，如以下所示。`class-transformer` 将在实例化对象上的 `class-validator` 方法上调用。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}

```

如果您想重用现有选项提供者，而不是在 `ValidatorOptions` 内部创建私有副本，使用 `class-validator` 语法。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);

```

您还可以将所谓的 `ValidationPipe` 传递给 `ValidationPipe` 方法。这些提供者将与模块提供者合并。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);

```

这很有用，当您想为工厂函数或类构造器提供额外的依赖项时。

#### 使用 Axios 直接

如果您认为 `import {{ '{' }} CreateUserDto {{ '}' }}` 的选项不够或只是想访问 underlying Axios 实例由 `import type {{ '{' }} CreateUserDto {{ '}' }}` 创建的，可以访问它通过 `CreateUserDto`，如下所示：

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

#### 全部示例

由于 `class-validator` 方法的返回值是一个 Observable，我们可以使用 `CreateUserDto` - `email` 或 `400 Bad Request` 来获取请求的数据，以 promise 的形式。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);

```

> info **Hint** 访问 RxJS 的文档，了解 __LINK_59__ 和 __LINK_60__ 之间的区别。