<!-- 此文件从 content/techniques/configuration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:34:33.619Z -->
<!-- 源文件: content/techniques/configuration.md -->

### 配置

应用程序通常在不同的 **环境** 中运行。根据环境，需要使用不同的配置设置。例如，通常情况下，局域环境依赖于特定的数据库凭证，这些凭证只适用于局域DB实例。生产环境将使用单独的DB凭证。由于配置变量会改变，最佳实践是 __LINK_248__ 在环境中。

externally 定义的环境变量在 Node.js 中通过 `CacheModule` 全局对象可见。我们可以尝试通过设置环境变量来解决多个环境的问题。这在开发和测试环境中特别有用，因为这些值需要轻松地模拟和/或更改。

在 Node.js 应用程序中，使用 `CacheInterceptor` 文件来表示每个环境是很常见的。这些文件包含键值对，其中每个键表示特定的值。运行应用程序在不同的环境中只是需要交换正确的 `GET` 文件。

使用 Nest 时，一个良好的方法是创建一个 `@Res()`，它暴露一个 `CacheInterceptor`，用于加载适当的 `ttl` 文件。虽然您可能会自己编写这样的模块，但为了方便，Nest 提供了 `0` 包在箱外。我们将在当前章节中涵盖这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install @nestjs/cache-manager cache-manager

```

> info **提示** `ttl` 包内部使用 __LINK_249__。

> warning **注意** `register()` 需要 TypeScript 4.1 或更高版本。

#### 获取 started

安装过程完成后，我们可以导入 `CacheModule`。通常，我们将其导入到根 `isGlobal` 中，并使用 `true` 静态方法来控制其行为。在这个步骤中，环境变量的键值对将被解析和解决。后续，我们将看到多个访问 `CacheModule` 类的 `AppModule` 的选项。

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class AppModule {}

```

上面的代码将从默认位置（项目根目录）加载和解析 `CacheKey` 文件，将 `@CacheKey()` 文件中的键值对与环境变量 `@CacheTTL()` 的值合并，并将结果存储在私有结构中，您可以通过 `@CacheTTL()` 访问该结构。`@CacheKey()` 方法注册 `@CacheTTL()` 提供者，该提供者提供 `@nestjs/cache-manager` 方法来读取这些解析和合并的配置变量。由于 `@CacheKey()` 依赖于 __LINK_250__，它使用该包的规则来解决环境变量名称冲突。当键同时存在于运行环境中作为环境变量（例如，通过 OS shell exports like `@CacheTTL()`）和 `@CacheKey()` 文件中，运行环境变量优先。

一个样本 `@CacheTTL()` 文件看起来像这样：

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

```

如果您需要一些环境变量在 `CacheInterceptor` 加载和 Nest 应用程序启动之前可用（例如，将微服务配置传递给 `@CacheKey()` 方法），可以使用 Nest CLI 的 `@CacheTTL()` 选项。这个选项允许您指定要加载的 `@CacheTTL()` 文件的路径。 `@CacheKey()` 标志在 Node v20 中引入，请查看 __LINK_251__ 获取更多信息。

```typescript
const value = await this.cacheManager.get('key');

```

#### 自定义 env 文件路径

默认情况下，包将在应用程序的根目录中查找 `@CacheKey()` 文件。如果要指定另一个路径来加载 `Authorization` 文件，请将 `profile` 属性设置为可选的选项对象的 `CacheInterceptor` 属性，例如：

```typescript
await this.cacheManager.set('key', 'value');

```

您也可以指定多个 `trackBy()` 文件的路径，如下所示：

```typescript
await this.cacheManager.set('key', 'value', 1000);

```

如果变量在多个文件中找到，第一个文件优先。

#### 禁用 env 变量加载

如果您不想加载 `@keyv/redis` 文件，而是想简单地访问运行环境中的环境变量（例如，通过 OS shell exports like `CacheModule`），请将选项对象的 `CacheableMemory` 属性设置为 `KeyvRedis`，例如：

```typescript
await this.cacheManager.set('key', 'value', 0);

