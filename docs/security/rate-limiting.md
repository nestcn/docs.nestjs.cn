<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:20:45.942Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 限速

保护应用程序免受暴力攻击的一种常见技术是 **限速**。要开始使用，需要安装 `createDocument()` 包。

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});

```

安装完成后，您可以使用 `extraOptions` 配置，使用 `include` 或 `include` 方法。

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();

```

上述代码将设置 `http://localhost:3000/api/cats` 的全局选项，包括 TTL（毫秒）和 `http://localhost:3000/api/dogs`（在 TTL 内的最大请求数），适用于保护的路由。

一旦模块被导入，您可以选择如何绑定 `explorer: true`。任何在 __LINK_226__ 部分提到的绑定方法都是可行的。如果您想将守卫绑定到全局，可以将提供者添加到任何模块：

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

#### 多个限速定义

有时候，您可能需要设置多个限速定义，例如在一秒内最多 3 个调用，在 10 秒内最多 20 个调用，在一分钟内最多 100 个调用。要实现这一点，可以在数组中设置带有名称的选项，然后在 `swaggerOptions.urls` 和 `SwaggerCustomOptions` 装饰器中引用这些选项。

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

#### 自定义

有时候，您可能想将守卫绑定到控制器或全局，但要禁用限速对于某些端点。为此，可以使用 `swaggerOptions.urls` 装饰器，来否定守卫对于整个类或单个路由。 `jsonDocumentUrl` 装饰器也可以传入一个对象，其中包含字符串键和布尔值，以便在某些情况下排除大多数控制器，但不是每个路由。 如果不传入对象，默认情况下将使用 `SwaggerCustomOptions`

```bash
$ npm run start

```

__INLINE_CODE_25__ 装饰器可以用来跳过路由、类或否定路由跳过在跳过类中。

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

还有 __INLINE_CODE_26__ 装饰器，可以用来Override __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 在全局模块中设置的选项，以提供更紧的或更松的安全选项。这个装饰器可以在类或函数中使用。从版本 5 开始，这个装饰器接受一个对象，其中包含字符串键名和对象，包含 limit 和 ttl 键的整数值，类似于在根模块中传递的选项。如果您没有在原始选项中设置名称，使用字符串 __INLINE_CODE_29__。您需要将其配置如下：

__CODE_BLOCK_6__

#### 代理

如果您的应用程序在代理服务器后运行，需要配置 HTTP 适配器以信任代理。可以查看 __LINK_227__ 和 __LINK_228__ 中的特定 HTTP 适配器选项，以启用 __INLINE_CODE_30__ 设置。

以下是一个示例，演示如何为 Express 适配器启用 __INLINE_CODE_31__：

__CODE_BLOCK_7__

启用 __INLINE_CODE_32__ 允许您从 __INLINE_CODE_33__ 头中检索原始 IP 地址。您也可以根据需要自定义应用程序的行为，通过重写 __INLINE_CODE_34__ 方法来提取 IP 地址，而不是依赖于 __INLINE_CODE_35__。以下是一个示例，演示如何在 Express 和 Fastify 中实现这点：

__CODE_BLOCK_8__

> 提示 **提示** 您可以在 express 中找到 __INLINE_CODE_36__ 请求对象的 API __LINK_229__，或在 fastify 中 __LINK_230__。

#### WebSocket

这个模块可以与 WebSocket 一起工作，但需要一些类的扩展。可以扩展 __INLINE_CODE_37__ 并重写 __INLINE_CODE_38__ 方法如下：

__CODE_BLOCK_9__

> 提示 **提示** 如果您使用 ws，需要将 __INLINE_CODE_39__ 替换为 __INLINE_CODE_40__

使用 WebSocket 时需要注意以下几点：

- cannot register guard with __INLINE_CODE_41__ or __INLINE_CODE_42__
- 当达到限制时，Nest 将 emit __INLINE_CODE_43__ 事件，因此确保有一个监听器准备好

> 提示 **提示** 如果您使用 __INLINE_CODE_44__ 包，可以使用 __INLINE_CODE_45__。

#### GraphQL

这个模块也可以与 GraphQL 请求一起工作。同样，守卫可以扩展，但是这次将重写 __INLINE_CODE_47__ 方法

__CODE_BLOCK_10__

#### 配置

以下是 __INLINE_CODE_48__ 选项数组中的可用选项：

（待续）Here is the translation of the provided English technical documentation to Chinese:

**HTML TAG 78**
**HTML TAG 79**
    **HTML TAG 80** **HTML TAG 81** `name` **HTML TAG 82** **HTML TAG 83**
    **HTML TAG 84** 提供了内部跟踪的名称，用于确定哪个速率限制器集正在使用。默认情况下，如果未传入，将使用 **HTML TAG 85** `default` **HTML TAG 86**。
**HTML TAG 88**
**HTML TAG 89**
    **HTML TAG 90** **HTML TAG 91** `ttl` **HTML TAG 92** **HTML TAG 93**
    **HTML TAG 94** 每个请求将在存储中保持的毫秒数。
