<!-- 此文件从 content/techniques\configuration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T07:09:52.775Z -->
<!-- 源文件: content/techniques\configuration.md -->

### 配置

应用程序通常在不同的**环境**中运行。根据环境的不同，应该使用不同的配置设置。例如，本地环境通常依赖于特定的数据库凭证，这些凭证仅对本地数据库实例有效。生产环境则会使用一组单独的数据库凭证。由于配置变量会变化，最佳实践是将配置变量[存储在环境中](https://12factor.net/config)。

外部定义的环境变量通过 `process.env` 全局对象在 Node.js 内部可见。我们可以尝试通过在每个环境中单独设置环境变量来解决多环境问题。但这很快就会变得难以管理，尤其是在开发和测试环境中，这些值需要易于模拟和/或更改。

在 Node.js 应用程序中，通常使用 `.env` 文件来表示每个环境，这些文件包含键值对，其中每个键代表一个特定的值。在不同环境中运行应用程序只需交换正确的 `.env` 文件即可。

在 Nest 中使用此技术的一个好方法是创建一个 `ConfigModule`，它公开一个 `ConfigService`，用于加载适当的 `.env` 文件。虽然您可以选择自己编写这样的模块，但为了方便起见，Nest 提供了 `@nestjs/config` 包。我们将在本章中介绍这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖。

```bash
$ npm i --save @nestjs/config

```

> info **提示** `@nestjs/config` 包内部使用 [dotenv](https://github.com/motdotla/dotenv)。

> warning **注意** `@nestjs/config` 需要 TypeScript 4.1 或更高版本。

#### 入门

安装过程完成后，我们可以导入 `ConfigModule`。通常，我们会将其导入到根 `AppModule` 中，并使用 `.forRoot()` 静态方法控制其行为。在此步骤中，环境变量键/值对被解析和解析。稍后，我们将看到在其他功能模块中访问 `ConfigModule` 的 `ConfigService` 类的几种选项。

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}

```

上面的代码将从默认位置（项目根目录）加载和解析 `.env` 文件，将 `.env` 文件中的键/值对与分配给 `process.env` 的环境变量合并，并将结果存储在一个私有结构中，您可以通过 `ConfigService` 访问该结构。`forRoot()` 方法注册 `ConfigService` 提供者，该提供者提供一个 `get()` 方法用于读取这些解析/合并的配置变量。由于 `@nestjs/config` 依赖于 [dotenv](https://github.com/motdotla/dotenv)，它使用该包的规则来解决环境变量名称的冲突。当一个键同时存在于运行时环境作为环境变量（例如，通过 OS shell 导出，如 `export DATABASE_USER=test`）和 `.env` 文件中时，运行时环境变量优先。

一个示例 `.env` 文件如下所示：

```json
DATABASE_USER=test
DATABASE_PASSWORD=test

```

如果您需要一些环境变量在 `ConfigModule` 加载和 Nest 应用程序引导之前就可用（例如，将微服务配置传递给 `NestFactory#createMicroservice` 方法），您可以使用 Nest CLI 的 `--env-file` 选项。此选项允许您指定应在应用程序启动之前加载的 `.env` 文件的路径。`--env-file` 标志支持在 Node v20 中引入，有关更多详细信息，请参阅 [文档](https://nodejs.org/dist/v20.18.1/docs/api/cli.html#--env-fileconfig)。

```bash
$ nest start --env-file .env

```

#### 自定义 env 文件路径

默认情况下，该包在应用程序的根目录中查找 `.env` 文件。要为 `.env` 文件指定另一个路径，请设置传递给 `forRoot()` 的（可选）选项对象的 `envFilePath` 属性，如下所示：

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});

```

您还可以像这样指定多个 `.env` 文件路径：

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});

```

如果在多个文件中找到变量，第一个文件优先。

#### 禁用环境变量加载

如果您不想加载 `.env` 文件，而是只想访问运行时环境中的环境变量（如通过 OS shell 导出，如 `export DATABASE_USER=test`），请将选项对象的 `ignoreEnvFile` 属性设置为 `true`，如下所示：

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true,
});

```

#### 全局使用模块

当您想在其他模块中使用 `ConfigModule` 时，您需要导入它（与任何 Nest 模块一样）。或者，通过将选项对象的 `isGlobal` 属性设置为 `true`，将其声明为[全局模块](/modules#全局模块)，如下所示。在这种情况下，一旦它在根模块（例如 `AppModule`）中加载，您就不需要在其他模块中导入 `ConfigModule`。

```typescript
ConfigModule.forRoot({
  isGlobal: true,
});

