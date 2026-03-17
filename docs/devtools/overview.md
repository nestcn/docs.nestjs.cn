<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:13:25.860Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **提示** 本章节涵盖了 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 [Devtools](https://devtools.nestjs.com) 网站。

要开始调试本地应用程序，请打开 `main.ts` 文件，并确保在应用程序选项对象中将 `snapshot` 属性设置为 `true`，如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

这将 instruct framework 收集必要元数据，以便 Nest Devtools 可视化应用程序的图表。

接下来，让我们安装所需的依赖项：

```bash
$ npm i @nestjs/devtools-integration

```

> warning **警告** 如果您在应用程序中使用 `@nestjs/graphql` 包，确保安装最新版本（`npm i @nestjs/graphql@11`）。

安装依赖项后，让我们打开 `app.module.ts` 文件，并导入我们刚刚安装的 `DevtoolsModule`：

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

> warning **警告** 我们这里检查 `NODE_ENV` 环境变量是因为您应该永远不要在生产环境中使用这个模块！

一旦 `DevtoolsModule` 被导入，并且您的应用程序正在运行（`npm run start:dev`），您就可以导航到 [Devtools](https://devtools.nestjs.com) URL 并查看 introspected 图表。

<figure><img src="/assets/devtools/modules-graph.png" /></figure>

> info **提示** 如您在上面的截图中看到，每个模块都连接到 `InternalCoreModule`. `InternalCoreModule` 是一个全局模块，它总是被导入到根模块中。由于它被注册为全局节点，Nest 自动创建所有模块和 `InternalCoreModule` 节点之间的边。现在，如果您想要隐藏全局模块，可以使用“**隐藏全局模块**”复选框（在侧边栏中）。

因此，如我们所见，`DevtoolsModule` 使您的应用程序 expose 一个额外的 HTTP 服务器（在 8000 端口上），Devtools 应用程序将使用该服务器来 introspect 您的应用程序。

只是为了检查一切是否按预期工作，切换到“Classes”视图，您将看到以下屏幕：

<figure><img src="/assets/devtools/classes-graph.png" /></figure>

要专注于特定节点，请点击矩形，并将图表显示 popup 窗口中的“**焦点**”按钮。您也可以使用侧边栏中的搜索栏来查找特定节点。

> info **提示** 如果您单击“**检查**”按钮，应用程序将将您带到 `/debug` 页，带有该特定节点选中。

<figure><img src="/assets/devtools/node-popup.png" /></figure>

> info **提示** 要将图表导出为图像，请单击右上角的“**Export as PNG**”按钮。

使用侧边栏中的表单控件（在左侧），您可以控制边缘亲密度，例如可视化特定应用程序子树：

<figure><img src="/assets/devtools/subtree-view.png" /></figure>

这可以特别有用，当您有 **新开发者** 在您的团队中，您想向他们展示您的应用程序结构。您也可以使用这个特性来可视化特定模块（例如 `TasksModule`）及其依赖项，这可以在您将大型应用程序分解为小型模块（例如微服务）时非常有用。

您可以观看这个视频，以了解 **Graph Explorer** 功能的工作原理：

<figure>
  <iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/bW8V-ssfnvM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  ></iframe>
</figure>

#### investigate the "Cannot resolve dependency" error

> info **注意** 这个功能在 `@nestjs/core` >= `v9.3.10` 中支持。

可能最常见的错误消息之一是 Nest 无法解决 provider 的依赖项。使用 Nest Devtools，您可以轻松地识别问题并学习解决方法。

首先，打开 `main.ts` 文件，并更新 `bootstrap()` 调用，如下所示：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

此外，请确保将 `abortOnError` 设置为 `false`：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

现在，每当您的应用程序由于“**Cannot resolve dependency**”错误而无法启动时，您将在根目录中找到 `graph.json` 文件（表示部分图表）。然后，您可以将该文件拖放到 Devtools 中（确保当前模式从“交互式”切换到“预览”）：

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

成功上传后，您将看到以下图表 & 对话框窗口：

<figure><img src="/assets/devtools/partial-graph-modules-view.png" /></figure>

如您所见，高亮的 `TasksModule` 是我们应该关注的。对话框窗口中，您已经可以看到解决该问题的指导。

如果我们切换到“Classes”视图，以下是什么我们将看到：

<figure><img src="/assets/devtools/partial-graph-classes-view.png" /></figure>

这个图表表明Here is the translated Chinese technical documentation:

当你访问**路由浏览器**页面时，你将看到所有已注册的入口点：

<figure><img src="/assets/devtools/routes.png" /></figure>

> 提示 **Hint** 这一页不仅显示 HTTP 路由，还显示其他入口点（例如 WebSocket、gRPC 和 GraphQL 解析器等）。

入口点按 host 控制器进行分组。你也可以使用搜索栏来找到特定的入口点。

如果你单击某个入口点，**流程图**将被显示。这张图显示了入口点的执行流程（例如，guards、interceptors、pipes 等与该路由绑定的内容）。这对于理解特定的路由请求/响应周期或 troubleshoot 问题的执行非常有用。

#### Sandbox

要在实时执行 JavaScript 代码并与应用程序进行交互，请访问**沙盒**页面：

<figure><img src="/assets/devtools/sandbox.png" /></figure>

沙盒可以用来实时测试和调试 API 入口点，快速识别和解决问题，而不需要使用 HTTP 客户端。我们可以 bypass 认证层，并且不再需要额外的一步登录或特殊用户账户来进行测试。对于事件驱动应用程序，我们也可以从沙盒中触发事件，并看到应用程序对事件的反应。

所有日志信息将被流式传输到沙盒的控制台，所以我们可以轻松地看到发生的事情。

只需实时执行代码并立即看到结果，不需要重建应用程序或重新启动服务器。

<figure><img src="/assets/devtools/sandbox-table.png" /></figure>

> 提示 **Hint** 要以可读性更好的格式显示数组对象，使用 `console.table()` (或 `table()`) 函数。

你可以观看这个视频来了解**交互式沙盒**功能：

<figure>
  <iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/liSxEN_VXKM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  ></iframe>
</figure>

#### Bootstrap性能分析器

要查看所有类节点（控制器、提供者、增强器等）及其对应的实例化时间，请访问**Bootstrap性能**页面：

<figure><img src="/assets/devtools/bootstrap-performance.png" /></figure>

这一页对于想要优化应用程序的启动时间非常有用（例如，在无服务器环境中）。

#### 审核

要查看自动生成的审核错误/警告/提示，请访问**审核**页面：

<figure><img src="/assets/devtools/audit.png" /></figure>

> 提示 **Hint** 上面的截图不显示所有可用的审核规则。

这一页对于想要识别应用程序中的潜在问题非常有用。

#### 预览静态文件

要将 serialized 图形保存到文件中，请使用以下代码：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> 提示 **Hint** `SerializedGraph` 从 `@nestjs/core` 包 exports。

然后你可以拖拽或上传该文件：

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

这对于想要与他人共享图形（例如，同事）或想要离线分析图形非常有用。