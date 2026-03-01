<!-- 此文件从 content/recipes/necord.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:20:54.272Z -->
<!-- 源文件: content/recipes/necord.md -->

### Necord

Necord 是一个强大的模块，可以简化创建 __LINK_30__ 机器人的过程，从而实现与 NestJS 应用程序的无缝集成。

> info **注意** Necord 是第三方包，不是 NestJS 内核团队官方维护的。如果您遇到任何问题，请在 __LINK_31__ 中报告。

#### 安装

要开始使用 Necord，需要安装 Necord 和其依赖项 __LINK_32__。

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

#### 使用

要在项目中使用 Necord，需要导入 __INLINE_CODE_16__ 并配置必要的选项。

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

> info **提示** 可以在 __LINK_33__ 中找到可用的意图列表。

通过这种设置，可以将 __INLINE_CODE_17__ 注入到提供者中，以便轻松注册命令、事件等。

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

##### 理解上下文

您可能已经注意到了 __INLINE_CODE_18__ 装饰器在示例中。这个装饰器将事件上下文注入到方法中，使您能够访问各种事件特定的数据。由于有多种事件类型，上下文类型将使用 __INLINE_CODE_19__ 类型进行推断。您可以使用 __INLINE_CODE_20__ 装饰器轻松访问上下文变量，该变量将填充与事件相关的参数数组。

#### 文本命令

> warning **注意** 文本命令依赖于消息内容，这个内容将在验证机器人和拥有超过 100 服务器的应用程序中被弃用。因此，如果您的机器人无法访问消息内容，文本命令将无法工作。了解更多关于这个变化的信息 __LINK_34__。

下面是一个使用 __INLINE_CODE_21__ 装饰器创建简单命令处理程序的示例。

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

#### 应用程序命令

应用程序命令提供了一种 native 的方式，让用户在 Discord 客户端中与应用程序交互。有三个类型的应用程序命令可以通过不同的界面访问：聊天输入、消息上下文菜单（在右键单击消息时访问）和用户上下文菜单（在右键单击用户时访问）。

__HTML_TAG_27__ _______ __HTML_TAG_28__ _______ __HTML_TAG_29__

#### 刷命令

刷命令是一种非常好的方式，让用户在结构化的方式与机器人交互。它们允许您创建带有精确参数和选项的命令，提高用户体验。

要使用 Necord 定义刷命令，可以使用 __INLINE_CODE_22__ 装饰器。

```typescript
@ApiProperty({ type: [String] })
names: string[];
```

> info **提示** 当机器人客户端登录时，它将自动注册所有定义的命令。请注意，全球命令将在 1 小时内缓存。为了避免全球缓存问题，使用 Necord 模块的 __INLINE_CODE_23__ 参数，限制命令的可见性到单个服务器。

##### 选项

您可以使用选项装饰器来定义参数。让我们创建一个 __INLINE_CODE_24__ 类以便：

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```

然后，您可以使用这个 DTO 在 __INLINE_CODE_25__ 类中：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

要查看可用的内置选项装饰器，请访问 __LINK_35__。

##### 自动完成

要实现自动完成功能，您需要创建一个拦截器。这将处理用户在自动完成字段中输入的请求。

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

您还需要将选项类标记为 __INLINE_CODE_26__：

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

最后，应用拦截器到刷命令：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

#### 用户上下文菜单

用户命令出现在右键单击用户时的上下文菜单中，这些命令提供了快速的用户操作。

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

#### 消息上下文菜单

消息命令出现在右键单击消息时的上下文菜单中，这些命令提供了快速的消息相关操作。

```yaml
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```

#### 按钮

__LINK_36__ 是可交互的元素，可以包含在消息中。当点击时，它将发送 __LINK_37__ 到应用程序。

```typescript
// generated client-side code
export class CatDetail {
  breed: CatDetailEnum;
}

export class CatInformation {
  breed: CatInformationEnum;
}

export enum CatDetailEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}

export enum CatInformationEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}
```

#### 选择菜单

__LINK_38__ 是另一种交互组件，可以出现在消息中。它们提供了一个下拉式 UI，让用户选择选项。

```typescript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```

要查看可用的内置选择菜单组件，请访问 __LINK_39__。

#### 模态

模态是弹出窗口，允许用户提交格式化的输入。下面是一个使用 Necord 创建和处理模态的示例：

```yaml
CatDetail:
  type: 'object'
  properties:
    ...
    - breed:
        schema:
          $ref: '#/components/schemas/CatBreed'
CatBreed:
  type: string
  enum:
    - Persian
    - Tabby
    - Siamese
```

#### 更多信息

请访问 __LINK_40__ 网站以获取更多信息。