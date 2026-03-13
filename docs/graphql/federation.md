<!-- 此文件从 content/graphql/federation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:52:32.540Z -->
<!-- 源文件: content/graphql/federation.md -->

### Federation

Federation 提供了一种将 monolithic GraphQL 服务器拆分成独立的微服务的方法。它由两个组件组成：gateway 和一个或多个 federated 微服务。每个微服务都持有部分 schema，gateway 将这些 schema 合并成一个可以被客户端消费的单个 schema。

根据 __LINK_127__，Federation 设计了以下几个核心原则：

- 建立图形应该是**声明式**的。通过 federation，您可以在 schema 中声明地建立图形，而不是编写 imperative schema stitching 代码。
- 代码应该是**根据关注点**分开的，而不是根据类型。有时，没有一个团队控制每个重要类型的所有方面，因此这些类型的定义应该分布在多个团队和代码库中，而不是集中在一起。
- 图形应该是客户端简单地消费的。一起， federated 服务可以形成一个完整的、基于产品的图形，这accurately反映了客户端的消费情况。
- 这只是**GraphQL**，使用了语言规范的特性。任何语言，不仅限于 JavaScript，可以实现 federation。

>警告 **Warning** Federation 目前不支持订阅。

在以下各节中，我们将设置一个 demo 应用程序，该应用程序由 gateway 和两个 federated  endpoint 组成：Users 服务和 Posts 服务。

#### Federation with Apollo

首先，安装所需的依赖项：

```bash
$ npm i -g @nestjs/cli
$ nest new project

```

#### Schema First

“用户服务”提供了一个简单的 schema。请注意 __INLINE_CODE_38__ 指令：它告诉 Apollo 查询计划器，如果你指定 __INLINE_CODE_40__，可以 fetch 一个 __INLINE_CODE_39__ 实例。另外，我们 __INLINE_CODE_41__ 了 __INLINE_CODE_42__ 类型。

```bash
$ npm install --save hbs

```

Resolver 提供了一个名为 __INLINE_CODE_43__ 的方法。这方法由 Apollo Gateway 在需要一个 User 实例时被触发。我们稍后将看到这个方法在 Posts 服务中使用的示例。请注意，该方法必须被 __INLINE_CODE_44__ 装饰器注释。

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

然后，我们将所有内容 hook 起来，通过将 __INLINE_CODE_45__ 传递给 __INLINE_CODE_46__ 驱动程序在配置对象中注册：

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

首先，添加一些额外的装饰器到 __INLINE_CODE_47__ 实体。

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

Resolver 提供了一个名为 __INLINE_CODE_48__ 的方法。这方法由 Apollo Gateway 在需要一个 User 实例时被触发。我们稍后将看到这个方法在 Posts 服务中使用的示例。请注意，该方法必须被 __INLINE_CODE_49__ 装饰器注释。

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

然后，我们将所有内容 hook 起来，通过将 __INLINE_CODE_50__ 传递给 __INLINE_CODE_51__ 驱动程序在配置对象中注册：

```bash
$ npm i --save @fastify/static @fastify/view handlebars

```

有一个工作示例，位于 __LINK_128__（code first 模式）和 __LINK_129__（schema first 模式）。

#### Federated Example: Posts

Posts 服务旨在通过 __INLINE_CODE_52__ 查询提供聚合的文章，但也将 __INLINE_CODE_53__ 类型扩展到 __INLINE_CODE_54__ 字段。

#### Schema First

“Posts 服务”在其 schema 中引用了 __INLINE_CODE_55__ 类型，并将其标记为 __INLINE_CODE_56__ 关键字。此外，它还声明了 __INLINE_CODE_57__ 类型上的一个额外属性（__INLINE_CODE_58__）。请注意 __INLINE_CODE_59__ 指令用于匹配 User 实例的 instances，并且 __INLINE_CODE_60__ 指令指示 __INLINE_CODE_61__ 字段是由其他地方管理的。

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

