## CLI 插件

[TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html) 的元数据反射系统存在若干限制，例如无法确定类包含哪些属性，或识别某个属性是可选的还是必需的。不过，其中部分限制可以在编译时得到解决。Nest 提供了一个插件来增强 TypeScript 的编译过程，从而减少所需的样板代码量。

> **提示** 此插件为**可选功能**。如果愿意，您可以手动声明所有装饰器，或仅在需要的地方声明特定装饰器。

#### 概述

Swagger 插件将自动：

- 为所有 DTO 属性添加 `@ApiProperty` 注解，除非使用了 `@ApiHideProperty`
- 根据问号设置 `required` 属性（例如 `name?: string` 将设置 `required: false`）
- 根据类型设置 `type` 或 `enum` 属性（同时支持数组类型）
- 根据赋值的默认值设置 `default` 属性
- 基于 `class-validator` 装饰器设置多个验证规则（当 `classValidatorShim` 设为 `true` 时）
- 为每个端点添加响应装饰器，包含正确的状态和 `type`（响应模型）
- 基于注释生成属性和端点的描述（如果 `introspectComments` 设置为 `true`）
- 基于注释为属性生成示例值（如果 `introspectComments` 设置为 `true`）

请注意，您的文件名**必须包含**以下后缀之一：`['.dto.ts', '.entity.ts']`（例如 `create-user.dto.ts`），才能被插件分析。

如果您使用不同的后缀，可以通过指定 `dtoFileNameSuffix` 选项来调整插件行为（见下文）。

以往若想通过 Swagger UI 提供交互体验，需要重复大量代码来让包知道您的模型/组件应如何在规范中声明。例如，您可以如下定义一个简单的 `CreateUserDto` 类：

```typescript
export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  roles: RoleEnum[] = [];

  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}
```

对于中型项目虽不算大问题，但一旦类数量庞大时就会变得冗长且难以维护。

通过[启用 Swagger 插件](#使用-cli-插件)，上述类定义可以简化为：

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}
```

> **注意** Swagger 插件会从 TypeScript 类型和 class-validator 装饰器推导出 `@ApiProperty()` 注解。这有助于为生成的 Swagger UI 文档清晰地描述您的 API。然而，运行时的验证仍将由 class-validator 装饰器处理。因此仍需继续使用如 `IsEmail()`、`IsNumber()` 等验证器。

因此，如果您打算依赖自动注解生成文档，同时仍希望进行运行时验证，那么 class-validator 装饰器仍然是必需的。

> **提示** 在 DTO 中使用[映射类型工具](../openapi/mapped-types)（如 `PartialType`）时，请从 `@nestjs/swagger` 而非 `@nestjs/mapped-types` 导入它们，以便插件能够识别模式。

该插件基于**抽象语法树**动态添加适当的装饰器。因此您无需为分散在代码中的 `@ApiProperty` 装饰器而烦恼。

> **提示** 插件会自动生成所有缺失的 swagger 属性，但如需覆盖这些属性，只需通过 `@ApiProperty()` 显式设置即可。

#### 注释自省功能

启用注释自省功能后，CLI 插件将根据注释生成属性的描述和示例值。

例如，给定一个示例属性 `roles`：

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
@ApiProperty({
  description: `A list of user's roles`,
  example: ['admin'],
})
roles: RoleEnum[] = [];
```

你必须同时复制描述和示例值。启用 `introspectComments` 后，CLI 插件能提取这些注释并自动为属性提供描述（若已定义，则包括示例）。现在，上述属性可简单声明如下：

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];
```

提供 `dtoKeyOfComment` 和 `controllerKeyOfComment` 两个插件选项，分别用于自定义插件如何为 `ApiProperty` 和 `ApiOperation` 装饰器赋值。参见下方示例：

```typescript
export class SomeController {
  /**
   * Create some resource
   */
  @Post()
  create() {}
}
```

这等同于以下指令：

```typescript
@ApiOperation({ summary: "Create some resource" })
```

> **提示** 对于模型而言，相同逻辑适用，但需改用 `ApiProperty` 装饰器。

对于控制器，您不仅可以提供摘要，还能添加描述（备注）、标签（例如 `@deprecated`）以及响应示例，如下所示：

```typescript
/**
 * Create a new cat
 *
 * @remarks This operation allows you to create a new cat.
 *
 * @deprecated
 * @throws {500} Something went wrong.
 * @throws {400} Bad Request.
 */
@Post()
async create(): Promise<Cat> {}
```

#### 使用 CLI 插件

要启用该插件，请打开 `nest-cli.json` 文件（如果使用 [Nest CLI](/cli/overview)）并添加以下 `plugins` 配置：

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

