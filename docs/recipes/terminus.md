<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:38:30.661Z -->
<!-- 源文件: content/recipes/terminus.md -->

### Healthchecks (Terminus)

Terminus 集成提供了读取性/存活性健康检查。健康检查对于复杂的后端设置非常重要。在 Web 发展领域中，健康检查通常由一个特殊的地址组成，例如 `"node"`。服务或基础设施的组件（例如 __LINK_106__）将不断检查这个地址。根据从该地址返回的 HTTP 状态码，服务将根据情况采取行动，当接收到“不健康”的响应时。

由于“健康”或“不健康”的定义随着提供的服务类型而不同，Terminus 集成支持了一组健康指标。

例如，如果您的 Web 服务器使用 MongoDB 存储数据，那么是否 MongoDB 正在运行将是非常重要的信息。在这种情况下，您可以使用 `MiddlewareConsumer`。如果配置正确 - 详细信息将在后续中介绍 - 您的健康检查地址将返回一个健康或不健康的 HTTP 状态码，取决于 MongoDB 是否正在运行。

#### Getting started

要开始使用 `@nestjs/platform-fastify`，我们需要安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}

```

#### 设置健康检查

健康检查代表了健康指标的总结。健康指标执行对服务的检查，是否处于健康或不健康状态。健康检查是正面的，如果所有分配的健康指标都处于运行状态。由于许多应用程序需要类似的健康指标，__LINK_107__ 提供了一组预定义的指标，例如：

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

要开始使用我们的第一个健康检查，让我们创建 __INLINE_CODE_38__ 并将 __INLINE_CODE_39__ 导入其中的 imports 数组。

> info **Hint** 创建模块使用 __LINK_108__，只需执行 __INLINE_CODE_40__ 命令。

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);

```

我们的健康检查可以使用 __LINK_109__ 执行，这可以使用 __LINK_110__ 显式设置。

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

