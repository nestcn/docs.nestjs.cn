### 管道

管道是一个用 `@Injectable()` 装饰器注解的类，它实现了 `PipeTransform` 接口。

![](/assets/Pipe_1.png)

管道有两种典型用例：

- **转换** ：将输入数据转换为所需形式（例如从字符串转换为整数）
- **验证** ：评估输入数据，若有效则原样传递；否则抛出异常

在这两种情况下，管道都对[控制器路由处理器](controllers#route-parameters)正在处理的`参数`进行操作。Nest 在方法调用前插入管道，管道接收目标方法的参数并对其进行操作。任何转换或验证操作都在此时进行，之后路由处理器将使用（可能已被转换的）参数被调用。

Nest 内置了多种开箱即用的管道。您也可以构建自定义管道。本章将介绍内置管道及其与路由处理器的绑定方式，随后通过几个自定义管道示例展示如何从零开始构建管道。

> info **提示** 管道在异常区域内运行。这意味着当管道抛出异常时，该异常将由异常层处理（全局异常过滤器以及应用于当前上下文的任何[异常过滤器](/exception-filters) ）。鉴于上述情况，应当明确的是：当管道中抛出异常时，后续不会执行任何控制器方法。这为你在系统边界验证来自外部源输入应用程序的数据提供了一种最佳实践技术。

#### 内置管道

Nest 内置提供了多个开箱即用的管道：

- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`
- `ParseFilePipe`
- `ParseDatePipe`

它们从 `@nestjs/common` 包中导出。

让我们快速了解一下如何使用 `ParseIntPipe`。这是一个**转换**用例的示例，该管道确保方法处理程序的参数被转换为 JavaScript 整数（如果转换失败则抛出异常）。本章稍后部分，我们将展示一个简单的 `ParseIntPipe` 自定义实现。下面的示例技术同样适用于其他内置转换管道（`ParseBoolPipe`、`ParseFloatPipe`、`ParseEnumPipe`、`ParseArrayPipe`、`ParseDatePipe` 和 `ParseUUIDPipe`，本章中我们将统称它们为 `Parse*` 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 `ParseIntPipe` 示例中，我们希望将管道与特定的路由处理方法关联，并确保其在方法调用前运行。我们通过以下构造来实现这一点，这被称为在方法参数级别绑定管道：

```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

这确保以下两个条件之一成立：要么我们在 `findOne()` 方法中接收到的参数是一个数字（正如我们对 `this.catsService.findOne()` 的调用所期望的），要么在路由处理器被调用前就会抛出异常。

例如，假设路由被这样调用：

```bash
GET localhost:3000/abc
```

Nest 将抛出如下异常：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

该异常将阻止 `findOne()` 方法体的执行。

在上面的示例中，我们传递了一个类（`ParseIntPipe`）而非实例，将实例化的责任交给框架并启用依赖注入。与管道和守卫类似，我们也可以直接传递一个内联实例。当需要通过传递选项来自定义内置管道行为时，传递内联实例非常有用：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}
```

其他转换管道（所有 **Parse\*** 管道）的绑定方式类似。这些管道都工作在验证路由参数、查询字符串参数和请求体值的上下文中。

以查询字符串参数为例：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

这里有一个使用 `ParseUUIDPipe` 解析字符串参数并验证其是否为 UUID 的示例。

```typescript
@@filename()
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}
```

> info **注意** 使用 `ParseUUIDPipe()` 时会解析版本 3、4 或 5 的 UUID，若只需特定版本的 UUID，可在管道选项中传入版本号。

上文我们已了解如何绑定各类内置的 `Parse*` 解析管道。绑定验证管道略有不同，我们将在下一节详细讨论。

> info **注意** 另请参阅[验证技术](/techniques/validation)章节获取验证管道的详细示例。

#### 自定义管道

如前所述，您可以构建自己的自定义管道。虽然 Nest 提供了强大的内置管道 `ParseIntPipe` 和 `ValidationPipe`，但让我们从头开始构建每个管道的简单自定义版本，看看如何构造自定义管道。

我们从简单的 `ValidationPipe` 开始。最初，我们让它简单地接收一个输入值并立即返回相同的值，表现得像一个恒等函数。

```typescript
@@filename(validation.pipe)
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```

> info **提示**`PipeTransform<T, R>` 是一个必须由所有管道实现的泛型接口。该泛型接口使用 `T` 表示输入 `value` 的类型，`R` 表示 `transform()` 方法的返回类型。

每个管道都必须实现 `transform()` 方法来满足 `PipeTransform` 接口契约。该方法有两个参数：

- `value`
- `metadata`

`value` 参数表示当前正在处理的方法参数（在被路由处理方法接收之前），而 `metadata` 则是该参数的元数据。元数据对象具有以下属性：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

这些属性描述了当前正在处理的参数。

<table data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb"><tbody data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb"><tr data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb"><td data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb">type</td><td data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb" data-immersive-translate-paragraph="1">表示该参数是否为请求体 @Body()，查询 @Query() 参数 @Param() 或自定义参数（了解更多 此处 ）。</td></tr><tr data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb"><td data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb">metatype</td><td data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb" data-immersive-translate-paragraph="1">提供参数的元类型，例如 String。注意：该值为 undefined，如果您在路由处理方法签名中省略类型声明，或使用原生 JavaScript。</td></tr><tr data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb"><td data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb">data</td><td data-immersive-translate-walked="9ddb9d37-5914-46bd-bca0-b9c0e7bd66eb" data-immersive-translate-paragraph="1">传递给装饰器的字符串，例如 @Body('string')。它是 如果装饰器括号留空，undefined 将被返回。</td></tr></tbody></table>

> **警告** TypeScript 接口在转译过程中会被移除。因此，如果方法参数的类型声明为接口而非类，`metatype` 的值将会是 `Object`。

#### 基于模式的验证

让我们使验证管道更加实用。仔细观察 `CatsController` 中的 `create()` 方法，我们可能希望在尝试运行服务方法之前确保 post 请求体对象是有效的。

```typescript
@@filename()
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

