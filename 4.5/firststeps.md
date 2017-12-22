# 第一步

在这一组文章中, 您将了解 Nest 的核心基础知识。主要的想法是了解基本的嵌套应用程序构建模块。您将构建一个基本的 CRUD 应用程序, 其中的功能涵盖了大量的入门基础。

# 语言

 我们爱上了 [TypeScript](https://www.tslang.cn)，但最重要的是，我们喜欢 [Node.js](http://nodejs.cn/)。 这就是为什么 Nest 兼容 TypeScript 和纯 JavaScript 。 Nest 正利用最新的语言功能，所以要使用简单的 JavaScript 框架，我们需要一个 [Babel](https://babeljs.cn) 编译器。

 在文章中，我们主要使用 TypeScript ，但是当它包含一些 Typescript 特定的表达式时，您总是可以将代码片段切换到 JavaScript 版本。
 

# 先决条件

 请确保您的操作系统上安装了 [Node.js](http://nodejs.cn/download/)（> = 6.11.0）。

# 建立

 使用 [Starter repository](https://github.com/nestjs/typescript-starter) 建立新项目非常简单。 只要确保你已经安装了 npm，然后在你的 OS 终端中使用以下命令：

## TypeScript & JavaScript

```
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
```


 `project` 目录将在 `src` 目录中包含几个核心文件。

```
src
├── modules
│   ├── app.controller.ts
│   └── app.module.ts
└── server.ts

```

按照约定，新创建的模块应放置在 `modules` 目录中。

|      |           |   
| ------------- |:-------------:| 
| server.ts      | 应用程序入口文件。它使用  `NestFactory` 用来创建 Nest 应用实例。 | 
| app.module.ts      | 定义 `AppModule` 应用程序的根模块。      |   
| app.controller.ts | 带有单个路由的基本控制器示例。     |   


 server.ts 包含一个异步函数，它负责引导我们的应用程序：


```JavaScript
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3000);
}
bootstrap();
```



 要创建一个 Nest 应用实例，我们使用了 `NestFactory` 。 `create()` 方法返回一个实现 `INestApplication` 接口的对象, 并提供一组可用的方法, 在下一章中将对此进行详细描述。


# 运行应用程序

安装过程完成后，您可以运行以下命令启动 HTTP 服务器:

```
$ npm run start
```

 这个命令在 `src`目录下的 `server.ts` 文件中定义的端口上启动 HTTP 服务器。 在应用程序运行时，。

 此命令在 `src` 目录中的 `server.ts` 文件中定义的端口上启动 HTTP 服务器。在应用程序运行时, 打开浏览器并访问 `http//localhost3000/`。 你应该看到 `Hello world!` 信息。