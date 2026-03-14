<!-- 此文件从 content/custom-decorators.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:21:04.155Z -->
<!-- 源文件: content/custom-decorators.md -->

### 自定义路由装饰器

Nest 是基于 ES2016 语言特性称为 **装饰器** 的。装饰器在许多常用的编程语言中是非常熟悉的概念，但是在 JavaScript 世界中，他们仍然是相对新的。为了更好地理解装饰器是如何工作的，我们建议阅读 __LINK_147__。下面是一个简单的定义：

__HTML_TAG_29__
  ES2016 装饰器是一个返回函数的表达式，可以接受目标、名称和属性描述符作为参数。
  你可以通过在你想装饰的东西前面加上一个 __HTML_TAG_30__@__HTML_TAG_31__ 字符来应用装饰器。装饰器可以定义为类、方法或属性。

#### Param 装饰器

Nest 提供了一组有用的 **param 装饰器**，可以与 HTTP 路由处理程序一起使用。下面是一些提供的装饰器和它们对应的平常 Express (或 Fastify) 对象：

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
      __HTML_TAG_70____HTML_TAG_71__req.session__HTML_TAG_72____HTML_TAG_73__
    __HTML_TAG_74__
    __HTML_TAG_75__
      __HTML_TAG_76____HTML_TAG_77__@Param(param?: string)__HTML_TAG_78____HTML_TAG_79__
      __HTML_TAG_80____HTML_TAG_81__req.params__HTML_TAG_82__ / __HTML_TAG_83__req.params[param]__HTML_TAG_84____HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      __HTML_TAG_88____HTML_TAG_89__@Body(param?: string)__HTML_TAG_90____HTML_TAG_91__
      __HTML_TAG_92____HTML_TAG_93__req.body__HTML_TAG_94__ / __HTML_TAG_95__req.body[param]__HTML_TAG_96____HTML_TAG_97__
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

此外，你还可以创建自己的 **自定义装饰器**。为什么这有> info **提示** 对于 TypeScript 用户，请注意 __INLINE_CODE_14__ 是一个泛型。这意味着您可以明确强制类型安全，例如 __INLINE_CODE_15__。或者，在工厂函数中指定参数类型，例如 __INLINE_CODE_16__。如果省略both，__INLINE_CODE_17__ 的类型将是 __INLINE_CODE_18__。

#### 使用管道

Nest 认为自定义参数装饰器和内置装饰器相同 (__INLINE_CODE_19__, __INLINE_CODE_20__ 和 __INLINE_CODE_21__）。这意味着管道将对自定义注解的参数进行执行（在我们的示例中，__INLINE_CODE_22__ 参数）。此外，您可以将管道直接应用于自定义装饰器：

```typescript title="pipe"

```typescript
@Get()
@Redirect('https://nestjs.com', 301)

```

```

> info **提示** 请注意 __INLINE_CODE_23__ 选项必须设置为 true。 __INLINE_CODE_24__ 不会默认验证使用自定义装饰器注解的参数。

#### 装饰器组合

Nest 提供了一个 helper 方法来组合多个装饰器。例如，假设您想将所有与身份验证相关的装饰器组合到一个单独的装饰器中。这可以通过以下构造来实现：

```typescript title="decorator composition"

```typescript
@Get('docs')
@Redirect('./', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: '/v5/' };
  }
}

```

```

然后，您可以使用这个自定义 `nest g resource [name]` 装饰器如下：

```typescript title="decorator usage"

```typescript
@Get(':id')
findOne(@Param() params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}

```

```

这将应用所有四个装饰器，以便于单个声明。

> warning **警告** 来自 `cats` 包的 `@Controller()` 装饰器不具可组合性，并且不会正确地与 `@Controller()` 函数一起使用。