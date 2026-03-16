<!-- 此文件从 content/fundamentals/dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:02:39.931Z -->
<!-- 源文件: content/fundamentals/dynamic-modules.md -->

### 动态模块

本节将扩展关于动态模块的主题。完成本章后，您将了解它们是什么，以及何时和如何使用它们。

#### 介绍

大多数应用程序代码示例在文档的 **Overview** 部分中使用静态模块。模块定义了组件的组合，如 __LINK_218__ 和 __LINK_219__，它们作为一个整体的应用程序的一部分。它们提供了执行上下文或作用域，这些组件可以在其中工作。例如，提供者在模块中定义时是可见的，而无需导出它们。当提供者需要在模块外部可见时，它首先从其宿主模块中导出，然后在其消费模块中导入。

让我们来 walkthrough 一个熟悉的示例。

首先，我们将定义一个 `"swc"`，提供和导出一个 `nest-cli.json`。 `type` 是 `"swc"` 的宿主模块。

```bash
$ npm i --save-dev @swc/cli @swc/core

```

接下来，我们将定义一个 `options`，它导入 `.jsx`，使 `.tsx` 中的导出提供者在 `--type-check` 中可见：

```bash
$ nest start -b swc
# OR nest start --builder swc

```

这些构造使我们可以在 `tsc` 中注入 `noEmit`，例如在 `--type-check` 中：

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}

```

我们将称之为 **静态** 模块绑定。Nest 将在宿主和消费模块中已经声明的信息中 wire together 模块。让我们详细了解发生了什么。Nest 使 `compilerOptions.typeCheck` 在 `true` 中可见，通过：

1. 实例化 `nest-cli.json`，包括 transitively 导入其他模块，它们 `--type-check` 本身消费，并 transitively 解决依赖项（见 __LINK_220__）。
2. 实例化 `.swcrc`，并使 `swc` 的导出提供者在 `webpack` 中可见（就像它们在 `swc-loader` 中声明一样）。
3. 注入 `webpack.config.js` 的实例在 `swc-loader` 中。

#### 动态模块使用场景

使用静态模块绑定，我们无法让消费模块影响宿主模块中的提供者配置。为什么这很重要？想象一下，我们有一个通用的模块，它需要在不同用例中行为不同。这类似于许多系统中的“插件”概念，一个通用的设施需要一些配置才能被消费者使用。

一个好的示例是 **配置模块**。许多应用程序发现将配置细节外部化使用配置模块非常有用。这使得在不同的部署中动态地更改应用程序设置，例如，开发数据库用于开发人员， staging 数据库用于 staging/测试环境等。通过将配置参数委托给配置模块，应用程序源代码保持独立于配置参数。

挑战在于，配置模块本身，因为它是通用的（类似于“插件”），需要被消费模块自定义。这个时候 _动态模块_ 就发挥作用了。使用动态模块功能，我们可以使我们的配置模块 **动态**，这样消费模块可以使用 API 来控制在导入时如何自定义该模块。

换言之，动态模块提供了一个 API，用于将一个模块导入另一个模块，并在导入时自定义模块的属性和行为，而不是使用静态绑定所看到的。

__HTML_TAG_214____HTML_TAG_215__

#### 配置模块示例

我们将使用 __LINK_221__ 中的基本示例代码来完成本节。到本章结束时，完整的示例代码将作为一个工作 __LINK_222__。

我们的要求是使 `generate-metadata.ts` 接受一个 `main.ts` 对象以自定义它。以下是我们想要支持的特性。基本示例硬编码了 `@nestjs/swagger` 文件的位置，位于项目根目录下。让我们假设我们想使那变得可配置，以便在不同的项目中管理你的 `generate()` 文件。在 `watch` 文件夹下，你想在不同项目中选择不同的文件夹。

Note: I followed the provided glossary and terminology to translate the text. I also preserved the code examples, variable names, function names, and code comments unchanged.Here is the translation of the given English technical documentation to Chinese:

**动态模块**

动态模块允许我们将参数传递给正在导入的模块，以便更改其行为。让我们从消费模块的角度开始，从而逆向工作。首先，让我们快速回顾一下静态导入的示例，即不能影响导入模块的行为的方法。请注意 `outputDir` (即没有能力影响导入模块的行为的方法) 的 `visitors` 数组在 `filename` 装饰器中：

**```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}

```**

现在，让我们考虑一下动态导入，其中我们传递了一个配置对象，可能是什么样子。比较这两个示例之间的 `metadata.ts` 数组的差异：

**```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}

