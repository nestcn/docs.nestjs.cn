<!-- 此文件从 content/graphql/federation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:30:53.017Z -->
<!-- 源文件: content/graphql/federation.md -->

### Federation

Federation 提供了一种将您的монolithic GraphQL 服务器拆分为独立的微服务的方法。它由两个组件组成：一个 gateway 和一个或多个 federated 微服务。每个微服务都持有部分 schema，而 gateway 将这些 schema 合并成一个可以被客户端消费的单个 schema。

Federation 的设计原则是：

- 构建图表应该是 **declarative** 的。通过 Federation，您可以从 schema 中声明性地构建图表，而不是编写 imperative  schema Stitching 代码。
- 代码应该根据 **concern** 分离，而不是根据类型。通常，单个团队不控制每个重要类型的所有方面，因此这些类型的定义应该分布在多个团队和代码库中，而不是集中化。
- 图表应该是简单的，可以被客户端消费。共同的服务可以形成一个完整、产品集中图表，该图表准确反映了客户端的消费方式。
- Federation 只使用 **GraphQL** 语言的 spec-compliant 特性。任何语言，不仅限于 JavaScript，可以实现 Federation。

> 警告 Federation当前不支持订阅。

以下各节将设置一个示例应用程序，该应用程序包括一个 gateway 和两个 federated  endpoints：Users 服务和 Posts 服务。

#### Federation with Apollo

首先，安装所需的依赖项：

```bash
$ npm i -g @nestjs/cli
$ nest new project

```

#### Schema first

用户服务提供了一个简单的 schema。注意 __INLINE_CODE_38__ 指令：它 instructs Apollo  query  planner  that  a  particular  instance  of __INLINE_CODE_39__ can  be  fetched  if  you  specify  its __INLINE_CODE_40__.同时，注意我们 __INLINE_CODE_41__ 了 __INLINE_CODE_42__ 类型。

```bash
$ npm install --save hbs

```

Resolver 提供了一个名为 __INLINE_CODE_43__ 的方法。这一方法在 Apollo  Gateway  triggered  by  the  time  a  related  resource  requires  a  User  instance。我们将在 Posts 服务中看到这个方法的示例。请注意，该方法必须被 __INLINE_CODE_44__ 装饰器标注。

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

最后，我们将所有东西 hook 到一起，通过在配置对象中注册 __INLINE_CODE_45__，并将 __INLINE_CODE_46__ 驱动程序作为参数传递：

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

#### Code first

首先，让我们添加一些额外的装饰器到 __INLINE_CODE_47__ 实体中。

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

Resolver 提供了一个名为 __INLINE_CODE_48__ 的方法。这一方法在 Apollo  Gateway  triggered  by  the  time  a  related  resource  requires  a  User  instance。我们将在 Posts 服务中看到这个方法的示例。请注意，该方法必须被 __INLINE_CODE_49__ 装饰器标注。

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

最后，我们将所有东西 hook 到一起，通过在配置对象中注册 __INLINE_CODE_50__，并将 __INLINE_CODE_51__ 驱动程序作为参数传递：

```bash
$ npm i --save @fastify/static @fastify/view handlebars

```

一个工作示例可在 __LINK_128__ 中找到，用于代码 first 模式，和 __LINK_129__ 中用于 schema first 模式。

#### Federated example: Posts

Posts 服务应该服务聚合的帖子通过 __INLINE_CODE_52__ 查询，同时也将 __INLINE_CODE_53__ 类型扩展到 __INLINE_CODE_54__ 字段中。

#### Schema first

"Posts 服务" 在其 schema 中引用 __INLINE_CODE_55__ 类型，并将其标记为 __INLINE_CODE_56__ 关键字。此外，它还声明了 __INLINE_CODE_57__ 类型中的一个额外属性(__INLINE_CODE_58__)。注意 __INLINE_CODE_59__ 指令用于匹配 __INLINE_CODE_61__ 实例，并且 __INLINE_CODE_60__ 指令表示 __INLINE_CODE_62__ 字段是由其他地方管理的。

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

