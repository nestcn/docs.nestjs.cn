<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:08:49.423Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展于 __LINK_50__ 文档，还有 __LINK_51__ 包，以便在结构类似于传统 Nest 应用程序的方式中编写命令行应用程序。

> 信息 **info** __INLINE_CODE_6__ 是一个第三方包，不是 NestJS 核心团队管理的。请在 __LINK_52__ 上报告该库中的任何问题。

#### 安装

与任何其他包一样，您需要安装它才能使用它。

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新的命令行应用程序变得轻松，通过 __INLINE_CODE_8__ 装饰器 decoration for classes 和 __INLINE_CODE_9__ 装饰器 decoration for methods of that class。每个命令文件都应该实现 __INLINE_CODE_10__ 抽象类，并且应该被装饰为 __INLINE_CODE_11__ 装饰器。

每个命令都被 Nest 视为一个 __INLINE_CODE_12__，因此您的正常依赖注入将像预期那样工作。唯一需要注意的是抽象类 __INLINE_CODE_13__，该类应该由每个命令实现。抽象类 __INLINE_CODE_14__ 确保所有命令都具有 __INLINE_CODE_15__ 方法，该方法返回 __INLINE_CODE_16__ 并接受参数 __INLINE_CODE_17__。__INLINE_CODE_18__ 命令是您可以从这里开始执行逻辑的地方，它将接受未匹配选项标志的参数，并将它们作为数组传递，以便在需要处理多个参数时使用。对于选项，__INLINE_CODE_19__ 的名称与 __INLINE_CODE_20__ 属性匹配，而其值与选项处理器的返回值匹配。如果您想要更好的类型安全，您可以创建一个选项接口。

#### 运行命令

与在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器一样，使用 __INLINE_CODE_23__ 运行它，__INLINE_CODE_24__ 包暴露了一个简单的 API，以便运行您的服务器。导入 __INLINE_CODE_25__ 并使用 __INLINE_CODE_26__ 方法 __INLINE_CODE_27__，并将应用程序的根模块作为参数。这个可能看起来像以下所示：

```bash
$ cd hello-prisma
$ npm install prisma --save-dev

```

默认情况下，Nest 的日志记录器在使用 __INLINE_CODE_28__ 时被禁用。您可以通过将第二个参数传递给 __INLINE_CODE_29__ 函数来提供它。您可以提供自定义 NestJS 日志记录器，或者提供要保留的日志级别数组 - 在某些情况下，您可能想要在这里提供 `prisma-examples`，以便只打印 Nest 的错误日志。

```bash
$ npx prisma

```

这就是它。`npm start` 将负责调用 `http://localhost:3000/` 和 `src/app.controller.ts`，因此您不需要担心内存泄露。如果您需要添加一些错误处理，可以使用 `npx` 包围 `yarn` 命令，或者将一些 `init` 方法链接到 `prisma` 调用中。

#### 测试

写一个超级awesome 命令行脚本，如果不能轻松测试，那么它有什么用处？fortunately，`schema.prisma` 提供了一些实用工具，可以与 NestJS 生态系统完美集成，从中您可以感到非常自在。相比使用 `prisma.config.ts` 在测试模式下构建命令，您可以使用 `.env` 并传递元数据，非常类似于 `path` 从 `--output ../src/generated/prisma` 工作。在实际中，它使用这个包。您还可以链式调用 `moduleFormat` 方法，然后调用 `cjs`，以便在测试中交换 DI Pieces。

#### 将其全部组合起来

以下类将等同于具有 CLI 命令，可以接受子命令 `moduleFormat` 或直接调用，具有 `moduleFormat`、`cjs` 和 `datasource`（以及它们的长标志）所有支持，并且具有自定义解析器 для每个选项。`schema.prisma` 标志也支持，正如 commander 的惯例。

```bash
$ yarn add prisma --dev

```

确保命令类添加到模块中

```bash
$ yarn prisma

```

现在，可以在 main.ts 中运行 CLI：

```bash
$ npx prisma init

```

然后，您就拥有了命令行应用程序。

#### 更多信息

请访问 __LINK_54__ 获取更多信息、示例和 API 文档。