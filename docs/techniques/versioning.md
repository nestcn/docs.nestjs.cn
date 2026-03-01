<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:16:00.824Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **提示** 本章节只适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中拥有多个版本的控制器或单个路由。应用程序会频繁地变化，需要支持之前版本的应用程序，同时也需要在新的变化中进行支持。

有 4 种类型的版本控制支持：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__版本将在请求的 URI 中被传递（默认）__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__头版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__一个自定义的请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__媒体类型版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__请求的 __HTML_TAG_89__Accept__HTML_TAG_90__ 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__自定义版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__请求的任何方面可以用来指定版本（或版本）。一个自定义函数提供了提取这些版本的方法__HTML_TAG_101__
  __HTML_TAG_