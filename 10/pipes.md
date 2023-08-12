# 管道

管道是具有 `@Injectable()` 装饰器的类。管道应实现 `PipeTransform` 接口。

![](https://docs.nestjs.com/assets/Pipe_1.png)

管道有两个典型的应用场景:

- **转换**：管道将输入数据转换为所需的数据输出(例如，将字符串转换为整数)
- **验证**：对输入数据进行验证，如果验证成功继续传递; 验证失败则抛出异常

在这两种情况下, 管道 `参数(arguments)` 会由 [控制器(controllers)的路由处理程序](/8/controllers?id=路由参数) 进行处理。Nest 会在调用这个方法之前插入一个管道，管道会先拦截方法的调用参数,进行转换或是验证处理，然后用转换好或是验证好的参数调用原方法。

Nest自带很多开箱即用的内置管道。你还可以构建自定义管道。本章将介绍先内置管道以及如何将其绑定到路由处理程序(route handlers)上，然后查看一些自定义管道以展示如何从头开始构建自定义管道。

?> 管道在异常区域内运行。这意味着当抛出异常时，它们由核心异常处理程序和应用于当前上下文的 [异常过滤器](/8/exceptionfilters) 处理。当在 Pipe 中发生异常，controller 不会继续执行任何方法。这提供了用于在系统边界验证从外部源进入应用程序的数据的一种最佳实践。

## 内置管道

`Nest` 自带九个开箱即用的管道，即 

- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`
- `ParseFilePipe`


他们从 `@nestjs/common` 包中导出。

我们先来快速看看如何使用`ParseIntPipe`。这是一个**转换**的应用场景，管道确保传给路由处理程序的参数是一个整数(若转换失败，则抛出异常)。在本章后面，我们将展示 `ParseIntPipe` 的简单自定义实现。下面的示例写法也适用于其他内置转换管道（`ParseBoolPipe`、`ParseFloatPipe`、`ParseEnumPipe`、`ParseArrayPipe` 和 `ParseUUIDPipe`，我们在本章中将其称为 `Parse*` 管道）。

## 绑定管道

为了使用管道，我们需要将一个管道类的实例绑定到合适的情境。在我们的 `ParseIntPipe` 示例中，我们希望将管道与特定的路由处理程序方法相关联，并确保它在该方法被调用之前运行。我们使用以下构造来实现，并其称为在方法参数级别绑定管道:

```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

这确保了我们在 `findOne()` 方法中接收的参数是一个数字(与 `this.catsService.findOne()` 方法的诉求一致)，或者在路由处理程序被调用之前抛出异常。

举个例子，假设路由是这样子的
```
GET localhost:3000/abc
```

Nest将会抛出这样的异常:

```
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

这个异常阻止了 `findOne()` 方法的执行。

在上述例子中，我们传递了一个类(`ParseIntPipe`)，而不是一个实例，将实例化留给框架去处理，做到了依赖注入。对于管道和守卫，我们也可以选择传递一个实例。如果我们想通过传递选项来自定义内置管道的行为，传递实例很有用：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}

```

绑定其他转换管道(即所有 `Parse*` 管道)的方法类似。这些管道都在验证路由参数、查询字符串参数和请求体正文值的情境中工作。

验证查询字符串参数的例子：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

使用 `ParseUUIDPipe` 解析字符串并验证是否为UUID的例子

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}
```

?> 当使用 `ParseUUIDPipe()` 时，将解析版本3、版本4或版本5的UUID，如果你只需要特定版本的UUID，你可以在管道选项中传递版本。

上文我们看到的例子都是绑定不同的 `Parse*` 系列内置管道。绑定验证管道有一些不同；我们将在后续篇章讨论。

?> 此外，可前往[验证技术](https://docs.nestjs.cn/10/techniques?id=验证)章节查阅验证管道的大量例子。

## 自定义管道

正如上文所提到的，你可以构建自定义管道。虽然 Nest 提供了强大的内置 `ParseIntPipe` 和 `ValidationPipe`，但让我们从头开始构建它们的简单自定义版本，以了解如何构建自定义管道。

先从一个简单的 `ValidationPipe` 开始。最初，我们让它接受一个输入值并立即返回相同的值。

> validation.pipe.ts

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```

?> `PipeTransform<T, R>` 是每个管道必须要实现的泛型接口。泛型 `T` 表明输入的 `value` 的类型，`R` 表明 `transfrom()` 方法的返回类型

为实现 `PipeTransfrom`，每个管道必须声明 `transfrom()` 方法。该方法有两个参数：

- `value`
- `metadata`

`value` 参数是当前处理的方法参数(在被路由处理程序方法接收之前)，`metadata` 是当前处理的方法参数的元数据。元数据对象具有以下属性：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

这些属性描述了当前处理的参数。

| 参数     | 描述   |
| -------- | ------------------- |
| `type`     | 告诉我们参数是一个 body `@Body()`，query `@Query()`，param `@Param()` 还是自定义参数 [在这里阅读更多](customdecorators.md)。 |
| `metatype` | 参数的元类型，例如 `String`。 如果在函数签名中省略类型声明，或者使用原生 JavaScript，则为 `undefined`。   |
| `data`   | 传递给装饰器的字符串，例如 `@Body('string')`。如果您将括号留空，则为 `undefined`。      |