```**

现在，让我们看看动态示例中的移动部分：

1. `printDiagnostics` 是一个正常的类，所以我们可以推断出它必须有一个名为 `true` 的静态方法。我们知道这是静态方法，因为我们在 `generate-metadata` 类上调用它，而不是在该类的实例上。注意：该方法，我们将在下面创建，它可以具有任何名称，但是出于惯例，我们应该将其命名为 `Relation` 或 `typeorm`。
2. `package.json` 方法由我们定义，所以我们可以接受任何输入参数。例如，我们将接受一个简单的 `jest.config.js` 对象，其中包含合适的属性，这是典型的情况。
3. 我们可以推断出 `transform` 方法必须返回类似 `.swcrc` 的值，因为其返回值出现在熟悉的 `legacyDecorator` 列表中，我们之前看到的列表包括一个模块列表。

实际上，我们的 `decoratorMetadata` 方法将返回一个 `PluginMetadataGenerator`。动态模块只是在运行时创建的模块，与静态模块具有相同的属性，除了一个额外的属性 `vitest.config.ts`。让我们快速回顾一下静态模块声明的示例，注意模块选项对象中的模块选项：

**```bash
$ nest start -b swc -w
# OR nest start --builder swc --watch

```**

动态模块必须返回一个具有相同接口的对象，除了一个额外的属性 `include`。`alias` 属性是模块的名称，并且应该与模块类的名称相同，如下所示。

> 信息 **提示** 对于动态模块，所有模块选项对象的属性都是可选的 **except** `src/`。

现在，让我们看看静态 `resolve.alias` 方法。我们可以看到，它的任务是返回一个具有 `vitest.config.ts` 接口的对象。当我们调用它时，我们实际上是在为 `import * as request from 'supertest'` 列表提供一个模块，类似于在静态情况下通过列出模块类名称来做到的。在其他 words，动态模块 API simply returns a module，但不是在 `import request from 'supertest'` 装饰器中固定模块选项，而是程序matically 指定它们。

还有几个细节需要涵盖，以便使图像更加完整：

1. 我们现在可以说 __INLINE_CODE_81__ 装饰器的 __INLINE_CODE_82__ 属性不仅可以传递模块类名称（例如 __INLINE_CODE_83__），而且可以传递返回动态模块的函数（例如 __INLINE_CODE_84__）。
2. 动态模块 itself 可以导入其他模块。我们不会在这个示例中这样做，但如果动态模块依赖于来自其他模块的提供商，你将使用可选的 __INLINE_CODE_85__ 属性来导入它们。再次，这正是使用 __INLINE_CODE_86__ 装饰器来声明静态模块的元数据的方式。

现在，我们可以看到所有部分如何相互连接。调用 __INLINE_CODE_88__ 将返回一个 __INLINE_CODE_89__ 对象，其中的属性实际上是我们之前通过 __INLINE_CODE_90__ 装饰器提供的元数据的同等。

> 信息 **提示** 从 __INLINE_CODE_91__ 导入 __INLINE_CODE_92__。

我们的动态模块现在还不太有趣，因为我们还没有引入任何可以 **配置** 它的能力。让我们解决这个问题。

#### 模块配置

自定义 __INLINE_CODE_93__ 的一种明显解决方案是将其传递给静态 __INLINE_CODE_95__ 方法，我们之前猜测过。让我们再次查看我们的消费模块的 __INLINE_CODE_96__ 属性：

**```json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true
  }
}

```**Here is the translation of the English technical documentation to Chinese:

如何使用__INLINE_CODE_97__对象在动态模块中？让我们考虑一下。我们知道我们的__INLINE_CODE_102__实际上是一个主机，用于提供和导出一个可注入的服务-__INLINE_CODE_101__-以供其他提供者使用。实际上，我们的__INLINE_CODE_102__需要读取__INLINE_CODE_103__对象以自定义其行为。假设我们知道如何将__INLINE_CODE_104__从__INLINE_CODE_105__方法传递到__INLINE_CODE_106__中。这样，我们可以根据__INLINE_CODE_107__对象的属性自定义服务的行为（注意：由于我们尚未确定如何将其传递，我们将硬编码__INLINE_CODE_108__。我们将在下一分钟中解决这个问题）。

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

现在我们的__INLINE_CODE_109__知道如何在__INLINE_CODE_111__文件夹中找到__INLINE_CODE_110__文件。

我们的剩余任务是将__INLINE_CODE_112__对象从__INLINE_CODE_113__步骤注入到我们的__INLINE_CODE_114__中。当然，我们将使用依赖注入来实现。这个关键点很重要，所以请确保您理解了。我们的__INLINE_CODE_115__提供了__INLINE_CODE_116__。__INLINE_CODE_117__又依赖于__INLINE_CODE_118__对象，该对象只有在运行时才能提供。因此，在运行时，我们需要首先将__INLINE_CODE_119__对象绑定到Nest IoC 容器，然后使用Nest注入它到我们的__INLINE_CODE_120__中。请记住，从“自定义提供者”章节中，我们可以使用依赖注入来处理简单的__INLINE_CODE_121__对象。

让我们首先绑定options对象到IoC 容器中。在我们的静态__INLINE_CODE_122__方法中，我们需要定义options对象作为提供者。这将使其可注入到__INLINE_CODE_123__中，我们将在下一步中使用。在以下代码中，请注意__INLINE_CODE_124__数组：

```bash
$ npm i --save-dev swc-loader