```

#### 自定义配置文件

对于更复杂的项目，您可以使用自定义配置文件来返回嵌套的配置对象。这允许您按功能（例如，数据库相关设置）对相关配置设置进行分组，并将相关设置存储在单独的文件中，以帮助独立管理它们。

自定义配置文件导出一个工厂函数，该函数返回一个配置对象。配置对象可以是任何任意嵌套的纯 JavaScript 对象。`process.env` 对象将包含完全解析的环境变量键/值对（如 <a href="techniques/configuration#入门">上面</a> 所述，`.env` 文件和外部定义的变量已解析和合并）。由于您控制返回的配置对象，您可以添加任何必要的逻辑来将值转换为适当的类型，设置默认值等。例如：

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  }
});

```

我们使用传递给 `ConfigModule.forRoot()` 方法的选项对象的 `load` 属性加载此文件：

```typescript
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
})
export class AppModule {}

```

> info **注意** 分配给 `load` 属性的值是一个数组，允许您加载多个配置文件（例如 `load: [databaseConfig, authConfig]`）

使用自定义配置文件，我们还可以管理自定义文件，如 YAML 文件。以下是使用 YAML 格式的配置示例：

```yaml
http:
  host: 'localhost'
  port: 8080

db:
  postgres:
    url: 'localhost'
    port: 5432
    database: 'yaml-db'

  sqlite:
    database: 'sqlite.db'

```

要读取和解析 YAML 文件，我们可以利用 `js-yaml` 包。

```bash
$ npm i js-yaml
$ npm i -D @types/js-yaml

```

安装包后，我们使用 `yaml#load` 函数加载上面创建的 YAML 文件。

```typescript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  return yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};

```

> warning **注意** Nest CLI 不会在构建过程中自动将您的"资产"（非 TS 文件）移动到 `dist` 文件夹。为确保您的 YAML 文件被复制，您必须在 `nest-cli.json` 文件的 `compilerOptions#资源` 对象中指定这一点。例如，如果 `config` 文件夹与 `src` 文件夹处于同一级别，请添加 `compilerOptions#资源`，值为 `"assets": [{{ '{' }}"include": "../config/*.yaml", "outDir": "./dist/config"{{ '}' }}]`。在此处阅读更多 [内容](/cli/workspaces#资源)。

快速说明 - 即使您在 NestJS 的 `ConfigModule` 中使用 `validationSchema` 选项，配置文件也不会自动验证。如果您需要验证或想要应用任何转换，您必须在工厂函数中处理，在那里您可以完全控制配置对象。这允许您根据需要实现任何自定义验证逻辑。

例如，如果您想确保端口在特定范围内，您可以向工厂函数添加验证步骤：

```typescript
export default () => {
  const config = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  if (config.http.port < 1024 || config.http.port > 49151) {
    throw new Error('HTTP port must be between 1024 and 49151');
  }

  return config;
};

```

现在，如果端口超出指定范围，应用程序将在启动期间抛出错误。

<app-banner-devtools></app-banner-devtools>

#### 使用 `ConfigService`

要从我们的 `ConfigService` 访问配置值，我们首先需要注入 `ConfigService`。与任何提供者一样，我们需要将其包含模块 - `ConfigModule` - 导入到将使用它的模块中（除非您在传递给 `ConfigModule.forRoot()` 方法的选项对象中将 `isGlobal` 属性设置为 `true`）。如下所示将其导入到功能模块中。

```typescript
@Module({
  imports: [ConfigModule],
  // ...
})

```

然后我们可以使用标准构造函数注入来注入它：

```typescript
constructor(private configService: ConfigService) {}

```

> info **提示** `ConfigService` 从 `@nestjs/config` 包导入。

并在我们的类中使用它：

```typescript
// 获取环境变量
const dbUser = this.configService.get<string>('DATABASE_USER');

// 获取自定义配置值
const dbHost = this.configService.get<string>('database.host');

```

如上所示，使用 `configService.get()` 方法通过传递变量名来获取简单的环境变量。您可以通过传递类型来进行 TypeScript 类型提示，如上所示（例如 `get<string>(...)`）。`get()` 方法还可以遍历嵌套的自定义配置对象（通过 <a href="techniques/configuration#自定义配置文件">自定义配置文件</a> 创建），如上面的第二个示例所示。

您还可以使用接口作为类型提示来获取整个嵌套的自定义配置对象：

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
}

