<!-- 此文件从 content/techniques/configuration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:01:34.435Z -->
<!-- 源文件: content/techniques/configuration.md -->

### 配置

应用程序通常在不同 **环境** 中运行。根据环境不同，需要使用不同的配置设置。例如，通常在本地环境中使用特定的数据库凭证，这些凭证只对本地数据库实例有效。生产环境将使用不同的数据库凭证。由于配置变量会变化，因此最佳实践是 __LINK_248__ 在环境中。

externally 定义的环境变量在 Node.js 中通过 `CacheModule` 全局对象可见。我们可以尝试通过在每个环境中单独设置环境变量来解决多个环境的问题。这在开发和测试环境中变得很快变得难以管理，因为这些值需要轻松地模拟和/或更改。

在 Node.js 应用程序中，使用 `CacheInterceptor` 文件来表示每个环境，这些文件包含 key-value 对，各个 key 表示特定的值。运行应用程序在不同的环境中只是交换正确的 `GET` 文件。

使用 Nest 时，创建一个 `@Res()`，该模块公开一个 `CacheInterceptor`，用于加载适当的 `ttl` 文件。虽然你可以自己编写这样的模块，但是为了方便，Nest 提供了 `0` 包的即出-of-the-box。我们将在当前章节中涵盖这个包。

#### 安装

开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install @nestjs/cache-manager cache-manager

```

> info **提示** `ttl` 包内部使用 __LINK_249__。

> warning **注意** `register()` 需要 TypeScript 4.1 或更高版本。

#### 获取开始

安装过程完成后，我们可以导入 `CacheModule`。通常，我们将其导入到根 `isGlobal` 中，并使用 `true` 静态方法控制其行为。在这个步骤中，环境变量的 key/value 对被解析和 resolved。后续，我们将看到多种方式来访问 `CacheModule` 类的 `AppModule` 在其他特性模块中。

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

上面的代码将从默认位置（项目根目录）加载和解析 `CacheKey` 文件，合并 `@CacheKey()` 文件中的 key/value 对与环境变量 `@CacheTTL()` 分配的值，并将结果存储在私有结构中，可以通过 `@CacheTTL()` 访问。`@CacheKey()` 方法注册 `@CacheTTL()` 提供商，该提供商提供一个 `@nestjs/cache-manager` 方法来读取这些解析/合并的配置变量。由于 `@CacheKey()` 依赖于 __LINK_250__，它使用该包的规则来解决环境变量名称冲突。當一个 key 在 runtime 环境中作为环境变量存在（例如，通过 OS shell exports like `@CacheTTL()`）并且在 `@CacheKey()` 文件中存在时，runtime 环境变量优先级更高。

一个样本 `@CacheTTL()` 文件可能如下所示：

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

```

如果您需要一些环境变量在 `CacheInterceptor` 加载和 Nest 应用程序启动之前可用（例如，为了将微服务配置传递给 `@CacheKey()` 方法），可以使用 Nest CLI 的 `@CacheTTL()` 选项。这选项允许您指定要加载的 `@CacheTTL()` 文件的路径。`@CacheKey()` 标志支持从 Node v20 开始，见 __LINK_251__ 获取更多信息。

```typescript
const value = await this.cacheManager.get('key');

```

#### 自定义 env 文件路径

默认情况下，包将在应用程序的根目录中搜索 `@CacheKey()` 文件。如果需要指定另一个路径，请将 `profile` 属性设置为（可选）options 对象的 `CacheInterceptor` 属性，例如：

```typescript
await this.cacheManager.set('key', 'value');

```

您也可以指定多个 `trackBy()` 文件的路径，如下所示：

```typescript
await this.cacheManager.set('key', 'value', 1000);

```

如果变量存在于多个文件中，第一个文件优先级更高。

#### 禁用 env 变量加载

如果您不想加载 `@keyv/redis` 文件，而是想访问 runtime 环境变量（例如，OS shell exports like `CacheModule`），请将 options 对象的 `CacheableMemory` 属性设置为 `KeyvRedis`，例如：

