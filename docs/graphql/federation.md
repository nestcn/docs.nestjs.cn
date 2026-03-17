<!-- 此文件从 content/graphql/federation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:57:57.837Z -->
<!-- 源文件: content/graphql/federation.md -->

### Federation

Federation 提供了一种将 monolithic GraphQL 服务器拆分为独立的微服务的方法。它由两个组件组成：一个网关和一个或多个联邦微服务。每个微服务都持有一部分 schema，网关将这些 schema 合并成一个可以被客户端消费的单个 schema。

引用 __LINK_127__，Federation 设计了以下核心原则：

- 建立图形应该是**声明式**的。通过 federation，你可以在 schema 中声明式地组合图形，而不是编写命令式的 schema stitching 代码。
- 代码应该根据**关注点**分隔，而不是根据类型。通常，单个团队不能控制每个重要类型的所有方面，因此这些类型的定义应该分布在不同的团队和代码库中，而不是集中在一个地方。
- 图形应该简单易于客户端消费。联邦服务可以形成一个完整的、产品关注的图形，该图形准确地反映了客户端的消费方式。
- 它仅使用**GraphQL**语言的规范特性。任何语言，不仅限于 JavaScript，可以实现 federation。

> 警告 **警告** Federation 目前不支持订阅。

在以下部分，我们将设置一个demo 应用程序，该应用程序由网关和两个联邦端点组成：Users 服务和 Posts 服务。

#### Federation with Apollo

首先，安装所需的依赖项：

```bash
$ npm i -g @nestjs/cli
$ nest new project

```

#### Schema first

“Users 服务”提供了一个简单的 schema。注意 __INLINE_CODE_38__ 指令：它 instructs the Apollo query planner that a particular instance of __INLINE_CODE_39__ can be fetched if you specify its __INLINE_CODE_40__. besides, we __INLINE_CODE_41__ the __INLINE_CODE_42__ type.

```bash
$ npm install --save hbs

```

Resolver 提供了一个额外的方法名 __INLINE_CODE_43__。这个方法在 Apollo Gateway 中被触发，用于获取相关资源需要的 User 实例。我们将在 Posts 服务中看到这个方法的示例。请注意，该方法必须被 __INLINE_CODE_44__ 装饰器注解。

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

最后，我们将 everything hooked up by registering the __INLINE_CODE_45__ passing the __INLINE_CODE_46__ driver in the configuration object：

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

首先，在 __INLINE_CODE_47__ 实体中添加一些额外的装饰器。

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

Resolver 提供了一个额外的方法名 __INLINE_CODE_48__。这个方法在 Apollo Gateway 中被触发，用于获取相关资源需要的 User 实例。我们将在 Posts 服务中看到这个方法的示例。请注意，该方法必须被 __INLINE_CODE_49__ 装饰器注解。

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

最后，我们将 everything hooked up by registering the __INLINE_CODE_50__ passing the __INLINE_CODE_51__ driver in the configuration object：

```bash
$ npm i --save @fastify/static @fastify/view handlebars

```

一个工作示例可以在 __LINK_128__ 和 __LINK_129__ 中找到，分别用于 schema first 和 code first 模式。

#### Federated example: Posts

Posts 服务旨在通过 __INLINE_CODE_52__ 查询提供聚合的文章，但是也将扩展我们的 __INLINE_CODE_53__ 类型以添加 __INLINE_CODE_54__ 字段。

#### Schema first

