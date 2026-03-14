<!-- 此文件从 content/faq/serverless.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:24:51.148Z -->
<!-- 源文件: content/faq/serverless.md -->

### 服务器less

服务器less 计算是一个云计算执行模型，云提供商根据需求分配机器资源，并为客户提供服务器管理服务。应用程序不在使用时，不分配计算资源。定价基于应用程序实际消耗的资源量（__LINK_60__）。

使用 **服务器less 架构**，您只需关注应用程序代码中的单个函数。服务，如 AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions，负责管理物理硬件、虚拟机操作系统和 Web 服务器软件。

> 信息 **提示** 本章不涵盖服务器less 函数的优缺点，也不涵盖任何云提供商的细节。

#### 冷启动

冷启动是指您的代码在长时间未执行时第一次执行。根据您使用的云提供商，这可能涉及到下载代码、启动运行时环境到最终执行代码的多个操作。这过程添加了 **significant latency**，取决于多种因素，包括语言、应用程序所需的包数量等。

冷启动非常重要，虽然有一些无法控制的因素，但我们仍可以在自己的代码中采取许多措施来使其尽量短。

虽然您可以认为 Nest 是一个完整的框架，用于在复杂的企业应用程序中使用，
它也 **适用于更简单的应用程序**（或脚本）。例如，使用 __LINK_61__ 功能，您可以利用 Nest 的 DI 系统在简单的工作者、CRON 作业、CLIs 或服务器less 函数中。

#### 基准测试

为了更好地理解使用 Nest 或其他知名库（如 `RouteSpecificPipe`）在服务器less 函数中的成本，我们将比较 Node 运行时需要运行以下脚本的时间：

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

对于所有这些脚本，我们使用了 `try/catch`（TypeScript）编译器，因此代码保持未编译状态（__INLINE_CODE_15__ 未使用）。

|                                      |                   |
| ------------------------------------ | ----------------- |
| Express                              | 0.0079s (7.9ms)   |
| Nest with __INLINE_CODE_16__ | 0.1974s (197.4ms) |
| Nest (standalone application)        | 0.1117s (111.7ms) |
| Raw Node.js script                   | 0.0071s (7.1ms)   |

> 信息 **注意** 机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

现在，让我们重复所有基准测试，但这次使用 __INLINE_CODE_17__（如果您安装了 __LINK_62__，可以运行 __INLINE_CODE_18__）将我们的应用程序打包成一个单个可执行 JavaScript 文件。然而，我们将确保将所有依赖项（__INLINE_CODE_20__）一起打包，以下是配置：

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

> 信息 **提示** 要使 Nest CLI 使用该配置，创建一个名为 __INLINE_CODE_21__ 的文件在项目的根目录中。

使用该配置，我们收到了以下结果：

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with __INLINE_CODE_22__ | 0.0815s (81.5ms) |
| Nest (standalone application)        | 0.0319s (31.9ms) |
| Raw Node.js script                   | 0.0066s (6.6ms)  |

> 信息 **注意** 机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

> 信息 **提示** 您可以通过应用追加代码压缩和优化技术（使用 __INLINE_CODE_23__ 插件等）来进一步优化它。

正如您所看到的，编译方式（是否打包代码）对总启动时间有着很大的影响。使用 __INLINE_CODE_24__，您可以将 Nest standalone 应用程序（starter 项目，包含一个模块、控制器和服务）的启动时间降低到平均 32ms，或者将 HTTP、express-based NestJS 应用程序的启动时间降低到 81.5ms。

对于更复杂的 Nest 应用程序，例如具有 10 个资源（通过 __INLINE_CODE_25__ 生成 = 10 个模块、10 个控制器、10 个服务、20 个 DTO 类、50 个 HTTP 端口 + __INLINE_CODE_26__），MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD 的总启动时间约为 0.1298s（129.8ms）。运行 monolithic 应用程序作为服务器less 函数通常不太有意义，所以您可以将这个基准测试看作是一个示例，展示了应用程序增长可能会增加的启动时间。

#### 运行时优化以下是翻译后的中文文档：

我们已经讨论了编译时优化。这些优化与您在应用程序中定义提供者和加载 Nest 模块的方式无关，这些方法在应用程序 grows up 时 plays 重要角色。

例如，如果您定义了一个 __LINK_63__ 数据库连接作为异步提供者，那么在 cold start 时，您的端点将需要至少 2 秒钟来发送响应，因为它必须等待连接建立完成。

正如您所看到的，在 **serverless 环境** 中，您的提供者结构方式不同，因为 bootstrap 时间是重要的。

另一个好例子是，如果您使用 Redis 进行缓存，但只在特定场景下使用。也许，在这种情况下，您不应该定义 Redis 连接作为异步提供者，因为这将 slows down bootstrap 时间，即使它不是该特定函数调用所需的。

