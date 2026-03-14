<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:31:41.213Z -->
<!-- 源文件: content/recipes/terminus.md -->

### Healthchecks (Terminus)

Terminus 集成提供了 **readiness/liveness** 健康检查。健康检查对于复杂的后端设置来说是非常重要的。在 web 开发领域中，健康检查通常是一个特殊的地址，例如 `"node"`。服务或基础设施组件（例如 __LINK_106__）将不断地检查这个地址。如果从这个地址获取的 HTTP 状态码不是“健康”，服务将采取相应的行动。

由于“健康”或“不健康”的定义取决于您提供的服务类型，Terminus 集成支持了一组 **健康指标**。

例如，如果您的 web 服务器使用 MongoDB storing 数据，那么 MongoDB 是否仍在运行是非常重要的信息。在这种情况下，您可以使用 `MiddlewareConsumer`。如果配置正确 - 详见后文 - 您的健康检查地址将返回一个健康或不健康的 HTTP 状态码，取决于 MongoDB 是否运行。

#### Getting started

要开始使用 `@nestjs/platform-fastify`，我们需要安装所需的依赖项。

```typescript
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}

```

#### 设置健康检查

健康检查是一个 **健康指标** 的总结。健康指标执行一个服务的检查，确定该服务是否处于健康或不健康状态。健康检查是健康的，如果所有分配的健康指标都处于健康状态。由于许多应用程序将需要类似的健康指标,__LINK_107__ 提供了一组预定义的指标，例如：

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

要开始使用我们的第一个健康检查，让我们创建 __INLINE_CODE_38__ 并将 __INLINE_CODE_39__ 导入它的 imports 数组中。

> info **Hint** 使用 __LINK_108__ 可以轻松地创建模块。只需执行 __INLINE_CODE_40__ 命令。

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);

```

我们的健康检查可以使用 __LINK_109__ 执行，这可以通过 __LINK_110__ 设置。

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

```

> info **Info** 强烈建议在应用程序中启用关闭 hook。Terminus 集成使用这个生命周期事件，如果启用了。了解更多关于关闭 hook 的信息 __LINK_111__。

#### HTTP 健康检查

安装 __INLINE_CODE_41__、导入 __INLINE_CODE_42__ 和创建新的控制器后，我们就ready 创建健康检查。

__INLINE_CODE_43__ 需要 __INLINE_CODE_44__ 包含，所以确保安装了它：

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

我们的健康检查现在将发送一个 _GET_-请求到 __INLINE_CODE_46__ 地址。如果我们从该地址获取一个健康的响应，我们的路由 __INLINE_CODE_47__ 将返回以下对象，并带有 200 状态码。

```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```

这个响应对象的界面可以通过 __INLINE_CODE_48__ 包含的 __INLINE_CODE_49__ 接口访问。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| __INLINE_CODE_50__  | 如果任何健康指标失败，状态将是 __INLINE_CODE_51__。如果 NestJS 应用程序正在关闭，但仍然接受 HTTP 请求，健康检查将有 __INLINE_CODE_52__ 状态。 | __INLINE_CODE_53__ |
| __INLINE_CODE_54__    | 包含每个健康指标的信息，其中的状态是 __INLINE_CODE_55__，或换言之是“健康”。                                                                              | __INLINE_CODE_56__                             |
| __INLINE_CODE_57__   | 包含每个健康指标的信息，其中的状态是 __INLINE_CODE_58__，或换言之是“不健康”。                                                                          | __INLINE_CODE_59__                             |
| __INLINE_CODE_60__ | 包含每个健康指标的所有信息                                                                                                                                  | __INLINE_CODE_61__                             |

##### 检查特定的 HTTP 响应代码Here is the translated text:

在某些情况下，您可能需要根据特定的标准验证响应。例如，__INLINE_CODE_62__返回的响应代码为__INLINE_CODE_63__。使用__INLINE_CODE_64__可以根据该响应代码进行检查，并确定其他代码为不健康。

