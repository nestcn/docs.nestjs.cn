<!-- 此文件从 content/custom-decorators.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:06:31.950Z -->
<!-- 源文件: content/custom-decorators.md -->

### 自定义路由装饰器

Nest 是基于 ES2016 中的 **decorators** 语言特性的。Decorators 是许多常用的编程语言中一个熟悉的概念，但是在 JavaScript 世界中它们仍然相对较新。在更好地理解 decorators 是如何工作的，我们强烈建议阅读 __LINK_147__。下面是一个简单的定义：

__HTML_TAG_29__
  ES2016 中的装饰器是一个返回函数的表达式，可以将目标、名称和属性描述符作为参数。您可以通过在要装饰的顶部添加 __HTML_TAG_30__@__HTML_TAG_31__ 字符来应用装饰器。Decorators 可以用于类、方法或属性。

__HTML_TAG_32__

#### 参数装饰器

Nest 提供了一组有用的 **param decorators**，您可以将它们与 HTTP 路由处理程序一起使用。下面是提供的装饰器列表和对应的 Plain Express (或 Fastify) 对象

__HTML_TAG_33__
  __HTML_TAG_34__
    __HTML_TAG_35__
      __HTML_TAG_36____HTML_TAG_37__@Request(), @Req()__HTML_TAG_38____HTML_TAG_39__
      __HTML_TAG_40____HTML_TAG_41__req__HTML_TAG_42____HTML_TAG_43__
    __HTML_TAG_44__
    __HTML_TAG_45__
      __HTML_TAG_46____HTML_TAG_47__@Response(), @Res()__HTML_TAG_48____HTML_TAG_49__
      __HTML_TAG_50____HTML_TAG_51__res__HTML_TAG_52____HTML_TAG_53__
    __HTML_TAG_54__
    __HTML_TAG_55__
      __HTML_TAG_56____HTML_TAG_57__@Next()__HTML_TAG_58____HTML_TAG_59__
      __HTML_TAG_60____HTML_TAG_61__next__HTML_TAG_62____HTML_TAG_63__
    __HTML_TAG_64__
    __HTML_TAG_65__
      __HTML_TAG_66____HTML_TAG_67__@Session()__HTML_TAG_68____HTML_TAG_69__
      __HTML_TAG_70____HTML_TAG_71__req.session<figure><img class="illustrative-image" src="/assets/Middlewares_1.png" />
    </figure>
    <blockquote class="external">
      <ul><li>@Param(param?: string)</li><li>
      </li><li>req.params</li> / <li>req.params[param]</li><li>
    <code>
    </code>
      </li></ul>@Body(param?: string)</blockquote><a href="/middleware#多个中间件">
      </a>__HTML_TAG_93__req.body__HTML_TAG_94__ / __HTML_TAG_95__req.body[param]__HTML_TAG_96____HTML_TAG_97__
    __HTML_TAG_98__
    __HTML_TAG_99__
      __HTML_TAG_100____HTML_TAG_101__@Query(param?: string)__HTML_TAG_102____HTML_TAG_103__
      __HTML_TAG_104____HTML_TAG_105__req.query__HTML_TAG_106__ / __HTML_TAG_107__req.query[param]__HTML_TAG_108____HTML_TAG_109__
    __HTML_TAG_110__
    __HTML_TAG_111__
      __HTML_TAG_112____HTML_TAG_113__@Headers(param?: string)__HTML_TAG_114____HTML_TAG_115__
      __HTML_TAG_116____HTML_TAG_117__req.headers__HTML_TAG_118__ / __HTML_TAG_119__req.headers[param]__HTML_TAG_120____HTML_TAG_121__
    __HTML_TAG_122__
    __HTML_TAG_123__
      __HTML_TAG_124____HTML_TAG_125__@Ip()__HTML_TAG_126____HTML_TAG_127__
      __HTML_TAG_128____HTML_TAG_129__req.ip__HTML_TAG_130____HTML_TAG_131__
    __HTML_TAG_132__
    __HTML_TAG_133__
      __HTML_TAG_134____HTML_TAG_135__@HostParam()__HTML_TAG_136____HTML_TAG_137__
      __HTML_TAG_138____HTML_TAG_139__req.hosts__HTML_TAG_140____HTML_TAG_141__
    __HTML_TAG_142__
  __HTML_TAG_143__
__HTML_TAG_144__

此外，您还可以创建自己的 **自定义装饰器**。为什么这是有用的？

在 Node.js 世界中，> info **提示** 对于 TypeScript 用户，请注意 `NestMiddleware` 是一个泛型。这意味着您可以明确地强制执行类型安全性，例如 `Express`。或者，您可以在工厂函数中指定参数类型，例如 `fastify`。如果您省略了这两个选项，`constructor` 的类型将默认为 `@Module()`。

#### 使用管道

Nest 将自定义参数装饰器与内置的装饰器(`configure()`, `NestModule` 和 `LoggerMiddleware`)处理方式相同。这意味着管道将执行自定义注解的参数（在我们的示例中是 `AppModule` argument）也一样。此外，您可以将管道直接应用于自定义装饰器：

```typescript title="代码块 6"

```

> info **提示** 请注意 `LoggerMiddleware` 选项必须设置为 true。 `/cats` 不会默认验证带有自定义装饰器的参数。

#### 装饰器组合

Nest 提供了一个helper 方法来组合多个装饰器。例如，假设您想将所有与身份验证相关的装饰器组合成一个单个装饰器。这可以通过以下构建来实现：

```typescript title="代码块 7"

```

然后，您可以使用这个自定义 `CatsController` 装饰器以以下方式：

```typescript title="代码块 8"

```

这将应用所有四个装饰器的效果。

> warning **警告** 来自 `method` 包的 `path` 装饰器不可组合且不会正确地工作于 `forRoutes()` 函数。