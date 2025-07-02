### SWC

[SWC](https://swc.rs/)（Speedy Web Compiler）是一个基于 Rust 的可扩展平台，可用于编译和打包。将 SWC 与 Nest CLI 结合使用是显著加速开发流程的绝佳且简单的方式。

> info **注意** SWC 的编译速度比默认 TypeScript 编译器快约 **20 倍** 。

#### 安装

要开始使用，请先安装以下软件包：

```bash
$ npm i --save-dev @swc/cli @swc/core
```

#### 快速开始

安装完成后，你可以通过以下方式在 Nest CLI 中使用 `swc` 构建器：

```bash
$ nest start -b swc
```
# OR nest start --builder swc
```

> **提示** 如果你的代码库是 monorepo，请查阅 [本节内容](../recipes/swc#monorepo) 。

除了使用 `-b` 标志外，你也可以直接在 `nest-cli.json` 文件中将 `compilerOptions.builder` 属性设置为 `"swc"`，如下所示：

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}
```

要自定义构建器行为，你可以传入一个包含两个属性的对象：`type`（值为 `"swc"`）和 `options`，如下所示：

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc"
      }
    }
  }
}
```

要在监视模式下运行应用程序，请使用以下命令：

```bash
$ nest start -b swc -w
```
# OR nest start --builder swc --watch
```

#### 类型检查

SWC 本身不执行任何类型检查（与默认的 TypeScript 编译器不同），因此要启用此功能，您需要使用 `--type-check` 标志：

```bash
$ nest start -b swc --type-check
```

该命令将指示 Nest CLI 在 SWC 旁边以 `noEmit` 模式运行 `tsc`，这将异步执行类型检查。同样，除了传递 `--type-check` 标志外，您也可以直接在 `nest-cli.json` 文件中将 `compilerOptions.typeCheck` 属性设置为 `true`，如下所示：

```json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true
  }
}
```

#### 命令行插件（SWC）

`--type-check` 标志会自动执行 **NestJS CLI 插件**并生成一个序列化的元数据文件，该文件随后可以在运行时由应用程序加载。

#### SWC 配置

SWC 构建器已预先配置以满足 NestJS 应用程序的要求。但您可以通过在根目录下创建 `.swcrc` 文件并按需调整选项来自定义配置。

```json
{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "baseUrl": "./"
  },
  "minify": false
}
```

#### Monorepo

如果你的仓库是 monorepo，那么你需要配置 `webpack` 来使用 `swc-loader`，而不是使用 `swc` 构建器。

首先，安装所需的包：

```bash
$ npm i --save-dev swc-loader
```

安装完成后，在应用程序的根目录下创建一个 `webpack.config.js` 文件，内容如下：

```js
const swcDefaultConfig =
  require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
    .swcOptions;

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ],
  },
};
```

#### Monorepo 和 CLI 插件

现在如果使用 CLI 插件，`swc-loader` 将不会自动加载它们。您需要创建一个单独的文件来手动加载这些插件。为此，请在 `main.ts` 文件附近声明一个 `generate-metadata.ts` 文件，内容如下：

```ts
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname }),
  ],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: 'apps/<name>/tsconfig.app.json',
});
```

> info **提示** 本示例中我们使用了 `@nestjs/swagger` 插件，但您可以选择使用任何插件。

`generate()` 方法接受以下选项：

|                  |                                                                 |
| ---------------- | --------------------------------------------------------------- |
| watch            | 是否监视项目变更。                                              |
| tsconfigPath     | tsconfig.json 文件的路径。相对于当前工作目录（process.cwd()）。 |
| outputDir        | 元数据文件保存目录的路径。                                      |
| visitors         | 用于生成元数据的访问器数组。                                    |
| filename         | 元数据文件的名称。默认为 metadata.ts。                          |
| printDiagnostics | 是否将诊断信息打印到控制台。默认为 true。                       |

最后，您可以在单独的终端窗口中运行 `generate-metadata` 脚本，命令如下：

