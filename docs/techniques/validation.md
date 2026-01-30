# 验证

验证发送到 Web 应用程序的任何数据的正确性是最佳实践。为了自动验证传入请求，Nest 提供了几个开箱即用的管道：

- `ValidationPipe`
- `ParseIntPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`

`ValidationPipe` 利用了强大的 [class-validator](https://github.com/typestack/class-validator) 包及其声明式验证装饰器。`ValidationPipe` 提供了一种便捷的方法来强制执行所有传入客户端负载的验证规则，其中特定规则通过每个模块中本地类/DTO 声明中的简单注解来声明。

#### 概述

在 [管道](/overview/pipes) 章节中，我们介绍了构建简单管道并将其绑定到控制器、方法或全局应用程序的过程，以演示其工作原理。请务必查看该章节以更好地理解本章内容。在这里，我们将重点介绍 `ValidationPipe` 的各种**实际应用**场景，并展示如何使用它的一些高级定制功能。

#### 使用内置的 ValidationPipe

要开始使用它，我们首先需要安装所需的依赖项。

```bash
$ npm i --save class-validator class-transformer
```

:::info 提示
`ValidationPipe` 是从 `@nestjs/common` 包中导出的。
:::

由于该管道使用了 [`class-validator`](https://github.com/typestack/class-validator) 和 [`class-transformer`](https://github.com/typestack/class-transformer) 库，因此有许多可用选项。您可以通过传递给管道的配置对象来配置这些设置。以下是内置选项：

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
```

除此之外，所有 `class-validator` 选项（继承自 `ValidatorOptions` 接口）都可用：

| 选项                    | 类型       | 描述                                                                               |
| ----------------------- | ---------- | ---------------------------------------------------------------------------------- |
| enableDebugMessages     | boolean    | 如果设为 true，当出现问题时验证器会在控制台打印额外的警告信息。                    |
| skipUndefinedProperties | boolean    | 如果设为 true，验证器将跳过验证对象中所有未定义的属性。                            |
| skipNullProperties      | boolean    | 如果设为 true，验证器将跳过验证对象中所有为 null 的属性。                          |
| skipMissingProperties   | boolean    | 如果设置为 true，则验证器将跳过验证对象中所有为 null 或 undefined 的属性。         |
| whitelist               | boolean    | 如果设置为 true，验证器将去除已验证（返回）对象中未使用任何验证装饰器的所有属性。  |
| forbidNonWhitelisted    | boolean    | 如果设置为 true，验证器不会去除非白名单属性，而是抛出异常。                        |
| forbidUnknownValues     | boolean    | 如果设置为 true，尝试验证未知对象时将立即失败。                                    |
| disableErrorMessages    | boolean    | 若设为 true，验证错误将不会返回给客户端。                                          |
| errorHttpStatusCode     | number     | 此设置允许您指定发生错误时将使用的异常类型，默认情况下会抛出 BadRequestException。 |
| exceptionFactory        | Function   | 接收验证错误数组并返回要抛出的异常对象。                                           |
| groups                  | string[]   | 验证对象时使用的分组。                                                             |
| always                  | boolean    | 为装饰器的 always 选项设置默认值。该默认值可在装饰器选项中覆盖。                   |
| strictGroups            | boolean    | 如果未提供 groups 或为空，则忽略至少包含一个组的装饰器。                           |
| dismissDefaultMessages  | boolean    | 如果设为 true，验证将不使用默认消息。若未显式设置，错误消息将始终为 undefined。    |
| validationError.target  | boolean    | 指示是否应在 ValidationError 中暴露目标对象。                                      |
| validationError.value   | boolean    | 指示是否应将验证值暴露在 ValidationError 中。                                      |
| stopAtFirstError        | boolean    | 当设置为 true 时，给定属性的验证将在遇到第一个错误后停止。默认为 false。           |

:::info 注意
更多关于 `class-validator` 包的信息请参阅其[代码库](https://github.com/typestack/class-validator) 。
:::


#### 自动验证

我们首先将在应用级别绑定 `ValidationPipe`，从而确保所有端点都受到保护，不会接收错误数据。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

为了测试我们的管道，让我们创建一个基本端点。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
```

:::info 提示
由于 TypeScript 不会存储关于**泛型或接口**的元数据，当你在 DTO 中使用它们时，`ValidationPipe` 可能无法正确验证传入数据。因此，请考虑在 DTO 中使用具体类。
:::

:::info 提示
导入 DTO 时，不能使用仅类型导入，因为这在运行时会被擦除，即记得使用 `import { CreateUserDto }` 而不是 `import type { CreateUserDto }` 。
:::

现在我们可以在 `CreateUserDto` 中添加一些验证规则。我们使用 `class-validator` 包提供的装饰器来实现这一点，具体描述见[此处](https://github.com/typestack/class-validator#validation-decorators) 。通过这种方式，任何使用 `CreateUserDto` 的路由都会自动执行这些验证规则。

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

有了这些规则后，如果请求到达我们的端点时请求体中的 `email` 属性无效，应用程序会自动返回 `400 Bad Request` 状态码，并附带以下响应体：

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}
```

除了验证请求体外，`ValidationPipe` 还可以与其他请求对象属性一起使用。假设我们希望在端点路径中接受 `:id` 参数。为了确保只接受数字作为此请求参数，我们可以使用以下结构：

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
```

`FindOneParams` 就像一个 DTO，它只是一个使用 `class-validator` 定义验证规则的类。其结构如下：

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}
```

#### 禁用详细错误信息

错误信息有助于解释请求中的错误，但在某些生产环境中，建议禁用详细错误。可以通过向 `ValidationPipe` 传递一个选项对象来实现：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  })
);
```

这样处理后，响应体中就不会显示详细的错误信息。

#### 剥离属性

我们的 `ValidationPipe` 还能过滤掉不应被方法处理器接收的属性。此时，我们可以将可接受的属性**加入白名单** ，任何未包含在白名单中的属性都会自动从结果对象中剔除。例如，如果处理器需要 `email` 和 `password` 属性，但请求中还包含 `age` 属性，该属性就会自动从最终 DTO 中移除。要启用此行为，需将 `whitelist` 设为 `true`。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  })
);
```

当设置为 true 时，这将自动移除非白名单属性（即验证类中没有任何装饰器的属性）。

或者，您可以选择在出现非白名单属性时终止请求处理，并向用户返回错误响应。要启用此功能，需将 `forbidNonWhitelisted` 选项属性设为 `true`，同时将 `whitelist` 设为 `true`。

#### 转换负载对象

通过网络传输的有效载荷是纯 JavaScript 对象。`ValidationPipe` 可以自动将这些有效载荷转换为根据其 DTO 类定义类型的对象。要启用自动转换功能，需将 `transform` 设置为 `true`。这可以在方法级别进行配置：

 ```typescript title="cats.controller.ts"
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