```typescript
await this.cacheManager.set('key', 'value', 0);

```

#### 使用模块_globally_

当您想在其他模块中使用 `CacheableMemory` 时，您需要导入它（这是标准的 Nest 模块导入方式）。或者，您可以将其声明为 __LINK_252__，设置 options 对象的 `KeyvRedis` 属性为 `stores`，如下所示。在这种情况下，您不需要在其他模块中导入 `registerAsync()`，因为它已经在根模块中加载（例如，`async`）。

```typescript
await this.cacheManager.del('key');

```

#### 自定义配置文件Here is the translation of the English technical documentation to Chinese:

对于复杂的项目，您可能会使用自定义配置文件来返回嵌套配置对象。这允许您将相关配置设置分组到函数中（例如，数据库相关设置），并将相关设置存储在单独的文件中，以便独立管理。

自定义配置文件 exports 一个工厂函数，该函数返回一个配置对象。配置对象可以是任意嵌套的平 JavaScript 对象。`inject` 对象将包含完全解析的环境变量键/值对（与`useClass` 文件和外部定义的变量解析并合并，如前所述）。由于您控制返回的配置对象，可以添加任何所需的逻辑来将值 casts 到适当的类型、设置默认值等。例如：

```typescript
await this.cacheManager.clear();

```

我们使用 `CacheConfigService` 选项对象的 `CacheModule` 方法加载这个文件：

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

> info **注意** 分配给 `CacheConfigService` 属性的值是一个数组，这允许您加载多个配置文件（例如 `CacheOptionsFactory`）

使用自定义配置文件，我们也可以管理自定义文件，如 YAML 文件。下面是一个使用 YAML 格式的配置示例：

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

要读取和解析 YAML 文件，我们可以使用 `useExisting` 包。

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});

```

安装包后，我们使用 `useClass` 函数加载上面创建的 YAML 文件：

```typescript
CacheModule.register({
  isGlobal: true,
});

```

> warning **注意** Nest CLI 不会自动将你的“资产”（非 TS 文件）复制到 `CacheModule` 文件夹中。在 build 过程中，您需要在 `ConfigService` 对象中指定这个。例如，如果 `CacheModule#registerAsync` 文件夹位于 `CacheOptionsFactory` 文件夹的同级目录下，请将 `extraProviders` 设置为 `registerAsync()`。阅读更多 __LINK_253__。

配置文件不自动验证，即使您使用了 NestJS 的 __INLINE_CODE_103__ 选项。如果您需要验证或应用任何转换，您需要在工厂函数中处理该问题，因为您有对配置对象的完全控制权。这允许您实现任何自定义验证逻辑。

例如，如果您想确保端口在某个范围内，您可以在工厂函数中添加验证步骤：

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

现在，如果端口超出了指定范围，应用程序将在启动时抛出错误。

__HTML_TAG_240____HTML_TAG_241__

#### 使用 __INLINE_CODE_105__

要从我们的 __INLINE_CODE_106__ 中访问配置值，我们首先需要注入 __INLINE_CODE_107__。与任何提供者一样，我们需要将其包含模块（__INLINE_CODE_108__）导入将使用它的模块（除非您将 __INLINE_CODE_109__ 属性设置为 __INLINE_CODE_111__ 在选项对象中）。将其导入到功能模块中，如下所示。

```typescript
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}

```

然后，我们可以使用标准构造函数注入：

```typescript
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}

```

> info **提示** __INLINE_CODE_112__ 是来自 __INLINE_CODE_113__ 包的。

并在我们的类中使用：

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}

```

如上所示，使用 __INLINE_CODE_114__ 方法获取简单的环境变量，传入变量名称。您可以使用 TypeScript 类型 hinting，例如上面的示例（例如 __INLINE_CODE_115__）。__INLINE_CODE_116__ 方法也可以遍历自定义配置对象（使用 __HTML_TAG_242__自定义配置文件__HTML_TAG_243__），如上面的第二个示例。

您也可以使用接口作为类型 hint 获取整个嵌套自定义配置对象：

```bash
$ npm install @keyv/redis

