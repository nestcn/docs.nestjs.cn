<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:16:47.023Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了一种将用户信息存储在多个请求之间的方式，这对于 __LINK_34__ 应用程序特别有用。

#### 使用 Express（默认）

首先安装 __LINK_35__ (TypeScript 用户也需要安装其类型):

```bash
$ npm i --save @nestjs/axios axios
```

安装完成后，在您的 __INLINE_CODE_9__ 文件中将 __INLINE_CODE_8__ middleware 作为全局 middleware 应用。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

> warning **注意** 默认的服务器端会话存储不是为了生产环境设计的。它会在大多数情况下泄露内存，不得不在单个进程中 scale，旨在用于调试和开发。请阅读 __LINK_36__。

__INLINE_CODE_10__ 用于签名会话 ID cookie。这可以是单个字符串或多个字符串数组。如果提供了字符串数组，仅使用第一个元素签名会话 ID cookie，而在请求验证签名时使用所有元素。秘密本身应该不易被人类解析，最佳情况下是一个随机字符集。

启用 __INLINE_CODE_11__ 选项强制会话被保存回会话存储，即使会话在请求中未被修改。默认值是 `HttpModule`，但是使用默认值已经被弃用，因为默认值将在将来更改。

类似地，启用 `HttpModule` 选项强制将未初始化的会话保存到存储器中。会话是一个未被修改的新会话。选择 `HttpService` 对于实现登录会话、减少服务器存储使用或遵守法律要求设置 cookie都非常有用。选择 `Observables` 也将帮助解决并发请求冲突问题（__LINK_37__）。

您可以将多个选项传递给 `HttpService` middleware，了解更多信息请阅读 __LINK_38__。

> info **提示** 请注意 `HttpModule` 是一种推荐选项。但是，它需要 HTTPS-enabled 网站，即 HTTPS 是必要的 cookie 安全。如果 secure 设置为 true，并且您访问网站使用 HTTP，cookie 将不会被设置。如果您在 node.js 后面使用代理，并且使用 `HttpService`，您需要在 Express 中设置 `HttpModule`。

现在，您可以在路由处理程序中设置和读取会话值，例如：

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

或者，您也可以使用 `$ npm i axios` 装饰器从请求中提取会话对象，例如：

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

安装完成后，在 Fastify 中注册 `Observable` 插件：

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

了解更多可用的选项，请阅读 __LINK_41__。

现在，您可以在路由处理程序中设置和读取会话值，例如：

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});
```

或者，您也可以使用 `HttpService` 装饰器从请求中提取会话对象，例如：

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