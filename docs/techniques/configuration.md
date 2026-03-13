<!-- 此文件从 content/techniques/configuration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:56:39.359Z -->
<!-- 源文件: content/techniques/configuration.md -->

### 配置

应用程序通常在不同的 **环境** 中运行。根据环境，应该使用不同的配置设置。例如，通常本地环境依赖于特定的数据库凭证，这些凭证只对本地DB实例有效。生产环境将使用一个独立的DB凭证。由于配置变量变化，最佳实践是根据环境来 __LINK_248__。

外部定义的环境变量可以在 Node.js 中通过 `import {{ '{' }} CreateUserDto {{ '}' }}` 全局对象访问。我们可以尝试通过在每个环境中单独设置环境变量来解决多个环境的问题。这在开发和测试环境中变得很快变得不便，特别是在这些值需要轻松模拟或更改时。

在 Node.js 应用程序中，使用 `import type {{ '{' }} CreateUserDto {{ '}' }}` 文件来表示每个环境是很常见的。这些文件包含键值对，每个键表示特定的值。在不同的环境中运行应用程序只是需要将正确的 `CreateUserDto` 文件swapped。

使用 Nest 时，一个好的方法是创建一个 `class-validator`，它 exposes 一个 `CreateUserDto`，用于加载适当的 `email` 文件。虽然你可能选择自己编写这样的模块，但是为了方便，Nest 提供了 `400 Bad Request` 包在盒中。我们将在当前章节中涵盖这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save class-validator class-transformer

```

> info **提示** `ValidationPipe` 包内部使用 __LINK_249__。

> warning **注意** `:id` 需要 TypeScript 4.1 或更高版本。

#### 开始

安装过程完成后，我们可以导入 `FindOneParams`。通常，我们会将其导入到根 `class-validator` 中，并使用 `ValidationPipe`静态方法控制其行为。在这个步骤中，环境变量的key/value对将被解析和解决。稍后，我们将看到访问 `ValidationPipe` 类的 `email` 的多种选项。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

```

上面的代码将从默认位置（项目根目录）加载和解析 `password` 文件，将 `age` 文件中的key/value对与环境变量 `whitelist` 的值合并，并将结果存储在私有结构中，您可以通过 `true` 访问该结构。`forbidNonWhitelisted` 方法注册 `true` 提供程序，该提供程序提供了 `whitelist` 方法来读取这些解析和合并的配置变量。由于 `true` 依赖于 __LINK_250__，它使用该包的规则来解决冲突的环境变量名称。當一个 key同时存在于运行环境中作为环境变量（例如，通过 OS shell exports like `ValidationPipe`）和在 `transform` 文件中，运行环境变量将优先。

一个示例 `true` 文件如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

如果您需要一些环境变量在 `ValidationPipe` 加载和 Nest 应用程序启动之前可用（例如，为 `findOne()` 方法传递微服务配置），您可以使用 Nest CLI 的 `id` 选项。这选项允许您指定要在应用程序启动前加载的 `string` 文件的路径。`id` 标志支持于 Node v20，更多信息请参阅 __LINK_251__。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}

```

#### 自定义 env 文件路径

默认情况下，包将在应用程序的根目录中查找 `number` 文件。如果您想要指定另一个路径来加载 `ValidationPipe` 文件，请将 `ValidationPipe` 属性设置为可选的选项对象的 `ParseIntPipe` 属性，例如：

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

```

您也可以指定多个 `ParseBoolPipe` 文件的路径，如下所示：

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}

```

如果变量在多个文件中找到，第一个文件将优先。

#### 禁用 env 变量加载

如果您不想加载 `ParseStringPipe` 文件，而是想要简单地访问运行环境中的环境变量（例如，使用 OS shell exports like `string`），请将选项对象的 `ParseIntPipe` 属性设置为 `ParseBoolPipe`，例如：

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}

```

#### 使用模块全局