!> TypeScript 中的 interface 在转译期间会消失。因此，如果方法参数的类型被声明为接口(interface)而不是类(class)，则 `metatype` 将是 `Object`。

## 基于结构的验证

让我们把验证管道变得更有用一点。仔细看看 `CatsController` 的 `create()` 方法，我们希望在该方法被调用之前，请求主体(post body)得到验证。

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

注意到请求体参数为 `createCatDto`，其类型为 `CreateCatDto` :

> create-cat.dto.ts

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

我们希望任何被该方法接收的请求主体都是有效的，因此我们必须验证 `createCatDto` 对象的三个成员。我们可以在路由处理程序方法中执行此操作，但这样做并不理想，因为它会破坏**单一职责原则** (single responsibility rule, SRP)。

另一种做法是创建一个验证类，把验证逻辑放在验证类中。这样做的缺点是我们必须要记得在每个该方法的前面，都调用一次验证类。

那么写一个验证中间件呢？可以，但做不到创建一个能在整个应用程序上下文中使用的**通用中间件**。因为中间件不知道**执行上下文**(execution context)，包括将被调用的处理程序及其任何参数。

管道就是为了处理这种应用场景而设计的。让我们继续完善我们的验证管道。

## 对象结构验证

有几种方法可以实现。一种常见的方式是使用**基于结构**的验证。我们来尝试一下。