要全局启用此行为，可在全局管道上设置该选项：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  })
);
```

当启用自动转换选项后，`ValidationPipe` 还会执行基本类型的转换。在以下示例中，`findOne()` 方法接收一个表示提取的路径参数 `id` 的参数：

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
```

默认情况下，每个路径参数和查询参数在网络传输时都是 `string` 类型。在上例中，我们将 `id` 类型指定为 `number`（在方法签名中）。因此，`ValidationPipe` 会尝试将字符串标识符自动转换为数字。

#### 显式转换

在上节中，我们展示了 `ValidationPipe` 如何根据预期类型隐式转换查询和路径参数。但此功能需要启用自动转换。

另一种方式（禁用自动转换时），您可以使用 `ParseIntPipe` 或 `ParseBoolPipe` 显式转换值（注意不需要 `ParseStringPipe`，因为如前所述，默认情况下每个路径参数和查询参数在网络传输时都是 `string` 类型）。

```typescript
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}
```

:::info 提示
`ParseIntPipe` 和 `ParseBoolPipe` 是从 `@nestjs/common` 包导出的。
:::

#### 映射类型

在构建 **CRUD**（创建/读取/更新/删除）等功能时，基于基础实体类型创建变体通常很有用。Nest 提供了几个实用函数来执行类型转换，使这项任务更加便捷。

