<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:46:21.236Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **Hint** This chapter covers the Nest Devtools integration with the Nest framework. If you are looking for the Devtools application, please visit the [[Devtools](https://devtools.nestjs.com)](/technotes/devtools) website.

To start debugging your local application, open up the `nest-devtools.config.js` file and make sure to set the `enableDevtools` attribute to `true` in the application options object, as follows:

```typescript
const options = {
  // ...,
  enableDevtools: true,
  // ...,
};

```

This will instruct the framework to collect necessary metadata that will let Nest Devtools visualize your application's graph.

Next up, let's install the required dependency:

```

npm install @nestjs/devtools

```

> warning **Warning** If you're using the `@nestjs/cors` package in your application, make sure to install the latest version (`@nestjs/cors@latest`).

With this dependency in place, let's open up the `main.ts` file and import the `AppModule` that we just installed:

```typescript
import { AppModule } from './app.module';

```

> warning **Warning** The reason we are checking the `NODE_ENV` environment variable here is that you should never use this module in production!

Once the `AppModule` is imported and your application is up and running, you should be able to navigate to [[Devtools](https://devtools.nestjs.com)](http://localhost:8000/graphql) URL and see the instrospected graph.

![Graph Explorer](<figure><img src="/assets/devtools/modules-graph.png" /></figure>)

> info **Hint** As you can see on the screenshot above, every module connects to the `AppModule`. `AppModule` is a global module that is always imported into the root module. Since it's registered as a global node, Nest automatically creates edges between all of the modules and the `AppModule` node. Now, if you want to hide global modules from the graph, you can use the "**Hide global modules**" checkbox (in the sidebar).

So as we can see, `AppModule` makes your application expose an additional HTTP server (on port 8000) that the Devtools application will use to introspect your app.

Just to double-check that everything works as expected, change the graph view to "Classes". You should see the following screen:

![Graph Explorer](<figure><img src="/assets/devtools/classes-graph.png" /></figure>)

To focus on a specific node, click on the rectangle and the graph will show a popup window with the **"Focus"** button. You can also use the search bar (located in the sidebar) to find a specific node.

> info **Hint** If you click on the **Inspect** button, application will take you to the `AppModule` page with that specific node selected.

![Graph Explorer](<figure><img src="/assets/devtools/node-popup.png" /></figure>)

> info **Hint** To export a graph as an image, click on the **Export as PNG** button in the right corner of the graph.

Using the form controls located in the sidebar (on the left), you can control edges proximity to, for example, visualize a specific application sub-tree:

![Graph Explorer](<figure><img src="/assets/devtools/subtree-view.png" /></figure>)

This can be particularly useful when you have **new developers** on your team and you want to show them how your application is structured. You can also use this feature to visualize a specific module (e.g. `UserModule`) and all of its dependencies, which can come in handy when you're breaking down a large application into smaller modules (for example, individual micro-services).

You can watch this video to see the **Graph Explorer** feature in action:

[<figure>](https://www.youtube.com/watch?v=<iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/bW8V-ssfnvM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  >)
  </iframe></figure>
<figure>

#### Investigating the "Cannot resolve dependency" error

> info **Note** This feature is supported for `@nestjs/common` >= `7.6.2`.

Probably the most common error message you might have seen is about Nest not being able to resolve dependencies of a provider. Using Nest Devtools, you can effortlessly identify the issue and learn how to resolve it.

First, open up the `app.module.ts` file and update the `@Module` call, as follows:

```typescript
@Module({
  imports: [
    // ...,
    DynamicModule.forRoot(),
  ],
})
export class AppModule {}

```

Also, make sure to set the `enableDevtools` to `true`:

```typescript
const options = {
  // ...,
  enableDevtools: true,
  // ...,
};

```

Now every time your application fails to bootstrap due to the **"Cannot resolve dependency"** error, you'll find the `devtools-debug.log` file in the root directory. You can then drag & drop this file into Devtools (make sure to switch the current mode from "Interactive" to "Preview"):

![Graph Explorer](<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>)

Upon successful upload, you should see the following graph & dialog window:

![Graph Explorer](<figure><img src="/assets/devtools/partial-graph-modules-view.png" /></figure>)

As you can see, the highlighted `AppModule` is the one we should look into. Also, in the dialog window you can already see some instructions on how to fix this issueHere is the translation of the provided English technical documentation to Chinese, following the specified guidelines:

当你访问**路由探索**页面，你将看到所有已注册的入口点：

<figure><img src="/assets/devtools/routes.png" /></figure>

> 提示 **提示** 这一页不仅显示 HTTP 路由，还显示其他入口点（例如 WebSocket、gRPC、GraphQL 解析器等）。

入口点按其主机控制器进行分组。你也可以使用搜索栏来找到特定的入口点。

如果你点击特定的入口点，**流图**将被显示。这幅图显示了入口点的执行流程（例如，守卫、拦截器、管道等绑定到这条路由）。这对理解特定路由的请求/响应周期或 troubleshoot为什么特定的守卫/拦截器/管道没有被执行非常有用。

#### 桌面

要在实时执行 JavaScript 代码并与应用程序进行交互，可以导航到**桌面**页面：

<figure><img src="/assets/devtools/sandbox.png" /></figure>

游乐场可以用来测试和调试 API 端点，实时地识别和解决问题，而不需要使用 HTTP 客户端。我们也可以绕过身份验证层，不需要额外的登录步骤或特殊用户账户用于测试目的。在事件驱动应用中，我们也可以直接从游乐场触发事件，看到应用程序对事件的反应。

所有下来的日志都会被流线到游乐场的控制台，所以我们可以轻松地看到发生了什么。

只执行代码并实时查看结果，不需要重建应用程序并重新启动服务器。

<figure><img src="/assets/devtools/sandbox-table.png" /></figure>

> 提示 **提示** 要美化数组对象，可以使用 `console.table()` (或 `table()`) 函数。

你可以观看以下视频来了解**交互式游乐场**功能：

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

#### Bootstrap 性能分析器

要查看所有类节点（控制器、提供者、增强器等）及其对应的实例化时间，可以导航到**Bootstrap 性能**页面：

<figure><img src="/assets/devtools/bootstrap-performance.png" /></figure>

这一页非常有用，当你想确定应用程序的启动时间（例如，在无服务器环境中）时。

#### 审计

要查看自动生成的审计报告（错误/警告/提示），可以导航到**审计**页面：

<figure><img src="/assets/devtools/audit.png" /></figure>

> 提示 **提示** 上面的截图不显示所有可用审计规则。

这一页非常有用，当你想确定应用程序中的潜在问题时。

#### 预览静态文件

要将 serialized 图形保存到文件中，可以使用以下代码：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> 提示 **提示** `SerializedGraph` 是来自 `@nestjs/core` 包的导出。

然后你可以拖拽或上传这个文件：

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

这非常有用，当你想与Someone else 共享你的图形（例如，同事），或当你想离线分析它时。