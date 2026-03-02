<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:08:12.888Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **注意** 本章只适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中运行多个控制器或单个路由的不同版本。应用程序变化非常频繁，常常需要支持之前的应用程序版本。

支持 4 种版本控制：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__版本将在请求的 URI 中传递（默认)__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__头版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__自定义请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__媒体类型版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__请求的 __HTML_TAG_89__ Accept__HTML_TAG_90__ 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__自定义版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__请求中的任何方面可以用来指定版本（或版本）。提供了一个自定义函数来提取这些版本__HTML_TAG_101__
  __HTML_TAG_102__
__HTML_TAG_103__

#### URI 版本控制类型

URI