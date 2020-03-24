## 第一步

在这一组文章中, 您将了解 Nest 的**核心基础知识**。为了了解基本的 nest 应用程序构建模块，我们将构建一个基本的 CRUD 应用程序, 其中的涵盖了大量的基础功能。

## 语言

 我们爱上了 [TypeScript](https://www.tslang.cn)，但最重要的是，我们喜欢 [Node.js](http://nodejs.cn/)。 这就是为什么 Nest 兼容 TypeScript 和**纯 JavaScript**。 Nest 正利用最新的语言功能，所以要使用简单的 JavaScript 框架，我们需要一个 [Babel](https://babeljs.cn) 编译器。

 在文章中，我们主要使用 TypeScript ，但是当它包含一些 Typescript 特定的表达式时，您总是可以将代码片段**切换**到 JavaScript 版本。

 【译者注：由于 nest.js 对 ts 特性支持更好，中文文档只翻译 Typescript】 

## 先决条件

 请确保您的操作系统上安装了 [Node.js](http://nodejs.cn/download/)**（> = 8.9.0）**。

## 建立

 使用 [Nest CLI](/5.0/cli?id=overview) 建立新项目非常简单。 只要确保你已经安装了 npm，然后在你的 OS 终端中使用以下命令：


```
$ npm i -g @nestjs/cli
$ nest new project
```


 `project` 目录将在 `src` 目录中包含几个核心文件。

```
src
├── app.controller.ts
├── app.module.ts
└── main.ts
```

按照约定，新创建的模块应该有一个专用目录。

|      |           |   
| ------------- |:-------------:| 
| main.ts     | 应用程序入口文件。它使用  `NestFactory` 用来创建 Nest 应用实例。 | 
| app.module.ts      | 定义 `AppModule` 应用程序的根模块。      |   
| app.controller.ts | 带有单个路由的基本控制器示例。     |   


 `main.ts` 包含一个异步函数，它负责**引导**我们的应用程序：


```typescript
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3000);
}
bootstrap();
```


要创建一个 Nest 应用实例，我们使用了 `NestFactory` 。`NestFactory` 是最重要的基础类之一，它暴露了一些静态方法用于创建应用实例。 `create()` 方法返回一个实现 `INestApplication` 接口的对象, 并提供一组可用的方法, 在后面的章节中将对此进行详细描述。


## 运行应用程序

安装过程完成后，您可以运行以下命令启动 HTTP 服务器:

```
$ npm run start
```

 此命令在 `src` 目录中的 `main.ts` 文件中定义的端口上启动 HTTP 服务器。在应用程序运行时, 打开浏览器并访问 `http://localhost:3000/`。 你应该看到 `Hello world!` 信息。
 
 ### 支持我们
 
  [当前网站托管在：vultr-日本](https://www.vultr.com/?ref=7815855-4F)    
  [捐赠](https://gitee.com/notadd/docs.nestjs.cn?donate=true)
 
 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://i.loli.net/2020/03/24/37yC4dntIcTHkLO.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |
