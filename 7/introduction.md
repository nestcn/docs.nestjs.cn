# 介绍

Nest 是一个用于构建高效，可扩展的 [Node.js](http://nodejs.cn/) 服务器端应用程序的框架。它使用渐进式 JavaScript，内置并完全支持 [TypeScript](https://www.tslang.cn/)（但仍然允许开发人员使用纯 JavaScript 编写代码）并结合了 OOP（面向对象编程），FP（函数式编程）和 FRP（函数式响应编程）的元素。

在底层，Nest使用强大的 HTTP Server 框架，如 Express（默认）和 Fastify。Nest 在这些框架之上提供了一定程度的抽象，同时也将其 API 直接暴露给开发人员。这样可以轻松使用每个平台的无数第三方模块。


## 哲学

近年来，感谢 Node.js，JavaScript 已成为前端和后端应用程序的网络“通用语言”。这产生了令人敬畏的项目，如 [Angular](https://angular.cn/)，React 和 Vue，它们提高了开发人员的工作效率，并能够构建快速，可测试和可扩展的前端应用程序。然而，虽然 Node（和服务器端 JavaScript ）存在大量优秀的库，帮助器和工具，但它们都没有有效地解决主要问题 - 架构。

Nest 提供了一个开箱即用的应用程序架构，允许开发人员和团队创建高度可测试，可扩展，松散耦合且易于维护的应用程序。

## 安装
首先，您可以使用 Nest CLI 构建项目，也可以克隆启动项目（两者都会产生相同的结果）。

要使用 Nest CLI 构建项目，请运行以下命令。这将创建一个新的项目目录，并生成 Nest 核心文件和支持模块，为您的项目创建传统的基础结构。建议初学者使用Nest CLI 创建新项目。我们将在[第一步](/6/firststeps?id=%E7%AC%AC%E4%B8%80%E6%AD%A5)继续使用这种方法。

 <!-- tabs:start -->
 
 #### ** 使用 CLI 安装 **
```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

#### ** 使用 Git 安装 **

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start
```
要使用 JavaScript ，请在 git 安装替换为 `javascript-starter.git` 

### ** 手动创建 **

您还可以通过使用 npm（或 yarn ）安装核心和支持文件，从头开始手动创建新项目。当然，在这种情况下，您将自己负责创建项目样板文件。

```bash
$ npm i --save @nestjs/core @nestjs/common rxjs reflect-metadata
```
<!-- tabs:end -->

打开浏览器并导航到 http://localhost:3000/




### 保持联系

网站 - https://nestjs.com
推特 - @nestframework

本站托管在： [vultr   （帮助我们，并且获得50美金【10个月】）](https://www.vultr.com/?ref=7786172-4F)

[![vultr](https://www.vultr.com/media/banner_1.png)](https://www.vultr.com/?ref=7815855-4F)
