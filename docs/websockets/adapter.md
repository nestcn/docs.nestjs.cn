<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:08:42.005Z -->
<!-- 源文件: content/websockets/adapter.md -->

### WebSocket 适配器

WebSocket 模块是平台无关的，因此可以使用 __INLINE_CODE_8__ 界面来实现自定义的库（或者native 实现）。这个界面强制实现了以下几个方法，如下表所示：

__HTML_TAG_29__
  __HTML_TAG_30__
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__根据传递的参数创建socket实例__HTML_TAG_36__
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
    __HTML_TAG_59__将 incoming 消息绑定到对应的消息处理程序__HTML_TAG_60__
  __HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63____HTML_TAG_64__close__HTML_TAG_65____HTML_TAG_66__
    __HTML_TAG_67__终止服务器实例__HTML_TAG_68__
  __HTML_TAG_69__
__HTML_TAG_70__

#### 扩展 socket.io

__LINK_71__ 包含在 __INLINE_CODE_9__ 类中。假设您想增强基本功能的适配器？例如，您的技术要求需要在多个负载平衡实例上广播事件。为了实现这点，您可以继承 `hbs` 并重写单个方法，负责实例化新的 socket.io 服务器。但是，首先需要安装所需的包。

> 警告 **Warning** 使用 socket.io 在多个负载平衡实例上，您需要禁用轮询或启用基于 cookie 的路由在负载 balancer 中。Redis alone 不足。请查看 __LINK_72__ 获取更多信息。

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

安装包后，我们可以创建 `views` 类。

```bash
$ npm install --save hbs
```

然后，您可以切换到新创建的 Redis 适配器。

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

另一个可用的适配器是 `hbs`，它充当框架和 __LINK_73__ 库之间的代理。这个适配器与 native 浏览器 WebSocket 完全兼容，并且速度更快。但是，它缺少一些功能。某些情况下，您可能不需要它们。

> 提示 **Hint** `views` 库不支持命名空间（通信通道，popularized by `index.hbs`）。但是，可以在不同的路径下 mount 多个 `message` 服务器以模拟这个功能（例如 `app.controller`）。

要使用 `root()`，需要首先安装所需的包：

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

安装包后，我们可以切换适配器：

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

> 提示 **Hint** `@Render()` 来自 `message`。

`message` 设计来处理 `http://localhost:3000` 格式的消息。如果您需要接收和处理不同格式的消息，需要配置消息解析器将它们转换为所需的格式。

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

或者，可以在适配器创建后使用 `Hello world!` 方法配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 __LINK_74__ 库。如前所述，这个适配器已经创建，并且暴露在 `@Res()` 包中作为 `@Render()` 类。下面是简化实现的示例：

```bash
$ npm i --save @fastify/static @fastify/view handlebars
```

> 提示 **Hint** 如果您想使用 __LINK_75__ 库，可以使用内置 `@Res()` 而不是创建自定义适配器。

然后，我们可以使用 `response` 方法设置自定义适配器：

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