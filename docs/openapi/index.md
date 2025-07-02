# OpenAPI (Swagger)

[OpenAPI](https://swagger.io/specification/) 规范是一种与语言无关的定义格式，用于描述 RESTful API。Nest 提供了一个专门的[模块](https://github.com/nestjs/swagger)，允许通过利用装饰器来生成此类规范。

## 主要功能

- **自动生成文档** - 基于代码自动生成 API 文档
- **丰富的装饰器** - 提供完整的装饰器支持
- **类型安全** - 与 TypeScript 类型系统深度集成
- **交互式 UI** - 提供 Swagger UI 进行 API 测试
- **多格式支持** - 支持 JSON 和 YAML 格式
- **自定义配置** - 灵活的配置选项
- **安全集成** - 支持各种认证方式

## 安装

要开始使用，我们首先需要安装所需的依赖项：

```bash
$ npm install --save @nestjs/swagger
```

## 快速开始

安装过程完成后，打开 `main.ts` 文件并使用 `SwaggerModule` 类初始化 Swagger：

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

> **提示** 工厂方法 `SwaggerModule.createDocument()` 专门用于在您请求时生成 Swagger 文档。这种方法有助于节省一些初始化时间，结果文档是符合 [OpenAPI 文档](https://swagger.io/specification/#openapi-document)规范的可序列化对象。

`DocumentBuilder` 帮助构建符合 OpenAPI 规范的基础文档。它提供了几种方法，允许设置标题、描述、版本等属性。为了创建完整的文档（包含所有定义的 HTTP 路由），我们使用 `SwaggerModule` 类的 `createDocument()` 方法。此方法接受两个参数：应用程序实例和 Swagger 选项对象。

创建文档后，我们可以调用 `setup()` 方法。它接受：

1. 挂载 Swagger UI 的路径
2. 应用程序实例
3. 上面实例化的文档对象
4. 可选的配置参数

现在您可以运行以下命令启动 HTTP 服务器：

```bash
$ npm run start
```

应用程序运行时，打开浏览器并导航到 `http://localhost:3000/api`。您应该看到 Swagger UI。

如您所见，`SwaggerModule` 自动反映了您的所有端点。

> **提示** 要生成和下载 Swagger JSON 文件，请导航到 `http://localhost:3000/api-json`（假设您的 Swagger 文档在 `http://localhost:3000/api` 下可用）。也可以使用来自 `@nestjs/swagger` 的 setup 方法将其暴露在您选择的路由上：

```typescript
SwaggerModule.setup('swagger', app, documentFactory, {
  jsonDocumentUrl: 'swagger/json',
});
```

这将在 `http://localhost:3000/swagger/json` 处暴露它。

> **警告** 当使用 `fastify` 和 `helmet` 时，可能会出现 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 问题，要解决此冲突，请按如下所示配置 CSP：

```typescript
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    },
  },
});

// 如果您根本不打算使用 CSP，可以使用这个：
app.register(helmet, {
  contentSecurityPolicy: false,
});
```

## 文档选项

创建文档时，可以提供一些额外选项来微调库的行为。这些选项应该是 `SwaggerDocumentOptions` 类型：

```typescript
export interface SwaggerDocumentOptions {
  /**
   * 要包含在规范中的模块列表
   */
  include?: Function[];

  /**
   * 应该被检查并包含在规范中的额外模型
   */
  extraModels?: Function[];

  /**
   * 如果为 `true`，swagger 将忽略通过 `setGlobalPrefix()` 方法设置的全局前缀
   */
  ignoreGlobalPrefix?: boolean;

  /**
   * 如果为 `true`，swagger 还将从 `include` 模块导入的模块中加载路由
   */
  deepScanRoutes?: boolean;

  /**
   * 自定义 operationIdFactory，将用于基于 `controllerKey`、`methodKey` 和版本生成 `operationId`
   * @default () => controllerKey_methodKey_version
   */
  operationIdFactory?: OperationIdFactory;

  /**
   * 基于控制器名称自动生成标签
   * 如果为 `false`，必须使用 `@ApiTags()` 装饰器定义标签
   * 否则，将使用不带后缀 `Controller` 的控制器名称
   * @default true
   */
  autoTagControllers?: boolean;
}
```

例如，如果您想确保库生成像 `createUser` 而不是 `UsersController_createUser` 这样的操作名称，可以设置以下内容：

```typescript
const options: SwaggerDocumentOptions = {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);
```

## 设置选项

您可以通过传递满足 `SwaggerCustomOptions` 接口的选项对象作为 `SwaggerModule#设置` 方法的第四个参数来配置 Swagger UI。

主要设置选项包括：

- **`ui`** - 是否提供 Swagger UI（默认：`true`）
- **`raw`** - 是否提供原始定义（JSON/YAML）（默认：`true`）
- **`swaggerOptions`** - 额外的 Swagger UI 选项
- **`customCss`** - 注入到 Swagger UI 页面的自定义 CSS 样式
- **`customSiteTitle`** - Swagger UI 页面的自定义标题

## 核心概念

### 装饰器支持

NestJS 提供了丰富的装饰器来注释您的 API：

- `@ApiOperation()` - 描述操作
- `@ApiResponse()` - 描述响应
- `@ApiParam()` - 描述路径参数
- `@ApiQuery()` - 描述查询参数
- `@ApiBody()` - 描述请求体
- `@ApiTags()` - 为操作添加标签
- `@ApiSecurity()` - 添加安全要求

### 类型和参数

Swagger 模块会自动检测并生成类型定义，支持：

- 基础类型（string、number、boolean 等）
- 复杂对象和数组
- 枚举类型
- 泛型类型
- 继承和组合

### 安全集成

支持多种认证方式：

- API Key 认证
- Bearer Token 认证
- OAuth2 认证
- Basic 认证
- Cookie 认证

## 示例应用

完整的工作示例可在[这里](https://github.com/nestjs/nest/tree/master/sample/11-swagger)找到。

## 相关章节

- [介绍](./introduction.md) - OpenAPI 基础介绍
- [类型和参数](./types-and-parameters.md) - 类型系统集成
- [操作](./operations.md) - API 操作定义
- [安全](./security.md) - 认证和授权
- [映射类型](./mapped-types.md) - 类型映射
- [装饰器](./decorators.md) - 装饰器详解
- [CLI 插件](./cli-plugin.md) - 命令行工具
- [其他功能](./other-features.md) - 高级功能

通过 OpenAPI 集成，您可以轻松为 NestJS 应用程序生成专业的 API 文档，提升开发效率和 API 的可维护性。
