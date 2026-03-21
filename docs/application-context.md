<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:02:25.152Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用

Nest 提供了多种方式来挂载一个应用程序。您可以创建一个 Web 应用程序、一个微服务或只是一个没有网络监听器的独立 Nest 应用程序（不包括任何网络监听器）。独立 Nest 应用程序是一个对 Nest IoC 容器的包装，它持有所有实例化的类。我们可以在任何导入的模块中直接使用独立应用程序对象来获取对现有实例的引用。因此，您可以在任何地方使用 Nest 框架，包括例如脚本的 CRON 作业。您甚至可以在其上面构建一个 CLI。

#### 入门

要创建一个独立 Nest 应用程序，请使用以下构建：

```typescript
const app = new NestApplication();

```

#### 从静态模块中检索提供者

独立应用程序对象允许您获取对 Nest 应用程序中注册的任何实例的引用。假设我们在 __INLINE_CODE_6__ 模块中注册了一个 __INLINE_CODE_7__ 提供者，该模块由我们的 __INLINE_CODE_8__ 模块导入。这个类提供了一组方法，我们想从 CRON 作业中调用这些方法。

```typescript
const provider = app.get(__INLINE_CODE_9__);

```

使用 `dist` 方法访问 __INLINE_CODE_9__ 实例。`nest build` 方法像一个查询一样，搜索每个注册的模块中的实例。您可以将任何提供者的令牌传递给它。或者，在严格上下文检查时，传递一个 options 对象，其中包含 `npm run build my-app` 属性。使用这个选项，您需要在特定模块中导航到获取特定的实例。

```typescript
const provider = app.get(__INLINE_CODE_9__, { scope: `npm run build my-app` });

```

以下是从独立应用程序对象中检索实例引用的一些方法。

```markdown
| 方法          | 描述          |
| ---          | ---          |
| get()      | 检索控制器或提供者（包括守卫、过滤器等）的实例。     |
| select()  | 在模块图中导航到获取特定的实例（在严格模式下使用）。    |

```

> 提示 **Hint** 在非严格模式下，默认选择根模块。要选择其他模块，您需要手动导航模块图，步骤步骤。

请注意，独立应用程序没有任何网络监听器，因此 Nest 相关的 HTTP 功能（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，然后使用 `dist` 方法检索控制器的实例，拦截器将不会执行。

#### 从动态模块中检索提供者

当处理 __LINK_35__ 时，我们应该将注册的动态模块在应用程序中的对象传递给 `main.js`。例如：

```typescript
const dynamicModule = new DynamicModule();
app.registerModule(dynamicModule);
const provider = app.get(__INLINE_CODE_9__, dynamicModule);

```

然后，您可以选择该模块：

```typescript
const provider = app.select(dynamicModule).get(__INLINE_CODE_9__);

```

#### 终止阶段

如果您想要 Node 应用程序在脚本完成后关闭（例如，在 CRON 作业中），您必须在您的 `tsconfig.json` 函数结尾调用 `.ts` 方法：

```typescript
app.close();

```

并像在 __LINK_36__ 章节中所述，这将触发生命周期钩子。

#### 示例

有一个可用的 __LINK_37__ 示例。