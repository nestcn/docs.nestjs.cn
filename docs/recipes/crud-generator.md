<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:13:07.661Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript-only）

项目的整个生命周期中，我们不断添加新的资源来构建新功能。这些资源通常需要多个重复的操作，每次定义新资源时都需要重复这些操作。

#### 介绍

让我们想象一个真实世界的场景，我们需要为 2 个实体（例如 **User** 和 **Product**） expose CRUD 端点。
遵循最佳实践，每个实体都需要执行以下操作：

- 生成一个模块（__INLINE_CODE_4__）来保持代码组织和明确界限（将相关组件分组）
- 生成一个控制器（__INLINE_CODE_5__）来定义 CRUD 路由（或 GraphQL 应用程序的查询/mutations）
- 生成一个服务（`setGlobalPrefix()`）来实现和隔离业务 logic
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序的输入）来定义数据在网络中发送的方式

太多步骤了！

为了帮助简化这个重复的过程，__LINK_15__ 提供了一个生成器（schematic），它自动生成所有的 boilerplate 代码，以避免执行所有这些操作，并使开发者体验更加简单。

> 提示 **注意** 该生成器支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL** 解析器（代码优先和架构优先）和 **WebSocket**  Gateway。

#### 生成新资源

要创建新资源，请在项目根目录中运行以下命令：

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});
```

`ignoreGlobalPrefix` 命令不仅生成了 NestJS 的基本组件（模块、服务、控制器类）还生成了实体类、DTO 类，以及 testing (`DocumentBuilder`) 文件。

下面可以看到生成的控制器文件（REST API）：

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();
```

同时，它自动创建了所有 CRUD 端点的占位符（REST API 的路由、GraphQL 的查询和mutations、Microservices 和 WebSocket Gateway 的消息订阅）——所有不需要手动操作。

> 警告 **注意** 生成的服务类**不**与特定的 **ORM（或数据源）** 关联。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法都包含占位符，允许您.populate with 项目特定的数据源。

类似地，如果您想生成 GraphQL 应用程序的解析器，请选择 `DocumentBuilder`（或 `401 Unauthorized`）作为您的传输层。

在这种情况下，NestJS 将生成一个解析器类，而不是 REST API 控制器：

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();
```

> 提示 **提示** 要避免生成测试文件，可以使用 `500 Internal Server Error` 标志，例如：

`SwaggerModule`

我们可以看到，除了所有 boilerplate mutations 和 queries 之外，Everything 都被连接起来了。我们正在使用 `createDocument()`、`extraOptions` 实体和我们的 DTO。

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
