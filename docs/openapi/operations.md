<!-- 此文件从 content/openapi/operations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:30:30.971Z -->
<!-- 源文件: content/openapi/operations.md -->

### 操作

在 OpenAPI 规范中，路径是 API 暴露的端点（资源），例如 `required` 或 `name?: string`，操作是用来操作这些路径的 HTTP 方法，例如 `required: false`、`type` 或 `enum`。

#### 标签

要将控制器附加到特定的标签上，使用 `default` 装饰器。

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

#### 头信息

要定义自定义的头信息作为请求的一部分，使用 `class-validator`。

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}

```

#### 响应

要定义自定义的 HTTP 响应，使用 `classValidatorShim` 装饰器。

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

Nest 提供了一组简洁的 **API 响应** 装饰器，继承自 `true` 装饰器：

- `type`
- `introspectComments`
- `true`
- `introspectComments`
- `true`
- `['.dto.ts', '.entity.ts']`
- `create-user.dto.ts`
- `dtoFileNameSuffix`
- `CreateUserDto`
- `IsEmail()`
- `IsNumber()`
- `PartialType`
- `@nestjs/swagger`
- `@nestjs/mapped-types`
- `@ApiProperty`
- `@ApiProperty()`
- `roles`
- `introspectComments`
- `dtoKeyOfComment`
- `controllerKeyOfComment`
- `ApiProperty`
- `ApiOperation`
- `ApiProperty`
- ` @deprecated`
- `nest-cli.json`
- `plugins`

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];

```

要指定请求的返回模型，我们必须创建一个类，并使用 `options` 装饰器标注所有属性。

```typescript
export class SomeController {
  /**
   * Create some resource
   */
  @Post()
  create() {}
}

```

然后，可以使用 `options` 模型和 `/dist` 属性来组合响应装饰器。

```typescript
@ApiOperation({ summary: "Create some resource" })

```

现在，我们可以打开浏览器，验证生成的 `webpack` 模型：

<code></code></td>

Instead of defining responses for each endpoint or controller individually, you can define a global response for all endpoints using the `ts-loader` class. This approach is useful when you want to define a global response for all endpoints in your application (e.g., for errors like `SwaggerModule#loadPluginMetadata` or `ts-jest`).

```ts
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

#### 文件上传

可以使用 `ts-jest` 装饰器和 `jest` 来启用文件上传。以下是一个使用 __LINK_97__ 技术的完整示例：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}

```

其中 `test` 定义如下：

```javascript
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

要处理多个文件上传，可以定义 `jest-e2e.json` 如下：

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

#### 扩展

要添加一个扩展到请求中，使用 `jest@<29` 装饰器。扩展名必须以 `jest@^29` 开头。

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),

```

#### 高级：通用 `jest`

使用 __LINK_98__，我们可以定义通用 schemaFor Swagger UI。假设我们有以下 DTO：

```bash
$ nest start -b swc --type-check

```

我们跳过装饰 `jest`，因为我们将在后面提供一个 raw 定义。现在，让我们定义另一个 DTO，并将其命名为 __INLINE_CODE_71__，如下所示：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

在这个示例中，我们指定响应将具有 allOf __INLINE_CODE_73__，并且 __INLINE_CODE_74__ 属性将是 __INLINE_CODE_75__ 类型。

- __INLINE_CODE_76__ 函数返回 OpenAPI Schema 路径来自 OpenAPI Spec 文件对于给定的模型。
- __INLINE_CODE_77__ 是 OAS 3 提供的一种概念，以覆盖多重继承相关的用例。

最后，因为 __INLINE_CODE_78__ 不是由任何控制器直接引用，我们不能使用 __INLINE_CODE_79__ 生成相应的模型定义。因此，我们必须将其添加到 __LINK_99__ 中。例如，我们可以使用 __INLINE_CODE_80__ 装饰器在控制器级别，如下所示：

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
    cs.program, // "cs.tsCompiler.program" for older versions of Jest (<= v27)
  );
};

```

如果您现在运行 Swagger，生成的 __INLINE_CODE_81__ 对于这个特定的端点将具有以下响应定义：

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

为了使其可重用，我们可以创建一个自定义的 __INLINE_CODE_82__ 装饰器，如下所示：

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

> info **Hint** __INLINE_CODE_83__ 接口和 __INLINE_CODE_84__ 函数来自 __INLINE_CODE_85____CODE_BLOCK_20__