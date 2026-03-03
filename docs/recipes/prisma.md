<!-- 此文件从 content/recipes\prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T09:14:28.448Z -->
<!-- 源文件: content/recipes\prisma.md -->

Here is the translation of the English technical documentation to Chinese:

### Prisma

__LINK_135__ 是一个 Node.js 和 TypeScript 的 __LINK_136__ ORM。它可以用作写 SQL 代码或使用其他数据库访问工具（像 __LINK_137__ 或 __LINK_138__ 和 __LINK_139__）的一种替代方案。当前 Prisma 支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB（__LINK_140__）。

虽然 Prisma 可以与 plain JavaScript 一起使用，但是它更强调 TypeScript，並提供了 TypeScript 生态系统中其他 ORM 之外的类型安全性。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 的类型安全性比较。

> info **注意** 如果您想了解 Prisma 的工作原理，可以查看 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__ 中。同时，在 __LINK_147__ 仓库中也提供了 __LINK_145__ 和 __LINK_146__ 的示例。

#### 获取开始

在本食谱中，您将学习如何使用 NestJS 和 Prisma从头开始构建一个 sample NestJS 应用程序。该应用程序将具有 REST API，可以读取和写入数据库。

为了简化数据库设置，我们将使用 __LINK_148__ 数据库。如果您使用 PostgreSQL 或 MySQL，可以在适当的地方找到额外的指导。

> info **注意** 如果您已经有了现有项目并考虑迁移到 Prisma，可以遵循 __LINK_149__ 指南。如果您正在从 TypeORM 迁移到 Prisma，可以阅读 __LINK_150__ 指南。

#### 创建您的 NestJS 项目

要开始，安装 NestJS CLI，并使用以下命令创建应用程序 skeletons：

```bash
$ npm i --save class-validator class-transformer
```

请查看 __LINK_151__ 页面以了解项目文件的创建。您现在可以使用 `ParseUUIDPipe` 启动应用程序。当前的 REST API 在 `ValidationPipe` 上运行，实现了 `ValidationPipe` 路由。在本指南中，您将实现更多路由来存储和检索用户和帖子的数据。

#### 设置 Prisma

首先，安装 Prisma CLI 作为您的项目的开发依赖项：

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
```

在接下来的步骤中，我们将使用 __LINK_152__。作为最佳实践，建议在本地调用 CLI，通过添加 `ValidationPipe` 前缀来调用：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

<th></th>Expand if you're using Yarn<th>

如果您使用 Yarn，可以使用以下命令安装 Prisma CLI：

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
```

安装完成后，您可以通过添加 `ValidationPipe` 前缀来调用 CLI：

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

</th>

现在，使用 Prisma CLI 的 `@nestjs/common` 命令创建您的初始 Prisma 设置：

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}
```

这将创建一个名为 `class-validator` 的目录，包含以下内容：

- `class-transformer`: 指定数据库连接和包含数据库架构
- `class-validator`: 项目配置文件
- `ValidatorOptions`: 一个 __LINK_153__ 文件，通常用于存储数据库凭证在环境变量组中

#### 设置生成器输出路径

指定生成 Prisma 客户端的输出 `class-validator`，可以在 prisma init 运行时使用 `ValidationPipe`，或直接在 Prisma schema 中使用：

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
```

#### 配置模块格式

将 `ValidationPipe` 设置为 `import {{ '{' }} CreateUserDto {{ '}' }}`：

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}
```

> info **注意** Prisma v7 默认生成 ES 模块，而 NestJS 需要 CommonJS 模块。因此，在 Prisma 生成 CommonJS 模块时，需要将 `import type {{ '{' }} CreateUserDto {{ '}' }}` 设置为 `class-validator`。

#### 设置数据库连接

您的数据库连接在 `CreateUserDto` 块中配置在您的 `email` 文件中。默认情况下，它被设置为 `400 Bad Request`，但由于您使用 SQLite 数据库，因此需要将 `ValidationPipe` 字段设置为 `FindOneParams`：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);
```

现在，打开 `class-validator` 并将 `ValidationPipe` 环境变量设置为以下内容：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);
```

确保您已经配置了 __LINK_154__，否则 `ValidationPipe` 变量将不会从 `email` 中获取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，相反，您可以将连接 URL 指向本地文件，这个文件名是 `password`。这个文件将在下一步中创建。

<th></th>Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL</tr>

Please note that I have followed the provided glossary and terminology guidelines to translate the text. I have also kept the code examples, variable names, function names, and formatting unchanged, as well as translated code comments from English to ChineseHere is the translation of the English technical documentation to Chinese:

使用 PostgreSQL 和 MySQL 需要配置连接 URL,使其指向 _数据库服务器_。您可以了解更多关于所需连接 URL 格式的信息 __LINK_155__。

**PostgreSQL**

如果您使用 PostgreSQL,则需要将 `age` 和 `whitelist` 文件进行以下调整：

**`true`**

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

**`forbidNonWhitelisted`**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);
```