const dbConfig = this.configService.get<DatabaseConfig>('database');

// 现在您可以使用 `dbConfig.port` 和 `dbConfig.host`
const port = dbConfig.port;

```

`get()` 方法还接受一个可选的第二个参数，定义默认值，当键不存在时将返回该值，如下所示：

```typescript
// 当 "database.host" 未定义时使用 "localhost"
const dbHost = this.configService.get<string>('database.host', 'localhost');

```

`ConfigService` 有两个可选的泛型（类型参数）。第一个是帮助防止访问不存在的配置属性。如下所示使用它：

```typescript
interface EnvironmentVariables {
  PORT: number;
  TIMEOUT: string;
}

// 在代码的某个地方
constructor(private configService: ConfigService<EnvironmentVariables>) {
  const port = this.configService.get('PORT', { infer: true });

  // TypeScript 错误：这是无效的，因为 URL 属性未在 EnvironmentVariables 中定义
  const url = this.configService.get('URL', { infer: true });
}

```

通过将 `infer` 属性设置为 `true`，`ConfigService#get` 方法将根据接口自动推断属性类型，例如，`typeof port === "number"`（如果您没有使用 TypeScript 的 `strictNullChecks` 标志），因为 `PORT` 在 `EnvironmentVariables` 接口中具有 `number` 类型。

此外，通过 `infer` 功能，您可以推断嵌套自定义配置对象属性的类型，即使使用点表示法，如下所示：

```typescript
constructor(private configService: ConfigService<{ database: { host: string } }>) {
  const dbHost = this.configService.get('database.host', { infer: true })!;
  // typeof dbHost === "string"                                          |
  //                                                                     +--> 非空断言运算符
}

```

第二个泛型依赖于第一个，作为类型断言以摆脱 `ConfigService` 方法在 `strictNullChecks` 开启时可能返回的所有 `undefined` 类型。例如：

```typescript
// ...
constructor(private configService: ConfigService<{ PORT: number }, true>) {
  //                                                               ^^^^
  const port = this.configService.get('PORT', { infer: true });
  //    ^^^ port 的类型将是 'number'，因此您不再需要 TS 类型断言
}

```

> info **提示** 要确保 `ConfigService#get` 方法仅从自定义配置文件中检索值并忽略 `process.env` 变量，请在 `ConfigModule` 的 `forRoot()` 方法的选项对象中设置 `skipProcessEnv` 选项为 `true`。

#### 配置命名空间

`ConfigModule` 允许您定义和加载多个自定义配置文件，如 <a href="techniques/configuration#自定义配置文件">上面的自定义配置文件</a> 所示。您可以使用该部分中显示的嵌套配置对象来管理复杂的配置对象层次结构。或者，您可以使用 `registerAs()` 函数返回一个"命名空间"配置对象，如下所示：

```typescript
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 5432
}));

```

与自定义配置文件一样，在 `registerAs()` 工厂函数内部，`process.env` 对象将包含完全解析的环境变量键/值对（如 <a href="techniques/configuration#入门">上面</a> 所述，`.env` 文件和外部定义的变量已解析和合并）。

> info **提示** `registerAs` 函数从 `@nestjs/config` 包导出。

使用 `forRoot()` 方法的选项对象的 `load` 属性加载命名空间配置，就像加载自定义配置文件一样：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
})
export class AppModule {}

```

现在，要从 `database` 命名空间获取 `host` 值，请使用点表示法。使用 `'database'` 作为属性名称的前缀，对应于命名空间的名称（作为 `registerAs()` 函数的第一个参数传递）：

```typescript
const dbHost = this.configService.get<string>('database.host');

```

一个合理的替代方案是直接注入 `database` 命名空间。这使我们能够受益于强类型：

```typescript
constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {}

```

> info **提示** `ConfigType` 从 `@nestjs/config` 包导出。

#### 模块中的命名空间配置

要将命名空间配置用作应用程序中另一个模块的配置对象，您可以利用配置对象的 `.asProvider()` 方法。此方法将您的命名空间配置转换为提供者，然后可以传递给您要使用的模块的 `forRootAsync()`（或任何等效方法）。

这是一个例子：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
})

```

