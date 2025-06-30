# 独立应用程序

有几种方式来挂载 Nest 应用程序。您可以创建 Web 应用程序、微服务或仅仅是一个裸露的 Nest **独立应用程序**（没有任何网络监听器）。Nest 独立应用程序是围绕 Nest **IoC 容器**的包装器，它持有所有实例化的类。我们可以直接使用独立应用程序对象从任何导入的模块中获取对任何现有实例的引用。因此，您可以在任何地方利用 Nest 框架，包括例如脚本化的 **CRON** 作业。您甚至可以在其上构建 **CLI**。

#### 入门

要创建 Nest 独立应用程序，请使用以下构造：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // 您的应用程序逻辑在这里...
}
bootstrap();
```

#### 从静态模块检索提供者

独立应用程序对象允许您获取在 Nest 应用程序中注册的任何实例的引用。让我们假设我们在 `TasksModule` 模块中有一个 `TasksService` 提供者，该模块由我们的 `AppModule` 模块导入。这个类提供了一组我们想要从 CRON 作业中调用的方法。

```typescript
const tasksService = app.get(TasksService);
```

要访问 `TasksService` 实例，我们使用 `get()` 方法。`get()` 方法就像一个**查询**，在每个注册的模块中搜索实例。您可以将任何提供者的令牌传递给它。或者，为了严格的上下文检查，传递一个带有 `strict: true` 属性的选项对象。启用此选项后，您必须导航通过特定模块以从选定的上下文中获取特定实例。

```typescript
const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
```

以下是从独立应用程序对象检索实例引用的可用方法摘要。

<table>
  <tr>
    <td>
      <code>get()</code>
    </td>
    <td>
      检索应用程序上下文中可用的控制器或提供者（包括守卫、过滤器等）的实例。
    </td>
  </tr>
  <tr>
    <td>
      <code>select()</code>
    </td>
    <td>
      导航模块图以拉出选定模块的特定实例（与上述严格模式一起使用）。
    </td>
  </tr>
</table>

> info **提示** 在非严格模式下，默认选择根模块。要选择任何其他模块，您需要手动导航模块图，逐步进行。

请记住，独立应用程序没有任何网络监听器，因此任何与 HTTP 相关的 Nest 功能（例如，中间件、拦截器、管道、守卫等）在此上下文中都不可用。

例如，即使您在应用程序中注册了全局拦截器，然后使用 `app.get()` 方法检索控制器的实例，拦截器也不会被执行。

#### 从动态模块检索提供者

当处理[动态模块](/fundamentals/dynamic-modules)时，我们应该提供与在应用程序中注册的动态模块相同的对象给 `app.select`。例如：

```typescript
export const dynamicConfigModule = ConfigModule.register({ folder: './config' });

@Module({
  imports: [dynamicConfigModule],
})
export class AppModule {}
```

然后您可以稍后选择该模块：

```typescript
const configService = app.select(dynamicConfigModule).get(ConfigService, { strict: true });
```

#### 终止阶段

如果您希望 Node 应用程序在脚本完成后关闭（例如，对于运行 CRON 作业的脚本），您必须在 `bootstrap` 函数的末尾调用 `app.close()` 方法，如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // 应用程序逻辑...
  await app.close();
}
bootstrap();
```

如[生命周期事件](/fundamentals/lifecycle-events)章节中所述，这将触发生命周期钩子。

#### 示例

完整的工作示例可在[这里](https://github.com/nestjs/nest/tree/master/sample/18-context)找到。
