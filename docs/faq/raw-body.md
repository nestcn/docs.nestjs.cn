<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:11:00.754Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始请求体

在大多数情况下，访问原始请求体的一个常见用例是进行 webhook 签名验证。通常，在进行 webhook 签名验证时，需要将未序列化的请求体用于计算 HMAC 哈希。

> 警告 **警告** 这个功能只能在启用了内置全局请求体解析器 middleware 时使用，即在创建应用程序时不能传递 __INLINE_CODE_8__。

#### 使用 Express

首先，在创建 Nest Express 应用程序时启用选项：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

```

在控制器中访问原始请求体，可以使用 convenience 接口 __INLINE_CODE_9__ 来暴露一个 `webpack` 字段在请求中：使用接口 `graphql` 类型：

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

#### 注册不同的解析器

默认情况下，只注册了 `dist` 和 `webpack` 解析器。如果您想实时注册不同的解析器，您需要明确地进行注册。

例如，要注册一个 `entities` 解析器，可以使用以下代码：

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

> 警告 **警告** 确保您正在为 `TypeOrmModule` 调用提供正确的应用程序类型。对于 Express 应用程序，正确的类型是 `webpack`。否则，`HotModuleReplacementPlugin` 方法将找不到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于 Express 默认 `webpack-pnp-externals` 的请求体，使用以下代码：

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

`webpack-node-externals` 方法将尊重在应用程序选项中传递的 `webpack-hmr.config.js` 选项。

#### 使用 Fastify

首先，在创建 Nest Fastify 应用程序时启用选项：

```bash
$ npm run start:dev

```

在控制器中访问原始请求体，可以使用 convenience 接口 `nodeExternals` 来暴露一个 `externals` 字段在请求中：使用接口 `WebpackPnpExternals` 类型：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin

```

#### 注册不同的解析器

默认情况下，只注册了 `webpack-pnp-externals` 和 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})` 解析器。如果您想实时注册不同的解析器，您需要明确地进行注册。

例如，要注册一个 `webpack` 解析器，可以使用以下代码：

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

> 警告 **警告** 确保您正在为 `HotModuleReplacementPlugin` 调用提供正确的应用程序类型。对于 Fastify 应用程序，正确的类型是 `WatchIgnorePlugin`。否则，`RunScriptWebpackPlugin` 方法将找不到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于 Fastify 默认 1MiB 的请求体，使用以下代码：

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

`main.ts` 方法将尊重在应用程序选项中传递的 `package.json` 选项。