<!-- 此文件从 content/recipes/mongodb.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:00:03.628Z -->
<!-- 源文件: content/recipes/mongodb.md -->

### MongoDB（Mongoose）

> **警告** 本文将教你使用自定义组件从头开始创建一个基于 **Mongoose** 包的 __INLINE_CODE_8__。由于这个解决方案包含了许多可以省略的 overhead，可以使用现有的、可用的 __INLINE_CODE_9__ 包。要了解更多，请查看 __LINK_35__。

__LINK_36__ 是最流行的 __LINK_37__ 对象建模工具。

#### 开始

要开始使用这个库，我们需要安装所有所需的依赖项：

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

> 信息 **提示** 我们遵循了最佳实践，将自定义提供者声明在独立文件中，该文件具有 `webpack` 后缀。

然后，我们需要将这些提供者导出，以使它们在应用程序的其余部分可访问。

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

现在，我们可以使用 `entities` 装饰器注入 `webpack` 对象。每个依赖于 `webpack` 异步提供者的类将等待 `HotModuleReplacementPlugin` 解决。

#### 模型注入

使用 Mongoose， everything 都来自 __LINK_39__。让我们定义 `webpack-pnp-externals`：

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

`webpack-node-externals` 属于 `webpack-hmr.config.js` 目录。该目录表示 `nodeExternals`。

现在是时候创建一个 **Model** 提供者：

```bash
$ npm run start:dev

```

> 警告 **警告** 在实际应用中，你应该避免 **magic strings**。Both `externals` 和 `WebpackPnpExternals` 应该保持在独立 `webpack-pnp-externals` 文件中。

现在，我们可以使用 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})` 装饰器注入 `webpack` 到 `HotModuleReplacementPlugin`：

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

数据库连接 **异步**，但 Nest 使这个过程对终端用户完全不可见。`main.ts` 类等待 db 连接，而 `package.json` 延迟直到模型准备使用。整个应用程序可以在每个类实例化时启动。

以下是一个最终 `webpack-pnp-externals`：

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

> 信息 **提示** 不要忘记将 `webpack-node-externals` 导入到根 `webpack.config.js`。

#### 示例

有一个可用的 __LINK_40__ 示例。