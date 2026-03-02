<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:08:50.412Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了将用户信息跨越多个请求存储的方式，这对于 __LINK_34__ 应用程序非常有用。

#### 使用 Express (默认)

首先安装 __LINK_35__ (TypeScript 用户还需要安装其类型):

```bash
$ npm i --save @nestjs/axios axios
```

安装完成后，在您的 __INLINE_CODE_9__ 文件中将 __INLINE_CODE_8__ 中间件作为全局中间件应用。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

> warning **注意** 默认的服务器端会话存储旨在 debug 和开发环境中，不适合生产环境。它可能会泄露内存，在多个进程中不具可扩展性，旨在 debug 和开发中。请阅读 __LINK_36__。

__INLINE_CODE_10__ 用于签名会话 ID cookie。可以是单个字符串或多个字符串的数组。如果是数组，仅使用第一个元素来签名会话 ID cookie，而在请求验证签名时使用所有元素。secret 自身应该不能被人类轻易解析，最佳情况下是一个随机字符集。

启用 __INLINE_CODE_11__ 选项强制会话在请求完成后被保存到会话存储中，即使会话在请求中未被修改。默认值为 `HttpModule`，但使用默认值已经被弃用，因为默认值将在将来更改。

类似地，启用 `HttpModule` 选项强制将未初始化的会话保存到存储中。未初始化的会话是在新创建但未被修改时。选择 `HttpService` 可以实现登录会话、减少服务器存储使用或遵守法律要求之前设置 cookie。选择 `Observables` 也将帮助解决并发请求问题（__LINK_37__）。

您可以将多个选项传递给 `HttpService` 中间件，了解更多信息请阅读 __LINK_38__。

> info **提示** 请注意 `HttpModule` 是一种推荐选项。但是，它需要 HTTPS 启用的网站，即 HTTPS 是安全 cookie 的必要条件。如果您将 secure 设置为 true，并访问您的网站使用 HTTP，cookie 将不被设置。如果您在 Node.js 后面使用代理，并且使用 `HttpService`，您需要在 express 中设置 `HttpModule`。

现在，您可以在路由处理程序中设置和读取会话值，如下所示：

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

> info **提示** `HttpService` 装饰器来自 `@nestjs/axios`，而 `AxiosResponse` 来自 `axios` 包。

或者，您可以使用 `$ npm i axios` 装饰器从请求中提取会话对象，如下所示：

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

> info **提示** `HttpService` 装饰器来自 `AxiosResponse` 包。

#### 使用 Fastify

首先安装所需的包：

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});
```

安装完成后，注册 `Observable` 插件：

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

> info **提示** 您也可以预生成密钥（__LINK_39__）或使用 __LINK_40__。

了解更多关于可用的选项，请阅读 __LINK_41__。

现在，您可以在路由处理程序中设置和读取会话值，如下所示：

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});
```

或者，您可以使用 `HttpService` 装饰器从请求中提取会话对象，如下所示：

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

> info **提示** `register()` 装饰器来自 `HttpModule`，而 `registerAsync()` 来自 `inject` 包（import 语句：`HttpModule`）。