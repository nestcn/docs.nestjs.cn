<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:34:56.205Z -->
<!-- 源文件: content/recipes/terminus.md -->

### 健康检查（Terminus）

Terminus集成为您提供了**就绪性/存活性**健康检查。健康检查对于复杂的后端设置至关重要。在 web 开发领域，健康检查通常由一个特殊的地址组成，例如 `"node"`。服务或组件（例如 __LINK_106__）不断地检查这个地址。如果从这个地址返回的 HTTP 状态代码不是健康状态，服务将采取相应的操作。

由于“健康”或“不健康”的定义取决于您提供的服务类型，Terminus集成支持了一组**健康指标**。

例如，如果您的 web 服务器使用 MongoDB 存储数据，那么确定 MongoDB 是否在运行将是非常重要的。在这种情况下，您可以使用 `MiddlewareConsumer`。如果配置正确（后续将详细介绍），您的健康检查地址将返回健康或不健康的 HTTP 状态代码，取决于 MongoDB 是否在运行。

#### 开始使用

要开始使用 `@nestjs/platform-fastify`，我们需要安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}

```

#### 设置健康检查

健康检查表示**健康指标**的总结。健康指标执行对服务的检查，是否处于健康或不健康状态。健康检查是positive，如果所有分配的健康指标都在运行。由于许多应用程序将需要相似的健康指标， __LINK_107__ 提供了一组预定义的指标，例如：

- `@nestjs/graphql`
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__
- __INLINE_CODE_32__
- __INLINE_CODE_33__
- __INLINE_CODE_34__
- __INLINE_CODE_35__
- __INLINE_CODE_36__
- __INLINE_CODE_37__

要开始使用我们的第一个健康检查，让我们创建 __INLINE_CODE_38__ 并将 __INLINE_CODE_39__.import 到其 imports 数组中。

> info **提示** 使用 __LINK_108__ 创建模块，执行 __INLINE_CODE_40__ 命令。

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);

```

我们的健康检查可以使用 __LINK_109__ 运行，这可以使用 __LINK_110__ 设置。

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

```

> info **信息** 强烈建议在应用程序中启用关闭 hooks。Terminus 集成使用这个生命周期事件，如果启用。阅读更多关于关闭 hooks 的信息 __LINK_111__。

#### HTTP 健康检查

一旦我们安装了 __INLINE_CODE_41__，import 了我们的 __INLINE_CODE_42__，创建了新的控制器，我们就准备好了创建健康检查。

__INLINE_CODE_43__ 需要 __INLINE_CODE_44__ 包所以确保已经安装：

```bash
> Load "LazyModule" attempt: 1
> time: 2.379ms
> Load "LazyModule" attempt: 2
> time: 0.294ms
> Load "LazyModule" attempt: 3
> time: 0.303ms
> ```

现在我们可以设置 __INLINE_CODE_45__：

```typescript
@Module({
  providers: [LazyService],
  exports: [LazyService],
})
export class LazyModule {}

```

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

const { LazyService } = await import('./lazy.service');
const lazyService = moduleRef.get(LazyService);

```

我们的健康检查现在将发送一个 _GET_-请求到 __INLINE_CODE_46__ 地址。如果从这个地址返回的健康响应，我们的路由 __INLINE_CODE_47__ 将返回以下对象，状态码为 200。

```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```

这个响应对象的接口可以从 __INLINE_CODE_48__ 包中访问 __INLINE_CODE_49__ 接口。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| __INLINE_CODE_50__  | 如果任何健康指标失败，状态将是 __INLINE_CODE_51__。如果 NestJS 应用程序正在关闭但仍然接受 HTTP 请求，健康检查将有 __INLINE_CODE_52__ 状态。 | __INLINE_CODE_53__ |
| __INLINE_CODE_54__    | 包含每个健康指标状态信息的对象，这些指标状态为 __INLINE_CODE_55__，或换言之“健康”。                                                                                        | __INLINE_CODE_56__                             |
| __INLINE_CODE_57__   | 包含每个健康指标状态信息的对象，这些指标状态为 __INLINE_CODE_58__，或换言之“不健康”。                                                                                    | __INLINE_CODE_59__                             |
| __INLINE_CODE_60__ | 包含每个健康指标状态信息的对象                                                                                                                                  | __INLINE_CODE_61__                             |

##### 检查特定 HTTP 响应代码Here is the translation of the English technical documentation to Chinese, following the provided rules:

在某些情况下，您可能需要根据特定的riterion验证响应。例如，__INLINE_CODE_62__可能返回响应代码__INLINE_CODE_63__。使用__INLINE_CODE_64__可以对该响应代码进行特定的验证，并确定所有其他代码为不健康。

如果除了__INLINE_CODE_65__之外的任何其他响应代码被返回，该示例将被视为不健康。第三个参数需要您提供一个同步或异步函数，返回一个布尔值，表示响应是否被认为是健康(__INLINE_CODE_66__)或不健康(__INLINE_CODE_67__)。

__CODE_BLOCK_7__

#### TypeOrm健康指标

Terminus 提供了数据库检查的能力，以便将其添加到您的健康检查中。在开始使用此健康指标时，您应该查看__LINK_112__，确保您的数据库连接在您的应用程序中已建立。

