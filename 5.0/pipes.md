# 管道

管道是具有 `@Injectable()` 装饰器的类。管道应实现 `PipeTransform` 接口。

![](https://docs.nestjs.com/assets/Pipe_1.png)

管道将输入数据**转换**为所需的输出。另外，它可以处理**验证**，因为当数据不正确时可能会抛出异常。

?> 管道在异常区域内运行。这意味着当抛出异常时，它们由核心异常处理程序和应用于当前上下文的[异常过滤器](/5.0/exceptionfilters)处理。

## 内置管道

`Nest` 自带两个开箱即用的管道，即 `ValidationPipe` 和 `ParseIntPipe`。他们从 `@nestjs/common` 包中导出。为了更好地理解它们是如何工作的，我们将从头开始构建它们。

## 它是什么样子的？

我们从 `ValidationPipe` 开始。 首先它只接受一个值并立即返回相同的值，其行为类似于一个标识函数。

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

?> `PipeTransform<T, R>` 是一个通用接口，其中 `T` 表示 `value` 的类型，`R` 表示 `transform()` 方法的返回类型。

每个管道必须提供 `transform()` 方法。 这个方法有两个参数：
* `value`
* `metadata`

`value` 是当前处理的参数，而 `metadata` 是其元数据。元数据对象包含一些属性：

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
|type|告诉我们该属性是一个 body `@Body()`，query `@Query()`，param `@Param()` 还是自定义参数 [在这里阅读更多](https://docs.nestjs.cn/custom-decorators)。|
|metatype|属性的元类型，例如 `String`。 如果在函数签名中省略类型声明，或者使用原生JavaScript，则为 `undefined`。|
|data|传递给装饰器的字符串，例如 `@Body('string')`。 如果您将括号留空，则为 `undefined`。|

!> `TypeScript `接口在编译期间消失，所以如果你使用接口而不是类，那么 `metatype` 的值将是一个 `Object`。
 
## 重点是什么？

我们来关注一下 `CatsController` 的 `create()` 方法：

> cats.controler.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

下面是 `CreateCatDto` 参数

> create-cat.dto.ts

```typescript
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

这个对象必须是正确的，所以我们必须验证这三个成员。我们可以在路由处理程序方法中做到这一点，但是我们会打破单个责任原则（SRP）。第二个想法是创建一个验证器类并在那里委托任务，但是每次在方法开始的时候我们都必须使用这个验证器。那么验证中间件呢？ 这是一个好主意，但不可能创建一个通用的中间件，可以在整个应用程序中使用。

这是第一个用例，你应该考虑使用**管道**。

## 对象结构验证

常用方法之一是使用**基于结构**的验证。[Joi](https://github.com/hapijs/joi)库是一个工具，它允许您使用一个可读的API以非常简单的方式创建结构。为了创建一个使用对象结构的管道，我们需要创建一个简单的类，该类将结构作为 `constructor` 参数。

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

## 绑定管道

管道绑定非常简单-我们需要使用 `@UsePipes()` 修饰器并使用有效的Joi结构创建管道实例。

```typescript
@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

## 类验证器（Class validator）

本节仅适用于 `TypeScript`。

Nest 与 [class-validator](https://github.com/pleerock/class-validator) 配合得很好。这个优秀的库允许您使用基于装饰器的验证。由于我们可以访问处理过的属性的元类型，所以基于装饰器的验证对于管道功能是非常强大的。让我们安装所需的软件包。

```
$ npm i --save class-validator class-transformer
```

安装完成后，我们就可以向 `CreateCatDto` 类添加一些装饰器。

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

现在是完成 `ValidationPipe` 类的时候了。

> validation.pipe.ts

```typescript
import { PipeTransform, Pipe, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value, metadata: ArgumentMetadata) {
      const { metatype } = metadata;
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

!> 我已经使用了 [class-transformer](https://github.com/pleerock/class-transformer) 库。它和 [class-validator](https://github.com/pleerock/class-validator) 库由同一个作者开发，所以他们配合的很好。

我们来看看这个代码。首先，请注意 `transform()` 函数是 `异步` 的。这是可能的，因为Nest支持同步和**异步**管道。另外，还有一个辅助函数 `toValidate()`。由于性能原因，它负责从验证过程中排除原生 `JavaScript` 类型。最后一个重要的是我们必须返回相同的价值。这个管道是一个特定于验证的管道，所以我们需要返回完全相同的属性以避免**重写**（如前所述，管道将输入转换为所需的输出）。

最后一步是设置 `ValidationPipe` 。管道，与[异常过滤器](/5.0/exceptionfilters)相同，它们可以是方法范围的、控制器范围的和全局范围的。另外，管道可以是参数范围的。我们可以直接将管道实例绑定到路由参数装饰器，例如`@Body()`。让我们来看看下面的例子：

> cats.controler.ts

```typescript
@Post()
async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

当验证逻辑仅涉及一个指定的参数时，参数范围的管道非常有用。要在方法级别设置管道，您需要使用 `UsePipes()` 装饰器。

> cats.controler.ts

```typescript
@Post()
@UsePipes(new ValidationPipe())
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

!> `@UsePipes()` 修饰器是从 `@nestjs/common` 包中导入的。

`ValidationPipe` 的实例已立即创建。另一种可用的方法是直接传入类（而不是实例），让框架承担实例化责任，并启用**依赖注入**。

> cats.controler.ts

```typescript
@Post()
@UsePipes(ValidationPipe)
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

由于 `ValidationPipe` 被创建为尽可能通用，所以我们将把它设置为一个**全局作用域**的管道，用于整个应用程序中的每个路由处理器。

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

全局管道用于整个应用程序、每个控制器和每个路由处理程序。就依赖注入而言，从任何模块外部注册的全局管道（如上例所示）无法注入依赖，因为它们不属于任何模块。为了解决这个问题，可以使用以下构造直接为任何模块设置管道：

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

?> 另一种选择是使用[执行上下文](5.0/executioncontext)功能。另外，useClass 并不是处理自定义提供者注册的唯一方法。在[这里](5.0/fundamentals?id=custom-providers)了解更多。

## 转换管道

验证不是唯一的用例。在本章的开始部分，我已经提到管道也可以将输入数据**转换**为所需的输出。这是真的，因为从 `transform` 函数返回的值完全覆盖了参数的前一个值。有时从客户端传来的数据需要经过一些修改。此外，有些部分可能会丢失，所以我们必须应用默认值。**转换管道**填补了客户端和请求处理程序的请求之间的空白。

> parse-int.pipe.ts

```typescript
import { PipeTransform, Pipe, ArgumentMetadata, HttpStatus, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

这是一个 `ParseIntPipe`，它负责将一个字符串解析为一个整数值。现在我们将管道绑定到选定的参数：

```typescript
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return await this.catsService.findOne(id);
}
```

由于上面的形式，`ParseIntpipe` 将在请求触发相应的处理程序之前执行。

另一个有用的例子是按 ID 从数据库中选择一个现有的**用户实体**。

```typescript
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}
```

## 内置验证管道

幸运的是，由于 `ValidationPipe` 和 `ParseIntPipe` 是内置管道，因此您不必自己构建这些管道（请记住， `ValidationPipe` 需要同时安装 `class-validator` 和 `class-transformer` 包）。

内置的 `ValidationPipe` 提供了比本章描述的更多的选项，为了简单和减少学习曲线，这些选项一直保持基本。如果您查看控制器函数中的 `createCatDto`，您会发现它不是实际的 `CreateCatDto` 实例。这是因为此管道只验证是否正确，而不将其转换为预期类型。但是，如果希望管道改变有效负载，可以通过传递适当的选项来配置它：

> cats.controller.ts

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

因为这个管道是基于 `class-validator` 和 `class-transformer` 库的，所以有更多选项。看看构造函数的可选选项。

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
}
```

下面是 `transform` 属性和所有 `class-validator` 选项（从 `ValidatorOptions` 接口继承）：

|参数|类型|描述|
|-----|-----|-----|
|`skipMissingProperties`|`boolean`| 如果设置为 true，则验证程序将跳过验证对象中缺少的属性的验证。|
|`whitelist`|`boolean`| 如果设置为 true，则验证程序将除去未使用任何装饰器的属性的已验证对象。|
|`forbidNonWhitelisted`|`boolean`| 如果设置为 true，则验证程序将引发异常，而不是取消非白名单属性。|
|`forbidUnknownValues`|`boolean`| 如果设置为 true，未知对象的验证将立即失败。|
|`disableErrorMessages`|`boolean`| 如果设置为 true，验证错误将不会转发到客户端。|
|`groups`|`string[]`| 验证对象期间要使用的组。|
|`dismissDefaultMessages`|`boolean`| 如果设置为 true，验证将不使用默认消息。如果错误消息未显式设置，则为 `undefined` 的。|
|`validationError.target`|`boolean`| 目标是否应在 `ValidationError` 中展示|
|`validationError.value`|`boolean`| 验证值是否应在 `ValidationError` 中展示。|

!> 您可以在[这里](https://github.com/typestack/class-validator)中找到关于 `class-validator` 包的更多信息。。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://i.loli.net/2020/03/24/37yC4dntIcTHkLO.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |