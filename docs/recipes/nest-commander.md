<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:36:11.789Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展__LINK_50__文档，Nest Commander 还提供了__LINK_51__包，以便在结构类似于 typical Nest 应用程序的方式编写命令行应用程序。

> info **info** __INLINE_CODE_6__ 是第三方包，不由整个 NestJS 核心团队管理。请在 __LINK_52__ 报告该库中的任何问题。

#### 安装

与其他包一样，您需要安装它才能使用它。

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新的命令行应用程序变得非常容易，使用__LINK_53__和__INLINE_CODE_8__装饰器来装饰类和方法。每个命令文件都应该实现 __INLINE_CODE_10__ 抽象类，并使用 __INLINE_CODE_11__ 装饰器。

每个命令都被 Nest 视为一个 __INLINE_CODE_12__，因此您的正常依赖注入仍然将按照预期工作。需要注意的是，抽象类 __INLINE_CODE_13__ 应该由每个命令实现。__INLINE_CODE_14__ 抽象类确保每个命令都有一个 __INLINE_CODE_15__ 方法，该方法返回一个 __INLINE_CODE_16__，并接受 __INLINE_CODE_17__ 作为参数。__INLINE_CODE_18__ 命令是您的逻辑的起点，您可以在其中使用多个参数。关于选项，__INLINE_CODE_19__ 的名称与 __INLINE_CODE_20__ 属性匹配，而它们的值匹配 __INLINE_CODE_21__ 装饰器的返回值。如果您想获得更好的类型安全，可以创建一个接口来描述您的选项。

#### 运行命令

类似于在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器，并使用 __INLINE_CODE_23__ 运行它，__INLINE_CODE_24__ 包提供了一个简单的 API 来运行您的服务器。导入 __INLINE_CODE_25__ 并使用 __INLINE_CODE_26__ 方法 __INLINE_CODE_27__，并将应用程序的根模块作为参数。可能会如下所示

```bash
$ cd hello-prisma
$ npm install prisma --save-dev

```

默认情况下，Nest 的日志器在使用 __INLINE_CODE_28__ 时被禁用。可以通过将第二个参数传递给 __INLINE_CODE_29__ 函数来提供它。可以提供自定义 NestJS 日志器，也可以提供要保持的日志级别数组 - 在某些情况下，可能需要在 `prisma-examples` 中提供错误日志。

```bash
$ npx prisma

```

这就是所有。`npm start` 将负责调用 `http://localhost:3000/` 和 `src/app.controller.ts`，因此您不需要担心内存泄露。如果需要添加错误处理，可以使用 `npx` 将 `yarn` 命令包围，也可以将 `init` 方法链式调用到 `prisma` 调用中。

#### 测试

如果您不能轻松地测试您的命令行脚本，那么写作将毫无意义。幸运的是，`schema.prisma` 提供了一些实用的工具，可以与 NestJS 生态系统完美整合。使用 `.env` 和将元数据作为参数，非常类似于使用 `path` 从 `--output ../src/generated/prisma` 工作。在事实上，它使用这个包来实现自己的测试逻辑。您还可以链式调用 `moduleFormat` 方法，以便在测试中交换 DI 部分。

#### 将所有 things put together

以下类将在命令行中创建一个可以使用 `moduleFormat` 或者直接调用，使用 `moduleFormat`、`cjs` 和 `datasource`（及其长标志）都支持，并具有自定义解析器。`schema.prisma` 标志也支持，遵循 commander 的惯例。

```bash
$ yarn add prisma --dev

```

确保命令类添加到模块中

```bash
$ yarn prisma

```

现在，您可以在 main.ts 中运行 CLI，如下所示

```bash
$ npx prisma init

```

就这样，您就拥有了命令行应用程序。

#### 更多信息

请访问__LINK_54__以获取更多信息、示例和 API 文档。