"Posts 服务" 在其 schema 中引用了 __INLINE_CODE_55__ 类型，并将其标记为 __INLINE_CODE_56__ 关键字。此外，它还声明了 __INLINE_CODE_57__ 类型上的一个额外属性 (__INLINE_CODE_58__）。注意 __INLINE_CODE_59__ 指令用于匹配 User 实例的 instances，并且 __INLINE_CODE_60__ 指令指示 __INLINE_CODE_61__ 字段是由其他地方管理的。

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

在以下示例中，__INLINE_CODE_62__ 提供了 __INLINE_CODE_63__ 方法，该方法返回一个包含 __INLINE_CODE_64__ 和一些额外属性的参考，用于解析参考，例如 __INLINE_CODE_65__。__INLINE_CODE_66__ 是 GraphQL Gateway 使用的微服务来 pinpoint 微服务负责 User 类型的实例，并在执行 __INLINE_CODE_67__ 方法时请求该实例。我们之前描述的 "Users 服务" 将在该方法中被请求。

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

最后，我们必须注册 __INLINE_CODE_68__，类似于在 "Users 服务" 部分中所做的。

```typescript
import { Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Get()
root(@Res() res: FastifyReply) {
  return res.view('index.hbs', { title: 'Hello world!' });
}

```

#### Code first

首先，我们将声明一个表示 __INLINE_CODE_69__ 实体的类。虽然实体自己生活在另一个服务中，但是我们将在这里使用它（扩展其定义）。注意 __INLINE_CODE_70__ 和 __INLINE_CODE_71__ 指令。

__CODE_BLOCK_10__

现在，让我们创建对 __INLINE_CODE_72__ 实体的扩展 resolver：

__CODE_BLOCK_11__

我们也需要定义 __INLINE_CODE_73__ 实体类：

__CODE_BLOCK_12__

And its resolver：

__CODE_BLOCK_13__

And finally, tie it together in a module. Note the schema build options, where we specify that __INLINE_CODE_74__ is an orphaned (external) type.

__CODE_BLOCK_14__

Please note that the translation follows the provided glossary and maintains the original structure and formatting of the text.以下是翻译后的中文文档：

####  federated 示例：Gateway

要查看代码优先模式的示例，请访问 __LINK_130__，或查看模式优先模式的示例，请访问 __LINK_131__。

####  Gateway

首先，需要安装所需的依赖项：

__CODE_BLOCK_15__

Gateway 需要指定一系列的端点，并将相应的架构自动发现。因此，Gateway 服务的实现将保持不变，无论是代码优先还是模式优先。

__CODE_BLOCK_16__

要查看代码优先模式的示例，请访问 __LINK_132__，或查看模式优先模式的示例，请访问 __LINK_133__。

####  与 Mercurius 的 federation

首先，需要安装所需的依赖项：

__CODE_BLOCK_17__

> info **注意** __INLINE_CODE_75__ 包需要在构建子图架构时使用（__INLINE_CODE_76__、__INLINE_CODE_77__ 函数）。

####  模式优先

“用户服务” 提供了简单的架构。注意 __INLINE_CODE_78__ 指令：它 instructs Mercurius 查询计划器将特定的 __INLINE_CODE_79__ 实例fetch，如果您指定了 __INLINE_CODE_80__。另外，注意我们 __INLINE_CODE_81__ __INLINE_CODE_82__ 类型。

__CODE_BLOCK_18__

Resolver 提供了一个额外的方法名为 __INLINE_CODE_83__。这个方法将在 Mercurius Gateway 中被触发，whenever 一个相关资源需要一个用户实例。我们将在 Posts 服务中看到这个示例。请注意，该方法必须被 __INLINE_CODE_84__ 装饰器装饰。

__CODE_BLOCK_19__

最后，我们 hook everything up 通过注册 __INLINE_CODE_85__，并将 __INLINE_CODE_86__ 驱动程序在配置对象中传递：

__CODE_BLOCK_20__

####  代码优先

首先，添加一些额外的装饰器到 __INLINE_CODE_87__ 实体中。

__CODE_BLOCK_21__

Resolver 提供了一个额外的方法名为 __INLINE_CODE_88__。这个方法将在 Mercurius Gateway 中被触发，whenever 一个相关资源需要一个用户实例。我们将在 Posts 服务中看到这个示例。请注意，该方法必须被 __INLINE_CODE_89__ 装饰器装饰。

__CODE_BLOCK_22__

最后，我们 hook everything up 通过注册 __INLINE_CODE_90__，并将 __INLINE_CODE_91__ 驱动程序在配置对象中传递：

__CODE_BLOCK_23__

####  federated 示例：Posts

Posts 服务旨在通过 __INLINE_CODE_92__ 查询提供聚合的 Posts，但也将 __INLINE_CODE_93__ 类型扩展到 __INLINE_CODE_94__ 字段。

####  模式优先

“Posts 服务” 在其架构中引用 __INLINE_CODE_95__ 类型，并使用 __INLINE_CODE_96__ 关键字标记它。它还声明了 __INLINE_CODE_97__ 类型上的一个额外的属性 (__INLINE_CODE_98__）。注意 __INLINE_CODE_99__ 指令用于匹配 __INLINE_CODE_100__ 实例的 instances，和 __INLINE_CODE_101__ 指令指示 __INLINE_CODE_102__ 字段在其他地方管理。

__CODE_BLOCK_24__

在以下示例中，__INLINE_CODE_103__ 提供了 __INLINE_CODE_104__ 方法，该方法返回一个包含 __INLINE_CODE_105__ 和一些额外属性的引用，供您的应用程序解析引用。在这种情况下，__INLINE_CODE_106__ 将被 GraphQL Gateway 使用，以 pinpoint __INLINE_CODE_107__ 方法对应的微服务，并.retrieve 相应的实例。“Users 服务” 将在执行 __INLINE_CODE_108__ 方法时被请求。

__CODE_BLOCK_25__

最后，我们必须注册 __INLINE_CODE_109__，类似于在 “Users 服务” 部分所做的。

__CODE_BLOCK_26__

####  代码优先

首先，我们将声明一个表示 __INLINE_CODE_110__ 实体的类。虽然实体本身生活在另一个服务中，我们将在这里使用它（扩展其定义）。注意 __INLINE_CODE_111__ 和 __INLINE_CODE_112__ 指令。

__CODE_BLOCK_27__

现在，让我们创建对应的解析器：

__CODE_BLOCK_28__

我们还需要定义 __INLINE_CODE_113__ 实体类：

__CODE_BLOCK_29__

和它的解析器：

__CODE_BLOCK_30__

最后，让我们将其 tie together 在一个模块中。注意架构 build 选项，其中我们指定 __INLINE_CODE_114__ 是一个 orphaned（外部）类型。

__CODE_BLOCK_31__

####  federated 示例：Gateway

Gateway 需要指定一系列的端点，并将相应的架构自动发现。因此，Gateway 服务的实现将保持不变，无论是代码优先还是模式优先。

__CODE_BLOCK_32__

###  Federation 2

请参阅 __LINK_134__，Federation 2 可以改进开发体验，而原始的 Apollo Federation（称为 Federation 1 在这个文档中）是向后兼容的。

> warning **注意** Mercurius 不完全支持 Federation 2。您可以查看支持 Federation 2 的库列表 __LINK_135__。

在下面的部分中，我们将升级之前的示例到 Federation 2。

####Here is the translated Chinese technical documentation:

#### Federation 2 的变化

Federation 2 中的一个变化是，实体没有起源子图，所以我们不需要再扩展 __INLINE_CODE_115__ 了。有关更多详细信息，请参阅 __LINK_136__ Apollo Federation 2 文档。

#### Schema first

我们可以简单地从schema中删除 __INLINE_CODE_116__ 关键字。

__CODE_BLOCK_33__

#### Code first

使用 Federation 2 需要在 __INLINE_CODE_117__ 选项中指定 federation 版本。

__CODE_BLOCK_34__

#### Federated 示例： Posts

同样，我们不需要再扩展 __INLINE_CODE_118__ 和 __INLINE_CODE_119__ 了。

#### Schema first

我们可以简单地从schema中删除 __INLINE_CODE_120__ 和 __INLINE_CODE_121__ 指令。

__CODE_BLOCK_35__

#### Code first

由于我们不再扩展 __INLINE_CODE_122__ 实体，所以可以简单地从 __INLINE_CODE_125__ 中删除 __INLINE_CODE_123__ 和 __INLINE_CODE_124__ 指令。

__CODE_BLOCK_36__

此外，类似于 User 服务，我们需要在 __INLINE_CODE_126__ 中指定使用 Federation 2。

__CODE_BLOCK_37__