让我们重点关注 `createCatDto` 这个 body 参数。它的类型是 `CreateCatDto`：

```typescript
@@filename(create-cat.dto)
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

我们需要确保所有传入 create 方法的请求都包含有效的 body 内容。因此必须验证 `createCatDto` 对象的三个成员。虽然可以在路由处理方法内部进行验证，但这样做并不理想，因为它违反了**单一职责原则** (SRP)。

另一种方法是创建一个**验证器类**并将验证任务委托给它。这种方式的缺点是我们必须记住在每个方法开始时调用这个验证器。

那么创建验证中间件如何？这确实可行，但遗憾的是无法创建能在整个应用程序所有上下文中通用的**通用中间件** 。这是因为中间件并不了解**执行上下文** ，包括将被调用的处理程序及其任何参数。

这正是管道设计的典型应用场景。让我们继续完善我们的验证管道。

#### 对象模式验证

有几种方法可以以干净且 [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) 的方式实现对象验证。一种常见方法是使用**基于模式**的验证。让我们尝试采用这种方法。

[Zod](https://zod.dev/) 库允许您以直观的方式创建模式，并提供易读的 API。让我们构建一个利用 Zod 模式进行验证的管道。

首先安装所需包：

```bash
$ npm install --save zod
```

在下面的代码示例中，我们创建了一个简单的类，它以`构造函数`参数的形式接收一个模式。然后我们应用 `schema.parse()` 方法，该方法会根据提供的模式验证传入的参数。

如前所述， **验证管道**要么原样返回值，要么抛出异常。

在下一节中，您将看到如何使用 `@UsePipes()` 装饰器为给定控制器方法提供适当的模式。这样做使我们的验证管道可跨上下文重用，正如我们最初设定的目标。

```typescript
@@filename()
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema  } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
```

#### 绑定验证管道

之前，我们已经了解了如何绑定转换管道（如 `ParseIntPipe` 和其他 `Parse*` 管道）。

绑定验证管道同样非常简单。

在这种情况下，我们需要在方法调用级别绑定管道。在当前示例中，要使用 `ZodValidationPipe` 需要执行以下操作：

1.  创建 `ZodValidationPipe` 的实例
2.  在管道的类构造函数中传入上下文特定的 Zod 模式
3.  将管道绑定到方法

Zod 模式示例：

```typescript
import { z } from 'zod';

