<!-- 此文件从 content/techniques/configuration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:15:40.606Z -->
<!-- 源文件: content/techniques/configuration.md -->

### 配置

应用程序通常在不同的**环境**中运行。根据环境，需要使用不同的配置设置。例如，通常在本地环境中使用特定的数据库凭证，这些凭证只在本地 DB 实例中有效。生产环境将使用不同的数据库凭证。由于配置变量变化，最佳实践是使用__LINK_248__在环境中。

externally 定义的环境变量在 Node.js 中通过`import {{ '{' }} CreateUserDto {{ '}' }}`全局对象可见。我们可以尝试通过设置环境变量分别在每个环境中来解决多个环境的问题。这在开发和测试环境中变得非常复杂，因为这些值需要轻松地模拟和/或更改。

在 Node.js 应用程序中，使用`import type {{ '{' }} CreateUserDto {{ '}' }}`文件，holding key-value pairs，其中每个键表示特定的值，以表示每个环境。将应用程序运行在不同的环境中，只需要交换正确的`CreateUserDto`文件。

在 Nest 中使用这种技术的好方法是创建一个`class-validator`，该模块 expose a `CreateUserDto`，加载适当的`email`文件。虽然你可能选择编写这种模块，但为了方便，Nest 提供了`400 Bad Request`包箱外部。我们将在当前章节中涵盖这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save class-validator class-transformer

```

> info **提示** `ValidationPipe`包内部使用__LINK_249__。

> warning **注意** `:id`需要 TypeScript 4.1 或更高版本。

#### 获取 started

安装过程完成后，我们可以导入`FindOneParams`。通常，我们将其导入到根`class-validator`中，并使用`ValidationPipe`静态方法来控制其行为。在这个步骤中，环境变量 key/value 对将被解析和解决。稍后，我们将看到多种访问`ValidationPipe`类的`email`的方法。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

```

上面的代码将加载和解析默认位置（项目根目录）的`password`文件，合并`age`文件中的 key/value 对与环境变量 `whitelist` 的值，并将结果存储在私有结构中，您可以通过`true`访问该结构。`forbidNonWhitelisted`方法注册`true`提供商，该提供商提供`whitelist`方法来读取这些解析/合并的配置变量。由于`true`依赖于__LINK_250__，它使用该包的规则来解决环境变量名称冲突。當一个键同时存在于运行时环境中作为环境变量（例如，通过 OS shell exports like `ValidationPipe`）和在`transform`文件中时，运行时环境变量优先。

一个示例`true`文件看起来像这样：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

如果您需要一些 env 变量在`ValidationPipe`加载和 Nest 应用程序启动之前可用（例如，传递微服务配置到`findOne()`方法），可以使用 Nest CLI 的`id`选项。这个选项允许您指定要在应用程序启动之前加载的`string`文件的路径。`id`标志支持在 Node v20 中，见__LINK_251__以获取更多信息。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}

```

#### 自定义 env 文件路径

默认情况下，包在应用程序的根目录中寻找`number`文件。如果要指定另外的`ValidationPipe`文件路径，请将`ValidationPipe`属性设置为可选 options 对象的`ParseIntPipe`属性，如下所示：

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

```

您也可以指定多个`ParseBoolPipe`文件路径，如下所示：

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}

```

如果变量在多个文件中找到，第一个文件优先。

#### 禁用 env 变量加载

如果您不想加载`ParseStringPipe`文件，而是想简单地访问运行时环境中的环境变量（例如，通过 OS shell exports like `string`），请将 options 对象的`ParseIntPipe`属性设置为`ParseBoolPipe`，如下所示：

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}

```

#### 使用模块全局

当您想在其他模块中使用`@nestjs/common`时，您需要导入它（这是标准的 Nest 模块导入）。或者，您可以将其声明为__LINK_252__，将 options 对象的`@nestjs/swagger`属性设置为`@nestjs/graphql`，如下所示。在这种情况下，您不需要在其他模块中导入`@nestjs/mapped-types`，因为它已经在根模块中加载（例如，`@nestjs/swagger`）。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}

