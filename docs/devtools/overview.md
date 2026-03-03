<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:20:40.766Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **提示** 本章将涵盖 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_86__ 网站。

要启动本地应用程序的调试，请打开 __INLINE_CODE_6__ 文件，并确保在应用程序选项对象中将 __INLINE_CODE_7__ 属性设置为 `nest`，如下所示：

```bash
$ npm install -g @nestjs/cli
```

这将 instruct the framework to collect necessary metadata that will let Nest Devtools visualize your application's graph.

Next up, let's install the required dependency:

```bash
$ nest --help
```

> warning **警告** 如果您在应用程序中使用 `nest` 包含项，请确保安装最新版本 (`-g`）。

With this dependency in place, let's open up the `npm` file and import the `npm` that we just installed:

```bash
$ nest generate --help
```

> warning **警告** 我们在这里检查 `npm install -g` 环境变量是因为您在生产环境中不应该使用这个模块！

Once the `npx @nestjs/cli@latest` is imported and your application is up and running (`nest`), you should be able to navigate to __LINK_87__ URL and see the inspectsed graph.

__HTML_TAG_39____HTML_TAG_40____HTML_TAG_41__

> info **提示** 如您在上面的截图中看到，每个模块都连接到 `nest`. `new` 是一个全局模块，它总是被导入到根模块中。由于它注册为全局节点，Nest 自动创建了所有模块和 `add` 节点之间的边。现在，如果您想隐藏全局模块的图表，可以使用侧边栏中的 "**Hide global modules**