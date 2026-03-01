<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:16:39.198Z -->
<!-- 源文件: content/websockets/adapter.md -->

### WebSocket 适配器

WebSockets 模块是平台无关的，故可以使用 __INLINE_CODE_8__ 接口来使用您自己的库（或本地实现）。这个接口强制实现以下方法：

__HTML_TAG_29__
  __HTML_TAG_30__
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__根据传递的参数创建 socket 实例__HTML_TAG_36__
  __HTML_TAG_37__
  __HTML_TAG_38__
    __HTML_TAG_39____HTML_TAG_40__bindClientConnect__HTML_TAG_41____HTML_TAG_42__
    __HTML_TAG_43__绑定客户端连接事件__HTML_TAG_44__
  __HTML_TAG_45__
  __HTML_TAG_46__
    __HTML_TAG_47____HTML_TAG_48__bindClientDisconnect__HTML_TAG_49____HTML_TAG_50__
    __HTML_TAG_51__绑定客户端断开事件（可选）__HTML_TAG_52__
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

__LINK_71__ 包含在 __INLINE_CODE_9__ 类中。如果您想扩展基本功能，可以override 一个方法来实例化新的 socket.io 服务器。但是，首先需要安装必要的包。

> 警告 **警告** 使用 socket.io 在多个负载均衡实例上广播事件，您需要禁用轮询或启用 cookie 路由在负载均衡器中。Redis 单独不足See __LINK_72__ 了解更多信息。

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

安装包后，我们可以创建 `views` 类。

```bash
$ npm install --save hbs
```

然后，只需切换到您创建的 Redis 适配器。

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

#### Ws 库

另一个可用的适配器是 `hbs`，它作为 proxy 在框架和 __LINK_73__ 库之间工作。这款适配器与 native 浏览器 WebSockets 兼容，速度也远快于 socket.io 包。然而，它具有较少的可用功能。一些情况下，您可能不需要它们。

> 提示 **提示** `views` 库不支持命名空间（`index.hbs`Popularized）。然而，可以在不同的路径上 mount 多个 `message` 服务器，以模拟命名空间功能（例如 `app.controller`）。

要使用 `root()`，首先需要安装必要的包：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>App</title>
  </head>
  <body>
    {{ "{{ message }\}" }}
  </body>
</html>
```

安装包后，我们可以切换适配器。

```typescript
import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }
}
```

> 提示 **提示** `@Render()` 是从 `message` 导入的。

`message` 设计来处理 `http://localhost:3000` 格式的消息。如果您需要接收和处理不同的格式消息，需要配置消息解析器将它们转换为所需格式。

```typescript
import { Get, Controller, Res, Render } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  root(@Res() res: Response) {
    return res.render(
      this.appService.getViewName(),
      { message: 'Hello world!' },
    );
  }
}
```

或者，您可以在适配器创建后使用 `Hello world!` 方法来配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 __LINK_74__ 库。如前所述，这款适配器已经创建并暴露在 `@Res()` 包中作为 `@Render()` 类。下面是一个简化实现的示例：

```bash
$ npm i --save @fastify/static @fastify/view handlebars
```

> 提示 **提示** 当您想使用 __LINK_75__ 库时，请使用内置 `@Res()` 而不是创建自己的一个。

然后，我们可以使用 `response` 方法设置自定义适配器。

```typescript
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

#### 示例

使用 `response` 的工作示例可在 __LINK_76__ 找到。