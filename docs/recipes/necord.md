<!-- 此文件从 content/recipes/necord.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:13:56.888Z -->
<!-- 源文件: content/recipes/necord.md -->

### Necord

Necord 是一个功能强大的模块，可以简化创建 __LINK_30__ 机器人的过程，将其与您的 NestJS 应用程序进行无缝集成。

> 信息 **注意** Necord 是第三方包，官方维护团队不是 NestJS 核心团队。如果您遇到任何问题，请在 __LINK_31__ 中报告。

#### 安装

开始使用 Necord，您需要安装 Necord 及其依赖项 __LINK_32__。

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

> 信息 **提示** 您可以在 __LINK_33__ 中找到可用的意图列表。

使用该设置，您可以将 __INLINE_CODE_17__ 注入到提供者中，以便轻松注册命令、事件等。

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

##### 理解上下文

您可能注意到了 __INLINE_CODE_18__ 装饰器在上面的示例中。这装饰器将事件上下文注入到方法中，使您可以访问各种事件特定的数据。由于有多种类型的事件，上下文类型将使用 __INLINE_CODE_19__ 类型来推断。您可以使用 __INLINE_CODE_20__ 装饰器轻松访问上下文变量，该装饰器将变量填充为与事件相关的数组。

#### 文本命令

> 警告 **注意** 文本命令依赖于消息内容，该内容将在验证机器人和拥有超过 100 服务器的应用程序中被弃用。这意味着，如果您的机器人无法访问消息内容，文本命令将无法工作。了解更多关于这项更改的信息 __LINK_34__。

以下是使用 __INLINE_CODE_21__ 装饰器创建简单命令处理器的示例：

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

#### 应用程序命令

应用程序命令提供了一个本地方式，让用户在 Discord 客户端中与您的应用程序进行交互。有三种类型的应用程序命令可以通过不同的界面访问：聊天输入、消息上下文菜单（通过右键单击消息访问）和用户上下文菜单（通过右键单击用户访问）。

__HTML_TAG_27____HTML_TAG_28____HTML_TAG_29__

#### 切换命令

切换命令是交互用户的结构化方式。它们允许您创建带有精确参数和选项的命令，从而提高用户体验。

要使用 Necord 定义切换命令，可以使用 __INLINE_CODE_22__ 装饰器。

```typescript
@ApiProperty({ type: [String] })
names: string[];
```

> 信息 **提示** 当您的机器人客户端登录时，它将自动注册所有定义的命令。注意，全球命令将在 1 小时内缓存以避免问题。要避免全球缓存问题，使用 Necord 模块的 __INLINE_CODE_23__ 参数，限制命令可见性到单个服务器。

##### 选项

您可以使用选项装饰器为您的切换命令定义参数。让我们创建一个 __INLINE_CODE_24__ 类以满足这个需求：

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```

然后，您可以使用这个 DTO 在 __INLINE_CODE_25__ 类中：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

要查看内置选项装饰器的完整列表，请访问 __LINK_35__。

##### 自动完成

要实现自动完成功能，您需要创建一个拦截器。这拦截器将处理请求，因为用户在自动完成字段中输入内容。

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

您还需要将 options 类标记为 __INLINE_CODE_26__：

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

最后，应用拦截器到您的切换命令：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

#### 用户上下文菜单

用户命令出现在右键单击用户时的上下文菜单中，这些命令提供了快速操作，直接作用于用户。

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

#### 消息上下文菜单

消息命令出现在右键单击消息时的上下文菜单中，允许快速操作相关消息。

```yaml
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```

#### 按钮

__LINK_36__ 是交互元素，可以包含在消息中。当单击时，它将发送 __LINK_37__ 到您的应用程序。

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

__LINK_38__ 是另一种交互组件，在消息中出现，提供了下拉式 UI，让用户选择选项。

```typescript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```

要查看内置选择菜单组件的完整列表，请访问 __LINK_39__。

#### 模态

模态是弹出窗口，允许用户提交格式化的输入。以下是使用 Necord 创建和处理模态的示例：

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

访问 __LINK_40__ 网站以获取更多信息。