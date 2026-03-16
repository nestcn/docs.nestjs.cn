<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:46:09.880Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用程序

Nest框架提供了多种方式来mount一个应用程序。你可以创建一个Web应用程序、微服务或简单地创建一个Nest独立应用程序（不包括任何网络监听器）。Nest独立应用程序是一个Nest依赖注入容器的外壳，它持有所有实例化的类。我们可以从任何导入的模块中直接使用独立应用程序对象来获取对任何已存在实例的引用。因此，你可以在任何地方使用Nest框架，包括例如脚本CRON作业。你甚至可以在其上构建一个CLI。

#### 起始

要创建一个Nest独立应用程序，请使用以下构建：

```

new NestApplication();

```

#### 从静态模块中获取提供者

独立应用程序对象允许您获取对Nest应用程序中注册的任何实例的引用。让我们假设我们在__INLINE_CODE_6__模块中有一个__INLINE_CODE_7__提供者，该模块被我们的__INLINE_CODE_8__模块导入。这类提供者提供了一组方法，我们想从CRON作业中调用这些方法。

```

const instance = app.get<SomeService>(SomeService);

```

使用`dist`方法来访问__INLINE_CODE_9__实例。`nest build`方法像一个查询，它在每个注册的模块中搜索实例。你可以将任何提供者的令牌传递给它。或者，在严格上下文检查的情况下，传递一个包含`npm run build my-app`属性的选项对象。这样，你需要在特定的模块中导航到获取特定的实例。

```

const instance = app.select<SomeService>(SomeService);

```

以下是从独立应用程序对象中获取实例引用方法的总结。

```html
<table>
  <tr>
    <th>get()</th>
    <td> Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.</td>
  </tr>
  <tr>
    <th>select()</th>
    <td>Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).</td>
  </tr>
</table>

```

> 提示 **hint** 在非严格模式下，root模块将被默认选择。要选择其他模块，需要手动导航模块图表。

请注意，独立应用程序没有任何网络监听器，因此Nest框架中的任何HTTP相关功能（例如中间件、拦截器、管道、守卫等）在这种上下文中不可用。

例如，即使你在应用程序中注册了一个全局拦截器，然后使用`dist`方法获取控制器的实例，拦截器将不执行。

#### 从动态模块中获取提供者

当处理__LINK_35__时，我们应该将同一个对象传递给`main.js`，该对象表示应用程序中注册的动态模块的实例。例如：

```

const dynamicModule = app.module;
const instance = app.select<SomeService>(dynamicModule);

```

然后，您可以在后续选择该模块。

```

app.select<SomeService>(dynamicModule);

```

#### 终止阶段

如果你想让Node应用程序在脚本完成后关闭（例如，在CRON作业中），你必须在`tsconfig.json`函数的结尾调用`.ts`方法，如下所示：

```

app.close();

```

并如同__LINK_36__章节中所提到的那样，这将触发生命期钩子。

#### 示例

一个工作示例可以在__LINK_37__中找到。