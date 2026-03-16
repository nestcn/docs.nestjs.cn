<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:04:30.361Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展 __LINK_50__ 的文档，Nest Commander 还有 __LINK_51__ 包，用于编写类似于传统 Nest 应用程序的命令行应用程序。

> 信息 **信息** __INLINE_CODE_6__ 是第三方包，不是 NestJS 核心团队管理的。请在 __LINK_52__ 报告任何与库相关的问题。

#### 安装

和其他包一样，您需要安装它才能使用它。

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新的命令行应用程序变得容易，使用 __LINK_53__ 通过 __INLINE_CODE_8__ 装饰器来装饰类和方法。每个命令文件都应该实现 __INLINE_CODE_10__ 抽象类，并且应该被 __INLINE_CODE_11__ 装饰。

每个命令都被 Nest 视为一个 __INLINE_CODE_12__，因此您的正常依赖注入将像预期那样工作。唯一需要注意的是抽象类 __INLINE_CODE_13__，应该被每个命令实现。抽象类 __INLINE_CODE_14__ 确保所有命令都有一个 __INLINE_CODE_15__ 方法，该方法返回 __INLINE_CODE_16__ 并且接受参数 __INLINE_CODE_17__。 __INLINE_CODE_18__ 命令是您的逻辑入口点，您可以在其中处理所有参数，并将它们作为数组传递，例如，您可以处理多个参数。关于选项， __INLINE_CODE_19__ 的名称匹配 __INLINE_CODE_20__ 属性，而其值匹配 __INLINE_CODE_21__ 装饰器的返回值。如果您想要更好的类型安全，您可以创建一个选项接口。

#### 运行命令

类似于在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器，并使用 __INLINE_CODE_23__ 运行它， __INLINE_CODE_24__ 包 expose 了一个简单的 API 来运行您的服务器。导入 __INLINE_CODE_25__ 并使用 __INLINE_CODE_26__ 方法 __INLINE_CODE_27__，并将应用程序的根模块作为参数传递。这可能如下所示：

```bash
$ cd hello-prisma
$ npm install prisma --save-dev

```

默认情况下，Nest 的日志器在使用 __INLINE_CODE_28__ 时被禁用。但是，您可以提供自定义 NestJS 日志器，或者将要保留的日志级别作为第二个参数传递。您可能想在这里提供 `prisma-examples`，以便只打印 Nest 的错误日志。

```bash
$ npx prisma

```

这就是所有。 `npm start` 将负责调用 `http://localhost:3000/` 和 `src/app.controller.ts`，因此您不需要担心内存泄露。如果您需要添加一些错误处理，总是可以使用 `npx` 包围 `yarn` 命令，或者将 `init` 方法链到 `prisma` 调用中。

#### 测试

写一个超级棒的命令行脚本如果不能轻松测试，那么它有什么用处？幸运的是， `schema.prisma` 提供了一些实用工具，可以与 NestJS 生态系统完美集成。您可以使用 `.env` 来构建命令，以便在测试模式下使用，非常类似于 `path` 在 `--output ../src/generated/prisma` 中的工作方式。您还可以在调用 `cjs` 之前链式调用 `moduleFormat` 方法，以便在测试中交换 DI 部分。

#### 将所有内容整合

以下类将等同于拥有一个CLI命令，可以接受子命令 `moduleFormat` 或直接调用，具有 `moduleFormat`、`cjs` 和 `datasource`（及其长标签）支持，以及每个选项的自定义解析器。 `schema.prisma` 标记也被支持，正如 commander 的惯例。

```bash
$ yarn add prisma --dev

```

确保命令类添加到模块中

```bash
$ yarn prisma

```

现在，您可以在 main.ts 中运行 CLI，以以下方式：

```bash
$ npx prisma init

```

和那样，您就拥有了一个命令行应用程序。

#### 更多信息

访问 __LINK_54__ 获取更多信息、示例和 API 文档。