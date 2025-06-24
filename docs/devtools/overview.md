### 概述

> info **提示** 本章介绍 Nest Devtools 与 Nest 框架的集成。如需了解 Devtools 应用程序，请访问 [Devtools](https://devtools.nestjs.com) 官网。

要开始调试本地应用程序，请打开 `main.ts` 文件，并确保在应用程序选项对象中将 `snapshot` 属性设置为 `true`，如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
```

这将指示框架收集必要的元数据，使 Nest Devtools 能够可视化您的应用程序图。

接下来，让我们安装所需的依赖项：

```bash
$ npm i @nestjs/devtools-integration
```

> warning **注意** 如果您的应用中使用了 `@nestjs/graphql` 包，请确保安装最新版本（`npm i @nestjs/graphql@11`）。

有了这个依赖项后，让我们打开 `app.module.ts` 文件并导入刚刚安装的 `DevtoolsModule`：

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> warning **注意** 此处检查 `NODE_ENV` 环境变量的原因是——切勿在生产环境使用此模块！

当 `DevtoolsModule` 导入完成且应用启动运行后（`npm run start:dev`），您应当能够访问 [Devtools](https://devtools.nestjs.com) 网址并查看自省生成的图谱。

![](/assets/devtools/modules-graph.png)

> info **提示** 如上方截图所示，每个模块都连接到 `InternalCoreModule`。`InternalCoreModule` 是一个始终被导入根模块的全局模块。由于它被注册为全局节点，Nest 会自动在所有模块与 `InternalCoreModule` 节点之间创建连接边。现在，若要从图中隐藏全局模块，可以使用侧边栏中的" **隐藏全局模块** "复选框。

由此可见，`DevtoolsModule` 会让你的应用暴露一个额外的 HTTP 服务器（运行在 8000 端口），Devtools 应用将通过该端口来内省你的应用程序。

为确保一切按预期运行，请将视图切换为"Classes"模式。您应该会看到如下界面：

![](/assets/devtools/classes-graph.png)

要聚焦特定节点，点击矩形框后图形界面会弹出包含 **"聚焦"** 按钮的窗口。您也可以使用侧边栏的搜索栏来定位特定节点。

> info **提示** 如果点击**检查**按钮，应用程序将带您进入 `/debug` 页面并自动选中该特定节点。

![](/assets/devtools/node-popup.png)

> info **提示** 要将图表导出为图片，请点击图表右上角的**导出为 PNG** 按钮。

使用位于侧边栏（左侧）的表单控件，您可以控制边的接近度，例如可视化特定的应用程序子树：

![](/assets/devtools/subtree-view.png)

当团队中有**新开发人员**时，这个功能特别有用，您可以向他们展示应用程序的结构。您还可以使用此功能可视化特定模块（如 `TasksModule`）及其所有依赖项，这在将大型应用程序拆分为较小模块（例如独立的微服务）时非常实用。

您可以通过观看此视频了解 **Graph Explorer** 功能的实际应用：

#### 排查"无法解析依赖项"错误

> **注意** 此功能支持 `@nestjs/core` 版本 ≥`v9.3.10`。

您可能遇到的最常见错误消息是关于 Nest 无法解析提供者依赖项的问题。使用 Nest Devtools，您可以轻松识别问题并学习如何解决它。

首先，打开 `main.ts` 文件并按如下方式更新 `bootstrap()` 调用：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});
```

同时，请确保将 `abortOnError` 设置为 `false`：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});
```

现在每当应用因 **"无法解析依赖项"** 错误而启动失败时，您都会在根目录中找到表示部分依赖图的 `graph.json` 文件。您可以将此文件拖放至开发者工具（请确保将当前模式从"交互式"切换为"预览"）：

![](/assets/devtools/drag-and-drop.png)

成功上传后，您将看到以下依赖图及对话框窗口：

![](/assets/devtools/partial-graph-modules-view.png)

如你所见，高亮的 `TasksModule` 正是我们需要查看的部分。此外，在对话框窗口中已经可以看到一些关于如何解决此问题的说明。

如果我们切换到"Classes"视图，将会看到以下内容：

![](/assets/devtools/partial-graph-classes-view.png)

这张图表明我们想要注入到 `TasksService` 中的 `DiagnosticsService` 在 `TasksModule` 模块的上下文中未被找到，我们很可能只需要将 `DiagnosticsModule` 导入到 `TasksModule` 模块中即可解决这个问题！

#### 路由资源管理器

当您导航至**路由浏览器**页面时，应该能看到所有已注册的入口点：

![](/assets/devtools/routes.png)

> info **提示** 此页面不仅显示 HTTP 路由，还包括所有其他类型的入口点（例如 WebSockets、gRPC、GraphQL 解析器等）。

入口点按其宿主控制器分组显示。您也可以使用搜索栏查找特定入口点。

点击特定入口点时， **流程图**将会显示。该图展示了入口点的执行流程（例如绑定到该路由的守卫、拦截器、管道等）。这在您需要了解特定路由的请求/响应周期，或排查为何特定守卫/拦截器/管道未执行时尤为有用。

#### 沙盒

要实时执行 JavaScript 代码并与您的应用程序交互，请导航至**沙盒**页面：

![](/assets/devtools/sandbox.png)

该演练场可用于**实时**测试和调试 API 端点，使开发人员能够快速发现并修复问题，而无需使用例如 HTTP 客户端。我们还可以绕过认证层，因此不再需要额外的登录步骤，甚至不需要专门的测试用户账户。对于事件驱动型应用程序，我们还可以直接从演练场触发事件，并观察应用程序如何响应这些事件。

所有记录的内容都会直接输出到演练场的控制台，因此我们可以轻松查看运行情况。

直接运行代码**即时（on the fly）** 查看结果，无需重新构建应用或重启服务器。

![](/assets/devtools/sandbox-table.png)

> **提示** ：要美观地显示对象数组，可使用 `console.table()`（或直接使用 `table()`）函数。

您可以通过这个视频查看**交互式演练场（Interactive Playground）** 功能的实际应用：

#### Bootstrap 性能分析器

要查看所有类节点（控制器、提供者、增强器等）及其对应实例化时间的列表，请导航至**启动性能**页面：

![](/assets/devtools/bootstrap-performance.png)

当您需要识别应用启动过程中最慢的部分时（例如需要优化对无服务器环境等场景至关重要的应用启动时间），此页面尤为实用。

#### 审计

要查看应用分析序列化图时自动生成的审计结果（错误/警告/提示），请导航至**审计**页面：

![](/assets/devtools/audit.png)

> info **提示** 上面的截图并未显示所有可用的审计规则。

当您需要识别应用程序中的潜在问题时，本页面非常有用。

#### 预览静态文件

要将序列化图形保存到文件，请使用以下代码：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());
```

> info **提示**`SerializedGraph` 是从 `@nestjs/core` 包中导出的。

然后你可以拖放/上传这个文件：

![](/assets/devtools/drag-and-drop.png)

这在你想与他人（如同事）分享你的图表，或想离线分析时非常有用。
