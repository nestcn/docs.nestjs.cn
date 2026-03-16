<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:30:20.190Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他功能

本页列出了您可能会发现有用的其他可用功能。

#### 全局前缀

要忽略全局前缀对于通过 `setGlobalPrefix()` 设置的路由，可以使用 `ignoreGlobalPrefix`：

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});

```

#### 全局参数

您可以使用 `DocumentBuilder` 为所有路由定义参数，像下面所示：

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();

```

#### 全局响应

您可以使用 `DocumentBuilder` 为所有路由定义全局响应。这有助于在您的应用程序中设置一致的响应，例如错误代码 `401 Unauthorized` 或 `500 Internal Server Error`。

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

#### 多种规范

`SwaggerModule` 提供了一种支持多种规范的方法。换言之，您可以在不同的端点上提供不同的文档，以不同的UI。

要支持多种规范，需要您的应用程序具有模块化的结构。`createDocument()` 方法将一个第三个参数 `extraOptions`，该参数是一个对象，其中包含一个名为 `include` 的属性。`include` 属性的值是一个模块的数组。

您可以按照以下方式设置多种规范支持：

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';

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

  const catDocumentFactory = () =>
    SwaggerModule.createDocument(app, options, {
      include: [CatsModule],
    });
  SwaggerModule.setup('api/cats', app, catDocumentFactory);

  const secondOptions = new DocumentBuilder()
    .setTitle('Dogs example')
    .setDescription('The dogs API description')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  const dogDocumentFactory = () =>
    SwaggerModule.createDocument(app, secondOptions, {
      include: [DogsModule],
    });
  SwaggerModule.setup('api/dogs', app, dogDocumentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

现在，您可以使用以下命令启动服务器：

```bash
$ npm run start

```

转到 `http://localhost:3000/api/cats` 查看 Swagger UI 对于猫：

<figure><img src="/assets/swagger-cats.png" /></figure>

反之，`http://localhost:3000/api/dogs` 将暴露 Swagger UI 对于狗：

<figure><img src="/assets/swagger-dogs.png" /></figure>

#### 排序菜单

要在 探索栏的下拉菜单中启用多种规范支持，您需要设置 `explorer: true` 并在您的 `SwaggerCustomOptions` 中配置 `swaggerOptions.urls`。

> info **提示** 确保 `swaggerOptions.urls` 指向 Swagger 文档的 JSON 格式！要指定 JSON 文档，可以在 `SwaggerCustomOptions` 中使用 `jsonDocumentUrl`。更多设置选项，请查看 [here](/openapi/introduction#设置选项)。

以下是如何从 探索栏的下拉菜单中设置多种规范的示例：

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Main API options
  const options = new DocumentBuilder()
    .setTitle('Multiple Specifications Example')
    .setDescription('Description for multiple specifications')
    .setVersion('1.0')
    .build();

  // 创建 main API document
  const document = SwaggerModule.createDocument(app, options);

  // 设置up main API Swagger UI with dropdown support
  SwaggerModule.setup('api', app, document, {
    explorer: true,
    swaggerOptions: {
      urls: [
        {
          name: '1. API',
          url: 'api/swagger.json',
        },
        {
          name: '2. Cats API',
          url: 'api/cats/swagger.json',
        },
        {
          name: '3. Dogs API',
          url: 'api/dogs/swagger.json',
        },
      ],
    },
    jsonDocumentUrl: '/api/swagger.json',
  });

  // Cats API options
  const catOptions = new DocumentBuilder()
    .setTitle('Cats Example')
    .setDescription('Description for the Cats API')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  // 创建 Cats API document
  const catDocument = SwaggerModule.createDocument(app, catOptions, {
    include: [CatsModule],
  });

  // 设置up Cats API Swagger UI
  SwaggerModule.setup('api/cats', app, catDocument, {
    jsonDocumentUrl: '/api/cats/swagger.json',
  });

  // Dogs API options
  const dogOptions = new DocumentBuilder()
    .setTitle('Dogs Example')
    .setDescription('Description for the Dogs API')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  // 创建 Dogs API document
  const dogDocument = SwaggerModule.createDocument(app, dogOptions, {
    include: [DogsModule],
  });

  // 设置up Dogs API Swagger UI
  SwaggerModule.setup('api/dogs', app, dogDocument, {
    jsonDocumentUrl: '/api/dogs/swagger.json',
  });

  await app.listen(3000);
}

bootstrap();

```

在这个示例中，我们设置了一个主要 API，along with 单独的规范对于猫和狗，每个规范都可以从 探索栏的下拉菜单中访问。