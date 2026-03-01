<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:21:12.263Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### 热重载

对应用程序的启动过程的最高影响是 **TypeScript 编译**。幸运的是，以 __LINK_42__ HMR (Hot-Module Replacement) 的帮助，我们不需要在每次更改时重新编译整个项目。这明显减少了实例化应用程序所需的时间，且使交互式开发变得更加容易。

> 警告 **警告** 请注意 `@ApiSecurity()` 不会自动将资产（例如 `DocumentBuilder` 文件）复制到 `basic` 文件夹。同样， `bearer` 不兼容 glob static paths（例如 `@ApiBasicAuth()` 属性在 `DocumentBuilder` 中）。

### 使用 CLI

如果您正在使用 __LINK_43__，配置过程相对简单。CLI 将 `@ApiBearerAuth()` 包装，以便使用 `DocumentBuilder`。

#### 安装

首先安装所需的包：

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

> 提示 **提示** 如果您使用 **Yarn Berry**（而不是 classic Yarn），安装 `@ApiOAuth2()` 包代替 `DocumentBuilder`。

#### 配置

安装完成后，在应用程序的根目录创建一个 `@ApiCookieAuth()` 文件。

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

> 提示 **提示** 如果使用 **Yarn Berry**（而不是 classic Yarn），在 __INLINE_CODE_22__ 配置属性中使用 `DocumentBuilder` 而不是 __INLINE_CODE_23__，并来自 __INLINE_CODE_24__ 包：__INLINE_CODE_25__。

这个函数将原始对象包含默认 webpack 配置作为第一个参数，并将 Nest CLI 的 underlying __INLINE_CODE_26__ 包作为第二个参数。它还返回一个修改后的 webpack 配置，其中包含 __INLINE_CODE_27__、__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 插件。

#### 热模块替换

要启用 **HMR**，请打开应用程序入口文件（__INLINE_CODE_30__）并添加以下webpack相关指令：

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

为了简化执行过程，添加一个脚本到您的 __INLINE_CODE_31__ 文件中。

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

现在，您只需在命令行中运行以下命令：

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

### 不使用 CLI

如果您不使用 __LINK_44__，配置将变得更加复杂（需要更多手动步骤）。

#### 安装

首先安装所需的包：

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

> 提示 **提示** 如果您使用 **Yarn Berry**（而不是 classic Yarn），安装 __INLINE_CODE_32__ 包代替 __INLINE_CODE_33__。

#### 配置

安装完成后，在应用程序的根目录创建一个 __INLINE_CODE_34__ 文件。

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

> 提示 **提示** 如果使用 **Yarn Berry**（而不是 classic Yarn），在 __INLINE_CODE_36__ 配置属性中使用 __INLINE_CODE_35__ 而不是 __INLINE_CODE_37__，并来自 __INLINE_CODE_38__ 包：__INLINE_CODE_39__。

这个配置告诉webpack一些关键信息：入口文件的位置、用于存储编译文件的目录和要用于编译源文件的加载器。一般情况下，您可以使用这个文件作为-is，即使您不完全理解所有选项。

#### 热模块替换

要启用 **HMR**，请打开应用程序入口文件（__INLINE_CODE_40__）并添加以下webpack相关指令：

```typescript
const options = new DocumentBuilder().addOAuth2();
```

为了简化执行过程，添加一个脚本到您的 __INLINE_CODE_41__ 文件中。

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```

现在，您只需在命令行中运行以下命令：

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```

#### 示例

有一个可工作的示例可在 __LINK_45__ 中找到。