### 静态资源服务

为了提供静态内容服务（如单页应用 SPA），我们可以使用 [`@nestjs/serve-static`](https://www.npmjs.com/package/@nestjs/serve-static) 包中的 `ServeStaticModule` 模块。

#### 安装

首先需要安装必要的依赖包：

```bash
$ npm install --save @nestjs/serve-static
```

#### 启动引导

安装完成后，我们可以将 `ServeStaticModule` 导入根模块 `AppModule` 中，并通过向 `forRoot()` 方法传入配置对象来进行配置。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

完成上述配置后，构建静态网站并将其内容放置在 `rootPath` 属性指定的位置。

#### 配置

[ServeStaticModule](https://github.com/nestjs/serve-static) 可通过多种选项进行配置以自定义其行为。您可以设置渲染静态应用的路径、指定排除路径、启用或禁用 Cache-Control 响应头设置等。完整选项列表请参阅[此处](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts) 。

> warning **注意** 静态应用的默认 `renderPath` 为 `*`（所有路径），该模块将返回"index.html"文件作为响应。这使您能为 SPA 创建客户端路由。控制器中指定的路径将回退至服务器。您可以通过设置 `serveRoot`、`renderPath` 并结合其他选项来更改此行为。此外，Fastify 适配器中已实现 `serveStaticOptions.fallthrough` 选项以模拟 Express 的穿透行为，需将其设为 `true` 才能在路由不存在时发送 `index.html` 而非 404 错误。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)查看。