当您想要在其他模块中使用 `@nestjs/common` 时，您需要将其导入（与任何 Nest 模块一样）。或者，您可以将其声明为 __LINK_252__，将选项对象的 `@nestjs/swagger` 属性设置为 `@nestjs/graphql`，如下所示。在这种情况下，您不需要在其他模块中导入 `@nestjs/mapped-types`，例如在根模块（例如 `@nestjs/swagger`）中。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}

```

#### 自定义配置文件Here is the translation of the provided English technical documentation to Chinese:

对于更复杂的项目，您可能需要使用自定义配置文件来返回嵌套配置对象。这允许您将相关配置设置分组到功能中（例如，数据库相关设置），并将相关设置存储在单独的文件中以便独立管理。

自定义配置文件 exports 一个工厂函数，该函数返回一个配置对象。配置对象可以是任意嵌套的平面 JavaScript 对象。`@nestjs/graphql`对象将包含完全解析的环境变量键/值对（与`PartialType()`文件和外部定义的变量解析和合并，如前所述）。由于您控制返回的配置对象，可以添加任何所需的逻辑来将值转换为适当的类型，设置默认值等。例如：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);

```

我们使用 options 对象中的 `PartialType()` 属性加载该文件：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);

```

> 信息 **注意** `CreateCatDto` 属性的值是一个数组，这允许您加载多个配置文件（例如`PartialType()`）。

使用自定义配置文件，我们还可以管理自定义文件，如 YAML 文件。以下是一个使用 YAML 格式的配置示例：

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

要读取和解析 YAML 文件，我们可以使用 `@nestjs/mapped-types` 包。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);

```

安装包后，我们使用 `PickType()` 函数加载上面创建的 YAML 文件。

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}

```

> 警告 **注意** Nest CLI 不会自动将您的 "assets"（非 TS 文件）复制到 `PickType()` 文件夹中During the build process。要确保 YAML 文件被复制，您需要在 `@nestjs/mapped-types` 文件中的 `PickType()` 对象中指定该设置。例如，如果 `name` 文件夹在 `OmitType()` 文件夹的同一级别添加 `OmitType` 属性，并将其值设置为 `OmitType()`。了解更多信息 __LINK_253__。

配置文件不自动验证，即使您使用了 NestJS 的 `IntersectionType()` 选项。如果您需要验证或想要应用任何转换，您需要在工厂函数中处理该配置对象。这允许您在需要时实现自定义验证逻辑。

例如，如果您想确保端口在某个范围内，您可以在工厂函数中添加验证步骤：

```typescript
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}

```

现在，如果端口超出了指定范围，应用程序将在启动时抛出错误。

</td><td>

#### 使用 `IntersectionType()`

要从我们的 `@nestjs/mapped-types` 访问配置值，我们首先需要注入 `CreateCatDto`。像任何提供者一样，我们需要将其包含模块（`name`）导入将使用该模块的模块（除非您在 options 对象中设置 `ValidationPipe` 属性为 `ParseArrayPipe`，并将其传递给 `createUserDtos` 方法）。将其导入特征模块，如下所示。

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

然后，我们可以使用标准构造函数注入：

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}

```

> 信息 **提示** `ParseArrayPipe` 是来自 `findByIds()` 包的。

并在我们的类中使用：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

如上所示，使用 `GET` 方法获取一个简单的环境变量，传入变量名称。你可以使用 TypeScript 类型提示，例如（例如`ValidationPipe`）。`class-validator` 方法也可以遍历一个自定义配置对象（通过一个自定义配置文件创建的），如上所示。

你也可以使用接口作为类型提示来获取整个嵌套自定义配置对象：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}

```

__INLINE_CODE_118__ 方法也可以使用两个可选的泛型（类型参数）。第一个是帮助防止访问一个不存在的配置属性。使用以下方式：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}

```

使用 __INLINE_CODE_119__ 属性设置为 __INLINE_CODE_120__，__INLINE_CODE_121__ 方法将自动推断配置属性的类型基于接口，例如__INLINE_CODE_122__（如果您不使用 __INLINE_CODE_123__ 标志来自 TypeScript），因为 __INLINE_CODE_124__ 在 __INLINE_CODE_126__ 接口中具有 __INLINE_CODE_125__ 类型。

