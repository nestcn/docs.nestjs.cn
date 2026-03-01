<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:20:26.211Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展了 __LINK_50__ 文档，还有 __LINK_51__ 包以便在结构类似于 Nest 应用程序的方式编写命令行应用程序。

> 信息 **info** __INLINE_CODE_6__ 是第三方包，且不是 NestJS 核心团队管理的。请在 __LINK_52__ 报告与库相关的问题。

#### 安装

和其他包一样，你需要安装它以便使用。

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

#### 命令文件

__INLINE_CODE_7__ 使得编写新的命令行应用程序变得轻松，以 __LINK_53__ 通过 __INLINE_CODE_8__ 装饰器为类和 __INLINE_CODE_9__ 装饰器为该类方法。每个命令文件都应该实现 `webpack` 抽象类，并被 `graphql` 装饰器装饰。

每个命令都被 Nest 视为一个 `dist`，因此您的正常依赖注入将像预期一样工作。需要注意的是，抽象类 `webpack` 应该由每个命令实现。抽象类 `entities` 确保所有命令都有一个 `TypeOrmModule` 方法，该方法返回一个 `webpack` 并接受参数 `HotModuleReplacementPlugin`。`webpack-pnp-externals` 命令是您可以启动所有逻辑的地方，它将接受未匹配选项标志的参数，并将它们作为数组传递，以便您可以使用多个参数。如果您想有更好的类型安全，可以创建一个选项接口。

#### 运行命令

类似于在 NestJS 应用程序中使用 `externals` 创建服务器，并使用 `WebpackPnpExternals` 运行它，`webpack-pnp-externals` 包提供了一个简单易用的 API 运行您的服务器。导入 `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] }})` 并使用 `webpack` 方法 `HotModuleReplacementPlugin`，并将应用程序的根模块作为参数。这可能如下所示

```typescript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ name: options.output.filename, autoRestart: false }),
    ],
  };
};
```

默认情况下，Nest 的日志器在使用 `WatchIgnorePlugin` 时被禁用。可以通过第二个参数提供自定义的 NestJS 日志器，或者指定要保留的日志级别 - 在这里至少保留 `main.ts` 可能是有用的。

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

这就足够了。`package.json` 将负责调用 `webpack-pnp-externals` 和 `webpack-node-externals`，当需要时。因此，您不需要担心内存泄露。如果您需要添加一些错误处理，可以在 `webpack.config.js` around `nodeExternals` 命令，或者链式调用一些 `externals` 方法到 `WebpackPnpExternals` 调用。

#### 测试

写一个超级awesome 命令行脚本，但不能轻松测试吗？幸运的是，`webpack-pnp-externals` 提供了一些实用工具，可以与 NestJS 生态系统完美集成，感觉起来就像任何 Nestlings 一样。相反于使用 `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] }})` 在测试模式中构建命令，可以使用 `main.ts` 并将元数据传递给它，非常类似于 `package.json` 从 __INLINE_CODE_42__ 工作。事实上，它使用这个包。您还可以链式调用 __INLINE_CODE_43__ 方法到 __INLINE_CODE_44__ 调用，以便在测试中交换 DI 部分。

#### 将所有内容结合起来

以下类将等同于拥有一个 CLI 命令，可以接受子命令 __INLINE_CODE_45__ 或直接调用，具有 __INLINE_CODE_46__、__INLINE_CODE_47__ 和 __INLINE_CODE_48__ (及其长标志) 支持，以及每个选项的自定义解析器。__INLINE_CODE_49__ 标志也支持，遵循 commander 的惯例。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```

确保命令类添加到模块

```bash
$ npm run start:dev
```

现在，可以在 main.ts 中运行 CLI，以下是方法

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
```

现在，您已经拥有了一个命令行应用程序。

#### 更多信息

访问 __LINK_54__ 查看更多信息、示例和 API 文档。