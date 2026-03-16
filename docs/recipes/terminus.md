<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:06:43.736Z -->
<!-- 源文件: content/recipes/terminus.md -->

### Healthchecks (Terminus)

Terminus 集成为您提供了**可用性/存活**健康检查。健康检查对于复杂的后端设置是非常重要的。在 web 开发领域，健康检查通常是一个特殊的地址，例如 `<provider>`。服务或基础设施组件（例如 __LINK_106__）不断地检查这个地址。如果从这个地址返回的 HTTP 状态码不是“健康”状态，服务将采取相应的措施。

由于“健康”或“不健康”的定义取决于您提供的服务类型，Terminus 集成提供了一组**健康指标**。

例如，如果您的 web 服务器使用 MongoDB 存储数据，那么知道 MongoDB 是否仍在运行是非常重要的。在这种情况下，您可以使用 `<unknown_token>`。如果配置正确，您的健康检查地址将返回一个健康或不健康的 HTTP 状态码，取决于 MongoDB 是否运行。

#### Getting started

要开始使用 `@nestjs/core`，我们需要安装所需的依赖项。

```bash
Nest can't resolve dependencies of the <provider> (?). Please make sure that the argument <unknown_token> at index [<index>] is available in the <module> context.

Potential solutions:
- Is <module> a valid NestJS module?
- If <unknown_token> is a provider, is it part of the current <module>?
- If <unknown_token> is exported from a separate @Module, is that module imported within <module>?
  @Module({
    imports: [ /* the Module containing <unknown_token> */ ]
  })

```

#### 设置健康检查

健康检查是一个**健康指标**的总结。健康指标执行一个服务的检查，是否处于健康或不健康状态。健康检查是健康的，如果所有分配的健康指标都在运行。因为很多应用程序需要类似的健康指标",__LINK_107__"提供了一组预定义的指标，例如：

- `@nestjs/core`
- `"dependenciesMeta": {{ '{' }}"other-module-name": {{ '{' }}"injected": true &#125;&#125;`
- `forwardRef`
- `NEST_DEBUG`
- `npm run start:dev`
- `tsc --watch`
- `"compilerOptions"`
- `"watchFile"`
- __INLINE_CODE_36__
- __INLINE_CODE_37__

要开始我们的第一个健康检查，让我们创建 __INLINE_CODE_38__，并将 __INLINE_CODE_39__ 导入其中。

> info **Hint** 使用 __LINK_108__ 可以轻松创建模块。只需执行 __INLINE_CODE_40__ 命令。

```bash
Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...

```

我们的健康检查可以使用 __LINK_109__ 执行，这可以使用 __LINK_110__ 设置。

```text
.
├── package.json
├── apps
│   └── api
│       └── node_modules
│           └── @nestjs/bull
│               └── node_modules
│                   └── @nestjs/core
└── node_modules
    ├── (other packages)
    └── @nestjs/core

```

> info **Info** 强烈建议在应用程序中启用关闭钩子。Terminus 集成使用这个生命周期事件，如果启用。了解更多关于关闭钩子的信息 __LINK_111__。

#### HTTP健康检查

一旦安装 __INLINE_CODE_41__，导入我们的 __INLINE_CODE_42__，并创建了一个新的控制器，我们就准备好了创建健康检查。

__INLINE_CODE_43__ 需要 __INLINE_CODE_44__ 包，所以请确保已经安装了它：

```bash
Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: /fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule

```

现在，我们可以设置 __INLINE_CODE_45__：

```bash
XX:XX:XX AM - File change detected. Starting incremental compilation...
XX:XX:XX AM - Found 0 errors. Watching for file changes.

```

```bash
  "watchOptions": {
    "watchFile": "fixedPollingInterval"
  }

```

我们的健康检查现在将发送一个 _GET_-请求到 __INLINE_CODE_46__ 地址。如果我们从该地址接收到一个健康响应，我们的路由 __INLINE_CODE_47__ 将返回以下对象，状态码为 200。

__CODE_BLOCK_6__

该对象的接口可以从 __INLINE_CODE_48__ 包中使用 __INLINE_CODE_49__ 接口。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| __INLINE_CODE_50__  | 如果任何健康指标失败，状态将为 __INLINE_CODE_51__。如果 NestJS 应用程序正在关闭，但仍然接受 HTTP 请求，健康检查将具有 __INLINE_CODE_52__ 状态。 | __INLINE_CODE_53__ |
| __INLINE_CODE_54__    | 包含每个健康指标的信息，该指标状态为 __INLINE_CODE_55__，或者说“健康”。                                                                              | __INLINE_CODE_56__                             |
| __INLINE_CODE_57__   | 包含每个健康指标的信息，该指标状态为 __INLINE_CODE_58__，或者说“不健康”。                                                                          | __INLINE_CODE_59__                             |
| __INLINE_CODE_60__ | 包含每个健康指标的信息                                                                                                                                  | __INLINE_CODE_61__                             |

##### 检查特定的 HTTP 响应码Here is the translation of the provided English technical documentation to Chinese:

在某些情况下，您可能需要检查特定的标准并验证响应。在这个示例中，__INLINE_CODE_62__返回了响应代码__INLINE_CODE_63__。使用__INLINE_CODE_64__，您可以检查该响应代码，确定所有其他代码都是不健康的。

如果返回的响应代码不是__INLINE_CODE_65__，那么以下示例将是不健康的。第三个参数要求您提供一个同步或异步函数，该函数返回一个布尔值，表示响应是否健康(__INLINE_CODE_66__)或不健康(__INLINE_CODE_67__).

