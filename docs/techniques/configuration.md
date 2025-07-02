# 配置

应用程序通常运行在不同的**环境**中。根据环境不同，应使用不同的配置设置。例如，本地环境通常依赖特定的数据库凭证，这些凭证仅对本地数据库实例有效；而生产环境则会使用另一组数据库凭证。由于配置变量会发生变化，最佳实践是将[配置变量存储在环境](https://12factor.net/config)中。

在 Node.js 中，通过全局对象 `process.env` 可以访问外部定义的环境变量。我们可以尝试通过在每个环境中单独设置环境变量来解决多环境问题。但这种方式很快就会变得难以管理，特别是在开发和测试环境中，这些值需要能够轻松模拟和/或修改。

在 Node.js 应用程序中，通常使用 `.env` 文件来代表每个环境，其中包含键值对，每个键代表一个特定值。在不同环境中运行应用程序只需切换正确的 `.env` 文件即可。

在 Nest 中使用此技术的一个好方法是创建一个 `ConfigModule`，它暴露一个加载相应 `.env` 文件的 `ConfigService`。虽然你可以选择自己编写这样的模块，但为了方便，Nest 提供了开箱即用的 `@nestjs/config` 包。我们将在本章节介绍这个包。

#### 安装

要开始使用它，我们首先需要安装所需的依赖项。

```bash
$ npm i --save @nestjs/config
```

> info **提示** `@nestjs/config` 包内部使用了 [dotenv](https://github.com/motdotla/dotenv)。

> warning **注意**`@nestjs/config` 需要 TypeScript 4.1 或更高版本。

#### 快速开始

安装过程完成后，我们可以导入 `ConfigModule`。通常我们会将其导入根模块 `AppModule`，并使用静态方法 `.forRoot()` 来控制其行为。在此步骤中，环境变量的键/值对会被解析和处理。稍后我们将看到在其他功能模块中访问 `ConfigModule` 的 `ConfigService` 类的几种方法。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
```

上述代码将从默认位置（项目根目录）加载并解析 `.env` 文件，将 `.env` 文件中的键值对与分配给 `process.env` 的环境变量合并，并将结果存储在一个可通过 `ConfigService` 访问的私有结构中。`forRoot()` 方法会注册 `ConfigService` 提供者，该提供者提供了用于读取这些解析/合并后配置变量的 `get()` 方法。由于 `@nestjs/config` 依赖于 [dotenv](https://github.com/motdotla/dotenv)，因此它使用该包的规则来解决环境变量名称冲突。当某个键同时存在于运行时环境变量（例如通过操作系统 shell 导出如 `export DATABASE_USER=test`）和 `.env` 文件中时，运行时环境变量具有优先权。

一个示例 `.env` 文件如下所示：

```json
DATABASE_USER=test
DATABASE_PASSWORD=test
```

若您需要某些环境变量在加载 `ConfigModule` 模块和启动 Nest 应用之前就可用（例如用于向 `NestFactory#createMicroservice` 方法传递微服务配置），可以使用 Nest CLI 的 `--env-file` 选项。该选项允许您指定应在应用启动前加载的 `.env` 文件路径。`--env-file` 标志支持始于 Node v20 版本，详见[官方文档](https://nodejs.org/dist/v20.18.1/docs/api/cli.html#--env-fileconfig) 。

```bash
$ nest start --env-file .env
```

#### 自定义环境文件路径

默认情况下，该包会在应用根目录下查找 `.env` 文件。若要为 `.env` 文件指定其他路径，请按如下方式在传递给 `forRoot()` 的（可选）配置对象中设置 `envFilePath` 属性：

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});
```

您还可以像这样为 `.env` 文件指定多个路径：

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});
```

如果一个变量在多个文件中被找到，则以第一个为准。

#### 禁用环境变量加载