```

> info **Info** 强烈建议在应用程序中启用关闭 hook。Terminus 集成使用了这个生命周期事件，如果启用了。了解更多关于关闭 hook 的信息 __LINK_111__。

#### HTTP Healthcheck

一旦我们安装了 __INLINE_CODE_41__，导入了我们的 __INLINE_CODE_42__ 并创建了新的控制器，我们就准备好了创建健康检查。

__INLINE_CODE_43__ 需要 __INLINE_CODE_44__ 包，所以确保已安装：

```bash
> Load "LazyModule" attempt: 1
> time: 2.379ms
> Load "LazyModule" attempt: 2
> time: 0.294ms
> Load "LazyModule" attempt: 3
> time: 0.303ms
> ```

现在我们可以设置我们的 __INLINE_CODE_45__：

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

我们的健康检查现在将向 __INLINE_CODE_46__ 地址发送一个 _GET_-请求。如果我们从该地址接收到健康响应，我们的路由 __INLINE_CODE_47__ 将返回以下对象，状态码为 200。

```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```

该响应对象的接口可以从 __INLINE_CODE_48__ 包中访问，使用 __INLINE_CODE_49__ 接口。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| __INLINE_CODE_50__  | 如果任何健康指标失败，状态将为 __INLINE_CODE_51__。如果 NestJS 应用程序正在关闭，但仍然接受 HTTP 请求，健康检查将具有 __INLINE_CODE_52__ 状态。 | __INLINE_CODE_53__ |
| __INLINE_CODE_54__    | 包含每个健康指标的信息，其中状态为 __INLINE_CODE_55__，或者换言之“健康”。                                                                              | __INLINE_CODE_56__                             |
| __INLINE_CODE_57__   | 包含每个健康指标的信息，其中状态为 __INLINE_CODE_58__，或者换言之“不健康”。                                                                          | __INLINE_CODE_59__                             |
| __INLINE_CODE_60__ | 包含每个健康指标的所有信息                                                                                                                                  | __INLINE_CODE_61__                             |

##### 检查特定的 HTTP 响应代码Here is the translated document:

在某些情况下，您可能需要根据特定的标准来验证响应。例如，让我们假设 __INLINE_CODE_62__ 返回了一个响应代码 __INLINE_CODE_63__。使用 __INLINE_CODE_64__ 可以对该响应代码进行特别检查，并确定其他代码为不健康。

如果返回的响应代码不是 __INLINE_CODE_65__，那么以下示例将被认为是 unhealthy。第三个参数需要提供一个函数（同步或异步），该函数返回一个布尔值，指示响应是否被认为是健康（__INLINE_CODE_66__）或不健康（__INLINE_CODE_67__）。

__CODE_BLOCK_7__

#### TypeOrm 健康指标

Terminus 提供了添加数据库检查到健康检查的能力。要开始使用这个健康指标，请查看 __LINK_112__，并确保在您的应用程序中数据库连接已经建立。

> 信息 **Hint** 在幕后，__INLINE_CODE_68__ 只是执行一个 __INLINE_CODE_69__-SQL 命令，这个命令通常用于验证数据库是否仍然活动。在使用 Oracle 数据库时，它使用 __INLINE_CODE_70__。

__CODE_BLOCK_8__

如果您的数据库可以访问，您现在应该看到请求 __INLINE_CODE_71__ 时返回的以下 JSON 结果：

__CODE_BLOCK_9__

如果您的应用程序使用 __LINK_113__，那么您需要将每个连接注入到您的 __INLINE_CODE_73__ 中。然后，您可以将连接引用传递给 __INLINE_CODE_74__。

__CODE_BLOCK_10__

#### 硬盘健康指标

使用 __INLINE_CODE_75__ 可以检查存储空间的使用情况。要开始使用，请确保将 __INLINE_CODE_76__ 注入到您的 __INLINE_CODE_77__ 中。以下示例检查路径 __INLINE_CODE_78__（或在 Windows 上可以使用 __INLINE_CODE_79__）所占用的存储空间。如果超过 50% 的总存储空间，它将返回 unhealthy Health Check。

__CODE_BLOCK_11__

使用 __INLINE_CODE_80__ 函数，您也可以检查固定的存储空间。以下示例将在路径 __INLINE_CODE_81__ 占用超过 250GB 时返回 unhealthy。

__CODE_BLOCK_12__

#### 内存健康指标

为了确保您的进程不超过某个内存限制，可以使用 __INLINE_CODE_82__。以下示例可以用来检查进程的堆大小。

> 信息 **Hint** 堆是动态分配的内存所在的portion（即使用 malloc 分配的内存）。这些内存将保持分配直到以下情况之一：
> - 内存被 _free_'d
> - 程序终止

__CODE_BLOCK_13__

您也可以使用 __INLINE_CODE_83__ 来验证进程的内存 RSS（Resident Set Size）。该示例将在进程占用超过 150MB 内存时返回 unhealthy。

> 信息 **Hint** RSS 是进程占用的内存大小，用于显示占用的内存大小。它不包括交换出的内存。它包括共享库中的内存，而这些内存实际上在内存中。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，Terminus 提供的预定义健康指标可能不能满足您的健康检查需求。在这种情况下，您可以根据需要设置一个自定义健康指标。

让我们从创建一个服务开始，该服务将代表我们的自定义指标。为了了解如何构建一个指标，我们将创建一个示例 __INLINE_CODE_85__。这个服务应该在每个 __INLINE_CODE_87__ 对象的 type 为 __INLINE_CODE_88__ 时具有状态 __INLINE_CODE_86__。如果该条件不满足，则它应该抛出错误。

__CODE_BLOCK_15__

下一步，我们需要将健康指标注册为提供者。

__CODE_BLOCK_16__

> 信息 **Hint** 在实际应用程序中，__INLINE_CODE_89__ 应该在一个单独的模块中提供，例如 __INLINE_CODE_90__，然后由 __INLINE_CODE_91__ 导入。

最后一个需要完成的步骤是将现在可用的健康指标添加到需要的健康检查端点中。为此，我们返回到我们的 __INLINE_CODE_92__ 并将其添加到 __INLINE_CODE_93__ 函数中。

__CODE_BLOCK_17__

#### 日志记录

Terminus 只记录错误信息，例如当 Healthcheck 失败时。使用 __INLINE_CODE_94__ 方法，您可以更好地控制错误的记录，以及完全控制记录本身。

在本部分，我们将展示如何创建一个自定义日志记录器 __INLINE_CODE_95__。这个日志记录器扩展了内置的日志记录器。因此，您可以选择性地覆盖日志记录的部分

> 信息 **Info** 如果您想了解更多关于 NestJS 自定义日志记录的信息，请查看 __LINK_114__。

__CODE_BLOCK_18__Here is the translation of the English technical documentation to Chinese:

一旦您创建了自定义日志器，只需要简单地将其传递给 __INLINE_CODE_96__ 如下所示。

__CODE_BLOCK_19__

要完全抑制来自 Terminus 的所有日志消息，包括错误消息，请将 Terminus 配置为以下所示。

__CODE_BLOCK_20__

Terminus 允许您配置如何在日志中显示 Healthcheck 错误。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在出现错误时将健康检查结果摘要以 JSON 对象形式打印                                                     | __HTML_TAG_100____HTML_TAG_101____HTML_TAG_102__   |
| __INLINE_CODE_98__          | 在出现错误时将健康检查结果摘要以格式化的框中打印，并将成功或错误的结果高亮 | __HTML_TAG_103____HTML_TAG_104____HTML_TAG_105__ |

您可以使用 __INLINE_CODE_99__ 配置选项更改日志样式，如以下代码片段所示。

__CODE_BLOCK_21__

#### 优雅关闭超时

如果您的应用程序需要推迟关闭进程，Terminus 可以为您处理。
这款设置对使用 Orchestrator 类似 Kubernetes 的情况特别有益。
通过设置延迟略长于就绪检查间隔，您可以实现零宕机情况关闭容器。

__CODE_BLOCK_22__

#### 更多示例

有更多的工作示例可在 __LINK_115__ 中找到。