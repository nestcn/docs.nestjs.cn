### 模型-视图-控制器

默认情况下，Nest 底层使用了 [Express](https://github.com/expressjs/express) 库。因此，所有在 Express 中使用 MVC（模型-视图-控制器）模式的技术同样适用于 Nest。

首先，我们使用 [CLI](https://github.com/nestjs/nest-cli) 工具搭建一个简单的 Nest 应用：

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

为了创建一个 MVC 应用，我们还需要一个[模板引擎](https://expressjs.com/en/guide/using-template-engines.html)来渲染 HTML 视图：

```bash
$ npm install --save hbs
```

我们使用了 `hbs`（[Handlebars](https://github.com/pillarjs/hbs#readme)）模板引擎，当然你也可以根据需求选择其他引擎。安装完成后，需要通过以下代码配置 express 实例：

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
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
```

我们告诉 [Express](https://github.com/expressjs/express)：`public` 目录将用于存放静态资源，`views` 目录存放模板文件，并使用 `hbs` 模板引擎来渲染 HTML 输出。

#### 模板渲染

现在让我们创建 `views` 目录并在其中新建 `index.hbs` 模板文件。在模板中，我们将输出从控制器传递过来的 `message` 变量：

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

接下来，打开 `app.controller` 文件，将 `root()` 方法替换为以下代码：

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

在这段代码中，我们通过 `@Render()` 装饰器指定要使用的模板，路由处理方法的返回值会被传递给模板进行渲染。注意返回值是一个包含 `message` 属性的对象，与我们模板中创建的 `message` 占位符相匹配。

当应用运行时，打开浏览器并访问 `http://localhost:3000`，你将看到 `Hello world!` 消息。

#### 动态模板渲染

如果应用逻辑需要动态决定渲染哪个模板，则应使用 `@Res()` 装饰器，并在路由处理器中提供视图名称，而非在 `@Render()` 装饰器中指定：

> info **提示** 当 Nest 检测到 `@Res()` 装饰器时，会注入特定库的 `response` 对象。我们可以利用该对象动态渲染模板。了解更多关于 `response` 对象 API 的信息请[点击此处](https://expressjs.com/en/api.html) 。

```typescript
import { Get, Controller, Res } from '@nestjs/common';
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

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/15-mvc)查看。

#### Fastify

如本[章节](/techniques/performance)所述，我们可以将任何兼容的 HTTP 提供程序与 Nest 配合使用。[Fastify](https://github.com/fastify/fastify) 就是这样一个库。要使用 Fastify 创建 MVC 应用，需要安装以下包：

```bash
$ npm i --save @fastify/static @fastify/view handlebars
```

接下来的步骤与 Express 几乎相同，仅存在一些平台特有的细微差异。安装过程完成后，打开 `main.ts` 文件并更新其内容：

```typescript
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';

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
```

Fastify API 存在一些差异，但这些方法调用的最终结果相同。一个显著区别是：使用 Fastify 时，传入 `@Render()` 装饰器的模板名称必须包含文件扩展名。

配置方式如下：

```typescript
import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index.hbs')
  root() {
    return { message: 'Hello world!' };
  }
}
```

或者，您也可以使用 `@Res()` 装饰器直接注入响应对象并指定要渲染的视图，如下所示：

```typescript
import { Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Get()
root(@Res() res: FastifyReply) {
  return res.view('index.hbs', { title: 'Hello world!' });
}
```

应用程序运行时，请打开浏览器并访问 `http://localhost:3000`，您将看到 `Hello world!` 消息。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/17-mvc-fastify)查看。
