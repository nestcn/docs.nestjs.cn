<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:18:35.096Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是允许从另一个域名请求资源的机制。Nest内部使用 Express __LINK_8__ 或 Fastify __LINK_9__ 包依赖于底层平台。这些包提供了多个可自定义的选项，以满足您的需求。

#### 开始使用

要启用 CORS，请在 Nest 应用程序对象上调用 __INLINE_CODE_2__ 方法。

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

__INLINE_CODE_3__ 方法可选地接受一个配置对象参数。该对象的可用属性在官方 __LINK_10__ 文档中描述。另一种方法是通过 __LINK_11__ 请求来定义配置对象（实时）。

或者，通过 __INLINE_CODE_4__ 方法的 options 对象启用 CORS。将 __INLINE_CODE_5__ 属性设置为 __INLINE_CODE_6__ 以启用使用默认设置的 CORS。
或者，您可以将 __LINK_12__ 或 __LINK_13__ 作为 `DatabaseModule` 属性值来自定义其行为。

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

* I kept the code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I maintained Markdown formatting, links, images, tables unchanged.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept relative links unchanged (will be processed later).
* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
* I maintained professionalism and readability.