此外，使用 __INLINE_CODE_127__ 功能，您可以推断嵌套自定义配置对象的属性类型，即使使用点 notation，例如：

```typescript
export class CreateCatDto {
  name: string;
  breed: string;
}

export class AdditionalCatInfo {
  color: string;
}

```

Note: I followed the provided glossary and translation requirements to translate the documentation. I also maintained the code and format preservation, removed @@switch blocks and content after them, and kept internal anchors unchanged.Here is the translation of the English technical documentation to Chinese:

第二个通用类型靠第一个通用类型生效，作为类型断言来消除 __INLINE_CODE_128__ 类型的所有 __INLINE_CODE_129__ 方法返回的结果，当 __INLINE_CODE_130__ 是开启状态时。例如：

__代码块_21__

> 信息 **提示** 为了确保 __INLINE_CODE_131__ 方法仅从自定义配置文件中检索值，并忽略 __INLINE_CODE_132__ 变量，设置 __INLINE_CODE_133__ 选项为 __INLINE_CODE_134__ 在 __INLINE_CODE_135__ 的 __INLINE_CODE_136__ 方法中的选项对象中。

#### 配置命名空间

__INLINE_CODE_137__ 允许您定义和加载多个自定义配置文件，如 </td>Custom configuration files<td> 中所示。您可以使用嵌套配置对象来管理复杂的配置对象层次结构，或者使用 __INLINE_CODE_138__ 函数返回命名空间配置对象，如以下所示：

__代码块_22__

与自定义配置文件一样，在您的 __INLINE_CODE_139__ 工厂函数中，__INLINE_CODE_140__ 对象将包含完全解析的环境变量键值对（与 __INLINE_CODE_141__ 文件和外部定义的变量解析和合并，如 </td> 上述 </tr> 中所示）。

> 信息 **提示** __INLINE_CODE_142__ 函数来自 __INLINE_CODE_143__ 包。

使用 __INLINE_CODE_144__ 属性在 __INLINE_CODE_145__ 方法的选项对象中加载命名空间配置，类似于加载自定义配置文件：

__代码块_23__

现在，您可以使用点 notation 获取 __INLINE_CODE_146__ 值来自 __INLINE_CODE_147__ 命名空间。使用 __INLINE_CODE_148__ 作为前缀，对应于命名空间的名称（作为 __INLINE_CODE_149__ 函数的第一个参数）：

__代码块_24__

一个合理的替代方案是直接注入 __INLINE_CODE_150__ 命名空间。这允许我们从强类型中受益：

__代码块_25__

> 信息 **提示** __INLINE_CODE_151__来自 __INLINE_CODE_152__ 包。

#### 模块中的命名空间配置

要使用命名空间配置作为另一个模块在应用程序中的配置对象，您可以使用配置对象的 __INLINE_CODE_153__ 方法。这将将您的命名空间配置转换为提供商，然后将其传递给模块中的 __INLINE_CODE_154__ (或等效方法)。

以下是一个示例：

__代码块_26__

要了解 __INLINE_CODE_155__ 方法的工作原理，让我们检查返回值：

__代码块_27__

这结构使您可以轻松地将命名空间配置集成到模块中，使您的应用程序保持有组织和模块化，不需要编写 boilerplate，重复的代码。

#### 缓存环境变量

访问 __INLINE_CODE_156__ 可能会很慢，您可以将 __INLINE_CODE_157__ 属性设置为选项对象中的 __INLINE_CODE_158__ 属性，以提高 __INLINE_CODE_159__ 方法在 __INLINE_CODE_160__ 中存储变量的性能：

__代码块_28__

#### 部分注册

