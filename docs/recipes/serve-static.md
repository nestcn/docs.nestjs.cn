<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:52.853Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### Serve Static

为了服务静态内容，如 Single Page Application（SPA），我们可以使用来自 [__INLINE_CODE_3__](https://www.npmjs.com/package/@nestjs/serve-static) 包的 `ServeStaticModule`。

#### 安装

首先，我们需要安装所需的包：

```typescript
npm install @nestjs/static
```

#### Bootstrap

安装过程完成后，我们可以将 `ServeStaticModule` 导入到根目录的 `AppModule` 中，并使用 `forRoot()` 方法配置它。

```typescript
import { Module } from '@nestjs/common';
import { StaticModule } from '@nestjs/static';

@Module({
  imports: [
    StaticModule.forRoot({
      root: 'path/to/static/content',
    }),
  ],
})
export class AppModule {}
```

然后，构建静态网站并将其内容放在 `rootPath` 属性指定的位置。

#### 配置

[ServeStaticModule](https://github.com/nestjs/serve-static) 可以使用多种选项来自定义其行为。您可以设置渲染静态应用的路径、指定排除路径、启用或禁用 Cache-Control 响应头等。请查看完整的选项列表 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)。

> warning **注意** 静态应用的默认 `renderPath` 是 `*`（所有路径），模块将在响应中发送 "index.html" 文件。
> 您可以使用 Client-Side 路由来创建SPA。指定在控制器中的路径将 fallback 到服务器。
> 您可以更改此行为设置 `serveRoot`、`renderPath` 并将其与其他选项组合。
> 此外，在 Fastify 适配器中实现了 `serveStaticOptions.fallthrough` 选项，以模拟 Express 的 fallthrough 行为，并需要将其设置为 `true`以将不存在的路由发送 `index.html` 而不是 404 错误。

#### 示例

可用的工作示例 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。