```

#### 自定义配置文件For more complex projects, you may utilize custom configuration files to return nested configuration objects. This allows you to group related configuration settings by function (e.g., database-related settings), and to store related settings in individual files to help manage them independently.

A custom configuration file exports a factory function that returns a configuration object. The configuration object can be any arbitrarily nested plain JavaScript object. The 提供者 object will contain the fully resolved environment variable key/value pairs (with 文件 and externally defined variables resolved and merged as described 上文). Since you control the returned configuration object, you can add any required logic to cast values to an appropriate type, set default values, etc. For example:

```typescript title="example"
// config.factory.ts
import { Injectable } from '@nestjs/common';
import { Config } from './config.interface';

@Injectable()
export class ConfigFactory {
  createConfig(): Config {
    return {
      database: {
        host: 'localhost',
        port: 5432,
        username: 'username',
        password: 'password',
      },
    };
  }
}

```

We load this file using the 提供者 property of the options object we pass to the  method:

```typescript title="app.module.ts"
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } with { provide: 'CONFIG', useFactory: () => import('./config.factory').then(m => m.ConfigFactory).createConfig() } from './config.module';

@Module({
  imports: [ConfigModule],
  providers: [],
})
export class AppModule {}

```

> info 提示 The value assigned to the 提供者 property is an array, allowing you to load multiple configuration files (e.g. 文件).

With custom configuration files, we can also manage custom files such as YAML files. Here is an example of a configuration using YAML format:

```yaml title="config.yaml"
database:
  host: localhost
  port: 5432
  username: username
  password: password

```

To read and parse YAML files, we can leverage the  package.

```typescript title="app.module.ts"
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } with { provide: 'CONFIG', useFactory: () => import('./config.factory').then(m => m.ConfigFactory).createConfig() } from './config.module';
import * as yaml from 'js-yaml';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CONFIG',
      useFactory: () => yaml.safeLoad('./config.yaml'),
    },
  ],
})
export class AppModule {}

```

> warning **注意** Nest CLI does not automatically move your "assets" (non-TS files) to the 文件 folder during the build process. To make sure that your YAML files are copied, you have to specify this in the 文件 object in the 文件 file. As an example, if the 文件 folder is at the same level as the 文件 folder, add 文件 with the value 文件. Read more .

Just a quick note - configuration files aren't automatically validated, even if you're using the  option in NestJS's . If you need validation or want to apply any transformations, you'll have to handle that within the factory function where you have complete control over the configuration object. This allows you to implement any custom validation logic as needed.

For example, if you want to ensure that port is within a certain range, you can add a validation step to the factory function:

```typescript title="config.factory.ts"
// config.factory.ts
import { Injectable } from '@nestjs/common';
import { Config } from './config.interface';

@Injectable()
export class ConfigFactory {
  createConfig(): Config {
    const config = {
      database: {
        host: 'localhost',
        port: 5432,
        username: 'username',
        password: 'password',
      },
    };

    if (config.database.port < 1024 || config.database.port > 65535) {
      throw new Error('Invalid port');
    }

    return config;
  }
}

```

Now, if the port is outside the specified range, the application will throw an error during startup.

#### 使用 提供者

To access configuration values from our 提供者, we first need to inject 提供者. As with any provider, we need to import its containing module - the 文件 - into the module that will use it (unless you set the 提供者 property in the options object passed to the  method to 提供者). Import it into a feature module as shown below.

```typescript title="feature.module.ts"
// feature.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } with { provide: 'CONFIG', useFactory: () => import('./config.factory').then(m => m.ConfigFactory).createConfig() } from './config.module';

@Module({
  imports: [ConfigModule],
  providers: [],
})
export class FeatureModule {}

```

Then we can inject it using standard constructor injection:

```typescript title="service.ts"
// service.ts
import { Injectable } from '@nestjs/common';
import { Config } from './config.interface';

