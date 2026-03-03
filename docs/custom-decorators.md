<!-- 此文件从 content/custom-decorators.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:22.472Z -->
<!-- 源文件: content/custom-decorators.md -->

### Custom 路由装饰器

Nest 是基于语言特性称为**装饰器**的。装饰器是很多常见编程语言中一个熟悉的概念，但是在 JavaScript 世界中，它们仍然相对较新。在更好地理解装饰器如何工作之前，我们建议阅读 __LINK_147__。下面是一个简单的定义：

__HTML_TAG_29__
  ES2016 装饰器是一个表达式，它返回一个函数，可以以目标、名称和属性描述符为参数。您可以将其应用于类、方法或属性上。装饰器可以定义为类、方法或属性。

#### Param 装饰器

Nest 提供了一组有用的 **param 装饰器**，您可以将其与 HTTP 路由处理程序一起使用。下面是一个装饰器列表和它们对应的纯 Express（或 Fastify）对象

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
      __HTML_TAG_100____HTML_TAG_101__@Query(param?: string)__HTML_TAG_102____HTML_TAG_