如果你不想加载 `.env` 文件，而是希望直接从运行时环境访问环境变量（就像使用操作系统 shell 导出命令 `export DATABASE_USER=test` 那样），请将选项对象的 `ignoreEnvFile` 属性设置为 `true`，如下所示：

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true,
});
```

#### 全局使用模块

当您需要在其他模块中使用 `ConfigModule` 时，需像标准 Nest 模块一样导入它。或者，通过将选项对象的 `isGlobal` 属性设为 `true` 将其声明为[全局模块](../overview/modules#global-modules) （如下所示）。这种情况下，一旦在根模块（如 `AppModule`）中加载后，就无需在其他模块中重复导入 `ConfigModule`。

```typescript
ConfigModule.forRoot({
  isGlobal: true,
});
```

#### 自定义配置文件

对于更复杂的项目，您可以使用自定义配置文件返回嵌套配置对象。这允许您按功能（例如数据库相关设置）对配置设置进行分组，并将相关设置存储在单独文件中以便独立管理。

自定义配置文件导出一个返回配置对象的工厂函数。该配置对象可以是任意嵌套的普通 JavaScript 对象。`process.env` 对象将包含完全解析后的环境变量键值对（其中 `.env` 文件及外部定义的变量会按照[上文](techniques/configuration#getting-started)所述方式解析合并）。由于您控制着返回的配置对象，因此可以添加任何必要的逻辑来将值转换为适当类型、设置默认值等。例如：

```typescript title="config/configuration"
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  }
});
```

我们通过传递给 `ConfigModule.forRoot()` 方法的 options 对象中的 `load` 属性来加载该文件：

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

> info **注意** 分配给 `load` 属性的值是一个数组，允许您加载多个配置文件（例如 `load: [databaseConfig, authConfig]` ）

通过自定义配置文件，我们还可以管理 YAML 文件等自定义文件。以下是使用 YAML 格式的配置示例：

```yaml
http:
  host: 'localhost'
  port: 8080
```

db:
  postgres:
    url: 'localhost'
    port: 5432
    database: 'yaml-db'

  sqlite:
    database: 'sqlite.db'
```

要读取和解析 YAML 文件，我们可以使用 `js-yaml` 包。

```bash
$ npm i js-yaml
$ npm i -D @types/js-yaml
```

安装该包后，使用 `yaml#load` 函数加载我们刚才创建的 YAML 文件。

```typescript title="config/configuration"
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  return yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};
```

