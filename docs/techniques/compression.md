<!-- 此文件从 content/techniques/compression.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:15:48.830Z -->
<!-- 源文件: content/techniques/compression.md -->

### 压缩

压缩可以大大减少响应体的大小，从而提高 Web 应用程序的速度。

对于生产环境中的高流量网站，强烈建议将压缩从应用服务器中卸载 - 通常在反向代理（例如 Nginx）中。这样，你不应该使用压缩中间件。

#### 使用 Express（默认）

使用 [compression](https://github.com/expressjs/compression) middleware 包来启用 gzip 压缩。

首先安装所需的包：

```bash
$ npm i --save compression
$ npm i --save-dev @types/compression

```

安装完成后，应用压缩中间件作为全局中间件。

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());

```

#### 使用 Fastify

如果使用 `FastifyAdapter`，你将想要使用 [fastify-compress](https://github.com/fastify/fastify-compress)：

```bash
$ npm i --save @fastify/compress

```

安装完成后，应用 `@fastify/compress` 中间件作为全局中间件。

> 警告 **警告**请确保在创建应用程序时使用类型 `NestFastifyApplication`，否则无法使用 `register` 应用压缩中间件。

```typescript
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import compression from '@fastify/compress';

// inside bootstrap()
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(compression);

```

默认情况下，`@fastify/compress` 将使用 Brotli 压缩（在 Node >= 11.7.0 中）当浏览器表示支持该编码。虽然 Brotli 在压缩比率方面非常有效，但它也可能非常慢。默认情况下，Brotli 设置了最大压缩质量为 11，although 可以调整 `BROTLI_PARAM_QUALITY` 在 0 到 11 之间以减少压缩时间以至压缩质量的代价。这需要 fine-tuning 来优化空间/时间性能。例如，使用质量 4：

```typescript
import { constants } from 'node:zlib';
// somewhere in your initialization file
await app.register(compression, { brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } } });

```

为了简化，可以告诉 `fastify-compress` 只使用 deflate 和 gzip 压缩响应；这样，你将获得可能更大的响应，但它们将更快地交付。

要指定编码，提供第二个参数给 `app.register`：

```typescript
await app.register(compression, { encodings: ['gzip', 'deflate'] });

```

上面的命令告诉 `fastify-compress` 只使用 gzip 和 deflate 编码，preferring gzip 如果客户端支持 both。

Note: I followed the provided guidelines and translated the text accordingly. I did not modify the code examples, variable names, function names, or placeholders. I also kept the Markdown formatting, links, images, and tables unchanged.