<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:12:51.789Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

对应用程序的启动过程中，**TypeScript 编译**影响最为最大。幸运的是，使用 __LINK_42__ HMR (Hot-Module Replacement)，我们不需要在每次更改时重新编译整个项目。这使得实时开发变得更加轻松。

> 警告 **注意** `@ApiSecurity()` 不会自动将资产（例如 `DocumentBuilder` 文件）复制到 `basic` 文件夹中。类似地， `bearer` 不兼容_glob静态路径（例如 `@ApiBasicAuth()` 属性在 `DocumentBuilder` 中）。

### With CLI

如果您使用了 __LINK_43__，配置过程非常简单。CLI 将 `@ApiBearerAuth()` 包括 `DocumentBuilder`。

#### 安装

首先安装所需的包：

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

> 提示 **提示** 如果您使用 **Yarn Berry**（而不是 classic Yarn），安装 `@ApiOAuth2()` 包代 `DocumentBuilder`。

#### 配置

安装完成后，创建应用程序根目录中的 `@ApiCookieAuth()` 文件。

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

> 提示 **提示** 使用 **Yarn Berry**（而不是 classic Yarn），在 __INLINE_CODE_22__ 配置属性中使用 __INLINE_CODE_23__ 而不是 `DocumentBuilder`。从 __INLINE_CODE_24__ 包中获取 __INLINE_CODE_25__。

#### Hot-Module Replacement

要启用 **HMR**，打开应用程序入口文件（__INLINE_CODE_30__）并添加以下 Webpack 相关指令：

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

为了简化执行过程，添加脚本到您的 __INLINE_CODE_31__ 文件中。

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

现在，您可以在命令行中运行以下命令：

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

### Without CLI

如果您不使用 __LINK_44__，配置将变得更加复杂（需要更多手动步骤）。

#### 安装

首先安装所需的包：

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

> 提示 **提示** 如果您使用 **Yarn Berry**（而不是 classic Yarn），安装 __INLINE_CODE_32__ 包代 __INLINE_CODE_33__。

#### 配置

安装完成后，创建应用程序根目录中的 __INLINE_CODE_34__ 文件。

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

> 提示 **提示** 使用 **Yarn Berry**（而不是 classic Yarn），在 __INLINE_CODE_36__ 配置属性中使用 __INLINE_CODE_37__ 而不是 __INLINE_CODE_35__。从 __INLINE_CODE_38__ 包中获取 __INLINE_CODE_39__。

#### Hot-Module Replacement

要启用 **HMR**，打开应用程序入口文件（__INLINE_CODE_40__）并添加以下 Webpack 相关指令：

```typescript
const options = new DocumentBuilder().addOAuth2();
```

为了简化执行过程，添加脚本到您的 __INLINE_CODE_41__ 文件中。

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

可用的工作示例在 __LINK_45__ 中。