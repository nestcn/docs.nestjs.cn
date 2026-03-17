<!-- 此文件从 content/techniques/validation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:05:48.445Z -->
<!-- 源文件: content/techniques/validation.md -->

### 有效性验证

在将数据发送到 Web 应用程序时，验证数据的正确性是良好的实践。要自动验证 incoming 请求，Nest 提供了多个可直接使用的管道：

- `ValidationPipe`
- `ValidationPipe`
- `ValidationPipe`
- `ValidationPipe`
- `ValidationPipe`

`ValidationPipe` 使用了强大的 `@Decorator` 包和其声明式验证装饰器。`ValidationPipe` 提供了便捷的方法来强制执行 incoming 客户端负载的验证规则，其中特定的规则使用简单注释在每个模块中的本地类/DTO 声明中。

#### 概述

在 __LINK_349__ 中，我们讨论了构建简单管道、将其绑定到控制器、方法或全局应用程序的过程。确保回顾该章，以更好地理解本章的主题。在这里，我们将关注__INLINE_CODE_34__ 在实际世界中的多种用例和一些高级自定义特性。

#### 使用内置的ValidationPipe

要开始使用它，我们首先安装所需的依赖项。

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

> info **提示** `ValidationPipe` 从 `@nestjs/common` 包导出。

由于该管道使用了 `@Decorator` 和 `@Validation` 库，因此有多种可供选择的选项。可以通过将配置对象传递给管道来配置这些设置。以下是内置选项：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

