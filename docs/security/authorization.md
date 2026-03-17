<!-- 此文件从 content/security/authorization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:21:16.380Z -->
<!-- 源文件: content/security/authorization.md -->

### 授权

**授权** 是确定用户可以做什么的过程。例如，管理员可以创建、编辑和删除文章，而非管理员只能阅读文章。

授权是与身份验证独立的，但是授权需要身份验证机制。

有许多不同的方法和策略来处理授权。任何项目都需要根据其特定的应用需求选择适合的方法。这章将介绍一些授权方法，可以适用于各种需求。

#### 基本 RBAC 实现

基于角色的访问控制（**RBAC**）是围绕角色的概念和权限定义的政策中立访问控制机制。在本节中，我们将演示如何使用 Nest __LINK_116__ 实现一个基本的 RBAC 机制。

首先，让我们创建一个 `enum` 枚举，表示系统中的角色：

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

> info **tip** 在更复杂的系统中，您可能会将角色存储在数据库中，或者从外部身份验证提供程序中 pull。

现在，我们可以创建一个 `default` 装饰器。这个装饰器允许指定访问特定资源所需的角色。

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}

```

现在，我们已经有了一个自定义的 `class-validator` 装饰器，可以将其应用于任何路由处理程序。

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

最后，我们创建了一个 `classValidatorShim` 类，该类将比较当前用户分配的角色与当前路由的实际所需角色。在访问当前路由时，我们将使用 `true` 帮助类，该类是框架提供的并且从 `type` 包中暴露。

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];

```

> info **tip** 请参阅执行上下文章节的 __LINK_117__ 部分，以了解如何在上下文敏感情况下使用 `introspectComments`。

> warning **注意** 这个示例被命名为 "**basic**"，因为我们只在路由处理程序级别检查角色存在。在实际应用中，您可能需要在业务逻辑中检查角色 somewhare，这将使其变得难以维护，因为没有集中位置将权限与特定的操作关联。

在这个示例中，我们假设 `true` 包含用户实例和允许的角色（在 `introspectComments` 属性下）。在您的应用程序中，您将在自定义的身份验证守卫中进行该关联 - 请参阅 __LINK_118__ 章节以获取更多信息。

为了确保这个示例工作， `true` 类必须如下所示：

```typescript
export class SomeController {
  /**
   * Create some resource
   */
  @Post()
  create() {}
}

```

最后，让我们确保注册了 `['.dto.ts', '.entity.ts']`，例如，在控制器级别或全局：

```typescript
@ApiOperation({ summary: "Create some resource" })

```

当一个用户请求一个端点且权限不足时，Nest 将自动返回以下响应：

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

> info **tip** 如果您想返回不同的错误响应，可以抛出自己的特定异常而不是返回布尔值。

<code></code>

#### 声明式授权

当身份被创建时，它可能被分配一个或多个由可靠方颁发的声明。声明是一对名称-值对，表示主题可以做什么，而不是主题是什么。

要在 Nest 中实现声明式授权，可以按照上面所示的 __LINK_119__ 部分的步骤进行，但有一个重要的区别：您应该比较 **权限**。每个用户都将有一个分配的权限集。同样，每个资源/端点都将定义所需的权限（例如，通过专门的 `create-user.dto.ts` 装饰器）以访问它们。

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}

