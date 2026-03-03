<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:09:45.659Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了在多个请求之间存储用户信息的方式，这在 __LINK_34__ 应用程序中特别有用。

#### 使用 Express (默认)

首先，安装 __LINK_35__ (TypeScript 用户还需要安装其类型)：

```bash
$ npm i --save @nestjs/axios axios
```

安装完成后，应用 __INLINE_CODE_8__ 中间件作为全局中间件（例如，在您的 __INLINE_CODE_9__ 文件中）。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

> 警告 **注意** 默认的服务器端会话存储不是为了生产环境设计的。它会在大多数情况下泄露内存，不能跨进程扩展，也是用于调试和开发的。更多信息请阅读 __LINK_36__。

__INLINE_CODE_10__ 用于签名会话 ID Cookie。这可以是一个字符串，用于单个秘密，或者是一个数组，用于多个秘密。如果提供了多个秘密的数组，那么只有第一个元素将被用于签名会话 ID Cookie，而所有元素都将被考虑在请求中的签名验证中。秘密本身应该不易被人类解析，并且最好是一个随机字符集。

启用 __INLINE_CODE_11__ 选项强制会话被保存回会话存储，即使会话在请求中未被修改。默认值是 `HttpModule`，但使用默认值已经被弃用，因为默认值将在将来改变。

类似地，启用 `HttpModule` 选项强制将未初始化的会话保存到存储中。未初始化的会话是指新创建但未被修改的会话。选择 `HttpService` 有助于实现登录会话、减少服务器存储使用或遵守法律要求在设置 Cookie 前获取权限。选择 `Observables` 也将帮助解决并发请求中的竞争条件（__LINK_37__）。

您可以将多个其他选项传递给 `HttpService` 中间件，更多信息请阅读 __LINK_38__。

> 提示 **提示** `HttpModule` 是一种推荐的选项。但是，它需要 HTTPS 加密网站，即 HTTPS 是必要的cookie安全。如果 secure 设置了，您访问网站时使用 HTTP，Cookie 将不会被设置。如果您在 Node.js 뒤有代理，并且使用 `HttpService`，您需要在 Express 中设置 `HttpModule`。

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

> 提示 **提示** `HttpService` 装饰器来自 `@nestjs/axios`，而 `AxiosResponse` 来自 `axios` 包。

Alternatively, you can use the `$ npm i axios` decorator to extract a session object from the request, as follows:

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

> 提示 **提示** `HttpService` 装饰器来自 `AxiosResponse` 包。

#### 使用 Fastify

首先，安装所需的包：

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

> 提示 **提示** 您也可以预生成密钥（__LINK_39__）或使用 __LINK_40__。

更多信息请阅读 __LINK_41__。

现在，您可以在路由处理程序中设置和读取会话值，如下所示：

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});
```

Alternatively, you can use the `HttpService` decorator to extract a session object from the request, as follows:

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

> 提示 **提示** `register()` 装饰器来自 `HttpModule`，而 `registerAsync()` 来自 `inject` 包（import 语句：`HttpModule`）。