> warning **注意** Nest CLI 在构建过程中不会自动将"assets"（非 TS 文件）移动到 `dist` 文件夹。为确保 YAML 文件被复制，您需要在 `nest-cli.json` 文件的 `compilerOptions#assets` 对象中进行指定。例如，如果 `config` 文件夹与 `src` 文件夹位于同一层级，则添加值为 `"assets": [{"include": "../config/*.yaml", "outDir": "./dist/config"}]` 的 `compilerOptions#assets`。了解更多[此处](/cli/monorepo#assets) 。

快速提示 - 即使您在 NestJS 的 `ConfigModule` 中使用 `validationSchema` 选项，配置文件也不会自动验证。如果您需要验证或想应用任何转换，必须在工厂函数中处理这些操作，因为在那里您可以完全控制配置对象。这使您能够根据需要实现任何自定义验证逻辑。

例如，若需确保端口号处于特定范围内，可在工厂函数中添加验证步骤：

```typescript title="config/configuration"
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

现在，如果端口超出指定范围，应用程序将在启动时抛出错误。

<app-banner-devtools></app-banner-devtools>

#### 使用 `ConfigService`

要从 `ConfigService` 获取配置值，首先需要注入 `ConfigService`。与任何提供程序一样，需将其所属模块——`ConfigModule`——导入到将使用它的模块中（除非在传递给 `ConfigModule.forRoot()` 方法的选项对象中将 `isGlobal` 属性设为 `true`）。如下所示将其导入功能模块。

```typescript title="feature.module"
@Module({
  imports: [ConfigModule],
  // ...
})
```

然后我们可以使用标准的构造函数注入方式注入它：

```typescript
constructor(private configService: ConfigService) {}
```

> info **提示** `ConfigService` 是从 `@nestjs/config` 包导入的。

并在我们的类中使用它：

```typescript
// get an environment variable
const dbUser = this.configService.get<string>('DATABASE_USER');

// get a custom configuration value
const dbHost = this.configService.get<string>('database.host');
```

如上所示，使用 `configService.get()` 方法通过传递变量名来获取简单的环境变量。您可以通过传递类型来进行 TypeScript 类型提示，如上所示（例如 `get<string>(...)`）。`get()` 方法还可以遍历嵌套的自定义配置对象（通过 [自定义配置文件](techniques/configuration#custom-configuration-files) 创建），如上文第二个示例所示。

你也可以使用接口作为类型提示来获取整个嵌套的自定义配置对象：

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
}

const dbConfig = this.configService.get<DatabaseConfig>('database');

// you can now use `dbConfig.port` and `dbConfig.host`
const port = dbConfig.port;
```

`get()` 方法还接受一个可选的第二个参数，用于定义默认值，当键不存在时将返回该值，如下所示：

```typescript
// use "localhost" when "database.host" is not defined
const dbHost = this.configService.get<string>('database.host', 'localhost');
```

`ConfigService` 有两个可选泛型（类型参数）。第一个泛型用于帮助防止访问不存在的配置属性。使用方法如下所示：

```typescript
interface EnvironmentVariables {
  PORT: number;
  TIMEOUT: string;
}

// somewhere in the code
constructor(private configService: ConfigService<EnvironmentVariables>) {
  const port = this.configService.get('PORT', { infer: true });

  // TypeScript Error: this is invalid as the URL property is not defined in EnvironmentVariables
  const url = this.configService.get('URL', { infer: true });
}
```

当 `infer` 属性设置为 `true` 时，`ConfigService#get` 方法会根据接口自动推断属性类型。例如，`typeof port === "number"`（如果你没有使用 TypeScript 的 `strictNullChecks` 标志），因为 `PORT` 在 `EnvironmentVariables` 接口中具有 `number` 类型。

此外，借助 `infer` 特性，您甚至可以推断出嵌套自定义配置对象属性的类型，即便使用点表示法时也是如此，如下所示：

```typescript
constructor(private configService: ConfigService<{ database: { host: string } }>) {
  const dbHost = this.configService.get('database.host', { infer: true })!;
  // typeof dbHost === "string"                                          |
  //                                                                     +--> non-null assertion operator
}
```

第二个泛型依赖于第一个泛型，作为一种类型断言，用于消除当 `strictNullChecks` 开启时 `ConfigService` 方法可能返回的所有 `undefined` 类型。例如：

```typescript
// ...
constructor(private configService: ConfigService<{ PORT: number }, true>) {
  //                                                               ^^^^
  const port = this.configService.get('PORT', { infer: true });
  //    ^^^ The type of port will be 'number' thus you don't need TS type assertions anymore
}
```

> info **提示** 为确保 `ConfigService#get` 方法仅从自定义配置文件中获取值而忽略 `process.env` 变量，请在 `ConfigModule` 的 `forRoot()` 方法的选项对象中将 `skipProcessEnv` 选项设为 `true`。

#### 配置命名空间

`ConfigModule` 允许您定义并加载多个自定义配置文件，如上方[自定义配置文件](techniques/configuration#custom-configuration-files)所示。您可以通过嵌套配置对象来管理复杂的配置对象层次结构，如该章节所示。或者，您也可以使用 `registerAs()` 函数返回一个"命名空间"配置对象，如下所示：

```typescript title="config/database.config"
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 5432
}));
```

与自定义配置文件相同，在 `registerAs()` 工厂函数内部，`process.env` 对象将包含完全解析的环境变量键值对（其中 `.env` 文件和外部定义的变量会按照[上文](techniques/configuration#getting-started)所述进行解析和合并）。

> info **提示** `registerAs` 函数是从 `@nestjs/config` 包中导出的。

通过 `forRoot()` 方法选项对象中的 `load` 属性加载命名空间配置，其加载方式与加载自定义配置文件相同：

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

要从 `database` 命名空间获取 `host` 值，请使用点表示法。以 `'database'` 作为属性名前缀，对应命名空间的名称（作为第一个参数传递给 `registerAs()` 函数）：

```typescript
const dbHost = this.configService.get<string>('database.host');
```

另一种合理的方法是直接注入 `database` 命名空间。这使我们能够受益于强类型：

```typescript
constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {}
```

> info **提示** `ConfigType` 是从 `@nestjs/config` 包导出的。

#### 模块中的命名空间配置

要在应用中将命名空间配置作为另一个模块的配置对象使用，可以利用配置对象的 `.asProvider()` 方法。该方法将命名空间配置转换为提供者，随后可传递给目标模块的 `forRootAsync()`（或等效方法）。

示例如下：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
})
```

要理解 `.asProvider()` 方法的运作机制，我们来看其返回值：

```typescript
// Return value of the .asProvider() method
{
  imports: [ConfigModule.forFeature(databaseConfig)],
  useFactory: (configuration: ConfigType<typeof databaseConfig>) => configuration,
  inject: [databaseConfig.KEY]
}
```

这种结构设计让您无需编写重复的样板代码，就能将命名空间配置无缝集成到各模块中，确保应用保持组织性和模块化特性。

#### 缓存环境变量

由于访问 `process.env` 可能较慢，您可以通过设置传递给 `ConfigModule.forRoot()` 的选项对象中的 `cache` 属性，来提高 `ConfigService#get` 方法在处理存储在 `process.env` 中的变量时的性能。

```typescript
ConfigModule.forRoot({
  cache: true,
});
```

#### 部分注册

到目前为止，我们已经在根模块（例如 `AppModule`）中使用 `forRoot()` 方法处理配置文件。对于具有更复杂项目结构的情况，可能会有位于多个不同目录中的特性特定配置文件。`@nestjs/config` 包提供了一项称为**部分注册**的功能，可以仅引用与每个特性模块关联的配置文件。在特性模块中使用静态方法 `forFeature()` 来执行此部分注册，如下所示：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}
```

> info **警告** 在某些情况下，您可能需要通过 `onModuleInit()` 钩子而非构造函数来访问通过部分注册加载的属性。这是因为 `forFeature()` 方法会在模块初始化期间执行，而模块初始化的顺序是不确定的。如果您在构造函数中访问由其他模块以此方式加载的值，配置所依赖的模块可能尚未初始化。`onModuleInit()` 方法仅在其依赖的所有模块都初始化完成后才会运行，因此这种技术是安全的。

#### 模式验证

标准做法是在应用程序启动时，如果未提供必需的环境变量或它们不符合某些验证规则，则抛出异常。`@nestjs/config` 包提供了两种不同的实现方式：

- [Joi](https://github.com/sideway/joi) 内置验证器。使用 Joi 时，您可以定义一个对象模式并根据它验证 JavaScript 对象。
- 一个自定义的 `validate()` 函数，它以环境变量作为输入。

要使用 Joi，我们必须先安装 Joi 包：

```bash
$ npm install --save joi
```

现在我们可以定义一个 Joi 验证模式，并通过 `forRoot()` 方法选项对象中的 `validationSchema` 属性传递它，如下所示：

```typescript title="app.module"
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

