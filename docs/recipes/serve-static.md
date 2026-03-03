<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T02:53:34.247Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### Serve Static

使用 Static App 来服务静态内容，如 Single Page Application（SPA）可以使用来自 [__INLINE_CODE_3__](https://www.npmjs.com/package/@nestjs/serve-static) 包的 `ServeStaticModule`。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm install --save @nestjs/serve-static
```

#### Bootstrap

安装过程完成后，我们可以将 `ServeStaticModule` 导入到根 `AppModule` 中，并通过将配置对象传递给 `forRoot()` 方法来配置它。

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

这样配置后，构建静态网站，并将其内容放置在 `rootPath` 属性指定的位置。

#### 配置

[ServeStaticModule](https://github.com/nestjs/serve-static) 可以使用各种选项来自定义其行为。你可以设置渲染静态应用的路径、指定排除路径、启用或禁用 Cache-Control 响应头等。见完整的选项列表 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)。

> 警告 **注意** Static App 的默认 `renderPath` 是 `*`（所有路径），模块将在响应中发送“index.html”文件。
> 这样可以让您创建客户端路由对于您的 SPA。路径，指定在控制器中将fallback到服务器。
> 可以更改此行为设置 `serveRoot`、`renderPath` 将其与其他选项组合。
> 此外，Fastify 适配器中实现了 `serveStaticOptions.fallthrough` 选项，以模仿 Express 的fallthrough 行为，并需要将其设置为 `true` 发送 `index.html` 而不是404错误对不存在的路由。

#### 示例

可用的工作示例 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。