```bash
$ npx ts-node src/generate-metadata.ts
```
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

#### 常见问题

如果在应用中使用 TypeORM/MikroORM 或其他 ORM 时，可能会遇到循环导入问题。SWC 对**循环导入**的处理不佳，因此应采用以下解决方案：

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}
```

> info：**Relation** `类型`是从 `typeorm` 包中导出的。

这样做可以避免属性类型被保存在转译代码的属性元数据中，从而防止循环依赖问题。

若所用 ORM 未提供类似解决方案，可自行定义包装类型：

```typescript
/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T; // WrapperType === Relation
```

对于项目中所有的[循环依赖注入](/fundamentals/circular-dependency) ，您同样需要使用上文所述的自定义包装类型：

```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: WrapperType<ProfileService>
  ) {}
}
```

### Jest + SWC

要在 Jest 中使用 SWC，您需要安装以下软件包：

```bash
$ npm i --save-dev jest @swc/core @swc/jest
```

安装完成后，根据您的配置情况，使用以下内容更新 `package.json` 或 `jest.config.js` 文件：

```json
{
  "jest": {
    "transform": {
      "^.+\\.(t|j)s?$": ["@swc/jest"]
    }
  }
}
```

此外，你还需要在 `.swcrc` 文件中添加以下 `transform` 属性：`legacyDecorator` 和 `decoratorMetadata`：

```json
{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "baseUrl": "./"
  },
  "minify": false
}
```

如果你的项目中使用了 NestJS CLI 插件，你需要手动运行 `PluginMetadataGenerator`。请参阅 [本节内容](/recipes/swc#monorepo-和-cli-插件)了解更多信息。

### Vitest

[Vitest](https://vitest.dev/) 是一款专为 Vite 设计的快速轻量级测试运行器。它提供了现代化、快速且易于使用的测试解决方案，可与 NestJS 项目无缝集成。

#### 安装

要开始使用，首先安装所需的软件包：

```bash
$ npm i --save-dev vitest unplugin-swc @swc/core @vitest/coverage-v8
```

#### 配置

在应用程序的根目录下创建一个 `vitest.config.ts` 文件，内容如下：

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      src: resolve(__dirname, './src'),
    },
  },
});
```

此配置文件设置了 Vitest 环境、根目录和 SWC 插件。您还应该为端到端测试创建一个单独的配置文件，其中包含一个额外的 `include` 字段，用于指定测试路径的正则表达式：

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  plugins: [swc.vite()],
});
```

此外，您可以设置 `alias` 选项以支持测试中的 TypeScript 路径：

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    alias: {
      '@src': './src',
      '@test': './test',
    },
    root: './',
  },
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  plugins: [swc.vite()],
});
```

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名如 `src/`。这可能导致测试期间出现依赖解析错误。要解决此问题，请在 `vitest.config.ts` 文件中添加以下 `resolve.alias` 配置：

```ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
});
```

这能确保 Vitest 正确解析模块导入，避免因依赖缺失导致的错误。

#### 更新端到端测试中的导入语句

将所有使用 `import * as request from 'supertest'` 的端到端测试导入改为 `import request from 'supertest'` 。这是因为 Vitest 在与 Vite 打包时，需要将 supertest 作为默认导入，使用命名空间导入可能会在此特定配置中引发问题。

最后，将 package.json 文件中的测试脚本更新为以下内容：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:debug": "vitest --inspect-brk --inspect --logHeapUsage --threads=false",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
  }
}
```

这些脚本配置了 Vitest 用于运行测试、监听变更、生成代码覆盖率报告以及调试。其中 test:e2e 脚本专门用于通过自定义配置文件运行端到端测试。

通过此配置，您现在可以在 NestJS 项目中享受使用 Vitest 带来的优势，包括更快的测试执行速度和更现代化的测试体验。

> info **提示** 您可以在该 [代码库](https://github.com/TrilonIO/nest-vitest) 中查看实际示例
