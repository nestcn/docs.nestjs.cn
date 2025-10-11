### 热重载

对应用程序启动过程影响最大的是 **TypeScript 编译** 。幸运的是，借助 [webpack](https://github.com/webpack/webpack) 的 HMR（热模块替换）功能，我们无需在每次变更时重新编译整个项目。这大幅减少了实例化应用程序所需的时间，使迭代开发变得更加轻松。

:::warning 警告
请注意 `webpack` 不会自动将资源文件（例如 `graphql` 文件）复制到 `dist` 目录。同样地，`webpack` 也不支持通配符静态路径（例如 `TypeOrmModule` 中的 `entities` 属性）。
:::



### 使用 CLI

若您使用 [Nest CLI](../cli/overview)，配置过程相当简单。该 CLI 封装了 `webpack`，因此可以使用 `HotModuleReplacementPlugin`。

#### 安装

首先安装所需依赖包：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

:::info 提示
若使用 **Yarn Berry**（非经典版 Yarn），请安装 `webpack-pnp-externals` 而非 `webpack-node-externals`。
:::

#### 配置

安装完成后，在应用程序的根目录下创建一个 `webpack-hmr.config.js` 文件。

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
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
      }),
    ],
  };
};
```

:::info 提示
使用 **Yarn Berry**（非经典 Yarn）时，不要在 `externals` 配置属性中使用 `nodeExternals`，而应改用 `webpack-pnp-externals` 包中的 `WebpackPnpExternals`： `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] })` 。
:::



该函数第一个参数接收包含默认 webpack 配置的原始对象，第二个参数接收 Nest CLI 使用的底层 `webpack` 包引用。它返回一个修改后的 webpack 配置，其中包含 `HotModuleReplacementPlugin`、`WatchIgnorePlugin` 和 `RunScriptWebpackPlugin` 插件。

#### 热模块替换

要启用 **HMR**，请打开应用程序入口文件(`main.ts`)并添加以下 webpack 相关指令：

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

为简化执行流程，请在 `package.json` 文件中添加一个脚本。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```

现在只需打开命令行并运行以下命令：

```bash
$ npm run start:dev
```

### 无命令行界面

如果不使用 [Nest CLI](../cli/overview)，配置会稍显复杂（需要更多手动步骤）。

#### 安装

首先安装所需依赖包：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
```

:::info 提示
如果使用 **Yarn Berry**（非经典版 Yarn），请安装 `webpack-pnp-externals` 包而非 `webpack-node-externals`。
:::

#### 配置

安装完成后，在应用程序的根目录下创建一个 `webpack.config.js` 文件。

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
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new RunScriptWebpackPlugin({ name: 'server.js', autoRestart: false }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
```

:::info 提示
使用 **Yarn Berry**（非经典版 Yarn）时，不要在 `externals` 配置属性中使用 `nodeExternals`，而应改用 `webpack-pnp-externals` 包中的 `WebpackPnpExternals`： `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] })` 。
:::



此配置向 webpack 说明了关于应用程序的几个关键信息：入口文件的位置、存放**编译后**文件的目录，以及用于编译源文件的加载器类型。通常即使您不完全理解所有选项，也可以直接使用此文件。

#### 热模块替换

要启用 **HMR**，请打开应用程序入口文件(`main.ts`)并添加以下 webpack 相关指令：

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

为简化执行流程，请在 `package.json` 文件中添加一个脚本。

```json
"start:dev": "webpack --config webpack.config.js --watch"
```

现在只需打开命令行并运行以下命令：

```bash
$ npm run start:dev
```

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/08-webpack)查看。
