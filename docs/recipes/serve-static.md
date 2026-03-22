<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.326Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### 提供静态文件

为了提供静态内容（如单页应用程序 SPA），我们可以使用 `@nestjs/serve-static` 包中的 `ServeStaticModule`。

#### 安装

首先我们需要安装所需的包：

```bash
$ npm install --save @nestjs/serve-static

```

#### 引导

安装过程完成后，我们可以将 `ServeStaticModule` 导入根 `AppModule`，并通过向 `forRoot()` 方法传递配置对象来配置它。

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

完成此操作后，构建静态网站并将其内容放在 `rootPath` 属性指定的位置。

#### 配置

[ServeStaticModule](https://github.com/nestjs/serve-static) 可以使用各种选项进行配置，以自定义其行为。
你可以设置渲染静态应用程序的路径、指定排除的路径、启用或禁用设置 Cache-Control 响应头等。在[这里](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)查看完整的选项列表。

:::warning 注意
静态应用程序的默认 `renderPath` 是 `*`（所有路径），模块将发送 "index.html" 文件作为响应。
这让你可以为 SPA 创建客户端路由。在控制器中指定的路径将回退到服务器。
你可以通过设置 `serveRoot`、`renderPath` 并结合其他选项来更改此行为。
此外，在 Fastify 适配器中实现了 `serveStaticOptions.fallthrough` 选项，以模拟 Express 的 fallthrough 行为，需要将其设置为 `true` 才能发送 `index.html` 而不是为不存在的路由返回 404 错误。
:::

#### 示例

一个可用的示例可在[这里](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)找到。
