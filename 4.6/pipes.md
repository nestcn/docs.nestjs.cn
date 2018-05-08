# 管道

管道是具有 `@Pipe()` 装饰器的类。管道应实现 `PipeTransform` 接口。

![](https://docs.nestjs.com/assets/Pipe_1.png)

管道将输入数据转换为所需的输出。 另外，它可以处理验证，因为当数据不正确时可能会抛出异常。

!> 提示管道在异常区域内运行。 这意味着当抛出异常时，它们由核心异常处理程序处理，异常过滤器应用于当前上下文。

## 内置管道

`Nest` 自带两个可用的管道，即 `ValidationPipe` 和 `ParseIntPipe`。 他们从 `@nestjs/common` 包中导出。 为了更好地理解它们是如何工作的，我们将从头开始构建它们。

## 它是什么样子的？

我们从 `ValidationPipe` 开始。 pipe 的参数只有一个值，然后需要把整个值返回回去。

> validation.pipe.ts

```typescript
import { PipeTransform, Pipe, ArgumentMetadata } from '@nestjs/common';

@Pipe()
export class ValidationPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```

!> `ValidationPipe` 仅适用于 `TypeScript`。 如果你使用普通的 `JavaScript`，我建议使用 `Joi` 库。

每个管道必须提供 `transform()` 方法。 这个方法有两个参数：
* value
* metadata

`value` 是当前处理的参数，而 `metadata` 是其元数据。 元数据对象包含一些属性：

```typescript
export interface ArgumentMetadata {
    type: 'body' | 'query' | 'param' | 'custom';
    metatype?: new (...args) => any;
    data?: string;
}
```

这里有一些属性描述参数：

|参数    |   描述|
|-----|-----|
|type|告诉我们该属性是一个 `body @Body()`，`query @Query()`，`param @Param()` 还是自定义参数 [在这里阅读更多](https://docs.nestjs.cn/5.0//custom-decorators)。|
|metatype|属性的元类型，例如 `String`。 如果要省略函数签名中的类型声明, 则为 `undefined`。|
|data|传递给装饰器的字符串，例如 `@Body('string')`。 如果您将括号留空，则为 `undefined` 。|

!> `TypeScript `接口在编译期间消失，所以如果你使用接口而不是类，那么元类型的值将是一个 `Object`。
 
## 重点是什么

我们来关注一下 `CatsController` 的 `create()` 方法：

> cats.controler.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

一个 `CreateCatDto` 参数

> create-cat.dto.ts

```typescript
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

此对象始终必须是正确的，所以我们必须验证这三个成员。我们可以在路由处理程序方法中进行，但我们会破坏单个责任规则 (SRP)。第二个想法是创建一个验证程序类并在那里委派任务, 但是我们必须每次在每个方法开始时都使用此验证程序。那么, 验证中间件呢？这是一个好主意, 但不可能创建一个通用的中间件, 可以在整个应用程序中使用。

这是第一个用例，当你应该考虑使用管道。

## 对象 schema 验证

经常遇到的一种方法是使用基于 schema 的验证。 [Joi](https://github.com/hapijs/joi) 库是一个工具它允许您使用可读的 API 以非常简单的方式创建架构。为了创建使用对象架构的管道, 我们需要创建一个以 schema 为构造函数参数的简单类。

```typescript
import * as Joi from 'joi';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = Joi.validate(value, this.schema);
    if (error) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
```
管道绑定非常简单 - 我们需要使用 `@UsePipes()` 装饰器并使用有效的 Joi 模式创建管道实例。

```typescript
@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```


## 类验证器

本节仅适用于 `TypeScript`。

`Nest` 与类验证器一起工作良好，这个惊人的库允许您使用基于装饰器的验证。 由于我们可以访问处理过的属性的元类型，所以基于装饰器的验证对于管道功能是非常强大的。 
但是，在我们开始之前，我们需要安装所需的软件包：

```
npm i --save class-validator class-transformer
```

一旦安装了这些库，我们可以为这个 CreateCatDto 类添加一些装饰器 。


> create-cat.dto.ts

```typescript
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  readonly name: string;

  @IsInt()
  readonly age: number;

  @IsString()
  readonly breed: string;
}
```

完成后，我们可以创建一个 `ValidationPipe` 类。

> validation.pipe.ts

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
```

!> 我已经使用了[类转换器](https://github.com/typestack/class-transformer)库。它是由同一个 author 作为类验证器库，所以他们一起运行得很好。

我们来看看这个代码。首先，请注意 `transform()` 函数是异步的。这是可能的，因为 Nest 支持同步和异步管道。另外，还有一个辅助函数 `toValidate()`。它负责从验证过程中排除原生 `JavaScript` 类型。最后一个重要的是我们必须返回相同的价值。这个管道是一个验证特定的管道，所以我们需要返回完全相同的属性以避免重写（如前所述，管道将输入转换为所需的输出）。

最后一步是设置 `ValidationPipe` 。管道，与异常过滤器相同，它们可以是方法范围的，控制器范围的和全局范围的。另外，管道可以是参数范围的。我们可以直接将管道实例绑定到路由参数装饰器，例如`@Body()`。让我们来看看下面的例子：

> cats.controler.ts

```typescript
@Post()
async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

当验证逻辑仅涉及一个指定的参数时，参数范围的管道是有用的。 要在方法级别设置管道，您需要使用 `UsePipes()` 装饰器。

> cats.controler.ts

```typescript
@Post()
@UsePipes(new ValidationPipe())
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

!> `@UsePipes()` 修饰器是从 `@nestjs/common` 包中导入的。

这个实例 `ValidationPipe` 已经被直接创建了，另一种可用的方法是传递类 (不是实例), 使框架成为实例化责任并启用依赖项注入。
> cat.controller.ts
```typescript
@Post()
@UsePipes(ValidationPipe)
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```
由于  ValidationPipe 创建时应尽可能通用，因此我们将其设置为全局范围的管道，用于整个应用程序中的每个路由处理程序。

> main.ts

```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

!> `useGlobalPipes()` 方法不会为网关和微服务设置管道。

全局管道用于整个应用程序，用于每个控制器和每个路由处理程序。在依赖注入方面，从任何模块外部注册的全局管道（如上面的例子中所述）不能注入依赖关系，因为它们不属于任何模块。为了解决这个问题，您可以使用以下构造直接从任何模块设置管道 ：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomGlobalPipe,
    },
  ],
})
export class ApplicationModule {}
```

?> 另一种选择是使用[执行上下文](/5.0/executioncontext)功能。此外, useClass 不是处理自定义提供程序注册的唯一方法。在[这里](/5.0/fundamentals?id=dependency-injection)了解更多。


## 变压器管道

验证不是唯一的用例。 在本章的开始部分，我已经提到管道也可以将输入数据转换为所需的输出。 这是真的，因为从 `transform` 函数返回的值完全覆盖了参数的前一个值。 有时从客户端传来的数据需要经过一些修改。 此外，有些部分可能会丢失，所以我们必须应用默认值。 变压器管道填补了客户端和请求处理程序的请求之间的空白。

> parse-int.pipe.ts

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  async transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

这是一个 `ParseIntPipe`，它负责将一个字符串解析为一个整数值。 现在让我们将管道绑定到选定的参数：

```typescript
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return await this.catsService.findOne(id);
}
```

由于上述构造，ParseIntPipe 在请求之前将执行甚至触及相应的处理程序。

另一个有用的例子是通过 id 从数据库中选择一个现有的用户实体：

```typescript
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}

## 内置的 ValidationPipe

幸运的是, 您不必自行构建这些管道, 因为 ValidationPipe 和 ParseIntPipe 都是内置管道 (请记住, ValidationPipe 需要安装 class-validator 和 class-transformer 包)。

内置的 ValidationPipe 提供了比本章所描述的更多的选择, 它一直保持基本的, 为了简单和减少学习曲线。如果你看一下你的控制器函数中的 createCatDto, 你会发现它不是一个实际的 createCatDto 实例。这是因为此管道仅验证负载, 而不将其转换为预期类型。但是, 如果您希望管道变更有效负载, 可以通过传递适当的选项来配置它:

> cats.controller.ts

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: false }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```
由于此管道基于 class-validator 和class-transformer 库，因此可以获得更多。看看构造函数的可选选项。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
}
```
有一个 transform 属性和所有 class-validator 选项 (从 ValidatorOptions 接口继承):

|选项|类型|描述|
|----|----|-----|
|skipMissingProperties | boolean | 如果设置为 true，验证器将跳过对验证对象中缺少的全部属性的验证。 |
| whitelist | boolean | 如果设置为true，验证器将剥离任何不使用任何装饰器的属性的验证对象。|
|forbidNonWhitelisted	| boolean	| 如果设置为 true，而不是剥离未列入白名单的属性，则验证器将引发异常。|
|groups	|string[]	|在验证对象时使用的组。|
|dismissDefaultMessages |	boolean	| 如果设置为 true，验证将不会使用默认消息。undefined 如果未明确设置，错误消息始终会显示。|
|validationError.target |	boolean	| 指示是否应暴露目标 ValidationError |
|validationError.value	| boolean	| 指示验证值是否应暴露于 ValidationError |

