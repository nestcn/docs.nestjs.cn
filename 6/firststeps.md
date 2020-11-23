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

1. [点击下载 Node.js](https://npm.taobao.org/mirrors/node/v12.10.0/node-v12.10.0-x64.msi)

2. 安装Node.js

Powershell/CMD 可以打印出这个说明安装成功。（部分系统需要重启后环境变量才生效）

```
$node -v
v12.10.0
$ npm -v
6.10.3
```

#### ** linux（建议） **

（NVM 支持 所有 Linux 及 Raspbian ，支持多版本管理，[windows 点击进入](https://github.com/coreybutler/nvm-windows/releases)）
 ```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

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
$node -v
v12.10.0
$ npm -v
6.10.3
```

#### ** MacOS **

1. [点击下载 Node.js](https://npm.taobao.org/mirrors/node/v12.10.0/node-v12.10.0.pkg)

2. 安装Node.js

打印出这个说明安装成功。（部分系统需要重启后环境变量才生效）
```
$node -v
v12.10.0
$ npm -v
6.10.3
```

#### ** Debian系 **

（支持ARM及X86平台)
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```
（如果安装缓慢，可以使用[国内镜像源](http://mirrors.ustc.edu.cn/help/nodesource.html)）
终端可以打出以下信息说明安装成功：
```
$node -v
v12.10.0
$ npm -v
6.10.3
```

#### ** Redhat系 **

 （支持X86平台）
 ```
curl -sL https://rpm.nodesource.com/setup_12.x | bash -
```
（如果安装缓慢，可以使用[国内镜像源](http://mirrors.ustc.edu.cn/help/nodesource.html)）
终端可以打出以下信息说明安装成功：
```
$node -v
v12.10.0
$ npm -v
6.10.3
```



#### ** Snap **

（支持 所有 Linux ）
```
sudo snap install node --classic --channel=12
```
（如果提示 snap 不存在，请先安装 snapd）
终端可以打出以下信息说明安装成功：
```
$node -v
v12.10.0
$ npm -v
6.10.3
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
| ------------- |-------------| 
|platform-express|Express 是一个众所周知的 node.js 简约 Web 框架。 这是一个经过实战考验，适用于生产的库，拥有大量社区资源。 默认情况下使用 `@nestjs/platform-express` 包。 许多用户都可以使用 Express ，并且无需采取任何操作即可启用它。|
|platform-fastify| Fastify 是一个高性能，低开销的框架，专注于提供最高的效率和速度。 在[这里](6/techniques?id=性能（fastify）)阅读如何使用它。|


无论使用哪种平台，它都会暴露自己的 API。 它们分别是 NestExpressApplication 和 NestFastifyApplication。

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
 
 **[学习资料](https://docs.nestjs.cn/6/awesome?id=%e7%9b%b8%e5%85%b3%e8%b5%84%e6%ba%90)**

 ### 支持我们
 
  [当前网站托管在：vultr](https://www.vultr.com/?ref=7786172-4F)  
  [Onevps-不限流量](https://www.onevps.com/portal/aff.php?aff=12238)    
  [JMS](https://justmysocks1.net/members/aff.php?aff=6423)    
  [【捐赠】](https://gitee.com/notadd/docs.nestjs.cn?donate=true)
 
 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) 
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |
