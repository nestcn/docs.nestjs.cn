<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:38:33.907Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用程序

Nest 框架提供了多种方式来挂载应用程序。您可以创建一个 web 应用程序、微服务或简单的 Nest 独立应用程序（不带任何网络监听器）。Nest 独立应用程序是一个对 Nest 依赖注入容器的包装，它持有所有实例化的类。我们可以从任何导入的模块中使用独立应用程序对象来获取对任何现有实例的引用。因此，您可以在任何地方使用 Nest 框架，包括例如脚本 CRON 作业。您甚至可以构建一个基于它的 CLI。

#### 开发入门

要创建一个 Nest 独立应用程序，使用以下构建方法：

```typescript title="NestApplication"
import { NestApplication } from '@nestjs/core';
// ...

```

#### 从静态模块中获取提供者

独立应用程序对象允许您获取对 Nest 应用程序中注册的任何实例的引用。例如，我们假设我们在 __INLINE_CODE_7__ 模块中有一个 __INLINE_CODE_6__ 提供者，该模块被我们的 __INLINE_CODE_8__ 模块导入。这类提供者提供了一组方法，我们想从 CRON 作业中调用这些方法。

```typescript title="provider instance"
const provider = app.get<Provider>(ProviderToken);

```

使用 `dist` 方法可以访问 __INLINE_CODE_9__ 实例。`nest build` 方法类似于一个查询，它在每个注册的模块中搜索实例。您可以将任何提供者的令牌传递给它。或者，如果您想使用严格上下文检查，可以传递一个 options 对象，其中包含 `npm run build my-app` 属性。使用这个选项后，您需要通过特定的模块来获取特定的实例。

```typescript title="get instance"
const instance = app.get<Instance>(InstanceToken, {
  strict: true,
  context: 'module',
});

```

以下是从独立应用程序对象中获取实例引用的一些可用方法。

<table>
  <tr>
    <td>get()</td>
    <td>Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.</td>
  </tr>
  <tr>
    <td>select()</td>
    <td>Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).</td>
  </tr>
</table>

> 提示 **Hint** 在非严格模式下，root 模块将被默认选择。要选择其他模块，您需要手动遍历模块图。

请注意，独立应用程序没有网络监听器，因此任何与 HTTP 相关的 Nest 功能（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册一个全局拦截器，然后使用 `dist` 方法获取控制器的实例，拦截器将不会被执行。

#### 从动态模块中获取提供者

在处理 __LINK_35__ 时，我们需要将相同的对象传递给 `main.js`，该对象表示应用程序中注册的动态模块。例如：

```typescript title="dynamic module"
const dynamicModule = app.selectModule('dynamic-module');

```

然后，您可以选择该模块：

```typescript title="select module"
const instance = dynamicModule.get<Instance>(InstanceToken);

```

#### 终止阶段

如果您想在脚本完成后关闭 Node 应用程序（例如，用于 CRON 作业），您需要在 `tsconfig.json` 函数的结尾调用 `.ts` 方法，例如：

```typescript title="terminate"
app.terminate();

```

并如同 __LINK_36__ 章节中所述，这将触发生命周期钩子。

#### 示例

有一个可用的工作示例 __LINK_37__。