[Joi](https://github.com/sideway/joi) 库允许使用可读的 API 以直接的方式创建 schema，让我们构建一个基于 Joi schema 的验证管道。

首先安装依赖：

```bash
$ npm install --save joi
$ npm install --save-dev @types/joi
```

在下面的代码中，我们先创建一个简单的 class，在构造函数中传递 schema 参数。然后我们使用 `schema.validate()` 方法验证参数是否符合提供的 schema。

就像前面说过的，**验证管道**要么返回该值，要么抛出一个错误。

在下一节中，你将看到我们如何使用 `@UsePipes()` 修饰器给指定的控制器方法提供需要的 schema。这么做能让验证管道跨上下文重用，像我们准备做的那样。

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
```

## 绑定验证管道

在之前，我们已经了解如何绑定转换管道(像 `ParseIntPipe` 和其他 `Parse*` 管道)。

绑定验证管道也十分直截了当。

在这种情况下，我们希望在方法调用级别绑定管道。在当前示例中，我们需要执行以下操作使用 `JoiValidationPipe`：

1. 创建一个 `JoiValidationPipe` 实例
2. 传递上下文特定的 Joi schema 给构造函数
3. 绑定到方法

我们用 `@UsePipes()` 装饰器来完成。代码如下:

```typescript
@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

?> 从 `@nestjs/common` 包导入 `@UsePipes()` 装饰器

## 类验证器

!> 本节中的技术需要 `TypeScript` ，如果您的应用是使用原始 `JavaScript`编写的，则这些技术不可用。

让我们看一下验证的另外一种实现方式。

Nest 与 [class-validator](https://github.com/typestack/class-validator) 配合得很好。这个优秀的库允许您使用基于装饰器的验证。装饰器的功能非常强大，尤其是与 Nest 的 **Pipe** 功能相结合使用时，因为我们可以通过访问 `metatype` 信息做很多事情，在开始之前需要安装一些依赖。

```
$ npm i --save class-validator class-transformer
```

安装完成后，我们就可以向 `CreateCatDto` 类添加一些装饰器。在这里，我们看到了这种技术实现的一个显著优势：`CreateCatDto` 类仍然是我们的 Post body 对象的单一可靠来源（而不是必须创建一个单独的验证类）。

> create-cat.dto.ts

```typescript
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

?> 在[此处](https://github.com/typestack/class-validator#usage)了解有关类验证器修饰符的更多信息。

现在我们来创建一个 `ValidationPipe` 类。

> validate.pipe.ts

```typescript
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

?> 上面代码，我们使用了 [class-transformer](https://github.com/typestack/class-transformer) 库。它和 [class-validator](https://github.com/typestack/class-validator) 库由同一个作者开发，所以他们配合的很好。

让我们来看看这个代码。首先你会发现 `transform()` 函数是 `异步` 的, Nest 支持**同步**和**异步**管道。这样做的原因是因为有些 `class-validator` 的验证是[可以异步的](https://github.com/typestack/class-validator#custom-validation-classes)(利用 Promise)

接下来请注意，我们正在使用解构赋值提取 metatype 字段（只从 `ArgumentMetadata` 中提取了该成员）赋值给 `metatype` 参数。这是一个先获取全部 `ArgumentMetadata` 然后用附加语句提取某个变量的简写方式。

下一步，请观察 `toValidate()` 方法。当正在处理的参数是原生 JavaScript 类型时，它负责绕过验证步骤（它们不能附加验证装饰器，因此没有理由通过验证步骤运行它们）。

下一步，我们使用 `class-transformer` 的 `plainToInstance()` 方法将普通的 JavaScript 参数对象转换为可验证的类型对象。必须这样做的原因是传入的 post body 对象在从网络请求反序列化时**不携带任何类型信息**（这是底层平台（例如 Express）的工作方式）。 Class-validator 需要使用我们之前为 DTO 定义的验证装饰器，因此我们需要执行此转换，将传入的主体转换为有装饰器的对象，而不仅仅是普通的对象。

最后，如前所述，这就是一个**验证管道**，它要么返回值不变，要么抛出异常。

最后一步是绑定 `ValidationPipe` 。管道可以是参数范围(parameter-scoped)的、方法范围(method-scoped)的、控制器范围的(controller-scoped)或者全局范围(global-scoped)的。之前，我们已经见到了在方法层面绑定管道的例子，即利用基于 Joi 的验证管道。接下来的例子，我们会将一个管道实例绑定到路由处理程序的 `@Body` 装饰器上，让它能够检验 post body。

> cats.controller.ts

```typescript
@Post()
async create(
  @Body(new ValidationPipe()) createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

当验证逻辑仅涉及一个指定的参数时，参数范围的管道非常有用。

## 全局管道

由于 `ValidationPipe` 被创建为尽可能通用，所以我们将把它设置为一个**全局作用域**的管道，用于整个应用程序中的每个路由处理器。

> main.ts

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

!> 在 [混合应用](/8/faq?id=混合应用)中 `useGlobalPipes()` 方法不会为网关和微服务设置管道, 对于标准(非混合) 微服务应用使用 `useGlobalPipes()` 全局设置管道。

全局管道用于整个应用程序、每个控制器和每个路由处理程序。

就依赖注入而言，从任何模块外部注册的全局管道（即使用了 `useGlobalPipes()`， 如上例所示）无法注入依赖，因为它们不属于任何模块。为了解决这个问题，可以使用以下构造直接为任何模块设置管道：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
```

?> 请注意使用上述方式依赖注入时，请牢记无论哪种模块采用了该结构，管道都是全局的。那么它应该放在哪里呢？答案是选择管道(例如上面例子中的 `ValidationPipe`)被定义的模块。另外，`useClass` 并不是处理自定义提供者注册的唯一方法。在[这里](8/fundamentals?id=custom-providers)了解更多。

## 内置验证管道

提醒一句，您不必自己构建通用验证管道，因为 Nest 提供了开箱即用的 `ValidationPipe`。 内置的 `ValidationPipe` 提供了比我们在本章中构建的示例更多的选项，为了说明定制管道的机制，该示例保持基本状态。您可以在[此处](/8/techniques?id=验证)找到完整的详细信息以及大量示例。

## 转换的应用场景

验证不是管道唯一的用处。在本章的开始部分，我已经提到管道也可以将输入数据**转换**为所需的输出。这是可以的，因为从 `transform` 函数返回的值完全覆盖了参数先前的值。

在什么时候有用？有时从客户端传来的数据需要经过一些修改（例如字符串转化为整数），然后处理函数才能正确的处理。还有种情况，有些数据的必填字段缺失，那么可以使用默认值。**转换管道**被插入在客户端请求和请求处理程序之间用来处理客户端请求。

这是一个简单的 `ParseIntPipe`，负责将字符串转换为整数。（如上所述，Nest 有一个更复杂的内置 `ParseIntPipe`； 这个例子仅作为自定义转换管道的简单示例）

> parse-int.pipe.ts

```typescript
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

如下所示, 我们可以很简单的配置管道来处理所参数 id:

```typescript
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return this.catsService.findOne(id);
}
```

由于上述结构，`ParseIntpipe` 将在请求触发相应的处理程序之前执行。

另一个有用的例子是按 ID 从数据库中选择一个现有的**用户实体**。

```typescript
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}
```

请读者自己实现, 这个管道接收 id 参数并返回 UserEntity 数据, 这样做就可以抽象出一个根据 id 得到 UserEntity 的公共管道, 你的程序变得更符合声明式(Declarative 更好的代码语义和封装方式), 更 DRY (Don't repeat yourself 减少重复代码) 编程规范.

## 提供默认值

`Parse*` 管道期望参数值是被定义的。当接收到 `null` 或者 `undefined` 值时，它们会抛出异常。为了允许端点处理丢失的查询字符串参数值，我们必须在 `Parse*` 管道对这些值进行操作之前注入默认值。`DefaultValuePipe` 提供了这种能力。只需在相关 `Parse*` 管道之前的 `@Query()` 装饰器中实例化 `DefaultValuePipe`，如下所示：

```typescript
@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}
```

### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
| --- | --- | --- | --- |
| [@GODLiangCY](https://github.com/GODLiangCY)  | <img class="avatar-66 rm-style" height="70" src="https://avatars.githubusercontent.com/u/73387709?s=400&u=a18099550a6e3305dea7d9d78823b9d270097d8b&v=4"> | 翻译 | FE.[@GODLiangCY](https://github.com/GODLiangCY) |