默认情况下，所有模式键都被视为可选的。这里我们为 `NODE_ENV` 和 `PORT` 设置了默认值，如果我们在环境（`.env` 文件或进程环境）中没有提供这些变量，就会使用这些默认值。或者，我们可以使用 `required()` 验证方法来要求必须在环境（`.env` 文件或进程环境）中定义值。在这种情况下，如果我们没有在环境中提供变量，验证步骤将抛出异常。有关如何构建验证模式的更多信息，请参阅 [Joi 验证方法](https://joi.dev/api/?v=17.3.0#example) 。

默认情况下，允许未知的环境变量（即键未在模式中定义的环境变量）且不会触发验证异常。默认情况下，所有验证错误都会被报告。您可以通过在 `forRoot()` 配置对象的 `validationOptions` 键中传递选项对象来修改这些行为。该选项对象可以包含任何由 [Joi 验证选项](https://joi.dev/api/?v=17.3.0#anyvalidatevalue-options)提供的标准验证选项属性。例如，要反转上述两个设置，可传递如下选项：

```typescript title="app.module"
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

`@nestjs/config` 包的默认设置为：

- `allowUnknown`: 控制是否允许环境变量中存在未知键。默认值为 `true`
- `abortEarly`: 若为 true 则在首个错误时停止验证；若为 false 则返回所有错误。默认值为 `false`。

请注意，一旦决定传递 `validationOptions` 对象，任何未显式传递的设置都将默认使用 `Joi` 的标准默认值（而非 `@nestjs/config` 的默认值）。例如，如果在自定义的 `validationOptions` 对象中未指定 `allowUnknowns`，则该值将采用 `Joi` 的默认值 `false`。因此，最稳妥的做法是在自定义对象中**同时**指定这两个设置。

> info **提示** 若要禁用预定义环境变量的验证，请在 `forRoot()` 方法的选项对象中将 `validatePredefined` 属性设为 `false`。预定义环境变量是指在模块导入前已设置的进程变量（`process.env` 变量）。例如，若使用 `PORT=3000 node main.js` 启动应用，则 `PORT` 即为预定义环境变量。

#### 自定义验证函数

或者，你也可以指定一个**同步** `validate` 函数，该函数接收包含环境变量（来自 env 文件和进程）的对象，并返回包含已验证环境变量的对象，以便在需要时进行转换/修改。如果该函数抛出错误，将阻止应用程序启动。

在本例中，我们将使用 `class-transformer` 和 `class-validator` 包。首先需要定义：

- 一个带有验证约束的类，
- 以及一个利用 `plainToInstance` 和 `validateSync` 函数的验证函数。

```typescript title="env.validation"
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

配置完成后，将 `validate` 函数作为 `ConfigModule` 的配置选项使用，如下所示：

```typescript title="app.module"
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

`ConfigService` 定义了一个通用的 `get()` 方法通过键来检索配置值。我们还可以添加 `getter` 函数以实现更自然的编码风格：

```typescript
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}
```

现在我们可以如下使用 getter 函数：

```typescript title="app.service"
@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      // Authentication is enabled
    }
  }
}
```

#### 环境变量加载钩子

如果模块配置依赖于环境变量，且这些变量是从 `.env` 文件加载的，你可以使用 `ConfigModule.envVariablesLoaded` 钩子来确保在与 `process.env` 对象交互前该文件已加载，参见以下示例：

```typescript
export async function getStorageModule() {
  await ConfigModule.envVariablesLoaded;
  return process.env.STORAGE === 'S3' ? S3StorageModule : DefaultStorageModule;
}
```

这种结构保证了在 `ConfigModule.envVariablesLoaded` Promise 解析后，所有配置变量都已加载完成。

#### 条件式模块配置

有时您可能希望根据环境变量中的条件来动态加载模块。幸运的是，`@nestjs/config` 提供了一个 `ConditionalModule` 来实现这一需求。

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(FooModule, 'USE_FOO'),
  ],
})
export class AppModule {}
```