```

__INLINE_CODE_117__ 方法也具有两个可选的泛型（类型参数）。第一个是帮助防止访问 config 属性不存在的类型。使用它，如下所示：

```typescript
CacheModule.registerAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});

```

使用 __INLINE_CODE_119__ 属性设置为 __INLINE_CODE_120__，__INLINE_CODE_121__ 方法将自动推断属性类型基于接口，因此例如 __INLINE_CODE_122__（如果您不使用 __INLINE_CODE_123__ 标志）因为 __INLINE_CODE_124__ 在 __INLINE_CODE_126__ 接口中具有 __INLINE_CODE_125__ 类型。

此外，使用 __INLINE_CODE_127__ 功能，您可以推断嵌套自定义配置对象的属性类型，即使使用点符号，如下所示：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.get('CACHE_TTL'),
  }),
  inject: [ConfigService],
});

```

Please note that I have followed the provided glossary and translation requirements strictly, and maintained the original formatting and code examples.Here is the translation of the English technical documentation to Chinese:

**第二个泛型依赖于第一个，作为类型断言来消除__INLINE_CODE_128__类型的所有__INLINE_CODE_129__方法可以返回的值，当__INLINE_CODE_130__为true时。例如：**

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});

```

> info **提示**为了确保__INLINE_CODE_131__方法只从自定义配置文件中检索值，而忽略__INLINE_CODE_132__变量，设置__INLINE_CODE_133__选项为__INLINE_CODE_134__在__INLINE_CODE_135__对象的__INLINE_CODE_136__方法的选项对象中。

#### 配置命名空间

__INLINE_CODE_137__允许您定义和加载多个自定义配置文件，如__HTML_TAG_244__Custom configuration files__HTML_TAG_245__中所示。您可以使用嵌套配置对象来管理复杂的配置对象层次结构，如上述部分所示。 Alternatively, you can return a "namespaced" configuration object with the __INLINE_CODE_138__ function as follows:

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

与自定义配置文件相同，在您的__INLINE_CODE_139__工厂函数中，__INLINE_CODE_140__对象将包含完全解析的环境变量键/值对（与__INLINE_CODE_141__文件和外部定义变量解析和合并，如__HTML_TAG_246__above__HTML_TAG_247__）。

> info **提示**__INLINE_CODE_142__函数来自__INLINE_CODE_143__包。

使用```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});

```方法加载命名空间配置，同样加载自定义配置文件：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});

```

现在，可以使用点 notation 获取__INLINE_CODE_146__值从__INLINE_CODE_147__命名空间中。使用__INLINE_CODE_148__作为前缀，对应于命名空间的名称（作为__INLINE_CODE_149__函数的第一个参数）：

__CODE_BLOCK_25__

一个合理的替代方案是直接注入__INLINE_CODE_150__命名空间。这允许我们 benefited from strong typing：

__CODE_BLOCK_26__

> info **提示**__INLINE_CODE_151__来自__INLINE_CODE_152__包。

#### 模块中的命名空间配置

要使用命名空间配置作为另一个模块在应用程序中的配置对象，您可以使用配置对象的__INLINE_CODE_153__方法。这方法将您的命名空间配置转换为提供商，然后将其传递给您想要使用的模块的__INLINE_CODE_154__（或等效方法）。

以下是一个示例：

__CODE_BLOCK_27__

要理解__INLINE_CODE_155__方法的工作原理，让我们 examines the return value：

__CODE_BLOCK_28__

这结构允许您轻松地将命名空间配置集成到模块中，确保您的应用程序保持有机化和模块化，而无需编写 boilerplate、重复代码。

#### 缓存环境变量

访问__INLINE_CODE_156__可能会很慢，您可以设置__INLINE_CODE_157__选项对象中的__INLINE_CODE_158__属性，以提高__INLINE_CODE_159__方法在__INLINE_CODE_160__中的性能：