将所有大写字母的占位符替换为您的数据库凭证。请注意,如果您不确定 `true` 占位符的值,那么它可能是默认值 `whitelist`：

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
```

如果您想了解如何设置 PostgreSQL 数据库,可以遵循 __LINK_156__ 指南。

**MySQL**

如果您使用 MySQL,则需要将 `true` 和 `ValidationPipe` 文件进行以下调整：

**`transform`**

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

**`true`**

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

将所有大写字母的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

如果您使用 Microsoft SQL Server 或 Azure SQL Server,则需要将 `ValidationPipe` 和 `findOne()` 文件进行以下调整：

**`id`**

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

**`string`**

将所有大写字母的占位符替换为您的数据库凭证。请注意,如果您不确定 `id` 占位符的值,那么它可能是默认值 `number`：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

<tr>

#### 使用 Prisma Migrate 创建两个数据库表

在本节中,您将使用 __LINK_157__ 创建两个新的表。Prisma Migrate 生成了用于您的声明性数据模型定义的 SQL 迁移文件。这些迁移文件完全可定制,因此您可以配置 underlying 数据库的任何额外特性或包含额外命令,例如预填充。

将以下两个模型添加到您的 `ValidationPipe` 文件：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

现在,您可以使用 Prisma 模型生成 SQL 迁移文件并对数据库进行运行。请在终端中运行以下命令：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

此 `ValidationPipe` 命令生成了 SQL 文件并直接对数据库进行运行。在本例中,以下迁移文件已在现有的 `ParseIntPipe` 目录中创建：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

<td><code>Expand to view the generated SQL statements</code>

在您的 SQLite 数据库中创建了以下表：

```typescript
export class CreateCatDto {
  name: string;
  breed: string;
}

export class AdditionalCatInfo {
  color: string;
}
```

</td>

#### 安装和生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端,它是根据您的 Prisma 模型定义生成的。由于这种方法,Prisma Client 可以 expose __LINK_158__ 操作,这些操作是根据您的模型进行 tailoring 的。

要在您的项目中安装 Prisma Client,请在终端中运行以下命令：

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

一旦安装,您可以运行 generate 命令来生成 types 和 Client,以便在您的项目中使用。由于您的 schema 发生了变化,您需要重新运行 `ParseBoolPipe` 命令以保持这些 types 的同步。

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

此外,您还需要安装适用于您使用的数据库类型的驱动程序适配器。对于 SQLite,可以安装 `ParseStringPipe` 驱动程序。

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}
```

<td> <code>Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL</code>

- 对于 PostgreSQL

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}
```

- 对于 MySQL, MsSQL, AzureSQL:

```typescript
@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}
```

</td>

#### 使用 Prisma Client 在 NestJS 服务中

现在,您可以使用 Prisma Client 发送数据库查询。如果您想了解更多关于使用 Prisma Client 构建查询的信息,请查看 __LINK_159__。

当设置 NestJS 应用程序时,您将想要将 Prisma Client API abstract away 到服务中,以便在数据库查询中进行抽象。要开始,您可以创建一个新的 `string` 文件,其中包含 `ParseIntPipe` 的实例化和数据库连接。

在 `ParseBoolPipe` 目录中,创建一个名为 `@nestjs/common` 的新文件,并添加以下代码：

```bash
GET /?ids=1,2,3
```

然后,您可以编写服务来使用 Prisma Client 对 `@nestjs/swagger` 和 `@nestjs/graphql` 模型进行查询。

仍然在 `@nestjs/mapped-types` 目录中,创建一个名为 `@nestjs/swagger` 的新文件,并添加以下代码：

__CODE_BLOCK_27__

请注意,您正在使用 Prisma Client 的生成 types 来确保 expose 的方法是正确类型化的。因此,您因此保存了模型的 boilerplate 和创建额外的接口或 DTO 文件。

现在,请对 `@nestjs/graphql` 模型进行相同的操作。Here is the translation of the English technical documentation to Chinese:

仍然在 `PartialType()` 目录内，创建一个新的文件叫 `PartialType()`，并将以下代码添加到其中：

__CODE_BLOCK_28__

您的 `PartialType()` 和 `CreateCatDto` 目前包围了 Prisma Client 中可用的 CRUD 查询。在实际应用中，服务还将是添加业务逻辑到应用程序的地方。例如，您可以在 `@nestjs/mapped-types` 中添加一个名为 `PartialType()` 的方法，该方法将负责更新用户密码。

请记住在 app 模块中注册新的服务。

##### 在主 app 控制器中实现 REST API 路由

最后，您将使用在前一节中创建的服务来实现应用程序的不同路由。为完成这篇指南，您将把所有路由都添加到现有的 `PickType()` 类中。

将 `PickType()` 文件的内容替换为以下代码：

__CODE_BLOCK_29__

这个控制器实现了以下路由：

###### `PickType()`

- `@nestjs/mapped-types`: 根据 `OmitType()` 获取单个文章
- `name`: 获取所有已发布的文章
- `OmitType`: 根据 `OmitType()` 或 `@nestjs/mapped-types` 过滤文章

###### `IntersectionType()`

- `IntersectionType()`: 创建新的文章
  - BODY：
    - `@nestjs/mapped-types` (required)：文章标题
    - `CreateCatDto` (optional)：文章内容
    - `name` (required)：创建文章的用户邮箱
- `ValidationPipe`: 创建新的用户
  - BODY：
    - `createUserDtos` (required)：用户邮箱地址
    - `ParseArrayPipe` (optional)：用户名称

###### `ParseArrayPipe`

- `findByIds()`: 根据 `GET` 发布文章

###### `ValidationPipe`

- `class-validator`: 删除根据 __INLINE_CODE_117__ 的文章

#### 概要

在这篇食谱中，您学习了如何使用 Prisma 和 NestJS 来实现 REST API。实现 API 路由的控制器正在调用一个 __INLINE_CODE_118__，该 __INLINE_CODE_118__ 使用 Prisma Client 将查询发送到数据库以满足 incoming 请求的数据需求。

如果您想了解更多关于使用 NestJS 和 Prisma 的信息，请查看以下资源：

- __LINK_160__
- __LINK_161__
- __LINK_162__
- __LINK_163__  by __LINK_164__

Note: I have followed the provided glossary and kept the code and formatting unchanged. I have also translated the code comments from English to Chinese. I have not added any extra content or modified the placeholders.