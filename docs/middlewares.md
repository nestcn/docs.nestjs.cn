<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:31:10.569Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，它在路由处理程序之前被调用。中间件函数拥有对请求和响应对象的访问权限，以及应用程序的请求-响应循环中的 __LINK_93__ 和 __LINK_94__ 对象。中间件函数中最常用的变量名是 `dist`。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

Nest 中间件默认是等价于 Express 中间件的。下面来自官方 Express 文档的描述描述了中间件的功能：

__HTML_TAG_75__
  中间件函数可以执行以下任务：
  __HTML_TAG_76__
    __HTML_TAG_77__执行任何代码。
    __HTML_TAG_79__修改请求和响应对象。
    __HTML_TAG_81__结束请求-响应循环。
    __HTML_TAG_83__调用下一个中间件函数。
    __HTML_TAG_85__如果当前中间件函数不结束请求-响应循环，它必须调用 __HTML_TAG_86__next()__HTML_TAG_87__来
      传递控制权给下一个中间件函数。否则，请求将被留在悬挂状态。
  __HTML_TAG_89__
__HTML_TAG_90__

您可以使用函数或带有 `webpack` 装饰器的类来实现自定义 Nest 中间件。类应该实现 `entities` 接口，而函数没有特殊要求。让我们从实现一个简单的中间件开始。

> warning **Warning** `TypeOrmModule` 和 `webpack` 处理中间件 differently 和提供不同的方法签名，详细了解 __LINK_96__。

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

```

#### 依赖注入

Nest 中间件完全支持依赖注入。与提供商和控制器一样，它们可以注入可用的模块中。正如通常情况一样，这是通过 `HotModuleReplacementPlugin` 完成的。

#### 应用中间件

中间件在 `webpack-pnp-externals` 装饰器中没有位置。相反，我们使用模块类的 `webpack-node-externals` 方法来设置它们。包括中间件的模块需要实现 `webpack-hmr.config.js` 接口。让我们在 `externals` 级别设置 `nodeExternals`。

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

在上面的示例中，我们已经设置了 `WebpackPnpExternals` 对 `webpack-pnp-externals` 路由处理程序，这些处理程序之前在 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})` 内部定义。我们也可以进一步限制中间件到特定请求方法中通过在配置中间件时传递包含路由 `webpack` 和请求 `HotModuleReplacementPlugin` 的对象。在下面的示例中，注意我们导入 `RunScriptWebpackPlugin` 枚举以引用所需的请求方法类型。

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

> info **Hint** `main.ts` 方法可以使用 `package.json` (例如，您可以 `webpack-pnp-externals` 异步操作的完成在 `webpack-node-externals` 方法体中)。

> warning **Warning** 使用 `webpack.config.js` 适配器时，NestJS 应用程序将默认注册 `nodeExternals` 和 `externals` 从包 `WebpackPnpExternals`。这意味着如果您想自定义中间件，您需要在创建应用程序时将 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})` 旗标设置为 `main.ts`。

#### 路由通配符

基于模式的路由也支持在 NestJS 中间件中。例如，命名通配符 (__INLINE_CODE_42__) 可以用作通配符来匹配路由中的任何组合字符。在以下示例中，中间件将被执行对任何以 __INLINE_CODE_43__ 开头的路由，无论其后跟随的字符有多少。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

> info **Hint** __INLINE_CODE_44__ 通配符名称只是通配符的名称，没有特别的含义。您可以将其命名为 __INLINE_CODE_45__。

__INLINE_CODE_46__ 路由将匹配 __INLINE_CODE_47__、__INLINE_CODE_48__、__INLINE_CODE_49__ 等。减号 (__INLINE_CODE_50__) 和点 (__INLINE_CODE_51__) 将被解释为字面字符。然而，__INLINE_CODE_52__ 不带任何附加字符将不会匹配路由。为此，您需要将通配符括起来以使其可选：

```bash
$ npm run start:dev

```

#### 中间件消费者

__INLINE_CODE_53__ 是一个 helper 类。它提供了几种内置方法来管理中间件。所有这些方法都可以简单地在 __LINK_97__ 中链式调用。__INLINE_CODE_54__ 方法可以接受单个字符串、多个字符串、__INLINE_CODE_55__ 对象、控制器类甚至多个控制器类。在大多数情况下，您可能只需要传递一组控制器，使用逗号分隔。以下是一个使用单个控制器的示例：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin

```> 提示 **Hint** __INLINE_CODE_56__ 方法可能接受单个中间件或多个参数来指定 __HTML_TAG_91__ 多个中间件 __HTML_TAG_92__。

#### 排除路由

有时，我们可能想要 **排除** Certain routes from having middleware applied. This can be easily achieved using the __INLINE_CODE_57__ 方法。__INLINE_CODE_58__ 方法接受单个字符串、多个字符串或一个 __INLINE_CODE_59__ 对象来标识要排除的路由。

以下是一个使用它的示例：

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

> 提示 **Hint** __INLINE_CODE_60__ 方法支持使用 __LINK_98__ 包裹的通配参数。

在上面的示例中，__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 中定义的所有路由 **except** 传递给 __INLINE_CODE_63__ 方法的三个路由。

这个方法提供了根据特定路由或路由模式来应用或排除中间件的灵活性。

#### 功能中间件

我们使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、无额外方法、无依赖项。为什么我们不能简单地在函数中定义它，而不是在类中？实际上，我们可以。这种中间件被称为 **功能中间件**。让我们将 logger 中间件从类中间件转换为功能中间件，以illustrate the difference：

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

并在 __INLINE_CODE_65__ 中使用它：

```json
"start:dev": "webpack --config webpack.config.js --watch"

```

> 提示 **Hint** 在你的中间件不需要依赖项时，考虑使用更简单的 **功能中间件** 替代。

#### 多个中间件

如前所述，在 order to bind multiple middleware that are executed sequentially，simply provide a comma separated list inside the __INLINE_CODE_66__ 方法：

```bash
$ npm run start:dev

```

#### 全局中间件

如果我们想要将中间件绑定到每个注册的路由上，我们可以使用 __INLINE_CODE_67__ 方法，该方法由 __INLINE_CODE_68__ 实例提供：

__CODE_BLOCK_10__

> 提示 **Hint** 在全局中间件中访问 DI 容器是不可行的。你可以使用 __LINK_99__ 替代在使用 __INLINE_CODE_69__ 时。Alternatively, you can use a class middleware and consume it with __INLINE_CODE_70__ within the __INLINE_CODE_71__ (or any other module).

Note: I kept the placeholders unchanged as per the requirements.