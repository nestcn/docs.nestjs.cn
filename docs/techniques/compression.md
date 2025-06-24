### 压缩

压缩能显著减小响应体的大小，从而提升网页应用的加载速度。

对于**高流量**的生产环境网站，强烈建议将压缩工作从应用服务器卸载——通常交由反向代理（如 Nginx）处理。这种情况下不应使用压缩中间件。

#### 与 Express 配合使用（默认）

使用 [compression](https://github.com/expressjs/compression) 中间件包来启用 gzip 压缩功能。

首先安装所需的包：

```bash
$ npm i --save compression
$ npm i --save-dev @types/compression
```

安装完成后，将压缩中间件作为全局中间件应用。

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
```

#### 与 Fastify 一起使用

如果使用 `FastifyAdapter`，则需要使用 [fastify-compress](https://github.com/fastify/fastify-compress)：

```bash
$ npm i --save @fastify/compress
```

安装完成后，将 `@fastify/compress` 中间件作为全局中间件应用。

```typescript
import compression from '@fastify/compress';
// somewhere in your initialization file
await app.register(compression);
```

默认情况下，当浏览器支持该编码时，`@fastify/compress` 会使用 Brotli 压缩（Node 版本≥11.7.0）。虽然 Brotli 在压缩率方面非常高效，但其速度可能较慢。Brotli 默认设置最大压缩质量为 11，但可以通过调整 `BROTLI_PARAM_QUALITY` 参数（取值范围 0-11）来牺牲压缩质量换取更快的压缩速度。这需要进行精细调优以平衡空间/时间性能。以下是一个质量为 4 的示例：

```typescript
import { constants } from 'zlib';
// somewhere in your initialization file
await app.register(compression, { brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } } });
```

为简化操作，您可以配置 `fastify-compress` 仅使用 deflate 和 gzip 压缩响应数据——虽然可能生成更大的响应体，但传输速度会显著提升。

要指定编码方式，请向 `app.register` 传入第二个参数：

```typescript
await app.register(compression, { encodings: ['gzip', 'deflate'] });
```

上述配置会指示 `fastify-compress` 仅使用 gzip 和 deflate 编码，并在客户端同时支持两者时优先选用 gzip。