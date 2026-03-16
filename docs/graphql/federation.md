<!-- 此文件从 content/graphql/federation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:30:37.353Z -->
<!-- 源文件: content/graphql/federation.md -->

### Federation

Federation 提供了一种将 monolithic GraphQL 服务器拆分为独立的微服务的方法。它由两个组件组成：gateway 和一个或多个联邦微服务。每个微服务都持有部分schema，而 gateway 将这些schema合并成一个单独的schema，供客户端消费。

Federation 的设计原则是：

- 建立图形应该是 **声明式** 的。使用 federation，您可以在schema中声明性地构建图形，而不是编写schema stitching 代码。
- 代码应该是 **关注点分离** 的，而不是类型分离。有时，一个团队不控制每个重要类型的每个方面，因此这些类型的定义应该分布在多个团队和代码库中，而不是集中在一个地方。
- 图形应该是简单的，可以被客户端轻松消费。联邦服务可以形成一个完整的、产品focused 的图形，准确地反映客户端的消费方式。
- 它只是 **GraphQL**，使用语言规范的特性。任何语言，包括但不限于 JavaScript，可以实现 federation。

> 警告 Federation 目前不支持订阅。

下面，我们将设置一个示例应用程序，包括一个 gateway 和两个联邦端点：Users 服务和 Posts 服务。

#### Federation with Apollo

首先，安装所需的依赖项：

```bash
$ npm install --save @nestjs/swagger

```

#### Schema first

"Users 服务" 提供了一个简单的schema。注意 __INLINE_CODE_38__ 指令：它 instructs Apollo 查询规划器，如果您指定了 __INLINE_CODE_40__，可以 fetch 到 __INLINE_CODE_39__ 的实例。同时，我们 __INLINE_CODE_41__ 了 __INLINE_CODE_42__ 类型。

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

Resolver 提供了一个额外的方法名为 __INLINE_CODE_43__。这个方法在 Apollo Gateway 中被触发，每当一个相关资源需要一个 User 实例时。我们将在 Posts 服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_44__ 装饰器标注。

```bash
$ npm run start

```

最后，我们将一切 Hook 起来，注册 __INLINE_CODE_45__，将 __INLINE_CODE_46__ driver 传递给配置对象：

```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```

#### Code first

首先，我们添加一些额外的装饰器到 __INLINE_CODE_47__ 实体中。

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

Resolver 提供了一个额外的方法名为 __INLINE_CODE_48__。这个方法在 Apollo Gateway 中被触发，每当一个相关资源需要一个 User 实例时。我们将在 Posts 服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_49__ 装饰器标注。

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

最后，我们将一切 Hook 起来，注册 __INLINE_CODE_50__，将 __INLINE_CODE_51__ driver 传递给配置对象：

```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);

```

一个工作示例可以在 __LINK_128__ 和 __LINK_129__ 中找到。

#### Federated example: Posts

Posts 服务 supposed to serve aggregated posts through the __INLINE_CODE_52__ query, but also extend our __INLINE_CODE_53__ type with the __INLINE_CODE_54__ field.

#### Schema first

