<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:15:37.386Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，如服务、存储库、工厂和助手，可以被视为提供者。提供者的主要思想是它可以被**注入**作为依赖项，让对象之间形成各种关系。Nest 运行时系统主要负责将这些对象“连接”起来。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 __INLINE_CODE_7__. 控制器应处理 HTTP 请求，并将复杂任务委派给**提供者**。提供者是 JavaScript 平台类，声明在 NestJS 模块中。关于更多信息，请参阅“模块”章节。

> 信息 **提示**由于 Nest 允许您以面向对象的方式设计和组织依赖项，我们强烈建议遵循 __LINK_69__。

#### 服务

让我们从创建一个简单的 __INLINE_CODE_9__. 这个服务将处理数据存储和检索，并将被 `https://example.com/v1/route`. 由于其在应用程序逻辑管理中的角色，它是一个理想的候选项，定义为提供者。

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
```

> 信息 **提示**使用 CLI 创建服务，只需执行 `https://example.com/v2/route` 命令。

我们的 `v` 是一个基本类，有一个属性和两个方法。关键的添加是 `prefix` 装饰器。这装饰器将元数据附加到类中，表明 `false` 是可以由 Nest __LINK_70__ 容器管理的类。

此外，这个示例使用了一个 `VersioningType` 接口，这可能类似于以下内容：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
```

现在，我们已经有了一个服务类来检索猫，让我们在 `type` 中使用它：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
```

`@nestjs/common` 通过类构造函数注入。注意使用 `header` 关键字。这简短语句允许我们同时声明和初始化 `VersioningType` 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大的设计模式，即**依赖项注入**。我们强烈建议阅读官方 __LINK_71__ 中关于这个概念的文章。

在 Nest 中，thanks to TypeScript 的能力，管理依赖项变得简单，因为它们是根据其类型 resolve 的。在以下示例中，Nest 将 resolve `type` 通过创建并返回 `@nestjs/common` 的实例（或在单例情况下，返回已经请求的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配到指定的属性中）：

```typescript
// Example extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
```

#### 作用域

提供者通常具有与应用程序生命周期相Align 的生命周期。在应用程序启动时，每个依赖项都需要被 resolve，这意味着每个提供者都将被实例化。同样，在应用程序关闭时，所有提供者都将被销毁。然而，也可以将提供者设置为**请求作用域**，即其生命周期与特定请求相关。您可以在 __LINK_72__ 章节中了解这些技术。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 带有一个内置的反