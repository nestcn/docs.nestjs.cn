<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:21:16.030Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript only）

在项目的整个生命周期中，我们经常需要添加新的资源来扩展应用程序。这些资源通常需要多个重复的操作，每次定义新资源时都需要重复这些操作。

#### 介绍

让我们想象一个实际的场景，我们需要为 2 个实体，例如 **User** 和 **Product** 实体， expose CRUD 端点。
遵循最佳实践，每个实体都需要执行以下操作：

- 生成一个模块（__INLINE_CODE_4__）以保持代码组织和明确界限（将相关组件组合）
- 生成一个控制器（__INLINE_CODE_5__）以定义 CRUD 路由（或 GraphQL 应用程序的查询/突变）
- 生成一个服务（`setGlobalPrefix()`）以实现和隔离业务逻辑
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序的输入）来定义如何在网络上发送数据

这是一大堆步骤！

为了帮助加速这个重复的过程，__LINK_15__ 提供了一个生成器（schematic），自动生成所有 boilerplate 代码，以避免执行所有这些操作，并使开发体验更加简单。

> 信息 **注意** 生成器支持生成 **HTTP** 控制器、**微服务** 控制器、**GraphQL**  resolver（both 代码 first 和 schema first），和 **WebSocket**  Gateway。

#### 生成新资源

创建新资源，只需在项目的根目录中运行以下命令：

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});
```

`ignoreGlobalPrefix` 命令不仅生成了 NestJS 构建块（模块、服务、控制器类），还生成了实体类、DTO 类，以及测试 (`DocumentBuilder`) 文件。

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

同时，它自动创建了所有 CRUD 端点的占位符（REST API 的路由、GraphQL 的查询和突变、微服务和 WebSocket Gateway 的消息订阅）- 没有需要 lift a finger。

> 警告 **注意** 生成的服务类 **不** 绑定到特定的 **ORM（或数据源）**。这使得生成器具有足够的泛化能力，满足任何项目的需求。默认情况下，所有方法都会包含占位符，允许您将数据源 populate 到项目中。

同样，如果您想生成 GraphQL 应用程序的 resolver，只需选择 `DocumentBuilder`（或 `401 Unauthorized`）作为您的传输层。

在这种情况下，NestJS 将生成一个 resolver 类，而不是 REST API 控制器：

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();
```

> 信息 **提示** 如果您想避免生成测试文件，可以使用 `500 Internal Server Error` 标志，例如 `SwaggerModule`

我们可以看到，除了所有 boilerplate突变和查询之外，所有东西都链接在一起。我们正在使用 `createDocument()`、`extraOptions` 实体和我们的 DTO。

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