在以下示例中， __INLINE_CODE_62__ 提供了 __INLINE_CODE_63__ 方法，该方法返回一个包含 __INLINE_CODE_64__ 和一些额外属性的参考，在本例中 __INLINE_CODE_65__。 __INLINE_CODE_66__ 是 GraphQL  Gateway 使用来 pinpoint __INLINE_CODE_67__ 方法 responsible  for  the  User  type  and  retrieve  the  corresponding  instance。上述的 "Users 服务" 将在执行 __INLINE_CODE_67__ 方法时被请求。

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

最后，我们必须注册 __INLINE_CODE_68__，类似于在 "Users 服务" 部分所做的。

```typescript
import { Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Get()
root(@Res() res: FastifyReply) {
  return res.view('index.hbs', { title: 'Hello world!' });
}

```

#### Code first

首先，让我们声明一个代表 __INLINE_CODE_69__ 实体的类。虽然该实体本身在另一个服务中，但是我们将在这里使用它（扩展其定义）。注意 __INLINE_CODE_70__ 和 __INLINE_CODE_71__ 指令。

__CODE_BLOCK_10__

现在，让我们创建对应的 resolver：

__CODE_BLOCK_11__

我们还需要定义 __INLINE_CODE_72__ 实体类：

__CODE_BLOCK_12__

和其 resolver：

__CODE_BLOCK_13__

最后，让我们将其 tie 到一起，在模块中。注意 schema  build  options，where  we  specify  that  __INLINE_CODE_74__ 是一个 orphaned  (external)  类型。

__CODE_BLOCK_14__Here is the translation:

#### Federated 例：Gateway

可在 __LINK_130__ 中找到代码第一模式的工作示例和 __LINK_131__ 中找到架构第一模式的工作示例。

#### Federation with Mercurius

首先，安装必要的依赖项：

__CODE_BLOCK_15__

Gateway 需要指定端点列表，并将相应的架构自动发现。因此，Gateway 服务的实现在代码和架构第一模式中保持不变。

__CODE_BLOCK_16__

可在 __LINK_132__ 中找到代码第一模式的工作示例和 __LINK_133__ 中找到架构第一模式的工作示例。

#### Federation with Mercurius

首先，安装必要的依赖项：

__CODE_BLOCK_17__

> info **注意** __INLINE_CODE_75__ 包含在下面找到的 __INLINE_CODE_76__ 和 __INLINE_CODE_77__ 函数中，以便构建子图架构。

#### Schema first

用户服务提供了一个简单的架构。请注意 __INLINE_CODE_78__ 指令：它指示 Mercurius 查询计划器，如果指定了 __INLINE_CODE_80__，可以 fetch 一個 __INLINE_CODE_79__ 实例。此外，我们 __INLINE_CODE_81__ 了 __INLINE_CODE_82__ 类型。

__CODE_BLOCK_18__

Resolver 提供了一个额外的方法名为 __INLINE_CODE_83__。这个方法在 Mercurius Gateway 中被触发，Whenever 一个相关资源需要一个 User 实例。我们将在 Posts 服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_84__ 装饰器注解。

__CODE_BLOCK_19__

最后，我们将所有内容连接起来，通过在配置对象中注册 __INLINE_CODE_85__，使用 __INLINE_CODE_86__ 驱动程序：

__CODE_BLOCK_20__

#### Code first

首先，在 __INLINE_CODE_87__ 实体上添加一些额外的装饰器。

__CODE_BLOCK_21__

Resolver 提供了一个额外的方法名为 __INLINE_CODE_88__。这个方法在 Mercurius Gateway 中被触发，Whenever 一个相关资源需要一个 User 实例。我们将在 Posts 服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_89__ 装饰器注解。

__CODE_BLOCK_22__

最后，我们将所有内容连接起来，通过在配置对象中注册 __INLINE_CODE_90__，使用 __INLINE_CODE_91__ 驱动程序：

__CODE_BLOCK_23__

#### Federated 例：Posts

Posts 服务旨在通过 __INLINE_CODE_92__ 查询提供聚合的文章，同时扩展我们的 __INLINE_CODE_93__ 类型以添加 __INLINE_CODE_94__ 字段。

