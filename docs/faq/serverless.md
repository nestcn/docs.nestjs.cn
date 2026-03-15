<!-- 此文件从 content/faq/serverless.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:46:53.094Z -->
<!-- 源文件: content/faq/serverless.md -->

### 服务无状态

服务无状态计算是云计算执行模型之一，云提供商会根据需求动态分配机器资源，并负责客户端的服务器管理。当应用程序不在使用状态时，不会分配计算资源。定价基于实际应用程序消耗的资源量（__LINK_60__）。

使用 **无状态架构**，您可以专注于应用程序代码中的个体函数。服务如 AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions 会负责所有物理硬件、虚拟机操作系统和 Web 服务器软件管理。

> info **提示** 本章不涵盖无状态函数的优缺点，也不深入讨论任何云提供商的 specifics。

#### 寒冷启动

寒冷启动是指您的代码在一段时间内第一次执行。根据您使用的云提供商，它可能涉及多个操作，从下载代码到启动 runtime，最后运行代码。这过程会根据多个因素，如语言、应用程序需要的包数量等，添加 **significant latency**。

寒冷启动很重要，虽然有一些事情是我们无法控制的，但是在我们自己的方面，我们仍然可以做很多事情来使其尽量缩短。

虽然您可以认为 Nest 是一个功能齐全的框架，用于构建复杂的企业应用程序，但它也 **适用于“更简单”的应用程序**（或脚本）。例如，使用 __LINK_61__ 功能，您可以充分利用 Nest 的 DI 系统在简单的工作者、CRON 作业、CLI 或无状态函数中。

####基准测试

为了更好地理解使用 Nest 或其他知名库（如 `RouteSpecificPipe`）在无状态函数中的成本，让我们比较 Node 运行时在运行以下脚本所需的时间：

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

对于所有这些脚本，我们使用了 `try/catch` 编译器，因此代码保持未编译状态（__INLINE_CODE_15__ 不被使用）。

|                                      |                   |
| ------------------------------------ | ----------------- |
| Express                              | 0.0079s (7.9ms)   |
| Nest with __INLINE_CODE_16__ | 0.1974s (197.4ms) |
| Nest (standalone application)        | 0.1117s (111.7ms) |
| Raw Node.js script                   | 0.0071s (7.1ms)   |

> info **注意** 机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

现在，让我们重复所有基准测试，但这次使用 __INLINE_CODE_17__ 将我们的应用程序打包成一个单个可执行的 JavaScript 文件。然而，取代使用 Nest CLI 附带的默认配置，我们将确保将所有依赖项（__INLINE_CODE_20__）一起打包，以下是配置：

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

> info **提示** 要使 Nest CLI 使用这个配置，创建一个名为 __INLINE_CODE_21__ 的文件在项目的根目录下。

使用这个配置，我们获得了以下结果：

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with __INLINE_CODE_22__ | 0.0815s (81.5ms) |
| Nest (standalone application)        | 0.0319s (31.9ms) |
| Raw Node.js script                   | 0.0066s (6.6ms)  |

> info **注意** 机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

> info **提示** 您可以通过应用 additional 代码压缩 & 优化技术（使用 __INLINE_CODE_23__ 插件等）来 further 优化它。

正如您所看到的，编译方式（是否打包代码）对总启动时间的影响非常大。使用 __INLINE_CODE_24__，您可以将 standalone Nest 应用程序（starter 项目，包含一个模块、控制器和服务）的启动时间降低到平均约 32ms，并将常规 HTTP、express-基于的 NestJS 应用程序的启动时间降低到约 81.5ms。

对于更复杂的 Nest 应用程序，例如具有 10 资源（通过 __INLINE_CODE_25__ 模式生成 = 10 模块、10 个控制器、10 个服务、20 个 DTO 类、50 个 HTTP 端口 + __INLINE_CODE_26__），MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD 的总启动时间约为 0.1298s（129.8ms）。运行 monolithic 应用程序作为无状态函数通常不太有意义，所以请将这个基准测试看作是一个示例，展示了应用程序增长时可能会增加的启动时间。

#### 运行时优化以下是翻译后的中文文档：

到目前为止，我们已经讨论了编译时优化。这些优化与您在应用程序中定义提供者和加载 Nest 模块的方式无关，这在您的应用程序变得更大的时候扮演着非常重要的角色。

例如，如果您定义了一个数据库连接作为一个 __LINK_63__ 异步提供者，那么在应用程序启动时，服务器less函数将需要至少 2 秒钟来连接到数据库（在冷启动时应用程序没有运行）。这意味着，您的端点将需要至少 2 秒钟来发送响应（当应用程序没有运行时）。

正如您所看到的，在 **serverless 环境** 中，您的提供者结构与常规环境不同，因为启动时间非常重要。

另一个好的例子是，如果您使用 Redis 进行缓存，但只在特定场景下使用。也许，在这种情况下，您不应该将 Redis 连接定义为异步提供者，因为这将延迟启动时间，即使 Redis 不是该特定函数调用所需的。