要了解 `.asProvider()` 方法的工作原理，让我们检查返回值：

```typescript
// .asProvider() 方法的返回值
{
  imports: [ConfigModule.forFeature(databaseConfig)],
  useFactory: (configuration: ConfigType<typeof databaseConfig>) => configuration,
  inject: [databaseConfig.KEY]
}

```

这种结构允许您将命名空间配置无缝集成到模块中，确保您的应用程序保持组织性和模块化，而无需编写样板、重复代码。

#### 缓存环境变量

由于访问 `process.env` 可能很慢，您可以设置传递给 `ConfigModule.forRoot()` 的选项对象的 `cache` 属性，以提高 `ConfigService#get` 方法在处理存储在 `process.env` 中的变量时的性能。

```typescript
ConfigModule.forRoot({
  cache: true,
});

```

#### 部分注册

到目前为止，我们已经在根模块（例如 `AppModule`）中使用 `forRoot()` 方法处理配置文件。也许您有更复杂的项目结构，具有特定于功能的配置文件位于多个不同的目录中。`@nestjs/config` 包提供了一种称为**部分注册**的功能，而不是在根模块中加载所有这些文件，它仅引用与每个功能模块关联的配置文件。在功能模块中使用 `forFeature()` 静态方法执行此部分注册，如下所示：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}

```

> info **警告** 在某些情况下，您可能需要使用 `onModuleInit()` 钩子而不是在构造函数中访问通过部分注册加载的属性。这是因为 `forFeature()` 方法在模块初始化期间运行，而模块初始化的顺序是不确定的。如果您在构造函数中访问另一个模块以这种方式加载的值，该配置所依赖的模块可能尚未初始化。`onModuleInit()` 方法仅在其依赖的所有模块初始化后运行，因此此技术是安全的。

#### 模式验证

在应用程序启动期间，如果未提供所需的环境变量或它们不满足某些验证规则，则抛出异常是标准做法。`@nestjs/config` 包启用两种不同的方法来执行此操作：

- [Joi](https://github.com/sideway/joi) 内置验证器。使用 Joi，您可以定义对象模式并根据它验证 JavaScript 对象。
- 一个自定义 `validate()` 函数，它接受环境变量作为输入。

要使用 Joi，我们必须安装 Joi 包：

```bash
$ npm install --save joi

```

现在我们可以定义一个 Joi 验证模式，并通过 `forRoot()` 方法的选项对象的 `validationSchema` 属性传递它，如下所示：

```typescript
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
  ],
})
export class AppModule {}

```

默认情况下，所有模式键都被视为可选。在这里，我们为 `NODE_ENV` 和 `PORT` 设置默认值，如果我们没有在环境（`.env` 文件或进程环境）中提供这些变量，将使用这些值。或者，我们可以使用 `required()` 验证方法来要求必须在环境（`.env` 文件或进程环境）中定义值。在这种情况下，如果我们没有在环境中提供变量，验证步骤将抛出异常。有关如何构建验证模式的更多信息，请参阅 [Joi 验证方法](https://joi.dev/api/?v=17.3.0#示例)。

默认情况下，未知的环境变量（其键不存在于模式中的环境变量）是允许的，不会触发验证异常。默认情况下，所有验证错误都会被报告。您可以通过 `forRoot()` 选项对象的 `validationOptions` 键传递选项对象来改变这些行为。此选项对象可以包含 [Joi 验证选项](https://joi.dev/api/?v=17.3.0#anyvalidatevalue-options) 提供的任何标准验证选项属性。例如，要反转上述两个设置，请传递如下选项：

```typescript
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}

```

`@nestjs/config` 包使用默认设置：

- `allowUnknown`：控制是否允许环境变量中的未知键。默认为 `true`
- `abortEarly`：如果为 true，则在第一个错误时停止验证；如果为 false，则返回所有错误。默认为 `false`。

请注意，一旦您决定传递 `validationOptions` 对象，任何您未明确传递的设置都将默认为 `Joi` 标准默认值（不是 `@nestjs/config` 默认值）。例如，如果您在自定义 `validationOptions` 对象中未指定 `allowUnknowns`，它将具有 `Joi` 默认值 `false`。因此，在自定义对象中指定**两个**设置可能是最安全的。

> info **提示** 要禁用预定义环境变量的验证，请在 `forRoot()` 方法的选项对象中设置 `validatePredefined` 属性为 `false`。预定义环境变量是在导入模块之前设置的进程变量（`process.env` 变量）。例如，如果您以 `PORT=3000 node main.js` 启动应用程序，那么 `PORT` 就是预定义环境变量。

#### 自定义验证函数

或者，您可以指定一个**同步** `validate` 函数，该函数接受一个包含环境变量（来自 env 文件和进程）的对象，并返回一个包含已验证环境变量的对象，以便您可以在需要时转换/修改它们。如果函数抛出错误，它将阻止应用程序引导。

在此示例中，我们将使用 `class-transformer` 和 `class-validator` 包。首先，我们必须定义：

- 一个带有验证约束的类，
- 一个使用 `plainToInstance` 和 `validateSync` 函数的验证函数。

```typescript
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