#### Schema first

"Posts 服务" 在架构中引用 __INLINE_CODE_95__ 类型，并使用 __INLINE_CODE_96__ 关键字标记它。此外，它还声明了一个额外的属性在 __INLINE_CODE_97__ 类型上 (__INLINE_CODE_98__)。请注意 __INLINE_CODE_99__ 指令用于匹配 User 实例，以及 __INLINE_CODE_100__ 指令指示 __INLINE_CODE_101__ 字段在其他地方管理。

__CODE_BLOCK_24__

在以下示例中，__INLINE_CODE_102__ 提供了 __INLINE_CODE_103__ 方法，该方法返回包含 __INLINE_CODE_104__ 和一些额外属性的引用，用于解决引用。在这种情况下，__INLINE_CODE_105__。__INLINE_CODE_106__ 由 GraphQL Gateway 使用，以 pinpoint __INLINE_CODE_107__ 方法执行时负责 User 类型的微服务，并获取相应的实例。上述 "Users 服务" 将在 __INLINE_CODE_107__ 方法执行时被请求。

__CODE_BLOCK_25__

最后，我们必须注册 __INLINE_CODE_108__，类似于我们在 "Users 服务" 部分中所做的。

__CODE_BLOCK_26__

#### Code first

首先，我们将声明一个表示 __INLINE_CODE_109__ 实体的类。虽然实体自己生活在另一个服务中，我们将在这里使用它（扩展其定义）。请注意 __INLINE_CODE_110__ 和 __INLINE_CODE_111__ 指令。

__CODE_BLOCK_27__

现在，让我们创建对 __INLINE_CODE_112__ 实体的对应解析器：

__CODE_BLOCK_28__

我们还需要定义 __INLINE_CODE_113__ 实体类：

__CODE_BLOCK_29__

和它的解析器：

__CODE_BLOCK_30__

最后，让我们将它们连接起来，在模块中。请注意架构构建选项，我们指定 __INLINE_CODE_114__ 是一个孤立的（外部）类型。

__CODE_BLOCK_31__

#### Federated 例：Gateway

Gateway 需要指定端点列表，并将相应的架构自动发现。因此，Gateway 服务的实现在代码和架构第一模式中保持不变。

__CODE_BLOCK_32__

### Federation 2

请参阅 __LINK_134__，Federation 2 改进了 Apollo Federation（称为 Federation 1 在本文档中）的开发体验，Federation 2 是向后兼容的。

> warning **警告** Mercurius 不完全支持 Federation 2。可以在 __LINK_135__ 中找到支持 Federation 2 的库列表。

在以下部分中，我们将升级前一个示例到 Federation 2。

#### Federated 例：UsersHere is the translated Chinese technical documentation:

Federation 2 中的一個變更是，實體沒有原始子圖，所以我們不需要再繼承 __INLINE_CODE_115__ anymore。關於這個詳細信息，請參考 Apollo Federation 2 文件中的 __LINK_136__。

#### Schema first

我們可以簡單地刪除 __INLINE_CODE_116__ 关键字從 schema 中。

__CODE_BLOCK_33__

#### Code first

使用 Federation 2 時，我們需要在 __INLINE_CODE_117__ 選項中指定聯邦版本。

__CODE_BLOCK_34__

#### Federated example: 文章

類似上述原因，我們不需要繼承 __INLINE_CODE_118__ 和 __INLINE_CODE_119__ anymore。

#### Schema first

我們可以簡單地刪除 __INLINE_CODE_120__ 和 __INLINE_CODE_121__ 指令從 schema 中。

__CODE_BLOCK_35__

#### Code first

因為我們不再繼承 __INLINE_CODE_122__ 实體，所以我們可以簡單地刪除 __INLINE_CODE_123__ 和 __INLINE_CODE_124__ 指令從 __INLINE_CODE_125__ 中。

__CODE_BLOCK_36__

同樣地，類似於 User 服務，我們需要在 __INLINE_CODE_126__ 中指定使用 Federation 2。

__CODE_BLOCK_37__