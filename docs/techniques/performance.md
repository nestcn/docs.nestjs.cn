<!-- 此文件从 content/techniques/performance.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:47:24.363Z -->
<!-- 源文件: content/techniques/performance.md -->

###_performance_(fastify)

Nest 默认使用 __LINK_25__ 框架。如前所述，Nest 还提供了与其他库的兼容性，例如 __LINK_26__。Nest 实现了框架适配器，以便将中间件和处理程序代理到适当的库特定的实现中。

> info **提示** 为了实现框架适配器，目标库需要提供与 Express 相似的请求/响应管道处理。

__LINK_27__ 是 Nest 的一个不错的选择，因为它解决了设计问题，类似于 Express。然而，fastify 相比 Express 要更快，达到 almost two times better 的性能结果。一个合理的问题是 Nest 为什么使用 Express 作为默认的 HTTP 提供者？原因是 Express 广泛使用，知名度高，具有庞大的兼容中间件，可以立即对 Nest 用户提供。

但是，因为 Nest 提供了框架独立性，你可以轻松地在它们之间迁移。Fastify 可以在性能非常重要的情况下是一个更好的选择。要使用 Fastify，只需选择本章中显示的内置 __INLINE_CODE_8__。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm i --save @nestjs/axios axios

```

#### 适配器

安装了 Fastify 平台后，我们可以使用 __INLINE_CODE_9__。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}

```

默认情况下，Fastify 只监听 __INLINE_CODE_10__ 接口 (__LINK_28__)。如果您想接受其他主机的连接，您应该在 `HttpModule` 调用中指定 __INLINE_CODE_11__：

```typescript
@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Observable<AxiosResponse<Cat[]>> {
    return this.httpService.get('http://localhost:3000/cats');
  }
}

  findAll() {
    return this.httpService.get('http://localhost:3000/cats');
  }
}

```

#### 平台专属包

请注意，如果您使用 `HttpModule`，Nest 将使用 Fastify 作为 **HTTP 提供者**。这意味着每个基于 Express 的食谱可能不再工作。你应该使用 Fastify 等效包。

#### 重定向响应

Fastify 对重定向响应的处理方式与 Express 不同。要正确地执行 Fastify 重定向，请返回状态码和 URL，例如：

```typescript
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CatsService],
})
export class CatsModule {}

```

#### Fastify 选项

您可以将选项传递到 Fastify 构造函数中，通过 `HttpService` 构造函数。例如：

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});

```

#### 中间件

中间件函数检索原始 `Observables` 和 `HttpService` 对象，而不是 Fastify 的包装对象。这是 `HttpModule` 包（在底层使用）和 `HttpService` 的工作原理 - 请查看这个 __LINK_29__ 以获取更多信息。

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    timeout: configService.get('HTTP_TIMEOUT'),
    maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
  }),
  inject: [ConfigService],
});

```

#### 路由配置

您可以使用 Fastify 的 __LINK_30__ 功能，并使用 `HttpModule` 装饰器。

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});

```

#### 路由约束

从 v10.3.0 开始，`HttpService` 支持 Fastify 的 __LINK_31__ 功能，并使用 `@nestjs/axios` 装饰器。

```typescript
@Injectable()
class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}

```

> info **提示** `AxiosResponse` 和 `axios` 是来自 `$ npm i axios` 的导入。

#### 示例

可用的工作示例可在 __LINK_32__ 中找到。