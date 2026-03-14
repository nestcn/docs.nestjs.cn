<!-- 此文件从 content/graphql/federation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:05:11.008Z -->
<!-- 源文件: content/graphql/federation.md -->

### Federation

Federation 提供了一种将 monolithic GraphQL 服务器拆分为独立微服务的方法。它由两个组件组成：一个网关和一个或多个联邦微服务。每个微服务都持有部分 schema，并且网关将这些 schema 合并成一个可以被客户端消费的单个 schema。

引用 __LINK_127__，Federation 根据以下核心原则设计：

- 构建图形应该是 **声明式** 的。通过 Federation，您可以从 schema 中声明式地构建图形，而不是编写 imperative schema stitching 代码。
- 代码应该根据 **关注点** 分离，而不是根据类型。通常，没有单个团队控制重要类型，如用户或产品的所有方面，因此这些类型的定义应该分布在多个团队和代码库中，而不是集中化。
- 图形应该是简单的，对客户端消费。联邦服务可以形成一个完整的、产品专注的图形，该图形准确反映了客户端的使用情况。
- 它只使用 **GraphQL** 语言的规范特性。任何语言，而不仅仅是 JavaScript，可以实现 Federation。

> 警告 Federation 目前不支持订阅。

在以下部分，我们将设置一个 demo 应用程序，该应用程序由一个网关和两个联邦端点组成：用户服务和文章服务。

#### Federation with Apollo

首先，安装所需的依赖项：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

#### Schema first

“用户服务”提供了一个简单的 schema。请注意 `@nestjs/core` 指令：它告诉 Apollo 查询规划器，如果指定了 __INLINE_CODE_40__，可以fetch一个特定的 __INLINE_CODE_39__ 实例。同时，注意我们 __INLINE_CODE_41__ 了 __INLINE_CODE_42__ 类型。

```bash
$ npm i @nestjs/devtools-integration

```

Resolver 提供了一个额外的方法名为 __INLINE_CODE_43__。这个方法是在 Apollo 网关中被触发的，当一个相关资源需要一个用户实例时。我们将在文章服务中看到这个示例。请注意，这个方法必须使用 __INLINE_CODE_44__ 装饰器。

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

最后，我们将一切绑定起来，通过在配置对象中注册 __INLINE_CODE_45__，并将 __INLINE_CODE_46__ 驱动器传递给它：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

#### Code first

首先，在 __INLINE_CODE_47__ 实体上添加一些额外的装饰器。

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

Resolver 提供了一个额外的方法名为 __INLINE_CODE_48__。这个方法是在 Apollo 网关中被触发的，当一个相关资源需要一个用户实例时。我们将在文章服务中看到这个示例。请注意，这个方法必须使用 __INLINE_CODE_49__ 装饰器。

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

最后，我们将一切绑定起来，通过在配置对象中注册 __INLINE_CODE_50__，并将 __INLINE_CODE_51__ 驱动器传递给它：

__CODE_BLOCK_6__

一个工作示例可以在 __LINK_128__ 中找到，使用 schema first 模式，可以在 __LINK_129__ 中找到，使用 code first 模式。

#### Federated example: Posts

文章服务应该通过 __INLINE_CODE_52__ 查询提供聚合的文章，但是也将 __INLINE_CODE_53__ 类型扩展到 __INLINE_CODE_54__ 字段。

#### Schema first

“文章服务”在其 schema 中引用了 __INLINE_CODE_55__ 类型，并将其标记为 __INLINE_CODE_56__ 关键字。它还声明了 __INLINE_CODE_57__ 类型上的一个额外属性（__INLINE_CODE_58__）。请注意 __INLINE_CODE_59__ 指令用于匹配用户实例的 __INLINE_CODE_60__ 指令指示 __INLINE_CODE_61__ 字段在其他地方管理。

__CODE_BLOCK_7__