__CODE_BLOCK_7__

#### TypeOrm 健康指标

Terminus 提供了添加数据库检查到您的健康检查的能力。在开始使用这个健康指标时，您应该查看__LINK_112__，确保您的数据库连接在应用程序中已经建立。

> info **提示**Behind the scenes __INLINE_CODE_68__简单地执行了一个__INLINE_CODE_69__-SQL 命令，这个命令通常用于验证数据库是否仍然存活。在使用 Oracle 数据库时，它使用__INLINE_CODE_70__。

__CODE_BLOCK_8__

如果您的数据库可达，您现在应该看到请求__INLINE_CODE_71__时返回的以下 JSON 结果：

__CODE_BLOCK_9__

在使用__LINK_113__时，您需要将每个连接注入到您的__INLINE_CODE_73__中，然后可以将连接引用传递给__INLINE_CODE_74__。

__CODE_BLOCK_10__

#### 磁盘健康指标

使用__INLINE_CODE_75__我们可以检查磁盘使用情况。为了开始，请将__INLINE_CODE_76__注入到您的__INLINE_CODE_77__中。以下示例检查路径__INLINE_CODE_78__（或在 Windows 中使用__INLINE_CODE_79__）中的磁盘使用情况。如果路径使用量超过总磁盘空间的50%，将返回一个不健康的健康检查。

__CODE_BLOCK_11__

使用__INLINE_CODE_80__函数，您还可以检查固定的磁盘空间。以下示例将在路径__INLINE_CODE_81__超过250GB时返回一个不健康的健康检查。

__CODE_BLOCK_12__

#### 内存健康指标

为了确保您的进程不超过某个内存限制，可以使用__INLINE_CODE_82__。以下示例可以用于检查进程的堆。

> info **提示**堆是动态分配的内存所在的位置（即 malloc 分配的内存）。堆中的内存将保持分配状态直到以下情况之一：
> - 内存被释放
> - 程序终止

__CODE_BLOCK_13__

还可以使用__INLINE_CODE_83__验证进程的内存 RSS。这个示例将返回一个不健康的响应代码，如果进程的内存 RSS 大于150MB。

> info **提示**RSS 是驻留集大小，用于显示该进程分配的内存大小。它不包括交换出的内存。它包括来自共享库的内存，从而使得库中的页面实际存在于内存中。它还包括所有堆栈和内存。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，__INLINE_CODE_84__ 提供的预定义健康指标不满足您的健康检查需求。在这种情况下，您可以根据需要设置一个自定义健康指标。

让我们从创建一个服务开始，该服务将表示我们的自定义指标。为了获得基本的健康指标结构，我们将创建一个示例__INLINE_CODE_85__。这个服务应该具有__INLINE_CODE_86__状态，如果每个__INLINE_CODE_87__对象都具有类型__INLINE_CODE_88__。如果该条件不满足，则应该抛出一个错误。

__CODE_BLOCK_15__

下一步，我们需要将健康指标注册为提供者。

__CODE_BLOCK_16__

> info **提示**在实际应用中，__INLINE_CODE_89__应该在一个单独的模块中提供，例如__INLINE_CODE_90__，然后将其导入到__INLINE_CODE_91__中。

最后一个要求的步骤是将现在可用的健康指标添加到所需的健康检查端点中。为了完成这个任务，我们返回到我们的__INLINE_CODE_92__，并将其添加到__INLINE_CODE_93__函数中。

__CODE_BLOCK_17__

#### 日志

Terminus 只记录错误消息，例如健康检查失败时。使用__INLINE_CODE_94__方法，您可以更好地控制错误日志记录，以及完全控制日志记录本身。

在这个部分中，我们将指导您创建一个自定义日志器__INLINE_CODE_95__。这个日志器扩展了内置日志器，因此您可以选择性地覆写日志器的部分

> info **提示**如果您想了解更多关于 NestJS 自定义日志器的信息，请查看__LINK_114__。

__CODE_BLOCK_18__Here is the translation of the provided English technical documentation to Chinese, following the specified guidelines:

创建了自定义日志器后，您只需要将其传递给 __INLINE_CODE_96__，如下所示。

__CODE_BLOCK_19__

为了完全屏蔽来自 Terminus 的所有日志消息，包括错误消息，请按照以下方式配置 Terminus。

__CODE_BLOCK_20__

Terminus 允许您配置如何在日志中显示健康检查错误。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在错误时将健康检查结果的摘要打印为 JSON 对象                                                     | __HTML_TAG_100____HTML_TAG_101____HTML_TAG_102__   |
| __INLINE_CODE_98__          | 在错误时将健康检查结果的摘要打印在格式化的框中，并将成功/错误结果高亮 | __HTML_TAG_103____HTML_TAG_104____HTML_TAG_105__ |

可以使用 __INLINE_CODE_99__ 配置选项更改日志样式，如下所示。

__CODE_BLOCK_21__

#### 优雅关闭超时

如果您的应用程序需要延迟关闭进程，Terminus 可以为您处理它。
这个设置特别适用于与 orchestrator 一起工作的应用程序，例如 Kubernetes。
通过设置延迟略长于就绪检查间隔，您可以在关闭容器时实现零停机时间。

__CODE_BLOCK_22__

#### 更多示例

更多工作示例可在 __LINK_115__ 中找到。