:::warning 警告
如果您的应用使用了 `@nestjs/swagger` 包，请参阅[本章节](/openapi/mapped-types)了解有关 Mapped Types 的更多信息。同样地，如果使用 `@nestjs/graphql` 包，请查看[本章节](/graphql/mapped-types) 。这两个包都重度依赖类型系统，因此需要采用不同的导入方式。如果您错误地使用了 `@nestjs/mapped-types`（而非根据应用类型选择正确的 `@nestjs/swagger` 或 `@nestjs/graphql`），可能会遇到各种未记录的副作用。
:::



构建输入验证类型（也称为 DTO）时，通常需要在同一类型上创建 **create**（创建）和 **update**（更新）变体。例如，**create** 变体可能需要所有字段，而 **update** 变体则可能将所有字段设为可选。

Nest 提供了 `PartialType()` 实用函数来简化这一任务并减少样板代码。

`PartialType()` 函数返回一个类型（类），其中输入类型的所有属性都被设置为可选。例如，假设我们有一个如下所示的 **create** 类型：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

默认情况下，所有这些字段都是必填的。要创建一个具有相同字段但每个字段都可选的类型，可使用 `PartialType()` 并传入类引用（`CreateCatDto`）作为参数：

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

:::info 注意
`PartialType()` 函数是从 `@nestjs/mapped-types` 包导入的。
:::


`PickType()` 函数通过从输入类型中选择一组属性来构造新类型（类）。例如，假设我们从以下类型开始：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

我们可以使用 `PickType()` 实用函数从该类中选择一组属性：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

:::info 注意
`PickType()` 函数是从 `@nestjs/mapped-types` 包导入的。
:::


`OmitType()` 函数通过从输入类型中选取所有属性，然后移除特定键集合来构造一个类型。例如，假设我们从以下类型开始：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

我们可以生成一个派生类型，该类型包含除**除** `name` 之外的所有属性，如下所示。在这个结构中，`OmitType` 的第二个参数是一个属性名称数组。

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

:::info 注意
`OmitType()` 函数是从 `@nestjs/mapped-types` 包导入的。
:::


`IntersectionType()` 函数将两种类型合并为一个新类型（类）。例如，假设我们有以下两种类型：

```typescript
export class CreateCatDto {
  name: string;
  breed: string;
}

export class AdditionalCatInfo {
  color: string;
}
```

我们可以生成一个包含两种类型所有属性的新类型。

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo
) {}
```

:::info 提示
`IntersectionType()` 函数是从 `@nestjs/mapped-types` 包中导入的。
:::

类型映射工具函数是可组合的。例如，以下代码将生成一个类型（类），该类型包含除 `name` 之外 `CreateCatDto` 类型的所有属性，并且这些属性将被设置为可选：

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const)
) {}
```

#### 解析和验证数组

由于 TypeScript 不会存储泛型或接口的元数据，因此当您在 DTO 中使用它们时，`ValidationPipe` 可能无法正确验证传入的数据。例如，在以下代码中，`createUserDtos` 将无法被正确验证：

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}
```

要验证数组，可以创建一个包含包装数组属性的专用类，或者使用 `ParseArrayPipe`。

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}
```

此外，`ParseArrayPipe` 在解析查询参数时可能非常有用。让我们考虑一个 `findByIds()` 方法，它根据作为查询参数传递的标识符返回用户。

```typescript
@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}
```

这种结构会验证来自 HTTP `GET` 请求的传入查询参数，如下所示：

```bash
GET /?ids=1,2,3
```

#### WebSockets 与微服务

虽然本章展示了使用 HTTP 风格应用程序（如 Express 或 Fastify）的示例，但 `ValidationPipe` 对于 WebSocket 和微服务同样适用，无论使用何种传输方法。

#### 了解更多

阅读更多关于自定义验证器、错误消息以及 `class-validator` 包提供的可用装饰器的信息，请点击[此处](https://github.com/typestack/class-validator) 。
