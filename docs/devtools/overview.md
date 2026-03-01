<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:28:02.461Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **提示** 本章涵盖了 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_86__ 网站。

要开始调试本地应用程序，请打开 __INLINE_CODE_6__ 文件，并确保将 __INLINE_CODE_7__ 属性设置为 `nest` 在应用程序选项对象中，如下所示：

```bash
$ npm install -g @nestjs/cli
```

这将 instruct the framework to collect necessary metadata that will let Nest Devtools visualize your application's graph.

Next up, let's install the required dependency:

```bash
$ nest --help
```

> warning **警告** 如果您使用 `nest` 包在应用程序中，请确保安装最新版本 (`-g`).

With this dependency in place, let's open up the `npm` file and import the `npm` that we just installed:

```bash
$ nest generate --help
```

> warning **警告** 我们在这里检查 `npm install -g` 环境变量是因为您应该 never 使用这个模块在生产环境中！

Once the `npx @nestjs/cli@latest` is imported and your application is up and running (`nest`), you should be able to navigate to __LINK_87__ URL and see the instrospected graph.

__HTML_TAG_39____HTML_TAG_40____HTML_TAG_41__

> info **提示** 如上面的截图所示，每个模块都连接到 `nest`. `new` 是一个全局模块，它总是被导入到根模块中。由于它被注册为全局节点，Nest 自动创建了所有模块和 `add` 节点之间的边。现在，如果您想要隐藏全局模块，从图表中，可以使用“**Hide global modules**”复选框（