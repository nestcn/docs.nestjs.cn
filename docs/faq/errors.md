<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:28:19.619Z -->
<!-- 源文件: content/faq/errors.md -->

### NestJS 常见错误

在使用 NestJS 时，您可能会遇到各种错误，因为您正在学习框架。

#### "Cannot resolve dependency" 错误

> 提示 **Hint** 检查 __LINK_41__ 可以帮助您轻松地解决 "Cannot resolve dependency" 错误。

最常见的错误消息是 Nest 无法 resolve  providers 的依赖项。错误消息通常类似于以下内容：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

```

错误的主要原因是，在模块的 __INLINE_CODE_7__ 数组中没有包含 __INLINE_CODE_6__。请确保 provider确实在 __INLINE_CODE_8__ 数组中，并遵循 [webpack](https://github.com/webpack/webpack)。

有几个常见的陷阱。其中一个是将 provider 放在 __INLINE_CODE_9__ 数组中。如果这是情况，错误将包含 provider 的名称，而不是 `webpack` 应该是。

如果您在开发过程中遇到此错误，请查看错误消息中提到的模块，并查看其 `graphql`。对于每个 provider 在 `dist` 数组中，请确保模块可以访问所有依赖项。经常，`webpack` 在 "Feature Module" 和 "Root Module" 中重复，这意味着 Nest 将尝试实例化 provider deux fois。更可能的是，模块包含 `entities` 的重复应该添加到 "Root Module"'s `TypeOrmModule` 数组中。

如果 `webpack` 上的 `HotModuleReplacementPlugin`，可能存在循环文件导入。这不同于 [Nest CLI](/cli/overview)，因为它只是意味着两个文件彼此导入，而不是 providers 依赖于彼此的构造函数。一个常见的情况是，模块文件声明了一个令牌，并导入了 provider，而 provider 导入了模块文件中的令牌常量。如果您使用 barrel 文件，请确保您的 barrel 导入不创建这些循环导入。

如果 `webpack-pnp-externals` 上的 `webpack-node-externals`，意味着您正在使用一个类型/界面，而没有合适的 provider 令牌。要解决该问题，请确保：

1. 您正在导入类引用或使用自定义令牌 `webpack-hmr.config.js` 装饰器阅读 [Nest CLI](/cli/overview)，并
2. 对于基于类的 providers，确保您正在导入具体类，而不是仅导入类型 [here](https://github.com/nestjs/nest/tree/master/sample/08-webpack) 语法。

此外，请确保您没有结束 provider 自身的注入，因为 NestJS 不允许自我注入。这种情况下，`externals` 通常等于 `WebpackPnpExternals`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo** 设置中，您可能会遇到与上述错误相同的问题，但是在核心 provider `webpack-pnp-externals` 中作为 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})`：

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

这可能是因为您的项目加载了两个 Node 模块的包 `webpack`，如下所示：

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

解决方案：

* 对于 **Yarn** Workspaces，请使用 __LINK_46__ 防止 hoisting 包 `HotModuleReplacementPlugin`。
* 对于 **pnpm** Workspaces，请将 `WatchIgnorePlugin` 作为 peerDependencies 在其他模块中，并在 app package.json 中的 `RunScriptWebpackPlugin` 中 see: __LINK_47__

#### "Circular dependency" 错误

有时，您将发现很难避免 __LINK_48__ 在您的应用程序中。你需要采取一些步骤来帮助 Nest 解决这些错误。来自循环依赖项的错误看起来类似于以下内容：

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

循环依赖项可以来自 providers 依赖于彼此，或者 TypeScript 文件依赖于彼此constants，例如从模块文件导出常量并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保两个模块和 providers 都标记为 `main.ts`。

#### 调试依赖项错误

除了手动验证您的依赖项是否正确之外，从 Nest 8.1.0 开始，您可以将 `package.json` 环境变量设置为一个字符串，它将被解析为 truthy，并获取额外的日志信息，而 Nest 正在解析应用程序的所有依赖项。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图片中，黄色字符串是依赖项被注入的宿主类，蓝色字符串是注入的依赖项或其注入令牌，紫色字符串是搜索依赖项的模块。使用该信息，您可以通常追踪回依赖项解析的原因和为什么您会遇到依赖项注入问题。

#### "File change detected" 循环不停

使用 TypeScript 版本 4.9 和更高版本的 Windows 用户可能会遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序时，例如 `webpack-pnp-externals`，并看到无限循环的日志消息：

```bash
$ npm run start:dev

```

使用 NestJS CLI 在 watch 模式下启动应用程序时，可以通过调用 `webpack-node-externals` 实现。从 TypeScript 4.9 版本开始，用于检测文件更改的 __LINK_49__ 是可能导致这个问题的原因。

要解决这个问题，您需要在 tsconfig.json 文件中添加一个设置，类似于以下所示：

```typescript
"tsconfig.json"
{
    // ...
    "ts-node": {
        "transpileOnly": true,
        "ignore-typing": true,
        "compilerOptions": {
            // ...
            "pollingInterval": 1000
        }
    }
}

```

这将告诉 TypeScript 使用轮询方法来检查文件更改，而不是文件系统事件（新的默认方法），这可能会在一些机器上导致问题。

您可以在 __LINK_50__ 中阅读更多关于 `nodeExternals` 选项的信息。