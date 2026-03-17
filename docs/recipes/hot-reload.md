<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:31:38.587Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

对应用程序的启动过程影响最大的就是 **TypeScript 编译**。幸运的是，使用 __LINK_42__ HMR（Hot-Module Replacement），我们不需要在发生更改时重新编译整个项目。这可以大大减少应用程序的启动时间，并使开发更加便捷。

> warning **警告** 请注意,`GraphQL (schema first)`不会自动将资产（例如`--no-spec`文件）复制到`nest g resource users --no-spec`文件夹中。同样,`UsersService`不兼容 glob 静态路径（例如`User`属性在__INLINE_CODE_15__文件中）。

### 使用 CLI

如果您使用了 __LINK_43__，配置过程非常简单。CLI 将 __INLINE_CODE_16__ 包装，以便使用 __INLINE_CODE_17__。

#### 安装

首先安装所需的包：

```shell
$ nest g resource

```

> info **提示** 如果您使用 **Yarn Berry**（不是classic Yarn），安装 __INLINE_CODE_18__ 包代替 __INLINE_CODE_19__。

#### 配置

安装完成后，创建应用程序根目录下的 __INLINE_CODE_20__ 文件。

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

> info **提示** 使用 **Yarn Berry**（不是classic Yarn），在 __INLINE_CODE_22__ 配置属性中，而不是使用 __INLINE_CODE_21__，使用 __INLINE_CODE_23__ 从 __INLINE_CODE_24__ 包：__INLINE_CODE_25__。

这个函数将原始对象，包含默认 webpack 配置作为第一个参数，并将应用程序的根目录作为第二个参数。它还将返回一个修改后的 webpack 配置，添加了 __INLINE_CODE_27__、__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 插件。

#### Hot-Module Replacement

要启用 **HMR**，请打开应用程序启动文件 (__INLINE_CODE_30__)，并添加以下 webpack 相关指令：

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

为了简化执行过程，请在 __INLINE_CODE_31__ 文件中添加一个脚本。

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

现在，您可以在命令行中运行以下命令：

__CODE_BLOCK_4__

### 不使用 CLI

如果您不使用 __LINK_44__，配置将变得更加复杂（需要更多的手动步骤）。

#### 安装

首先安装所需的包：

__CODE_BLOCK_5__

> info **提示** 如果您使用 **Yarn Berry**（不是classic Yarn），安装 __INLINE_CODE_32__ 包代替 __INLINE_CODE_33__。

#### 配置

安装完成后，创建应用程序根目录下的 __INLINE_CODE_34__ 文件。

__CODE_BLOCK_6__

> info **提示** 使用 **Yarn Berry**（不是classic Yarn），在 __INLINE_CODE_36__ 配置属性中，而不是使用 __INLINE_CODE_35__，使用 __INLINE_CODE_37__ 从 __INLINE_CODE_38__ 包：__INLINE_CODE_39__。

这个配置告诉 webpack 关于应用程序的一些基本信息：入口文件的位置、编译文件的存储目录和要使用的加载器。通常，您可以使用这个文件，而不需要完全理解所有选项。

#### Hot-Module Replacement

要启用 **HMR**，请打开应用程序入口文件 (__INLINE_CODE_40__)，并添加以下 webpack 相关指令：

__CODE_BLOCK_7__

为了简化执行过程，请在 __INLINE_CODE_41__ 文件中添加一个脚本。

__CODE_BLOCK_8__

现在，您可以在命令行中运行以下命令：

__CODE_BLOCK_9__

#### 示例

有一个可工作的示例可在 __LINK_45__ 中找到。