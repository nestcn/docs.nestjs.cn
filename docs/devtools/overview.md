<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:19:27.310Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **提示** 本章节涵盖了 Nest framework 与 Nest Devtools 的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_86__ 网站。

在开始调试您的本地应用程序之前，请先打开 __INLINE_CODE_6__ 文件，并确保将 __INLINE_CODE_7__ 属性设置为 __INLINE_CODE_8__ 在应用程序选项对象中，例如：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader

```

这将 instruct framework 收集必要的元数据，以便 Nest Devtools 可以可视化您的应用程序图表。

接下来，让我们安装所需的依赖项：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});

```

> warning **注意** 如果您在应用程序中使用 __INLINE_CODE_9__ 包含在内，请确保安装最新版本 (__INLINE_CODE_10__）。

在安装依赖项后，让我们打开 __INLINE_CODE_11__ 文件，并导入我们刚刚安装的 __INLINE_CODE_12__：

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}

```

> warning **注意** 我们在这里检查 __INLINE_CODE_13__ 环境变量的原因是，您永远 shouldn't 使用这个模块在生产环境中！

一旦 __INLINE_CODE_14__ 导入并您的应用程序启动 (__INLINE_CODE_15__), 您应该能够导航到 __LINK_87__ URL 并查看图表。

__HTML_TAG_39____HTML_TAG_40____HTML_TAG_41__

> info **提示** 如您在上面的截图中看到，每个模块都连接到 __INLINE_CODE_16__. __INLINE_CODE_17__ 是一个全局模块，它总是被导入到根模块中。由于它被注册为全局节点，Nest 自动创建所有模块之间的边缘。现在，如果您想隐藏全局模块，从图表中，可以使用侧边栏中的 "**Hide global modules**" 复选框。

因此，如我们所看到的， __INLINE_CODE_19__ 使您的应用程序 expose 一个额外的 HTTP 服务器（在端口 8000 上），以便 Devtools 应用程序使用来探索您的应用程序。

为了确认一切都像预期那样工作，让我们更改图表视图到 "Classes"。您应该看到以下屏幕：

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

要将焦点设置到特定的节点，单击矩形结点，并将图表显示的 popup 窗口。您也可以使用侧边栏中的搜索框来查找特定的节点。

> info **提示** 如果您单击 **Inspect** 按钮，应用程序将将您带到 __INLINE_CODE_20__ 页面，其中特定的节点被选中。

__HTML_TAG_45____HTML_TAG_46____HTML_TAG_47__

> info **提示** 要将图表导出为图像，请单击右上角的 **Export as PNG** 按钮。

在侧边栏中（左侧），您可以使用表单控件来控制边缘的近似度，以便可视化特定的应用程序子树：

__HTML_TAG_48____HTML_TAG_49____HTML_TAG_50__

这可以特别有用，当您有 **新开发者** 在您的团队中，您想向他们展示您的应用程序的结构。您也可以使用这个特性来可视化特定的模块（例如 __INLINE_CODE_21__）和所有依赖项，这可以在您将大型应用程序分割成小型模块（例如，个体微服务）时非常有用。

您可以观看这个视频，以了解 **Graph Explorer** 特性：

__HTML_TAG_51__
  __HTML_TAG_52____HTML_TAG_53__
__HTML_TAG_54__

#### Investigating the "Cannot resolve dependency" error

> info **注意** 这个特性支持 __INLINE_CODE_22__ >= __INLINE_CODE_23__。

可能最常见的错误信息是 Nest 无法解决 provider 的依赖项。使用 Nest Devtools，您可以轻松地确定问题并学习如何解决它。

首先，打开 __INLINE_CODE_24__ 文件，并更新 `.proto` 调用，例如：

```typescript
// hero/hero.proto
syntax = "proto3";

package hero;

service HeroesService {
  rpc FindOne (HeroById) returns (Hero) {}
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
}

```

此外，确保将 `.proto` 设置为 `transport`：

```typescript
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService', 'FindOne')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}

```

现在，每当应用程序由于 **"Cannot resolve dependency"** 错误无法启动时，您将在根目录中找到 `createMicroservice()` 文件（该文件表示部分图表）。然后，您可以将该文件拖拽到 Devtools 中（确保当前模式从 "Interactive" 变为 "Preview"）：

__HTML_TAG_55____HTML_TAG_56____HTML_TAG_57__

成功上传后，您应该看到以下图表 & 对话框：

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

如您所见，高亮的 `options` 是我们需要查看的。对话框中，您已经可以看到一些解决这个问题的指南。

如果我们切换到 "Classes" 视图，那么我们将看到：

__HTML_TAG_61____HTML_TAG_62____HTML_TAG_63__

这张图表表明 `join()`，我们想将其注入到 __Here is the translated Chinese technical documentation:

当您访问**路由探索**页面时，您将看到所有已注册的入口点：

__HTML_TAG_64____HTML_TAG_65____HTML_TAG_66__

>info 提示：该页面不仅显示 HTTP 路由，还显示其他入口点（例如 WebSockets、gRPC 和 GraphQL 解析器等）。

入口点分组在其主控制器下，您也可以使用搜索栏找到特定的入口点。

如果单击特定的入口点，**流图**将被显示。这是一个入口点执行流程的图表（例如，guard、拦截器、管道等绑定到这个路由）。这对理解特定路由的请求/响应周期或 troubleshoot 问题非常有用。

#### Sandbox

要在实时执行 JavaScript 代码并与应用程序交互，可以导航到**沙盒**页面：

__HTML_TAG_67____HTML_TAG_68____HTML_TAG_69__

游乐场可以用来实时测试和调试 API 入口点，快速识别和解决问题，而不需要使用 HTTP 客户端。我们也可以绕过身份验证层，不需要额外步骤来登录或创建特殊用户账户用于测试目的。对于事件驱动应用程序，我们也可以直接从游乐场触发事件，并观察应用程序对它们的响应。

所有日志都会流向游乐场的控制台，所以我们可以轻松地看到发生的事情。

只需在实时执行代码并立即看到结果，不需要重建应用程序并重新启动服务器。

__HTML_TAG_70____HTML_TAG_71____HTML_TAG_72__

>info 提示：要pretty 显示一个对象数组，请使用 `assets` (或 `watchAssets` 函数)。

您可以观看这个视频来了解**交互式游乐场**功能：

__HTML_TAG_73__
  __HTML_TAG_74____HTML_TAG_75__
__HTML_TAG_76__

#### Bootstrap性能分析器

要查看所有类节点（控制器、提供者、增强器等）和相应的实例化时间，可以导航到**Bootstrap性能**页面：

__HTML_TAG_77____HTML_TAG_78____HTML_TAG_79__

该页面对理解应用程序的启动过程中最慢的部分非常有用（例如，当您想要优化应用程序的启动时间时，这是非常重要的）。

#### 审计

要查看自动生成的审计报告（错误、警告、提示）应用程序在分析序列化图时发现的，可以导航到**审计**页面：

__HTML_TAG_80____HTML_TAG_81____HTML_TAG_82__

>info 提示：上面的截图不显示所有可用审计规则。

该页面对理解应用程序中潜在的问题非常有用。

#### 预览静态文件

要将序列化图保存到文件中，使用以下代码：

```typescript
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}

```

>info 提示： `.proto` 从 `dist` 包中导出。

然后，您可以拖动并上传该文件：

__HTML_TAG_83____HTML_TAG_84____HTML_TAG_85__

这对分享图表给其他人（例如，同事）或在离线分析非常有用。