在以下示例中，__INLINE_CODE_62__ 提供了 __INLINE_CODE_63__ 方法，该方法返回一个包含 __INLINE_CODE_64__ 和一些额外属性的引用，用于在应用程序中解析引用。在这种情况下，__INLINE_CODE_65__。__INLINE_CODE_66__ 是由 GraphQL Gateway 使用来 pinpoint 微服务负责 User 类型的实例，并从该实例中检索对应的实例。前面描述的 “Users 服务”将在 __INLINE_CODE_67__ 方法的执行时被请求。

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

最后，我们必须注册 __INLINE_CODE_68__，与前面 “Users 服务” 部分中所做的一样。

```typescript
import { Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Get()
root(@Res() res: FastifyReply) {
  return res.view('index.hbs', { title: 'Hello world!' });
}

```

#### Code First

首先，我们将声明一个表示 __INLINE_CODE_69__ 实体的类。虽然实体本身生活在另一个服务中，但是我们将在这里扩展其定义。请注意 __INLINE_CODE_70__ 和 __INLINE_CODE_71__ 指令。

__CODE_BLOCK_10__

现在，让我们创建对 __INLINE_CODE_72__ 实体的对应解析器：

__CODE_BLOCK_11__

我们还需要定义 __INLINE_CODE_73__ 实体类：

__CODE_BLOCK_12__

并且对应的解析器：

__CODE_BLOCK_13__

最后，让我们将所有内容 hook 起来，在模块中绑定。请注意，schema 构建选项，我们指定了 __INLINE_CODE_74__ 是一个孤立的（外部）类型。

__CODE_BLOCK_14__以下是翻译后的中文技术文档：

#### 分布式示例：Gateway

可以查看 __LINK_130__ 的代码优先模式和 __LINK_131__ 的模式优先模式。

#### Gateway

首先，需要安装所需的依赖项：

__CODE_BLOCK_15__

Gateway 需要指定一个端点列表，并会自动发现相应的架构。因此，Gateway 服务的实现将保持不变，适用于代码优先和模式优先两种方式。

__CODE_BLOCK_16__

可以查看 __LINK_132__ 的代码优先模式和 __LINK_133__ 的模式优先模式。

#### Federation with Mercurius

首先，需要安装所需的依赖项：

__CODE_BLOCK_17__

> 提示 **Note** 需要 __INLINE_CODE_75__ 包以构建子图架构 (__INLINE_CODE_76__、__INLINE_CODE_77__ 函数)。

#### 模式优先

“User 服务”提供了一个简单的架构。注意 __INLINE_CODE_78__ 指令：它 instructs Mercurius 查询计划器，如果你指定了 __INLINE_CODE_80__，可以 fetch __INLINE_CODE_79__ 的实例。另外，注意我们 __INLINE_CODE_81__ 了 __INLINE_CODE_82__ 类型。

__CODE_BLOCK_18__

 Resolver 提供了一个名为 __INLINE_CODE_83__ 的方法。这方法在 Mercurius Gateway 中被触发，当相关资源需要 User 实例时。我们将在 Posts 服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_84__ 装饰器注解。

__CODE_BLOCK_19__

最后，我们将一切连接起来，通过将 __INLINE_CODE_85__ 注册到配置对象中：

__CODE_BLOCK_20__

#### 代码优先

首先，需要添加一些额外的装饰器到 __INLINE_CODE_87__ 实体中。

__CODE_BLOCK_21__

 Resolver 提供了一个名为 __INLINE_CODE_88__ 的方法。这方法在 Mercurius Gateway 中被触发，当相关资源需要 User 实例时。我们将在 Posts 服务中看到这个示例。请注意，方法必须被 __INLINE_CODE_89__ 装饰器注解。

__CODE_BLOCK_22__

最后，我们将一切连接起来，通过将 __INLINE_CODE_90__ 注册到配置对象中：

__CODE_BLOCK_23__

#### 分布式示例：Posts

Posts 服务旨在通过 __INLINE_CODE_92__ 查询提供聚合的文章，并将 __INLINE_CODE_93__ 类型扩展到 __INLINE_CODE_94__ 字段中。