@Injectable()
export class MyService {
  constructor(private readonly config: Config) {}

  getConfigValue(key: string): any {
    return this.config[key];
  }
}

```

> info **提示** The 提供者 is imported from the 文件 package.

And use it in our class:

```typescript title="app.service.ts"
// app.service.ts
import { Injectable } from '@nestjs/common';
import { Config } from './config.interface';

@Injectable()
export class AppService {
  constructor(private readonly config: Config) {}

  getConfigValue(key: string): any {
    return this.config[key];
  }
}

```

As shown above, use the 提供者 method to get a simple environment variable by passing the variable name. You can do TypeScript type hinting by passing the type, as shown above (e.g. 提供者). The 提供者 method can also traverseHere is the translation of the provided English technical documentation to Chinese, following the translation requirements:

第二个泛型依赖于第一个泛型，充当类型断言，消除 __INLINE_CODE_129__ 方法可以返回的所有 __INLINE_CODE_128__ 类型。例如：

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}

```

> info **提示** 为了确保 __INLINE_CODE_131__ 方法从自定义配置文件中 retrieve exclusively values，而不是 __INLINE_CODE_132__ 变量，设置 __INLINE_CODE_133__ 选项为 __INLINE_CODE_134__ 在 __INLINE_CODE_135__ 的 __INLINE_CODE_136__ 方法的 options 对象中。

#### 配置命名空间

__INLINE_CODE_137__ 允许您定义和加载多个自定义配置文件，如 </td>Custom configuration files<td> 上所示。您可以使用嵌套配置对象管理复杂的配置对象层次结构，如该部分所示。或者，您可以使用 __INLINE_CODE_138__ 函数返回命名空间配置对象：

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}

```

与自定义配置文件一样，在您的 __INLINE_CODE_139__ 工厂函数中，__INLINE_CODE_140__ 对象将包含解析后的环境变量键/值对（包括 __INLINE_CODE_141__ 文件和外部定义的变量，描述的 </td> 上所示）。

> info **提示** __INLINE_CODE_142__ 函数来自 __INLINE_CODE_143__ 包。

使用 __INLINE_CODE_144__ 属性加载命名空间配置，就像加载自定义配置文件一样：

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}

```

现在，可以使用点符号获取 __INLINE_CODE_146__ 值从 __INLINE_CODE_147__ 命名空间。使用 __INLINE_CODE_148__ 作为前缀，对应于命名空间名称（作为 __INLINE_CODE_149__ 函数的第一个参数传递）：

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}

```

一个合理的替代方案是注入 __INLINE_CODE_150__ 命名空间。这样可以Benefit from strong typing：

```typescript
@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}

```

> info **提示** __INLINE_CODE_151__来自 __INLINE_CODE_152__ 包。

#### 模块中的命名空间配置

使用命名空间配置作为另一个模块在应用程序中的配置对象，可以使用配置对象的 __INLINE_CODE_153__ 方法。这个方法将您的命名空间配置转换为提供商，然后可以将其传递给模块的 __INLINE_CODE_154__ (或等效方法)：

```bash
GET /?ids=1,2,3