```

有了这个，使用 `validate` 函数作为 `ConfigModule` 的配置选项，如下所示：

```typescript
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
  ],
})
export class AppModule {}

```

#### 自定义 getter 函数

`ConfigService` 定义了一个通用的 `get()` 方法，用于通过键检索配置值。我们还可以添加 `getter` 函数来启用更自然的编码风格：

```typescript
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}

  get isAuthEnabled() {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}

```

现在我们可以如下使用 getter 函数：

```typescript
@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      // 认证已启用
    }
  }
}

```

#### 环境变量加载钩子

如果模块配置依赖于环境变量，并且这些变量从 `.env` 文件加载，您可以使用 `ConfigModule.envVariablesLoaded` 钩子来确保在与 `process.env` 对象交互之前文件已加载，参见以下示例：

```typescript
export async function getStorageModule() {
  await ConfigModule.envVariablesLoaded;
  return process.env.STORAGE === 'S3' ? S3StorageModule : DefaultStorageModule;
}

```

这种结构保证在 `ConfigModule.envVariablesLoaded` Promise 解析后，所有配置变量都已加载。

#### 条件模块配置

有时您可能希望有条件地加载模块并在环境变量中指定条件。幸运的是，`@nestjs/config` 提供了一个 `ConditionalModule`，允许您这样做。

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(FooModule, 'USE_FOO'),
  ],
})
export class AppModule {}

```

上面的模块只有在 `.env` 文件中没有 `false` 值的 `USE_FOO` 环境变量时才会加载 `FooModule`。您也可以自己传递自定义条件，一个接收 `process.env` 引用的函数，该函数应该返回一个布尔值，以便 `ConditionalModule` 处理：

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(
      FooBarModule,
      (env: NodeJS.ProcessEnv) => !!env['foo'] && !!env['bar'],
    ),
  ],
})
export class AppModule {}

```

使用 `ConditionalModule` 时，确保在应用程序中加载 `ConfigModule` 非常重要，以便可以正确引用和利用 `ConfigModule.envVariablesLoaded` 钩子。如果钩子在 5 秒内（或用户在 `registerWhen` 方法的第三个选项参数中设置的毫秒超时）未翻转到 true，则 `ConditionalModule` 将抛出错误，Nest 将中止启动应用程序。

#### 可扩展变量

`@nestjs/config` 包支持环境变量扩展。通过这种技术，您可以创建嵌套的环境变量，其中一个变量在另一个变量的定义中被引用。例如：

```json
APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}

```

通过这种结构，变量 `SUPPORT_EMAIL` 解析为 `'support@mywebsite.com'`。注意使用 `${{ '{' }}...{{ '}' }}` 语法来触发解析 `SUPPORT_EMAIL` 定义内的 `APP_URL` 变量的值。

> info **提示** 对于此功能，`@nestjs/config` 包内部使用 [dotenv-expand](https://github.com/motdotla/dotenv-expand)。

使用 `ConfigModule` 的 `forRoot()` 方法中传递的选项对象的 `expandVariables` 属性启用环境变量扩展，如下所示：

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      // ...
      expandVariables: true,
    }),
  ],
})
export class AppModule {}

```

#### 在 `main.ts` 中使用

虽然我们的配置存储在服务中，但它仍然可以在 `main.ts` 文件中使用。这样，您可以使用它来存储应用程序端口或 CORS 主机等变量。

要访问它，您必须使用 `app.get()` 方法，后跟服务引用：

```typescript
const configService = app.get(ConfigService);

```

然后您可以像往常一样使用它，通过调用带有配置键的 `get` 方法：

```typescript
const port = configService.get('PORT');

```