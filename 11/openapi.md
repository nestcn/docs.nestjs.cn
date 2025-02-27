# OPENAPI

## 介绍

`OpenAPI`是一个与语言无关的`RESTful API`定义说明，`Nest`提供了一个专有的模块来利用装饰器生成类似声明。

### 安装

要开始使用，首先安装依赖、

```bash
$ npm install --save @nestjs/swagger swagger-ui-express
```

如果使用fastify，安装`fastify-swagger`而不是`swagger-ui-express`:

```bash
$ npm install --save @nestjs/swagger fastify-swagger
```

### 引导

安装完成后，在`main.ts`文件中定义并初始化`SwaggerModule`类:

```TypeScript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

?> 文档(通过`SwaggerModule#createDocument()`方法返回)是一个遵循[OpenAPI文档](https://swagger.io/specification/#openapi-document)的序列化对象。除了HTTP，你也可以以JSON/YAML文件格式保存和使用它。


`DocumentBuilder`建立一个遵循OpenAPI 标准的基础文档。它提供了不同的方法来配置类似标题、描述、版本等信息属性。要创建一个完整的文档（使用HTTP定义），我们使用`SwaggerModule`类的`createDocument()`方法。这个方法有两个参数，一个应用实例和一个Swagger选项对象。我们也可以提供第三个`SwaggerDocumentOptions`类型可选对象，见[文档选项](#文档选项)。

创建文档后，调用`setup()`方法，它接受：
1. 挂载Swagger界面的路径。
2. 应用实例。
3. 上述实例化的文档对象。

运行以下命令启动HTTP服务器。

```TypeScript
$ npm run start
```

浏览`http://localhost:3000/api`可以看到Swagger界面。

![swagger1](https://docs.nestjs.com/assets/swagger1.png)

Swagger模块自动反射你所有的终端。注意Swagger界面根据平台不同，由`swagger-ui-express`或`fastify-swagger`生成。

?> 要生成和下载一个Swagger JSON文件，导航到`http://localhost:3000/api-json` (`swagger-ui-express`) 或`http://localhost:3000/api/json` (`fastify-swagger`) (假设API文档在 http://localhost:3000/api路径)。

!> 在使用`fastify-swagger`和`helmet`时可能有CSP问题，要处理这个冲突，参考如下配置CSP。

```TypeScript
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    },
  },
});
```
// If you are not going to use CSP at all, you can use this:
app.register(helmet, {
  contentSecurityPolicy: false,
});

### 文档选项

创建文档时，可以提供一些额外选项来配合库特性。这些选项应该是`SwaggerDocumentOptions`类型：

```TypeScript
export interface SwaggerDocumentOptions {
  /**
   * List of modules to include in the specification
   */
  include?: Function[];

  /**
   * Additional, extra models that should be inspected and included in the specification
   */
  extraModels?: Function[];

  /**
   * If `true`, swagger will ignore the global prefix set through `setGlobalPrefix()` method
   */
  ignoreGlobalPrefix?: boolean;

  /**
   * If `true`, swagger will also load routes from the modules imported by `include` modules
   */
  deepScanRoutes?: boolean;

  /**
   * Custom operationIdFactory that will be used to generate the `operationId`
   * based on the `controllerKey` and `methodKey`
   * @default () => controllerKey_methodKey
   */
  operationIdFactory?: (controllerKey: string, methodKey: string) => string;
}
```

例如，如果你要确保库像`createUser`而不是`UserController_createUser`一样生成操作名称，可以做如下配置：

```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
});
const document = SwaggerModule.createDocument(app, config, options);
```

### 示例

一个例子见[这里](https://github.com/nestjs/nest/tree/master/sample/11-swagger)。



## 类型和参数

`SwaggerModule`在路径处理程序上搜索所有`@Body()`, `@Query()`, 以及`@Param()`装饰器来生成API文档。它也利用反射来创建响应模型。考虑以下代码：

```TypeScript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

?> 要显式定义主体，使用`@ApiBody()`装饰器 (从`@nestjs/swagger`引入).

基于`CreateCatDto`,将创建以下Swagger页面模型。

![](https://docs.nestjs.com/assets/swagger-dto.png)

如你所见，虽然类已经声明了一些属性，但这里的定义是空的。要使这些类属性在`SwaggerModule`中可见，我们要么用`@ApiProperty()`装饰器或使用`CLI`插件来自动生成：

```TypeScript
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

?> 考虑使用Swagger插件（参见[CLI插件](#CLI插件)）来自动生成以代替手动装饰每个属性。

打开浏览器确认生成的`CreateCatDto`模型:

![](https://docs.nestjs.com/assets/swagger-dto2.png)


`@ApiProperty()`装饰器也允许设置不同的原型对象属性:

```TypeScript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

?> 可以使用`@ApiPropertyOptional()`速记装饰器来替代显式输入`@ApiProperty({ required: false })`。

要显式指定属性类型，使用`type`字段：

```TypeScript
@ApiProperty({
  type: Number,
})
age: number;
```

### 数组

当属性是数组时，我们必须手动指定数组类型：

```TypeScript
@ApiProperty({ type: [String] })
names: string[];
```

> 考虑使用Swagger 插件来自动发现数组

要么将类型作为数组的第一个元素（如上），要么将`isArray`属性设为`true`。


### 循环依赖

当你的类之间有循环依赖时，使用`SwaggerModul`提供的一个包含类型信息的懒函数。

```TypeScript
@ApiProperty({ type: () => Node })
node: Node;
```
> 考虑使用Swagger 插件来自动发现循环依赖

### 泛型和接口

由于`TypeScript`没有存储泛型或者接口的元数据，当你在DTO中使用他们的时候，`SwaggerModule`可能不会正确生成运行时的模型定义。基于此，下列代码不会被Swagger模块正确识别。

```TypeScript
createBulk(@Body() usersDto: CreateUserDto[])
```

要处理这些限制，需要显式配置类型：

```TypeScript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

### 枚举

要定义一个枚举，需要在`@ApiProperty`中用数组手动设置`enum`属性。

```TypeScript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

也可以如下定义一个真实的`TypeScript`泛型：

```TypeScript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

可以在`@Query()`参数中配合`@ApiQuery()`装饰器直接使用`enum`：

```TypeScript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

![](https://docs.nestjs.com/assets/enum_query.gif)

当`isArray`配置为`true`时, `enum`可以多选。

![](https://docs.nestjs.com/assets/enum_query_array.gif)

### 枚举原型

默认地，`enum`属性将为[Enum](https://swagger.io/docs/specification/data-models/enums/)在`parameter`上添加一个原始定义。

```TypeScript
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```


上述定义在大部分情况下工作良好。然而，如果你使用该定义作为输入在客户端生成代码时，可能会遇到属性包含重复枚举的情况，考虑以下代码：

```TypeScript
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
?> 上述代码使用[NSwag](https://github.com/RicoSuter/NSwag)工具生成

现在可以看到有两个枚举完全一样，要处理这个问题，需要在装饰器的`enum`属性中传入`enumName`参数。

```TypeScript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```

`enumName`属性使能`@nestjs/swagger`来将`CatBreed`转换为其原型，从而使`CatBreed`可重用：

```TypeScript
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


?> 任何包含`enum`属性的装饰器都有`enumName`

### 原始定义

在一些特殊场合(例如深度嵌套的数组和矩阵),你可能需要手动描述你的类型。

```TypeScript
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

类似地，要在控制器类中手动定义输入输出，使用`schema`属性:

```TypeScript
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

### 额外模型

要定义控制器中没有直接使用，但是需要被Swagger模块检查的额外的模型，使用`@ApiExtraModels()`装饰器:

```TypeScript
@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

?> 只需要对指定的model类使用一次`@ApiExtraModels()`

你也可以把一个选项对象和`extraModels`属性一起传递给`SwaggerModule#createDocument()` 方法：

```TypeScript
const document = SwaggerModule.createDocument(app, options, {
  extraModels: [ExtraModel],
});
```

要获得一个模型的引用(`$ref`) ,使用`getSchemaPath(ExtraModel)`函数:

```TypeScript
'application/vnd.api+json': {
   schema: { $ref: getSchemaPath(ExtraModel) },
},
```

### `oneOf`, `anyOf`, `allOf`

要组合原型，你可以使用`oneOf`,`anyOf` 或者`allOf`关键词([阅读更多](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/)).

```TypeScript
@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```

如果你要定义一个多态数组（例如，数组成员跨越多个原型），你应该使用前节的原始定义来手动定义你的类型。

```TypeScript
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

?> `getSchemaPath()`函数从`@nestjs/swagger`引入.

`Cat`和`Dog`都应该使用`@ApiExtraModels()`装饰器 (在类水平).

## 操作

在OpenAPI规范中，API暴露的以{资源}为结束的终端，例如`/users`或者`/reports/summary`,都是可以执行HTTP方法的，例如`GET`,`POST`或者`DELETE`。

### 标签

要为控制器附加一个标签，使用`@ApiTags(...tags)装饰器。

```TypeScript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}
```

### 报头

要作为请求的一部分定义自定义报头，使用`@ApiHeader()`装饰器。

```TypeScript
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller('cats')
export class CatsController {}
```

### 响应

要定义一个自定义响应, 使用`@ApiResponse()装饰器.

```TypeScript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```


Nest提供了一系列继承自@ApiResponse装饰器的用于速记的API响应装饰器：

- @ApiOkResponse()
- @ApiCreatedResponse()
- @ApiAcceptedResponse()
- @ApiNoContentResponse()
- @ApiMovedPermanentlyResponse()
- @ApiBadRequestResponse()
- @ApiUnauthorizedResponse()
- @ApiNotFoundResponse()
- @ApiForbiddenResponse()
- @ApiMethodNotAllowedResponse()
- @ApiNotAcceptableResponse()
- @ApiRequestTimeoutResponse()
- @ApiConflictResponse()
- @ApiTooManyRequestsResponse()
- @ApiGoneResponse()
- @ApiPayloadTooLargeResponse()
- @ApiUnsupportedMediaTypeResponse()
- @ApiUnprocessableEntityResponse()
- @ApiInternalServerErrorResponse()
- @ApiNotImplementedResponse()
- @ApiBadGatewayResponse()
- @ApiServiceUnavailableResponse()
- @ApiGatewayTimeoutResponse()
- @ApiDefaultResponse()

```TypeScript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

要从请求返回一个指定的模型，需要创建一个类并用`@ApiProperty()`装饰器注释它。

```TypeScript
export class Cat {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

`Cat`模型可以与响应装饰器的`type`属性组合使用。

```TypeScript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Cat,
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }
}
```

打开浏览器确认生成的`Cat`模型。


![](https://docs.nestjs.com/assets/swagger-response-type.png)

### 文件上传
使用`@ApiBody`装饰器和`@ApiConsumes()`来使能文件上传，这里有一个完整的使用[文件上传](https://docs.nestjs.com/techniques/file-upload)技术的例子。

```TypeScript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file) {}
```

`FileUploadDto`像这样定义:

```TypeScript
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

要处理多个文件上传，如下定义`FilesUploadDto`：

```TypeScript
class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
```

### 扩展

要为请求增加一个扩展使用`@ApiExtension()`装饰器. 该扩展名称必须以 `x-`前缀。

```TypeScript
@ApiExtension('x-foo', { hello: 'world' })
```

### 高级主题：通用`ApiResponse`

基于[原始定义](https://docs.nestjs.com/openapi/types-and-parameters#raw-definitions),的能力，我们可以为Swagger定义通用原型:

```TypeScript
export class PaginatedDto<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;

  results: TData[];
}
```

我们跳过了定义`results`，因为后面要提供一个原始定义。现在，我们定义另一个DTO,例如`CatDto`如下：

```TypeScript
export class CatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

我们可以定义一个`PaginatedDto<CatDto>`响应如下:

```TypeScript
@ApiOkResponse({
  schema: {
    allOf: [
      { $ref: getSchemaPath(PaginatedDto) },
      {
        properties: {
          results: {
            type: 'array',
            items: { $ref: getSchemaPath(CatDto) },
          },
        },
      },
    ],
  },
})
async findAll(): Promise<PaginatedDto<CatDto>> {}
```

在这个例子中，我们指定响应拥有所有的`PaginatedDto`并且`results`属性类型为`CatDto`数组。

- `getSchemaPath()` 函数从一个给定模型的OpenAPI指定文件返回OpenAPI原型路径
- `allOf`是一个OAS3的概念，包括各种各样相关用例的继承。

最后，因为`PaginatedDto`没有被任何控制器直接引用，`SwaggerModule`还不能生成一个相应的模型定义。我们需要一个[额外的模型](https://docs.nestjs.com/openapi/types-and-parameters#extra-models)，可以在控制器水平使用`@ApiExtraModels()`装饰器。

```TypeScript
@Controller('cats')
@ApiExtraModels(PaginatedDto)
export class CatsController {}
```

如果你现在运行Swagger，为任何终端生成的`swagger.json`文件看上去应该像定义的这样：

```JSON
"responses": {
  "200": {
    "description": "",
    "content": {
      "application/json": {
        "schema": {
          "allOf": [
            {
              "$ref": "#/components/schemas/PaginatedDto"
            },
            {
              "properties": {
                "results": {
                  "$ref": "#/components/schemas/CatDto"
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

为了让其可重用，我们为`PaginatedDto`像这样创建一个装饰器:

```TypeScript
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
```

?> `Type<any>`接口和`applyDecorators`函数从`@nestjs/common`引入.

我们现在可以为终端使用自定义的`@ApiPaginatedResponse()`装饰器 :

```TypeScript
@ApiPaginatedResponse(CatDto)
async findAll(): Promise<PaginatedDto<CatDto>> {}
```

作为客户端生成工具，这一方法为客户端提供了一个含糊的`PaginatedResponse<TModel>`。下面示例展示了生成的客户端访问`GET /`终端的结果。

```TypeScript
// Angular
findAll(): Observable<{ total: number, limit: number, offset: number, results: CatDto[] }>
```

可以看出，这里的返回类型是含糊不清的。要处理这个问题，可以为`ApiPaginatedResponse`的`原型`添加`title`属性。

```TypeScript
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`
        allOf: [
          // ...
        ],
      },
    }),
  );
};
```

现在结果变成了。

```TypeScript
// Angular
findAll(): Observable<PaginatedResponseOfCatDto>
```

## 安全

要确定某个特定操作使用哪个安全机制，使用`@ApiSecurity()`装饰器。

```TypeScript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

在运行程序前，使用`DocumentBuilder`在基础文档里添加安全定义。

```TypeScript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

一些最常用的认证机制是内置的(例如`basic`和`bearer`),因此不需要像上面那样手动定义。

### `Basic`认证

使用`@ApiBasicAuth()`配置basic认证。

```TypeScript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

在运行程序前，使用`DocumentBuilder`在基础文档里添加安全定义。

```TypeScript
const options = new DocumentBuilder().addBasicAuth();
```

### Bearer认证

使用`@ApiBearerAuth()`启用bearer认证。

```TypeScript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

在运行程序前，使用`DocumentBuilder`在基础文档里添加安全定义。

```TypeScript
const options = new DocumentBuilder().addBearerAuth();
```

### OAuth2认证

使用`@ApiOAuth2()`启用OAuth2认证。

```TypeScript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

在运行程序前，使用`DocumentBuilder`在基础文档里添加安全定义。

```TypeScript
const options = new DocumentBuilder().addOAuth2();
```

### Cookie认证

使用`@ApiCookieAuth()`启用cookie认证。

```TypeScript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```

在运行程序前，使用`DocumentBuilder`在基础文档里添加安全定义。

```TypeScript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```

## 映射的类型


像构建CRUD特性一样，通常需要基于实体类型创建变体。Nest提供了一些应用函数来进行类型变换，以让这类变换工作更简单。

### `Partial（部分声明）`

在创建数据转换对象(也称为DTO),将`创建`和`更新`创建为同一类型通常很有用。例如，创建变体可能需要所有字段，但更新变体可能将所有字段都配置为可选的。

Nest提供了`PartialType()`应用函数让这一任务更简单地最小化构造。

`PartialType()`函数返回一个类型`(类)`将输入的所有属性配置为可选的。例如，你可以这样创建一个类型。

```TypeScript
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


默认所有的字段都是必须的。要创建一个所有字段与之相同但都是可选的字段，使用`PartialType()`并将`CreateCatDto`作为参数。

```TypeScript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

?> `PartialType()`函数从`@nestjs/swagger`引入.

### `Pick(拾取）`

`PickType()`函数从输入类型中拾取一部分属性并生成一个新类型(类) 。假设我们起始类如下：

```TypeScript
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

我们使用`PickType()`从中拾取一部分属性：

```TypeScript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

?> `PickType()`函数 从`@nestjs/swagger`引入.

### `Omit(省略)`

`OmitType()`函数拾取所有输入属性，移除指定部分属性。例如，我们起始类型如下：

```TypeScript
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

我们可以以此创建一个除`name`之外的包含其他所有属性的类。`OmitType`函数的第二个参数是包含要移除属性名称的数组。

```TypeScript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

?> `OmitType()`函数从`@nestjs/swagger`引入.

### `Intersection(交叉)`

`IntersectionType()`函数将两个类型组合为一个类型（类），例如，我们起始的两个类型如下：

```TypeScript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}
```

我们可以生成一个由两个类中所有属性组成的新类型。

```TypeScript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

?>`IntersectionType()`函数从`@nestjs/swagger`引入.

### `Composition(组合)`

映射类型的使用时可以组合的，例如，以下代码创建一个类型（类），它包含了`CreateCatDto`除了`name`之外的所有属性，并将所有属性设置为可选的。

```TypeScript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

## 装饰器

所有可用的OpenAPI装饰器都有Api前缀用以和核心装饰器区分。下面是完整的装饰器名称列表以及其可能能应用的范围。

|名称|类型|
|---|---|
@ApiOperation()|Method
@ApiResponse()|Method / Controller
@ApiProduces()|Method / Controller
@ApiConsumes()|Method / Controller
@ApiBearerAuth()|Method / Controller
@ApiOAuth2()|Method / Controller
@ApiBasicAuth()|Method / Controller
@ApiSecurity()|Method / Controller
@ApiExtraModels()|Method / Controller
@ApiBody()|Method
@ApiParam()|Method
@ApiQuery()|Method
@ApiHeader()|Method / Controller
@ApiExcludeEndpoint()|Method
@ApiTags()|Method / Controller
@ApiProperty()|Model
@ApiPropertyOptional()|Model
@ApiHideProperty()|Model
@ApiExtension()|Method


## CLI插件

TypeScript的元数据反射系统有一些限制，一些功能因此不可能实现，例如确定一个类由哪些属性组成，或者一个属性是可选的还是必须的。然而，一些限制可以在编译时强调。Nest提供了一个增强TypeScript编译过程的插件来减少需要的原型代码量。

?> 这个插件是一个`opt-in`，你也可以选择手动声明所有的装饰器，或者仅仅声明你需要的。

### 概述

Swagger插件可以自动：

- 使用`@ApiProperty`注释所有除了用`@ApiHideProperty`装饰的DTO属性。
- 根据问号符号确定`required`属性(例如 `name?: string` 将设置`required: false`)
- 根据类型配置`type`为`enum`(也支持数组)
- 基于给定的默认值配置默认参数
- 基于`class-validator`装饰器配置一些验证策略(如果`classValidatorShim`配置为`true`)
- 为每个终端添加一个响应装饰器，包括合适的状态和类型（响应模式）
- 根据注释生成属性和终端的描述(如果`introspectComments`配置为`true`)
- 基于注释生成属性的示例数据(如果`introspectComments`配置为`true`)

注意，你的文件名必须有如下后缀: `['.dto.ts', '.entity.ts']` (例如`create-user.dto.ts`) 才能被插件分析。

如果使用其他后缀，你可以调整插件属性来指定`dtoFileNameSuffix`选项(见下文)。

之前，如果你想要通过Swagger提供一个交互体验，你必须复制大量代码让包知道你的模型/组件在该声明中。例如，你可以定义一个`CreateUserDto`类:

```TypeScript
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

在中等项目中这还不是问题，但是一旦有大量类的话这就变得冗余而难以维护。

要应用Swagger插件，可以简单声明上述类定义：

```TypeScript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}
```

插件可以通过抽象语法树添加合适的装饰器，你不在需要在代码中到处写`ApiProperty`装饰器。

?> 插件可以自动生成所有缺失的swagger属性，但是如果你要覆盖他们，只需要通过`@ApiProperty()`显式声明即可。

### 注释自省

注释自省特性使能后，CLI插件可以基于注释生成描述和示例值。

例如，一个给定的`roles`属性示例：

```TypeScript
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

你必须复制描述和示例值。当`introspectComments`使能后，CLI插件可以自动解压这些注释并提供描述（以及示例，如果定义了的话）。现在，上述属性可以简化为：

```TypeScript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];
```

### 使用CLI插件

要使能CLI插件，打开`nest-cli.json` (如果你在用[Nest CLI](https://docs.nestjs.com/cli/overview))并添加以下插件配置：

```TypeScript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

你可以使用其他`options`属性来自定义插件特性。

```TypeScript
"plugins": [
  {
    "name": "@nestjs/swagger",
    "options": {
      "classValidatorShim": false,
      "introspectComments": true
    }
  }
]
```

`options`属性实现以下接口：

```TypeScript
export interface PluginOptions {
  dtoFileNameSuffix?: string[];
  controllerFileNameSuffix?: string[];
  classValidatorShim?: boolean;
  introspectComments?: boolean;
}
```

选项|默认|说明
---|---|---
dtoFileNameSuffix|['.dto.ts', '.entity.ts']|DTO (数据传输对象)文件后缀
controllerFileNameSuffix|.controller.ts|控制文件后缀
classValidatorShim|true|如果配置为`true`，模块将重用`class-validator`验证装饰器 (例如`@Max(10) `将在`schema`定义中增加`max: 10`)
introspectComments|false|如果配置为`true`,插件将根据描述注释生成说明和示例

如果不使用CLI，但是使用一个用户定义的`Webpack`配置，可以和`ts-loader`配合使用该插件：

```TypeScript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),
```

### 和`ts-jest`(e2e)

要运行e2e测试，`ts-jest`在内存汇总编译源码，这意味着不使用Nest Cli编译，不应用任何插件或AST转换，要使用插件，在e2e测试目录下创建以下文件：

```TypeScript
const transformer = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/swagger/plugin options (can be empty)
    },
    cs.tsCompiler.program,
  );
};
```


在jest配置文件中引入AST变换。默认在（启动应用中），e2e测试配置文件在测试目录下，名为`jest-e2e.json`。

```TypeScript
{
  ... // other configuration
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<path to the file created above>"],
      }
    }
  }
}
```


## 其他特性

### 全局前缀

要忽略一个通过`setGlobalPrefix()`配置的全局前缀, 使用`ignoreGlobalPrefix`:

```TypeScript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});
```

### 多重声明

`Swagger`模块提供了一个支持多重声明的方法，也就是说可以在多个终端提供多个界面和多个文档。

要支持多重声明，首先在模块中要进行声明，在`createDocument()`方法中传递第3个参数,`extraOptions`,这是个包含一个叫做`include`名称的属性，该属性提供了一个由模块组成的数组。

可以如下配置多重声明：

```TypeScript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * createDocument(application, configurationOptions, extraOptions);
   *
   * createDocument method takes an optional 3rd argument "extraOptions"
   * which is an object with "include" property where you can pass an Array
   * of Modules that you want to include in that Swagger Specification
   * E.g: CatsModule and DogsModule will have two separate Swagger Specifications which
   * will be exposed on two different SwaggerUI with two different endpoints.
   */

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const catDocument = SwaggerModule.createDocument(app, options, {
    include: [CatsModule],
  });
  SwaggerModule.setup('api/cats', app, catDocument);

  const secondOptions = new DocumentBuilder()
    .setTitle('Dogs example')
    .setDescription('The dogs API description')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  const dogDocument = SwaggerModule.createDocument(app, secondOptions, {
    include: [DogsModule],
  });
  SwaggerModule.setup('api/dogs', app, dogDocument);

  await app.listen(3000);
}
bootstrap();
```

现在可以使用以下命令启动服务器:

```bash
$ npm run start
```

访问`http://localhost:3000/api/cats`可以看到`cats`的`Swagger`界面，
访问`http://localhost:3000/api/dogs`可以看到`dogs`的`Swagger`界面。

## 迁移指南

如果你在使用`@nestjs/swagger@3.*`, 注意在4.0版本中有以下破坏性变化或者更改。

### 破坏性变化

以下装饰器被改变/重命名

- `@ApiModelProperty`现在是`@ApiProperty`
- `@ApiModelPropertyOptional`现在是`@ApiPropertyOptional`
- `@ApiResponseModelProperty`现在是`@ApiResponseProperty`
- `@ApiImplicitQuery`现在是`@ApiQuery`
- `@ApiImplicitParam`现在是`@ApiParam`
- `@ApiImplicitBody`现在是`@ApiBody`
- `@ApiImplicitHeader`现在是`@ApiHeader`
- `@ApiOperation({ title: 'test' })`现在是`@ApiOperation({ summary: 'test' })`
- `@ApiUseTags`现在是`@ApiTags`

`DocumentBuilder`的破坏性更新(升级了方法签名):

- addTag
- addBearerAuth
- addOAuth2
- setContactEmail`现在是`setContact
- setHost has been removed
- setSchemes has been removed (使用`addServer instead, e.g., addServer('http://'))

### 新方法

添加了以下新方法：

- addServer
- addApiKey
- addBasicAuth
- addSecurity
- addSecurityRequirements

### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
