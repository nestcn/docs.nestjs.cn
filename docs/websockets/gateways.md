<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:42:53.110Z -->
<!-- 源文件: content/websockets/gateways.md -->

### Gateway

大多数 Nest 文档中讨论的概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，在 Gateways 中也同样适用。Nest 尽量抽象实现细节，以便相同的组件可以在 HTTP 基础平台、WebSockets 和微服务中运行。下面将讨论 Nest 对 WebSockets 的特定方面。

在 Nest 中，Gateway simply 是一个使用 `include` 装饰器注释的类。技术上讲，Gateways 是平台无关的，这使它们与任何 WebSockets 库兼容，只要创建了适配器。Nest 支持两种 WS 平台：__LINK_95__ 和 __LINK_96__。您可以根据需要选择其中一种，也可以创建自己的适配器，按照 __LINK_97__ 指示进行。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> 信息 **提示** Gateway 可以被视为 __LINK_98__；这意味着它们可以通过类构造函数注入依赖项。此外，Gateways 也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建基于 WebSockets 的应用程序，首先安装所需的包：

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});

```

#### 概述

通常，每个 Gateway 都在与 **HTTP 服务器**相同的端口上监听，除非您的应用程序不是 Web 应用程序，或者您已经手动更改了端口。可以通过将 `http://localhost:3000/api/cats` 装饰器的参数设置为 `http://localhost:3000/api/dogs` 来更改默认行为。您也可以使用以下构造来设置 Gateway 使用的 __LINK_99__：

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();

```

> 警告 **注意** Gateway 只有在存在模块中的提供者数组中被引用时才被实例化。

您可以将支持的 __LINK_100__ 传递给 socket 构造函数，以便使用第二个参数来装饰 `explorer: true`：

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

Gateway 现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理器来订阅 `swaggerOptions.urls` 消息并将用户回应为相同的数据。

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

> 信息 **提示** `SwaggerCustomOptions` 和 `swaggerOptions.urls` 装饰器来自 `jsonDocumentUrl` 包。

创建 Gateway 之后，我们可以将其注册到我们的模块中。

```bash
$ npm run start

```

您也可以将 property 关键传递给装饰器，以从 incoming 消息体中提取它：

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

如果您不想使用装饰器，以下代码是等效的：

__CODE_BLOCK_6__

在上面的示例中，`SwaggerCustomOptions` 函数接受两个参数。第一个参数是平台特定的 __LINK_101__，而第二个参数是来自客户端的数据。此方法不推荐，因为它需要在每个单元测试中模拟 __INLINE_CODE_25__ 实例。

当 __INLINE_CODE_26__ 消息被接收时，处理器将发送包含相同数据的确认消息。此外，还可以使用库特定的方法来发送消息，例如使用 __INLINE_CODE_27__ 方法。在访问已连接 socket 实例时，使用 __INLINE_CODE_28__ 装饰器。

__CODE_BLOCK_7__

> 信息 **提示** __INLINE_CODE_29__ 装饰器来自 __INLINE_CODE_30__ 包。

然而，在这种情况下，您不能使用拦截器。如果您不想回应用户，可以简单地跳过 __INLINE_CODE_31__ 语句（或明确返回 falsy 值，例如 __INLINE_CODE_32__）。

现在，当客户端 emit 消息如下：

__CODE_BLOCK_8__

__INLINE_CODE_33__ 方法将被执行。要监听来自上述处理器的消息，可以将客户端 attached 到相应的确认监听器：

__CODE_BLOCK_9__

在返回值从消息处理器中隐式发送确认时，高级场景通常需要直接控制确认回调。

__INLINE_CODE_34__ 参数装饰器允许将 __INLINE_CODE_35__ 回调函数直接注入到消息处理器中。
没有使用装饰器，这个回调函数将作为方法的第三个参数传递。

__CODE_BLOCK_10__

#### 多个响应

确认只会被 dispatch 一次。此外，native WebSockets 实现不支持确认。要解决这个限制，可以返回一个对象，其中包含两个属性。__INLINE_CODE_36__ 是 emitted 事件的名称，__INLINE_CODE_37__ 是要将其转发到客户端的值。

__CODE_BLOCK_11__

> 信息 **提示** __INLINE_CODE_38__ 接口来自 __INLINE_CODE_39__ 包。

> 警告 **注意** 如果您的 __INLINE_CODE_41__ 字段依赖于 __INLINE_CODE_42__，则应该返回实现 __INLINE_CODE_40__ 的类实例，因为它忽略了简单的 JavaScript 对象响应。Here is the translation of the technical documentation to Chinese:

为了监听 incoming 响应，客户端需要应用另一个事件监听器。

__CODE_BLOCK_12__

####异步响应

消息处理程序可以同步或异步响应。因此，__INLINE_CODE_43__ 方法是支持的。消息处理程序也可以返回一个 __INLINE_CODE_44__，在这种情况下，结果值将直到流完成时被发出。

__CODE_BLOCK_13__

在上面的示例中，消息处理程序将响应 **3 次**（对数组中的每个项目）。

#### 生命周期钩子

有 3 个有用的 生命周期钩子可用。所有它们都有相应的接口，并在以下表格中描述：

__HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63__
      __HTML_TAG_64__OnGatewayInit__HTML_TAG_65__
    __HTML_TAG_66__
    __HTML_TAG_67__
      强制实现 __HTML_TAG_68__afterInit()__HTML_TAG_69__ 方法。该方法接受库特定的服务器实例作为参数（如果需要）。
    __HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__
      __HTML_TAG_74__OnGatewayConnection__HTML_TAG_75__
    __HTML_TAG_76__
    __HTML_TAG_77__
      强制实现 __HTML_TAG_78__handleConnection()__HTML_TAG_79__ 方法。该方法接受库特定的客户端 socket 实例作为参数。
    __HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__
      __HTML_TAG_84__OnGatewayDisconnect__HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      强制实现 __HTML_TAG_88__handleDisconnect()__HTML_TAG_89__ 方法。该方法接受库特定的客户端 socket 实例作为参数。
    __HTML_TAG_90__
  __HTML_TAG_91__
__HTML_TAG_92__

> info **提示**每个 生命周期接口都从 __INLINE_CODE_45__ 包中暴露。

#### 服务器和命名空间

有时，您可能想访问平台特定的服务器实例。该对象的引用作为参数传递给 __INLINE_CODE_46__ 方法（__INLINE_CODE_47__ 接口）。另外，您可以使用 __INLINE_CODE_48__ 装饰器。

__CODE_BLOCK_14__

此外，您可以使用 __INLINE_CODE_49__ 属性来检索相应的命名空间，例如：

__CODE_BLOCK_15__

__INLINE_CODE_50__ 装饰器将在 __INLINE_CODE_51__ 装饰器存储的元数据中注入服务器实例。如果您将命名空间选项传递给 __INLINE_CODE_52__ 装饰器，__INLINE_CODE_53__ 装饰器将返回 __INLINE_CODE_54__ 实例，而不是 __INLINE_CODE_55__ 实例。

> warning **注意** __INLINE_CODE_56__ 装饰器来自 __INLINE_CODE_57__ 包。

Nest 将自动将服务器实例分配给该属性，以便在准备使用时使用。

__HTML_TAG_93____HTML_TAG_94__

#### 示例

有一个可用的工作示例 __LINK_102__。