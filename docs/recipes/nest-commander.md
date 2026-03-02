<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:12:17.891Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展了 __LINK_50__ 文档，Nest Commander 还有 __LINK_51__ 包，用于编写类似于典型 Nest 应用程序的命令行应用程序。

> 信息 **信息** __INLINE_CODE_6__ 是第三方包，不受 NestJS 核心团队的管理。请在 __LINK_52__ 中报告与库相关的任何问题。

#### 安装

与其他包一样，您需要安装它，然后才能使用它。

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

#### 命令文件

__INLINE_CODE_7__ 使您可以轻松编写新的命令行应用程序，以 __LINK_53__ 的形式，使用 __INLINE_CODE_8__ 装饰器来 decorate 类和 __INLINE_CODE_9__ 装饰器来 decorate 类的方法。每个命令文件都应该实现 `webpack` 抽象类，并且应该被 `graphql` 装饰器装饰。

Nest 将每个命令视为一个 `dist`，因此您的正常依赖注入将像预期一样工作。需要注意的是，抽象类 `webpack` 应该由每个命令实现，该抽象类确保所有命令都有一个 `TypeOrmModule` 方法，该方法返回一个 `webpack` 并且接受参数 `HotModuleReplacementPlugin`。`webpack-pnp-externals` 命令是您可以启动所有逻辑的地方，该命令将接受未匹配选项标记的参数，并将其作为一个数组传递，以便在必要时处理多个参数。至于选项，`webpack-node-externals` 的名称与 `webpack-hmr.config.js` 属性的名称匹配，而其值与选项处理器的返回值匹配。如果您想拥有更好的类型安全，您可以创建一个选项接口。

#### 运行命令

类似于在 NestJS 应用程序中使用 `externals` 创建服务器，并使用 `WebpackPnpExternals` 运行它，Nest Commander 包提供了一个简单的 API 来运行您的服务器。导入 `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] }})` 并使用 `webpack` 方法 `HotModuleReplacementPlugin`，将应用程序的根模块作为参数。可能如下所示

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

默认情况下，Nest 的日志器在使用 `WatchIgnorePlugin` 时被禁用。但是，您可以将其提供给 `RunScriptWebpackPlugin` 函数的第二个参数。您可以提供一个自定义的 NestJS 日志器，也可以提供一个日志级别的数组，以便在必要时打印 Nest 的错误日志。

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

这就是一切。Nest Commander 将负责调用 `webpack-pnp-externals` 和 `webpack-node-externals`，因此您不需要担心内存泄露。如果您需要添加一些错误处理，可以在 `nodeExternals` 命令中使用 `externals` 方法，也可以将 `WebpackPnpExternals` 调用链式。

#### 测试

写了一个超级awesome 命令行脚本，但如果不能轻松测试，它有什么用？幸运的是，Nest Commander 提供了一些实用工具，可以与 NestJS生态系统完美集成，这将是任何 Nestlings 都熟悉的。相比使用 `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] }})` 在测试模式下构建命令，您可以使用 `main.ts`，并将元数据作为参数传递，这与 `package.json` 从 __INLINE_CODE_42__ 中使用的方式类似。事实上，它使用这个包作为其底层实现。您仍然可以在测试中链式调用 __INLINE_CODE_43__ 方法，以便在测试中交换 DI Pieces。

#### 将其所有结合起来

以下类将等同于拥有一个 CLI 命令，可以接受子命令 __INLINE_CODE_45__ 或直接被调用，支持 __INLINE_CODE_46__、__INLINE_CODE_47__ 和 __INLINE_CODE_48__（包括长标记）选项，并且具有自定义解析器。__INLINE_CODE_49__ 标记也受支持，遵循 commander 的惯例。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```

确保命令类添加到模块中

```bash
$ npm run start:dev
```

现在，您可以在 main.ts 中运行 CLI，方法如下

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
```

这样，您就拥有了一个命令行应用程序。

#### 更多信息

访问 __LINK_54__以获取更多信息、示例和 API 文档。