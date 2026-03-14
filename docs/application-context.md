<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:16:58.108Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用

Nest 提供了多种方式来挂载应用程序。您可以创建一个 web 应用程序、微服务或只是一个独立的 Nest 应用程序（没有网络监听器）。Nest 独立应用程序是一个对 Nest IoC 容器的包装，它持有所有实例化的类。我们可以从任何已导入的模块中直接使用独立应用程序对象来获取对任何已存在的实例的引用。因此，您可以在任何地方使用 Nest 框架，包括 scripted CRON 作业。您甚至可以构建一个基于它的 CLI。

#### 获取开始

要创建一个 Nest 独立应用程序，请使用以下构造：

```typescript title="standalone application"

```

#### 从静态模块中获取提供者

独立应用程序对象允许您获取对 Nest 应用程序中注册的任何实例的引用。让我们假设我们在 __INLINE_CODE_6__ 模块中有一个 __INLINE_CODE_7__ 提供者，该模块由我们的 __INLINE_CODE_8__ 模块导入，该模块提供了一组方法，我们想从 CRON 作业中调用这些方法。

```typescript title="example"

```

要访问 __INLINE_CODE_9__ 实例，我们使用 `dist` 方法。 `nest build` 方法类似于一个查询，它将在每个已注册的模块中搜索实例。您可以将任何提供者的令牌传递给它。或者，在严格上下文检查的情况下，传递一个 options 对象，其中包含 `npm run build my-app` 属性。使用该选项，您需要在特定的模块中导航以获取特定的实例。

```typescript title="example"

```

以下是从独立应用程序对象中获取实例引用方法的摘要。

__HTML_TAG_17__
  __HTML_TAG_18__
    __HTML_TAG_19__
      __HTML_TAG_20__get()__HTML_TAG_21__
    __HTML_TAG_22__
    __HTML_TAG_23__
      获取应用程序上下文中可用的控制器或提供者的实例（包括守卫、过滤器等）。
    __HTML_TAG_24__
  __HTML_TAG_25__
  __HTML_TAG_26__
    __HTML_TAG_27__
      __HTML_TAG_28__select()__HTML_TAG_29__
    __HTML_TAG_30__
    __HTML_TAG_31__
      在模块图中导航以获取特定的实例（在严格模式下使用）。
    __HTML_TAG_32__
  __HTML_TAG_33__
__HTML_TAG_34__

> info **提示** 在非严格模式下，根模块将被默认选择。要选择其他模块，您需要手动导航模块图，逐步导航。

请注意，独立应用程序没有网络监听器，因此 Nest 相关的 HTTP 功能（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，然后使用 `dist` 方法获取控制器的实例，但是拦截器将不会被执行。

#### 从动态模块中获取提供者

在处理 __LINK_35__ 时，我们应该将相同的对象传递给 `main.js`，该对象表示在应用程序中注册的动态模块。例如：

```typescript title="example"

```

然后，您可以选择该模块：

```typescript title="example"

```

#### 终止阶段

如果您想在脚本完成后（例如，在 CRON 作业中）关闭 Node 应用程序，您必须在 `tsconfig.json` 函数的结尾处调用 `.ts` 方法，如下所示：

```typescript title="example"

```

并如前所述，在 __LINK_36__ 章节中，这将触发生命周期钩子。

#### 示例

有一个可用的示例 __LINK_37__。

Note: I've kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I've also translated code comments from English to Chinese.