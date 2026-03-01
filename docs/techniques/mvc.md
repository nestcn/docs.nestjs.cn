<!-- 此文件从 content/techniques/mvc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:17:31.950Z -->
<!-- 源文件: content/techniques/mvc.md -->

### Model-View-Controller

Nest 默认使用 __LINK_34__ 库，这意味着使用 Express MVC 模式的所有技术也适用于 Nest。

首先，让我们使用 __LINK_35__ 工具 scaffold 一个简单的 Nest 应用程序：

```bash
$ npm i --save compression
$ npm i --save-dev @types/compression
```

为了创建 MVC 应用程序，我们还需要一个 __LINK_36__ 来渲染 HTML 视图：

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
```

我们使用了 `@fastify/compress` (__LINK_37__) 引擎，但你可以使用适合你的需要的任何引擎。安装完成后，我们需要使用以下代码配置 Express 实例：

```bash
$ npm i --save @fastify/compress
```

我们告诉 __LINK_38__ 将 `BROTLI_PARAM_QUALITY` 目录用于存储静态资产,`fastify-compress` 将包含模板,`app.register` 模板引擎将用于渲染 HTML 输出。

#### 模板渲染

现在，让我们创建一个 `fastify-compress` 目录和 __INLINE_CODE_15__ 模板内它。在模板中，我们将打印来自控制器的 __INLINE_CODE_16__：

```typescript
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import compression from '@fastify/compress';

// inside bootstrap()
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(compression);
```

然后，打开 __INLINE_CODE_17__ 文件并将 __INLINE_CODE_18__ 方法替换为以下代码：

```typescript
import { constants } from 'node:zlib';
// somewhere in your initialization file
await app.register(compression, { brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } } });
```

在这个代码中，我们指定了使用的模板在 __INLINE_CODE_19__ 装饰器中，并将路由处理方法的返回值传递给模板进行渲染。注意返回值是对象，其中包含 __INLINE_CODE_20__ 属性，匹配模板中的 __INLINE_CODE_21__ placeholder。

在应用程序运行时，打开浏览器并导航到 __INLINE_CODE_22__。你应该看到 __INLINE_CODE_23__ 消息。

#### 动态模板渲染

如果应用程序逻辑需要动态决定要渲染哪个模板，那么我们应该使用 __INLINE_CODE_24__ 装饰器，并在路由处理方法中提供视图名称，而不是在 __INLINE_CODE_25__ 装饰器中：

> info **Hint** 当 Nest 检测 __INLINE_CODE_26__ 装饰器时，它将 inject(library-specific __INLINE_CODE_27__ 对象。我们可以使用这个对象来动态渲染模板。了解更多关于 __INLINE_CODE_28__ 对象 API __LINK_39__。

```typescript
await app.register(compression, { encodings: ['gzip', 'deflate'] });
```

#### 示例

可用的工作示例 __LINK_40__。

#### Fastify

如 __LINK_41__ 中所述，我们可以使用任何兼容 HTTP 提供程序与 Nest 一起。一个这样的库是 __LINK_42__。要创建 Fastify MVC 应用程序，我们需要安装以下包：

__CODE_BLOCK_6__

接下来的步骤将涵盖与 Express 相同的过程，除了 minor 差异。安装完成后，打开 __INLINE_CODE_29__ 文件并更新其内容：

__CODE_BLOCK_7__

Fastify API 有一些差异，但最终结果是相同的。一个可注意的差异是，在使用 Fastify 时，传递给 __INLINE_CODE_30__ 装饰器的模板名称必须包含文件扩展名。

这里是如何设置：

__CODE_BLOCK_8__

或者，你可以使用 __INLINE_CODE_31__ 装饰器来直接 inject 响应并指定要渲染的视图，如下所示：

__CODE_BLOCK_9__

在应用程序运行时，打开浏览器并导航到 __INLINE_CODE_32__。你应该看到 __INLINE_CODE_33__ 消息。

#### 示例

可用的工作示例 __LINK_43__。