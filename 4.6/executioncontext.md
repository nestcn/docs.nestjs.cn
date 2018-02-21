# 执行上下文

有几种安装Nest应用程序的方法。您可以创建一个 Web 应用程序，微服务或只是一个 Nest 执行上下文。Nest 上下文是Nest 容器的一个包装，它包含所有实例化的类。我们可以直接使用应用程序对象从任何导入模块中获取任何现有的实例。由此，您可以充分利用 Nest 框架的优势，包括 CRON 作业，甚至可以在其上构建 CLI。

要创建 Nest 应用程序上下文，我们使用以下语法：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);
  // logic.. :)
}
bootstrap();
```

之后，Nest 允许您选择在 Nest 应用程序中注册的任何实例。让我们想象一下，我们有一个 TasksController 在TasksModule。这个类提供了一组可用的方法，我们想从 CRON 工作中调用。\

```typescript
const app = await NestFactory.create(ApplicationModule);
const tasksController = app
  .select(TasksModule)
  .get(TasksController);
```

就是这样。为了抓取 TasksController 实例，我们使用了两种方法，在下表中有详细描述：

|||
|----|----|
|get()|	可以检索已处理模块内部可用的组件或控制器的实例。|
|select()|	允许您浏览模块树，例如，从所选模块拉出特定实例。|

?> 默认情况下选择根模块。要选择任何其他模块，您需要遍历整个模块堆栈（逐步）。

