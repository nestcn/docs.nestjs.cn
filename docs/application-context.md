<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:25:10.760Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用程序

Nest 提供了多种方式来 mounting 一个应用程序。您可以创建一个 web 应用程序、微服务或只是一个没有网络监听器的独立 Nest 应用程序 (不带有任何网络监听器)。独立 Nest 应用程序是一个对 Nest IoC 容器的 wrapper，它持有所有实例化的类。我们可以从任何导入的模块中直接使用独立应用程序对象来获取对已存在的实例的引用。因此，您可以在任何地方使用 Nest 框架，包括例如脚本 CRON 作业。您甚至可以构建一个基于它的 CLI。

#### 开始使用

要创建一个独立 Nest 应用程序，请使用以下构造：

```typescript title="main"
async function main() {
  const app = await NestFactory.create(NestAppModule);
  // ...
}

```

#### 从静态模块中获取提供者

独立应用程序对象允许您获取对 Nest 应用程序中注册的任何实例的引用。假设我们在 __INLINE_CODE_7__ 模块中有一个 __INLINE_CODE_6__ 提供者，该模块被我们的 __INLINE_CODE_8__ 模块导入。这类提供者提供了一组方法，我们想要从 CRON 作业中调用这些方法。

```typescript title="example"
app.get<ExampleService>(ExampleService);

```

要访问 __INLINE_CODE_9__ 实例，我们使用 `dist` 方法。`nest build` 方法像一个查询一样，搜索每个已注册模块中的实例。您可以将任何提供者的令牌传递给它。或者，在严格上下文检查模式下，传递一个 options 对象，其中包含 `npm run build my-app` 属性。这样，您就需要在特定的模块中导航到特定的实例，从选择的上下文中获取该实例。

```typescript title="example"
const exampleService = app.get<ExampleService>(ExampleService);

```

以下是从独立应用程序对象中获取实例引用的一些方法。

<table>
  <tr>
    <th>Method</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>get()</td>
    <td>Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.</td>
  </tr>
  <tr>
    <td>select()</td>
    <td>Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).</td>
  </tr>
</table>

> 信息 **提示** 在非严格模式下，根模块将被默认选择。如果您想要选择其他模块，您需要手动导航模块图像，逐步步骤。

请注意，独立应用程序没有网络监听器，所以任何 Nest 相关的 HTTP 特性（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，并然后使用 `dist` 方法获取控制器的实例，拦截器将不会被执行。

#### 从动态模块中获取提供者

当处理 __LINK_35__ 时，我们应该将同一个对象传递给 `main.js`，该对象代表应用程序中已注册的动态模块。例如：

```typescript title="example"
const app = await NestFactory.create(NestAppModule);
const dynamicModule = app.select(Module);

```

然后，您可以选择该模块：

```typescript title="example"
const exampleService = dynamicModule.get<ExampleService>(ExampleService);

```

#### 终止阶段

如果您想要 Node 应用程序在脚本完成后关闭（例如，在 CRON 作业中），您必须在 `tsconfig.json` 函数的结尾调用 `.ts` 方法：

```typescript title="example"
async function main() {
  // ...
  await app.close();
}

```

并如《__LINK_36__》章节所述，这将触发生命周期钩子。

#### 示例

一个工作示例可以在 __LINK_37__ 中找到。