```

此外，所有 `ValidationPipe` 选项（继承自 `ValidationOptions` 接口）都可用：

Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also translated code comments from English to Chinese.Here is the translation of the English technical documentation to Chinese:

&lt;__HTML_TAG_117__&gt;
&lt;__HTML_TAG_118__&gt;
  &lt;__HTML_TAG_119__&gt;Option&lt;/__HTML_TAG_120__&gt;
  &lt;__HTML_TAG_121__&gt;Type&lt;/__HTML_TAG_122__&gt;
  &lt;__HTML_TAG_123__&gt;Description&lt;/__HTML_TAG_124__&gt;
&lt;/__HTML_TAG_125__&gt;
&lt;__HTML_TAG_126__&gt;
  &lt;__HTML_TAG_127____&gt;enableDebugMessages&lt;/__HTML_TAG_128__&gt;
  &lt;__HTML_TAG_129____&gt;&lt;/__HTML_TAG_130__&gt;
  &lt;__HTML_TAG_131____&gt;boolean&lt;/__HTML_TAG_132__&gt;
  &lt;__HTML_TAG_133____&gt;&lt;/__HTML_TAG_134__&gt;
  &lt;__HTML_TAG_135__&gt;如果设置为 true，验证器将在控制台中打印额外警告消息，以便在验证不通过时显示错误&lt;/__HTML_TAG_136__&gt;
&lt;/__HTML_TAG_137__&gt;
&lt;__HTML_TAG_138__&gt;
  &lt;__HTML_TAG_139____&gt;skipUndefinedProperties&lt;/__HTML_TAG_140__&gt;
  &lt;__HTML_TAG_141____&gt;&lt;/__HTML_TAG_142__&gt;
  &lt;__HTML_TAG_143____&gt;boolean&lt;/__HTML_TAG_144__&gt;
  &lt;__HTML_TAG_145____&gt;&lt;/__HTML_TAG_146__&gt;
  &lt;__HTML_TAG_147__&gt;如果设置为 true，则验证器将跳过验证所有在验证对象中undefined的属性&lt;/__HTML_TAG_148__&gt;
&lt;/__HTML_TAG_149__&gt;
&lt;__HTML_TAG_150__&gt;
  &lt;__HTML_TAG_151____&gt;skipNullProperties&lt;/__HTML_TAG_152__&gt;
  &lt;__HTML_TAG_153____&gt;&lt;/__HTML_TAG_154__&gt;
  &lt;__HTML_TAG_155____&gt;boolean&lt;/__HTML_TAG_156__&gt;
  &lt;__HTML_TAG_157____&gt;&lt;/__HTML_TAG_158__&gt;
  &lt;__HTML_TAG_159__&gt;如果设置为 true，则验证器将跳过验证所有在验证对象中null的属性&lt;/__HTML_TAG_160__&gt;
&lt;/__HTML_TAG_161__&gt;
&lt;__HTML_TAG_162__&gt;
  &lt;__HTML_TAG_163____&gt;skipMissingProperties&lt;/__HTML_TAG_164__&gt;
  &lt;__HTML_TAG_165____&gt;&lt;/__HTML_TAG_166__&gt;
  &lt;__HTML_TAG_167____&gt;boolean&lt;/__HTML_TAG_168__&gt;
  &lt;__HTML_TAG_169____&gt;&lt;/__HTML_TAG_170__&gt;
  &lt;__HTML_TAG_171__&gt;如果设置为 true，则验证器将跳过验证所有在验证对象中null或undefined的属性&lt;/__HTML_TAG_172__&gt;
&lt;/__HTML_TAG_173__&gt;
&lt;__HTML_TAG_174__&gt;
  &lt;__HTML_TAG_175____&gt;whitelist&lt;/__HTML_TAG_176__&gt;
  &lt;__HTML_TAG_177____&gt;&lt;/__HTML_TAG_178__&gt;
  &lt;__HTML_TAG_179____&gt;boolean&lt;/__HTML_TAG_180__&gt;
  &lt;__HTML_TAG_181____&gt;&lt;/__HTML_TAG_182__&gt;
  &lt;__HTML_TAG_183__&gt;如果设置为 true，则验证器将删除验证后的对象中的任何不使用验证装饰器的属性&lt;/__HTML_TAG_184__&gt;
&lt;/__HTML_TAG_185__&gt;
&lt;__HTML_TAG_186__&gt;
  &lt;__HTML_TAG_187____&gt;forbidNonWhitelisted&lt;/__HTML_TAG_188__&gt;
  &lt;__HTML_TAG_189____&gt;&lt;/__HTML_TAG_190__&gt;
  &lt;__HTML_TAG_191____&gt;boolean&lt;/__HTML_TAG_192__&gt;
  &lt;__HTML_TAG_193____&gt;&lt;/__HTML_TAG_194__&gt;
  &lt;__HTML_TAG_195__&gt;如果设置为 true，则验证器将抛出异常Here is the translation of the English technical documentation to Chinese:

 __HTML_TAG_274__
    __HTML_TAG_275____HTML_TAG_276__严格组件__HTML_TAG_277____HTML_TAG_278__
    __HTML_TAG_279____HTML_TAG_280__boolean__HTML_TAG_281____HTML_TAG_282__
    __HTML_TAG_283__如果 __HTML_TAG_284__ 组件__HTML_TAG_285__ 未给出或为空，忽略装饰器中至少一个组件。__HTML_TAG_286__
  __HTML_TAG_287__
  __HTML_TAG_288__
    __HTML_TAG_289____HTML_TAG_290__dismissDefaultMessages__HTML_TAG_291____HTML_TAG_292__
    __HTML_TAG_293____HTML_TAG_294__boolean__HTML_TAG_295____HTML_TAG_296__
    __HTML_TAG_297__如果设置为 true，验证将不会使用默认信息。错误信息总是将是 __HTML_TAG_298__ undefined __HTML_TAG_299__，如果
      未经明确设置。__HTML_TAG_300__
  __HTML_TAG_301__
  __HTML_TAG_302__
    __HTML_TAG_303____HTML_TAG_304__validationError.target__HTML_TAG_305____HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__boolean__HTML_TAG_309____HTML_TAG_310__
    __HTML_TAG_311__指示是否 expose 在 __HTML_TAG_312__ ValidationError __HTML_TAG_313__ 中的目标。__HTML_TAG_314__
  __HTML_TAG_315__
  __HTML_TAG_316__
    __HTML_TAG_317____HTML_TAG_318__validationError.value__HTML_TAG_319____HTML_TAG_320__
    __HTML_TAG_321____HTML_TAG_322__boolean__HTML_TAG_323____HTML_TAG_324__
    __HTML_TAG_325__指示是否 expose 在 __HTML_TAG_326__ ValidationError __HTML_TAG_327__ 中的验证值。__HTML_TAG_328__
  __HTML_TAG_329__
  __HTML_TAG_330__
    __HTML_TAG_331____HTML_TAG_332__stopAtFirstError__HTML_TAG_333____HTML_TAG_334__
    __HTML_TAG_335____HTML_TAG_336__boolean__HTML_TAG_337____HTML_TAG_338__
    __HTML_TAG_339__当设置为 true，给定的属性的验证将在遇到第一个错误时停止。默认为 false。__HTML_TAG_340__
  __HTML_TAG_341__
__HTML_TAG_342__

> info **Notice** 了解更多关于 __INLINE_CODE_41__ 包的信息，请访问其 __LINK_349__ 。

#### 自动验证

我们将从应用程序级别绑定 __INLINE_CODE_42__，以确保所有端点都受到保护，从而避免接收不正确的数据。

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};

```

