<!-- 此文件从 content/graphql/federation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:11:50.937Z -->
<!-- 源文件: content/graphql/federation.md -->

### Federation

Federation 提供了一个将你的 monolithic GraphQL 服务器拆分成独立微服务的方式。它由两个组件组成：一个网关和一个或多个联邦微服务。每个微服务都持有部分 schema，并且网关将这些 schema合并成一个可以被客户端消费的单个 schema。

按照 __LINK_127__ 的引用，Federation 是基于以下核心原则设计的：

- 构建图表应该是 **declarative** 的。使用 federation，可以从 schema 中声明地构建图表，而不是编写 imperative schema stitching 代码。
- 代码应该根据 **concern** 分离，而不是根据类型。通常，一个重要的类型，如 User 或 Product，不会由单个团队控制，因此这些类型的定义应该分布在多个团队和代码库中，而不是集中在一个地方。
- 图表应该是简单的，可以被客户端消费。联邦服务可以一起形成一个完整的产品集中图表，这个图表反映了客户端的实际消费方式。
- 它只是 **GraphQL**，使用语言规范的特性。任何语言，除了 JavaScript， 都可以实现 federation。

> warning Federation 当前不支持订阅。

接下来，我们将设置一个 demo 应用程序，它包含一个网关和两个联邦端点：用户服务和文章服务。

#### Federation with Apollo

首先，安装所需的依赖项：

```bash
$ npm i -g @nestjs/cli
$ nest new project

```

#### Schema First

“用户服务”提供了一个简单的 schema。注意 __INLINE_CODE_38__ 指令：它 instructs Apollo 查询规划器在指定的 __INLINE_CODE_39__ 实例可以被fetch，如果你指定了 __INLINE_CODE_40__。此外，我们 __INLINE_CODE_41__ 了 __INLINE_CODE_42__ 类型。

```bash
$ npm install --save hbs

```

Resolver 提供了一个额外的方法名为 __INLINE_CODE_43__。这个方法是 Apollo 网关在相关资源需要 User 实例时触发的。我们将在文章服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_44__ 装饰器注解。

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

最后，我们hook everything up 通过注册 __INLINE_CODE_45__，并将 __INLINE_CODE_46__ 驱动器传递到配置对象中：

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

#### Code First

首先，我们添加一些额外的装饰器到 __INLINE_CODE_47__ 实体。

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

Resolver 提供了一个额外的方法名为 __INLINE_CODE_48__。这个方法是 Apollo 网关在相关资源需要 User 实例时触发的。我们将在文章服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_49__ 装饰器注解。

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

最后，我们hook everything up 通过注册 __INLINE_CODE_50__，并将 __INLINE_CODE_51__ 驱动器传递到配置对象中：

```bash
$ npm i --save @fastify/static @fastify/view handlebars

```

一个工作示例可以在 __LINK_128__ 和 __LINK_129__ 中找到，分别在 schema first 和 code first 模式下。

#### Federated Example: Posts

文章服务旨在通过 __INLINE_CODE_52__ 查询提供聚合的文章，但是也将 __INLINE_CODE_53__ 类型扩展到 __INLINE_CODE_54__ 字段。

#### Schema First

“文章服务”在其 schema 中引用了 __INLINE_CODE_55__ 类型，并将其标记为 __INLINE_CODE_56__ 关键字。它还声明了 __INLINE_CODE_57__ 类型上的一个额外属性（__INLINE_CODE_58__）。注意 __INLINE_CODE_59__ 指令用于匹配 User 实例的实例，并且 __INLINE_CODE_60__ 指令指示 __INLINE_CODE_61__ 字段在其他地方管理。

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

在以下示例中，__INLINE_CODE_62__ 提供了 __INLINE_CODE_63__ 方法，该方法返回一个包含 __INLINE_CODE_64__ 和一些额外属性的引用，这些属性可能需要在应用程序中解析该引用，例如 __INLINE_CODE_65__。__INLINE_CODE_66__ 是 GraphQL 网关用于 pinpoint 联邦服务负责 User 类型的实例并获取相应实例的方法。前面描述的 “用户服务”将在 __INLINE_CODE_67__ 方法执行时被请求。

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