在以下示例中，__INLINE_CODE_62__ 提供了 __INLINE_CODE_63__ 方法，该方法返回一个包含 __INLINE_CODE_64__ 和一些额外属性的引用。在这个案例中，__INLINE_CODE_65__ 将被 GraphQL 网关用于 pinpoint.microservice 负责 __INLINE_CODE_66__ 类型的实例，并在执行 __INLINE_CODE_67__ 方法时请求该实例。上面所述的“用户服务”将被请求。

__CODE_BLOCK_8__

最后，我们必须注册 __INLINE_CODE_68__，与“用户服务”部分中所做的类似。

__CODE_BLOCK_9__

#### Code first

首先，我们将声明一个代表 __INLINE_CODE_69__ 实体的类。虽然实体自己生活在另一个服务中，我们将在这里扩展它的定义。请注意 __INLINE_CODE_70__ 和 __INLINE_CODE_71__ 指令。

__CODE_BLOCK_10__

现在，让我们创建 __INLINE_CODE_72__ 实体的对应 resolver：

__CODE_BLOCK_11__

我们还需要定义 __INLINE_CODE_73__ 实体类：

__CODE_BLOCK_12__

And its resolver：

__CODE_BLOCK_13__

And finally, tie it together in a module. Note the schema build options, where we specify that __INLINE_CODE_74__ is an orphaned (external) type.

