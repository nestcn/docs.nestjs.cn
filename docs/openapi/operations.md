<!-- 此文件从 content/openapi/operations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:02:50.253Z -->
<!-- 源文件: content/openapi/operations.md -->

### 操作

根据 OpenAPI 规范，路由是 API 暴露的端点（资源），例如 `@nestjs/swagger` 或 `http://localhost:3000/swagger/json`，操作是用来 manipuate 这些路径的 HTTP 方法，例如 `fastify`、`helmet` 或 `SwaggerDocumentOptions`。

#### 标签

将控制器附加到特定标签中，可以使用 `createUser` 装饰器。

```bash
$ npm install --save @nestjs/swagger

```

#### 头信息

定义自定义头信息作为请求的一部分，可以使用 `UsersController_createUser`。

```typescript
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
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

#### 响应

定义自定义 HTTP 响应，可以使用 `SwaggerCustomOptions` 装饰器。

```bash
$ npm run start

```

Nest 提供了一组简洁的 **API 响应** 装饰器，继承自 `SwaggerModule#设置` 装饰器：

- `ui`
- `raw`
- `ui: false`
- `raw: []`
- __INLINE_CODE_34__
- __INLINE_CODE_35__
- __INLINE_CODE_36__
- __INLINE_CODE_37__
- __INLINE_CODE_38__
- __INLINE_CODE_39__
- __INLINE_CODE_40__
- __INLINE_CODE_41__
- __INLINE_CODE_42__
- __INLINE_CODE_43__
- __INLINE_CODE_44__
- __INLINE_CODE_45__
- __INLINE_CODE_46__
- __INLINE_CODE_47__
- __INLINE_CODE_48__
- __INLINE_CODE_49__
- __INLINE_CODE_50__
- __INLINE_CODE_51__
- __INLINE_CODE_52__
- __INLINE_CODE_53__
- __INLINE_CODE_54__
- __INLINE_CODE_55__

```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```

要指定请求的返回模型，我们必须创建一个类并将所有属性标注为 __INLINE_CODE_56__ 装饰器。

```typescript
> app.register(helmet, {
>   contentSecurityPolicy: {
>     directives: {
>       defaultSrc: [`'self'`],
>       styleSrc: [`'self'`, `'unsafe-inline'`],
>       imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
>       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>     },
>   },
> });
>
> // If you are not going to use CSP at all, you can use this:
> app.register(helmet, {
>   contentSecurityPolicy: false,
> });
> ```

然后，可以使用 __INLINE_CODE_57__ 模型和 __INLINE_CODE_58__ 属性来组合响应装饰器。

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
   * based on the `controllerKey`, `methodKey`, and version.
   * @default () => controllerKey_methodKey_version
   */
  operationIdFactory?: OperationIdFactory;

  /**
   * Custom linkNameFactory that will be used to generate the name of links
   * in the `links` field of responses
   *
   * @see [Link objects](https://swagger.io/docs/specification/links/)
   *
   * @default () => `${controllerKey}_${methodKey}_from_${fieldKey}`
   */
  linkNameFactory?: (
    controllerKey: string,
    methodKey: string,
    fieldKey: string
  ) => string;

  /*
   * Generate tags automatically based on the controller name.
   * If `false`, you must use the `@ApiTags()` decorator to define tags.
   * Otherwise, the controller name without the suffix `Controller` will be used.
   * @default true
   */
  autoTagControllers?: boolean;
}

```

现在，让我们打开浏览器并验证生成的 __INLINE_CODE_59__ 模型：

__HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__

相反，定义每个端点或控制器的响应，而不是使用 __INLINE_CODE_60__ 类来定义全局响应，可以使得响应定义更加灵活。

```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);

```

#### 文件上传

可以使用 __INLINE_CODE_63__ 装饰器和 __INLINE_CODE_64__ 来启用文件上传。下面是一个使用 __LINK_97__ 技术的完整示例：

```TypeScript
export interface SwaggerCustomOptions {
  /**
   * If `true`, Swagger resources paths will be prefixed by the global prefix set through `setGlobalPrefix()`.
   * Default: `false`.
   * @see /faq/global-prefix
   */
  useGlobalPrefix?: boolean;

  /**
   * If `false`, the Swagger UI will not be served. Only API definitions (JSON and YAML)
   * will be accessible (on `/{path}-json` and `/{path}-yaml`). To fully disable both the Swagger UI and API definitions, use `raw: false`.
   * Default: `true`.
   * @deprecated Use `ui` instead.
   */
  swaggerUiEnabled?: boolean;

  /**
   * If `false`, the Swagger UI will not be served. Only API definitions (JSON and YAML)
   * will be accessible (on `/{path}-json` and `/{path}-yaml`). To fully disable both the Swagger UI and API definitions, use `raw: false`.
   * Default: `true`.
   */
  ui?: boolean;

