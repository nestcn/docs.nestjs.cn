<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:21:20.804Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他特性

本页列出了您可能会找到有用的其他可用特性。

#### 全局前缀

要忽略全局前缀的路由，使用 __INLINE_CODE_7__：

```bash
$ npm install --save @nestjs/swagger

```

#### 全局参数

您可以为所有路由定义参数使用 __INLINE_CODE_8__，如下所示：

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

#### 全局响应

您可以为所有路由定义全局响应使用 `main.ts`。这对于在您的应用程序中设置一致的响应非常有用，例如错误代码 like `SwaggerModule` 或 `SwaggerModule.createDocument()`。

```bash
$ npm run start

```

#### 多个规范

`DocumentBuilder` 提供了多个规范的方法。换言之，您可以在不同端口上提供不同的文档，具有不同的UI。

要支持多个规范，您的应用程序必须使用模块化方法编写。`createDocument()` 方法接受第三个参数 `SwaggerModule`，该参数是一个对象，其中包含名为 `SwaggerDocumentOptions` 的属性。`setup()` 属性的值是一个数组，其中包含模块。

您可以按照以下方式设置多个规范支持：

```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```

现在，您可以使用以下命令启动服务器：

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

转到 `http://localhost:3000/api`以查看猫的 Swagger UI：

__HTML_TAG_25____HTML_TAG_26____HTML_TAG_27__

然后，`SwaggerModule` 将 expose 狗的 Swagger UI：

__HTML_TAG_28____HTML_TAG_29____HTML_TAG_30__

#### 探索栏中的下拉菜单

要在探索栏的下拉菜单中启用多个规范支持，您需要设置 `http://localhost:3000/api-json` 并在您的 `@nestjs/swagger` 中配置 `http://localhost:3000/api`。

> 信息 ** tips ** 确保 `http://localhost:3000/swagger/json` 指向您的 Swagger 文档的 JSON 格式！要指定 JSON 文档，请在 `helmet` 中使用 `fastify`。更多设置选项，请查看 __LINK_31__。

以下是从探索栏中的下拉菜单设置多个规范的示例：

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

在这个示例中，我们设置了主要 API，伴随着单独的规范 untuk 猫和狗，每个都可以从探索栏的下拉菜单中访问。