__CODE_BLOCK_14__A working example is available [__LINK_130__](http://example.com/130) for the code first mode and [__LINK_131__](http://example.com/131) for the schema first mode.

#### Federated example: Gateway

首先，需要安装所需的依赖项：

```typescript
__CODE_BLOCK_15__

```

Gateway 需要指定一组端口，它将自动发现相应的 schema。因此，Gateway 服务的实现将保持不变，适用于代码和架构的双种模式。

```typescript
__CODE_BLOCK_16__

```

A working example is available [__LINK_132__](http://example.com/132) for the code first mode and [__LINK_133__](http://example.com/133) for the schema first mode.

#### Federation with Mercurius

首先，需要安装所需的依赖项：

```typescript
__CODE_BLOCK_17__

```

> info **Note** __INLINE_CODE_75__ 包含了用于构建子图 schema 的 __INLINE_CODE_76__ 和 __INLINE_CODE_77__ 函数。

#### Schema first

“用户服务”提供了一个简单的 schema。注意 __INLINE_CODE_78__ 指令，它指示 Mercurius 查询计划器在指定某个 __INLINE_CODE_79__ 实例时，可以 fetch 相应的实例。同时，注意我们 __INLINE_CODE_81__ 了 __INLINE_CODE_82__ 类型。

```typescript
__CODE_BLOCK_18__

```

Resolver 提供了一个额外的方法命名为 __INLINE_CODE_83__。这个方法在 Mercurius Gateway 触发时被触发，用于获取 User 实例。我们将在 Posts 服务中看到这个方法的示例。请注意，这个方法必须被 __INLINE_CODE_84__ 装饰器标注。

```typescript
__CODE_BLOCK_19__

```

最后，我们将所有东西连接起来，通过在配置对象中注册 __INLINE_CODE_85__，并将 __INLINE_CODE_86__ 驱动程序传递给它：

```typescript
__CODE_BLOCK_20__

```

#### Code first

首先，添加一些额外的装饰器到 __INLINE_CODE_87__ 实体。

```typescript
__CODE_BLOCK_21__

```

Resolver 提供了一个额外的方法命名为 __INLINE_CODE_88__。这个方法在 Mercurius Gateway 触发时被触发，用于获取 User 实例。我们将在 Posts 服务中看到这个方法的示例。请注意，这个方法必须被 __INLINE_CODE_89__ 装饰器标注。

```typescript
__CODE_BLOCK_22__

```

最后，我们将所有东西连接起来，通过在配置对象中注册 __INLINE_CODE_90__，并将 __INLINE_CODE_91__ 驱动程序传递给它：

```typescript
__CODE_BLOCK_23__

```

#### Federated example: Posts

Posts 服务旨在通过 __INLINE_CODE_92__ 查询提供聚合的帖子，并将 __INLINE_CODE_93__ 类型扩展到 __INLINE_CODE_94__ 字段。

#### Schema first

“Posts 服务”在 schema 中引用 __INLINE_CODE_95__ 类型，并将其标记为 __INLINE_CODE_96__ 关键字。它还声明了 __INLINE_CODE_97__ 类型中的一个额外属性 (__INLINE_CODE_98__)。注意 __INLINE_CODE_99__ 指令用于匹配 User 实例的实例，并 __INLINE_CODE_100__ 指令指示 __INLINE_CODE_101__ 字段在其他地方管理。

```typescript
__CODE_BLOCK_24__

```

在以下示例中，__INLINE_CODE_102__ 提供了 __INLINE_CODE_103__ 方法，该方法返回包含 __INLINE_CODE_104__ 和一些额外属性的引用。__INLINE_CODE_106__ 是 GraphQL Gateway 用于 pinpoint 微服务负责 User 类型并获取相应实例的方法。“Users 服务”将在 __INLINE_CODE_107__ 方法执行时被请求。

```typescript
__CODE_BLOCK_25__

```

最后，我们必须注册 __INLINE_CODE_108__，类似于在 “Users 服务” 部分所做的注册。

```typescript
__CODE_BLOCK_26__

```

#### Code first

首先，我们将声明一个代表 __INLINE_CODE_109__ 实体的类。虽然实体本身生活在另一个服务中，我们将在这里扩展它的定义。注意 __INLINE_CODE_110__ 和 __INLINE_CODE_111__ 指令。

```typescript
__CODE_BLOCK_27__

```

现在，让我们创建对应的 resolver，以便我们的扩展 __INLINE_CODE_112__ 实体：

```typescript
__CODE_BLOCK_28__

```

我们也需要定义 __INLINE_CODE_113__ 实体类：

```typescript
__CODE_BLOCK_29__

```

And its resolver:

```typescript
__CODE_BLOCK_30__

```

And finally, tie it together in a module. Note the schema build options, where we specify that __INLINE_CODE_114__ is an orphaned (external) type.

```typescript
__CODE_BLOCK_31__

```

#### Federated example: Gateway

Gateway 需要指定一组端口，它将自动发现相应的 schema。因此，Gateway 服务的实现将保持不变，适用于代码和架构的双种模式。

```typescript
__CODE_BLOCK_32__

```

### Federation 2

引用 __LINK_134__，Federation 2 改进了开发人员体验，从原始的 Apollo Federation（称为 Federation 1 在这个文档中），它是以下是翻译后的中文技术文档：

Federation 2 中的一个变化是实体没有起源子图，所以我们不需要再扩展 `__INLINE_CODE_115__` anymore。关于详细信息，请参阅 Apollo Federation 2 文档中的 __LINK_136__。

#### Schema-first

我们可以简单地从 schema 中删除 `__INLINE_CODE_116__` 关键字。

__CODE_BLOCK_33__

#### Code-first

要使用 Federation 2，我们需要在 `__INLINE_CODE_117__` 选项中指定 federation 版本。

__CODE_BLOCK_34__

#### Federated 示例：Posts

由于上述原因，我们不需要再扩展 `__INLINE_CODE_118__` 和 `__INLINE_CODE_119__` anymore。

#### Schema-first

我们可以简单地从 schema 中删除 `__INLINE_CODE_120__` 和 `__INLINE_CODE_121__` 指令。

__CODE_BLOCK_35__

#### Code-first

由于我们不再扩展 `__INLINE_CODE_122__` 实体，所以我们可以简单地从 `__INLINE_CODE_125__` 中删除 `__INLINE_CODE_123__` 和 `__INLINE_CODE_124__` 指令。

__CODE_BLOCK_36__

此外，类似于用户服务，我们需要在 `__INLINE_CODE_126__` 中指定使用 Federation 2。

__CODE_BLOCK_37__