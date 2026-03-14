<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:23:47.380Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是一种使用 `@nestjs/platform-express` 装饰器注解的类，实现了 `http` 接口。

__HTML_TAG_86____HTML_TAG_87____HTML_TAG_88__

拦截器具有以下有用的能力，受到 __LINK_91__ (AOP) 技术的启发。它们使您可以：

* 在方法执行前/后绑定额外的逻辑
* 转换从函数返回的结果
* 转换函数抛出的异常
* 扩展基本函数行为
* 根据特定条件完全override函数（例如，用于缓存目的）

#### 基本

每个拦截器实现 `https` 方法，该方法接收两个参数。第一个参数是 __INLINE_CODE_15__ 实例（与 __LINK_92__ 中的完全相同）。 __INLINE_CODE_16__ 继承自 __INLINE_CODE_17__。我们在异常过滤器章节之前已经见过 __INLINE_CODE_18__。在那里，我们看到它是一个对原始处理程序传递的参数的包装器，包含不同参数数组，根据应用程序的类型。您可以返回到 __LINK_93__ 以获取更多信息。

#### 执行上下文

通过扩展 __INLINE_CODE_19__，__INLINE_CODE_20__ 也添加了一些新的帮助方法，这些方法提供了关于当前执行过程的更多信息。这些信息可以帮助您构建更通用的拦截器，可以在广泛的控制器、方法和执行上下文中工作。了解更多关于 __INLINE_CODE_21__ __LINK_94__。

#### 调用处理程序

第二个参数是 __INLINE_CODE_22__。__INLINE_CODE_23__ 接口实现了 __INLINE_CODE_24__ 方法，您可以使用它来在拦截器中调用路由处理程序方法。如果您不在 __INLINE_CODE_26__ 方法的实现中调用 __INLINE_CODE_25__ 方法，路由处理程序方法将不会被执行。

这种方法意味着 __INLINE_CODE_27__ 方法实际上**包装**了请求/响应流。因此，您可以在 __INLINE_CODE_28__ 方法中编写代码，执行**在**调用 __INLINE_CODE_29__ 之前，但如何影响后续的执行？因为 __INLINE_CODE_30__ 方法返回一个 __INLINE_CODE_31__，我们可以使用强大的 __LINK_95__ 运算符来进一步 manipulation 响应。使用面向对象编程术语，路由处理程序的调用（即调用 __INLINE_CODE_32__）称为__LINK_96__，表明我们的额外逻辑是在其中插入的。

例如，考虑一个incoming __INLINE_CODE_33__ 请求。这请求将被发送到 __INLINE_CODE_34__ 处理程序中，该处理程序定义在 __INLINE_CODE_35__ 中。如果在途中调用了不调用 __INLINE_CODE_36__ 方法的拦截器，__INLINE_CODE_37__ 方法将不会被执行。__INLINE_CODE_38__ 被调用后（并且其 __INLINE_CODE_39__ 已经返回），__INLINE_CODE_40__ 处理程序将被触发。然后，响应流将被接收到 __INLINE_CODE_41__，并对流进行进一步操作，最后将结果返回给调用者。

__HTML_TAG_89____HTML_TAG_90__

####方面拦截

我们的第一个用例是使用拦截器来记录用户交互（例如，存储用户调用，异步 dispatch 事件或计算时间戳）。我们展示了一个简单的 __INLINE_CODE_42__：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(AppModule, {
  httpsOptions,
});
await app.listen(process.env.PORT ?? 3000);

```

> info **Hint** __INLINE_CODE_43__ 是一个通用接口，其中 __INLINE_CODE_44__ 表示 __INLINE_CODE_45__ 的类型（支持响应流），并且 __INLINE_CODE_46__ 是 __INLINE_CODE_47__ 包含的值的类型。

> warning **Notice** 拦截器，类似于控制器、提供者、守卫和其他，可以**注入依赖**通过它们的 __INLINE_CODE_48__。

因为 __INLINE_CODE_49__ 返回一个 RxJS __INLINE_CODE_50__，我们有广泛的选择可以用来操作流。在上面的示例中，我们使用了 __INLINE_CODE_51__ 运算符，它在观察流的正常或异常终止时调用我们的匿名日志函数，但不干扰响应周期。

#### 绑定拦截器

为了设置拦截器，我们使用 __INLINE_CODE_52__ 装饰器，从 __INLINE_CODE_53__ 包中导入。像 __LINK_97__ 和 __LINK_98__，拦截器可以是控制器级别的、方法级别的或全局级别的。

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);

```

> info **Hint** __INLINE_CODE_54__ 装饰器来自 __INLINE_CODE_55__ 包。

使用上述构建，每个路由处理程序定义在 __INLINE_CODE_56__ 中将使用 __INLINE_CODE_57__。当 someone 调用 __INLINE_CODE_58__ 端点时，您将在标准输出中看到以下输出：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const server = express();
const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
await app.init();

const httpServer = http.createServer(server).listen(3000);
const httpsServer = https.createServer(httpsOptions, server).listen(443);

