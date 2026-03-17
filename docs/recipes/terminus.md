<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:11:02.655Z -->
<!-- 源文件: content/recipes/terminus.md -->

### Healthchecks (Terminus)

Terminus_integration 提供了 **readiness/liveness** 健康检查。健康检查对于复杂的后端设置来说是非常重要的。在 Web 开发领域中，健康检查通常是一个特殊的地址，例如 `"node"`。服务或基础设施组件（例如 __LINK_106__）会不断地检查这个地址。根据从这个地址返回的 HTTP 状态码，服务将根据情况采取行动。

由于“健康”或“不健康”的定义取决于服务类型，Terminus 集成支持了一组 **health indicators**。

例如，如果您的 Web 服务器使用 MongoDB 存储数据，那么了解 MongoDB 是否仍在运行是非常重要的。在这种情况下，您可以使用 `MiddlewareConsumer`。如果正确配置了该地址，您的健康检查地址将返回健康或不健康的 HTTP 状态码，取决于 MongoDB 是否运行。

#### Getting started

要开始使用 `@nestjs/platform-fastify`，我们需要安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}

```

#### 设置健康检查

健康检查是一个 **health indicators** 的摘要。健康指标执行服务的检查，判断是否处于健康或不健康状态。健康检查是positive，如果分配的所有健康指标都正常运行。由于许多应用程序需要类似的健康指标，__LINK_107__ 提供了一组预定义的指标，例如：

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

要开始使用我们的第一个健康检查，让我们创建 __INLINE_CODE_38__ 并将 __INLINE_CODE_39__ 导入到其 imports 数组中。

> 信息 **Hint** 使用 __LINK_108__ 创建模块，只需执行 __INLINE_CODE_40__ 命令。

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);

```

我们的健康检查可以使用 __LINK_109__ 执行，这可以使用 __LINK_110__ 设置。

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