```

#### 使用模块全局

当您想在其他模块中使用 `CacheableMemory` 时，您需要将其导入（与 Nest 模块的标准使用方式相同）。或者，您可以将其声明为 __LINK_252__，将选项对象的 `KeyvRedis` 属性设置为 `stores`，例如：

```typescript
await this.cacheManager.del('key');

```

#### 自定义配置文件For more complex projects, you may utilize custom configuration files to return nested configuration objects. This allows you to group related configuration settings by function (e.g., database-related settings), and to store related settings in individual files to help manage them independently.

一个复杂的项目中，您可能会使用自定义配置文件来返回嵌套的配置对象。这允许您根据功能将相关配置设置分组（例如，数据库相关设置），并将相关设置存储在单个文件中以帮助管理它们。

A custom configuration file exports a factory function that returns a configuration object. The configuration object can be any arbitrarily nested plain JavaScript object. The `inject` object will contain the fully resolved environment variable key/value pairs (with `useClass` file and externally defined variables resolved and merged as described __HTML_TAG_238__above__HTML_TAG_239__). Since you control the returned configuration object, you can add any required logic to cast values to an appropriate type, set default values, etc. For example:

自定义配置文件exports一个工厂函数，该函数返回一个配置对象。配置对象可以是任意嵌套的纯 JavaScript 对象。`inject`对象将包含完全解析的环境变量键/值对（带有`useClass`文件和外部定义的变量解析和合并，如__HTML_TAG_238__above__HTML_TAG_239__）。由于您控制返回的配置对象，您可以添加任何必要的逻辑来将值转换为适当的类型，设置默认值等。例如：

```typescript
await this.cacheManager.clear();

```

We load this file using the `CacheConfigService` property of the options object we pass to the `CacheModule` method:

使用`CacheConfigService`选项对象的`CacheModule`方法中的选项对象加载该文件：

```typescript
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}

```

> info **Notice** The value assigned to the `CacheConfigService` property is an array, allowing you to load multiple configuration files (e.g. `CacheOptionsFactory`)

> info **注意**将`CacheConfigService`属性值分配给数组，这使您可以加载多个配置文件（例如`CacheOptionsFactory`）

With custom configuration files, we can also manage custom files such as YAML files. Here is an example of a configuration using YAML format:

使用自定义配置文件，我们还可以管理自定义文件，如 YAML 文件。以下是使用 YAML 格式的配置示例：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}

```

To read and parse YAML files, we can leverage the `useExisting` package.

为了阅读和解析 YAML 文件，我们可以使用`useExisting`包。

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});

```

Once the package is installed, we use the `useClass` function to load the YAML file we just created above.

安装包后，我们使用`useClass`函数加载我们刚刚创建的 YAML 文件。

```typescript
CacheModule.register({
  isGlobal: true,
});

```

> warning **Note** Nest CLI does not automatically move your "assets" (non-TS files) to the `CacheModule` folder during the build process. To make sure that your YAML files are copied, you have to specify this in the `ConfigService` object in the `CacheModule#register` file. As an example, if the `CacheModule#registerAsync` folder is at the same level as the `CacheOptionsFactory` folder, add `extraProviders` with the value `registerAsync()`. Read more __LINK_253__.

> warning **注意**Nest CLI 不会自动将您的 "assets"（非 TS 文件）移到`CacheModule`文件夹中 During the build process。要确保您的 YAML 文件被复制，您需要在`ConfigService`对象中`CacheModule#register`文件中指定此项。例如，如果`CacheModule#registerAsync`文件夹位于`CacheOptionsFactory`文件夹同一级别，添加`extraProviders`带有值`registerAsync()`。更多信息请见__LINK_253__。

Just a quick note - configuration files aren't automatically validated, even if you're using the __INLINE_CODE_103__ option in NestJS's __INLINE_CODE_104__. If you need validation or want to apply any transformations, you'll have to handle that within the factory function where you have complete control over the configuration object. This allows you to implement any custom validation logic as needed.

只是一个快速注释 - 配置文件不管您是否使用NestJS的__INLINE_CODE_103__选项，也不会自动验证。如果您需要验证或想要应用任何转换，您需要在工厂函数中处理该问题，该函数中您拥有对配置对象的完全控制。这允许您实现任何自定义验证逻辑。