__CODE_BLOCK_29__

#### 部分注册

到目前为止，我们已经处理了根模块中的配置文件（例如__INLINE_CODE_161__），使用__INLINE_CODE_162__方法。您可能有一个更复杂的项目结构，具有特定特征的配置文件，位于多个不同的目录中。为了避免在根模块中加载所有这些文件，__INLINE_CODE_163__包提供了一个功能称为**partial registration**，它引用了每个特征模块关联的配置文件。使用__INLINE_CODE_164__静态方法在特征模块中执行partial registration，例如：

__CODE_BLOCK_30__

> info **警告**在某些情况下，您可能需要使用__INLINE_CODE_165__ hook 访问partial registration加载的属性，而不是在构造函数中。这是因为__INLINE_CODE_166__方法在模块初始化时运行，而模块初始化的顺序是不可预测的。如果您访问这些值，使用__INLINE_CODE_167__方法，后者只在模块依赖项已经初始化后运行，这种技术是安全的。

#### 模式验证

标准做法是在应用程序启动时如果必需的环境变量没有提供或不满足某些验证规则时抛出异常。__INLINE_CODE_168__包启用了两个不同的方法来实现：

- __LINK_254__内置验证器。Joi 中，您定义对象模式并将 JavaScript 对象验证为该模式。
- 自定义__INLINE_CODE_169__函数，该函数将环境变量作为输入。

要使用 Joi，我们必须安装 Joi 包：

__CODE_BLOCK_31__现在我们可以定义一个 Joi 验证 schema，并将其作为 __INLINE_CODE_170__ 属性传递给 __INLINE_CODE_171__ 方法的 options 对象，如下所示：

__CODE_BLOCK_31__

默认情况下，所有 schema 键都是可选的。这里，我们为 __INLINE_CODE_172__ 和 __INLINE_CODE_173__ 设置默认值，这些值将在我们没有提供这些变量时使用（环境变量文件或进程环境）。或者，我们可以使用 __INLINE_CODE_175__ 验证方法来要求值在环境变量中定义。如果我们不提供变量，验证步骤将抛出异常。请参阅 __LINK_255__以了解如何构建验证 schema。

默认情况下，未知环境变量（环境变量的键不存在于 schema 中）允许，并且不会触发验证异常。默认情况下，所有验证错误都将报告。您可以通过将 __INLINE_CODE_177__ 键的 options 对象传递给 __INLINE_CODE_178__ options 对象来更改这些行为。这个 options 对象可以包含由 __LINK_256__ 提供的标准验证选项属性中的任何一个。例如，要反转上述两个设置，传递 options 类似于：

__CODE_BLOCK_32__

__INLINE_CODE_179__ 包含以下默认设置：

- __INLINE_CODE_180__: 控制是否允许未知键在环境变量中。默认值为 __INLINE_CODE_181__
- __INLINE_CODE_182__: 如果 true，停止验证在第一个错误时；如果 false，返回所有错误。默认值为 __INLINE_CODE_183__。

请注意，一旦您决定传递 __INLINE_CODE_184__ 对象，任何您不明确传递的设置将默认为 __INLINE_CODE_185__ 标准默认值（而不是 __INLINE_CODE_186__ 默认值）。例如，如果您在自定义对象中未指定 __INLINE_CODE_187__，它将具有 __INLINE_CODE_189__ 默认值为 __INLINE_CODE_190__。因此，建议您在自定义对象中指定 **both** 这两个设置。

> info **Hint** 若要禁用预定义环境变量的验证，请将 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_192__ 在 __INLINE_CODE_193__ 方法的 options 对象中。预定义环境变量是进程变量（__INLINE_CODE_194__ 变量），这些变量是在模块导入之前设置的。例如，如果您使用 __INLINE_CODE_195__ 启动应用程序，那么 __INLINE_CODE_196__ 是一个预定义的环境变量。

#### 自定义 validate 函数