要测试我们的管道，让我们创建一个基本端点。

__CODE_BLOCK_3__

> info **Hint** 由于 TypeScript 不存储对 **泛型或接口** 的元数据，因此当您在 DTOs 中使用它们时， __INLINE_CODE_43__ 可能不能正确地验证 incoming 数据。为此，考虑使用具体类别在 DTOs 中。

> info **Hint** 在导入 DTOs 时，不要使用 type-only 导入，因为这将在 runtime 中被 erased，即记住使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__。

现在，我们可以在我们的 __INLINE_CODE_46__ 中添加一些验证规则。我们使用装饰器，提供于 __INLINE_CODE_47__ 包，详见 __LINK_350__。这样，任何使用 __INLINE_CODE_48__ 的路由都会自动执行这些验证规则。

__CODE_BLOCK_4__

这些规则生效后，如果请求到达我们的端点，并且请求体中的 __INLINE_CODE_49__ 属性无效，应用程序将自动响应 __INLINE_CODE_50__ 代码，并返回以下响应体：

__CODE_BLOCK_5__

此外， __INLINE_CODE_51__ 还可以与其他请求对象属性一起使用。例如，我们想接受 __INLINE_CODE_52__ 在端点路径中。要确保只接受数字作为该请求参数，我们可以使用以下构造：

__CODE_BLOCK_6__

__INLINE_CODE_53__，类似于 DTO， simplement 是一个类别，它使用 __INLINE_CODE_54__ 定义验证规则。它将如下所示：

__CODE_BLOCK_7__

#### disable 详细错误

错误信息可以帮助解释请求中的错误。然而，在某些生产环境中，可能需要禁用详细错误。使用 __INLINE_CODE_55__  options 对象来实现：

__CODE_BLOCK_8__

结果，详细错误信息将不会出现在响应体中。

#### 剥去属性

我们的 __INLINE_CODE_56__ 还可以过滤出不应该由方法处理器接收的属性。例如，我们可以 **白名单** 可接受的属性，然后将不包括在白名单中的#### Payload 对象的转换

网络中的 Payload 是纯粹的 JavaScript 对象。可以自动将 Payload 转换为 DTO 类型的对象。要启用自动转换，设置 __INLINE_CODE_66__ 到 __INLINE_CODE_68__。这可以在方法级别实现：

```typescript
@Pipe({
  name: 'transform',
  transform: (value: any) => {
    // your transform logic here
  }
})
export class TransformPipe {
  // ...
}

```

或者在全局管道中实现：

```typescript
@Injectable()
export class AppModule {
  @Pipe({
    name: 'transform',
    transform: (value: any) => {
      // your transform logic here
    }
  })
  transform(value: any) {
    // ...
  }
}

```

在自动转换启用后，__INLINE_CODE_69__ 也将执行基本类型的转换。在以下示例中，__INLINE_CODE_70__ 方法接受一个表示extracted __INLINE_CODE_71__ 路径参数的参数：

```typescript
@Get()
async find(@Param('id') id: number) {
  // ...
}

```

默认情况下，每个路径参数和查询参数都将以 __INLINE_CODE_72__ 的形式传输。在上面的示例中，我们指定了 __INLINE_CODE_73__ 类型为 __INLINE_CODE_74__ (在方法签名中)。因此，__INLINE_CODE_75__ 将尝试自动将字符串标识符转换为数字。

#### 显式转换

在上面的部分中，我们展示了 __INLINE_CODE_76__ Implicitly transforming query and path parameters based on the expected type。然而，这个特性需要在自动转换启用时。

 Alternatively (with auto-transformation disabled), you can explicitly cast values using the __INLINE_CODE_77__ or __INLINE_CODE_78__ (note that __INLINE_CODE_79__ is not needed because, as mentioned earlier, every path parameter and query parameter comes over the network as a __INLINE_CODE_80__ by default)。

```typescript
@Get()
async find(@Param('id', 'number') id: number) {
  // ...
}

```

> info **Hint** The __INLINE_CODE_81__ and __INLINE_CODE_82__ are exported from the __INLINE_CODE_83__ package.

####Mapped 类型

当您构建功能，如 **CRUD** (Create/Read/Update/Delete)时，它们通常需要构建基于基本实体类型的变体。Nest 提供了一些utility 函数，用于执行类型转换，以使这项任务更加方便。

> **Warning** If your application uses the __INLINE_CODE_84__ package, see __LINK_351__ for more information about Mapped Types. Likewise, if you use the __INLINE_CODE_85__ package see __LINK_352__. Both packages heavily rely on types and so they require a different import to be used. Therefore, if you used __INLINE_CODE_86__ (instead of an appropriate one, either __INLINE_CODE_87__ or __INLINE_CODE_88__ depending on the type of your app), you may face various, undocumented side-effects.

当您构建输入验证类型（也称为 DTOs）时，它们通常需要构建 **create** 和 **update** 变体。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 __INLINE_CODE_89__ utility 函数，以使这项任务更加方便和减少 boilerplate。

__INLINE_CODE_90__ 函数返回一个类型（class），该类型拥有输入类型的所有属性，但所有属性都设置为可选。例如，假设我们有一个 **create** 类型如下：

```typescript
class Create {
  name: string;
  email: string;
}

```

默认情况下，这些字段都是必需的。要创建一个类型，其中所有字段都是可选，可以使用 __INLINE_CODE_91__，将类引用（__INLINE_CODE_92__）作为参数：

```typescript
class OptionalCreate extends __INLINE_CODE_91__(Create) {
  // ...
}

```

> info **Hint** The __INLINE_CODE_93__ function is imported from the __INLINE_CODE_94__ package.

__INLINE_CODE_95__ 函数构建一个新的类型（class），选择输入类型的某些属性。例如，假设我们从以下类开始：

```typescript
class Base {
  name: string;
  email: string;
  password: string;
}

```

我们可以选择该类的某些属性使用 __INLINE_CODE_96__ utility 函数：

```typescript
class Derived extends __INLINE_CODE_96__(Base, ['name', 'email']) {
  // ...
}

```

> info **Hint** The __INLINE_CODE_97__ function is imported from the __INLINE_CODE_98__ package.

__INLINE_CODE_99__ 函数构建一个类型，选择输入类型的所有属性，然后删除特定的键。例如，假设我们从以下类开始：

```typescript
class Base {
  name: string;
  email: string;
  password: string;
}

```

我们可以生成一个衍生类型，该类型除了 __INLINE_CODE_100__ 外，拥有所有属性：

```typescript
class Derived extends __INLINE_CODE_101__(Base, ['password']) {
  // ...
}

```

> info **Hint** The __INLINE_CODE_102__ function is imported from the __INLINE_CODE_103__ package.

__INLINE_CODE_104__ 函数组合两个类型为一个新类型（class）。例如，假设我们从以下TypeScript 不存储关于泛型或接口的元数据，因此在使用它们时，您的 DTOs 可能无法正确地验证 incoming 数据。例如，在以下代码中，__INLINE_CODE_109__ 无法正确地验证数组：

```typescript
export class User {
  public id: string;
  public name: string;
  public addresses: __INLINE_CODE_110__; // <--- 问题
}

```

要验证数组，可以创建一个专门的类，其中包含将数组包装在一起的属性，或者使用 __INLINE_CODE_111__。

```typescript
export class User {
  public id: string;
  public name: string;
  public addresses: WrappedArray<string>; // <--- 解决方案
}

class WrappedArray<T> {
  public constructor(private array: T[]) {}
  public get(): T[] {
    return this.array;
  }
}

```

此外，__INLINE_CODE_112__ 可以很好地帮助您解析查询参数。让我们考虑一个 __INLINE_CODE_113__ 方法，该方法返回根据传递的查询参数标识符的用户。

```typescript
@Injectable()
export class UsersService {
  public getUsers(@Query() query: { ids: string[] }): Observable<User[]> {
    // ...
  }
}

```

这项构建将验证来自 HTTP __INLINE_CODE_114__ 请求的 incoming 查询参数，如以下所示：

```typescript
GET /users?ids=1,2,3 HTTP/1.1
Host: localhost:3000

```

#### WebSocket 和微服务

虽然本章中展示的示例使用 HTTP 样式应用程序（例如 Express 或 Fastify），但 __INLINE_CODE_115__ 对 WebSockets 和微服务都适用，不管所使用的传输方法是什么。

#### 了解更多

了解更多关于自定义验证器、错误消息和由 __INLINE_CODE_116__ 包提供的可用装饰器的信息，了解更多信息请访问 __LINK_353__。