export const createCatSchema = z
  .object({
    name: z.string(),
    age: z.number(),
    breed: z.string(),
  })
  .required();

export type CreateCatDto = z.infer<typeof createCatSchema>;
```

我们通过使用如下所示的 `@UsePipes()` 装饰器来实现：

```typescript
@@filename(cats.controller)
@Post()
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **提示** `@UsePipes()` 装饰器需要从 `@nestjs/common` 包中导入。

> warning **注意** `zod` 库要求在你的 `tsconfig.json` 文件中启用 `strictNullChecks` 配置。

#### 类验证器

> warning **警告** 本节中的技术需要使用 TypeScript，如果你的应用使用原生 JavaScript 编写则无法使用。

让我们来看另一种验证技术的实现方案。

Nest 与 [class-validator](https://github.com/typestack/class-validator) 库能很好地协同工作。这个强大的库允许你使用基于装饰器的验证。基于装饰器的验证功能极其强大，特别是与 Nest 的**管道**功能结合使用时，因为我们可以访问被处理属性的 `metatype`。在开始之前，我们需要先安装必要的包：

```bash
$ npm i --save class-validator class-transformer
```

安装完成后，我们就可以给 `CreateCatDto` 类添加一些装饰器了。这里我们可以看到这项技术的一个显著优势：`CreateCatDto` 类仍然是 Post 请求体对象的唯一真实来源（而不需要创建单独的验证类）。

```typescript
@@filename(create-cat.dto)
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

> info **提示** 了解更多关于 class-validator 装饰器的信息，请点击[此处](https://github.com/typestack/class-validator#usage) 。

现在我们可以创建一个使用这些注解的 `ValidationPipe` 类。

```typescript
@@filename(validation.pipe)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

> info **提示** 需要提醒的是，您不必自己构建通用验证管道，因为 Nest 已经内置提供了 `ValidationPipe`。内置的 `ValidationPipe` 比本章构建的示例提供了更多选项，本章示例保持基础性是为了说明自定义管道的机制。您可以[在此处](/techniques/validation)找到完整细节及大量示例。

> warning **注意** 我们上面使用了 [class-transformer](https://github.com/typestack/class-transformer) 库，它与 **class-validator** 库由同一作者开发，因此它们能完美协同工作。

让我们来看这段代码。首先注意 `transform()` 方法被标记为 `async`，这是因为 Nest 同时支持同步和**异步**管道。我们将这个方法设为 `async` 是因为某些 class-validator 验证[可能是异步的](https://github.com/typestack/class-validator#custom-validation-classes) （使用了 Promise）。

接着注意我们使用解构赋值从 `ArgumentMetadata` 中提取 metatype 字段（仅提取这个成员）到 `metatype` 参数。这相当于获取完整的 `ArgumentMetadata` 后再用额外语句给 metatype 变量赋值的简写形式。

然后注意辅助函数 `toValidate()`，它负责在当前处理的参数是原生 JavaScript 类型时跳过验证步骤（这些类型无法附加验证装饰器，因此没有必要让它们通过验证步骤）。

接下来，我们使用类转换器函数 `plainToInstance()` 将普通的 JavaScript 参数对象转换为类型化对象，以便进行验证。必须这样做的原因是，从网络请求反序列化传入的 post body 对象**不包含任何类型信息** （这是底层平台如 Express 的工作机制）。类验证器需要使用我们之前为 DTO 定义的验证装饰器，因此需要执行此转换，将传入的 body 视为经过适当装饰的对象，而非普通对象。

最后，如前所述，由于这是一个**验证管道** ，它要么返回未更改的值，要么抛出异常。

最后一步是绑定 `ValidationPipe`。管道可以作用于参数范围、方法范围、控制器范围或全局范围。之前在使用基于 Zod 的验证管道时，我们看到了在方法级别绑定管道的示例。在下面的示例中，我们将把管道实例绑定到路由处理器的 `@Body()` 装饰器上，这样就会调用我们的管道来验证 post body。

```typescript
@@filename(cats.controller)
@Post()
async create(
  @Body(new ValidationPipe()) createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

参数作用域的管道适用于验证逻辑仅涉及特定参数的情况。

#### 全局作用域管道

由于 `ValidationPipe` 被设计为尽可能通用，我们可以通过将其设置为**全局作用域**管道来充分发挥其效用，这样它就会应用到整个应用程序的每个路由处理器上。

```typescript
@@filename(main)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

warning **注意** 对于[混合应用](faq/hybrid-application) ，`useGlobalPipes()` 方法不会为网关和微服务设置管道。而对于"标准"(非混合)微服务应用，`useGlobalPipes()` 确实会全局挂载管道。

全局管道可用于整个应用程序中的每个控制器和每个路由处理器。

请注意，在依赖注入方面，从任何模块外部注册的全局管道（如上例中使用 `useGlobalPipes()`）无法注入依赖项，因为绑定是在任何模块上下文之外完成的。为解决此问题，您可以使用以下构造**直接从任何模块**设置全局管道：

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

> info **提示** 当使用这种方法为管道执行依赖注入时，请注意无论该构造应用于哪个模块，该管道实际上都是全局的。应该在何处进行此操作？选择定义管道（上例中的 `ValidationPipe`）的模块。此外，`useClass` 并非处理自定义提供程序注册的唯一方式。了解更多[此处](/fundamentals/custom-providers) 。

#### 内置的 ValidationPipe

提醒一下，您无需自行构建通用验证管道，因为 Nest 已内置提供了 `ValidationPipe`。这个内置的 `ValidationPipe` 比本章构建的示例提供了更多选项，我们保持示例基础性是为了演示自定义管道的机制。完整细节及大量示例可[在此查看](/techniques/validation) 。

#### 转换用例

验证并非自定义管道的唯一用途。本章开头提到，管道还能将输入数据**转换**为所需格式。之所以能实现，是因为从 `transform` 函数返回的值会完全覆盖参数的先前值。

什么时候这会有用？考虑有时从客户端传来的数据需要经过一些转换——例如将字符串转为整数——才能被路由处理方法正确处理。此外，某些必填字段可能缺失，而我们希望应用默认值。 **转换管道**通过在客户端请求和请求处理器之间插入处理函数来实现这些功能。

这里有一个简单的 `ParseIntPipe`，负责将字符串解析为整数值。（如前所述，Nest 框架内置了一个更复杂的 `ParseIntPipe`；我们在此展示这个自定义转换管道的简单示例）。

```typescript
@@filename(parse-int.pipe)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

然后我们可以将这个管道绑定到指定参数，如下所示：

```typescript
@@filename()
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return this.catsService.findOne(id);
}
```

另一个有用的转换场景是从数据库中选择一个**已存在的用户**实体，使用请求中提供的 ID：

```typescript
@@filename()
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}
```

我们将这个管道的实现留给读者，但要注意的是，与所有其他转换管道一样，它接收一个输入值（一个 `id`）并返回一个输出值（一个 `UserEntity` 对象）。通过将样板代码从处理程序中抽象出来并放入公共管道，可以使您的代码更具声明性且 [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)（避免重复）。

#### 提供默认值

`Parse*` 管道期望参数值已定义。当接收到 `null` 或 `undefined` 值时，它们会抛出异常。为了让端点能够处理缺失的查询字符串参数值，我们必须在 `Parse*` 管道对这些值进行操作之前提供一个默认值进行注入。`DefaultValuePipe` 正是为此目的而设计。只需在相关的 `Parse*` 管道之前，在 `@Query()` 装饰器中实例化一个 `DefaultValuePipe`，如下所示：

```typescript
@@filename()
@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}
```