"Posts 服务" 在其 schema 中引用了 __INLINE_CODE_55__ 类型，使用 __INLINE_CODE_56__ 关键字。它还声明了 __INLINE_CODE_57__ 类型的额外属性(__INLINE_CODE_58__）。注意 __INLINE_CODE_59__ 指令用于匹配 User 实例的实例，并使用 __INLINE_CODE_60__ 指令指出 __INLINE_CODE_61__ 字段是由其他地方管理的。

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

在以下示例中，__INLINE_CODE_62__ 提供了 __INLINE_CODE_63__ 方法，该方法返回一个包含 __INLINE_CODE_64__ 和一些额外属性的引用。__INLINE_CODE_66__ 是由 GraphQL Gateway 使用来 pinpoint 联邦微服务负责 User 类型的实例，并 retrieve 对应的实例。"Users 服务" 描述了上述将在 __INLINE_CODE_67__ 方法中被请求。

```typescript
> const options: SwaggerCustomOptions = {
>   ui: false, // Swagger UI is disabled
>   raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
> };
> SwaggerModule.setup('api', app, options);
> ```

最后，我们必须注册 __INLINE_CODE_68__，类似于在 "Users 服务" 部分中所做的。

__CODE_BLOCK_9__

#### Code first

首先，我们将声明一个表示 __INLINE_CODE_69__ 实体的类。虽然实体自己生活在另一个服务中，我们将在这里使用它（扩展其定义）。注意 __INLINE_CODE_70__ 和 __INLINE_CODE_71__ 指令。

__CODE_BLOCK_10__

现在，让我们创建对应的 resolverFor 我们对 __INLINE_CODE_72__ 实体的扩展，如下所示：

__CODE_BLOCK_11__

我们还需要定义 __INLINE_CODE_73__ 实体类：

__CODE_BLOCK_12__

And its resolver:

__CODE_BLOCK_13__

And finally, tie it together in a module. Note the schema build options, where we specify that __INLINE_CODE_74__ is an orphaned (external) type.

__CODE_BLOCK_14__以下是翻译后的中文文档：

#### Federated 示例：Gateway

可以查看代码的 __LINK_130__ 和模式的 __LINK_131__。

#### Federation Gateway

首先，安装所需的依赖项：

__CODE_BLOCK_15__

Gateway 需要指定端点列表，并将自动发现相应的架构。因此，Gateway 服务的实现将保持不变， both for code and schema first approaches。

__CODE_BLOCK_16__

可以查看代码的 __LINK_132__ 和模式的 __LINK_133__。

#### Federation with Mercurius

首先，安装所需的依赖项：

__CODE_BLOCK_17__

> info **注意** __INLINE_CODE_75__ 包需要安装，以便构建子图架构（__INLINE_CODE_76__、__INLINE_CODE_77__ 函数）。

#### Schema First

“用户服务”提供了一个简单的架构。请注意 __INLINE_CODE_78__ 指令：它告诉 Mercurius 查询计划员，如果你指定了 __INLINE_CODE_80__，可以 fetch __INLINE_CODE_79__ 的实例。同时，注意我们 __INLINE_CODE_81__ __INLINE_CODE_82__ 类型。

__CODE_BLOCK_18__

Resolver 提供了一个额外的方法名为 __INLINE_CODE_83__。这个方法在 Mercurius Gateway 中被触发，当相关资源需要一个用户实例时。请注意，这个方法必须被 __INLINE_CODE_84__ 装饰器标记。

__CODE_BLOCK_19__

最后，我们将所有内容连接起来，通过在配置对象中注册 __INLINE_CODE_85__，并将 __INLINE_CODE_86__ 驱动器作为参数传递：

__CODE_BLOCK_20__

#### Code First

首先，在 __INLINE_CODE_87__ 实体上添加一些额外的装饰器。

__CODE_BLOCK_21__

Resolver 提供了一个额外的方法名为 __INLINE_CODE_88__。这个方法在 Mercurius Gateway 中被触发，当相关资源需要一个用户实例时。请注意，这个方法必须被 __INLINE_CODE_89__ 装饰器标记。

__CODE_BLOCK_22__

最后，我们将所有内容连接起来，通过在配置对象中注册 __INLINE_CODE_90__，并将 __INLINE_CODE_91__ 驱动器作为参数传递：

__CODE_BLOCK_23__

#### Federated 示例：Posts

文章服务将通过 __INLINE_CODE_92__ 查询来提供聚合文章，并将 __INLINE_CODE_93__ 类型扩展到 __INLINE_CODE_94__ 字段。

#### Schema First

“文章服务”在其架构中引用 __INLINE_CODE_95__ 类型，并使用 __INLINE_CODE_96__ 关键字标记它。它还声明了 __INLINE_CODE_97__ 类型上的一个额外属性(__INLINE_CODE_98__）。请注意，用于匹配 User 实例的 __INLINE_CODE_99__ 指令，以及用于指示 __INLINE_CODE_101__ 字段由其他地方管理的 __INLINE_CODE_100__ 指令。

__CODE_BLOCK_24__

在以下示例中，__INLINE_CODE_102__ 提供了 __INLINE_CODE_103__ 方法，该方法返回一个包含 __INLINE_CODE_104__ 和一些额外属性的引用，用于解决引用。在这个情况下，__INLINE_CODE_105__。__INLINE_CODE_106__ 是 GraphQL Gateway 使用的，用于 pinpoint User 类型对应的微服务，并检索相应的实例。之前描述的 “用户服务”将在 __INLINE_CODE_107__ 方法执行时被请求。

__CODE_BLOCK_25__

最后，我们必须注册 __INLINE_CODE_108__，与之前的 “用户服务” 部分类似。

__CODE_BLOCK_26__

#### Code First

首先，我们将声明一个表示 __INLINE_CODE_109__ 实体的类。虽然实体本身在另一个服务中，但我们将在这里使用它（扩展其定义）。请注意 __INLINE_CODE_110__ 和 __INLINE_CODE_111__ 指令。

__CODE_BLOCK_27__

现在，让我们创建 __INLINE_CODE_112__ 实体的对应解析器：

__CODE_BLOCK_28__

我们还需要定义 __INLINE_CODE_113__ 实体类：

__CODE_BLOCK_29__

和其解析器：

__CODE_BLOCK_30__

最后，让我们将其连接起来，通过在模块中注册 __INLINE_CODE_114__，并指定 __INLINE_CODE_115__ 是一个 orphaned（外部）类型。

__CODE_BLOCK_31__

#### Federated 示例：Gateway

Gateway 需要指定端点列表，并将自动发现相应的架构。因此，Gateway 服务的实现将保持不变， both for code and schema first approaches。

__CODE_BLOCK_32__

### Federation 2

请查看 __LINK_134__，Federation 2 提高了开发体验，相比原始的 Apollo Federation（称为 Federation 1 在本文档中），它是向后兼容的。

> warning **注意** Mercurius 不完全支持 Federation 2。您可以查看支持 Federation 2 的库列表 __LINK_135__。

在以下部分，我们将升级之前的示例到 Federation 2。

#### Federated 示例：UsersHere is the translation of the English technical documentation to Chinese:

Federation 2 中的一個變化是，實體無 longer 有原生子圖形，因此我們不需要繼承 __INLINE_CODE_115__ anymore。詳細信息請參考 __LINK_136__ 在 Apollo Federation 2 文件中。

#### Schema first

我們可以簡單地從 schema 中刪除 __INLINE_CODE_116__ 語句。

__CODE_BLOCK_33__

#### Code first

使用 Federation 2 需要在 __INLINE_CODE_117__ 選項中指定聯邦版本。

__CODE_BLOCK_34__

#### Federated example: Posts

和上述原因相同，我們不需要繼承 __INLINE_CODE_118__ 和 __INLINE_CODE_119__ anymore。

#### Schema first

我們可以簡單地從 schema 中刪除 __INLINE_CODE_120__ 和 __INLINE_CODE_121__ 指令。

__CODE_BLOCK_35__

#### Code first

因為我們不再繼承 __INLINE_CODE_122__ 實體，我們可以簡單地刪除 __INLINE_CODE_123__ 和 __INLINE_CODE_124__ 指令從 __INLINE_CODE_125__ 中。

__CODE_BLOCK_36__

此外，類似於 User 服務，我們需要在 __INLINE_CODE_126__ 中指定使用 Federation 2。

__CODE_BLOCK_37__