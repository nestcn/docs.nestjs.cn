<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T02:49:46.540Z -->
<!-- 源文件: content/application-context.md -->

### standalone 应用

Nest 应用程序可以有多种方式进行挂载。您可以创建一个 web 应用程序、一个微服务或只是一个没有网络监听器的 Nest standalone 应用程序（无网络监听器）。Nest standalone 应用程序是一个对 Nest IoC 容器的包装器，它持有所有实例化的类。我们可以从任何导入的模块中使用 standalone 应用程序对象来获取任何已存在的实例的引用。因此，您可以在任何地方使用 Nest 框架，包括例如脚本的 CRON 工作或 CLI。

#### 入门

创建一个 Nest standalone 应用程序请使用以下构造：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // your application logic here ...
}
bootstrap();
```

#### 从静态模块中获取提供者

standalone 应用程序对象允许您获取 Nest 应用程序中注册的任何实例的引用。让我们假设我们在 `TasksService` 模块中有一个 `TasksModule` 提供者，该模块被我们的 `AppModule` 模块导入。这类提供者提供了一组方法，我们想从 CRON 工作中调用这些方法。

```typescript
const tasksService = app.get(TasksService);
```

要访问 `TasksService` 实例，我们使用 `get()` 方法。`get()` 方法像一个查询一样搜索每个注册模块中的实例。您可以将任何提供者的令牌传递给它。或者，在严格上下文检查的情况下，传递一个包含 `strict: true` 属性的选项对象。使用该选项，您需要在特定的模块中导航以获取特定的实例。

```typescript
const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
```

以下是从 standalone 应用程序对象中获取实例引用方法的总结。

<table>
  <tr>
    <td>
      <code>get()</code>
    </td>
    <td>
      Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.
    </td>
  </tr>
  <tr>
    <td>
      <code>select()</code>
    </td>
    <td>
      Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).
    </td>
  </tr>
</table>

> info **Hint** 在非严格模式下，root 模块默认被选择。在选择其他模块时，您需要手动导航模块图。

请注意，standalone 应用程序没有网络监听器，因此与 HTTP 相关的 Nest 功能（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，然后使用 `app.get()` 方法获取控制器的实例，拦截器将不会被执行。

#### 从动态模块中获取提供者

在处理 [dynamic modules](/fundamentals/dynamic-modules) 时，我们需要向 `app.select` 传递相同的对象，该对象表示应用程序中注册的动态模块。例如：

```typescript
export const dynamicConfigModule = ConfigModule.register({ folder: './config' });

@Module({
  imports: [dynamicConfigModule],
})
export class AppModule {}
```

然后，您可以在后续选择该模块：

```typescript
const configService = app.select(dynamicConfigModule).get(ConfigService, { strict: true });
```

#### 终止阶段

如果您想在 Node 应用程序关闭后（例如在 CRON 工作中）结束脚本，必须在 `bootstrap` 函数的末尾调用 `app.close()` 方法，如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // application logic...
  await app.close();
}
bootstrap();
```

正如在 [Lifecycle events](/fundamentals/lifecycle-events) 章节中所述，这将触发生命周期钩子。

#### 示例

有一个可工作的示例可在 [here](https://github.com/nestjs/nest/tree/master/sample/18-context) 中找到。