<!-- 此文件从 content/devtools/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:08:29.116Z -->
<!-- 源文件: content/devtools/overview.md -->

### Overview

> info **Hint** This chapter covers the Nest Devtools integration with the Nest framework. If you are looking for the Devtools application, please visit the [docs.nestjs.com](./) website.

要开始调试您的本地应用程序，请打开 `main.ts` 文件，并确保将 `snapshot` 属性设置为 `true` 在应用程序选项对象中，如下所示：

```typescript title="Nest Devtools Integration"
{
  // ...
  "devtools": {
    "enabled": true
  }
}

```

这将 instruct the framework to collect necessary metadata that will let Nest Devtools visualize your application's graph.

Next up, let's install the required dependency:

```bash
npm install @nestjs/devtools

```

> warning **Warning** If you're using `@nestjs/graphql` package in your application, make sure to install the latest version (`npm i @nestjs/graphql@11`).

With this dependency in place, let's open up the `app.module.ts` file and import the `DevtoolsModule` that we just installed:

```typescript title="Nest Devtools Integration"
import { NestDevtools } from '@nestjs/devtools';

```

> warning **Warning** The reason we are checking the `NODE_ENV` environment variable here is that you should never use this module in production!

Once the `DevtoolsModule` is imported and your application is up and running (`npm run start:dev`), you should be able to navigate to [Devtools](https://devtools.nestjs.com) URL and see the instrospected graph.

<figure><img src="https://example.com/_<figure>_" alt="_<img src="/assets/devtools/modules-graph.png" />_"></figure>

> info **Hint** As you can see on the screenshot above, every module connects to the `InternalCoreModule`. `InternalCoreModule` is a global module that is always imported into the root module. Since it's registered as a global node, Nest automatically creates edges between all of the modules and the `InternalCoreModule` node. Now, if you want to hide global modules from the graph, you can use the "**Hide global modules**" checkbox (in the sidebar).

So as we can see, `DevtoolsModule` makes your application expose an additional HTTP server (on port 8000) that the Devtools application will use to introspect your app.

Just to double-check that everything works as expected, change the graph view to "Classes". You should see the following screen:

<figure><img src="https://example.com/_<figure>_" alt="_<img src="/assets/devtools/classes-graph.png" />_"></figure>

To focus on a specific node, click on the rectangle and the graph will show a popup window with the **"Focus"** button. You can also use the search bar (located in the sidebar) to find a specific node.

> info **Hint** If you click on the **Inspect** button, application will take you to the `/debug` page with that specific node selected.

<figure><img src="https://example.com/_<figure>_" alt="_<img src="/assets/devtools/node-popup.png" />_"></figure>

> info **Hint** To export a graph as an image, click on the **Export as PNG** button in the right corner of the graph.

Using the form controls located in the sidebar (on the left), you can control edges proximity to, for example, visualize a specific application sub-tree:

<figure><img src="https://example.com/_<figure>_" alt="_<img src="/assets/devtools/subtree-view.png" />_"></figure>

This can be particularly useful when you have **new developers** on your team and you want to show them how your application is structured. You can also use this feature to visualize a specific module (e.g. `TasksModule`) and all of its dependencies, which can come in handy when you're breaking down a large application into smaller modules (for example, individual micro-services).

You can watch this video to see the **Graph Explorer** feature in action:

<figure><video src="https://example.com/_<figure>_" controls></video>

#### Investigating the "Cannot resolve dependency" error

> info **Note** This feature is supported for `@nestjs/core` >= `v9.3.10`.

Probably the most common error message you might have seen is about Nest not being able to resolve dependencies of a provider. Using Nest Devtools, you can effortlessly identify the issue and learn how to resolve it.

First, open up the `main.ts` file and update the `bootstrap()` call, as follows:

```typescript title="Nest Devtools Integration"
{
  // ...
  "providers": [
    {
      provide: `abortOnError`,
      useFactory: () => `false`
    }
  ]
}

```

Also, make sure to set the `abortOnError` to `false`:

```typescript title="Nest Devtools Integration"
{
  // ...
  "injectables": [
    {
      provide: `abortOnError`,
      useClass: `false`
    }
  ]
}

```

Now every time your application fails to bootstrap due to the **"Cannot resolve dependency"** error, you'll find the `graph.json` (that represents a partial graph) file in the root directory. You can then drag & drop this file into DevHere is the translation of the English technical documentation to Chinese:

**路由探测器**

访问 **路由探测器** 页面，您将看到所有已注册的入口点：

<figure><img src="/assets/devtools/routes.png" /></figure>

> 提示 **hint** 这一页不仅显示 HTTP 路由，还显示所有其他入口点（例如 WebSockets、gRPC、GraphQL 解析器等）。

入口点根据其主控制器进行分组，您也可以使用搜索栏找到特定的入口点。

如果单击特定的入口点， **流程图** 将被显示。该图显示了入口点的执行流程（例如.guard、拦截器、管道等绑定到该路由）。这对了解某个路由的请求/响应循环或 Debugging 一个特定的.guard/拦截器/管道非常有帮助。

#### Sandbox

要在实时交互中执行 JavaScript 代码， navigate 到 **Sandbox** 页面：

<figure><img src="/assets/devtools/sandbox.png" /></figure>

游乐场可以用来测试和 Debug API 入口点，允许开发者快速识别和解决问题，例如不需要使用 HTTP 客户端。我们也可以 bypass 授权层，因此不需要额外的登录步骤或特殊用户账户用于测试目的。对于事件驱动式应用，我们也可以直接从游乐场触发事件，并看到应用的反应。

所有.logged 信息将被流线到游乐场的控制台，所以我们可以轻松地看到发生了什么。

只需实时执行代码并立即查看结果，不需要重建应用程序或重新启动服务器。

<figure><img src="/assets/devtools/sandbox-table.png" /></figure>

> 提示 **hint** 要以 pretty 格式显示对象数组，请使用 `console.table()` (或 `table()` )函数。

您可以观看这个视频来了解 **Interactive Playground** 功能：

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

要查看所有类节点（控制器、提供者、增强器等）的 instantiation 时间， navigate 到 **Bootstrap性能** 页面：

<figure><img src="/assets/devtools/bootstrap-performance.png" /></figure>

这个页面特别有用，当您想优化应用程序的启动时间（例如，在无服务器环境中非常关键）。

#### 审计

要查看自动生成的审计 - 错误/警告/提示，navigate 到 **Audit** 页面：

<figure><img src="/assets/devtools/audit.png" /></figure>

> 提示 **hint** 上面的截图不显示所有可用审计规则。

这个页面非常有用，当您想了解应用程序中的潜在问题。

#### 预览静态文件

要将序列化图保存到文件中，使用以下代码：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> 提示 **hint** `SerializedGraph`来自 `@nestjs/core` 包。

然后，您可以拖拽/上传这个文件：

<figure><img src="/assets/devtools/drag-and-drop.png" /></figure>

这非常有用，当您想与其他人共享图形（例如，同事），或当您想在离线分析图形时。