```

> 信息 **Info** 强烈建议在应用程序中启用关闭 hook。Terminus 集成使用这个生命周期事件，如果启用了。阅读更多关于关闭 hook 的信息 __LINK_111__。

#### HTTP 健康检查

现在我们已经安装 __INLINE_CODE_41__、导入了 __INLINE_CODE_42__ 和创建了新的控制器，我们准备创建健康检查。

__INLINE_CODE_43__ 需要 __INLINE_CODE_44__ 包，所以确保安装了该包：

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

我们的健康检查现在将发送一个 _GET_-请求到 __INLINE_CODE_46__ 地址。如果我们从该地址收到健康响应，路由 __INLINE_CODE_47__ 将返回以下对象，状态码为 200。

```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```

这个响应对象的界面可以从 __INLINE_CODE_48__ 包中使用 __INLINE_CODE_49__界面。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| __INLINE_CODE_50__  | 如果任何健康指标失败，状态将是 __INLINE_CODE_51__。如果 NestJS 应用程序正在关闭，但仍然接受 HTTP 请求，健康检查将具有 __INLINE_CODE_52__ 状态。 | __INLINE_CODE_53__ |
| __INLINE_CODE_54__    | 包含每个健康指标信息的对象，其中每个指标的状态为 __INLINE_CODE_55__，或者说“健康”。                                                                              | __INLINE_CODE_56__                             |
| __INLINE_CODE_57__   | 包含每个健康指标信息的对象，其中每个指标的状态为 __INLINE_CODE_58__，或者说“不健康”。                                                                          | __INLINE_CODE_59__                             |
| __INLINE_CODE_60__ | 包含每个健康指标信息的对象                                                                                                                                  | __INLINE_CODE_61__                             |

##### 检查特定的 HTTP 响应代码Here is the translation of the English technical documentation to Chinese:

某些情况下，您可能需要检查特定的标准并验证响应。例如，__INLINE_CODE_62__ 可能返回 __INLINE_CODE_63__ 响应代码。使用 __INLINE_CODE_64__ 可以检查该响应代码，确定所有其他代码均为不健康。

如果返回的响应代码不是 __INLINE_CODE_65__，则以下示例将被视为不健康。第三个参数要求您提供一个同步或异步函数，该函数返回一个布尔值，指示响应是否健康（__INLINE_CODE_66__）或不健康（__INLINE_CODE_67__）。

__CODE_BLOCK_7__

#### TypeOrm 健康指标

Terminus 提供了添加数据库检查到健康检查的能力。在开始使用该健康指标时，请查看 __LINK_112__ 并确保您的数据库连接在应用程序中已建立。

> info **提示** Behind the scenes，__INLINE_CODE_68__ 只是执行一个 __INLINE_CODE_69__-SQL 命令，该命令通常用于验证数据库是否仍然活动。在使用 Oracle 数据库时，它使用 __INLINE_CODE_70__。

__CODE_BLOCK_8__

如果您的数据库可达，请求 __INLINE_CODE_71__ 时，您应该看到以下 JSON 结果：

__CODE_BLOCK_9__

如果您的应用程序使用 __LINK_113__，则需要将每个连接 injected 到您的 __INLINE_CODE_73__ 中，然后可以将连接引用传递给 __INLINE_CODE_74__。

__CODE_BLOCK_10__

#### 硬盘健康指标

使用 __INLINE_CODE_75__ 可以检查硬盘使用情况。要开始使用，请确保将 __INLINE_CODE_76__ injected 到您的 __INLINE_CODE_77__ 中。以下示例检查路径 __INLINE_CODE_78__（或在 Windows 上使用 __INLINE_CODE_79__）使用的存储空间。如果该路径超过总存储空间的 50%，将返回不健康的健康检查结果。

__CODE_BLOCK_11__

使用 __INLINE_CODE_80__ 函数，您还可以检查固定存储空间。以下示例将在路径 __INLINE_CODE_81__ 超过 250GB 时返回不健康结果。

__CODE_BLOCK_12__

#### 内存健康指标

为了确保您的进程不超过某个内存限制，可以使用 __INLINE_CODE_82__。以下示例可以用于检查进程的堆。

> info **提示** 堆是动态分配的内存的portion，即通过 malloc 分配的内存。在堆上分配的内存直到以下情况之一被释放：
> - 内存被 _free_ 掉
> - 程序终止

__CODE_BLOCK_13__

您还可以使用 __INLINE_CODE_83__ 验证进程的内存 RSS。这示例将在进程的内存超过 150MB 时返回不健康结果。

> info **提示** RSS 是进程的 Resident Set Size，用于显示该进程分配的内存大小。它不包括交换出的内存。它包括共享库中的内存，因为该库中的页实际上在内存中。如果该库中的页不在内存中，它将不包括该页。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，__INLINE_CODE_84__ 提供的预定义健康指标可能无法满足您的健康检查要求。在这种情况下，您可以根据需要设置自定义健康指标。

让我们从创建一个服务开始，该服务将代表我们的自定义指标。为了获得基本的健康指标结构理解，我们将创建一个示例 __INLINE_CODE_85__。该服务应该具有 __INLINE_CODE_86__ 状态，如果每个 __INLINE_CODE_87__ 对象都具有类型 __INLINE_CODE_88__。如果该条件不满足，则它应该抛出错误。

__CODE_BLOCK_15__

下一步，我们需要将健康指标注册为提供者。

__CODE_BLOCK_16__

> info **提示** 在实际应用程序中，__INLINE_CODE_89__ 应该在单独的模块中提供，例如 __INLINE_CODE_90__，然后将其导入到 __INLINE_CODE_91__ 中。

最后一个必需的步骤是将现在可用的健康指标添加到所需的健康检查端点中。为此，我们返回到我们的 __INLINE_CODE_92__ 并将其添加到 __INLINE_CODE_93__ 函数中。

__CODE_BLOCK_17__

#### 日志记录

Terminus 只记录错误消息，例如，当健康检查失败时。使用 __INLINE_CODE_94__ 方法，您可以更好地控制错误的记录，以及完全控制记录本身。

在这节中，我们将指导您创建一个自定义 logger __INLINE_CODE_95__。该 logger 扩展了内置 logger，因此您可以选择性地overwrite logger 的部分

> info **提示** 如果您想了解更多关于 NestJS 自定义 logger 的信息，__LINK_114__。

__CODE_BLOCK_18__Here is the translated Chinese technical documentation:

一旦创建了自定义日志记录器，只需将其传递给__INLINE_CODE_96__，如下所示。

__CODE_BLOCK_19__

要完全抑制来自Terminus的所有日志消息，包括错误消息， configure Terminus如下所示。

__CODE_BLOCK_20__

Terminus 允许您配置健康检查错误在日志中的显示方式。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在错误时将健康检查结果摘要打印为 JSON 对象                                                     | __HTML_TAG_100____HTML_TAG_101____HTML_TAG_102__   |
| __INLINE_CODE_98__          | 在错误时将健康检查结果摘要打印在格式化的框中，并将成功/错误的结果高亮 | __HTML_TAG_103____HTML_TAG_104____HTML_TAG_105__ |

可以使用__INLINE_CODE_99__配置选项更改日志样式，如下所示。

__CODE_BLOCK_21__

#### 优雅关闭超时

如果您的应用程序需要延迟关闭进程，Terminus 可以为您处理此任务。
这个设置特别适用于使用 orchestrator，如 Kubernetes 时。
将延迟设置为略长于就绪检查间隔，您可以实现零停机时间关闭容器。

__CODE_BLOCK_22__

#### 更多示例

更多可用的工作示例，请查看 __LINK_115__。