<!-- 此文件从 content/faq/serverless.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:07:27.659Z -->
<!-- 源文件: content/faq/serverless.md -->

### 服务器less

服务器less 计算是cloud 计算执行模型，云提供者根据需求分配机器资源，负责客户端的服务器管理。当应用程序不再使用时，无计算资源分配给应用程序。定价基于应用程序实际资源消耗(__LINK_60__。

使用 **服务器less 架构**，您可以专心于应用程序代码中的单个函数。服务如 AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions 负责物理硬件、虚拟机操作系统和 Web 服务器软件管理。

> 信息 **Hint** 本章不涵盖服务器less 函数的优缺点，也不dives into 任何云提供者的细节。

#### 冷启动

冷启动是您的代码在一段时间内首次执行。根据使用的云提供者，它可能涉及多个操作，从下载代码到最终运行代码的 bootstrapping 过程。这增加了 **significant latency**，取决于多个因素，包括语言、应用程序需要的包数量等。

冷启动非常重要，虽然有一些我们无法控制的事情，但我们仍然可以在自己的方面做很多事情来使其尽量短。

虽然您可以认为 Nest 是一个完整的框架，旨在用于复杂的企业应用程序，但它也 **适用于更简单的应用程序**（或脚本）。例如，使用 __LINK_61__ 功能，您可以利用 Nest 的 DI 系统在简单的工作人员、CRON 任务、CLI 或服务器less 函数中。

#### 基准测试

为了更好地理解使用 Nest 或其他知名库（如 `RouteSpecificPipe`）在服务器less 函数中的成本，让我们比较 Node 运行时需要运行以下脚本的时间：

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}

```

对于所有这些脚本，我们使用了 `try/catch` (TypeScript) 编译器，因此代码保持未编译状态（__INLINE_CODE_15__ 没有使用）。

|                                      |                   |
| ------------------------------------ | ----------------- |
| Express                              | 0.0079s (7.9ms)   |
| Nest with __INLINE_CODE_16__ | 0.1974s (197.4ms) |
| Nest (standalone 应用程序)        | 0.1117s (111.7ms) |
| Raw Node.js 脚本                   | 0.0071s (7.1ms)   |

> 信息 **Note** 机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

现在，让我们重复所有基准测试，但是这次使用 __INLINE_CODE_17__（如果您安装了 __LINK_62__，可以运行 __INLINE_CODE_18__）将我们的应用程序打包到单个可执行 JavaScript 文件中。但是，我们将确保将所有依赖项(__INLINE_CODE_20__)一起打包，以便：

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}

```

> 信息 **Hint** 要 instruct Nest CLI 使用此配置，创建一个新的 __INLINE_CODE_21__ 文件在项目的根目录下。

使用此配置，我们收到了以下结果：

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with __INLINE_CODE_22__ | 0.0815s (81.5ms) |
| Nest (standalone 应用程序)        | 0.0319s (31.9ms) |
| Raw Node.js 脚本                   | 0.0066s (6.6ms)  |

> 信息 **Note** 机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

> 信息 **Hint** 您可以通过应用更多代码压缩和优化技术（使用 __INLINE_CODE_23__ 插件等）来优化它。

如您所见，编译方式（是否 bundle 代码）对启动时间的影响非常大。使用 __INLINE_CODE_24__，您可以将 standalone Nest 应用程序的启动时间降低到平均 32ms，或者降低到 81.5ms 对于常规 HTTP、Express-Based NestJS 应用程序。

对于更加复杂的 Nest 应用程序，例如具有 10 资源（通过 __INLINE_CODE_25__  schematic 生成 = 10 模块、10 控制器、10 服务、20 DTO 类、50 HTTP 端口 + __INLINE_CODE_26__），在 MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD 上的总启动时间约为 0.1298s (129.8ms)。作为服务器less 函数，通常情况下不太合适，所以上述基准测试更多地是一种示例，展示了应用程序增长时可能的启动时间增加。

#### 运行优化直到现在，我们已经涵盖了编译时优化。这些优化与您在应用程序中定义提供者和加载 Nest 模块的方式无关，这在您的应用程序变得越大时变得越重要。

例如，如果您将数据库连接定义为一个 __LINK_63__，异步提供者旨在延迟应用程序启动直到一个或多个异步任务完成。
这意味着，如果您的无服务器函数平均需要 2s 连接到数据库（在引导时），您的端点将需要至少 2 秒钟（因为它必须等待连接建立）来发送响应回（当它是一个冷启动时，应用程序还没有运行）。

正如您所看到的，在 **无服务器环境** 中，您的提供者结构略有不同，因为引导时间是重要的。

另一个好的示例是，如果您使用 Redis 进行缓存，但只在特定场景下使用。也许，在这种情况下，您不应该将 Redis 连接定义为异步提供者，因为这将延迟引导时间，即使它不需要在特定函数调用中。

