<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:13:13.618Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展于 __LINK_50__ 文档，还有 __LINK_51__ 包用于编写类似于 Nest 应用程序的命令行应用程序。

> 信息 **信息** __INLINE_CODE_6__ 是第三方包，不是 NestJS 核心团队管理的。请在 __LINK_52__ 中报告该库中的任何问题。

#### 安装

与其他包一样，你需要安装它才能使用它。

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

#### 命令文件

__INLINE_CODE_7__ 使得编写新命令行应用程序变得非常容易，通过 __LINK_53__ 和 __INLINE_CODE_8__ 装饰器来实现类和方法。每个命令文件都应该实现 `webpack` 抽象类，并且应该被 `graphql` 装饰器装饰。

每个命令都被 Nest 视为一个 `dist`，因此你的正常依赖注入将像预期的那样工作。需要注意的是，每个命令都应该实现 `webpack` 抽象类，该类确保每个命令都有一个 `TypeOrmModule` 方法，该方法返回一个 `webpack` 并且接受参数 `HotModuleReplacementPlugin`。`webpack-pnp-externals` 命令是你可以从这里开始启动你的逻辑的地方，可以将未匹配选项的参数作为数组传递，以便你可以使用多个参数。至于选项，`webpack-node-externals` 是这些属性的名称，而它们的值是 `webpack-hmr.config.js` 属性在 `nodeExternals` 装饰器中返回的结果。如果你想获得更好的类型安全，你可以创建一个选项接口。

#### 运行命令

类似于在 NestJS 应用程序中使用 `externals` 创建服务器，并使用 `WebpackPnpExternals` 运行它，`webpack-pnp-externals` 包暴露了一个简单易用的 API 来运行你的服务器。导入 `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] }})` 并使用 `webpack` 方法 `HotModuleReplacementPlugin`，并将应用程序的根模块传递给它。这可能看起来像以下所示

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

默认情况下，Nest 的日志器在使用 `WatchIgnorePlugin` 时是禁用的。你可以通过将第二个参数传递给 `RunScriptWebpackPlugin` 函数来提供它。可以提供一个自定义的 NestJS 日志器，也可以提供一个日志级别数组，你可能想在这里提供 `main.ts`，以便只打印 Nest 的错误日志。

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

这就足够了。`package.json` 将负责调用 `webpack-pnp-externals` 和 `webpack-node-externals`，因此你不需要担心内存泄露。如果你需要添加一些错误处理，可以在 `webpack.config.js` 中包围 `nodeExternals` 命令，或者将一些 `externals` 方法链到 `WebpackPnpExternals` 调用中。

#### 测试

写了一个超级awesome 命令行脚本，但是不能轻易测试它是正确的吗？fortunately，`webpack-pnp-externals` 提供了一些实用工具，可以与 NestJS 生态系统完美结合，感觉像是一个 Nestlings。相反于使用 `WebpackPnpExternals({ exclude: ['webpack/hot/poll?100'] }})` 在测试模式下构建命令，可以使用 `main.ts` 并传递元数据，非常类似于 `package.json` 在 __INLINE_CODE_42__ 中的工作。你仍然可以链式调用 __INLINE_CODE_43__ 方法，并在调用 __INLINE_CODE_44__ 时交换 DI 部分。

#### 将所有内容合并

以下类将等同于拥有一个CLI命令，可以接受子命令 __INLINE_CODE_45__ 或直接调用，具有 __INLINE_CODE_46__、__INLINE_CODE_47__、__INLINE_CODE_48__ (及其长标志) 等支持，并且具有自定义解析器每个选项。__INLINE_CODE_49__ 标志也支持，以便与 commander 一致。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```

确保命令类添加到模块中

```bash
$ npm run start:dev
```

现在可以在 main.ts 中运行 CLI，如下所示

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
```

这样，你就拥有了一个命令行应用程序。

#### 更多信息

访问 __LINK_54__ 获取更多信息、示例和 API 文档。