```Here is the translation of the provided English technical documentation to Chinese:

**Note**：

我们将使用 __INLINE_CODE_59__ 类（而不是实例），将责任交给框架，启用依赖注入。正如对管道、守卫和异常过滤器一样，我们也可以传递实例：

```typescript
@Injectable()
export class ShutdownObserver implements OnApplicationShutdown {
  private httpServers: http.Server[] = [];

  public addHttpServer(server: http.Server): void {
    this.httpServers.push(server);
  }

  public async onApplicationShutdown(): Promise<void> {
    await Promise.all(
      this.httpServers.map(
        (server) =>
          new Promise((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
              } else {
                resolve(null);
              }
            });
          }),
      ),
    );
  }
}

const shutdownObserver = app.get(ShutdownObserver);
shutdownObserver.addHttpServer(httpServer);
shutdownObserver.addHttpServer(httpsServer);

```

正如前所述，该构造将拦截器附加到每个由此控制器声明的处理程序上。如果我们想将拦截器的作用域限制到单个方法，我们可以将装饰器应用于 **方法级别**。

要设置全局拦截器，我们使用 Nest 应用程序实例的 __INLINE_CODE_60__ 方法：

__CODE_BLOCK_4__

全局拦截器在整个应用程序中使用，每个控制器和每个路由处理程序。从依赖注入角度来看，全局拦截器从外部模块（使用 __INLINE_CODE_61__，如示例中所示）注册不能注入依赖项，因为这在任何模块的上下文外进行。要解决这个问题，可以在任何模块中使用以下构造来设置拦截器：

__CODE_BLOCK_5__

> 提示 **Hint** 使用这个方法来为拦截器执行依赖注入时，注意无论是在哪个模块中使用这个构造，拦截器实际上是全局的。在哪里使用？选择定义拦截器的模块（如示例中所示的 __INLINE_CODE_62__）。此外， __INLINE_CODE_63__ 并不是唯一的自定义提供者注册方法。了解更多 __LINK_99__。

#### Response mapping

我们已经知道 __INLINE_CODE_64__ 返回一个 __INLINE_CODE_65__. 流包含由路由处理程序返回的值，因此可以使用 RxJS 的 __INLINE_CODE_66__ 操作符轻松地将其 mutate。

> 警告 **Warning** 响应映射功能不支持库特定的响应策略（使用 __INLINE_CODE_67__ 对象直接 forbidden）。

让我们创建一个 __INLINE_CODE_68__，它将在每个响应中进行简单的修改，以示演示该过程。它将使用 RxJS 的 __INLINE_CODE_69__ 操作符将响应对象分配到一个新的对象的 __INLINE_CODE_70__ 属性中，并将新对象返回给客户端。

__CODE_BLOCK_6__

> 提示 **Hint** Nest 拦截器可以与同步和异步 __INLINE_CODE_71__ 方法一起工作。您可以简单地将方法切换到 __INLINE_CODE_72__。

使用上述构造，某人调用 __INLINE_CODE_73__ 端口时，响应将如下所示（假设路由处理程序返回一个空数组 __INLINE_CODE_74__）：

__CODE_BLOCK_7__

拦截器在整个应用程序中创造可重用的解决方案，以满足整个应用程序的需求。例如，我们需要将每个 __INLINE_CODE_75__ 值转换为空字符串 __INLINE_CODE_76__。我们可以使用一行代码将拦截器绑定到全局上下文中，以便自动使用每个注册的处理程序。

__CODE_BLOCK_8__

#### Exception mapping

另一个有趣的用例是使用 RxJS 的 __INLINE_CODE_77__ 操作符来Override 异常：

__CODE_BLOCK_9__

#### Stream overriding

有时候，我们可能想要完全阻止调用处理程序并返回不同的值。一个明显的示例是实现缓存以改进响应速度。让我们查看一个简单的 **缓存拦截器**，它返回缓存的响应。在实际示例中，我们将想要考虑其他因素，如 TTL、缓存无效、缓存大小等，但这超出了讨论的范围。我们将提供一个基本示例，演示主要概念。

__CODE_BLOCK_10__

我们的 __INLINE_CODE_78__ 中有一个硬编码的 __INLINE_CODE_79__ 变量和一个硬编码的响应 __INLINE_CODE_80__。要注意的是，我们在这里返回了一个新的流，使用 RxJS 的 __INLINE_CODE_81__ 操作符创建的，因此路由处理程序 **不会被调用**。当某人调用使用 __INLINE_CODE_82__ 的端口时，响应（一个硬编码的空数组）将被返回。为了创建一个通用的解决方案，可以使用 __INLINE_CODE_83__ 并创建一个自定义装饰器。 __INLINE_CODE_84__ 在 __LINK_100__ 章节中有详细描述。

#### More operators

使用 RxJS 操作符来处理流提供了许多可能性。让我们考虑另一个常见的用例。假设你想在路由请求中处理 **超时**。当你的端口在一定时间内没有返回任何内容时，你想终止并返回错误响应。以下构造启用了这个：

__CODE_BLOCK_11__

在 5 秒后，请求处理将被取消。您也可以在抛出 __INLINE_CODE_85__ 之前添加自定义逻辑（例如释放资源）。