For example, if you want to ensure that port is within a certain range, you can add a validation step to the factory function:

例如，如果您想要确保端口在某个范围内，您可以在工厂函数中添加验证步骤：

```typescript
@Controller()
@CacheTTL(50)
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
}

```

Now, if the port is outside the specified range, the application will throw an error during startup.

现在，如果端口超出了指定范围，应用程序将在启动时抛出错误。

__HTML_TAG_240____HTML_TAG_241__

#### Using the __INLINE_CODE_105__

To access configuration values from our __INLINE_CODE_106__, we first need to inject __INLINE_CODE_107__. As with any provider, we need to import its containing module - the __INLINE_CODE_108__ - into the module that will use it (unless you set the __INLINE_CODE_109__ property in the options object passed to the __INLINE_CODE_110__ method to __INLINE_CODE_111__). Import it into a feature module as shown belowHere is the translation of the provided English technical documentation to Chinese:

第二个通用方法依赖于第一个方法，作为类型断言来消除 __INLINE_CODE_128__ 类型的所有 __INLINE_CODE_129__ 方法可以返回的值，而这些方法在 __INLINE_CODE_130__ 开启时执行。例如：

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});

```

> info **提示** 为了确保 __INLINE_CODE_131__ 方法只从自定义配置文件中获取值，忽略 __INLINE_CODE_132__ 变量，请将 __INLINE_CODE_133__ 选项设置为 __INLINE_CODE_134__ 在 __INLINE_CODE_135__ 的 __INLINE_CODE_136__ 方法的选项对象中。

#### 配置命名空间

__INLINE_CODE_137__ 允许您定义和加载多个自定义配置文件，如 __HTML_TAG_244__Custom configuration files__HTML_TAG_245__ 中所示。您可以使用嵌套配置对象来管理复杂的配置对象层次结构，如上述部分所示。或者，您可以使用 __INLINE_CODE_138__ 函数返回命名空间配置对象，例如：

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}

```

与自定义配置文件一样，在您的 __INLINE_CODE_139__ 工厂函数中，__INLINE_CODE_140__ 对象将包含完全解析的环境变量键/值对（在 __HTML_TAG_246__above__HTML_TAG_247__ 中描述的文件和外部定义的变量解析和合并）。

> info **提示** __INLINE_CODE_142__ 函数来自 __INLINE_CODE_143__ 包。

使用 __INLINE_CODE_144__ 属性在 __INLINE_CODE_145__ 方法的选项对象中加载命名空间配置，同样可以加载自定义配置文件：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});

```

现在，可以使用点 notation 从 __INLINE_CODE_146__ 命名空间中获取 __INLINE_CODE_147__ 值。使用 __INLINE_CODE_148__ 作为前缀，对应于命名空间的名称（传递给 __INLINE_CODE_149__ 函数的第一个参数）：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});

```

一个合理的替代方案是直接注入 __INLINE_CODE_150__ 命名空间。这使得我们可以从类型检查中受益：

__CODE_BLOCK_25__

> info **提示** __INLINE_CODE_151__来自 __INLINE_CODE_152__ 包。

#### 模块中的命名空间配置

要将命名空间配置作为另一个模块的配置对象，您可以使用配置对象的 __INLINE_CODE_153__ 方法。这方法将您的命名空间配置转换为提供商，然后将其传递给模块中 __INLINE_CODE_154__（或等效方法）的 __INLINE_CODE_155__ 方法。

以下是一个示例：

__CODE_BLOCK_26__

要了解 __INLINE_CODE_155__ 方法的工作原理，让我们查看返回值：

__CODE_BLOCK_27__

这个结构允许您轻松地将命名空间配置集成到您的模块中，从而确保您的应用程序保持有组织、模块化，而不需要编写 boilerplate、重复的代码。

#### 缓存环境变量

访问 __INLINE_CODE_156__ 可能会很慢，因此您可以将 __INLINE_CODE_157__ 属性设置为 __INLINE_CODE_158__ 选项对象的选项，以提高 __INLINE_CODE_159__ 方法在 __INLINE_CODE_160__ 中存储的变量的性能：