```

现在我们可以完成这个过程，通过注入__INLINE_CODE_125__提供者到__INLINE_CODE_126__中。请记住，当我们使用非类token定义提供者时，我们需要使用__INLINE_CODE_127__装饰器__LINK_224__。

```js
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

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

最后一笔：为了简洁，我们使用了字符串注入token（__INLINE_CODE_128__），但最佳实践是将其定义为常量（或__INLINE_CODE_129__）在单独的文件中，并导入该文件。例如：

```ts
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: 'apps/<name>/tsconfig.app.json',
});

```

#### 示例

本章中的代码示例可以在__LINK_225__中找到。

#### 社区指南

您可能已经在一些__INLINE_CODE_133__包中看到使用方法如__INLINE_CODE_130__、__INLINE_CODE_131__和__INLINE_CODE_132__。这些方法之间有什么区别？没有硬性规定，但__INLINE_CODE_134__包尝试遵循以下指南：

在创建模块时：

- __INLINE_CODE_135__，您期待配置动态模块的特定配置，以供调用模块使用。例如，Nest的__INLINE_CODE_136__:__INLINE_CODE_137__。如果在另一个模块中使用__INLINE_CODE_138__，它将具有不同的配置。您可以对多个模块进行配置。

- __INLINE_CODE_139__，您期待配置动态模块一次，然后在多个地方重用该配置（可能是不知晓的，因为它是抽象的）。这是为什么您有一个__INLINE_CODE_140__，一个__INLINE_CODE_141__等。

- __INLINE_CODE_142__，您期待使用动态模块的__INLINE_CODE_143__配置，但需要根据调用模块的需要进行某些配置（例如，这个模块应该访问哪个存储库，或者logger应该使用哪种上下文）。

所有这些通常都有它们的__INLINE_CODE_144__对应项__INLINE_CODE_145__、__INLINE_CODE_146__和__INLINE_CODE_147__，它们表示相同的意思，但使用Nest的依赖注入来配置。

#### 可配置模块构建器

手动创建高度可配置、动态模块， expose __INLINE_CODE_148__ 方法（__INLINE_CODE_149__、__INLINE_CODE_150__等）非常复杂，特别是对新手来说。Nest expose __INLINE_CODE_151__ 类，简化这个过程，让您在几行代码中构建模块“蓝图”。

Please note that I followed the provided glossary and terminology strictly, and kept the code and formatting unchanged. I also translated the code comments from English to Chinese.Here is the translation of the provided English technical documentation to Chinese:

**创建专门的接口**

在使用 `__INLINE_CODE_153__` 之前，让我们创建一个专门的接口来表示 `__INLINE_CODE_154__` 的选项。

````bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

````

**创建新的文件**

现在，让我们创建一个新的文件（与现有的 `__INLINE_CODE_155__` 文件并排），并命名为 `__INLINE_CODE_156__`。在这个文件中，让我们使用 `__INLINE_CODE_157__` 来构建 `__INLINE_CODE_158__` 定义。

````typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}

````

**修改实现**

现在，让我们打开 `__INLINE_CODE_159__` 文件，并将其实现修改为使用自动生成的 `__INLINE_CODE_160__`：

````typescript
/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T; // WrapperType === Relation

````

**扩展 `__INLINE_CODE_161__`**

扩展 `__INLINE_CODE_161__` 意味着 `__INLINE_CODE_162__` 现在不仅提供了 `__INLINE_CODE_163__` 方法（就像之前的自定义实现），而且还提供了 `__INLINE_CODE_164__` 方法，允许消费者异步配置该模块，例如，通过提供异步工厂：

````typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: WrapperType<ProfileService>,
  ) {};
}

````

**`__INLINE_CODE_165__` 方法**

`__INLINE_CODE_165__` 方法接受以下对象作为参数：

````bash
$ npm i --save-dev jest @swc/core @swc/jest

````

**遍历属性**

