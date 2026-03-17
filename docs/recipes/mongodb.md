<!-- 此文件从 content/recipes/mongodb.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:03:48.723Z -->
<!-- 源文件: content/recipes/mongodb.md -->

### MongoDB (Mongoose)

> **Warning** 本文将教您从 scratch 使用自定义组件创建基于 **Mongoose** 包的 __INLINE_CODE_8__。由于这个解决方案包含了许多可以使用 ready to use 和 out-of-the-box 的dedicated __INLINE_CODE_9__ 包所省略的开销。要了解更多，请查看 __LINK_35__。

__LINK_36__ 是最流行的 __LINK_37__ 对象建模工具。

#### Getting started

要开始使用这个库，我们需要安装所有必要的依赖项：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

```

首先，我们需要使用 `webpack` 函数建立与数据库的连接。`graphql` 函数返回一个 `dist`，因此我们需要创建一个 __LINK_38__。

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

> info **Hint** 遵循最佳实践，我们将自定义提供者声明在单独的文件中，该文件具有 `webpack` 后缀。

然后，我们需要将这些提供者导出，以便它们在应用程序的其余部分中可访问。

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

现在，我们可以使用 `entities` 装饰器注入 `webpack` 对象。每个依赖于 `HotModuleReplacementPlugin` 异步提供者的类都将等待 `HotModuleReplacementPlugin` 解决。

#### Model injection

使用 Mongoose，所有东西都是从 __LINK_39__派生的。让我们定义 `webpack-pnp-externals`：

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

`webpack-node-externals` 属于 `webpack-hmr.config.js` 目录。这是 `nodeExternals` 的一个表示。

现在是时候创建一个 **Model** 提供者：

```bash
$ npm run start:dev

```

> warning **Warning** 在实际应用中，你应该避免 **magic strings**。同时 `externals` 和 `WebpackPnpExternals` 应该在单独的 `webpack-pnp-externals` 文件中。

现在，我们可以使用 `HotModuleReplacementPlugin` 装饰器将 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})` 注入到 `webpack` 中：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin

```

在上面的示例中，我们使用了 `WatchIgnorePlugin` 接口。这接口扩展了 `RunScriptWebpackPlugin` 从 Mongoose 包：

```typescript
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new RunScriptWebpackPlugin({ name: 'server.js', autoRestart: false })],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};

```

数据库连接是 **异步** 的，但是 Nest 使这个过程对用户完全不可见。`main.ts` 类等待 db 连接，而 `package.json` 将延迟直到模型准备好使用。整个应用程序可以在每个类实例化时启动。

以下是一个最终的 `webpack-pnp-externals`：

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

> info **Hint** 不要忘记将 `webpack-node-externals` 导入到根 `webpack.config.js` 中。

#### Example

有一个可用的 __LINK_40__ 示例。