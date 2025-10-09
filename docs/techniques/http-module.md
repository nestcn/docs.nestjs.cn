### HTTP 模块

[Axios](https://github.com/axios/axios) 是一个功能丰富的 HTTP 客户端包，被广泛使用。Nest 封装了 Axios 并通过内置的 `HttpModule` 暴露它。`HttpModule` 导出了 `HttpService` 类，该类提供了基于 Axios 的方法来执行 HTTP 请求。该库还将生成的 HTTP 响应转换为 `Observables`。

:::info 提示
你也可以直接使用任何通用的 Node.js HTTP 客户端库，包括 [got](https://github.com/sindresorhus/got) 或 [undici](https://github.com/nodejs/undici)。
:::

#### 安装

要开始使用它，我们首先需要安装所需的依赖项。

```bash
$ npm i --save @nestjs/axios axios
```

#### 快速开始

安装过程完成后，要使用 `HttpService`，首先需要导入 `HttpModule`。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

接下来，通过常规的构造函数注入方式注入 `HttpService`。

:::info 提示
`HttpModule` 和 `HttpService` 是从 `@nestjs/axios` 包中导入的。
:::

```typescript
@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Observable<AxiosResponse<Cat[]>> {
    return this.httpService.get('http://localhost:3000/cats');
  }
}
```

:::info 提示
`AxiosResponse` 是从 `axios` 包(`$ npm i axios`)导出的接口。
:::

所有 `HttpService` 方法都会返回一个封装在 `Observable` 对象中的 `AxiosResponse`。

#### 配置

[Axios](https://github.com/axios/axios) 可通过多种选项进行配置，以自定义 `HttpService` 的行为。点击[此处](https://github.com/axios/axios#request-config)了解更多。要配置底层 Axios 实例，在导入 `HttpModule` 时，向其 `register()` 方法传递一个可选配置对象。该配置对象将直接传递给底层 Axios 构造函数。

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

#### 异步配置

当需要异步传递模块配置而非静态传递时，请使用 `registerAsync()` 方法。与大多数动态模块一样，Nest 提供了多种处理异步配置的技术。

其中一种技术是使用工厂函数：

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});
```

与其他工厂提供程序类似，我们的工厂函数可以是[异步的](../fundamentals/dependency-injection#工厂提供者-usefactory) ，并且可以通过 `inject` 注入依赖项。

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

或者，您也可以使用类而非工厂来配置 `HttpModule`，如下所示。

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});
```

上述结构在 `HttpModule` 内部实例化 `HttpConfigService`，并用它来创建一个选项对象。请注意，在本例中，`HttpConfigService` 必须实现如下所示的 `HttpModuleOptionsFactory` 接口。`HttpModule` 将在提供的类的实例化对象上调用 `createHttpOptions()` 方法。

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

如果要在 `HttpModule` 中重用现有的选项提供程序，而不是创建私有副本，请使用 `useExisting` 语法。

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useExisting: HttpConfigService,
});
```

您还可以向 `registerAsync()` 方法传递所谓的 `extraProviders`。这些提供程序将与模块提供程序合并。

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useClass: HttpConfigService,
  extraProviders: [MyAdditionalProvider],
});
```

当您需要向工厂函数或类构造函数提供额外依赖项时，这非常有用。

#### 直接使用 Axios

如果你认为 `HttpModule.register` 的配置选项无法满足需求，或者你只是想访问由 `@nestjs/axios` 创建的底层 Axios 实例，可以通过 `HttpService#axiosRef` 来访问它，如下所示：

```typescript
@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Promise<AxiosResponse<Cat[]>> {
    return this.httpService.axiosRef.get('http://localhost:3000/cats');
    //                      ^ AxiosInstance interface
  }
}
```

#### 完整示例

由于 `HttpService` 方法的返回值是一个 Observable，我们可以使用 `rxjs` 的 `firstValueFrom` 或 `lastValueFrom` 来以 Promise 形式获取请求数据。

```typescript
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  constructor(private readonly httpService: HttpService) {}

  async findAll(): Promise<Cat[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Cat[]>('http://localhost:3000/cats').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }
}
```

:::info 提示
 请访问 RxJS 关于 [`firstValueFrom`](https://rxjs.dev/api/index/function/firstValueFrom) 和 [`lastValueFrom`](https://rxjs.dev/api/index/function/lastValueFrom) 的文档，以了解它们之间的区别。
:::

