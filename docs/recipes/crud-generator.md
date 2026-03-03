<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:14:13.288Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript Only）

开发项目的整个生命周期中，我们经常需要添加新的资源到我们的应用程序中。这些资源通常需要多个重复的操作，我们每次定义新资源时都需要重复这些操作。

#### 介绍

让我们想象一个实际的场景，我们需要为 2 个实体，例如 **User** 和 **Product** 实体，暴露 CRUD 端点。

遵循最佳实践，对于每个实体，我们需要执行多个操作，例如：

- 生成一个模块 (__INLINE_CODE_4__)，以保持代码组织和明确界限（将相关组件 grouping）
- 生成一个控制器 (__INLINE_CODE_5__)，以定义 CRUD 路由（或 GraphQL 应用程序中的查询/变更）
- 生成一个服务 (`setGlobalPrefix()`)，以实现和隔离业务逻辑
- 生成实体类/接口，以表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序中的输入），以定义数据如何在网络上发送

这是很多步骤！

为了帮助简化这个重复的过程， __LINK_15__ 提供了一个生成器（模式），自动生成所有 boilerplate 代码，以帮助我们避免执行所有这些操作，提高开发体验。

> 信息 **注意** 生成器支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL** 解析器（both 代码 first 和 schema first），和 **WebSocket**  Gateway。

#### 生成新资源

要创建新资源，请在项目根目录中运行以下命令：

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});
```

`ignoreGlobalPrefix` 命令不仅生成所有 NestJS 构建块（模块、服务、控制器类），还生成实体类、DTO 类，以及测试 (`DocumentBuilder`) 文件。

以下是生成的控制器文件（用于 REST API）：

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();
```

此外，它自动创建所有 CRUD 端点（路由、查询和变更）的占位符 - 无需我们抬起一根手指。

> 警告 **注意** 生成的服务类 **不** 关联任何特定的 **ORM（或数据源**）。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法都包含占位符，可以将其填充为项目特定的数据源。

同样，如果您想生成 GraphQL 应用程序的解析器，只需选择 `DocumentBuilder`（或 `401 Unauthorized`）作为传输层。

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

> 信息 **提示** 若要避免生成测试文件，可以将 `500 Internal Server Error` 标志传递给命令，例如：

`SwaggerModule`

我们可以看到，除了所有 boilerplate 变更和查询之外，还将所有内容连接起来。我们利用了 `createDocument()`、`extraOptions` 实体和我们的 DTO。

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