# 应用上下文

有几种安装 `Nest` 应用程序的方法。您可以创建一个 `Web` 应用程序，微服务或只是一个 `Nest`  **执行上下文** 。 `Nest` 上下文是 `Nest` 容器的一个包装，它包含所有实例化的类。我们可以直接使用 `application` 对象从任何导入的模块中获取现有实例。由于这一点，您可以充分利用 `Nest` 框架的优势，包括 **CRON** 任务，甚至可以在其上构建 **CLI** 。

### 开始

为了创建一个 `Nest` 应用程序上下文，我们使用下面的语法：

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);
  // application logic...
}
bootstrap();
```

之后，`Nest` 允许您选择在 `Nest` 应用程序中注册的任何实例。假设我们在 `TasksModule` 中有一个 `TasksController` 。这个类提供了一组我们想从 `CRON` 任务中调用可用的方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
const tasksService = app.get(TasksService);
```

就是这样。要获取 `TasksController` 实例，我们必须使用 `get()` 方法。我们不必遍历整个模块树，`get()` 方法就像 **查询** 一样，自动在每个注册模块中搜索实例。但是，如果您更喜欢严格的上下文检查，则可以使用 `strict: true` 选项对象作为 `get()` 方法的第二个参数传递给它。然后，您必须通过所有模块从选定的上下文中选取特定的实例。

```typescript
const app = await NestFactory.create(ApplicationModule);
const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
```

|               |                                                              |
| :------------ | :----------------------------------------------------------- |
| `get()`       | 检索应用程序上下文中可用的控制器或提供者（包括看守器，过滤器等）的实例。 |
| `select()`    | 浏览模块树，例如，从所选模块中提取特定实例（与启用严格模式一起使用）。   |

?> 默认情况下，根模块处于选中状态。要选择任何其他模块，您需要遍历整个模块树(逐步)。

如果您希望在脚本完成后关闭节点应用程序(对于 `CRON` 作业非常有用)，请在引导函数的末尾添加 `await app.close()`:

```typescript
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);
  // application logic...
  await app.close();
}
bootstrap();
```

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg" height="70" >  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/)
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