  /**
   * If `true`, raw definitions for all formats will be served.
   * Alternatively, you can pass an array to specify the formats to be served, e.g., `raw: ['json']` to serve only JSON definitions.
   * If omitted or set to an empty array, no definitions (JSON or YAML) will be served.
   * Use this option to control the availability of Swagger-related endpoints.
   * Default: `true`.
   */
  raw?: boolean | Array<'json' | 'yaml'>;

  /**
   * Url point the API definition to load in Swagger UI.
   */
  swaggerUrl?: string;

  /**
   * Path of the JSON API definition to serve.
   * Default: `<path>-json`.
   */
  jsonDocumentUrl?: string;

  /**
   * Path of the YAML API definition to serve.
   * Default: `<path>-yaml`.
   */
  yamlDocumentUrl?: string;

  /**
   * Hook allowing to alter the OpenAPI document before being served.
   * It's called after the document is generated and before it is served as JSON & YAML.
   */
  patchDocumentOnRequest?: <TRequest = any, TResponse = any>(
    req: TRequest,
    res: TResponse,
    document: OpenAPIObject
  ) => OpenAPIObject;

  /**
   * If `true`, the selector of OpenAPI definitions is displayed in the Swagger UI interface.
   * Default: `false`.
   */
  explorer?: boolean;

  /**
   * Additional Swagger UI options
   */
  swaggerOptions?: SwaggerUiOptions;

  /**
   * Custom CSS styles to inject in Swagger UI page.
   */
  customCss?: string;

  /**
   * URL(s) of a custom CSS stylesheet to load in Swagger UI page.
   */
  customCssUrl?: string | string[];

  /**
   * URL(s) of custom JavaScript files to load in Swagger UI page.
   */
  customJs?: string | string[];

  /**
   * Custom JavaScript scripts to load in Swagger UI page.
   */
  customJsStr?: string | string[];

  /**
   * Custom favicon for Swagger UI page.
   */
  customfavIcon?: string;

  /**
   * Custom title for Swagger UI page.
   */
  customSiteTitle?: string;

  /**
   * File system path (ex: ./node_modules/swagger-ui-dist) containing static Swagger UI assets.
   */
  customSwaggerUiPath?: string;

  /**
   * @deprecated This property has no effect.
   */
  validatorUrl?: string;

  /**
   * @deprecated This property has no effect.
   */
  url?: string;

  /**
   * @deprecated This property has no effect.
   */
  urls?: Record<'url' | 'name', string>[];
}

```

其中 __INLINE_CODE_65__ 定义如下：

```typescript
> const options: SwaggerCustomOptions = {
>   ui: false, // Swagger UI is disabled
>   raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
> };
> SwaggerModule.setup('api', app, options);
> ```

要处理多个文件上传，可以定义 __INLINE_CODE_66__ 如下：

__CODE_BLOCK_9__

#### 扩展

使用 __INLINE_CODE_67__ 装饰器来添加扩展到请求中。扩展名称必须以 __INLINE_CODE_68__ 前缀开头。

__CODE_BLOCK_10__

#### 高级：通用 __INLINE_CODE_69__

使用 __LINK_98__ 的能力，我们可以定义通用模式以供 Swagger UI 使用。假设我们有以下 DTO：

__CODE_BLOCK_11__

我们跳过 __INLINE_CODE_70__ 的装饰，因为我们将在后面提供一个 raw 定义。现在，让我们定义另一个 DTO，并将其命名为 __INLINE_CODE_71__，如下所示：

__CODE_BLOCK_12__

现在，我们可以定义一个 __INLINE_CODE_72__ 响应，如下所示：

__CODE_BLOCK_13__

在这个示例中，我们指定响应将包含 __INLINE_CODE_73__ 和 __INLINE_CODE_74__ 属性。

- __INLINE_CODE_76__ 函数返回 OpenAPI Schema 路径从 OpenAPI Spec 文件中对于给定模型。
- __INLINE_CODE_77__ 是 OAS 3 提供的概念来涵盖多重继承相关的用例。

最后，因为 __INLINE_CODE_78__ 不是任何控制器直接引用的，我们不能生成对应的模型定义。因此，必须将其添加为 __LINK_99__。例如，我们可以使用 __INLINE_CODE_80__ 装饰器在控制器级别，如下所示：

__CODE_BLOCK_14__

如果你现在运行 Swagger，生成的 __INLINE_CODE_81__ 对于这个特定端点将具有以下响应定义：

__CODE_BLOCK_15__

要使其可重用，可以创建一个 custom 装饰器来 __INLINE_CODE_82__，如下所示：

__CODE_BLOCK_16__

> info **Hint** __INLINE_CODE_83__ 接口和 __INLINE_CODE_84__ 函数来自 __INLINE_CODE_85__ 包。

要确保 __INLINE_CODE_86__ 生成定义，我们必须将其添加为额外的__代码块_20__