上述模块仅在 `.env` 文件中环境变量 `USE_FOO` 的值不为 `false` 时才会加载 `FooModule`。您也可以自定义条件函数，该函数接收 `process.env` 引用并返回布尔值供 `ConditionalModule` 处理：

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(
      FooBarModule,
      (env: NodeJS.ProcessEnv) => !!env['foo'] && !!env['bar']
    ),
  ],
})
export class AppModule {}
```

需要注意的是，在使用 `ConditionalModule` 时必须确保应用中已加载 `ConfigModule`，这样才能正确引用和使用 `ConfigModule.envVariablesLoaded` 钩子。如果钩子在 5 秒内（或用户在 `registerWhen` 方法第三个选项参数中设置的毫秒超时时间）未切换为 true，`ConditionalModule` 将抛出错误并导致 Nest 中止应用启动。

#### 可扩展变量

`@nestjs/config` 包支持环境变量扩展功能。通过这项技术，您可以创建嵌套的环境变量，即在一个变量的定义中引用另一个变量。例如：

```json
APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}
```

通过这种构造方式，变量 `SUPPORT_EMAIL` 将被解析为 `'support@mywebsite.com'`。注意其中使用了 `${...}` 语法来触发在 `SUPPORT_EMAIL` 定义内部解析 `APP_URL` 变量值。

> info **提示** 该功能在内部使用了 [dotenv-expand](https://github.com/motdotla/dotenv-expand) 依赖包。

要启用环境变量扩展功能，需在传递给 `ConfigModule` 的 `forRoot()` 方法的配置对象中设置 `expandVariables` 属性，如下所示：

```typescript title="app.module"
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

虽然我们的配置存储在服务中，但仍可在 `main.ts` 文件中使用。这样，您就可以用它来存储应用程序端口或 CORS 主机等变量。

要访问它，必须使用 `app.get()` 方法，后跟服务引用：

```typescript
const configService = app.get(ConfigService);
```

然后您可以像往常一样使用它，通过调用带有配置键的 `get` 方法：

```typescript
const port = configService.get('PORT');
```