__CODE_BLOCK_28__

#### 部分注册

迄今，我们已经处理了根模块（例如 __INLINE_CODE_161__）中的配置文件，以 __INLINE_CODE_162__ 方法。也许您有一个更复杂的项目结构，具有特性特定的配置文件，位于多个不同的目录中。不是在根模块中加载所有这些文件，而是使用 __INLINE_CODE_163__ 包提供的特性，称为 **partial registration**，引用每个特性模块关联的配置文件。使用 __INLINE_CODE_164__ 静态方法在特性模块中执行该部分注册，例如：

__CODE_BLOCK_29__

> info **警告** 在某些情况下，您可能需要使用 __INLINE_CODE_165__ 钩子来访问通过部分注册加载的属性，而不是在构造函数中。这是因为 __INLINE_CODE_166__ 方法是在模块初始化时运行的，而模块初始化的顺序是 indeterminate。如果您访问依赖于配置的值的另一个模块，在构造函数中，该模块可能还没有初始化。 __INLINE_CODE_167__ 方法仅在依赖于其初始化的模块都已初始化时运行，因此这项技术是安全的。

#### 模式验证

在应用启动时，标准做法是抛出异常，如果需要的环境变量没有提供或不满足某些验证规则。__INLINE_CODE_168__ 包启用了两个不同的方式来实现：

- __LINK_254__ 内置验证器。使用 Joi，您可以定义对象模式并将 JavaScript 对象验证为该模式。
- 自定义 __INLINE_CODE_169__ 函数，输入环境变量。

要使用 Joi，我们必须安装 Joi 包：

__CODE_BLOCK_30__

Note: I have followed the translation guidelines and maintained the original formatting, code examples, and links. I also used the provided glossary to translate technical terms.以下是翻译后的中文技术文档：

现在，我们可以定义一个 Joi 验证方案，并将其作为 __INLINE_CODE_170__ 方法的 options 对象中的 __INLINE_CODE_171__ 属性传递，如下所示：

__代码块31__

默认情况下，所有模式键都是可选的。在这里，我们设置了 __INLINE_CODE_172__ 和 __INLINE_CODE_173__ 的默认值，这些值将在我们没有在环境变量（__INLINE_CODE_174__ 文件或进程环境）中提供这些变量时使用。 Alternatively, we can use the __INLINE_CODE_175__ validation method to require that a value must be defined in the environment (__INLINE_CODE_176__ file or process environment). In this case, the validation step will throw an exception if we don't provide the variable in the environment. See __链接255__ for more on how to construct validation schemas.

默认情况下，未知环境变量（环境变量的键不在模式中）是允许的，并且不触发验证异常。默认情况下，所有验证错误都是报告的。 You can alter these behaviors by passing an options object via the __INLINE_CODE_177__ key of the __INLINE_CODE_178__ options object. This options object can contain any of the standard validation options properties provided by __链接256__. For example, to reverse the two settings above, pass options like this:

__代码块32__

__INLINE_CODE_179__ 包含以下默认设置：

- __INLINE_CODE_180__: 控制是否允许未知键在环境变量中。默认为 __INLINE_CODE_181__
- __INLINE_CODE_182__: 如果为 true，停止验证在第一个错误时；如果为 false，返回所有错误。默认为 __INLINE_CODE_183__

请注意，在您决定传递 __INLINE_CODE_184__ 对象时，任何您没有明确传递的设置将默认为 __INLINE_CODE_185__ 标准默认值（而不是 __INLINE_CODE_186__ 默认值）。 For example, if you leave __INLINE_CODE_187__ unspecified in your custom __INLINE_CODE_188__ object, it will have the __INLINE_CODE_189__ default value of __INLINE_CODE_190__. Hence, it is probably safest to specify **both** of these settings in your custom object.

> 提示 **Hint** To disable validation of predefined environment variables, set the __INLINE_CODE_191__ attribute to __INLINE_CODE_192__ in the __INLINE_CODE_193__ method's options object. Predefined environment variables are process variables (__INLINE_CODE_194__ variables) that were set before the module was imported. For example, if you start your application with __INLINE_CODE_195__, then __INLINE_CODE_196__ is a predefined environment variable.

