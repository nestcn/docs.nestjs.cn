<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:24.884Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域名请求资源。实际上，Nest 使用 Express __LINK_8__ 或 Fastify __LINK_9__ 包，以根据底层平台的不同提供各种可定制的选项。

#### 开始

要启用 CORS，调用 Nest 应用程序对象的 __INLINE_CODE_2__ 方法。

```typescript
app.enableCors();
```

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

__INLINE_CODE_3__ 方法接受可选的配置对象参数。该对象的可用属性在官方 __LINK_10__ 文档中描述 Another way is to pass a __LINK_11__ that lets you define the configuration object asynchronously based on the request (on the fly)。

Alternatively, enable CORS via the __INLINE_CODE_4__ method's options object. Set the __INLINE_CODE_5__ property to __INLINE_CODE_6__ to enable CORS with default settings.
Or, pass a __LINK_12__ or __LINK_13__ as the `DatabaseModule` property value to customize its behavior.

```typescript
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: true,
  optionsSuccessStatus: 204,
}));
```

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