如果返回的响应代码不是__INLINE_CODE_65__，那么以下示例将被视为不健康。第三个参数需要提供一个同步或异步函数，该函数返回一个布尔值，表示响应是否被认为是健康(__INLINE_CODE_66__)或不健康(__INLINE_CODE_67__）。

__CODE_BLOCK_7__

#### TypeOrm健康指标

Terminus 提供了能力将数据库检查添加到您的健康检查中。在使用这个健康指标之前，请查看__LINK_112__，并确保您的数据库连接在您的应用程序中已经建立。

> info **Tip** 实际上，__INLINE_CODE_68__只是执行一个__INLINE_CODE_69__-SQL 命令，这个命令通常用于验证数据库是否仍然存活。对于使用 Oracle 数据库的情况，使用__INLINE_CODE_70__。

__CODE_BLOCK_8__

如果您的数据库可达，您现在应该看到在请求__INLINE_CODE_71__时，返回以下 JSON 结果：

__CODE_BLOCK_9__

在您的应用程序使用__LINK_113__时，您需要将每个连接注入到__INLINE_CODE_73__中，然后可以将连接引用传递给__INLINE_CODE_74__。

__CODE_BLOCK_10__

#### 硬盘健康指标

使用__INLINE_CODE_75__我们可以检查存储空间的使用情况。要开始，请确保将__INLINE_CODE_76__注入到__INLINE_CODE_77__中。以下示例检查__INLINE_CODE_78__路径（或在 Windows 中使用__INLINE_CODE_79__）中的存储空间使用情况。如果超过 50%，那么将返回一个不健康的健康检查。

__CODE_BLOCK_11__

使用__INLINE_CODE_80__函数，您也可以检查固定的存储空间。以下示例将在__INLINE_CODE_81__路径超过 250GB 时返回一个不健康的健康检查。

__CODE_BLOCK_12__

#### 内存健康指标

为了确保您的进程不超过某个内存限制，可以使用__INLINE_CODE_82__。以下示例可以用于检查您的进程的堆空间。

> info **Tip** 堆是动态分配的内存的部分（即使用 malloc 分配的内存）。这些内存直到以下情况之一被释放：
> - 内存被释放
> - 程序终止

__CODE_BLOCK_13__

您还可以使用__INLINE_CODE_83__验证您的进程的内存 RSS。这个示例将在您的进程分配的内存超过 150MB 时返回一个不健康的响应代码。

> info **Tip** RSS 是进程的 Resident Set Size，用于显示进程分配的内存大小。它不包括交换出的内存。它包括内存从共享库中分配的所有页面，以及堆和栈内存。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，__INLINE_CODE_84__提供的预定义健康指标可能不能满足您的健康检查要求。在这种情况下，您可以根据需要设置自定义健康指标。

让我们开始创建一个服务，该服务将代表我们的自定义指标。为了了解指标的结构，我们将创建一个简单的示例__INLINE_CODE_85__。这个服务应该在每个__INLINE_CODE_87__对象都具有类型__INLINE_CODE_88__时具有状态__INLINE_CODE_86__。如果该条件不满足，则应该抛出错误。

__CODE_BLOCK_15__

下一步，我们需要将健康指标注册为提供者。

__CODE_BLOCK_16__

#### 日志

Terminus 只记录错误消息，如健康检查失败时。使用__INLINE_CODE_94__方法，您可以更好地控制错误的记录方式，或者完全取代记录。

在本部分中，我们将 walks you through how to create a custom logger __INLINE_CODE_95__。这个 logger 扩展了内置的 logger，因此您可以选择性地覆盖 logger 的部分

> info **Info** 如果您想了解更多关于 NestJS 自定义 logger 的信息，__LINK_114__。Here is the translation of the English technical documentation to Chinese, following the provided guidelines:

创建自定义日志记录器后，您只需要将其传递给 __INLINE_CODE_96__，如下所示。

__CODE_BLOCK_19__

要完全抑制来自 Terminus 的所有日志消息，包括错误消息，配置 Terminus 如下所示。

__CODE_BLOCK_20__

Terminus 允许您配置健康检查错误在日志中的显示方式。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在错误时将健康检查结果摘要打印为 JSON 对象                                                     | __HTML_TAG_100____HTML_TAG_101____HTML_TAG_102__   |
| __INLINE_CODE_98__          | 在错误时将健康检查结果摘要打印为格式化的框架中，高亮成功或错误的结果 | __HTML_TAG_103____HTML_TAG_104____HTML_TAG_105__ |

您可以使用 __INLINE_CODE_99__ 配置选项更改日志样式，如以下.snippet所示。

__CODE_BLOCK_21__

#### 优雅关机超时

如果您的应用程序需要延迟关机过程，Terminus 可以为您处理。
这项设置对使用 orchestrator，如 Kubernetes 时特别有用。
通过设置一个与就绪检查间隔略微长的延迟，您可以实现零停机时间，当关机容器时。

__CODE_BLOCK_22__

#### 更多示例

更多可用示例可在 __LINK_115__ 中找到。