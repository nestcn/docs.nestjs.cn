<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T11:10:23.870Z -->
<!-- 源文件: content/devtools/overview.md -->

### 概述

> info **提示** 本章介绍 Nest Devtools 与 Nest 框架的集成。如果您正在寻找 Devtools 应用程序，请访问 [Devtools](https://devtools.nestjs.com) 网站。

Nest Devtools 为您提供应用程序内部结构的交互式、实时更新的视图——包括模块、提供者、控制器，以及将它们连接在一起的路由和事件。您无需通过导入和构造函数签名来拼凑全貌，而是可以获得一个可搜索、可筛选、可点击的实时图形。本章将引导您首次将本地应用程序连接到 Devtools。

开始使用只需不到五分钟。打开您的 `main.ts` 文件，在应用程序的选项对象中将 `snapshot` 属性设置为 `true`：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(3000);
}

```

这告诉 Nest 开始收集 Devtools 重建和可视化应用程序依赖图所需的元数据。

接下来，安装 Devtools 集成包：

```bash
$ npm i @nestjs/devtools-integration

```

安装完成后，打开 `app.module.ts` 并导入 `DevtoolsModule`：

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

> info **注意** 我们在这里检查 `NODE_ENV`，因为 `DevtoolsModule` 绝不应在生产环境中运行。

`http` 标志控制 `DevtoolsModule` 是否暴露其内省服务器——保持禁用状态时，该模块实际上不执行任何操作，这正是您希望的安全网，以防此配置意外通过审查。也无需担心有意义的运行时开销：元数据收集仅在内省服务器实际被查询时才会启动，因此应用程序的正常请求处理不受影响。

一旦导入了 `DevtoolsModule` 并且您的应用程序已启动运行（`npm run start:dev`），请前往 [Devtools](https://devtools.nestjs.com) 观看您的内省图形生动呈现。

<figure><img src="/assets/devtools/modules-graph.png" /></figure>

> info **提示** 请注意，每个模块都连接到 `InternalCoreModule`——这是 Nest 始终导入到根模块的全局模块。由于它是全局注册的，Nest 会自动在它和应用程序中的每个其他模块之间绘制一条边。要减少视图杂乱，请在侧边栏中切换 **隐藏全局模块** 复选框。

在底层，`DevtoolsModule` 会启动一个轻量级 HTTP 服务器（端口 8000），该仪表板使用它来实时内省您的应用程序——无需额外配置。

让我们确认一切已正确连接。将图形视图切换为"类"（Classes），您应该会看到类似这样的内容：

<figure><img src="/assets/devtools/classes-graph.png" /></figure>

点击任意节点可打开一个带有 **"聚焦"**（Focus）按钮的弹窗，该按钮可将节点在图形中隔离显示，或者使用侧边栏中的搜索栏直接跳转到特定节点。

> info **提示** 点击 **检查**（Inspect）将直接带您进入 `/debug` 页面并预选该节点——非常适合深入查看特定的提供者或控制器。

<figure><img src="/assets/devtools/node-popup.png" /></figure>

> info **提示** 需要为文档或拉取请求保存快照？点击图形右下角的 **导出为 PNG**（Export as PNG）。

侧边栏中的控件可让您缩小边的邻近范围——非常适合放大查看应用程序的特定分支：

<figure><img src="/assets/devtools/subtree-view.png" /></figure>

这是让**新团队成员**快速上手的好方法——向他们准确展示应用程序是如何组合在一起的。当您要提取一个模块（例如 `TasksModule`）及其所有依赖项，以便将大型应用程序拆分为更小的服务时，此功能同样非常有用。

Graph Explorer 中的所有内容都与您正在运行的应用程序保持同步——刷新后，您对模块或提供者所做的任何更改都会立即反映出来。无需构建步骤或单独维护文档；图形本身就是文档。

观看 **Graph Explorer** 的实际运行：

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

#### 调试"Cannot resolve dependency"错误

> info **注意** 适用于 `@nestjs/core` 9.3.10 及以上版本。

如果您使用 Nest 已有一段时间，很可能遇到过令人头疼的 **"Cannot resolve dependency"** 错误。这通常是任何新团队成员看到的第一个错误消息，在大型应用程序中，它确实很难追踪——堆栈跟踪告诉您缺少什么，但没有说明原因，也没有说明在深层嵌套的提供者链中连接究竟在哪里断裂。Devtools 将此从猜测游戏转变为快速的视觉诊断。

首先更新您在 `main.ts` 中的 `bootstrap()` 调用：

```typescript
bootstrap().catch((err) => {
  writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

> info **提示** `PartialGraphHost` 从 `@nestjs/core` 导出。

您还需要将 `abortOnError` 设置为 `false`：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

从现在开始，每当您的应用程序因 **"Cannot resolve dependency"** 错误而无法启动时，Nest 都会在项目根目录写入一个 `graph.json` 文件——一个部分图形。将其拖放到 Devtools 中（先切换为"预览"（Preview）模式而不是"交互"（Interactive）模式），即可准确查看出错位置：

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

上传后，您将看到图形以及一个总结所发生情况的对话框：

<figure><img src="/assets/devtools/partial-graph-modules-view.png" /></figure>

高亮显示的 `TasksModule` 是您需要关注的对象——对话框已经为您提供了如何修复的提示。

切换到"类"（Classes）视图可查看完整信息：

<figure><img src="/assets/devtools/partial-graph-classes-view.png" /></figure>

此图形清楚地表明：`DiagnosticsService`——`TasksService` 所依赖的——在 `TasksModule` 的上下文中不可用。修复方法很简单：将 `DiagnosticsModule` 导入到 `TasksModule` 中，一切就恢复正常了。

原本需要在多个文件中手动追踪导入的缓慢过程——还要祈祷自己没有遗漏任何一个——现在只需几次点击即可完成。这是一个小小的流程改进，但在拥有数十个模块的代码库中，这种改进会迅速累积起来。

#### 路由探索器

前往 **路由探索器**（Routes explorer）页面，查看您的应用程序注册的所有入口点：

<figure><img src="/assets/devtools/routes.png" /></figure>

> info **提示** 此页面不仅限于 HTTP 路由——它还涵盖 WebSockets、gRPC、GraphQL 解析器等。

入口点按其宿主控制器分组，您可以使用搜索栏直接跳转到所需的目标。

点击任意入口点即可查看 **流程图**（flow graph），展示其完整的执行路径——绑定到该路由的每个守卫、拦截器和管道。这是理解请求如何在应用程序中流转的最快方式，也是排查某个守卫、拦截器或管道为何未按预期触发的最快途径。

此视图对于随时间自然增长的应用程序最为有用，在这些应用中，同一个守卫可能在一处应用于控制器级别，而在另一处则按路由应用。您无需阅读散落在代码库各处的装饰器，即可获得该特定路由实际解析后的执行顺序。

#### 游乐场

想要在不重新部署的情况下针对您的应用程序运行代码？前往 **游乐场**（Playground）页面：

<figure><img src="/assets/devtools/sandbox.png" /></figure>

游乐场让您可以 **实时** 测试和调试端点，无需借助单独的 HTTP 客户端即可排查问题。您可以完全绕过认证层，跳过额外的登录步骤或专用测试账户——对于事件驱动的应用程序，还可以直接从游乐场触发事件，精确查看应用程序的响应方式。

您的代码记录的任何内容都会实时流式传输到游乐场的控制台中，因此您始终了解底层正在发生什么。

只需 **即时** 运行代码并立即查看结果——无需重新构建，无需重启服务器。

<figure><img src="/assets/devtools/sandbox-table.png" /></figure>

> info **提示** 使用 `console.table()`（或直接使用 `table()`）来美化打印对象数组。

查看 **游乐场** 的实际运行效果：

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

#### 启动性能分析器

想知道是什么拖慢了应用程序的启动速度？**启动性能**（Bootstrap performance）页面列出了每个类节点——控制器、提供者、增强器等——及其实例化时间：

<figure><img src="/assets/devtools/bootstrap-performance.png" /></figure>

这是发现启动过程中最慢环节的最快捷方式，当启动时间处于关键路径上时尤为重要——想想无服务器环境，每一毫秒都至关重要。

启动缓慢通常由几个常见原因造成：构造函数中的大量同步工作、提供者在 `onModuleInit` 中等待缓慢的外部调用，或者仅仅是某个模块实例化了远超其所需的依赖。该页面按实例化时间排序，让这些异常项一目了然，无需您在代码库中到处添加 `console.time()` 调用。

#### 审计

Devtools 会自动分析您序列化后的图，并呈现值得关注的错误、警告和提示。您可以在 **审计**（Audit）页面上找到所有这些内容：

<figure><img src="/assets/devtools/audit.png" /></figure>

> info **提示** 上面的截图仅展示了可用审计规则的一部分。

可以将其视为应用程序架构的代码检查器——一种在问题找上门之前快速发现问题的途径。一些内置规则会标记出您原本只能通过惨痛教训才能发现的问题：某个控制器承载的路由远超其同类、某个模块引入了异常大量的依赖、名为 `SomethingGuard` 的提供者从未被实际注册为守卫，或者某个请求作用域的提供者其实更适合改用 [Durable Providers](/fundamentals/provider-scopes#持久提供者)。这些都不是测试套件能捕获的 bug，但它们正是那种会随着时间推移拖慢代码库的问题。

#### 预览静态文件

要将序列化后的图保存到文件中，请使用以下代码：

```typescript
await app.listen(3000); // OR await app.init()
writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> info **提示** `SerializedGraph` 从 `@nestjs/core` 中导出。

然后只需拖放（或上传）该文件：

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

当您想与同事共享图表、将其附加到错误报告中，或在离线状态下分析它时——无需让应用程序保持运行——此功能就派上了用场。