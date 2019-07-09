## 第一步

在这一组文章中, 您将了解 Nest 的**核心基础知识**。为了了解基本的 nest 应用程序构建模块，我们将构建一个基本的 CRUD 应用程序, 其中的涵盖了大量的基础功能。

## 语言

 我们爱上了 [TypeScript](https://www.tslang.cn)，但最重要的是，我们喜欢 [Node.js](http://nodejs.cn/)。 这就是为什么 Nest 兼容 TypeScript 和**纯 JavaScript**。 Nest 正利用最新的语言功能，所以要使用原生的 JavaScript 框架，我们需要一个 [Babel](https://babeljs.cn) 编译器。

 在文章中，我们主要使用 TypeScript ，但是当它包含一些 Typescript 特定的表达式时，您总是可以将代码片段**切换**到 JavaScript 版本。

 【译者注：由于 nest.js 对 ts 特性支持更好，中文文档只翻译 Typescript】 


## 先决条件

 请确保您的操作系统上安装了 [Node.js](http://nodejs.cn/download/)**（> = 8.9.0）**。
 
 **一分钟安装 node.js** 
 （支持X86 ARM MIPS 等架构，需要版本管理或者系统为 Raspbian 请直接看 NVM）
 
 <!-- tabs:start -->

#### ** windows **

1. [点击下载 Node.js](hhttps://npm.taobao.org/mirrors/node/latest-v10.x/node-v10.15.3-x64.msi)

2. 安装Node.js

Powershell/CMD 可以打印出这个说明安装成功。（部分系统需要重启后环境变量才生效）

```
>> node -v
v10.15.3
>> npm -v
6.4
```

#### ** MacOS **

1. [点击下载 Node.js](https://npm.taobao.org/mirrors/node/v10.15.1/node-v10.15.1.pkg)

2. 安装Node.js

打印出这个说明安装成功。（部分系统需要重启后环境变量才生效）
```
>> node -v
v10.15.1
>> npm -v
6.4
```

#### ** Debian系 **

（支持ARM及X86平台)
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```
（如果安装缓慢，可以使用[国内镜像源](http://mirrors.ustc.edu.cn/help/nodesource.html)）
终端可以打出以下信息说明安装成功：
```
$ node -v
v10.15.1
$ npm -v
6.4
```

#### ** Redhat系 **

 （支持X86平台）
 ```
curl -sL https://rpm.nodesource.com/setup_10.x | bash -
```
（如果安装缓慢，可以使用[国内镜像源](http://mirrors.ustc.edu.cn/help/nodesource.html)）
终端可以打出以下信息说明安装成功：
```
$ node -v
v10.15.1
$ npm -v
6.4
```

#### ** NVM **

（支持 所有 Linux 及 Raspbian ，支持多版本管理，[windows 点击进入](https://github.com/coreybutler/nvm-windows/releases)）
 ```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

```
如果没 curl ，可以使用 wget 安装
```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```
使用淘宝加速下载（可选）
```
export NVM_NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node
```

使用 NVM 安装nodejs ：
```
nvm install --lts
```
终端可以打出以下信息说明安装成功：
```
$ node -v
v10.15.1
$ npm -v
6.4
```

#### ** Snap **

（支持 所有 Linux ）
```
sudo snap install node --classic --channel=10
```
（如果提示 snap 不存在，请先安装 snapd）
终端可以打出以下信息说明安装成功：
```
$ node -v
v10.15.1
$ npm -v
6.4
```
<!-- tabs:end -->

就是这么简单！ 不需要安装拓展，不需要额外安装 nginx/apache

## 建立

 使用 [Nest CLI](/6/cli?id=overview) 建立新项目非常简单。 只要确保你已经安装了 npm，然后在你的 OS 终端中使用以下命令：


<!-- tabs:start -->

#### ** npm **

```
$ npm i -g @nestjs/cli
$ nest new project-name
```

#### ** yarn **

```
$ yarn global add @nestjs/cli
$ nest new project-name
```

<!-- tabs:end -->



 将创建 `project` 目录， 安装node模块和一些其他样板文件，并将创建一个 `src` 目录，目录中包含几个核心文件。


```
src
├── app.controller.ts
├── app.module.ts
└── main.ts
```

以下是这些核心文件的简要概述：


|      |           |   
| ------------- |:-------------:| 
| app.controller.ts | 带有单个路由的基本控制器示例。     |   
| app.module.ts      | 应用程序的根模块。      |   
| main.ts     | 应用程序入口文件。它使用  `NestFactory` 用来创建 Nest 应用实例。 | 



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


要创建一个 Nest 应用实例，我们使用了 `NestFactory` 核心类。`NestFactory` 暴露了一些静态方法用于创建应用实例。 `create()` 方法返回一个实现 `INestApplication` 接口的对象, 并提供一组可用的方法, 在后面的章节中将对此进行详细描述。 在上面的main.ts示例中，我们只是启动 HTTP 服务器，它允许应用程序等待入站 HTTP 请求。

请注意，使用 Nest CLI 搭建的项目会创建一个初始项目结构，我们鼓励开发人员将每个模块保存在自己的专用目录中。

## 平台

Nest 旨在成为一个与平台无关的框架。 通过平台，可以创建可重用的逻辑部件，开发人员可以利用这些部件来跨越多种不同类型的应用程序。 从技术上讲，Nest 可以在创建适配器后使用任何 Node HTTP 框架。 有两个支持开箱即用的 HTTP 平台：express 和 fastify。 您可以选择最适合您需求的产品。

|      |           |   
| ------------- |:-------------:| 
|platform-express|Express 是一个众所周知的 node.js 简约 Web 框架。 这是一个经过实战考验，适用于生产的库，拥有大量社区资源。 默认情况下使用 `@nestjs/platform-express` 包。 许多用户都可以使用 Express ，并且无需采取任何操作即可启用它。|
|platform-fastify| Fastify 是一个高性能，低开销的框架，专注于提供最高的效率和速度。 在[这里](6/techniques?id=性能（fastify）)阅读如何使用它。|


无论使用哪种平台，它都会暴露自己的应用程序界面。 它们分别被视为 NestExpressApplication 和 NestFastifyApplication。

将类型传递给 NestFactory.create() 方法时，如下例所示，app 对象将具有专用于该特定平台的方法。 但是，请注意，除非您确实要访问底层平台API，否则无需指定类型。

```typescript
const app = await NestFactory.create<NestExpressApplication>(ApplicationModule);
```



## 运行应用程序

安装过程完成后，您可以在系统命令提示符下运行以下命令，以启动应用程序监听入站 HTTP 请求：

```
$ npm run start
```

 此命令在 `src` 目录中的 `main.ts` 文件中定义的端口上启动 HTTP 服务器。在应用程序运行时, 打开浏览器并访问 `http://localhost:3000/`。 你应该看到 `Hello world!` 信息。
 
### 相关资源

- 官方资源
  - [官方网站](https://nestjs.com)
  - [官方文档](https://docs.nestjs.com)
  - [API 参考](https://docs.nestjs.com)
  - [GitHub Repo](https://github.com/nestjs/nest)

- 文档
  - [中文文档](https://docs.nestjs.cn/)

- 社区
  - [Gitter](https://gitter.im/nestjs/)
  - [Discord](https://discord.gg/G7Qnnhy)
  - [Telegram (社区维护)](https://t.me/nestjs)
  - [Telegram (俄罗斯社区)](https://t.me/nest_ru)
  - [Slack (韩语社区)](https://nestjs.slack.com)
  - [QQ 群](https://jq.qq.com/?_wv=1027&k=5DnXWGR)
  - [Reddit (社区维护)](https://www.reddit.com/r/Nestjs_framework)

- 中文教程
  - [Nestjs 框架教程](https://keelii.com/2019/07/03/nestjs-framework-tutorial-1/)      
  - [Nestjs 学习教程](https://github.com/dzzzzzy/Nestjs-Learning)    
  - [让我们用Nestjs来重写一个CNode](https://github.com/jiayisheji/blog/issues/18)

- 英文教程
  - [现代 Node.js 框架简介](https://kamilmysliwiec.com/nest-release-canditate-is-here-introduction-modern-node-js-framework)
  - [NestJS Node Express](https://auth0.com/blog/nestjs-brings-typescript-to-nodejs-and-express) - 教如何逐步使用 Nestjs
  - [使用 Nest 构建 Web 应用程序](https://kamilmysliwiec.com/build-modern-scalable-node-js-web-applications-with-nest)
  - [使用 Nest.js 和 Google Maps API 构建一个地理围栏 Web 应用程序 ](https://pusher.com/tutorials/geofencing-nestjs-googlemaps)
  - [使用 Nest.js 和 Dialogflow 构建聊天机器人](https://pusher.com/tutorials/chat-bot-nestjs)
  - [使用 Nest.js 通过情绪分析构建实时评论](https://pusher.com/tutorials/live-comments-sentiment-analysis-nestjs)
  - [使用 Nest.js 构建具有情绪分析的聊天应用程序](https://pusher.com/tutorials/chat-sentiment-analysis-nestjs)
  - [使用 Nest.js 创建实时图形](https://pusher.com/tutorials/realtime-graph-nestjs)
  - [使用 DataTables 和 Nest.js 构建实时表](https://pusher.com/tutorials/realtime-table-datatables-nestjs)
  - [NestJS 基础 Auth 和 Sessions](https://blog.exceptionfound.com/index.php/2018/06/07/nestjs-basic-auth-and-sessions/)
  - [使用 NestJS 和 Swagger 的 MEAN 技术栈](https://medium.com/@ctran2428/mean-stack-with-nestjs-and-swagger-9d8d14862d6b)
  - [NestJS Ideas API](https://www.youtube.com/watch?v=NF9Xn4g5MJY&list=PLBeQxJQNprbiJm55q7nTAfhMmzIC8MWxc)
  - [使用 Nest.js 和 Ably 构建实时 Web 应用程序](https://hackernoon.com/building-real-time-web-applications-using-nest-js-and-ably-d85887e81f06)
  - [视频教程 - 使用 NestJs，Angular 和 Angular Material 构建一个完整的博客](https://www.youtube.com/watch?v=nz6yFTyLbAQ&list=PLq1kZ5GbKd4qyDcK3IHGSi4FDAL6fRZeL)

- 例子
  - [官方示例](https://github.com/nestjs/nest/tree/master/sample)    
  - [nestjs+angular cnode](https://github.com/jiayisheji/AngularNest-Fullstack-CNode)  - Angular + Nest.js 全栈    
  - [nestjs-typeorm](https://github.com/lujakob/nestjs-realworld-example-app)   - Nestjs + typeorm 示例    
  - [nestjs-graphql-angular](https://github.com/bojidaryovchev/nest-angular) - NestJS + graphql + angular 示例    
  - [ChatServer](https://github.com/Pinedo11/nestDemo-ChatServer) - 使用 Nest 实现的 Chat App 的服务器端    
  - [Nestjs API.ai](https://github.com/adrien2p/nest-js-api-ai) -  在 Node.js中与 api.ai 交互    
  - [Simple Todos](https://github.com/BruceHem/simple-todos) - 基于 Nuxt.js💚 和 Nest Framework 的简单Web应用程序    
  - [Realworld Example App](https://github.com/lujakob/nestjs-realworld-example-app) -  使用 NestJS + TypeORM 构建的示例性后端API    
  - [Mant](https://github.com/vladotesanovic/mant) - MongoDB Angular NestJS TypeScript 市场示例.    
  - [REST Nestjs Postgres](https://github.com/crudjs/rest-nestjs-postgres) - 使用 Nest.js 和 Postgres 实现的 REST API    
  - [Nest Permissions Seed](https://github.com/EndyKaufman/nest-permissions-seed) - 一个简单的应用程序，演示了NestJS对权限的基本用法    
  - [Angular Nestjs Rendering](https://github.com/Innovic-io/angular-nestjs-rendering) - 使用 NestJS 进行 Angular 5+ 服务端渲染    
  - [Angular Contact Manager App](https://github.com/Abdallah-khalil/ContactManagerApp) - 使用 Angular，Nestjs，Mongoose，Passport，JWT的 联系人管理程序    
  - [Books Library API](https://github.com/Abdallah-khalil/Books-Library-API) - 一个带有 nestjs，mongoose，Passport，JWT 的 API    
  - [Passport Auth Nestjs](https://github.com/Abdallah-khalil/NodeJsWithPassport) -  使用 nestjs 构建的 Passport 策略，集成了 oauth     
  - [Lynx](https://github.com/mentos1386/lynx) - 基于 NestJS 和 TypeORM 构建的 Opinionated Framework    
  - [NestJS Ideas API](https://github.com/kelvin-mai/nest-ideas-api) - 使用 NestJS，PostgresQL 和 TypeORM构 建的 REST 和 GraphQL 服务端的实现    
  - [Nestcloud Starter](https://github.com/nest-cloud/nestcloud-starter) - 使用 nestcloud 快速启动微服务应用程序.    
  - [Nodepress](https://github.com/surmon-china/nodepress) - 使用 Nest 的 Blog/CMS，  RESTful API 服务端应用. 😎    

- 样例
  - [Nest 入门套件](https://github.com/kentloog/nestjs-sequelize-typescript) - Nest + sequelize-typescript + JWT + Jest + Swagger
  - [Nest BFF](https://github.com/ahrnee/nestjs-bff) - 使用 NestJS 的样板 [BFF](https://samnewman.io/patterns/architectural/bff/) Web 应用程序启动项目。包括 CLI 和 MongoDB 迁移功能。
  - [Nestjs Template](https://github.com/Saluki/nestjs-template) - 使用为 Docker 环境精心设计的生产可用 NestJS 模板，支持最新 TypeScript API
  - [MEAN Todo with NestJS](https://github.com/nartc/nest-mean) - 一个使用 NestJS 和 Swagger 的简单 Todo 应用程序。包含授权/身份验证。
  - [NestJS Boilerplate 💡](https://github.com/Vivify-Ideas/nestjs-boilerplate) - 具有可用身份验证，typeorm，env 配置和 swagger 的 Boilerplate。开始制作伟大事物所需的一切。🚀
  - [Awesome Nest Boilerplate 😍](https://github.com/NarHakobyan/awesome-nest-boilerplate), Typescript 💪，Postgresql 🎉，TypeORM，Swagger for Api文档，角色基本访问控制和最佳应用程序架构。
  - [NestJS Prisma Starter](https://github.com/fivethree-team/nestjs-prisma-client-starter) - NestJS 的入门项目😻 包括带有 Prisma 客户端的 Graphql，Passport-JWT 身份验证，Swagger Api 和 Docker。

### 使用 NestJS 的项目

- 开源
  - [EVE Book API](https://github.com/evebook/api) - :milky_way: EVE Book API
  - [LXDhub](https://github.com/Roche/lxdhub) - Linux 容器管理系统（LXC）.

### 常用库

- 公用
  - [Nest CQRS](https://github.com/nestjs/cqrs) - Nest 框架的轻量级 CQRS 模块
  - [Nestjs Config](https://github.com/nestjsx/nestjs-config) -  处理项目配置的一个很棒的模块
  - [Nest Consul Config](https://github.com/nest-cloud/nest-consul-config) - 从 consul kv 获取配置的模块
  - [Nest Consul Service](https://github.com/nest-cloud/nestcloud) - 基于 Consul 的 NodeJS 微服务解决方案，由 Typescript 语言和 NestJS 框架编写
  - [Nest Consul Loadbalance](https://github.com/nest-cloud/nest-consul-loadbalance) -  用于 Rest 的软件负载均衡器
  - [Nest Schedule](https://github.com/miaowing/nest-schedule) - 装饰器实现的定时任务。
  - [Nest Queue](https://github.com/owl1n/nest-queue) - 基于 Redis 的简单队列管理，适用于您的应用程序
  - [nestjs bull](https://github.com/fwoelffel/nest-bull)   - Nestjs 分布式消息队列
- 状态管理
  - [Ngrx Nest](https://github.com/derekkite/ngrx-nest) - 在 Nest 上使用  ngrx/store 和 ngrx/effects.
- 代码风格
  - [StyleGuide and Coding Conventions](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md) - 非官方的 TypeScript StyleGuide
- WebSockets
  - [官方](https://docs.nestjs.cn/6/websockets)
- 邮件
  - [Nest Mailer](https://github.com/partyka95/nest-mailer) -  Nest 框架的邮件模块
- API
  - [Swagger](https://github.com/nestjs/swagger) - 这是 Nest 的 OpenAPI（Swagger）模块。. _[教程](https://docs.nestjs.com/recipes/swagger)]_.
  - [Nest CRUD](https://github.com/nestjsx/crud) -  用于 RESTful API 的 Nest CRUD。
- 中间件
  - [Nest Middlewares](https://github.com/wbhob/nest-middlewares) - NestJS 的通用可注入中间件
- Errors
  - [Nestjs Flub](https://github.com/shekohex/nestjs-flub) - 漂亮的错误😫 NestJS框架的Stack Viewer .
  - [Nest Raven](https://github.com/mentos1386/nest-raven) - Nest.js 框架的 Sentry Raven 模块
- Lint
  - [Eslint Plugin Nestjs](https://github.com/unlight/eslint-plugin-nestjs) - 用于 nestjs 框架的 ESLint 规则
- 路由🚦
  - [Nest Router](https://github.com/shekohex/nest-router) - Nestjs 框架的路由模块🚦 🚀 用于组织路由，创建路由树等。🚦 🚀
- Dialogflow :satellite:
  - [Nestjs Dialogflow](https://github.com/adrien2p/nestjs-dialogflow) - Dialog 流模块，使用 NestJS 简化 NLP 应用程序的 Web 钩子处理。
- 日志
  - [Nest Morgan](https://github.com/mentos1386/nest-morgan) - 用于 nestjs 的 Morgan 模块
  - [Nest Winston](https://github.com/gremo/nest-winston) - 用于 nestjs 的 Winston 模块
- 监控
  - [Nest Status Monitor](https://github.com/GenFirst/nest-status-monitor) - 基于 Socket.io 和 Chart.js 的简单自托管模块，用于报告 Nest.js 的 node.js 服务器的实时状态。
- 国际化
  - [Nest i18n](https://github.com/ToonvanStrijp/nestjs-i18n) - 在您的服务器上轻松添加 i18n 支持，内置丰富的格式化 api

### 集成

- Auth
  - [Nestjs + Auth0](https://github.com/cdiaz/nestjs-auth0) - 使用 Auth0 的 NestJS Framework Web 应用程序。
- 数据库
  - [Typeorm](https://github.com/nestjs/typeorm) - 用于 Nest 框架的 TypeORM 模块 [[Tutorial](http://docs.nestjs.com/recipes/sql-typeorm)].
  - [Nest Mongoose](https://github.com/nestjs/mongoose) - 用于 Nest 框架的 Mongoose 模块
  - [Nest Sequelize JWT](https://github.com/adrien2p/nest-js-sequelize-jwt) - 入门套件 Nest + Sequelize + jwt。
  - [Nest sequelize-typescript](https://github.com/kentloog/nestjs-sequelize-typescript) - Nest + sequelize-typescript + JWT + Jest + Swagger
- GraphQL
  - [Nestjs Graphql](https://github.com/adrien2p/nest-js-graphql) - 实现 graphql 模块的 Nestjs 启动器。
- Pattern
  - [Nest GRPC Transport](https://github.com/fresh8/nestjs-grpc-transport) - NestJS 框架的 GRPC 传输层.
  - [Nestjs typeorm paginate](https://github.com/nestjsx/nestjs-typeorm-paginate) - 一个简单的功能和分页界面
- 编辑器
  - VSCode
    - [Nestjs Snippets](https://github.com/ashinzekene/vscode-nestjs-snippets) - Vscode nestjs 代码片段
- AMQP
  - [Nestjs AMQP](https://github.com/nestjsx/nestjs-amqp) - amqp 连接管理器
- 支付网关
  - [Nestjs Braintree](https://github.com/nestjsx/nestjs-braintree) - 一个用于 webhooks 交易的模块。
- Consul
  - [Nest Consul](https://github.com/nest-cloud/nestcloud) - 基于 Consul 的 NodeJS 微服务解决方案，由Typescript 语言和 NestJS 框架编写
- Cache
  - [Nest Memcached](https://github.com/nest-cloud/nest-memcached) - 用于 Nest 框架的 memcached 模块

### 运行

- 命令行/终端

  - [CLI](https://github.com/nestjs/nest-cli) - Nestjs 应用程序的 CLI 工具。
  - [Yeoman Generator](https://github.com/ashinzekene/generator-nestjs-app) -  用于 nestsjs 应用程序的自动生成器。
  - [Nestjs Console](https://github.com/Pop-Code/nestjs-console) - 一个为应用程序提供 cli 的 Nestjs 模块。

更多... [nestjs-awesome](https://github.com/juliandavidmr/awesome-nestjs) 

 ### 支持我们
 
  [当前网站托管在：vultr-日本](https://www.vultr.com/?ref=7815855-4F)    
  [捐赠](https://gitee.com/notadd/docs.nestjs.cn?donate=true)
 
 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |
