# 管道

管道是具有 `@Pipe()` 装饰器的类。管道应实现 `PipeTransform` 接口。

![](https://docs.nestjs.com/assets/Pipe_1.png)

管道将输入数据转换为所需的输出。 另外，它可以处理验证，因为当数据不正确时可能会抛出异常。

?> 提示管道在异常区域内运行。 这意味着当抛出异常时，它们由核心异常处理程序处理，异常过滤器应用于当前上下文。

## 内置管道

`Nest` 自带两个可用的管道，即 `ValidationPipe` 和 `ParseIntPipe`。 他们从 `@nestjs/common` 包中导出。 为了更好地理解它们是如何工作的，我们将从头开始构建它们。

## 它是什么样子的？

我们从 `ValidationPipe` 开始。 现在它只取得一个类型的值，并且会返回同样类型的值。

> validation.pipe.ts

```typescript
import { PipeTransform, Pipe, ArgumentMetadata } from '@nestjs/common';

@Pipe()
export class ValidationPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
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
|type|告诉我们该属性是一个 `body @Body()`，`query @Query()`，`param @Param()` 还是自定义参数 [在这里阅读更多](https://docs.nestjs.cn/custom-decorators)。|
|metatype|属性的元类型，例如 `String`。 如果在函数签名中省略类型声明，则不确定。|
|data|传递给装饰器的字符串，例如 `@Body('string')`。 如果您将括号留空，则不确定。|

!> `TypeScript `接口在编译期间消失，所以如果你使用接口而不是类，那么元类型的值将是一个 `Object`。
 
## 它是如何工作的？

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

这个对象总是要正确的，所以我们必须验证这三个成员。我们可以在路由处理程序方法中做到这一点，但是我们会打破单个责任规则（SRP）。第二个想法是创建一个验证器类并在那里委托任务，但是每次在方法开始的时候我们都必须使用这个验证器。那么验证中间件呢？ 这是一个好主意，但不可能创建一个通用的中间件，可以在整个应用程序中使用。

这是第一个用例，当你应该考虑使用管道。

## 类验证器

本节仅适用于 `TypeScript`。

`Nest` 与类验证器一起工作良好，这个惊人的库允许您使用基于装饰器的验证。 由于我们可以访问处理过的属性的元类型，所以基于装饰器的验证对于管道功能是非常强大的。 让我们添加一些装饰到 `CreateCatDto`。

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

@Pipe()
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

!> 我已经使用了类转换器库。它是由同一个作者作为类验证器库，所以他们一起玩。

我们来看看这个代码。首先，请注意 `transform()` 函数是异步的。这是可能的，因为Nest支持同步和异步管道。另外，还有一个辅助函数 `toValidate()`。它负责从验证过程中排除原生 `JavaScript` 类型。最后一个重要的是我们必须返回相同的价值。这个管道是一个验证特定的管道，所以我们需要返回完全相同的属性以避免重写。

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

由于 `ValidationPipe` 被创建为尽可能通用，所以我们将把它设置为一个全局作用域的管道，用于整个应用程序中的每个路由处理器。

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

## 变压器管道

验证不是唯一的用例。 在本章的开始部分，我已经提到管道也可以将输入数据转换为所需的输出。 这是真的，因为从 `transform` 函数返回的值完全覆盖了参数的前一个值。 有时从客户端传来的数据需要经过一些修改。 此外，有些部分可能会丢失，所以我们必须应用默认值。 变压器管道填补了客户端和请求处理程序的请求之间的空白。

> parse-int.pipe.ts

```typescript
import { PipeTransform, Pipe, ArgumentMetadata, HttpStatus, BadRequestException } from '@nestjs/common';

@Pipe()
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

这是一个 `ParseIntPipe`，它负责将一个字符串解析为一个整数值。 现在让我们将管道绑定到选定的参数：

```typescript
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return await this.catsService.findOne(id);
}
```

## 全局管道

全局管道不属于任何范围。 他们生活在模块之外，因此，他们不能注入依赖。 我们需要立即创建一个实例。 但有时，全局管道依赖于其他对象。 我们如何解决这个问题？

解决方案非常简单。 实际上，每个 `Nest` 应用程序实例都是一个创建的Nest上下文。 `Nest` 上下文是 `Nest` 容器的一个包装，它包含所有实例化的类。 我们可以直接使用应用程序对象从任何导入的模块中获取任何现有的实例。

假设我们在 `SharedModule` 中注册了一个 `ValidationPipe` 。 这个 `SharedModule` 被导入到根模块中。 我们可以使用以下语法选择 `ValidationPipe` 实例：

```typescript
const app = await NestFactory.create(ApplicationModule);
const validationPipe = app
  .select(SharedModule)
  .get(ValidationPipe);

app.useGlobalPipes(validationPipe);
```

要获取 `ValidationPipe` 实例，我们必须使用2个方法，在下表中有详细描述：

|参数|描述|
|-----|-----|
|`get()`| 使得可以检索已处理模块中可用的组件或控制器的实例。|
|`select()`| 允许您浏览模块树，例如，从所选模块中提取特定实例。|

!> 默认情况下选择根模块。 要选择任何其他模块，您需要遍历整个模块堆栈（一步一步）。