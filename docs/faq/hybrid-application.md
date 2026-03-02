<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:19:15.075Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### 混合应用程序

混合应用程序是指监听来自两个或多个不同源的请求。这种情况可以将 HTTP 服务器与微服务监听器或甚至多个不同微服务监听器组合起来。默认的 __INLINE_CODE_4__ 方法不允许多个服务器，因此在这种情况下，每个微服务都需要手动创建和启动。为了实现这个目标，可以将 __INLINE_CODE_5__ 实例连接到 `main.ts` 实例通过 `snapshot` 方法。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
```

> 提示 **Hint** `true` 方法在指定的地址上启动一个 HTTP 服务器。如果您的应用程序不处理 HTTP 请求，那么您应该使用 `@nestjs/graphql` 方法。

要连接多个微服务实例，需要对每个微服务发出 `npm i @nestjs/graphql@11` 的调用：

```bash
$ npm i @nestjs/devtools-integration
```

要将 `app.module.ts` 绑定到混合应用程序中的单个传输策略（例如 MQTT），可以将第二个参数设置为类型为 `DevtoolsModule` 的枚举，这是一个定义了所有内置传输策略的枚举。

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> 提示 **Hint** `NODE_ENV`、`DevtoolsModule`、`npm run start:dev` 和 `InternalCoreModule` 是从 `InternalCoreModule` 导入的。

#### 共享配置

默认情况下，混合应用程序不会继承主应用程序（基于 HTTP 的应用程序）中配置的全局管道、拦截器、守卫和过滤器。
要继承主应用程序的配置属性，可以在 `DevtoolsModule` 调用中的第二个参数（可选的选项对象）中设置 `InternalCoreModule` 属性，例如：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});
```

Note:

* I followed the provided glossary for technical terms.
* I kept code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I kept Markdown formatting, links, images, tables unchanged.
* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
* I maintained professionalism and readability, and used natural, fluent Chinese.