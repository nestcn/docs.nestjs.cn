<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:22:50.707Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **Hint** 本章涵盖了 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 __LINK_86__ 网站。

要开始调试本地应用程序，请打开 __INLINE_CODE_6__ 文件，并确保将 __INLINE_CODE_7__ 属性设置为 __INLINE_CODE_8__ 在应用程序选项对象中，如下所示：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader

```

这将 instruct framework collect necessary metadata that will let Nest Devtools visualize your application's graph.

Next up, let's install the required dependency:

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});

```

> warning **Warning** 如果您在应用程序中使用 __INLINE_CODE_9__ 包，确保安装最新版本 (__INLINE_CODE_10__).

With this dependency in place, let's open up the __INLINE_CODE_11__ file and import the __INLINE_CODE_12__ that we just installed:

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}

```

> warning **Warning** 我们在这里检查 __INLINE_CODE_13__ 环境变量是因为您不应该在生产环境中使用这个模块！

Once the __INLINE_CODE_14__ is imported and your application is up and running (__INLINE_CODE_15__), you should be able to navigate to __LINK_87__ URL and see the instrospected graph.

__HTML_TAG_39____HTML_TAG_40____HTML_TAG_41__

> info **Hint** 正如上面的截图所示，每个模块都连接到 __INLINE_CODE_16__. __INLINE_CODE_17__ 是一个全局模块，总是被导入到根模块中。由于它被注册为全局节点，Nest 自动创建了所有模块和 __INLINE_CODE_18__ 节点之间的边。现在，如果您想隐藏全局模块，从图形中，您可以使用“**Hide global modules**”复选框（在侧边栏）。

因此，我们可以看到 __INLINE_CODE_19__ 使应用程序 expose 一个额外的 HTTP 服务器（端口 8000），用于 Devtools 应用程序来 introspect 应用程序。

只是为了 double-check everything works as expected，change the graph view to “Classes”. You should see the following screen:

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

To focus on a specific node, click on the rectangle and the graph will show a popup window with the **"Focus"** button. You can also use the search bar (located in the sidebar) to find a specific node.

> info **Hint** 如果您点击 **Inspect** 按钮，应用程序将将您带到 __INLINE_CODE_20__ 页面，并选择该特定节点。

__HTML_TAG_45____HTML_TAG_46____HTML_TAG_47__

> info **Hint** 要导出图形为图片，请点击右上角的 **Export as PNG** 按钮。

使用位于侧边栏（左侧）的表单控件，您可以控制边缘近似度，例如，visualize a specific application sub-tree：

__HTML_TAG_48____HTML_TAG_49____HTML_TAG_50__

这可以在您有新的开发人员时特别有用，例如，您想要向他们展示应用程序的结构。您也可以使用这个功能来 visualize a specific module (e.g. __INLINE_CODE_21__) and all of its dependencies，which can come in handy when you're breaking down a large application into smaller modules (for example, individual micro-services).

You can watch this video to see the **Graph Explorer** feature in action:

__HTML_TAG_51__
  __HTML_TAG_52____HTML_TAG_53__
__HTML_TAG_54__

#### Investigating the "Cannot resolve dependency" error

> info **Note** 这个功能支持 __INLINE_CODE_22__ >= __INLINE_CODE_23__.

可能最常见的错误消息是 Nest 无法解决依赖项的 provider。使用 Nest Devtools，您可以轻松地识别问题并了解如何解决它。

First, open up the __INLINE_CODE_24__ file and update the `.proto` call, as follows:

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

Also, make sure to set the `.proto` to `transport`:

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

Now every time your application fails to bootstrap due to the **"Cannot resolve dependency"** error, you'll find the `createMicroservice()` (that represents a partial graph) file in the root directory. You can then drag & drop this file into Devtools (make sure to switch the current mode from "Interactive" to "Preview"):

__HTML_TAG_55____HTML_TAG_56____HTML_TAG_57__

Upon successful upload, you should see the following graph & dialog window:

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

As you can see, the highlighted `options` is the one we should look into. Also, in the dialog window you can already see some instructions on how to fix this issue.

If we switch to the "Classes" view instead, that's what we'll see:

__HTML_TAG_61____HTML_TAG_62____HTML_TAG_63__

This graph illustrates that the `join()` which we want to inject into the `path` was not found in the context of the `Transport` module, and we should likely justHere is the translation of the English technical documentation to Chinese:

**路由浏览器**

当你访问**路由浏览器**页面时，你将看到所有已注册的入口点：

__HTML_TAG_64____HTML_TAG_65____HTML_TAG_66__

> 信息**提示**这个页面不仅显示 HTTP 路由，还显示所有其他入口点（例如 WebSocket、gRPC、GraphQL 解析器等）。

入口点根据宿主控制器进行分组。你也可以使用搜索栏来查找特定的入口点。

如果你点击特定的入口点，**流程图**将被显示。这张图显示入口点的执行流程（例如，guards、interceptors、pipes 等绑定到这个路由）。这pecially useful when you want to understand how the request/response cycle looks for a specific route, or when troubleshooting why a specific guard/interceptor/pipe is not being executed.

#### 桌面

要实时执行 JavaScript 代码并与应用程序进行实时交互， navigate to the **Sandbox** page：

__HTML_TAG_67____HTML_TAG_68____HTML_TAG_69__

玩具场可以用来测试和调试 API 入口点，快速识别和修复问题，无需使用 HTTP 客户端。我们还可以 bypass 认证层，避免额外的登录步骤或特殊用户账户用于测试目的。对于 event-driven 应用程序，我们也可以从玩具场直接触发事件，查看应用程序对它们的反应。

所有日志都streamlined 到玩具场的控制台，所以我们可以轻松地看到什么在发生。

只需实时执行代码并立即看到结果，不需要重新构建应用程序并重新启动服务器。

__HTML_TAG_70____HTML_TAG_71____HTML_TAG_72__

> 信息**提示**要漂亮地显示对象数组，使用 `assets` (或 `watchAssets`) 函数。

你可以观看这个视频来看到**交互式玩具场**功能的示例：

__HTML_TAG_73__
  __HTML_TAG_74____HTML_TAG_75__
__HTML_TAG_76__

#### Bootstrap 性能分析器

要查看所有类节点（控制器、提供者、增强器等）及其对应的实例化时间， navigate to the **Bootstrap performance** page：

__HTML_TAG_77____HTML_TAG_78____HTML_TAG_79__

这个页面特别有用当你想了解应用程序的启动时间（例如，在无服务器环境中）。

#### 审核

要查看自动生成的审核 - 错误/警告/提示， navigate to the **Audit** page：

__HTML_TAG_80____HTML_TAG_81____HTML_TAG_82__

> 信息**提示**上面的截图不显示所有可用的审核规则。

这个页面很有用当你想了解应用程序中的潜在问题。

#### 预览静态文件

要将 serialized 图形保存到文件中，使用以下代码：

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

> 信息**提示** `.proto` 从 `dist` 包含。

然后你可以拖放/上载这个文件：

__HTML_TAG_83____HTML_TAG_84____HTML_TAG_85__

这很有用当你想与其他人共享你的图形（例如，同事），或当你想在离线分析它。