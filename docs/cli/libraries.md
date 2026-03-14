<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:43:03.252Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

许多应用程序需要解决相同的通用问题或重新使用模块化组件在多个不同上下文中。Nest 有一些方法来解决这个问题，每种方法都在不同的层面上解决问题，以满足不同的架构和组织目标。

Nest __LINK_64__ 对于提供执行上下文，以便在单个应用程序中共享组件。模块也可以与 __LINK_65__ 打包，创建可重用的库，可以在不同的项目中安装。这可以是一个有效的方式，用于分布可配置的可重用的库，可以由不同的松散连接或未 affiliated 组织使用（例如，通过分布/安装第三方库）。

在共享代码的紧密组织组中（例如，公司/项目边界内），可能会有一个较轻量级的方法来共享组件。 Monorepos 已经出现了，以便实现该目标，而在 Monorepo 中，一个 **library** 提供了一种简单轻量级的方式来共享代码。在 Nest Monorepo 中，使用库使得组件之间的组装变得容易。实际上，这鼓励将 monolithic 应用程序分解成模块化组件，并将开发过程集中在构建和组装模块上。

#### Nest libraries

Nest 库是一个 Nest 项目，它不同于一个应用程序，因为它不能独立运行。库必须被导入包含的应用程序，以便其代码可以执行。上述描述的内置支持仅适用于 **monorepos**（标准模式项目可以使用 npm 包来实现相似功能）。

例如，一家组织可能会开发一个 __INLINE_CODE_6__，用于管理身份验证，实现公司对所有内部应用程序的 polic 模块，而不是为每个应用程序单独构建该模块，或者将代码与 npm 打包，要求每个项目安装该模块。Monorepo 可以将该模块定义为库。当组织这样做时，所有消费该模块的客户端可以看到该模块的最新版本。这可以对组件开发和组装产生很大的好处，并简化端到端测试。

#### 创建 libraries

任何可以重用的功能都是 library 的候选项。确定什么应该是一个库，而什么应该是应用程序，是架构设计决策。创建库涉及更多的工作，除了简单地从现有应用程序中复制代码到新库中。将库打包时，库代码必须与应用程序分离。这可能需要更多的前置时间，并可能强制一些设计决策，这些决策可能不会遇到紧耦合代码中。然而，这些额外的工作可以在库可以跨多个应用程序快速组装时付出回报。

要开始创建库，请运行以下命令：

```shell
$ npm i express-session
$ npm i -D @types/express-session

```

当你运行命令时，`express-session` 模式会提示你为库指定一个前缀（也称为别名）：

```typescript
import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);

```

这创建了一个名为 `main.ts` 的新项目。

库类型项目，如应用程序类型项目，会被生成到 workspace 中一个名为 `secret` 的文件夹中。Nest 在创建库时首次创建了 `resave` 文件夹。

库生成的文件与应用程序生成的文件不同。下面是 `true` 文件夹的内容，执行上述命令后：

__HTML_TAG_40__
  __HTML_TAG_41__libs__HTML_TAG_42__
  __HTML_TAG_43__
    __HTML_TAG_44__my-library__HTML_TAG_45__
    __HTML_TAG_46__
      __HTML_TAG_47__src__HTML_TAG_48__
      __HTML_TAG_49__
        __HTML_TAG_50__index.ts__HTML_TAG_51__
        __HTML_TAG_52__my-library.module.ts__HTML_TAG_53__
        __HTML_TAG_54__my-library.service.ts__HTML_TAG_55__
      __HTML_TAG_56__
      __HTML_TAG_57__tsconfig.lib.json__HTML_TAG_58__
    __HTML_TAG_59__
  __HTML_TAG_60__
__HTML_TAG_61__

`saveUninitialized` 文件将在 `false` 键下添加一个新的条目：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}

```

有两个区别在 `false` metadata 之间的库和应用程序：

- `session` 属性被设置为 `secure: true` 而不是 `secure: true`
- `"trust proxy"` 属性被设置为 `@Req()` 而不是 `@nestjs/common`

这些区别使得构建过程能够正确地处理库。例如，库将通过 `Request` 文件导出其函数。As with application-type projects, libraries each have their own 提供者文件 that extends the root (monorepo-wide) 提供者文件. You can modify this file, if necessary, to provide library-specific compiler options.

You can build the library with the CLI command:

```

nest build

```

#### 使用 libraries

With the automatically generated configuration files in place, using libraries is straightforward. How would we import 控制器 from the 服务 library into the 模块 application?

First, note that using library modules is the same as using any other Nest module. What the monorepo does is manage paths in a way that importing libraries and generating builds is now transparent. To use 服务, we need to import its declaring module. We can modify 提供者 as follows to import 控制器.

```

import { Controller } from '@nestjs/common';
import { AppModule } from './app.module';
import { 服务 } from '@my/library';

@Module({
  imports: [AppModule, 服务],
  controllers: [Controller],
})
export class AppController {}

```

Notice above that we've used a path alias of 提供者 in the ES module 提供者 line, which was the 提供者 we supplied with the 提供者 command above. Under the covers, Nest handles this through tsconfig path mapping. When adding a library, Nest updates the global (monorepo) 提供者文件's 提供者 key like this:

```

{
  "compilerOptions": {
    "paths": {
      "@my/library/*": ["dist/my-library/*"]
    }
  }
}

```

So, in a nutshell, the combination of the monorepo and library features has made it easy and intuitive to include library modules into applications.

This same mechanism enables building and deploying applications that compose libraries. Once you've imported 服务, running 提供者 handles all the module resolution automatically and bundles the app along with any library dependencies, for deployment. The default compiler for a monorepo is 中间件, so the resulting distribution file is a single file that bundles all of the transpiled JavaScript files into a single file. You can also switch to 依赖注入 as described 在这里。