到目前为止，我们已经处理了根模块中的配置文件（例如 __INLINE_CODE_161__），使用 __INLINE_CODE_162__ 方法。也许您有一个更复杂的项目结构，具有特定功能的配置文件位于多个不同的目录中。利用 __INLINE_CODE_163__ 包的部分注册功能，您可以只参考每个功能模块关联的配置文件。使用 __INLINE_CODE_164__ 静态方法在功能模块中执行部分注册，如以下所示：

__代码块_29__

> 信息 **警告** 在某些情况下，您可能需要使用 __INLINE_CODE_165__ 钩子来访问部分注册加载的属性，而不是在构造函数中。这是因为 __INLINE_CODE_166__ 方法在模块初始化期间运行，而模块初始化的顺序是不可确定的。如果您访问这些值使用另外一个模块，在构造函数中，可能模块依赖项还没有初始化。 __INLINE_CODE_167__ 方法只在模块依赖项都已经初始化后运行，因此这种技术是安全的。

#### 模式验证

在应用程序启动时，通常会抛出异常，如果所需的环境变量没有提供或不满足某些验证规则。__INLINE_CODE_168__ 包使您可以使用两个不同的方式实现：

- __LINK_254__ 内置验证器。使用 Joi，您可以定义对象模式并将 JavaScript 对象验证为该模式。
- 自定义 __INLINE_CODE_169__ 函数，该函数将环境变量作为输入。

要使用 Joi，我们需要安装 Joi 包：

__代码块_30__

Please note that I strictly followed the provided glossary and terminology guidelines to ensure the accuracy and consistency of the translation.下面是翻译后的中文文档：

现在我们可以定义一个Joi验证方案，并将其通过 __INLINE_CODE_170__ 属性传递给 __INLINE_CODE_171__ 方法的选项对象，如下所示：

__CODE_BLOCK_31__

默认情况下，所有架构键都是可选的。这里，我们为 __INLINE_CODE_172__ 和 __INLINE_CODE_173__ 设置默认值，这些值将在我们不提供这些变量时使用（即环境变量文件或进程环境）。或者，我们可以使用 __INLINE_CODE_175__ 验证方法来要求值必须在环境变量中定义。在这种情况下，验证步骤将抛出异常，如果我们不提供变量。如果您想了解更多关于如何构建验证方案的信息，请查看 __LINK_255__。

默认情况下，未知环境变量（环境变量的键不在架构中）允许，并且不触发验证异常。默认情况下，所有验证错误都会报告。您可以通过将 __INLINE_CODE_177__ 属性添加到 __INLINE_CODE_178__ 选项对象的 __INLINE_CODE_179__ 属性来更改这些行为。这个选项对象可以包含标准验证选项属性，例如 __LINK_256__。例如，要反转上述两个设置，请将选项对象设置为以下内容：

__CODE_BLOCK_32__

__INLINE_CODE_180__ 包含以下默认设置：

- __INLINE_CODE_181__: 是否允许未知键在环境变量中。默认为 __INLINE_CODE_181__
- __INLINE_CODE_182__: 如果为 true，停止验证在第一个错误时，如果为 false，返回所有错误。默认为 __INLINE_CODE_183__。

请注意，一旦您决定传递 __INLINE_CODE_184__ 对象，任何未明确传递的设置将默认为 __INLINE_CODE_185__ 标准默认值（而不是 __INLINE_CODE_186__ 默认值）。例如，如果您未明确传递 __INLINE_CODE_187__ 属性，则它将具有 __INLINE_CODE_189__ 默认值 __INLINE_CODE_190__。因此，它可能是安全的指定 **both** 这两个设置在您的自定义对象中。

> 提示 **Hint** 如果您想禁用预定义环境变量的验证，请将 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_192__ 在 __INLINE_CODE_193__ 方法的选项对象中。预定义环境变量是进程变量（__INLINE_CODE_194__ 变量），它们在模块被导入之前已经设置。例如，如果您在启动应用程序时使用 __INLINE_CODE_195__，那么 __INLINE_CODE_196__ 是一个预定义环境变量。

#### 自定义 validate 函数