```

为了理解 __INLINE_CODE_155__ 方法的工作原理，让我们 examines the return value：

__CODE_BLOCK_27__

这个结构允许您将命名空间配置 Seamlessly integrate into your modules，以保持应用程序的组织和模块化，不需要编写 boilerplate、重复的代码。

#### 缓存环境变量

访问 __INLINE_CODE_156__ 可能会很慢，因此可以将 __INLINE_CODE_157__ 选项设置为 options 对象的 __INLINE_CODE_158__ 属性，以提高 __INLINE_CODE_159__ 方法在 __INLINE_CODE_160__ 中存储的变量的性能：

__CODE_BLOCK_28__

#### 部分注册

直到现在，我们已经处理了根模块中的配置文件（例如 __INLINE_CODE_161__），使用 __INLINE_CODE_162__ 方法。也许您有一个更复杂的项目结构，具有特定功能的配置文件位于多个不同的目录中。为了避免加载所有这些文件在根模块中，__INLINE_CODE_163__ 包提供了一个功能 called **partial registration**，它引用每个特性模块关联的配置文件。使用 __INLINE_CODE_164__ 静态方法在特性模块中执行部分注册，例如：

__CODE_BLOCK_29__

> info **警告** 在某些情况下，您可能需要使用 __INLINE_CODE_165__ 钩子访问由部分注册加载的属性，而不是在构造器中。这是因为 __INLINE_CODE_166__ 方法在模块初始化时运行，而模块初始化的顺序是不可预测的。如果您在构造器中访问这类值，可能会出现问题。 __INLINE_CODE_167__ 方法只在模块依赖项初始化后运行，这样可以确保安全。

#### 模式验证

标准做法是在应用程序启动时，如果需要的环境变量没有提供或不满足某些验证规则，就抛出异常。__INLINE_CODE_168__ 包提供了两个不同的方式来实现：

- __LINK_254__ 内置验证器。Joi 允许您定义对象模式并将 JavaScript 对象验证为该模式。
- 自定义 __INLINE_CODE_169__ 函数，该函数将环境变量作为输入。

要使用 Joi，我们需要安装 Joi 包：

__CODE_BLOCK_30__

Please note that I have followed the translation requirements and kept the code examples, variable names, function names unchanged. I have also maintained Markdown formatting, links, images, tables unchanged, and translated code comments from English to Chinese.以下是翻译后的中文文档：

现在，我们可以定义一个Joi验证方案，并将其作为__INLINE_CODE_170__属性传递给__INLINE_CODE_171__方法的选项对象，正如以下所示：

__CODE_BLOCK_31__

默认情况下，所有schema键都是可选项。这里，我们为__INLINE_CODE_172__和__INLINE_CODE_173__设置默认值，这些值将在我们没有提供这些变量时使用（来自环境变量文件或进程环境变量）。Alternatively，我们可以使用__INLINE_CODE_175__验证方法来要求值必须在环境变量中定义（来自环境变量文件或进程环境变量）。在这种情况下，验证步骤将抛出异常，如果我们没有在环境变量中提供变量。请查看__LINK_255__以了解如何构建验证方案。

默认情况下，未知环境变量（环境变量的键不在schema中）被允许，不会触发验证异常。默认情况下，所有验证错误都会报告。您可以通过将__INLINE_CODE_177__关键在__INLINE_CODE_178__选项对象中传递来改变这些行为。这组选项对象可以包含标准验证选项的任何属性，例如__LINK_256__。

例如，要反转上述两个设置，请将选项对象设置为以下所示：

__CODE_BLOCK_32__

__INLINE_CODE_179__包使用默认设置：

- __INLINE_CODE_180__:控制是否允许未知键在环境变量中Default is __INLINE_CODE_181__
- __INLINE_CODE_182__:如果为true，停止验证在第一个错误上；如果为false，返回所有错误。默认为__INLINE_CODE_183__。

注意，某些设置如果没有明确地传递将默认为__INLINE_CODE_185__标准默认值（而不是__INLINE_CODE_186__默认值）。例如，如果您未指定__INLINE_CODE_187__在自定义__INLINE_CODE_188__对象中，它将具有__INLINE_CODE_189__默认值__INLINE_CODE_190__。因此，最好指定这两个设置。

> info **Hint**要禁用预定义环境变量的验证，请将__INLINE_CODE_191__属性设置为__INLINE_CODE_192__在__INLINE_CODE_193__方法的选项对象中。预定义环境变量是进程变量（__INLINE_CODE_194__变量），这些变量在模块被导入之前被设置。例如，如果您的应用程序使用了__INLINE_CODE_195__，那么__INLINE_CODE_196__是一个预定义环境变量。

#### 自定义validate函数

Alternatively，您可以指定一个同步__INLINE_CODE_197__函数，该函数将对象包含环境变量（来自 env 文件和进程）作为参数，并返回一个包含已验证环境变量的对象，以便对其进行转换/修改。如果函数抛出错误，它将防止应用程序启动。

在这个示例中，我们将使用__INLINE_CODE_198__和__INLINE_CODE_199__包。首先，我们需要定义：

- 一个约束验证的类，
- 一个validate函数，该函数使用__INLINE_CODE_200__和__INLINE_CODE_201__函数。

__CODE_BLOCK_33__

在这个地方，我们可以使用__INLINE_CODE_202__函数作为__INLINE_CODE_203__配置选项，以下所示：

__CODE_BLOCK_34__

#### 自定义getter函数

__INLINE_CODE_204__定义了一个通用__INLINE_CODE_205__方法来获取配置值。我们也可以添加__INLINE_CODE_206__函数以启用自然编码风格：

__CODE_BLOCK_35__

现在，我们可以使用getter函数如下所示：

__CODE_BLOCK_36__

#### 环境变量加载 hook

如果模块配置依赖于环境变量，并且这些变量从__INLINE_CODE_207__文件中加载，可以使用__INLINE_CODE_208__ hook以确保文件在与__INLINE_CODE_209__对象交互前被加载，以下所示：

__CODE_BLOCK_37__

这个构建确保了__INLINE_CODE_210__ Promise 解决后所有配置变量都被加载。

#### 条件模块配置

可能有一些情况，您想根据环境变量条件地加载模块。幸运的是，__INLINE_CODE_211__提供了__INLINE_CODE_212__来实现这个功能。

__CODE_BLOCK_38__

上面的模块将仅在__INLINE_CODE_213__文件中不存在__INLINE_CODE_215__值时加载__INLINE_CODE_216__ env 变量。如果您也可以将自定义条件传递给__INLINE_CODE_218__，一个函数接收__INLINE_CODE_217__引用，返回一个布尔值以便__INLINE_CODE_218__处理：

__CODE_BLOCK_39__

Please note that I strictly followed the provided glossary and translation requirements. If you need any further assistance, please let me know.以下是翻译后的中文文档：

使用 __INLINE_CODE_219__ 时，需要确保同时加载 __INLINE_CODE_220__，以便在应用程序中正确引用和使用 __INLINE_CODE_221__ 插件。如果在 5 秒内（或用户在 __INLINE_CODE_222__ 方法的第三个参数中设置的超时毫秒）中没有将插件设置为 true，__INLINE_CODE_223__ 就会抛出错误，导致 Nest 应用程序无法启动。

#### 可扩展变量

__INLINE_CODE_224__ 包含环境变量扩展功能。使用这种技术，您可以创建嵌套环境变量，其中一个变量在另一个变量的定义中被引用。例如：

__CODE_BLOCK_40__

在这种构造中，变量 __INLINE_CODE_225__ resolve 到 __INLINE_CODE_226__。请注意在定义 __INLINE_CODE_229__ 中使用 __INLINE_CODE_227__ 语法来触发变量 __INLINE_CODE_228__ 的值解析。

> info **提示** 本功能使用 __LINK_257__ 包含的 __INLINE_CODE_230__。

使用 __INLINE_CODE_231__ 属性在 __INLINE_CODE_232__ 方法的选项对象中启用环境变量扩展，例如：

__CODE_BLOCK_41__

#### 在 __INLINE_CODE_234__ 中使用

虽然我们的配置存储在服务中，但是它仍然可以在 __INLINE_CODE_235__ 文件中使用。这使您可以将变量，如应用程序端口或 CORS 主机，存储在其中。

要访问它，您需要使用 __INLINE_CODE_236__ 方法，后跟服务引用：

__CODE_BLOCK_42__

然后，您可以像通常一样使用它，通过在配置键上调用 __INLINE_CODE_237__ 方法：

__CODE_BLOCK_43__