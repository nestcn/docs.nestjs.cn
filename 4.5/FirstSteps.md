# 第一步

> 在这组文章中，您将学习Nest的核心基础知识。 主要思想是熟悉必要的Nest应用程序构建模块。 您将构建一个基本的CRUD应用程序，其功能涵盖了介绍级别的许多基础。

# 语言

> 我们爱上了TypeScript，但最重要的是，我们喜欢Node.js。 这就是为什么Nest兼容TypeScript和纯JavaScript。 Nest's利用最新的语言功能，所以要使用简单的JavaScript框架，我们需要一个Babel编译器。

> 在文章中，我们主要使用TypeScript，但是当它包含一些特定于TypeScript的表达式时，您总是可以将代码片段切换到JavaScript版本。

# 先决条件

> 请确保您的操作系统上安装了Node.js（> = 6.11.0）。

# 建立

> 使用Starter存储库建立新项目非常简单。 只要确保你已经安装了npm，然后在你的OS终端中使用以下命令：

## TypeScript

```
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
```

## JavaScript

```
$ git clone https://github.com/nestjs/javascript-starter.git project
$ cd project
$ npm install
```

> 项目目录将在src目录中包含几个核心文件。

```
```

> 按照约定，新创建的模块应放置在模块目录中。

```
```

> server.ts包含一个异步函数，它负责引导我们的应用程序：

## TypeScript

```
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3000);
}
bootstrap();
```

## JavaScript

```
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3000);
}
bootstrap();
```

> 要创建一个Nest应用程序实例，我们使用了NestFactory。 create（）方法返回一个对象，该对象满足INestApplication接口，并提供一组可用的方法，这些方法将在下一章中详细介绍。

# 运行应用程序

> 安装过程完成后，您可以运行以下命令来启动HTTP服务器：

```
$ npm run start
```

> 这个命令在`src`目录下的`server.ts`文件中定义的端口上启动HTTP服务器。 在应用程序运行时，打开浏览器并导航到 `http//localhost3000/`。 你应该看到`你好世界！` 信息。