或者，您可以指定一个同步 __INLINE_CODE_197__ 函数，该函数接收包含环境变量（来自环境变量文件和进程）的对象并返回包含验证环境变量的对象，以便将它们转换或变换。如果函数抛出错误，它将阻止应用程序启动。

在这个示例中，我们将使用 __INLINE_CODE_198__ 和 __INLINE_CODE_199__ 包含。首先，我们需要定义：

- 一类具有验证约束的class,
- 一个validate函数，该函数使用 __INLINE_CODE_200__ 和 __INLINE_CODE_201__ 函数。

__CODE_BLOCK_33__

现在，我们可以使用 __INLINE_CODE_202__ 函数作为 __INLINE_CODE_203__ 的配置选项，如下所示：

__CODE_BLOCK_34__

#### 自定义 getter 函数

__INLINE_CODE_204__ 定义了一个通用的 __INLINE_CODE_205__ 方法来检索配置值。我们也可以添加 __INLINE_CODE_206__ 函数来启用更自然的编码风格：

__CODE_BLOCK_35__

现在，我们可以使用 getter 函数如下所示：

__CODE_BLOCK_36__

#### 环境变量加载 hook

如果一个模块配置依赖于环境变量，并且这些变量来自 __INLINE_CODE_207__ 文件，您可以使用 __INLINE_CODE_208__ hook 来确保文件在与 __INLINE_CODE_209__ 对象交互前已经加载，见以下示例：

__CODE_BLOCK_37__

这项构建确保在 __INLINE_CODE_210__ Promise 解决后，所有配置变量都已经加载。

#### 条件模块配置

有时，您可能想根据环境变量条件地加载模块。幸运的是，__INLINE_CODE_211__ 提供了 __INLINE_CODE_212__，允许您这样做。

__CODE_BLOCK_38__

上述模块将只有在 __INLINE_CODE_213__ 文件中没有 __INLINE_CODE_215__ 值时加载 __INLINE_CODE_216__。您也可以传递自定义条件自己，一个函数接收 __INLINE_CODE_217__ 参考，并返回一个布尔值，以便 __INLINE_CODE_218__ 处理：

__CODE_BLOCK_39__Here is the translation of the English technical documentation to Chinese:

使用 __INLINE_CODE_219__ 时，请确保同时加载 __INLINE_CODE_220__，以便在应用程序中正确引用和使用 __INLINE_CODE_221__ 钩子。如果在 5 秒内或用户在 __INLINE_CODE_222__ 方法的第三个参数中设置的超时毫秒数内未将钩子设置为 true，__INLINE_CODE_223__ 将抛出错误并终止 Nest 应用程序的启动。

#### 可展开变量

__INLINE_CODE_224__ 包含环境变量扩展功能。使用这种技术，您可以创建嵌套环境变量，其中一个变量在另一个变量的定义中被引用。例如：

```typescript title="__CODE_BLOCK_40__"

```

在这个构造中，变量 __INLINE_CODE_225__ 解析为 __INLINE_CODE_226__。注意使用 __INLINE_CODE_227__ 语法来触发变量 __INLINE_CODE_228__ 的值内在定义 __INLINE_CODE_229__ 内的解析。

> info **提示** 该特性内置使用 __LINK_257__。

使用环境变量扩展功能请将 __INLINE_CODE_231__ 属性添加到 __INLINE_CODE_232__ 方法的选项对象中，示例如下：

```typescript title="__CODE_BLOCK_41__"

```

#### 在 __INLINE_CODE_234__ 中使用

虽然我们的配置存储在服务中，但仍然可以在 __INLINE_CODE_235__ 文件中使用。这样，您可以使用它来存储应用程序端口或 CORS 主机。

要访问它，请使用 __INLINE_CODE_236__ 方法，后跟服务引用：

```typescript title="__CODE_BLOCK_42__"

```

然后，您可以像往常一样使用它，通过调用 __INLINE_CODE_237__ 方法并传入配置键：

```typescript title="__CODE_BLOCK_43__"

```