最后，我们必须注册 __INLINE_CODE_68__，类似于在 “用户服务” 部分所做的。

```typescript
import { Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Get()
root(@Res() res: FastifyReply) {
  return res.view('index.hbs', { title: 'Hello world!' });
}

```

#### Code First

首先，我们将声明一个表示 __INLINE_CODE_69__ 实体的类。虽然实体本身在另一个服务中，但是我们将在这里扩展它的定义。注意 __INLINE_CODE_70__ 和 __INLINE_CODE_71__ 指令。

__CODE_BLOCK_10__

现在，让我们创建 __INLINE_CODE_72__ 实体的对应解析器：

__CODE_BLOCK_11__

我们还需要定义 __INLINE_CODE_73__ 实体类：

__CODE_BLOCK_12__

And its resolver:

__CODE_BLOCK_13__

And finally, tie it together in a module. Note the schema build options, where we specify that __INLINE_CODE_74__ is an orphaned (external) type.

__CODE_BLOCK_14__以下是翻译后的中文文档：

####  Federation 示例：Gateway

要查看代码第一种模式的示例，请访问 __LINK_130__，要查看模式第一种模式的示例，请访问 __LINK_131__。

####  Gateway

开始安装所需的依赖项：

__CODE_BLOCK_15__

Gateway 需要指定端点列表，它将自动发现相应的模式，因此 Gateway 服务的实现将保持不变，无论是代码第一种模式还是模式第一种模式。

__CODE_BLOCK_16__

要查看代码第一种模式的示例，请访问 __LINK_132__，要查看模式第一种模式的示例，请访问 __LINK_133__。

####  Federation with Mercurius

开始安装所需的依赖项：

__CODE_BLOCK_17__

> info **注意** __INLINE_CODE_75__ 包含在 Mercurius 查询规划器中，以便构建子图模式 (__INLINE_CODE_76__、__INLINE_CODE_77__ 函数)。

####  Schema-first

“用户服务”提供了一个简单的模式。请注意 __INLINE_CODE_78__ 指令：它指示 Mercurius 查询规划器，如果指定了 __INLINE_CODE_80__，可以 fetch __INLINE_CODE_79__ 的实例。此外，我们 __INLINE_CODE_81__ __INLINE_CODE_82__ 类型。

__CODE_BLOCK_18__

Resolver 提供了一个额外的方法名 __INLINE_CODE_83__。这个方法在 Mercurius Gateway 中被触发 whenever 一个相关资源需要一个 User 实例。我们将在 Posts 服务中看到这个示例。请注意，该方法需要被 __INLINE_CODE_84__ 装饰器注解。

__CODE_BLOCK_19__

最后，我们将所有内容连接起来，通过在配置对象中注册 __INLINE_CODE_85__，并将 __INLINE_CODE_86__ 驱动器作为参数传递：

__CODE_BLOCK_20__

####  Code-first

首先，添加一些额外的装饰器到 __INLINE_CODE_87__ 实体中。

__CODE_BLOCK_21__

Resolver 提供了一个额外的方法名 __INLINE_CODE_88__。这个方法在 Mercurius Gateway 中被触发 whenever 一个相关资源需要一个 User 实例。我们将在 Posts 服务中看到这个示例。请注意，该方法需要被 __INLINE_CODE_89__ 装饰器注解。

__CODE_BLOCK_22__

最后，我们将所有内容连接起来，通过在配置对象中注册 __INLINE_CODE_90__，并将 __INLINE_CODE_91__ 驱动器作为参数传递：

__CODE_BLOCK_23__

####  Federated 示例：Posts

Posts 服务旨在通过 __INLINE_CODE_92__ 查询来提供聚合的文章，同时也将 __INLINE_CODE_93__ 类型扩展到 __INLINE_CODE_94__ 字段中。