此外，您还可以使用 __INLINE_CODE_27__ 类来懒加载整个模块，像在 __LINK_64__ 中所描述的那样。缓存是一个很好的示例。
假设您的应用程序具有 __INLINE_CODE_28__，它内部连接到 Redis，并且导出 __INLINE_CODE_29__ 来与 Redis 存储交互。如果您不需要它在所有可能的函数调用中，您可以在需要时懒加载它。
这样，您将获得更快的启动时间（在冷启动时）对于不需要缓存的所有调用。

__CODE_BLOCK_2__

还有另一个很好的示例是 webhook 或 worker，根据某些特定条件（例如输入参数）可能执行不同的操作。
在这种情况下，您可以在路由处理程序中指定一个条件，懒加载适当的模块，或者懒加载其他模块。

__CODE_BLOCK_3__

#### 示例集成

您的应用程序入口文件（通常是 __INLINE_CODE_30__ 文件）的方式取决于多个因素，因此 **没有单个模板** 可以应用于每个场景。
例如，初始化文件 required 来启动无服务器函数因 cloud 提供商（AWS、Azure、GCP 等）而异。
此外，根据是否想要运行典型的 HTTP 应用程序或只提供单个路由（或执行特定代码部分），您的应用程序代码将不同（例如，使用 __INLINE_CODE_31__ 可以在不启动 HTTP 服务器、设置中间件等的情况下执行端点）。

为了示意的目的，我们将 Nest (使用 __INLINE_CODE_32__ 并启动整个 HTTP 路由器)与 __LINK_65__ 框架集成（在这个情况下，目标是 AWS Lambda）。正如我们之前提到的，您的代码将因 cloud 提供商而异，以及其他多个因素。

首先，让我们安装所需的包：

__CODE_BLOCK_4__

> info **hint** 为了加速开发周期，我们安装了 __INLINE_CODE_33__ 插件，该插件模拟 AWS λ 和 API Gateway。

安装过程完成后，让我们创建 __INLINE_CODE_34__ 文件来配置 Serverless 框架：

__CODE_BLOCK_5__

> info **hint** 有关 Serverless 框架的更多信息，请访问 __LINK_66__。

现在，我们可以在 __INLINE_CODE_35__ 文件中更新引导代码以包含所需的 boilerplate：

__CODE_BLOCK_6__

> info **hint** 创建多个无服务器函数并在它们之间共享公共模块，我们推荐使用 __LINK_67__。

> warning **警告** 如果您使用 __INLINE_CODE_36__ 包，需要执行一些额外的步骤以在无服务器函数中正确工作。请查看 __LINK_68__ 获取更多信息。

下一步，请打开 __INLINE_CODE_37__ 文件并确保启用 __INLINE_CODE_38__ 选项，以便 __INLINE_CODE_39__ 包正确加载。

__CODE_BLOCK_7__

现在，我们可以构建我们的应用程序（使用 __INLINE_CODE_40__ 或 __INLINE_CODE_41__）并使用 __INLINE_CODE_42__ CLI 启动 lambda 函数：

__CODE_BLOCK_8__

应用程序运行后，打开浏览器并导航到 __INLINE_CODE_43__（其中 __INLINE_CODE_44__ 是您的应用程序中的任何端点）。

在上面的部分，我们展示了使用 __INLINE_CODE_45__ 和捆绑应用程序对总体引导时间的影响。
然而，以使其与我们的示例兼容，还需要在您的 __INLINE_CODE_46__ 文件中添加一些额外的配置。一般来说，
为了确保我们的 __INLINE_CODE_47__ 函数将被选择，我们必须将 __INLINE_CODE_48__ 属性设置为 __INLINE_CODE_49__。

__CODE_BLOCK_9__

Note: I followed the provided glossary and translation requirements. I kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese. I removed all @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.以下是翻译后的中文技术文档：

使用 __INLINE_CODE_50__ 编译您的函数代码（然后使用 __INLINE_CODE_51__ 测试它）。

此外，虽然不 Absolutely required，但安装 __INLINE_CODE_52__ 包并override其配置，以便在生产环境中保持 classnames 不变，可以避免在使用 __INLINE_CODE_53__ 应用程序中出现错误。

#### 独立应用程序特性

如果您想使您的函数非常轻便，不需要任何 HTTP 相关功能（路由、守卫、拦截器、管道等），可以使用 __INLINE_CODE_54__（如前所述）而不是运行整个 HTTP 服务器（和 __INLINE_CODE_55__ 在底层），如下所示：

__CODE_BLOCK_11__

> 信息 **提示**注意 __INLINE_CODE_56__ 不会将控制器方法包装在增强器（守卫、拦截器等）中。为此，您必须使用 __INLINE_CODE_57__ 方法。

您也可以将 __INLINE_CODE_58__ 对象传递给 __INLINE_CODE_59__ 提供者，以便让它处理并返回相应的值（根据输入值和业务逻辑）。

__CODE_BLOCK_12__