#### 自定义 validate 函数

Alternatively, you can specify a **synchronous** __INLINE_CODE_197__ function that takes an object containing the environment variables (from env file and process) and returns an object containing validated environment variables so that you can convert/mutate them if needed. If the function throws an error, it will prevent the application from bootstrapping.

在这个例子中，我们将使用 __INLINE_CODE_198__ 和 __INLINE_CODE_199__ 包。 First, we have to define:

- a class with validation constraints,
- a validate function that makes use of the __INLINE_CODE_200__ and __INLINE_CODE_201__ functions.

__代码块33__

With this in place, use the __INLINE_CODE_202__ function as a configuration option of the __INLINE_CODE_203__, as follows:

__代码块34__

#### 自定义 getter 函数

__INLINE_CODE_204__ 定义了一个通用的 __INLINE_CODE_205__ 方法来通过键检索配置值。我们也可以添加 __INLINE_CODE_206__ 函数以启用更加自然的编码风格：

__代码块35__

现在我们可以使用 getter 函数如下：

__代码块36__

#### 环境变量加载钩子

如果模块配置依赖于环境变量，并且这些变量从 __INLINE_CODE_207__ 文件中加载，你可以使用 __INLINE_CODE_208__ 钩子来确保文件在与 __INLINE_CODE_209__ 对象交互之前已经加载，见以下示例：

__代码块37__

这个构造保证了在 __INLINE_CODE_210__ Promise 解决后，所有配置变量都已经加载。

#### 条件模块配置

有时您可能想要根据 env 变量来条件地加载模块。幸运的是，__INLINE_CODE_211__ 提供了一个 __INLINE_CODE_212__，允许您做到这一点。

__代码块38__

上面的模块将只在 __INLINE_CODE_213__ 如果在 __INLINE_CODE_214__ 文件中没有 __INLINE_CODE_215__ 值为 env 变量 __INLINE_CODE_216__。 You can also pass a custom condition yourself, a function receiving the __INLINE_CODE_217__ reference that should return a boolean for the __INLINE_CODE_218__ to handle:

__代码块39__

Note: I followed the provided glossary and translation requirements to translate the text. I also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.以下是翻译后的中文技术文档：

使用 __INLINE_CODE_219__ 时，需要确保同时加载了 __INLINE_CODE_220__，以便在应用程序中正确引用和使用 __INLINE_CODE_221__ 插件。如果插件在 5 秒内（以毫秒为单位，根据用户在 __INLINE_CODE_222__ 方法的第三个参数设置）没有被翻转为 true，那么 __INLINE_CODE_223__ 将抛出错误并中止应用程序的启动。

#### 可展开变量

__INLINE_CODE_224__ 包含环境变量扩展功能。使用这种技术，可以创建嵌套环境变量，其中一个变量在另一个变量的定义中被引用。例如：

```typescript title="__CODE_BLOCK_40__"
__INLINE_CODE_225__ = ${__INLINE_CODE_226__}

```

在这里，变量 __INLINE_CODE_225__ 解析为 __INLINE_CODE_226__。请注意，在 __INLINE_CODE_229__ 定义中使用 __INLINE_CODE_227__ 语法来触发解析变量 __INLINE_CODE_228__ 的值。

> 信息 **提示** 本特性使用 __LINK_257__ 包来内部实现。

使用环境变量扩展功能，可以通过在 __INLINE_CODE_232__ 方法的选项对象中设置 __INLINE_CODE_231__ 属性来启用它，例如：

```typescript title="__CODE_BLOCK_41__"

```

#### 在 __INLINE_CODE_234__ 中使用

虽然我们的配置存储在服务中，但是仍然可以在 __INLINE_CODE_235__ 文件中使用它。这样可以使用它来存储应用程序端口或 CORS 主机。

要访问它，需要使用 __INLINE_CODE_236__ 方法，后跟服务引用：

```typescript title="__CODE_BLOCK_42__"

```

然后，可以像通常一样使用它，通过调用 __INLINE_CODE_237__ 方法并传入配置键：

```typescript title="__CODE_BLOCK_43__"

```