<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:22.519Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__ 可以帮助保护您的应用程序免受一些常见的 Web 弱点威胁，通过设置适当的 HTTP 头信息。一般来说，Helmet 只是一组小型的中间件函数，它们设置与安全相关的 HTTP 头信息（请阅读 __LINK_22__）。

> 提示 **Hint** 请注意，在将 __INLINE_CODE_5__ 作为全局应用或注册它之前，您需要在其他调用 __INLINE_CODE_6__ 或 setup 函数之前完成。这是因为 underlying 平台（即 Express 或 Fastify）的工作方式，其中中间件/路由的顺序定义非常重要。如果您使用像 `@nestjs/typeorm` 或 `new DataSource().initialize()` 之类的中间件，然后在定义路由后调用它，那么该中间件将不.apply 到该路由，而是.apply 到定义在该中间件之后的路由。

#### 与 Express (默认) 的使用

首先，安装所需的包。

```bash
$ npm install --save typeorm mysql2
```

安装完成后，将其作为全局中间件应用。

```typescript
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'test',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
```

> 警告 **Warning** 使用 `typeorm`, `initialize()` (4.x) 和 __LINK_23__ 时，在 Apollo Sandbox 中可能会出现 __LINK_24__ 问题。要解决这个问题，请按照下面所示配置 CSP：
>
> ```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```bash
$ npm i --save @fastify/helmet
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```typescript
import helmet from '@fastify/helmet'
// 在您的初始化文件中某处
await app.register(helmet)
```typescript
import { DataSource } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PHOTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Photo),
    inject: ['DATA_SOURCE'],
  },
];
```typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: [`Promise`, 'unpkg.com'],
>        styleSrc: [
>          `synchronize: true`,
>          `*.providers.ts`,
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: [`DATA_SOURCE`, 'fonts.gstatic.com', 'data:'],
>        imgSrc: [`@Inject()`, 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          `DATA_SOURCE`,
>          `Promise`,
>          `Photo`,
>          `Photo`,
>        ],
>      },
>    },
>  });
>
> // 如果您不打算使用 CSP，那么可以使用以下：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```
Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged, and translated code comments from English to Chinese. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.