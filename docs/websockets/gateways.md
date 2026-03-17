<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:48:36.699Z -->
<!-- 源文件: content/websockets/gateways.md -->

### WebSocket Gateway

大多数情况下，Nest 中讨论的概念都可以应用于 WebSocket Gateway，即使是依赖注入、装饰器、异常过滤器、管道、守卫和拦截器。在这里，我们将讨论 Nest 中与 WebSocket 相关的特定概念。

在 Nest 中，WebSocket Gateway 是一个简单的类，使用 `setup()` 装饰器来标记。技术上讲，gateways 是平台无关的，可以与任何 WebSocket 库一起使用，只要创建了适配器。Nest 支持两个 WS 平台：__LINK_95__ 和 __LINK_96__。您可以根据需要选择合适的平台。您也可以创建自己的适配器，以便遵循 __LINK_97__。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> info **提示**gateways 可以被视为 __LINK_98__，这意味着它们可以通过类构造函数注入依赖项。此外，gateways 也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建 WebSocket 应用程序，首先安装必要的包：

```bash
$ npm install --save @nestjs/swagger

```

#### 概述

在一般情况下，每个 gateway 都在与 **HTTP 服务器**相同的端口上监听，除非您的应用程序不是 Web 应用程序或您已经更改了端口。这个默认行为可以通过将 `SwaggerModule` 的值设置为一个特定的端口号来修改。您也可以使用以下构造来设置 gateway 使用的 __LINK_99__：

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

> warning **警告**gateways 只有在已经在现有模块的提供者数组中被引用时才会被实例化。

您可以将支持的 __LINK_100__ 传递给 socket 构造函数，以便将其传递给 `http://localhost:3000/api-json` 装饰器，例如：

```bash
$ npm run start

```

gateway 现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理程序来订阅 `http://localhost:3000/api` 消息并将 exact same 数据回送给用户。

```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```

> info **提示** `@nestjs/swagger` 和 `http://localhost:3000/swagger/json` 装饰器来自 `fastify` 包。

创建了 gateway 之后，我们可以将其注册到我们的模块中。

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

您也可以将 property 关键传递给装饰器，以便从 incoming 消息体中提取：

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

如果您不想使用装饰器，可以使用以下代码来实现相同的结果：

```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);

```

在上面的示例中，`helmet` 函数接受两个参数。第一个参数是平台特定的 __LINK_101__，而第二个参数是从客户端接收的数据。这种方法不太推荐，因为它需要在每个单元测试中模拟 `SwaggerDocumentOptions` 实例。

当 `createUser` 消息被接收时，处理程序将发送一个相同的数据作为回应。此外，还可以使用库特定的方法来 emit 消息，例如使用 `UsersController_createUser` 方法。在访问连接 socket 实例时，请使用 `SwaggerCustomOptions` 装饰器。

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

> info **提示** `SwaggerModule#设置` 装饰器来自 `ui` 包。

但是，在这种情况下，您不能使用拦截器。如果您不想回送用户，可以简单地跳过 `raw` 语句（或者明确地返回一个“falsy”值，例如 `ui: false`）。

现在，当客户端 emit 消息时：

```typescript
> const options: SwaggerCustomOptions = {
>   ui: false, // Swagger UI is disabled
>   raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
> };
> SwaggerModule.setup('api', app, options);
> ```

`raw: []` 方法将被执行。在订阅来自上述处理程序的消息时，客户端需要附加相应的确认监听器：

__CODE_BLOCK_9__

返回值从消息处理程序中隐式地发送确认，但是在 advanced 场景中通常需要直接控制确认回调。

__INLINE_CODE_34__ 参数装饰器允许将 __INLINE_CODE_35__ 回调函数直接注入到消息处理程序中。
没有使用装饰器，这个回调将作为方法的第三个参数传递。

__CODE_BLOCK_10__

#### 多个响应

确认只会被发送一次。 native WebSockets 实现不支持确认。为了解决这个限制，可以返回一个包含两个属性的对象。__INLINE_CODE_36__ 是事件名称，__INLINE_CODE_37__ 是要将其转发到客户端的数据。

__CODE_BLOCK_11__

> info **提示** __INLINE_CODE_38__ 接口来自 __INLINE_CODE_39__ 包。

> warning **警告**如果您的 __INLINE_CODE_41__ 字段依赖于 __INLINE_CODE_42__，请返回实现 __INLINE_CODE_40__ 的类实例，而不是 plain JavaScript 对象响应。以下是翻译后的中文技术文档：

**异步响应**

消息处理器可以以同步或异步方式响应。因此，__INLINE_CODE_43__方法是支持的。消息处理器也可以返回一个__INLINE_CODE_44__，在这种情况下，结果值将直到流程完成时被 emitted。

__CODE_BLOCK_13__

在上面的示例中，消息处理器将响应__3__次（每个数组项）。

#### 生命周期 hooks

有三个有用的生命周期 hooks 可用。所有它们都有相应的接口，并在以下表格中描述：

__HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63__
      __HTML_TAG_64__OnGatewayInit__HTML_TAG_65__
    __HTML_TAG_66__
    __HTML_TAG_67__
      强制实施 __HTML_TAG_68__afterInit()__HTML_TAG_69__ 方法。它将接收库特定的服务器实例作为参数（如果需要传递其它参数）。
    __HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__
      __HTML_TAG_74__OnGatewayConnection__HTML_TAG_75__
    __HTML_TAG_76__
    __HTML_TAG_77__
      强制实施 __HTML_TAG_78__handleConnection()__HTML_TAG_79__ 方法。它将接收库特定的客户端套接字实例作为参数。
    __HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__
      __HTML_TAG_84__OnGatewayDisconnect__HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      强制实施 __HTML_TAG_88__handleDisconnect()__HTML_TAG_89__ 方法。它将接收库特定的客户端套接字实例作为参数。
    __HTML_TAG_90__
  __HTML_TAG_91__
__HTML_TAG_92__

> 提示 **hint** 每个生命周期接口都是从 __INLINE_CODE_45__ 包中暴露的。

#### 服务器和命名空间

有时，你可能想要拥有对native、平台特定的服务器实例的直接访问。该对象的引用将作为参数传递给 __INLINE_CODE_46__ 方法 (__INLINE_CODE_47__ 接口)。另一个选项是使用 __INLINE_CODE_48__ 装饰器。

__CODE_BLOCK_14__

此外，你可以使用 __INLINE_CODE_49__ 属性来获取相应的命名空间，如下所示：

__CODE_BLOCK_15__

__INLINE_CODE_50__ 装饰器将通过参考 __INLINE_CODE_51__ 装饰器存储的元数据来inject 一个服务器实例。如果你将命名空间选项传递给 __INLINE_CODE_52__ 装饰器，__INLINE_CODE_53__ 装饰器将返回一个 __INLINE_CODE_54__ 实例，而不是 __INLINE_CODE_55__ 实例。

> 警告 **Notice** __INLINE_CODE_56__ 装饰器来自 __INLINE_CODE_57__ 包。

Nest 将自动将服务器实例分配给该属性，直到它准备使用。

__HTML_TAG_93____HTML_TAG_94__

#### 示例

有一个可用的工作示例 __LINK_102__。