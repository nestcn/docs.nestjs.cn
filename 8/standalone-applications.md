# 独立应用

  有几种安装 Nest 应用程序的方式。您可以创建一个 Web 应用程序，一个微服务或仅一个裸 Nest 独立应用程序（没有任何网络监听）。Nest 独立应用程序是 Nest IoC 容器的封装，该容器包含所有实例化的类。我们可以使用独立的应用程序对象直接从导入的模块中获取现有实例的引用。因此，您可以在任何地方利用 Nest 框架，包括 CRON 脚本。您甚至可以在其之上构建 CLI。

## 入门

要创建 Nest 独立应用程序，请使用以下结构：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);
  // application logic...
}
bootstrap();
```

独立的应用程序对象使您可以获取对 Nest 应用程序中注册的任何实例的引用。让我们想象一下，我们有一个 TasksService 在 TasksModule 中。此类提供了一组我们想从 CRON 任务中调用的函数。

```typescript
const app = await NestFactory.create(ApplicationModule);
const tasksService = app.get(TasksService);
```

要访问 TasksService 实例，我们使用 get() 函数。该 get() 函数的作用类似于在每个注册模块中搜索实例的查询。或者，要进行严格的上下文检查，请传递带有strict:true 属性的 options 对象。启用此选项后，您必须浏览特定的模块才能从选定的上下文中获取特定的实例。

```typescript
const app = await NestFactory.create(AppModule);
const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
```

以下是可用于从独立应用程序对象检索实例引用的方法的摘要:

|||
|:---|:---|
|get()|检索应用程序上下文中可用的控制器或提供程序的实例（包括守卫，筛选器等）|
|select()|浏览模块列表以从所选模块中拉出特定实例（与如上所述的严格模式一起使用）|


?> 在非严格模式下，默认情况下会选择根模块。要选择任何其他模块，您需要逐步逐步浏览模块列表。

如果要在脚本完成后关闭节点应用程序（例如，对于运行 CRON 的脚本），请添加 await app.close()到 bootstrap 函数的末尾：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);
  // application logic...
  await app.close();
}
bootstrap();
```