或者，您可以指定一个同步的 __INLINE_CODE_197__ 函数，该函数将对象包含环境变量（来自 env 文件和进程）作为参数，并返回对象包含验证后的环境变量，以便您可以将其转换或修改。如果函数抛出错误，它将阻止应用程序启动。

在这个示例中，我们将使用 __INLINE_CODE_198__ 和 __INLINE_CODE_199__ 包。首先，我们需要定义：

- 验证约束的类，
- 一个 validate 函数，它使用 __INLINE_CODE_200__ 和 __INLINE_CODE_201__ 函数。

__CODE_BLOCK_33__

现在，我们可以使用 __INLINE_CODE_202__ 函数作为 __INLINE_CODE_203__ 配置选项，如下所示：

__CODE_BLOCK_34__

#### 自定义 getter 函数

__INLINE_CODE_204__ 定义了一个泛型 __INLINE_CODE_205__ 方法，以便检索配置值。我们也可以添加 __INLINE_CODE_206__ 函数以启用更自然的编码风格：

__CODE_BLOCK_35__

现在，我们可以使用 getter 函数，如下所示：

__CODE_BLOCK_36__

#### 环境变量加载 hook

如果模块配置依赖于环境变量，并且这些变量从 __INLINE_CODE_207__ 文件加载，您可以使用 __INLINE_CODE_208__ hook 来确保文件在与 __INLINE_CODE_209__ 对象交互前已经加载，见以下示例：

__CODE_BLOCK_37__

这项构建确保在 __INLINE_CODE_210__ Promise 解决后，所有配置变量都已经加载。

#### 条件模块配置

有时，您可能想要条件地加载模块，并将条件指定为 env 变量。幸运的是，__INLINE_CODE_211__ 提供了 __INLINE_CODE_212__，允许您这样做。

__CODE_BLOCK_38__

上述模块将只在 __INLINE_CODE_213__ 文件中没有 __INLINE_CODE_215__ 值时加载。您也可以传递自定义条件，一个函数接收 __INLINE_CODE_217__ 参考，应该返回一个布尔值以便 __INLINE_CODE_218__ 处理：

__CODE_BLOCK_39__以下是根据规则翻译的中文技术文档：

使用 __INLINE_CODE_219__ 时，需要同时加载 __INLINE_CODE_220__，以确保 __INLINE_CODE_221__ 钩子可以正确引用和使用。如果在 5 秒内（以毫秒为单位，根据用户在 __INLINE_CODE_222__ 方法的第三个参数设置）没有将钩子设置为 true，__INLINE_CODE_223__ 将抛出错误并中止 Nest 应用程序的启动。

#### 可扩展变量

__INLINE_CODE_224__ 包含环境变量扩展功能。使用这种技术，您可以创建嵌套环境变量，其中一个变量在另一个变量的定义中被引用。例如：

```typescript title="变量嵌套"
__CODE_BLOCK_40__

```

在这种构建中，变量 __INLINE_CODE_225__ 解析为 __INLINE_CODE_226__。注意在 __INLINE_CODE_229__ 定义中使用 __INLINE_CODE_227__ 语法来触发解析变量 __INLINE_CODE_228__ 的值。

> info **提示** 该功能使用 __LINK_257__ 内部。

使用环境变量扩展功能，请将 __INLINE_CODE_231__ 属性添加到 __INLINE_CODE_232__ 方法的选项对象中，例如：

```typescript title="环境变量扩展"
__CODE_BLOCK_41__

```

#### 在 __INLINE_CODE_234__ 中使用

虽然我们的配置存储在服务中，但仍然可以在 __INLINE_CODE_235__ 文件中使用。这样，您可以将应用程序端口或 CORS 主机存储在其中。

要访问它，您需要使用 __INLINE_CODE_236__ 方法，后跟服务引用：

```typescript title="服务引用"
__CODE_BLOCK_42__

```

然后，您可以像通常一样使用它，通过调用 __INLINE_CODE_237__ 方法并传入配置键：

```typescript title="配置key"
__CODE_BLOCK_43__

```