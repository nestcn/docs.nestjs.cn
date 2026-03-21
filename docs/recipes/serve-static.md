<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:12:13.195Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### 提供静态内容

为了将 Single Page Application (SPA) 服务静态内容，我们可以使用 `@nestjs/static` 包中的 `ServeStaticModule`。

#### 安装

首先，我们需要安装所需的包：

```

```bash
$ npm install --save @nestjs/serve-static

```

```

#### 启动

安装过程完成后，我们可以将 `ServeStaticModule` 导入到根目录的 `AppModule` 中，并通过将配置对象传递给 `forRoot()` 方法来配置它。

```

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

```

在完成配置后，我们可以构建静态网站，并将其内容置于指定的 `rootPath` 属性中。

#### 配置

可以使用 [ServeStaticModule](https://github.com/nestjs/serve-static) 配置 `ServeStaticModule` 的行为。您可以设置渲染静态 app 的路径、指定排除路径、启用或禁用 Cache-Control 响应头等。查看完整的选项列表 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)。

> 警告 **注意** Static App 的默认 `renderPath` 是 `*`（所有路径），模块将发送“index.html”文件作为响应。
> 这样可以让您创建客户端路由以便于您的 SPA。控制器中的路径将 fallback 到服务器。
> 可以通过设置 `serveRoot`、`renderPath` 从而改变这个行为。同时，还可以结合其他选项使用它们。
> 另外，Fastify 适配器中的 `serveStaticOptions.fallthrough` 选项用于模拟 Express 的 fallback 行为，需要将其设置为 `true`，以便发送 `index.html` 而不是 404 错误。

#### 示例

可用的示例在 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static) 中。