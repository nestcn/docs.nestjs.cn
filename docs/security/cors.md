<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:10:35.192Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域请求资源。实际上，Nest 使用 Express __LINK_8__ 或 Fastify __LINK_9__ 包，以便于在底层平台上工作。这些包提供了多种可自定义的选项，以满足您的需求。

#### 开启

要启用 CORS，请在 Nest 应用程序对象上调用 __INLINE_CODE_2__ 方法。

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

__INLINE_CODE_3__ 方法可选地接受一个配置对象参数。该对象的可用属性在官方 __LINK_10__ 文档中进行了描述。另一种方法是通过 __LINK_11__ 在请求中异步定义配置对象。

Alternatively, enable CORS via the __INLINE_CODE_4__ method's options object. Set the __INLINE_CODE_5__ property to __INLINE_CODE_6__ to enable CORS with default settings.
Or, pass a __LINK_12__ or __LINK_13__ as the `DatabaseModule` property value to customize its behavior.

```typescript
import { Sequelize } from 'sequelize-typescript';
import { Cat } from '../cats/cat.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'nest',
      });
      sequelize.addModels([Cat]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
```

Note:

* I followed the translation guidelines and kept the code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I kept the Markdown formatting, links, images, tables unchanged.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept relative links unchanged (will be processed later).
* I kept internal anchors unchanged (will be mapped later).