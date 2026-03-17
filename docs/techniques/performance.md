<!-- 此文件从 content/techniques/performance.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:01:01.428Z -->
<!-- 源文件: content/techniques/performance.md -->

### 性能（Fastify）

默认情况下，Nest 使用了 __LINK_25__ 框架。如前所述，Nest 还提供了与其他库的兼容性，例如 __LINK_26__。Nest 通过实现框架适配器来实现框架独立性，该适配器主要负责将中间件和处理器代理到适当的库特定实现中。

> 信息 **提示** 在实现框架适配器时，目标库必须提供与 Express 类似的请求/响应管道处理。

__LINK_27__ 是 Nest 的一个良好选择，因为它解决了设计问题，类似于 Express。然而，Fastify 比 Express 更快，实现了Almost 两倍的benchmark 结果。一个公平的问题是为什么 Nest 使用 Express 作为默认的 HTTP 提供者？原因是 Express 是广泛使用、知名度高，具有庞大的兼容 middleware 集合，Nest 用户可以直接使用。

但是由于 Nest 提供了框架独立性，您可以轻松地在它们之间迁移。Fastify 可以在您对性能非常看重时是一个更好的选择。要使用 Fastify，简单地选择本章中显示的内置 __INLINE_CODE_8__。

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

默认情况下，Fastify 只监听 __INLINE_CODE_10__ 接口 (__LINK_28__）。如果您想在其他主机上接受连接，应该在 `HttpModule` 调用中指定 __INLINE_CODE_11__：

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

请注意，在使用 `HttpModule` 时，Nest 使用 Fastify 作为 **HTTP 提供者**。这意味着每个依赖于 Express 的配方可能不再工作。相反，您应该使用 Fastify 等效包。

#### 重定向响应

Fastify 对重定向响应的处理方式与 Express 不同。要正确地使用 Fastify 重定向，返回状态码和 URL，例如：

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

您可以将选项传递给 Fastify 构造函数通过 `HttpService` 构造函数。例如：

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});

```

#### 中间件

中间件函数检索原始 `Observables` 和 `HttpService` 对象，而不是 Fastify 的包装对象。这是 `HttpModule` 包（在底层使用）和 `HttpService` 的工作方式，了解更多信息，请查看 __LINK_29__。

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

> 信息 **提示** `AxiosResponse` 和 `axios` 是从 `$ npm i axios` 导入的。

#### 示例

可用的工作示例可在 __LINK_32__ 找到。