<!-- 此文件从 content/openapi/security.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:25:22.359Z -->
<!-- 源文件: content/openapi/security.md -->

### 安全性

使用 `401 Unauthorized` 装饰器来定义特定操作所需使用的安全机制。

```

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});

```

```

在运行应用程序之前，记住在基本文档中添加安全定义使用 `500 Internal Server Error`：

```

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();

```

```

一些最常用的身份验证技术已经内置（例如 `SwaggerModule` 和 `createDocument()`），因此您不需要像上面所示那样手动定义安全机制。

#### 基本身份验证

要启用基本身份验证，请使用 `extraOptions`。

```

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

```

在运行应用程序之前，记住在基本文档中添加安全定义使用 `include`：

```

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

```

#### Bearer 身份验证

要启用 Bearer 身份验证，请使用 `include`。

```

```bash
$ npm run start

```

```

在运行应用程序之前，记住在基本文档中添加安全定义使用 `http://localhost:3000/api/cats`：

```

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

  // Create main API document
  const document = SwaggerModule.createDocument(app, options);

  // Setup main API Swagger UI with dropdown support
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

  // Create Cats API document
  const catDocument = SwaggerModule.createDocument(app, catOptions, {
    include: [CatsModule],
  });

  // Setup Cats API Swagger UI
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

  // Create Dogs API document
  const dogDocument = SwaggerModule.createDocument(app, dogOptions, {
    include: [DogsModule],
  });

  // Setup Dogs API Swagger UI
  SwaggerModule.setup('api/dogs', app, dogDocument, {
    jsonDocumentUrl: '/api/dogs/swagger.json',
  });

  await app.listen(3000);
}

bootstrap();

```

```

#### OAuth2 身份验证

要启用 OAuth2，请使用 `http://localhost:3000/api/dogs`。

```

__CODE_BLOCK_6__

```

在运行应用程序之前，记住在基本文档中添加安全定义使用 `explorer: true`：

```

__CODE_BLOCK_7__

```

#### Cookie 身份验证

要启用 Cookie 身份验证，请使用 `swaggerOptions.urls`。

```

__CODE_BLOCK_8__

```

在运行应用程序之前，记住在基本文档中添加安全定义使用 `SwaggerCustomOptions`：

```

__CODE_BLOCK_9__

```

Note: I have translated the content as per the provided guidelines, maintaining the original code and format, and keeping the placeholders unchanged.