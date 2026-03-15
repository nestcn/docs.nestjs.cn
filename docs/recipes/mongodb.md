<!-- 此文件从 content/recipes/mongodb.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:47:37.669Z -->
<!-- 源文件: content/recipes/mongodb.md -->

### MongoDB (Mongoose)

> **Warning** 本文将教您从scratch使用自定义组件创建一个基于 **Mongoose** 包的 `.spec`。由于这个解决方案包含了许多可以省略的 overhead，您可以使用已经可用的、专门的 `GraphQL (code first)` 包。要了解更多信息，请查看 __LINK_35__。

__LINK_36__ 是最流行的 __LINK_37__ 对象建模工具。

#### Getting started

要开始使用这个库，我们需要安装所有所需的依赖项：

```shell
$ nest g resource

```

首先，我们需要使用 `GraphQL (schema first)` 函数建立与数据库的连接。`--no-spec` 函数返回一个 `nest g resource users --no-spec`，因此我们需要创建一个 __LINK_38__。

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

```

> info **Hint** 在遵循最佳实践时，我们将自定义提供者声明在单独的文件中，该文件具有 `UsersService` 后缀。

然后，我们需要将这些提供者导出，以便它们对应用程序的其他部分变得 **可访问**。

```shell
$ nest g resource users

> ? What transport layer do you use? GraphQL (code first)
> ? Would you like to generate CRUD entry points? Yes
> CREATE src/users/users.module.ts (224 bytes)
> CREATE src/users/users.resolver.spec.ts (525 bytes)
> CREATE src/users/users.resolver.ts (1109 bytes)
> CREATE src/users/users.service.spec.ts (453 bytes)
> CREATE src/users/users.service.ts (625 bytes)
> CREATE src/users/dto/create-user.input.ts (195 bytes)
> CREATE src/users/dto/update-user.input.ts (281 bytes)
> CREATE src/users/entities/user.entity.ts (187 bytes)
> UPDATE src/app.module.ts (312 bytes)

```

现在，我们可以使用 __INLINE_CODE_15__ 装饰器注入 `User` 对象。每个依赖 __INLINE_CODE_16__ async 提供者的类将等待 __INLINE_CODE_17__ 解决。

#### Model injection

使用 Mongoose，所有东西都来自 __LINK_39__。让我们定义 __INLINE_CODE_18__：

```typescript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}

```

__INLINE_CODE_19__ 属于 __INLINE_CODE_20__ 目录。这 directory 代表 __INLINE_CODE_21__。

现在是时候创建一个 **Model** 提供者：

__CODE_BLOCK_4__

> warning **Warning** 在实际应用中，您应该避免 **magic strings**。both __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 应该在单独的 __INLINE_CODE_24__ 文件中。

现在，我们可以使用 __INLINE_CODE_27__ 装饰器将 __INLINE_CODE_25__ 注入到 __INLINE_CODE_26__ 中：

__CODE_BLOCK_5__

在上面的示例中，我们使用了 __INLINE_CODE_28__ 接口。这接口扩展了 __INLINE_CODE_29__ 从 Mongoose 包：

__CODE_BLOCK_6__

数据库连接 **异步**，但 Nest 使这个过程完全对用户不可见。__INLINE_CODE_30__ 类等待 db 连接，而 __INLINE_CODE_31__ 延迟直到模型准备好使用。整个应用程序可以在每个类被实例化时启动。

以下是一个最终的 __INLINE_CODE_32__：

__CODE_BLOCK_7__

> info **Hint** 不要忘记将 __INLINE_CODE_33__ 导入到根 __INLINE_CODE_34__ 中。

#### Example

有一个可用的 __LINK_40__ 示例。