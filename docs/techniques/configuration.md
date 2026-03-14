<!-- 此文件从 content/techniques/configuration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:47:53.650Z -->
<!-- 源文件: content/techniques/configuration.md -->

### 配置

应用程序通常在不同的 **环境** 中运行。根据环境，应该使用不同的配置设置。例如，在本地环境中通常使用特定的数据库凭证，这些凭证只在本地 DB 实例中有效。生产环境将使用另一个数据库凭证。由于配置变量会改变，最佳实践是 __LINK_248__ 在环境中。

外部定义的环境变量在 Node.js 中通过 `import {{ '{' }} CreateUserDto {{ '}' }}` 全局变量可见。我们可以尝试通过在每个环境中单独设置环境变量来解决多个环境的问题。这将快速变得难以管理，特别是在开发和测试环境中，这些值需要轻松地模拟和/或更改。

在 Node.js 应用程序中，使用 `import type {{ '{' }} CreateUserDto {{ '}' }}` 文件来表示每个环境是很常见的。这些文件包含键值对，其中每个键代表一个特定的值。在不同的环境中运行应用程序只是需要将正确的 `CreateUserDto` 文件切换。

使用 Nest 时，创建一个 `class-validator`，该模块 expose 一个 `CreateUserDto`，用来加载适当的 `email` 文件。虽然您可能会选择自己编写这样的模块，但为了方便，Nest 提供了 `400 Bad Request` 包括在当前章节中。

#### 安装

开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save class-validator class-transformer

```

> info **提示** `ValidationPipe` 包含 __LINK_249__。

> warning **注意** `:id` 需要 TypeScript 4.1 或更高版本。

#### 开始使用

安装过程完成后，我们可以导入 `FindOneParams`。通常，我们将其导入到根 `class-validator` 中，并使用 `ValidationPipe` 静态方法来控制其行为。在这个步骤中，环境变量的键值对将被解析和 resolved。稍后，我们将看到访问 `ValidationPipe` 类的 `email` 在其他功能模块中的多种选项。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

```

上面的代码将从默认位置（项目根目录）加载和解析 `password` 文件，合并 `age` 文件中的键值对与环境变量 `whitelist` 的值，并将结果存储在一个私有结构中，可以通过 `true` 访问。`forbidNonWhitelisted` 方法注册 `true` 提供程序，该提供程序提供一个 `whitelist` 方法来读取这些解析/合并的配置变量。由于 `true` 依赖 __LINK_250__，它使用该包的规则来解决环境变量名称冲突。在环境变量（例如，通过 OS shell exports like `ValidationPipe`）和 `transform` 文件中存在同名键时，环境变量将优先于 `transform` 文件。

一个示例 `true` 文件如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

如果您需要在 `ValidationPipe` 加载和 Nest 应用程序启动之前，某些环境变量可用（例如，传递微服务配置到 `findOne()` 方法），可以使用 Nest CLI 的 `id` 选项。这选项允许您指定要加载的 `string` 文件的路径。`id` 标志支持的介绍可以在 __LINK_251__ 中找到。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}

```

#### 自定义 env 文件路径

默认情况下，包将在应用程序的根目录中查找 `number` 文件。要指定其他路径的 `ValidationPipe` 文件，可以设置 `ValidationPipe` 属性的可选 options 对象中的 `ParseIntPipe`，如下所示：

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

如果一个变量在多个文件中找到，第一个文件将优先。

#### 禁用 env 变量加载

如果您不想加载 `ParseStringPipe` 文件，而是想简单地访问环境变量（例如，通过 OS shell exports like `string`），可以设置 options 对象的 `ParseIntPipe` 属性为 `ParseBoolPipe`，如下所示：

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}

```

#### 使用模块全局

当您想要在其他模块中使用 `@nestjs/common` 时，您需要导入它（与任何 Nest 模块一样）。或者，您可以将其声明为 __LINK_252__，设置 options 对象的 `@nestjs/swagger` 属性为 `@nestjs/graphql`，如下所示。在这种情况下，您不需要在其他模块中导入 `@nestjs/mapped-types`，因为它已经在根模块（例如 `@nestjs/swagger`）中加载。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}

```

#### 自定义配置文件Here is the translation of the English technical documentation to Chinese:

对于复杂的项目，您可能需要使用自定义的配置文件来返回嵌套的配置对象。这允许您根据函数分组相关的配置设置，并将相关设置存储在单独的文件中以便独立管理。

自定义配置文件导出一个工厂函数，该函数返回一个配置对象。配置对象可以是任意嵌套的平常 JavaScript 对象。`@nestjs/graphql`对象将包含完全解析的环境变量键/值对（与`PartialType()`文件和外部定义的变量解析和合并如上所述）。由于您控制返回的配置对象，可以添加任何必要的逻辑来将值转换为适当的类型、设置默认值等。例如：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);

```

