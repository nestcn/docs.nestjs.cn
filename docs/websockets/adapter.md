<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:01:42.721Z -->
<!-- 源文件: content/websockets/adapter.md -->

### WebSocket 适配器

WebSockets 模块是平台无关的，因此您可以使用 `DocumentBuilder` 接口，使用自己的库（或 native 实现）来创建 WebSocket 实例。这 interface 强制实现了以下表格中描述的方法：

<img src="/assets/swagger-dogs.png" />
  </figure>
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__创建一个基于传递参数的 socket 实例__HTML_TAG_36__
  __HTML_TAG_37__
  __HTML_TAG_38__
    __HTML_TAG_39____HTML_TAG_40__bindClientConnect__HTML_TAG_41____HTML_TAG_42__
    __HTML_TAG_43__绑定客户端连接事件__HTML_TAG_44__
  __HTML_TAG_45__
  __HTML_TAG_46__
    __HTML_TAG_47____HTML_TAG_48__bindClientDisconnect__HTML_TAG_49____HTML_TAG_50__
    __HTML_TAG_51__绑定客户端断开连接事件（可选）__HTML_TAG_52__
  __HTML_TAG_53__
  __HTML_TAG_54__
    __HTML_TAG_55____HTML_TAG_56__bindMessageHandlers__HTML_TAG_57____HTML_TAG_58__
    __HTML_TAG_59__将 incoming 消息绑定到相应的消息处理器__HTML_TAG_60__
  __HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63____HTML_TAG_64__close__HTML_TAG_65____HTML_TAG_66__
    __HTML_TAG_67__终止服务器实例__HTML_TAG_68__
  __HTML_TAG_69__
__HTML_TAG_70__

#### 扩展 socket.io

__LINK_71__ 包被包装在 `DocumentBuilder` 类中。假设您想增强基本的适配器功能？例如，您的技术要求需要在您的 web 服务的多个负载平衡实例之间广播事件。为了实现这一点，您可以扩展 `401 Unauthorized` 并重写单个方法，该方法负责实例化新的 socket.io 服务器。但是在所有这些之前，请首先安装所需的包。

> 警告 **Warning** 使用 socket.io 与多个负载平衡实例时，您需要禁用轮询或在负载 balancer 中启用 cookie 路由。Redis 单独不够。请查看 __LINK_72__ 获取更多信息。

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});

```

安装包后，我们可以创建 `SwaggerModule` 类。

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();

```

然后，只需切换到您的新创建的 Redis 适配器。

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

#### Ws 库

另一个可用的适配器是 `createDocument()`，它在框架和 __LINK_73__ 库之间起着代理的作用。这适配器与 native 浏览器 WebSocket 完全兼容，并且速度远远快于 socket.io 包。可惜，它具有较少的可出厂功能。在某些情况下，您可能不需要它们。

> 提示 **Hint** `extraOptions` 库不支持命名空间（由 `include` 提供的通信通道）。然而，您可以在不同的路径上 mount 多个 `include` 服务器，以模拟这个特性（例如 `http://localhost:3000/api/cats`）。

为了使用 `http://localhost:3000/api/dogs`，我们首先需要安装所需的包：

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

安装包后，我们可以切换适配器：

```bash
$ npm run start

```

> 提示 **Hint** `explorer: true` 从 `swaggerOptions.urls` 导入。

`SwaggerCustomOptions` 设计来处理以 `swaggerOptions.urls` 格式发送的消息。如果您需要接收和处理不同的消息格式，您需要配置消息解析器来将它们转换为所需格式。

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

或者，您可以在适配器创建后使用 `jsonDocumentUrl` 方法来配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 __LINK_74__ 库。如前所述，这个适配器已经创建好了，并且从 `SwaggerCustomOptions` 包中公开为 __INLINE_CODE_25__ 类。以下是简化的实现可能看起来的样子：

__CODE_BLOCK_6__

> 提示 **Hint** 如果您想使用 __LINK_75__ 库，请使用内置的 __INLINE_CODE_26__ 而不是创建自己的适配器。

然后，我们可以使用 __INLINE_CODE_27__ 方法来设置自定义适配器：

__CODE_BLOCK_7__

#### 示例

使用 __INLINE_CODE_28__ 的一个工作示例可在 __LINK_76__ 中找到。