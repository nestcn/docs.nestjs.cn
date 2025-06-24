### 介绍

[OpenAPI](https://swagger.io/specification/) 规范是一种与语言无关的定义格式，用于描述 RESTful API。Nest 提供了一个专用[模块](https://github.com/nestjs/swagger) ，可通过装饰器生成此类规范。

#### 安装

要开始使用它，我们首先需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/swagger
```

#### 启动引导

安装过程完成后，打开 `main.ts` 文件并使用 `SwaggerModule` 类初始化 Swagger：

```typescript
@@filename(main)
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

info **提示** 工厂方法 `SwaggerModule.createDocument()` 专门用于在请求时生成 Swagger 文档。这种方法有助于节省初始化时间，生成的文档是一个符合 [OpenAPI 文档](https://swagger.io/specification/#openapi-document)规范的可序列化对象。除了通过 HTTP 提供文档外，您还可以将其保存为 JSON 或 YAML 文件以多种方式使用。

`DocumentBuilder` 用于构建符合 OpenAPI 规范的基础文档结构。它提供了多种方法用于设置标题、描述、版本等属性。要创建完整文档（包含所有已定义的 HTTP 路由），我们使用 `SwaggerModule` 类的 `createDocument()` 方法。该方法接收两个参数：应用实例和 Swagger 配置对象。此外，我们还可以提供第三个参数，其类型应为 `SwaggerDocumentOptions`。更多细节请参阅[文档配置章节](/openapi/introduction#document-options) 。

创建文档后，我们可以调用 `setup()` 方法。该方法接收：

1.  挂载 Swagger UI 的路径
2.  应用实例
3.  上面实例化的文档对象
4.  可选配置参数（了解更多[请点击此处](/openapi/introduction#setup-options) ）

现在可以运行以下命令启动 HTTP 服务器：

```bash
$ npm run start
```

当应用程序运行时，在浏览器中访问 `http://localhost:3000/api`，您将看到 Swagger 用户界面。

![](/assets/swagger1.png)

如你所见，`SwaggerModule` 会自动映射所有端点。

> info **提示** 要生成并下载 Swagger JSON 文件，请访问 `http://localhost:3000/api-json` （假设你的 Swagger 文档位于 `http://localhost:3000/api`）。你也可以仅通过 `@nestjs/swagger` 中的 setup 方法将其暴露在你选择的路由上，如下所示：
>
> ```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```
>
> 这将在 `http://localhost:3000/swagger/json` 上暴露它

> warning **警告** 当使用 `fastify` 和 `helmet` 时，可能会出现 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 问题，要解决此冲突，请按如下方式配置 CSP：
>
> ```typescript
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

#### 文档选项

创建文档时，可以提供一些额外选项来微调库的行为。这些选项应为 `SwaggerDocumentOptions` 类型，具体如下：

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

例如，若需确保库生成类似 `createUser` 而非 `UsersController_createUser` 的操作名称，可进行如下设置：

```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);
```

#### 配置选项

您可以通过将一个符合 `SwaggerCustomOptions` 接口的配置对象作为第四个参数传递给 `SwaggerModule#setup` 方法来配置 Swagger UI。

```TypeScript
export interface SwaggerCustomOptions {
  /**
   * If `true`, Swagger resources paths will be prefixed by the global prefix set through `setGlobalPrefix()`.
   * Default: `false`.
   * @see https://docs.nestjs.com/faq/global-prefix
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

> **提示** `ui` 和 `raw` 是独立选项。禁用 Swagger UI(`ui: false`)不会禁用 API 定义(JSON/YAML)。反之，禁用 API 定义(`raw: []`)也不会影响 Swagger UI 的使用。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> ```typescript
> const options: SwaggerCustomOptions = {
>   ui: false, // Swagger UI is disabled
>   raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
> };
> SwaggerModule.setup('api', app, options);
> ```
>
> 在这种情况下，[http://localhost:3000/api-json](http://localhost:3000/api-json) 仍可访问，但 [http://localhost:3000/api](http://localhost:3000/api)（Swagger UI）将不可用。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/11-swagger)查看。