> info **提示**背后，__INLINE_CODE_68__只是执行了__INLINE_CODE_69__-SQL命令，这个命令通常用于验证数据库是否仍然活着。在使用 Oracle 数据库时，它使用__INLINE_CODE_70__。

__CODE_BLOCK_8__

如果您的数据库是可达的，您现在应该在请求__INLINE_CODE_71__时看到以下 JSON 结果：

__CODE_BLOCK_9__

在使用__LINK_113__时，您需要将每个连接注入到您的__INLINE_CODE_73__中。然后，您可以简单地将连接引用传递给__INLINE_CODE_74__。

__CODE_BLOCK_10__

#### 硬盘健康指标

使用__INLINE_CODE_75__我们可以检查存储空间的使用率。要开始使用，确保将__INLINE_CODE_76__注入到您的__INLINE_CODE_77__中。以下示例检查了__INLINE_CODE_78__路径（或在 Windows 上，您可以使用__INLINE_CODE_79__）中的存储空间使用率。如果该路径超过总存储空间的 50%，将返回一个不健康的 Health Check。

__CODE_BLOCK_11__

使用__INLINE_CODE_80__函数，您还可以检查固定数量的存储空间。以下示例将在__INLINE_CODE_81__路径超过 250GB 时被视为不健康。

__CODE_BLOCK_12__

#### 内存健康指标

为了确保您的进程不超过某个内存限制，__INLINE_CODE_82__可以被使用。以下示例可以用于检查进程的堆。

> info **提示**堆是动态分配的内存所在的部分（即使用 malloc 分配的内存）。堆上的内存将保持分配状态，直到以下情况之一发生：
> - 内存被_free_
> - 程序终止

__CODE_BLOCK_13__

还可以使用__INLINE_CODE_83__验证进程的内存 RSS。该示例将在进程超过 150MB 分配内存时返回不健康的响应代码。

> info **提示**RSS 是进程的 Resident Set Size，用于显示进程所分配的内存大小。它不包括交换出内存。它包括来自共享库的内存，因为这些库的页面实际上在内存中。它包括所有栈和堆内存。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，__INLINE_CODE_84__提供的预定义健康指标可能不能涵盖所有您的健康检查需求。在这种情况下，您可以根据需要设置自定义健康指标。

让我们开始创建一个服务，该服务将代表我们的自定义指标。为了了解指标的结构，我们将创建一个基本示例__INLINE_CODE_85__。该服务应该在每个__INLINE_CODE_87__对象都具有__INLINE_CODE_88__类型时具有状态__INLINE_CODE_86__。如果该条件不满足，则应该抛出错误。

__CODE_BLOCK_15__

下一步，我们需要注册健康指标作为提供者。

__CODE_BLOCK_16__

> info **提示**在实际应用程序中，__INLINE_CODE_89__应该在单独的模块中提供，例如__INLINE_CODE_90__，然后被__INLINE_CODE_91__导入。

最后一个必需的步骤是将现在可用的健康指标添加到所需的健康检查端点中。为了实现这一点，我们回到__INLINE_CODE_92__，并将其添加到__INLINE_CODE_93__函数中。

__CODE_BLOCK_17__

#### 记录

Terminus 只记录错误信息，例如，当健康检查失败时。使用__INLINE_CODE_94__方法，您可以拥有更多对错误日志的控制权，以及完全控制日志本身。

在本节中，我们将向您展示如何创建一个自定义 logger__INLINE_CODE_95__。该 logger 扩展了内置 logger。
因此，您可以选择性地覆盖 logger 的部分

> info **提示**如果您想了解更多关于 NestJS 自定义 logger 的信息，__LINK_114__。

__CODE_BLOCK_18__

Note: I followed the provided glossary and translated the technical terms accordingly. I also preserved the code examples, variable names, function names, and formatting unchanged.Here is the translation of the English technical documentation to Chinese:

一旦创建了自定义日志记录器，只需要简单地将其传递给 __INLINE_CODE_96__，如下所示。

__CODE_BLOCK_19__

要完全抑制来自 Terminus 的所有日志消息，包括错误消息，配置 Terminus 如下所示。

__CODE_BLOCK_20__

Terminus 允许您配置健康检查错误的日志显示方式。

| 错误日志样式         | 描述                                                                                                                         | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在错误情况下将健康检查结果的摘要打印为 JSON 对象                                                     | __HTML_TAG_100____HTML_TAG_101____HTML_TAG_102__   |
| __INLINE_CODE_98__          | 在错误情况下将健康检查结果的摘要打印到格式化的框中，并高亮成功或错误的结果 | __HTML_TAG_103____HTML_TAG_104____HTML_TAG_105__ |

可以使用 __INLINE_CODE_99__ 配置选项更改日志样式，如以下代码片段所示。

__CODE_BLOCK_21__

#### 优雅关闭超时

如果您的应用程序需要延迟关闭过程，Terminus 可以为您处理。这项设置对使用 orchestrator，如 Kubernetes 时尤其有用。通过将延迟设置为略高于就绪检查间隔，您可以实现零停机时关闭容器。

__CODE_BLOCK_22__

#### 更多示例

更多工作示例可在 __LINK_115__ 中找到。