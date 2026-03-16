<!-- 此文件从 content/techniques/performance.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:11:55.416Z -->
<!-- 源文件: content/techniques/performance.md -->

###  Fastify

默认情况下，Nest 使用了 __LINK_25__框架。如前所述，Nest 也提供了与其他库的兼容性，例如 __LINK_26__。Nest 实现了框架适配器，以便将中间件和处理程序代理到适合的库特定实现中。

> 提示 **注意** 为了实现框架适配器，目标库需要提供类似于 Express 的请求/响应管道处理。

__LINK_27__ 是一个很好的 Fastify 替代方案，因为它解决了设计问题，类似于 Express。然而，Fastify 比 Express 快得多，实现了几乎两倍的Benchmark结果。一个公平的问题是，Nest 为什么使用 Express 作为默认的 HTTP 提供者？原因是 Express 广泛使用、知名度高且具有庞大的兼容 middleware 集合，直接可供 Nest 用户使用。

然而，因为 Nest 提供了框架独立性，您可以轻松地在它们之间迁移到 Fastify。Fastify 可以是更好的选择，如果您非常关心性能。要使用 Fastify，简单地选择本章中的内置 __INLINE_CODE_8__。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm i --save @nestjs/axios axios

```

#### 适配器

安装 Fastify 平台后，我们可以使用 __INLINE_CODE_9__。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}

```

默认情况下，Fastify 只监听 __INLINE_CODE_10__ 接口 (__LINK_28__)。如果您想要在其他主机上接受连接，需要在 `HttpModule` 调用中指定 __INLINE_CODE_11__：

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

#### 平台特定包

请注意，当使用 `HttpModule` 时，Nest 使用 Fastify 作为 **HTTP 提供者**。这意味着每个基于 Express 的配方可能不再工作。相反，您应该使用 Fastify 等效包。

#### 重定向响应

Fastify 对重定向响应的处理方式与 Express 略有不同。要正确地执行重定向，返回状态码和 URL，例如：

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

可以将选项传递到 Fastify 构造函数中通过 `HttpService` 构造函数。例如：

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});

```

#### 中间件

中间件函数检索原始 `Observables` 和 `HttpService` 对象，而不是 Fastify 的包装对象。这是 `HttpModule` 包的工作方式（在底层使用）和 `HttpService` - 查看此 __LINK_29__ 获取更多信息。

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

您可以使用 Fastify 的 __LINK_30__ 功能与 `HttpModule` 装饰器。

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});

```

#### 路由约束

自 v10.3.0 起， `HttpService` 支持 Fastify 的 __LINK_31__ 功能与 `@nestjs/axios` 装饰器。

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

> 提示 **注意** `AxiosResponse` 和 `axios` 来自 `$ npm i axios`。

#### 示例

可用的工作示例位于 __LINK_32__。