#### 模式优先

“Posts 服务”在其架构中引用 __INLINE_CODE_95__ 类型，并将其标记为 __INLINE_CODE_96__ 关键字。此外，它还声明了 __INLINE_CODE_97__ 类型中的一个额外属性（__INLINE_CODE_98__）。注意 __INLINE_CODE_99__ 指令用于匹配 User 实例的 instances，并且 __INLINE_CODE_100__ 指令指示 __INLINE_CODE_101__ 字段在其他地方管理。

__CODE_BLOCK_24__

在以下示例中，__INLINE_CODE_102__ 提供了 __INLINE_CODE_103__ 方法，该方法返回一个包含 __INLINE_CODE_104__ 和一些额外属性的参考，在这里 __INLINE_CODE_105__。__INLINE_CODE_106__ 由 GraphQL Gateway 使用，以 pinpoint 微服务负责 User 类型的实例和检索对应的实例。“Users 服务”在上述部分中描述将被请求，以执行 __INLINE_CODE_107__ 方法。

__CODE_BLOCK_25__

最后，我们必须注册 __INLINE_CODE_108__，类似于在 “Users 服务”部分中所做的。

__CODE_BLOCK_26__

#### 代码优先

首先，我们将声明一个表示 __INLINE_CODE_109__ 实体的类。虽然实体本身位于另一个服务中，我们将在这里使用它（扩展其定义）。注意 __INLINE_CODE_110__ 和 __INLINE_CODE_111__ 指令。

__CODE_BLOCK_27__

现在，让我们创建 __INLINE_CODE_112__ 实体的对应解析器：

__CODE_BLOCK_28__

我们还需要定义 __INLINE_CODE_113__ 实体类：

__CODE_BLOCK_29__

And its resolver：

__CODE_BLOCK_30__

And finally, tie it together in a module. Note the schema build options, where we specify that __INLINE_CODE_114__ is an orphaned (external) type.

__CODE_BLOCK_31__

#### 分布式示例：Gateway

Gateway 需要指定一个端点列表，并会自动发现相应的架构。因此，Gateway 服务的实现将保持不变，适用于代码优先和模式优先两种方式。

__CODE_BLOCK_32__

### Federation 2

根据 __LINK_134__，Federation 2 可以改进开发体验，相比于原始的 Apollo Federation（称为 Federation 1 在这个文档中），它是向后兼容的。

> 警告 **Warning** Mercurius 并不完全支持 Federation 2。您可以查看支持 Federation 2 的库列表 __LINK_135__。

在以下部分中，我们将升级前面的示例以使用 Federation 2。

#### 分布式示例：UsersHere is the translation of the English technical documentation to Chinese:

 Federation 2 中的一个变化是实体没有原始子图，所以我们不需要再扩展 __INLINE_CODE_115__ 了。关于详细信息，请参阅 __LINK_136__ 在 Apollo Federation 2 文档中。

#### Schema first

我们可以简单地从 schema 中删除 __INLINE_CODE_116__ 关键字。

__CODE_BLOCK_33__

#### Code first

要使用 Federation 2，我们需要在 __INLINE_CODE_117__ 选项中指定 federation 版本。

__CODE_BLOCK_34__

#### Federated 例：文章

与上述原因相同，我们不再需要扩展 __INLINE_CODE_118__ 和 __INLINE_CODE_119__ 了。

#### Schema first

我们可以简单地从 schema 中删除 __INLINE_CODE_120__ 和 __INLINE_CODE_121__ 指令。

__CODE_BLOCK_35__

#### Code first

由于我们不再扩展 __INLINE_CODE_122__ 实体，所以可以简单地删除 __INLINE_CODE_123__ 和 __INLINE_CODE_124__ 指令从 __INLINE_CODE_125__ 中。

__CODE_BLOCK_36__

同样，类似于 User 服务，我们需要在 __INLINE_CODE_126__ 中指定使用 Federation 2。

__CODE_BLOCK_37__