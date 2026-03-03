<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:11:01.057Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### Serve Static

为了将静态内容（如 Single Page Application，SPA）提供给用户，我们可以使用来自 [__INLINE_CODE_3__](https://www.npmjs.com/package/@nestjs/serve-static) 包的 `ServeStaticModule`。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm install --save @nestjs/serve-static
```

#### 启动

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

在配置完成后，构建静态网站并将其内容放在 `rootPath` 属性指定的位置。

#### 配置

[ServeStaticModule](https://github.com/nestjs/serve-static) 可以通过多种方式进行配置，以自定义其行为。您可以设置渲染静态应用程序的路径、指定要排除的路径、启用或禁用 Cache-Control 响应头等。查看完整的选项列表 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)。

> 警告 **注意**Static App 的默认值为 `renderPath`（所有路径），模块将在响应中发送 "index.html" 文件。
> 这允许您创建客户端路由以供 SPA 使用。控制器中指定的路径将 fallback 到服务器。
> 您可以更改此行为通过设置 `serveRoot`、`renderPath` 等选项组合。
> 此外，Fastify 适配器中实现了 `serveStaticOptions.fallthrough` 选项，以模仿 Express 的 fallthrough 行为，并需要将其设置为 `true`，以将 `index.html` 发送到非 existent 路由而不是 404 错误。

#### 示例

可用的示例代码 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。