我们使用`PartialType()`options对象中的`PartialType()`方法来加载该文件：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);

```

> info **注意** `CreateCatDto`属性的值是一个数组，这允许您加载多个配置文件（例如`PartialType()`）。

使用自定义配置文件，我们也可以管理自定义文件，如 YAML 文件。以下是一个使用 YAML 格式的配置示例：

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

要读取和解析 YAML 文件，我们可以使用`@nestjs/mapped-types`包。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);

```

安装包后，我们使用`PickType()`函数来加载刚刚创建的 YAML 文件。

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}

```

> warning **注意** Nest CLI 不会自动将您的“资产”（非 TS 文件）复制到`PickType()`文件夹中。在构建过程中，您需要在`@nestjs/mapped-types`文件中的`PickType()`对象中指定该文件夹。例如，如果`OmitType()`文件夹与`name`文件夹在同一级别，可以添加`OmitType`属性，并将其值设置为`OmitType()`。了解更多信息__LINK_253__。

需要注意的是，配置文件不自动验证，即使您使用了NestJS的`IntersectionType()`选项。如果您需要验证或要应用任何转换，可以在工厂函数中处理该配置对象。这样您可以在该配置对象中实现任何自定义验证逻辑。

例如，如果您想确保端口在某个范围内，可以在工厂函数中添加验证步骤：

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

#### 使用`IntersectionType()`

要访问我们的`@nestjs/mapped-types`中的配置值，我们首先需要注入`CreateCatDto`。与任何提供者一样，我们需要将其包含模块 - `name` - 导入将使用它的模块（除非您在 options 对象中设置了`ValidationPipe`属性并将其值设置为`ParseArrayPipe`）。将其导入到特征模块中，如下所示。

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

> info **提示** `ParseArrayPipe`来自`findByIds()`包。

并在我们的类中使用它：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

如上所示，使用`GET`方法获取简单的环境变量，传递变量名称。您可以使用 TypeScript 类型提示，例如`ValidationPipe`。`class-validator`方法也可以遍历自定义配置对象（使用<code>Custom configuration file</code>创建的），如上所示。

您也可以使用接口作为类型提示获取整个自定义配置对象：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}

```

__INLINE_CODE_118__方法也具有两个可选的泛型（类型参数）。第一个是帮助防止访问不存在的配置属性。使用它，如下所示：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}

```

__INLINE_CODE_119__属性设置为__INLINE_CODE_120__，__INLINE_CODE_121__方法将自动推断属性类型基于接口，因此例如__INLINE_CODE_122__（如果您不使用__INLINE_CODE_123__标志从 TypeScript）因为__INLINE_CODE_124__在__INLINE_CODE_126__接口中具有__INLINE_CODE_125__类型。

此外，使用__INLINE_CODE_127__特性，您可以推断自定义配置对象的嵌套属性的类型，即使使用点符号，如下所示：

```typescript
export class CreateCatDto {
  name: string;
  breed: string;
}

export class AdditionalCatInfo {
  color: string;
}

```

Note: I followed the provided glossary and translation requirements to ensure the accuracy and consistency of the translation.Here is the translation of the provided English technical documentation to Chinese:

第二个泛型依赖于第一个，作为type assertion来消除__INLINE_CODE_128__类型的所有__INLINE_CODE_129__方法可以返回的值，當__INLINE_CODE_130__为on时。例如：

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}

```

> 提示 **Hint** 要确保__INLINE_CODE_131__方法仅从自定义配置文件中检索值，而忽略__INLINE_CODE_132__变量，设置__INLINE_CODE_133__选项为__INLINE_CODE_134__在__INLINE_CODE_135__的__INLINE_CODE_136__方法的options对象中。

#### 配置命名空间

__INLINE_CODE_137__允许你定义和加载多个自定义配置文件，如上所示。您可以管理复杂的配置对象层次结构，使用嵌套配置对象，如该部分所示。或者，您可以使用__INLINE_CODE_138__函数返回一个命名空间配置对象：

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}

```

与自定义配置文件一样，在您的__INLINE_CODE_139__工厂函数中，__INLINE_CODE_140__对象将包含完全解析的环境变量键值对（与__INLINE_CODE_141__文件和外部定义的变量解析和合并，如上所述）。

> 提示 **Hint** __INLINE_CODE_142__函数来自__INLINE_CODE_143__包。

使用__INLINE_CODE_144__ property of __INLINE_CODE_145__ method's options object加载命名空间配置，同样加载自定义配置文件：

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}

```

