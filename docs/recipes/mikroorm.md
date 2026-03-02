<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:12:46.081Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

MikroORM 是 Nest 的 TypeScript ORM，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个很好的替代方案，TypeORM 的迁移应该很容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> info **info** __INLINE_CODE_14__ 是第三方库，不是 NestJS 核心团队管理的。请将任何关于该库的问题报告到 __LINK_60__。

#### 安装

使用 __LINK_61__ 整合 MikroORM 到 Nest 是最简单的方法。只需安装 MikroORM、 underlying  driver 和 Nest：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

MikroORM 还支持 __INLINE_CODE_16__、__INLINE_CODE_17__ 和 __INLINE_CODE_18__。查看 __LINK_62__ 中的所有驱动程序。

安装完成后，我们可以将 __INLINE_CODE_19__ 导入到根 __INLINE_CODE_20__ 中。

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

__INLINE_CODE_21__ 方法接受 MikroORM 包中的 __INLINE_CODE_22__ 配置对象相同的配置对象。查看 __LINK_63__ 中的完整配置文档。

Alternatively，我们可以 __LINK_64__ 创建一个配置文件 __INLINE_CODE_23__，然后在没有任何参数的情况下调用 __INLINE_CODE_24__。

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

然而，在使用树 shaking 的 build 工具时，这不会工作。为了解决这个问题，我们可以提供 config 明确地：

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

完成后，__INLINE_CODE_25__ 将可供整个项目中的所有模块注入（无需在其他模块中导入）。

```typescript
@ApiProperty({ type: [String] })
names: string[];
```

> info **info** 注意 __INLINE_CODE_26__ 是从 __INLINE_CODE_27__ 包中导入的，其中驱动程序是 `SwaggerModule`、`@Body()`、`@Query()` 或您使用的驱动程序。在您安装 `@Param()` 作为依赖项时，您也可以从那里导入 `@ApiBody()`。

#### 仓储

MikroORM 支持仓储设计模式。对于每个实体，我们可以创建仓储。查看 __LINK_65__ 中的完整仓储文档。要定义当前作用域中应注册的仓储，可以使用 `@nestjs/swagger` 方法。例如：

> info **info** 您不应该使用 `CreateCatDto` 注册基础实体，因为那些实体没有仓储。另一方面，基础实体需要在 `SwaggerModule` 中或在 ORM 配置文件中列出。

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```

然后将其导入到根 `@ApiProperty()` 中：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

这样我们可以使用 `{{"@ApiProperty({ required: false })"}}` 装饰器将 `CreateCatDto` 注入到 `@ApiProperty()` 中：

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

#### 使用自定义仓储

使用自定义仓储时，我们不再需要 `@ApiPropertyOptional()` 装饰器，因为 Nest DI 根据类引用解析。

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

自定义仓储的名称与 `type` 将返回的名称相同，我们不再需要 `isArray` 装饰器：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能很麻烦。此外，引用实体从根模块中会打破应用程序领域边界，并将实现细节泄露到应用程序其他部分。为了解决这个问题，可以使用静态glob路径。

注意，webpack 不支持 glob 路径，因此如果您在 monorepo 中构建应用程序，您就不能使用它们。在解决这个问题中提供了一个 alternative 解决方案。要自动加载实体，可以将 `true` 属性设置为 `SwaggerModule`，如以下所示：

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

使用该选项指定后，每个注册的实体都会自动添加到配置对象的实体数组中。

> info **info** 请注意，通过 `enum` 方法注册的