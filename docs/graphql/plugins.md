### Apollo 插件

插件能够通过响应特定事件执行自定义操作来扩展 Apollo Server 的核心功能。目前这些事件对应 GraphQL 请求生命周期的各个阶段，以及 Apollo Server 自身的启动过程（详见[此处](https://www.apollographql.com/docs/apollo-server/integrations/plugins/) ）。例如，一个基础日志插件可以记录发送到 Apollo Server 的每个请求所关联的 GraphQL 查询字符串。

#### 自定义插件

要创建插件，需声明一个用 `@Plugin` 装饰器标注的类，该装饰器从 `@nestjs/apollo` 包导出。同时，为了获得更好的代码自动补全功能，建议实现来自 `@apollo/server` 包的 `ApolloServerPlugin` 接口。

```typescript
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log('Request started');
    return {
      async willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}
```

这样我们就可以将 `LoggingPlugin` 注册为一个提供者。

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}
```

Nest 会自动实例化插件并将其应用到 Apollo Server。

#### 使用外部插件

系统提供了多个开箱即用的插件。要使用现有插件，只需导入它并将其添加到 `plugins` 数组中：

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),
```

> info **提示** `ApolloServerOperationRegistry` 插件是从 `@apollo/server-plugin-operation-registry` 包导出的。

#### 与 Mercurius 搭配使用的插件

部分现有的 mercurius 专属 Fastify 插件必须在 mercurius 插件之后加载（详见插件树[此处](https://mercurius.dev/#/docs/plugins) ）。

> warning **注意** [mercurius-upload](https://github.com/mercurius-js/mercurius-upload) 是个例外，应在主文件中注册。

为此，`MercuriusDriver` 提供了一个可选的 `plugins` 配置项。它表示一个由对象组成的数组，每个对象包含两个属性：`plugin` 及其对应的 `options`。因此，注册 [缓存插件](https://github.com/mercurius-js/cache) 的示例如下：

```typescript
GraphQLModule.forRoot({
  driver: MercuriusDriver,
  // ...
  plugins: [
    {
      plugin: cache,
      options: {
        ttl: 10,
        policy: {
          Query: {
            add: true
          }
        }
      },
    }
  ]
}),
```
