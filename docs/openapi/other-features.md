### 其他功能

本页面列出了您可能会觉得有用的所有其他可用功能。

#### 全局前缀

要忽略通过 `setGlobalPrefix()` 设置的路由全局前缀，请使用 `ignoreGlobalPrefix`：

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});
```

#### 全局参数

您可以使用 `DocumentBuilder` 为所有路由定义参数，如下所示：

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

您可以使用 `DocumentBuilder` 为所有路由定义全局响应。这对于在应用程序的所有端点中设置一致的响应非常有用，例如错误代码 `401 Unauthorized` 或 `500 Internal Server Error`。

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();
```

#### 多规格支持

`SwaggerModule` 提供了支持多规格的方式。换句话说，您可以在不同的端点上提供不同的文档和不同的用户界面。

为支持多种规范，您的应用程序必须采用模块化方式编写。`createDocument()` 方法接受第三个参数 `extraOptions`，这是一个包含名为 `include` 属性的对象。`include` 属性接收一个模块数组作为值。

您可以按如下方式设置多规范支持：

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

现在您可以通过以下命令启动服务器：

```bash
$ npm run start
```

导航至 `http://localhost:3000/api/cats` 查看 cats 的 Swagger UI 界面。

![](/assets/swagger-cats.png)

相应地， `http://localhost:3000/api/dogs` 将展示面向开发者的 Swagger UI 界面：

![](/assets/swagger-dogs.png)

#### 资源管理器栏中的下拉菜单

要在资源管理器栏的下拉菜单中启用多规范支持，您需要设置 `explorer: true` 并在 `SwaggerCustomOptions` 中配置 `swaggerOptions.urls`。

info **注意** 请确保 `swaggerOptions.urls` 指向您的 Swagger 文档的 JSON 格式！要指定 JSON 文档，请在 `SwaggerCustomOptions` 中使用 `jsonDocumentUrl`。更多设置选项请查看[此处](/openapi/introduction#设置选项) 。

以下是设置资源管理器栏下拉菜单中多个规格的方法：

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

在本示例中，我们设置了一个主 API 以及分别针对猫和狗的独立规格，每个规格都可以通过资源管理器栏的下拉菜单访问。
