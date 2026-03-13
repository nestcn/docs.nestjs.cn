<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:19:42.618Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用程序

Nest框架提供了多种方式来mount应用程序。您可以创建一个Web应用程序、微服务或只是一个独立的Nest应用程序（没有任何网络监听器）。Nest独立应用程序是一个对Nest依赖注入容器的包装，它持有所有实例化的类。我们可以从任何已导入的模块中直接使用独立应用程序对象获得对任何现有实例的引用。因此，您可以在任何地方使用Nest框架，包括例如脚本CRON作业。您甚至可以构建一个基于它的CLI。

#### 入门

要创建一个Nest独立应用程序，请使用以下构建：

```typescript
const app = new NestApplication();

```

#### 从静态模块中获取提供者

独立应用程序对象允许您获得对Nest应用程序中注册的任何实例的引用。让我们假设我们在__INLINE_CODE_6__模块中有一个__INLINE_CODE_7__提供者，该模块被我们的__INLINE_CODE_8__模块导入。这个类提供了一组方法，我们想从CRON作业中调用这些方法。

```typescript
const instance = app.get<Instance>(InlineCode9);

```

要访问__INLINE_CODE_9__实例，我们使用`dist`方法。`nest build`方法类似于一个查询，它在每个已注册的模块中搜索实例。您可以将任何提供者的令牌传递给它。Alternatively, for strict context checking, pass an options object with the `npm run build my-app` property. With this option in effect, you have to navigate through specific modules to obtain a particular instance from the selected context.

```typescript
const instance = app.get<Instance>(InlineCode9, { scope: InlineCode8 });

```

以下是从独立应用程序对象中获取实例引用方法的总结。

**表 1**

| 方法名            | 描述         |
| ----------------- | ------------- |
| get()          | 获取controller或提供者的实例（包括guards、filters等） |
| select()      | 在模块图中导航到特定的实例 |

> 提示 **Hint** 在非严格模式下，根模块将被选择为默认值。要选择其他模块，您需要手动导航模块图，步骤由步。

请注意，独立应用程序不具有任何网络监听器，所以Nest框架中的任何HTTP相关特性（例如中间件、拦截器、管道、guards等）在这个上下文中不可用。

例如，即使您在应用程序中注册了全局拦截器，然后使用`dist`方法检索控制器的实例，拦截器也将不会被执行。

#### 从动态模块中获取提供者

当处理__LINK_35__时，我们需要将同一个对象传递给`main.js`，该对象表示注册的动态模块在应用程序中的表示。例如：

```typescript
const dynamicModule = new DynamicModule();
app.registerModule(dynamicModule);
const instance = app.get<Instance>(InlineCode9, dynamicModule);

```

然后，您可以在后续选择该模块：

```typescript
app.select(dynamicModule);

```

#### 终止阶段

如果您想在脚本完成后让Node应用程序关闭（例如，在CRON作业中），您必须在`tsconfig.json`函数的末尾调用`.ts`方法：

```typescript
app.close();

```

并且，如在__LINK_36__章节中所述，这将触发生命周期钩子。

#### 示例

有一个可用的__LINK_37__示例。