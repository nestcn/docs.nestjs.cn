<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:17:12.025Z -->
<!-- 源文件: content/recipes/terminus.md -->

### Healthchecks (Terminus)

Terminus 集成为您提供了**readiness/liveness**健康检查。健康检查对于复杂的后端设置来说是非常重要的。在 web 开发领域中，健康检查通常是一种特殊的地址，例如`"node"`。服务或您的infrastructure组件（例如__LINK_106__）将不断地检查这个地址。如果从这个地址返回的 HTTP 状态代码不是“健康”，服务将采取相应的措施。

由于“健康”或“不健康”的定义取决于您提供的服务类型，Terminus 集成支持了一组**健康指标**。

例如，如果您的 web 服务器使用 MongoDB 存储数据，那么了解 MongoDB 是否仍然在运行是非常重要的。在这种情况下，您可以使用`MiddlewareConsumer`。如果配置正确 - 更多关于这方面的内容将在后面 -您的健康检查地址将返回一个健康或不健康的 HTTP 状态代码，取决于 MongoDB 是否在运行。

#### Getting started

要开始使用`@nestjs/platform-fastify`，我们需要安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}

```

#### 设置健康检查

健康检查表示**健康指标**的总结。健康指标执行服务的检查，判断其是否处于健康状态。健康检查是健康的，如果所有分配的健康指标都处于健康状态。由于许多应用程序将需要相似的健康指标，__LINK_107__ 提供了一组预定义的指标，例如：

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

要开始我们的第一个健康检查，让我们创建__INLINE_CODE_38__并将__INLINE_CODE_39__导入它的 imports 数组中。

> info **Hint** 使用__LINK_108__创建模块，只需执行__INLINE_CODE_40__命令。

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);

```

我们的健康检查可以使用__LINK_109__执行，这可以使用__LINK_110__轻松设置。

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