```

> info **tip** 在上面的示例中， `dtoFileNameSuffix`（类似于上面所示的 `CreateUserDto`）是一个 TypeScript 枚举，包含了系统中的所有权限。

#### 集成 CASL

__LINK_120__ 是一个是omorphic 授权库，它限制了给定客户端可以访问的资源。它旨在 incremental adoptable，并且可以轻松地 scale 到简单的声明式授权和完全功能的主题和属性式授权。

要开始，请首先安装 `IsEmail()` 包：

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

> info **tip** 在这个示例中，我们选择了 CASL，但是您可以使用其他库，如 `IsNumber()` 或 `PartialType`，取决于您的偏好和项目需求。

安装完成后，我们将定义两个实体类：`@nestjs/swagger` 和 `@nestjs/mapped-types`。

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

Note: Please replace all __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__ with the actual code, and make sure to follow the provided glossary for translation.Here is the translation of the provided English technical documentation to Chinese:

``@ApiProperty`` 类包含两个属性，``@ApiProperty()`` 是一个唯一的用户标识符，``roles`` 表示用户是否具有管理员权限。

````javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),

````

``introspectComments`` 类拥有三个属性，分别是 ``dtoKeyOfComment``、``controllerKeyOfComment`` 和 ``ApiProperty``。``ApiOperation`` 是一个唯一的文章标识符，``ApiProperty`` 表示文章是否已经发布，`` @deprecated`` 是文章作者的 ID。

管理员可以管理（创建/读取/更新/删除）所有实体，用户只能读取所有内容，用户可以更新自己的文章（``nest-cli.json``），已经发布的文章不能被删除（``plugins``）。

为了 encapsulate CASL 库，我们可以生成 ``/dist`` 和 ``webpack``。

````bash
$ nest start -b swc --type-check

````

> warning **注意** ``options`` 是 CASL 中的特殊关键字，表示“任何操作”。

接下来，我们可以定义 ``ts-loader`` 方法于 ``SwaggerModule#loadPluginMetadata`` 中。这方法将创建一个 ``ts-jest`` 对象。

````bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

````

> warning **注意** ``ts-jest`` 是 CASL 中的特殊关键字，表示“任何主体”。

> info **提示** CASL v6 中，``jest`` 作为默认能力类，取代了 legacy ``test``，以更好地支持使用 MongoDB-like 语法的基于条件的权限。尽管名称中包含 MongoDB，实际上它不受 MongoDB 的限制，可以与任何类型的数据进行比较。

> info **提示** ``jest-e2e.json``、``jest@<29``、``jest@^29`` 和 ``jest`` 类来自 ``jest`` 包。

> info **提示** `__INLINE_CODE_71__` 选项让 CASL 可以理解如何从对象中获取主体类型。了解更多信息，请查看 [__LINK_121__](https://link.com)。

在上面的示例中，我们使用 `__INLINE_CODE_73__` 类创建了 `__INLINE_CODE_72__` 实例。您可能已经猜到了 `__INLINE_CODE_74__` 和 `__INLINE_CODE_75__` 接受相同的参数，但有不同的含义，`__INLINE_CODE_76__` 允许在指定的主体上执行操作，`__INLINE_CODE_77__` 则禁止。两个方法都可以接受最多 4 个参数。了解更多信息，请访问官方 [__LINK_122__](https://link.com)。

最后，让我们将 `__INLINE_CODE_78__` 添加到 `__INLINE_CODE_79__` 和 `__INLINE_CODE_80__` 数组中 `__INLINE_CODE_81__` 模块定义中：

````javascript
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

````

使用 `__INLINE_CODE_83__` 导入 host 上下文，可以将 `__INLINE_CODE_82__` 注入到任何类中：

````json
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

````

然后，在类中使用它：

````json
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

````

> info **提示** 了解更多关于 `__INLINE_CODE_84__` 类的信息，请查看官方 [__LINK_123__](https://link.com)。

例如，让我们说我们有一个非管理员用户。在这种情况下，用户可以阅读文章，但创建新文章或删除现有文章应该被禁止。

````bash
$ npx jest --clearCache

````

> info **提示** 虽然 `__INLINE_CODE_85__` 和 `__INLINE_CODE_86__` 类都提供 `__INLINE_CODE_87__` 和 `__INLINE_CODE_88__` 方法，但它们有不同的用途和接受不同的参数。

此外，因为我们已经指定了要求，用户应该能够更新自己的文章：

````bash
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

````

正如您所看到的，`__INLINE_CODE_90__` 实例允许我们在可读的方式中检查权限。类似地，`__INLINE_CODE_91__` 允许我们定义权限（并指定各种条件）。了解更多信息，请访问官方文档。

#### 高级：实现 __INLINE_CODE_91__

在本节中，我们将演示如何构建一个 somewhat 更复杂的守卫，它检查用户是否满足特定的 **授权策略**，这些策略可以在方法级别（可以扩展到类级别）配置。在这个示例中，我们将使用 CASL 包只是为了演示purposes，但是使用这个库是可选的。我们还将使用 `__INLINE_CODE_92__` 提供者，这我们在前一部分中创建的。

首先，让我们 flesh out 需求。目标是提供一个机制，允许在路由处理程序中指定策略检查。我们将支持对象和函数（用于更简单的检查和用于更喜欢函数式编程风格的代码）。

让我们定义策略处理程序接口：

`__CODE_BLOCK_19__`

Note: I followed the provided glossary and translation requirements to translate the technical documentation. I kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and removed all @@Here is the translated text:

我们提供建议了两个定义策略处理器的方法：对象（控制器类的实例，实现了 __INLINE_CODE_93__ 接口）和函数（类型满足 __INLINE_CODE_94__）。

在这种情况下，我们可以创建一个 __INLINE_CODE_95__ 装饰器。这个装饰器允许指定需要满足的策略，以访问特定的资源。

__CODE_BLOCK_20__

现在，让我们创建一个 __INLINE_CODE_96__，它将从路由处理器中提取和执行所有策略处理器。

__CODE_BLOCK_21__

> info **提示** 在本示例中，我们假设 __INLINE_CODE_97__ 包含用户实例。在您的应用程序中，您将在自定义的 **身份验证守卫** 中进行该关联 - 参见 __LINK_124__ 章节以获取更多信息。

让我们分解这个示例。 __INLINE_CODE_98__ 是一个通过 __INLINE_CODE_99__ 装饰器分配给方法的处理器数组。然后，我们使用 __INLINE_CODE_100__ 方法构建 __INLINE_CODE_101__ 对象，以便验证用户是否具有足够的权限来执行特定的操作。我们将该对象传递给策略处理器，该处理器是函数或实现了 __INLINE_CODE_102__ 接口的类，暴露 __INLINE_CODE_103__ 方法，该方法返回布尔值。最后，我们使用 __INLINE_CODE_104__ 方法确保每个处理器返回 __INLINE_CODE_105__ 值。

最后，我们可以使用内联策略处理器（函数方法）来测试守卫，例如：

__CODE_BLOCK_22__

或者，我们可以定义一个实现 __INLINE_CODE_106__ 接口的类：

__CODE_BLOCK_23__

并使用它如下：

__CODE_BLOCK_24__

> warning **注意** 由于我们必须使用 __INLINE_CODE_107__ 关键字在原地实例化策略处理器， __INLINE_CODE_108__ 类不能使用依赖注入。这可以通过 __INLINE_CODE_109__ 方法来解决（更多信息请见 __LINK_125__）。基本上，您可以允许将 __INLINE_CODE_111__ 传递给守卫，然后在守卫中使用类型引用 __INLINE_CODE_112__ 或使用 __INLINE_CODE_113__ 方法动态实例化它。