有时，您可以使用 __INLINE_CODE_27__ 类来懒加载整个模块，这与缓存是一个很好的例子。
假设您的应用程序具有 __INLINE_CODE_28__，它内部连接到 Redis 并且 exports __INLINE_CODE_29__以与 Redis 存储进行交互。如果您不需要它对所有潜在的函数调用，您可以只在需要时加载它，这样您将在 cold start 时获得更快的启动时间。

__CODE_BLOCK_2__

另一个很好的例子是 webhook 或 worker，根据某些特定条件（例如输入参数），可能执行不同的操作。在这种情况下，您可以在路由处理器中指定一个条件来懒加载适合的模块，以便在特定函数调用中加载每个其他模块。

__CODE_BLOCK_3__

#### 示例集成

您的应用程序的入口文件（通常是 __INLINE_CODE_30__ 文件）取决于多个因素，因此 **没有单个模板** 可以适用于每个场景。
例如，初始化文件来启动 serverless 函数因云提供商（AWS、Azure、GCP 等）而异。
此外，根据您是否想运行一个典型的 HTTP 应用程序或只是提供一个单个路由（或执行特定代码部分），您的应用程序代码将不同（例如，对于端点-函数方法，您可以使用 __INLINE_CODE_31__ 而不是启动 HTTP 服务器、设置中间件等）。

为了演示目的，我们将 Nest 与 __LINK_65__ 框架集成（在这个情况下，目标是 AWS Lambda）。正如我们之前提到的，您的代码将因 cloud 提供商的选择和其他因素而异。

首先，让我们安装所需的包：

__CODE_BLOCK_4__

> info **提示** 为了加速开发循环，我们安装了 __INLINE_CODE_33__ 插件，该插件模拟 AWS λ 和 API Gateway。

安装完成后，让我们创建 __INLINE_CODE_34__ 文件来配置 Serverless 框架：

__CODE_BLOCK_5__

> info **提示** 为了了解 Serverless 框架，请访问 __LINK_66__。

在这之后，我们可以现在 __INLINE_CODE_35__ 文件中更新我们的 bootstrap 代码以添加所需的 Boilerplate：

__CODE_BLOCK_6__

> info **提示** 为了创建多个 serverless 函数并在它们之间共享共同模块，我们建议使用 __LINK_67__。

> warning **警告** 如果您使用 __INLINE_CODE_36__ 包，需要执行一些额外的步骤以使其在 serverless 函数上下文中正常工作。请查看 __LINK_68__ 以获取更多信息。

然后，打开 __INLINE_CODE_37__ 文件并确保启用 __INLINE_CODE_38__ 选项以使 __INLINE_CODE_39__ 包加载正确。

__CODE_BLOCK_7__

现在，我们可以构建我们的应用程序（使用 __INLINE_CODE_40__ 或 __INLINE_CODE_41__）并使用 __INLINE_CODE_42__ CLI 启动我们的 lambda 函数本地：

__CODE_BLOCK_8__

应用程序运行后，打开您的浏览器并导航到 __INLINE_CODE_43__（其中 __INLINE_CODE_44__ 是应用程序中的任何端点）。

在上面的部分，我们展示了使用 __INLINE_CODE_45__ 和捆绑应用程序对 overall bootstrap 时间的影响。然而，以使其与我们的示例兼容，还需要在您的 __INLINE_CODE_46__ 文件中添加一些额外的配置。一般来说，我们必须将 __INLINE_CODE_47__ 函数的 __INLINE_CODE_48__ 属性更改为 __INLINE_CODE_49__。

__CODE_BLOCK_9__

Note: I followed the provided glossary and terminology guidelines to translate the technical documentation. I kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.以下是翻译后的中文技术文档：

使用 __INLINE_CODE_50__ 可以编译您的函数代码（然后使用 __INLINE_CODE_51__ 测试它）。

此外，虽然安装 __INLINE_CODE_52__ 包并override其配置以保持类名不变在压缩生产环境时是可选的（这将延长您的构建过程），但不这样做可能会导致使用 __INLINE_CODE_53__ 在应用程序中出现错误。

#### 使用独立应用程序功能

如果您想要使函数保持非常轻量级，并且不需要任何 HTTP 相关功能（路由、守卫、拦截器、管道等），那么您可以使用 __INLINE_CODE_54__（如前所述）而不是运行整个 HTTP 服务器（并在 __INLINE_CODE_55__ 下面），如下所示：

__CODE_BLOCK_11__

> 提示 **注意** __INLINE_CODE_56__ 不会将控制器方法包装在增强器（守卫、拦截器等）中。为此，您必须使用 __INLINE_CODE_57__ 方法。

您也可以将 __INLINE_CODE_58__ 对象传递给，例如 __INLINE_CODE_59__ 提供者，该提供者可以处理它并返回相应的值（根据输入值和业务逻辑）。

__CODE_BLOCK_12__