您可以使用 `options` 属性来自定义插件的行为。

```json
{
  "collection": "@nestjs/schematics", 
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": false,
          "introspectComments": true,
          "skipAutoHttpCode": true
        }
      }
    ]
  }
}
```

`options` 属性需满足以下接口要求：

```typescript
export interface PluginOptions {
  dtoFileNameSuffix?: string[];
  controllerFileNameSuffix?: string[];
  classValidatorShim?: boolean;
  dtoKeyOfComment?: string;
  controllerKeyOfComment?: string;
  introspectComments?: boolean;
  skipAutoHttpCode?: boolean;
  esmCompatible?: boolean;
}
```

| 选项                     | 默认                        | 描述                                                                                                 |
| ------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `dtoFileNameSuffix`        | `['.dto.ts', '.entity.ts']` | DTO（数据传输对象）文件后缀                                                                          |
| `controllerFileNameSuffix` | `['.controller.ts']`              | Controller 文件后缀                                                                                  |
| `classValidatorShim`       | `true`                        | 如果设为 true，该模块将复用 class-validator 的验证装饰器（例如 @Max(10) 会在模式定义中添加 max: 10） |
| `dtoKeyOfComment`          | `'description'`               | 在 ApiProperty 上设置注释文本的属性键                                                                |
| `controllerKeyOfComment`   | `'summary'`                   | 设置 ApiOperation 注释文本的属性键                                                                   |
| `introspectComments`       | `false`                       | 如果设为 true，插件将根据注释为属性生成描述和示例值                                                  |
| `skipAutoHttpCode`         | `false`                       | 禁用控制器中自动添加 @HttpCode() 的功能                                                              |
| `esmCompatible`            | `false`                       | 如果设为 true，可解决使用 ESM({ "type": "module" })时遇到的语法错误                                  |

每当更新插件选项时，请确保删除 `/dist` 文件夹并重新构建应用程序。如果您不使用 CLI 而是使用自定义的 `webpack` 配置，可以将此插件与 `ts-loader` 结合使用：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),
```

#### SWC 构建器

对于标准设置（非 monorepo），要在 SWC 构建器中使用 CLI 插件，您需要按照[此处](../recipes/swc#类型检查)所述启用类型检查。

```bash
$ nest start -b swc --type-check
```

对于 monorepo 设置，请按照[此处](../recipes/swc#monorepo-和-cli-插件)的说明操作。

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

现在，序列化的元数据文件必须通过 `SwaggerModule#loadPluginMetadata` 方法加载，如下所示：

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

await SwaggerModule.loadPluginMetadata(metadata); // <-- here
const document = SwaggerModule.createDocument(app, config);
```

#### 与 `ts-jest` 集成（端到端测试）

运行端到端测试时，`ts-jest` 会实时在内存中编译您的源代码文件。这意味着它不会使用 Nest CLI 编译器，也不会应用任何插件或执行 AST 转换。

要启用该插件，请在您的端到端测试目录中创建以下文件：

```javascript
const transformer = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/swagger/plugin options (can be empty)
    },
    cs.program // "cs.tsCompiler.program" for older versions of Jest (<= v27)
  );
};
```

完成上述操作后，在您的 `jest` 配置文件中导入 AST 转换器。默认情况下（在初始应用程序中），端到端测试配置文件位于 `test` 文件夹下，名为 `jest-e2e.json`。

如果您使用的是 `jest@<29`，请使用以下代码片段。

```json
{
  ... // other configuration
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<path to the file created above>"]
      }
    }
  }
}
```

如果你使用 `jest@^29`，请使用下面的代码片段，因为之前的方法已被弃用。

```json
{
  ... // other configuration
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": ["<path to the file created above>"]
        }
      }
    ]
  }
}
```

#### 排查 `jest` 端到端测试问题

如果 `jest` 似乎没有应用你的配置更改，可能是 Jest 已经**缓存**了构建结果。要应用新配置，你需要清除 Jest 的缓存目录。

要清除缓存目录，请在 NestJS 项目文件夹中运行以下命令：

```bash
$ npx jest --clearCache
```

若自动清理缓存失败，您仍可通过以下命令手动移除缓存文件夹：

```bash
# Find jest cache directory (usually /tmp/jest_rs)
# by running the following command in your NestJS project root
$ npx jest --showConfig | grep cache
# ex result:
#   "cache": true,
#   "cacheDirectory": "/tmp/jest_rs"

# Remove or empty the Jest cache directory
$ rm -rf  <cacheDirectory value>
# ex:
# rm -rf /tmp/jest_rs
```
