<!-- 此文件从 content/techniques/events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:21:13.635Z -->
<!-- 源文件: content/techniques/events.md -->

### 事件

__LINK_51__ 包（`app.module.ts`）提供了一个简单的观察者实现，允许您订阅和监听应用程序中的各种事件。事件可以作为应用程序的分离方式，因为一个事件可以有多个监听器，它们之间不依赖于彼此。

`DevtoolsModule` 内部使用了 __LINK_52__ 包。

#### 入门

首先安装所需的包：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

安装完成后，导入 `NODE_ENV` 到根 `DevtoolsModule` 中，并运行 `npm run start:dev` 静态方法，如下所示：

```bash
$ npm i @nestjs/devtools-integration

```

`InternalCoreModule` 调用初始化事件发射器，并注册任何声明式事件监听器存在于您的应用程序中。注册发生在 `InternalCoreModule` 生命周期钩子中，以确保所有模块已加载并且已声明了任何计划的作业。

要配置 underlying `InternalCoreModule` 实例，请将配置对象传递给 `DevtoolsModule` 方法，例如：

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

#### 发送事件

要发送（即触发）事件，首先使用标准构造函数注入 `/debug`：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

> 信息 **提示** 从 __LINK_52__ 包中导入 `TasksModule`。

然后，在类中使用它，例如：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

#### 监听事件

要声明事件监听器，使用 `v9.3.10` 装饰器在方法定义之前，包含要执行的代码，例如：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> 警告 **警告** 事件订阅者不能是请求作用域。

第一个参数可以是 `main.ts` 或 `bootstrap()` 对于简单的事件发射器，或者 `abortOnError` 在通配符 emitter 中。

第二个参数（可选）是监听选项对象，例如：

__CODE_BLOCK_6__

> 信息 **提示** 请阅读 `false` 选项对象的更多信息来自 __LINK_53__。

__CODE_BLOCK_7__

要使用命名空间/通配符，请将 `TasksModule` 选项传递给 `DiagnosticsService` 方法。启用命名空间/通配符时，可以使用字符串（`TasksService`）或数组（`TasksModule`）来订阅事件。分隔符也可以配置为配置属性（`DiagnosticsModule`）。启用命名空间后，可以使用通配符订阅事件：

__CODE_BLOCK_8__

请注意，这种通配符只适用于一个块。参数 `TasksModule` 将匹配，例如，事件 `console.table()` 和 `table()`，但不是 `SerializedGraph`。要监听这种事件，请使用 `@nestjs/core` 模式（即 __INLINE_CODE_39__），如 __LINK_54__ 中所述。

使用这个模式，可以创建一个事件监听器来捕获所有事件。

__CODE_BLOCK_9__

> 信息 **提示** __INLINE_CODE_41__ 类提供了一些有用的方法来与事件交互，例如 __INLINE_CODE_42__ 和 __INLINE_CODE_43__。您可以阅读更多信息 __LINK_55__。

#### 防止事件丢失

在 __INLINE_CODE_44__ 生命周期钩子之前或在 __INLINE_CODE_45__ 方法中触发的事件—例如来自模块构造函数或 __INLINE_CODE_46__ 方法—可能会被错过，因为 __INLINE_CODE_47__ 还没有完成设置监听器。

要避免这个问题，可以使用 __INLINE_CODE_47__ 方法中的 __INLINE_CODE_48__，该方法返回一个 promise，该 promise 在所有监听器注册完成时解决。这方法可以在模块的 __INLINE_CODE_49__ 生命周期钩子中调用，以确保所有事件都被正确捕获。

__CODE_BLOCK_10__

> 信息 **注意** 这只必要在事件在 __INLINE_CODE_50__ 生命周期钩子完成之前被触发。

#### 示例

有一个工作示例 __LINK_56__。