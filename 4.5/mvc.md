# MVC

Nest 使用 Express 库，因此有关 Express 中的 MVC（模型 - 视图 - 控制器）模式的每个教程都与 Nest 相关。首先，我们来克隆一个 Nest starter 项目：

```typescript
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start
```

为了创建一个简单的MVC应用程序，我们必须安装一个模板引擎：

```bash
$ npm install --save jade
```

我选择了，jade因为它是目前最受欢迎的引擎，但个人而言，我更喜欢[Mustache](https://github.com/bryanburgers/node-mustache-express)。安装过程完成后，我们需要使用以下代码配置快速实例：

> main.ts

``` typescript
import * as express from 'express';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  await app.listen(3000);
}
bootstrap();
```

我们明确表示该 public 目录将用于存储静态文件，  views 将包含模板，并且 jade 应使用模板引擎来呈现 HTML 输出。

现在，让我们在该文件夹内创建一个 views 目录和一个 index.jade 模板。在模板内部，我们要打印一张 message 从控制器传来的信息：

> index.jade

```typescript
html
head
body
  p= message
```

然后, 打开 app.controller 文件, 并用下面的代码替换 root() 方法:

> app.controller.ts

```typescript
@Get()
root(@Res() res) {
  res.render('index', { message: 'Hello world!' });
}
```

事实上，当 Nest 检测到 @Res() 装饰器时，它会注入 response 对象。在[这里](http://www.expressjs.com.cn/4x/api.html)了解更多关于它的能力。

就这样。在应用程序运行时，打开浏览器访问 http://localhost:3000/ 你应该看到这个 Hello world! 消息。