现在，可以使用点 notation从__INLINE_CODE_146__命名空间中获取__INLINE_CODE_147__值。使用__INLINE_CODE_148__作为前缀，对应于命名空间名称（作为__INLINE_CODE_149__函数的第一个参数）：

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}

```

一个合理的替代方案是注入__INLINE_CODE_150__命名空间。这样可以 Benefit from strong typing：

```typescript
@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}

```

> 提示 **Hint** __INLINE_CODE_151__来自__INLINE_CODE_152__包。

#### 模块中的命名空间配置

要将命名空间配置作为另一个模块在应用程序中的配置对象，可以使用__INLINE_CODE_153__ method of the configuration object。该方法将您的命名空间配置转换为 Provider，然后可以将其传递给模块的__INLINE_CODE_154__（或等效方法）：

```bash
GET /?ids=1,2,3

```

要了解__INLINE_CODE_155__ method的工作原理，让我们检查返回值：

__CODE_BLOCK_27__

这结构允许您轻松将命名空间配置集成到模块中，使您的应用程序保持组织和模块化，避免编写 boilerplate、重复的代码。

#### 缓存环境变量

访问__INLINE_CODE_156__可能很慢，您可以将__INLINE_CODE_157__ options object的__INLINE_CODE_158__ property设置为提高__INLINE_CODE_159__ method对__INLINE_CODE_160__变量的性能：

__CODE_BLOCK_28__

#### 部分注册

到目前为止，我们已经处理了根模块中的配置文件（例如__INLINE_CODE_161__），使用__INLINE_CODE_162__ method。也许您有一个更复杂的项目结构，具有特定功能的配置文件Located in multiple different directories。而不是在根模块中加载所有这些文件，__INLINE_CODE_163__包提供了一个功能称为**partial registration**，只引用每个功能模块关联的配置文件。使用__INLINE_CODE_164__ static method在功能模块中执行此partial registration，如下所示：

__CODE_BLOCK_29__

> 警告 **Warning** 在某些情况下，您可能需要使用__INLINE_CODE_165__ hook访问通过partial registration加载的属性，而不是在构造函数中。这是因为__INLINE_CODE_166__ method在模块初始化时运行，而模块初始化的顺序是不可预测的。 如果您在构造函数中访问这些值，可能会导致配置依赖的模块尚未初始化。如果您访问这些值，可以使用__INLINE_CODE_167__ method，因为该方法在所有依赖模块已初始化后运行。

#### 模式验证

标准做法是在应用程序启动时，如果必需的环境变量未提供或不满足某些验证规则，抛出异常。__INLINE_CODE_168__包启用了两个不同的方式来实现：

- __LINK_254__内置验证器。使用 Joi，您定义一个对象模式并将 JavaScript 对象验证为其。
- 自定义__INLINE_CODE_169__函数，输入环境变量。

要使用 Joi，我们需要安装 Joi 包：

__CODE_BLOCK_30__以下是翻译后的中文技术文档：

现在，我们可以定义一个 Joi 校验模式并将其通过 __INLINE_CODE_170__ 属性传递给 __INLINE_CODE_171__ 方法的选项对象，正如以下所示：

__CODE_BLOCK_31__

默认情况下，所有模式键都是可选的。在这里，我们为 __INLINE_CODE_172__ 和 __INLINE_CODE_173__ 设置默认值，这些值将在我们不提供这些变量时使用（ __INLINE_CODE_174__ 文件或进程环境变量）。alternatively，我们可以使用 __INLINE_CODE_175__ 校验方法来要求变量在环境变量（__INLINE_CODE_176__ 文件或进程环境变量）中定义。在这种情况下，验证步骤将在我们不提供变量时抛出异常。请参阅 __LINK_255__以了解如何构建验证模式。

默认情况下，未知环境变量（环境变量的键不在模式中）被允许且不会触发验证异常。默认情况下，所有验证错误都将报告。您可以通过将 __INLINE_CODE_177__ 键的值设置为 __INLINE_CODE_178__ 选项对象中的 options 对象来更改这些行为。这 个 options 对象可以包含标准验证选项属性（__LINK_256__），例如要反转上述设置，请使用以下设置：

__CODE_BLOCK_32__

__INLINE_CODE_179__ 包含默认设置：

- __INLINE_CODE_180__: 控制是否允许未知键在环境变量中。默认是 __INLINE_CODE_181__
- __INLINE_CODE_182__:如果 true，停止验证在第一个错误时；如果 false，返回所有错误。默认是 __INLINE_CODE_183__

请注意，一旦您决定传递 __INLINE_CODE_184__ 对象，任何未明确传递的设置将默认使用 __INLINE_CODE_185__ 标准默认值（而不是 __INLINE_CODE_186__ 默认值）。例如，如果您在自定义 __INLINE_CODE_188__ 对象中留空 __INLINE_CODE_187__，它将具有 __INLINE_CODE_189__ 默认值 __INLINE_CODE_190__。因此，在您的自定义对象中，建议同时指定这两个设置。

> info **提示**要禁用预定义环境变量的验证，请将 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_192__ 在 __INLINE_CODE_193__ 方法的选项对象中。预定义环境变量是进程变量（__INLINE_CODE_194__ 变量），这些变量是在模块被导入之前设置的。例如，如果您以 __INLINE_CODE_195__ 启动应用程序，那么 __INLINE_CODE_196__ 是一个预定义环境变量。

#### 自定义 validate 函数

或者，您可以指定一个同步 __INLINE_CODE_197__ 函数，该函数接收一个包含环境变量的对象（来自 env 文件和进程），并返回一个包含验证环境变量的对象，以便在需要时将它们转换或 mutate。如果函数抛出错误，它将防止应用程序启动。

在这个示例中，我们将使用 __INLINE_CODE_198__ 和 __INLINE_CODE_199__ 包。首先，我们需要定义：

- 一类具有验证约束的对象，
- 一个 validate 函数，它使用 __INLINE_CODE_200__ 和 __INLINE_CODE_201__ 函数。

__CODE_BLOCK_33__

现在，我们可以使用 __INLINE_CODE_202__ 函数作为 __INLINE_CODE_203__ 配置选项，例如：

__CODE_BLOCK_34__

#### 自定义 getter 函数

__INLINE_CODE_204__ 定义了一个通用的 __INLINE_CODE_205__ 方法来检索配置值。我们还可以添加 __INLINE_CODE_206__ 函数以启用更自然的编码样式：

__CODE_BLOCK_35__

现在，我们可以使用 getter 函数如下所示：

__CODE_BLOCK_36__

#### 环境变量加载 hook

如果模块配置依赖于环境变量，并且这些变量来自 __INLINE_CODE_207__ 文件，您可以使用 __INLINE_CODE_208__ 钩子来确保在与 __INLINE_CODE_209__ 对象交互之前文件已加载，例如：

__CODE_BLOCK_37__

这项构建确保了 __INLINE_CODE_210__ Promise 解决后，所有配置变量都已加载。

#### 条件模块配置

在某些情况下，您可能想根据 env 变量来条件加载模块。幸运的是，__INLINE_CODE_211__ 提供了一个 __INLINE_CODE_212__，允许您这样做。

__CODE_BLOCK_38__

上述模块将仅在 __INLINE_CODE_213__ 文件中没有 __INLINE_CODE_215__ 值时加载 __INLINE_CODE_216__。您也可以传递自定义条件，一个函数接收 __INLINE_CODE_217__引用，应该返回一个布尔值以便 __INLINE_CODE_218__ 处理：

__CODE_BLOCK_39__

Note: The translation is based on the provided glossary and follows the guidelines for translating technical documentation.Here is the translation of the English technical documentation to Chinese:

使用__INLINE_CODE_219__时，需要确保同时加载了__INLINE_CODE_220__，以便在应用程序中正确引用和使用__INLINE_CODE_221__钩子。如果在 5 秒内或用户在__INLINE_CODE_222__方法的第三个参数中设置的超时毫秒数内未将钩子_flip_to_true_，那么__INLINE_CODE_223__将抛出错误并中止应用程序的启动。

#### 可扩展变量

__INLINE_CODE_224__ 包含环境变量扩展功能。通过这种技术，您可以创建嵌套环境变量，其中一个变量在另一个变量的定义中被引用。例如：

__CODE_BLOCK_40__

在这种构造中，变量__INLINE_CODE_225__将被解析为__INLINE_CODE_226__。请注意，在__INLINE_CODE_229__变量的定义中使用__INLINE_CODE_227__语法来触发变量__INLINE_CODE_228__的值的解析。

> info **Hint** 为了实现这个功能，__INLINE_CODE_230__包使用了__LINK_257__。

使用环境变量扩展功能，使用__INLINE_CODE_231__属性在__INLINE_CODE_233__方法的选项对象中，例如下所示：

__CODE_BLOCK_41__

#### 在__INLINE_CODE_234__中使用

虽然我们的配置存储在服务中，但是仍然可以在__INLINE_CODE_235__文件中使用它。这样，您可以使用它来存储应用程序端口或 CORS 主机。

要访问它，您需要使用__INLINE_CODE_236__方法，后跟服务引用：

__CODE_BLOCK_42__

然后，您可以像正常一样使用它，通过调用__INLINE_CODE_237__方法来获取配置键：

__CODE_BLOCK_43__