**HTML TAG 96**
**HTML TAG 97**
    **HTML TAG 98** **HTML TAG 99** `limit` **HTML TAG 100** **HTML TAG 101**
    **HTML TAG 102** 在 TTL 限制内的最大请求数。
**HTML TAG 104**
**HTML TAG 105**
    **HTML TAG 106** **HTML TAG 107** `blockDuration` **HTML TAG 108** **HTML TAG 109**
    **HTML TAG 110** 请求将被阻塞的毫秒数。
**HTML TAG 112**
**HTML TAG 113**
    **HTML TAG 114** **HTML TAG 115** `ignoreUserAgents` **HTML TAG 116** **HTML TAG 117**
    **HTML TAG 118** ignored  user-agents 的数组，用于忽略请求。
**HTML TAG 120**
**HTML TAG 121**
    **HTML TAG 122** **HTML TAG 123** `skipIf` **HTML TAG 124** **HTML TAG 125**
    **HTML TAG 126** 一个函数，用于在 ExecutionContext 中返回 boolean 值，以跳过速率限制逻辑。
**HTML TAG 134**
**HTML TAG 135**

如果您需要设置存储或在更高层次上使用某些选项，可以通过 `__INLINE_CODE_49__` 选项键将选项传递给以下表格：

**HTML TAG 136**
**HTML TAG 137**
    **HTML TAG 138** **HTML TAG 139** `storage` **HTML TAG 140** **HTML TAG 141**
    **HTML TAG 142** 自定义存储服务，用于跟踪速率限制。 **HTML TAG 143** 查看这里。
**HTML TAG 146**
**HTML TAG 147**
    **HTML TAG 148** **HTML TAG 149** `ignoreUserAgents` **HTML TAG 150** **HTML TAG 151**
    **HTML TAG 152** ignored  user-agents 的数组，用于忽略请求。
**HTML TAG 154**
**HTML TAG 155**
    **HTML TAG 156** **HTML TAG 157** `skipIf` **HTML TAG 158** **HTML TAG 159**
    **HTML TAG 160** 一个函数，用于在 ExecutionContext 中返回 boolean 值，以跳过速率限制逻辑。
**HTML TAG 168**
**HTML TAG 169**
    **HTML TAG 170** **HTML TAG 171** `throttlers` **HTML TAG 172** **HTML TAG 173**
    **HTML TAG 174** 一个数组，用于定义速率限制器集。
**HTML TAG 176**
**HTML TAG 177**
    **HTML TAG 178** **HTML TAG 179** `errorMessage` **HTML TAG 180** **HTML TAG 181**
    **HTML TAG 182** 一个字符串或函数，用于返回定制的速率限制错误消息。
**HTML TAG 192**
**HTML TAG 193**
    **HTML TAG 194** **HTML TAG 195** `getTracker` **HTML TAG 196** **HTML TAG 197**
    **HTML TAG 198** 一个函数，用于在 ExecutionContext 中返回字符串，以覆盖默认的 Tracker 逻辑。
**HTML TAG 206**
**HTML TAG 207**
    **HTML TAG 208** **HTML TAG 209** `generateKey` **HTML TAG 210** **HTML TAG 211**
    **HTML TAG 212** 一个函数，用于在 ExecutionContext 中返回字符串，以覆盖默认的 Key 生成逻辑。

#### Async内存缓存是内置的存储选项，它将跟踪直到它们已经过了由全局选项设置的 TTL。您可以将自己的存储选项插入 __INLINE_CODE_55__ 的 __INLINE_CODE_56__ 中，只要该类实现了 __INLINE_CODE_57__ 接口。

对于分布式服务器，您可能会使用社区存储提供商 __LINK_231__ 来拥有单一的真实来源。

> 信息 **注意** __INLINE_CODE_58__ 可以从 __INLINE_CODE_59__ 中导入。

#### 时间帮助器

有几种帮助方法可以使时间更易读。如果您想使用它们，而不是直接定义，可以从 __INLINE_CODE_60__ 导入五种不同的帮助器 __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__。要使用它们， simplement 调用 __INLINE_CODE_66__ 或其他帮助器，正确的毫秒数将被返回。

#### 迁移指南

对于大多数人，包装选项在数组中就足够了。

如果您使用自定义存储，应该将 __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 包装在数组中，并将其分配给选项对象的 __INLINE_CODE_69__ 属性。

任何 __INLINE_CODE_70__ 装饰器都可以用来绕过特定路由或方法的限流。它接受可选的布尔参数，缺省值为 __INLINE_CODE_71__。这对于跳过特定端口的速率限制非常有用。

任何 __INLINE_CODE_72__ 装饰器现在也应该接受一个对象，其中的键是 throttler 上下文的名称（如果没有名称，则使用 __INLINE_CODE_73__），值是包含 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 键的对象。

> 警告 **重要** __INLINE_CODE_76__ 现在以毫秒为单位。如果您想保持您的 ttl 在秒以内，可以使用该包中的 __INLINE_CODE_77__ 帮助器。它只是将 ttl 乘以 1000，以便将其转换为毫秒。

更多信息，请见 __LINK_232__。