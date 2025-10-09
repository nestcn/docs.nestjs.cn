### 类型与参数

`SwaggerModule` 会搜索路由处理器中的所有 `@Body()`、`@Query()` 和 `@Param()` 装饰器来生成 API 文档。它还会利用反射机制创建相应的模型定义。请看以下代码：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

:::info 提示
要显式设置请求体定义，请使用 `@ApiBody()` 装饰器（从 `@nestjs/swagger` 包导入）。
:::

基于 `CreateCatDto`，Swagger UI 将创建以下模型定义：

<figure><img src="/assets/swagger-dto.png" /></figure>

如你所见，虽然该类已声明了几个属性，但定义仍是空的。为了让类属性对 `SwaggerModule` 可见，我们必须用 `@ApiProperty()` 装饰器标注它们，或者使用 CLI 插件（详见**插件**章节）来自动完成这一操作：

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

:::info 提示
与其手动标注每个属性，建议使用 Swagger 插件（参见[插件](/openapi/cli-plugin)章节）来自动完成此操作。
:::



让我们打开浏览器验证生成的 `CreateCatDto` 模型：

<figure><img src="/assets/swagger-dto2.png" /></figure>

此外，`@ApiProperty()` 装饰器支持设置多种 [Schema 对象](https://swagger.io/specification/#schemaObject) 属性：

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

:::info 提示
无需显式输入 `{{"@ApiProperty({ required: false })"}}` ，您可以使用 `@ApiPropertyOptional()` 快捷装饰器。
:::

如需显式设置属性类型，请使用 `type` 键：

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

#### 数组

当属性为数组类型时，必须手动指定数组类型，如下所示：

```typescript
@ApiProperty({ type: [String] })
names: string[];
```

:::info 提示
考虑使用 Swagger 插件（参见 [插件](/openapi/cli-plugin) 部分），它将自动检测数组。
:::

要么将类型作为数组的第一个元素包含（如上所示），要么将 `isArray` 属性设置为 `true`。

#### 循环依赖

当类之间存在循环依赖时，使用惰性函数为 `SwaggerModule` 提供类型信息：

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```

:::info 提示
考虑使用 Swagger 插件（参见[插件](/openapi/cli-plugin)部分），该插件将自动检测循环依赖。
:::

#### 泛型与接口

由于 TypeScript 不会存储关于泛型或接口的元数据，当您在 DTO 中使用它们时，`SwaggerModule` 可能无法在运行时正确生成模型定义。例如，以下代码将无法被 Swagger 模块正确检查：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

为了克服这一限制，您可以显式设置类型：

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

#### 枚举

要识别一个 `enum`，我们必须在 `@ApiProperty` 上手动设置 `enum` 属性，并传入一个值数组。

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

或者，可以像下面这样定义一个实际的 TypeScript 枚举：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

然后你可以直接在 `@Query()` 参数装饰器中使用该枚举，并与 `@ApiQuery()` 装饰器结合使用。

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

![](/assets/enum_query.gif)

当 `isArray` 设置为 **true** 时，该 `enum` 可以作为**多选**进行选择：

![](/assets/enum_query_array.gif)

#### 枚举模式

默认情况下，`enum` 属性会在 `parameter` 上添加 [Enum](https://swagger.io/docs/specification/data-models/enums/) 的原始定义。

```yaml
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```

上述规范在大多数情况下都能正常工作。然而，如果您使用的工具将规范作为**输入**并生成**客户端**代码，可能会遇到生成的代码包含重复 `enums` 的问题。请看以下代码片段：

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

:::info 提示
上述代码片段是使用名为 [NSwag](https://github.com/RicoSuter/NSwag) 的工具生成的。
:::

可以看到现在有两个完全相同的`枚举` 。为了解决这个问题，你可以在装饰器中同时传入 `enumName` 和 `enum` 属性。

```typescript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```

`enumName` 属性使得 `@nestjs/swagger` 能够将 `CatBreed` 转换为独立的`模式` ，从而使 `CatBreed` 枚举可复用。具体规范如下所示：

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

:::info 注意
任何接受 `enum` 作为属性的**装饰器**也都支持 `enumName` 参数。
:::


#### 属性值示例

您可以通过使用 `example` 键为属性设置单个示例，如下所示：

```typescript
@ApiProperty({
  example: 'persian',
})
breed: string;
```

如需提供多个示例，可以使用 `examples` 键，传入如下结构的对象：

```typescript
@ApiProperty({
  examples: {
    Persian: { value: 'persian' },
    Tabby: { value: 'tabby' },
    Siamese: { value: 'siamese' },
    'Scottish Fold': { value: 'scottish_fold' },
  },
})
breed: string;
```

#### 原始定义

在某些情况下，例如深度嵌套的数组或矩阵，您可能需要手动定义类型：

```typescript
@ApiProperty({
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
})
coords: number[][];
```

您也可以直接指定原始对象模式，如下所示：

```typescript
@ApiProperty({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Error'
    },
    status: {
      type: 'number',
      example: 400
    }
  },
  required: ['name', 'status']
})
rawDefinition: Record<string, any>;
```

要在控制器类中手动定义输入/输出内容，请使用 `schema` 属性：

```typescript
@ApiBody({
  schema: {
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
})
async create(@Body() coords: number[][]) {}
```

#### 额外模型

要定义未在控制器中直接引用但需要 Swagger 模块检查的额外模型，请使用 `@ApiExtraModels()` 装饰器：

```typescript
@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

:::info 注意
对于特定模型类，您只需使用一次 `@ApiExtraModels()`。
:::


或者，您也可以向 `SwaggerModule.createDocument()` 方法传递一个包含 `extraModels` 属性的选项对象，如下所示：

```typescript
const documentFactory = () =>
  SwaggerModule.createDocument(app, options, {
    extraModels: [ExtraModel],
  });
```

要获取模型的引用 (`$ref`)，请使用 `getSchemaPath(ExtraModel)` 函数：

```typescript
'application/vnd.api+json': {
   schema: { $ref: getSchemaPath(ExtraModel) },
},
```

#### oneOf、anyOf、allOf

要合并模式，可以使用 `oneOf`、`anyOf` 或 `allOf` 关键字（ [了解更多](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/) ）。

```typescript
@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```

如果要定义多态数组（即成员跨越多个模式的数组），应使用原始定义（如上所述）手动定义类型。

```typescript
type Pet = Cat | Dog;

@ApiProperty({
  type: 'array',
  items: {
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  },
})
pets: Pet[];
```

:::info 提示
`getSchemaPath()` 函数是从 `@nestjs/swagger` 导入的。
:::

`Cat` 和 `Dog` 都必须使用 `@ApiExtraModels()` 装饰器（在类级别）定义为额外模型。

#### 模式名称与描述

您可能已经注意到，生成的模式名称基于原始模型类的名称（例如，`CreateCatDto` 模型会生成 `CreateCatDto` 模式）。如需更改模式名称，可使用 `@ApiSchema()` 装饰器。

示例如下：

```typescript
@ApiSchema({ name: 'CreateCatRequest' })
class CreateCatDto {}
```

上述模型将被转换为 `CreateCatRequest` 模式。

默认情况下，生成的架构不会添加描述。您可以使用 `description` 属性来添加描述：

```typescript
@ApiSchema({ description: 'Description of the CreateCatDto schema' })
class CreateCatDto {}
```

这样，描述就会被包含在架构中，如下所示：

```yaml
schemas:
  CreateCatDto:
    type: object
    description: Description of the CreateCatDto schema
```
