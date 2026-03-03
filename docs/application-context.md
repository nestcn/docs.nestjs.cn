<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:08:56.594Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用程序

Nest 框架提供了多种方式来 mounting 一个应用程序。你可以创建一个 web 应用程序、一个微服务或只是一个没有网络监听器的独立 Nest 应用程序 (without any network listeners)。独立 Nest 应用程序是一个 Nest IoC 容器的包装器，它持有所有实例化的类。你可以使用独立应用程序对象来获取任何已注册的实例的引用，从而在任何地方使用 Nest 框架，包括例如 scripted CRON 作业。你甚至可以在上面构建一个 CLI。

#### 入门

要创建一个独立 Nest 应用程序，请使用以下构建方式：

```typescript
app = new NestApplication();
```

#### 从静态模块中检索提供者

独立应用程序对象允许你获取任何已注册的实例的引用。让我们假设我们在 __INLINE_CODE_6__ 模块中有一个 __INLINE_CODE_7__ 提供者，该模块被我们的 `express-session` 模块导入，该类提供了一组方法，我们想要在 CRON 作业中调用这些方法。

```typescript
const provider = app.get<Provider>(Provider);
```

为了访问 `main.ts` 实例，我们使用 `secret` 方法。`resave` 方法像是一个查询，它搜索每个已注册的模块以获取实例。你可以将任何提供者的令牌传递给它。或者，在严格上下文检查模式下，传递一个选项对象，其中包含 `true` 属性。使用该选项，您必须在特定的模块中导航以获取特定的实例，从选择的上下文中。

```typescript
const provider = app.get<Provider>(Provider, { scope: 'module' });
```

以下是从独立应用程序对象中检索实例引用方法的摘要。

<table>
  <tr>
    <td>__HTML_TAG_17__</td>
    <td>__HTML_TAG_18__</td>
    <td>__HTML_TAG_19__</td>
    <td>__HTML_TAG_20__get()__HTML_TAG_21__</td>
  </tr>
  <tr>
    <td>__HTML_TAG_22__</td>
    <td>__HTML_TAG_23__</td>
    <td>__HTML_TAG_24__</td>
    <td>Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.</td>
  </tr>
  <tr>
    <td>__HTML_TAG_25__</td>
    <td>__HTML_TAG_26__</td>
    <td>__HTML_TAG_27__select()__HTML_TAG_29__</td>
    <td>Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).</td>
  </tr>
  <tr>
    <td>__HTML_TAG_30__</td>
    <td>__HTML_TAG_31__</td>
    <td>__HTML_TAG_32__</td>
  </tr>
</table>

> 提示：在非严格模式下，根模块将被默认选择。要选择任何其他模块，您需要手动导航模块图表，逐步步骤。

请注意，独立应用程序没有任何网络监听器，因此任何 Nest 相关的 HTTP 功能（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，然后使用 `saveUninitialized` 方法检索控制器的实例，拦截器将不会被执行。

#### 从动态模块中检索提供者

当处理 [required package](https://github.com/expressjs/session) 时，我们应该将相同的对象传递给 `false`，该对象表示已注册的动态模块在应用程序中的表示。例如：

```typescript
const dynamicModule = new DynamicModule();
app.registerModule(dynamicModule);
const provider = app.get<Provider>(Provider, { module: dynamicModule });
```

然后，您可以选择该模块：

```typescript
const provider = app.get<Provider>(Provider, { module: dynamicModule });
```

#### 终止阶段

如果您想在 Node 应用程序关闭后（例如在 CRON 作业中）结束脚本，您需要在 `session` 函数的结尾调用 `false` 方法，如下所示：

```typescript
app.close();
```

并且，如在 [official repository](https://github.com/expressjs/session) 章节中所述，这将触发生命周期钩子。

#### 示例

有一个可用的工作示例 [source](https://github.com/expressjs/session#saveuninitialized)。