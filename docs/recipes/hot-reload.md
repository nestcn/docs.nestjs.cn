<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:14:00.540Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

对应用程序的启动过程中，**TypeScript 编译**是影响最大的因素。幸运的是，使用 __LINK_42__ HMR（Hot-Module Replacement），我们不需要重新编译整个项目，每当出现变化时。这样可以大大减少应用程序实例化所需的时间，并使开发更加灵活。

> 警告 **Warning** 请注意,`@ApiSecurity()`不会自动将资产（例如`DocumentBuilder`文件）复制到`basic`文件夹中。同样,`bearer`不兼容 glob 静态路径（例如`@ApiBasicAuth()`属性在`DocumentBuilder`文件中）。

### 使用 CLI

如果您使用 __LINK_43__，配置过程相对简单。CLI 将 `@ApiBearerAuth()`包装，以便使用 `DocumentBuilder`。

#### 安装

首先安装所需的包：

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

> 提示 **Hint** 如果您使用 **Yarn Berry**（不是classic Yarn），请安装 `@ApiOAuth2()`包，而不是 `DocumentBuilder`。

#### 配置

安装完成后，创建一个 `@ApiCookieAuth()`文件在应用程序根目录。

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

> 提示 **Hint** 使用 **Yarn Berry**（不是classic Yarn），在 __INLINE_CODE_22__ 配置属性中，而不是使用 `DocumentBuilder`，使用 __INLINE_CODE_23__来自 __INLINE_CODE_24__ 包：__INLINE_CODE_25__。

这个函数将原始对象包含默认webpack配置作为第一个参数，并将Nest CLI 中的__INLINE_CODE_26__包引用作为第二个参数。它还返回一个修改后的webpack配置，添加了 __INLINE_CODE_27__, __INLINE_CODE_28__, 和 __INLINE_CODE_29__ 插件。

#### Hot-Module Replacement

要启用 **HMR**，打开应用程序入口文件（__INLINE_CODE_30__）并添加以下webpack相关指令：

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

为了简化执行过程，添加一个脚本到您的 __INLINE_CODE_31__ 文件。

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

现在，您可以在命令行中运行以下命令：

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

### 不使用 CLI

如果您不使用 __LINK_44__，配置将更加复杂（需要更多手动步骤）。

#### 安装

首先安装所需的包：

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

> 提示 **Hint** 如果您使用 **Yarn Berry**（不是classic Yarn），请安装 __INLINE_CODE_32__包，而不是 __INLINE_CODE_33__。

#### 配置

安装完成后，创建一个 __INLINE_CODE_34__文件在应用程序根目录。

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

> 提示 **Hint** 使用 **Yarn Berry**（不是classic Yarn），在 __INLINE_CODE_36__ 配置属性中，而不是使用 __INLINE_CODE_35__，使用 __INLINE_CODE_37__来自 __INLINE_CODE_38__ 包：__INLINE_CODE_39__。

这个配置告诉webpack一些关于应用程序的基本信息：入口文件的位置、编译文件的存储目录和要使用的加载器。通常，您可以将这个文件作为是，即使您不完全理解所有选项。

#### Hot-Module Replacement

要启用 **HMR**，打开应用程序入口文件（__INLINE_CODE_40__）并添加以下webpack相关指令：

```typescript
const options = new DocumentBuilder().addOAuth2();
```

为了简化执行过程，添加一个脚本到您的 __INLINE_CODE_41__ 文件。

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```

现在，您可以在命令行中运行以下命令：

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```

#### 示例

可用的示例可以在 __LINK_45__ 中找到。