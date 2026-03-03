<!-- 此文件从 content/techniques/mvc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:09:30.718Z -->
<!-- 源文件: content/techniques/mvc.md -->

### Model-View-Controller

Nest默认使用__LINK_34__库。因此，使用MVC (Model-View-Controller) 模式的技术在Express中也适用于Nest。

首先，让我们使用__LINK_35__工具 scaffold一个简单的Nest应用程序：

```bash
$ npm i --save compression
$ npm i --save-dev @types/compression
```

为了创建一个MVC应用程序，我们还需要一个__LINK_36__来渲染我们的HTML视图：

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
```

我们使用了`@fastify/compress`(__LINK_37__)引擎，但是您可以使用适合您的需求的引擎。安装过程完成后，我们需要使用以下代码来配置Express实例：

```bash
$ npm i --save @fastify/compress
```

我们告诉__LINK_38__将`BROTLI_PARAM_QUALITY`目录用于存储静态资产、`fastify-compress`目录用于存储模板，并使用`app.register`模板引擎来渲染HTML输出。

#### 模板渲染

现在，让我们创建一个`fastify-compress`目录，并在其中创建一个__INLINE_CODE_15__模板。在模板中，我们将从控制器中传递的__INLINE_CODE_16__打印出来：

```typescript
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import compression from '@fastify/compress';

// inside bootstrap()
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(compression);
```

然后，打开__INLINE_CODE_17__文件，并将__INLINE_CODE_18__方法替换为以下代码：

```typescript
import { constants } from 'node:zlib';
// somewhere in your initialization file
await app.register(compression, { brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } } });
```

在这段代码中，我们指定了在__INLINE_CODE_19__装饰器中使用的模板，并将路由处理方法的返回值传递给模板进行渲染。注意返回值是一个对象，其中包含__INLINE_CODE_20__属性，匹配__INLINE_CODE_21__placeholder在模板中。

在应用程序运行时，打开浏览器，并导航到__INLINE_CODE_22__。您应该看到__INLINE_CODE_23__消息。

#### 动态模板渲染

如果应用程序逻辑需要动态决定哪个模板渲染，那么我们应该使用__INLINE_CODE_24__装饰器，并在路由处理方法中提供视图名称，而不是在__INLINE_CODE_25__装饰器中：

> info **Tip**当Nest检测到__INLINE_CODE_26__装饰器时，它将注入库特定的__INLINE_CODE_27__对象。我们可以使用这个对象来动态渲染模板。了解更多关于__INLINE_CODE_28__对象API __LINK_39__。

```typescript
await app.register(compression, { encodings: ['gzip', 'deflate'] });
```

#### 示例

可用的工作示例__LINK_40__。

#### Fastify

正如在 __LINK_41__中所提到的，我们可以使用任何兼容的HTTP提供者与Nest一起使用。其中一个例子是__LINK_42__。要创建一个Fastify MVC应用程序，我们需要安装以下包：

__CODE_BLOCK_6__

下一步将涵盖与Express相同的过程，但有minor differences特定于Fastify。安装过程完成后，打开__INLINE_CODE_29__文件，并更新其内容：

__CODE_BLOCK_7__

Fastify API有一些差异，但最终结果相同。一个值得注意的差异是，在使用Fastify时，您需要在__INLINE_CODE_30__装饰器中传递模板名称的文件扩展名。

以下是如何设置：

__CODE_BLOCK_8__

Alternatively, you can use the __INLINE_CODE_31__ decorator to directly inject the response and specify the view you want to render, as shown below:

__CODE_BLOCK_9__

在应用程序运行时，打开浏览器，并导航到__INLINE_CODE_32__。您应该看到__INLINE_CODE_33__消息。

#### 示例

可用的工作示例__LINK_43__。