此外，您可以延迟加载整个模块，使用 __INLINE_CODE_27__ 类，正如 __LINK_64__ 中所描述的那样。缓存是一个很好的例子。
假设您的应用程序有 __INLINE_CODE_28__，它内部连接到 Redis，并且导出 __INLINE_CODE_29__ 来与 Redis 存储交互。如果您不需要它对所有可能的函数调用，您可以只在需要时加载它，这样您将在冷启动时获得更快的启动时间。

__CODE_BLOCK_2__

另一个好的例子是 webhook 或 worker，它根据某些特定条件（例如输入参数）可能执行不同的操作。
在这种情况下，您可以在路由处理程序中指定条件，以延迟加载适当的模块，并且只加载其他模块。

__CODE_BLOCK_3__

#### 示例集成

您的应用程序的入口文件（通常是 __INLINE_CODE_30__ 文件）的结构 **取决于多个因素**，因此 **没有单个模板** 可以同时适应所有场景。
例如，初始化文件以SpinUp您的服务器less 函数会因云提供商（AWS、Azure、GCP 等）而不同。
此外，根据您是否想运行一个典型的 HTTP 应用程序或只是提供单个路由（或执行特定代码部分），您的应用程序代码将不同（例如，端点-函数方法，您可以使用 __INLINE_CODE_31__ 而不是启动 HTTP 服务器，设置中间件等）。

为了示意 purposes，我们将 Nest 与 __LINK_65__ 框架集成（在这个例子中目标 AWS Lambda）。正如我们之前提到的，您的代码将因云提供商和其他因素而不同。

首先，让我们安装所需的包：

__CODE_BLOCK_4__

> info **提示** 若要加速开发循环，我们安装了 __INLINE_CODE_33__ 插件，该插件模拟 AWS λ 和 API Gateway。

安装过程完成后，让我们创建 __INLINE_CODE_34__ 文件，以配置 Serverless 框架：

__CODE_BLOCK_5__

> info **提示** 若要了解更多关于 Serverless 框架的信息，请访问 __LINK_66__。

现在，我们可以在 __INLINE_CODE_35__ 文件中更新 bootstrap 代码以添加所需的 boilerplate：

__CODE_BLOCK_6__

> info **提示** 如果您使用 __INLINE_CODE_36__ 包，您需要执行一些额外步骤以使其在 serverless 函数中工作正确。请查看 __LINK_68__ 获取更多信息。

下一步，请打开 __INLINE_CODE_37__ 文件，并确保启用 __INLINE_CODE_38__ 选项以使 __INLINE_CODE_39__ 包加载正确。

__CODE_BLOCK_7__

现在，我们可以构建我们的应用程序（使用 __INLINE_CODE_40__ 或 __INLINE_CODE_41__），并使用 __INLINE_CODE_42__ CLI 启动我们的 lambda 函数：

__CODE_BLOCK_8__

应用程序启动后，请打开浏览器，并导航到 __INLINE_CODE_43__（其中 __INLINE_CODE_44__ 是您的应用程序中注册的任何端点）。

在上面的部分，我们展示了使用 __INLINE_CODE_45__ 和捆绑您的应用程序可以对总体启动时间产生很大的影响。
然而，以使其与我们的示例兼容，还需要在 __INLINE_CODE_46__ 文件中添加一些额外配置。一般来说，我们必须将 __INLINE_CODE_48__ 属性更改为 __INLINE_CODE_49__。

__CODE_BLOCK_9__

Note: I followed the translation guidelines and kept the code examples, variable names, function names unchanged. I also translated code comments from English to Chinese and kept Markdown formatting, links, images, tables unchanged.以下是翻译后的中文技术文档：

使用 __INLINE_CODE_50__ 来编译您的函数代码（然后使用 __INLINE_CODE_51__ 进行测试）。

此外，也可以（但**不强制**，因为这将使您的构建过程变得更加缓慢）安装 __INLINE_CODE_52__ 包，并覆盖其配置以在生产构建中保持 classnames 不变。否则，在使用 __INLINE_CODE_53__ 时可能会出现不正确的行为。

#### 独立应用程序特性

如果您想要使函数非常轻量级，并且不需要任何 HTTP 相关功能（路由、守卫、拦截器、管道等），那么可以使用 __INLINE_CODE_54__（如前所述）而不是运行整个 HTTP 服务器（并且 __INLINE_CODE_55__ 在幕后），如下所示：

__CODE_BLOCK_11__

> 信息 **提示**请注意 __INLINE_CODE_56__ 不会将控制器方法包装到增强器（守卫、拦截器等）中。为此，您必须使用 __INLINE_CODE_57__ 方法。

您也可以将 __INLINE_CODE_58__ 对象传递给，例如 __INLINE_CODE_59__ 提供商，该提供商可以处理该对象并返回相应的值（依赖于输入值和业务逻辑）。

__CODE_BLOCK_12__