####  Schema-first

“Posts 服务”在其模式中引用 __INLINE_CODE_95__ 类型，并将其标记为 __INLINE_CODE_96__ 关键字。此外，它还声明了 __INLINE_CODE_97__ 类型的一个额外属性 (__INLINE_CODE_98__)。请注意 __INLINE_CODE_99__ 指令用于匹配 User 实例的实例，并且 __INLINE_CODE_100__ 指令指示 __INLINE_CODE_101__ 字段是由其他地方管理的。

__CODE_BLOCK_24__

在以下示例中，__INLINE_CODE_102__ 提供了 __INLINE_CODE_103__ 方法，该方法返回一个包含 __INLINE_CODE_104__ 和其他应用程序可能需要的属性的引用。在这个示例中，__INLINE_CODE_106__ 是由 GraphQL Gateway 使用来 pinpoint 微服务负责 User 类型的实例，并在执行 __INLINE_CODE_107__ 方法时请求 “Users 服务”。

__CODE_BLOCK_25__

最后，我们必须注册 __INLINE_CODE_108__，同样在 “Users 服务” 部分中注册。

__CODE_BLOCK_26__

####  Code-first

首先，我们将声明一个表示 __INLINE_CODE_109__ 实体的类。虽然实体本身在另一个服务中，但是我们在这里使用它（扩展其定义）。请注意 __INLINE_CODE_110__ 和 __INLINE_CODE_111__ 指令。

__CODE_BLOCK_27__

现在，让我们创建对应的 resolver для我们的对 __INLINE_CODE_112__ 实体的扩展：

__CODE_BLOCK_28__

我们还需要定义 __INLINE_CODE_113__ 实体类：

__CODE_BLOCK_29__

And its resolver：

__CODE_BLOCK_30__

And finally，tie it together in a module。请注意 schema build 选项，我们指定 __INLINE_CODE_114__ 是一个孤立的（外部）类型。

__CODE_BLOCK_31__

####  Federated 示例：Gateway

Gateway 需要指定端点列表，它将自动发现相应的模式。因此，Gateway 服务的实现将保持不变，无论是代码第一种模式还是模式第一种模式。

__CODE_BLOCK_32__

### Federation 2

引用 __LINK_134__，Federation 2 改进了 Apollo Federation（称为 Federation 1 在本文档中）的开发体验，且保持了与原始超图的向后兼容性。

> warning **注意** Mercurius 不完全支持 Federation 2。您可以查看支持 Federation 2 的库列表 __LINK_135__。

在以下部分中，我们将升级之前的示例到 Federation 2。

####  Federated 示例：UsersHere is the translation of the provided English technical documentation to Chinese:

Federation 2 中的一個變化是，實體沒有起源子圖，所以不需要再擴展 __INLINE_CODE_115__ anymore。更多信息，請參考 __LINK_136__ 在 Apollo Federation 2 文件中。

#### Schema first

我們可以簡單地從 schema 中刪除 __INLINE_CODE_116__ 关键字。

__CODE_BLOCK_33__

#### Code first

要使用 Federation 2，我們需要在 __INLINE_CODE_117__ 選項中指定聯邦版本。

__CODE_BLOCK_34__

#### Federated example: Posts

與上述理由相同，我們不需要再擴展 __INLINE_CODE_118__ 和 __INLINE_CODE_119__ anymore。

#### Schema first

我們可以簡單地從 schema 中刪除 __INLINE_CODE_120__ 和 __INLINE_CODE_121__ 指令。

__CODE_BLOCK_35__

#### Code first

因為我們不再擴展 __INLINE_CODE_122__ 实体，故可以簡單地刪除 __INLINE_CODE_123__ 和 __INLINE_CODE_124__ 指令自 __INLINE_CODE_125__。

__CODE_BLOCK_36__

此外，類似於 User 服務，我們需要在 __INLINE_CODE_126__ 中指定使用 Federation 2。

__CODE_BLOCK_37__