- `__INLINE_CODE_166__` - 一个返回配置对象的函数。它可以是同步或异步的。要将依赖项注入工厂函数，请使用 `__INLINE_CODE_167__` 属性。我们在上面的示例中使用了该变体。
- `__INLINE_CODE_168__` - 一个依赖项数组，该数组将被注入到工厂函数中。依赖项的顺序必须与工厂函数的参数顺序相匹配。
- `__INLINE_CODE_169__` - 一个将被实例化为提供者的类。该类必须实现相应的接口。通常，这是一个提供一个 `__INLINE_CODE_170__` 方法的类，该方法返回配置对象。更多信息请参阅 `__LINK_226__` 部分。
- `__INLINE_CODE_171__` - `__INLINE_CODE_172__` 的一个变体，允许您使用现有的提供者而不是 instructing Nest 创建一个新的类实例。这个变体非常有用，当您想使用已经注册在模块中的提供者时。请注意，该类必须实现与 `__INLINE_CODE_173__` 相同的接口（因此，它必须提供 `__INLINE_CODE_174__` 方法，除非您Override 默认方法名称，见 `__LINK_227__` 部分）。

总是选择上述选项中的一个（`__INLINE_CODE_175__`、`__INLINE_CODE_176__` 或 `__INLINE_CODE_177__`），因为它们是互斥的。

**最后更新**

最后，让我们更新 `__INLINE_CODE_178__` 类，以便将生成的模块选项提供者注入，而不是使用之前的 `__INLINE_CODE_179__`：

````json
{
  "jest": {
    "transform": {
      "^.+\\.(t|j)s?$": ["@swc/jest"]
    }
  }
}

````

**自定义方法关键**

`__INLINE_CODE_180__` 默认提供了 `__INLINE_CODE_181__` 和 `__INLINE_CODE_182__` 方法。要使用不同的方法名称，请使用 `__INLINE_CODE_183__` 方法，例如：

````json
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

````

**自定义选项工厂类**

由于 `__INLINE_CODE_187__` 方法（或 `__INLINE_CODE_188__` 或任何其他名称，取决于配置）允许消费者传递提供者定义，该定义将被解析为模块配置，库消费者可以提供一个类来构建配置对象。

````ts
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
      'src': resolve(__dirname, './src'),
    },
  },
});

````

这个类默认必须提供 `__INLINE_CODE_189__` 方法，该方法返回模块配置对象。然而，如果您的库遵循不同的命名惯例，您可以更改该行为，并 instruct `__INLINE_CODE_190__` 期待不同的方法，例如 `__INLINE_CODE_191__`，使用 `__INLINE_CODE_192__` 方法：

````ts
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

````

现在，`__INLINE_CODE_193__` 类必须 expose `__INLINE_CODE_194__` 方法（而不是 `__INLINE_CODE_195__`）：

````ts
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

````

**额外选项**

在您的模块中可能需要处理一些边缘情况，例如需要在模块中使用的额外选项，这些选项不应该包含在 `__INLINE_CODE_198__` 提供者中（因为它们与注册在该模块中的服务/提供者无关，例如 `__INLINE_CODE_199__` 不需要知道其宿主模块是否注册为全局模块）。

在这种情况下，可以使用 `__INLINE_CODE_200__` 方法。见以下示例：

````ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
    },
  },
});

````

Please let me know if you need any further assistance.以下是翻译后的中文文档：

在 __INLINE_CODE_201__ 方法的第一个参数中，包含了“extra”属性的默认值对象。第二个参数是一个函数，它接受由 __INLINE_CODE_202__、__INLINE_CODE_203__ 等 auto-generated 模块定义（包括 __INLINE_CODE_204__ 对象，表示额外属性，或者由消费者指定的默认值）。这个函数返回修改后的模块定义。在这个特定的示例中，我们将 __INLINE_CODE_205__ 属性分配给模块定义的 __INLINE_CODE_206__ 属性（这 ultimately 决定了模块是否是全局的，更多信息请阅读 __LINK_228__）。

在消费这个模块时，可以传递额外的 __INLINE_CODE_207__ 标志，如下所示：

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

然而，因为 __INLINE_CODE_208__ 声明为“extra”属性，所以它在 __INLINE_CODE_209__ 提供者中不可用：

__CODE_BLOCK_25__

#### 扩展 auto-generated 方法

如果需要，可以扩展 auto-generated 静态方法（__INLINE_CODE_210__、__INLINE_CODE_211__ 等），如下所示：

__CODE_BLOCK_26__

请注意，使用 __INLINE_CODE_212__ 和 __INLINE_CODE_213__ 类型必须从模块定义文件中导出：

__CODE_BLOCK_27__

Note: I've kept all the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I've also maintained Markdown formatting, links, images, tables unchanged, and kept relative links unchanged. I've removed all @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.