```

> info **Info** 强烈建议在您的应用程序中启用关闭 hooks。Terminus 集成使用这个生命周期事件，如果启用了。更多关于关闭 hooks 的信息请查看__LINK_111__。

#### HTTP健康检查

一旦我们安装了__INLINE_CODE_41__，导入了__INLINE_CODE_42__，创建了一个新的控制器，我们就可以创建健康检查。

__INLINE_CODE_43__ 需要__INLINE_CODE_44__包，所以请确保您已经安装了它：

```bash
> Load "LazyModule" attempt: 1
> time: 2.379ms
> Load "LazyModule" attempt: 2
> time: 0.294ms
> Load "LazyModule" attempt: 3
> time: 0.303ms
> ```

现在我们可以设置__INLINE_CODE_45__：

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

我们的健康检查现在将发送一个GET请求到__INLINE_CODE_46__地址。如果我们从该地址收到一个健康响应，我们的路由__INLINE_CODE_47__将返回以下对象的200状态代码。

```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```

这个响应对象的接口可以从__INLINE_CODE_48__包中访问，使用__INLINE_CODE_49__接口。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| __INLINE_CODE_50__  | 如果任何健康指标失败，状态将是__INLINE_CODE_51__。如果 NestJS 应用程序正在关闭，但仍然接受 HTTP 请求，健康检查将具有__INLINE_CODE_52__状态。 | __INLINE_CODE_53__ |
| __INLINE_CODE_54__    | 包含每个健康指标信息的对象，其中每个指标状态为__INLINE_CODE_55__，或换言之“健康”。                                                                              | __INLINE_CODE_56__                             |
| __INLINE_CODE_57__   | 包含每个健康指标信息的对象，其中每个指标状态为__INLINE_CODE_58__，或换言之“不健康”。                                                                          | __INLINE_CODE_59__                             |
| __INLINE_CODE_60__ | 包含所有健康指标信息的对象                                                                                                                                  | __INLINE_CODE_61__                             |

##### 检查特定 HTTP 响应代码Here is the translation of the given English technical documentation to Chinese, following the provided guidelines:

某些情况下，您可能需要检查特定标准并验证响应。例如，__INLINE_CODE_62__返回响应代码__INLINE_CODE_63__。使用__INLINE_CODE_64__可以检查该响应代码，并确定所有其他代码为不健康。

如果返回除了__INLINE_CODE_65__之外的任何响应代码，该示例将被视为不健康。第三个参数需要您提供一个同步或异步函数，该函数返回一个布尔值，确定响应是否健康(__INLINE_CODE_66__)或不健康(__INLINE_CODE_67__）。

__CODE_BLOCK_7__

#### TypeOrm健康指标

Terminus 提供了对数据库检查的能力，以便将其添加到您的健康检查中。要开始使用该健康指标，请查看 __LINK_112__ 并确保在应用程序中建立了数据库连接。

> info **提示**在幕后，__INLINE_CODE_68__只是执行一个__INLINE_CODE_69__-SQL 命令，这通常用于验证数据库是否仍然存活。在使用 Oracle 数据库时，它使用 __INLINE_CODE_70__。

__CODE_BLOCK_8__

如果数据库可达，您现在应该看到在请求 __INLINE_CODE_71__ 时，使用 __INLINE_CODE_72__ 请求的以下 JSON 结果：

__CODE_BLOCK_9__

#### 硬盘健康指标

使用 __INLINE_CODE_75__，我们可以检查存储使用情况。要开始使用，请将 __INLINE_CODE_76__ 注入到您的 __INLINE_CODE_77__ 中。以下示例检查路径 __INLINE_CODE_78__（或在 Windows 中使用 __INLINE_CODE_79__）中的存储使用情况。如果超过总存储空间的 50%，将返回一个不健康的健康检查。

__CODE_BLOCK_11__

使用 __INLINE_CODE_80__ 函数，您也可以检查固定存储空间。以下示例在路径 __INLINE_CODE_81__ 中超过 250GB 时将被视为不健康。

__CODE_BLOCK_12__

#### 内存健康指标

要确保您的进程不超过某个内存限制，可以使用 __INLINE_CODE_82__。以下示例可以用于检查进程的堆。

> info **提示**堆是动态分配的内存的部分（即使用 malloc 分配的内存）。动态分配的内存将保持分配直到发生以下情况之一：
> - 内存被释放
> - 程序终止

__CODE_BLOCK_13__

还可以使用 __INLINE_CODE_83__ 验证进程的内存 RSS。该示例将在进程占用超过 150MB 内存时返回不健康的响应代码。

> info **提示** RSS 是进程的驻留集大小，用于显示该进程分配的内存大小，并且它在 RAM 中。它不包括交换出内存。它包括共享库的内存，只要它们的页面实际在内存中。它还包括所有堆栈和内存。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，__INLINE_CODE_84__ 提供的预定义健康指标不足以满足您的健康检查需求。在这种情况下，您可以设置根据您的需求自定义健康指标。

让我们创建一个服务，该服务将代表我们的自定义指标。为了获得基本了解指标的结构，我们将创建一个示例 __INLINE_CODE_85__。该服务应该在每个 __INLINE_CODE_87__ 对象都具有类型 __INLINE_CODE_88__ 时具有状态 __INLINE_CODE_86__。如果该条件不满足，则它应该抛出错误。

__CODE_BLOCK_15__

下一步是注册健康指标作为提供者。

__CODE_BLOCK_16__

#### 记录

Terminus 只记录错误信息，例如当健康检查失败时。使用 __INLINE_CODE_94__ 方法，您可以更好地控制错误记录，并且完全控制记录本身。

在本节中，我们将指导您创建一个自定义记录器 __INLINE_CODE_95__。该记录器扩展了内置记录器，因此您可以选择性地覆盖记录器的部分。

> info **信息**如果您想了解更多关于 NestJS 自定义记录器的信息，请查看 __LINK_114__。

__CODE_BLOCK_18__

Note: I have kept the placeholders (e.g., __INLINE_CODE_62__, __LINK_112__) unchanged as per the guidelines.Here is the translation of the English technical documentation to Chinese:

一旦您创建了自定义日志记录器，只需将其传递给 __INLINE_CODE_96__如下所示。

__CODE_BLOCK_19__

要完全抑制来自 Terminus 的所有日志消息，包括错误消息，请按照以下方式配置 Terminus。

__CODE_BLOCK_20__

Terminus 允许您配置健康检查错误如何在日志中显示。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在出现错误时将健康检查结果的摘要以 JSON 对象形式打印出来                                                     | __HTML_TAG_100____HTML_TAG_101____HTML_TAG_102__   |
| __INLINE_CODE_98__          | 在出现错误时将健康检查结果的摘要以格式化的框中和突出显示成功和错误结果 | __HTML_TAG_103____HTML_TAG_104____HTML_TAG_105__ |

您可以使用 __INLINE_CODE_99__ 配置选项更改日志样式，如下面的代码片段所示。

__CODE_BLOCK_21__

#### 和平关机超时

如果您的应用程序需要推迟关机过程，Terminus 可以为您处理。这项设置尤其有利于与 Kubernetes 等编排器一起工作。
将延迟设为 readiness 检查间隔的略微长些，可以实现零宕机时关闭容器。

__CODE_BLOCK_22__

#### 更多示例

有更多的工作示例可在 __LINK_115__ 中找到。