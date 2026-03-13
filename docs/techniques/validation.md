<!-- 此文件从 content/techniques/validation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:00:47.368Z -->
<!-- 源文件: content/techniques/validation.md -->

### Validation

Nest 提供了多种内置的管道，以自动验证 incoming 请求。以下是在 Nest 中可用的几个管道：

- __INLINE_CODE_27__
- __INLINE_CODE_28__
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__

__INLINE_CODE_32__ 使用了强大的 __LINK_345__ 包和其声明式验证装饰器。 __INLINE_CODE_33__ 提供了一个简单的方法来为所有 incoming 客户端负载强制执行验证规则，其中规则是在每个模块中的本地类/DTO 声明中以简单注释形式声明。

#### 概述

在 __LINK_346__ 章节中，我们已經了解了简单管道的构建和将其绑定到控制器、方法或全局应用程序的过程。请确保查看该章节，以更好地理解本章的主题。在这里，我们将专注于 __INLINE_CODE_34__ 的多种实际用例，并展示一些高级自定义特性。

#### 使用内置的 ValidationPipe

首先，我们需要安装所需的依赖项。

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

> info **提示** __INLINE_CODE_35__ 是从 __INLINE_CODE_36__ 包中导出。

因为这个管道使用了 __LINK_347__ 和 __LINK_348__ 库，因此有许多可用的选项。您可以通过将配置对象传递给管道来配置这些设置。以下是内置的选项：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

```

此外，还有所有 __INLINE_CODE_39__ 选项（来自 __INLINE_CODE_40__ 接口）：

Note: I followed the guidelines and translated the text while keeping the code examples and placeholders unchanged. I also removed the @@switch block and content after it, and converted @@filename(xxx) to rspress syntax.<code>
&lt;__HTML_TAG_117__&gt;
&lt;__HTML_TAG_118__&gt;
  &lt;__HTML_TAG_119__Option&lt;__HTML_TAG_120__&gt;&lt;/__HTML_TAG_119__&gt;
  &lt;__HTML_TAG_121__Type&lt;__HTML_TAG_122__&gt;&lt;/__HTML_TAG_121__&gt;
  &lt;__HTML_TAG_123__Description&lt;__HTML_TAG_124__&gt;&lt;/__HTML_TAG_123__&gt;
&lt;/__HTML_TAG_118__&gt;
&lt;__HTML_TAG_125__&gt;&lt;/__HTML_TAG_125__&gt;
&lt;__HTML_TAG_126__&gt;
  &lt;__HTML_TAG_127____&lt;__HTML_TAG_128__enableDebugMessages&lt;__HTML_TAG_129____&gt;&lt;/__HTML_TAG_127__&gt;
  &lt;__HTML_TAG_131____&lt;__HTML_TAG_132__boolean&lt;__HTML_TAG_133____&gt;&lt;/__HTML_TAG_131__&gt;
  &lt;__HTML_TAG_135__如果设置为 true, validator 会在控制台打印额外的警告信息，以便指示验证失败&lt;/__HTML_TAG_135__&gt;
&lt;/__HTML_TAG_126__&gt;
&lt;__HTML_TAG_137__&gt;&lt;/__HTML_TAG_137__&gt;
&lt;__HTML_TAG_138__&gt;
  &lt;__HTML_TAG_139____&lt;__HTML_TAG_140__skipUndefinedProperties&lt;__HTML_TAG_141____&gt;&lt;/__HTML_TAG_139__&gt;
  &lt;__HTML_TAG_143____&lt;__HTML_TAG_144__boolean&lt;__HTML_TAG_145____&gt;&lt;/__HTML_TAG_143__&gt;
  &lt;__HTML_TAG_147__如果设置为 true, validator 将跳过验证所有未定义的属性&lt;/__HTML_TAG_147__&gt;
&lt;/__HTML_TAG_138__&gt;
&lt;__HTML_TAG_149__&gt;&lt;/__HTML_TAG_149__&gt;
&lt;__HTML_TAG_150__&gt;
  &lt;__HTML_TAG_151____&lt;__HTML_TAG_152__skipNullProperties&lt;__HTML_TAG_153____&gt;&lt;/__HTML_TAG_151__&gt;
  &lt;__HTML_TAG_155____&lt;__HTML_TAG_156__boolean&lt;__HTML_TAG_157____&gt;&lt;/__HTML_TAG_155__&gt;
  &lt;__HTML_TAG_159__如果设置为 true, validator 将跳过验证所有 null 属性&lt;/__HTML_TAG_159__&gt;
&lt;/__HTML_TAG_150__&gt;
&lt;__HTML_TAG_161__&gt;&lt;/__HTML_TAG_161__&gt;
&lt;__HTML_TAG_162__&gt;
  &lt;__HTML_TAG_163____&lt;__HTML_TAG_164__skipMissingProperties&lt;__HTML_TAG_165____&gt;&lt;/__HTML_TAG_163__&gt;
  &lt;__HTML_TAG_167____&lt;__HTML_TAG_168__boolean&lt;__HTML_TAG_169____&gt;&lt;/__HTML_TAG_167__&gt;
  &lt;__HTML_TAG_171__如果设置为 true, validator 将跳过验证所有 null 或 undefined 属性&lt;/__HTML_TAG_171__&gt;
&lt;/__HTML_TAG_162__&gt;
&lt;__HTML_TAG_173__&gt;&lt;/__HTML_TAG_173__&gt;
&lt;__HTML_TAG_174__&gt;
  &lt;__HTML_TAG_175____&lt;__HTML_TAG_176__whitelist&lt;__HTML_TAG_177____&gt;&lt;/__HTML_TAG_175__&gt;
  &lt;__HTML_TAG_179____&lt;__HTML_TAG_180__boolean&lt;__HTML_TAG_181____&gt;&lt;/__HTML_TAG_179__&gt;
  &lt;__HTML_TAG_183__如果设置为 true, validator 将将验证后的对象中删除任何未使用验证装饰器的属性&lt;/__HTML_TAG_183__&gt;
&lt;/__HTML_TAG_174__&gt;
&lt;__HTML_TAG_185__&gt;&lt;/__HTML_TAG_185__&gt;
&lt;__HTML_TAG_186__&gt;
  &lt;__HTML_TAG_187____&lt;__HTML_TAG_188__forbidNonWhitelisted&lt;__HTML_TAG_189____&gt;&lt;/__HTML_TAG_187__&gt;
  &lt;__HTML_TAG_191____&lt;__HTML_TAG_192__boolean&lt;__HTML_TAG_193____&gt;&lt;/__HTML_TAG_Here is the translated text:

 __HTML_TAG_274__
    __HTML_TAG_275____HTML_TAG_276__严格组组__HTML_TAG_277____HTML_TAG_278__
    __HTML_TAG_279____HTML_TAG_280__布尔值__HTML_TAG_281____HTML_TAG_282__
    __HTML_TAG_283__如果 __HTML_TAG_284__ 组组__HTML_TAG_285__ 未给出或为空，则忽略带有至少一个组的装饰器。__HTML_TAG_286__
  __HTML_TAG_287__
  __HTML_TAG_288__
    __HTML_TAG_289____HTML_TAG_290__dismissDefaultMessages__HTML_TAG_291____HTML_TAG_292__
    __HTML_TAG_293____HTML_TAG_294__布尔值__HTML_TAG_295____HTML_TAG_296__
    __HTML_TAG_297__如果设置为 true，则验证将不会使用默认消息。错误消息总是将被设置为 __HTML_TAG_298__ undefined __HTML_TAG_299__        如果
     它没有被明确设置。__HTML_TAG_300__
  __HTML_TAG_301__
  __HTML_TAG_302__
    __HTML_TAG_303____HTML_TAG_304__validationError.target__HTML_TAG_305____HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__布尔值__HTML_TAG_309____HTML_TAG_310__
    __HTML_TAG_311__表示是否将目标暴露在 __HTML_TAG_312__ ValidationError __HTML_TAG_313__ 中。__HTML_TAG_314__
  __HTML_TAG_315__
  __HTML_TAG_316__
    __HTML_TAG_317____HTML_TAG_318__validationError.value__HTML_TAG_319____HTML_TAG_320__
    __HTML_TAG_321____HTML_TAG_322__布尔值__HTML_TAG_323____HTML_TAG_324__
    __HTML_TAG_325__表示是否将验证后的值暴露在 __HTML_TAG_326__ ValidationError __HTML_TAG_327__ 中。__HTML_TAG_328__
  __HTML_TAG_329__
  __HTML_TAG_330__
    __HTML_TAG_331____HTML_TAG_332__stopAtFirstError__HTML_TAG_333____HTML_TAG_334__
    __HTML_TAG_335____HTML_TAG_336__布尔值__HTML_TAG_337____HTML_TAG_338__
    __HTML_TAG_339__当设置为 true 时，validation 将在遇到第一个错误后停止。默认为 false。__HTML_TAG_340__
  __HTML_TAG_341__
__HTML_TAG_342__

> info **注意** 若要了解更多关于 __INLINE_CODE_41__ 包的信息，请访问其 __LINK_349__。

#### 自动验证

我们将从绑定 __INLINE_CODE_42__ 在应用程序级别开始，从而确保所有端点都受到保护，不会接收到错误的数据。

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};

```

为了测试我们的管道，让我们创建一个基本的端点。

__CODE_BLOCK_3__

> info **提示**由于 TypeScript 不存储关于 **泛型或接口** 的元数据，因此当您在 DTO 中使用它们时， __INLINE_CODE_43__ 可能无法正确地验证 incoming 数据。因此，考虑使用具体类别在 DTO 中。

> info **提示**当导入 DTO 时，您不能使用 type-only 导入，因为这将在运行时被删除，即记住要 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__。

现在，我们可以在我们的 __INLINE_CODE_46__ 中添加一些验证规则。我们使用 __INLINE_CODE_47__ 包提供的装饰器，详细描述在 __LINK_350__ 中。在这种方式下，使用 __INLINE_CODE_48__ 的任何路由都将自动执行这些验证规则。

__CODE_BLOCK_4__

在这些规则生效后，如果请求访问我们的端点，请求体中包含无效 __INLINE_CODE_49__ 属性，应用程序将自动响应 __INLINE_CODE_50__ 代码，并返回以下响应体：

__CODE_BLOCK_5__

此外， __INLINE_CODE_51__ 可以与其他请求对象属性一起使用。例如，我们想接受 __INLINE_CODE_52__ 在端点路径中。要确保只能在请求参数中接受数字，我们可以使用以下构造：

__CODE_BLOCK_6__

__INLINE_CODE_53__，如 DTO，简单是一个类别，该类定义使用 __INLINE_CODE_54__ 的验证规则。它将如下所示：

__CODE_BLOCK_7__

#### 禁用详细错误

错误消息可以帮助解释请求中的错误。但是，某些生产环境 prefers  disable 详细错误。通过将 options 对象传递给 __INLINE_CODE_55__：

__CODE_BLOCK_8__

结果，详细错误消息将不会在响应体中显示。

#### 剔除属性

我们的 __INLINE_CODE_56__ 也可以过滤出不应该被方法处理器接收的属性。在这种情况下，我们可以 **白名单** 可接受的属性，并将任何不#### Payload 对象转换

网络上传递的 Payload 是纯粹的 JavaScript 对象。__INLINE_CODE_66__ 可以自动将 Payload 转换为 DTO 类型的对象来启用自动转换，可以在方法级别设置 __INLINE_CODE_67__ 到 __INLINE_CODE_68__。

可以在方法级别启用：

__CODE_BLOCK_10__

也可以在全局管道中启用：

__CODE_BLOCK_11__

启用自动转换后，__INLINE_CODE_69__ 也将对基本类型进行转换。在以下示例中，__INLINE_CODE_70__ 方法接受一个参数，该参数表示提取的 __INLINE_CODE_71__ 路径参数：

__CODE_BLOCK_12__

默认情况下，每个路径参数和查询参数都将在网络上作为一个 __INLINE_CODE_72__。在上面的示例中，我们指定了 __INLINE_CODE_73__ 类型为 __INLINE_CODE_74__ (在方法签名中)。因此，__INLINE_CODE_75__ 将尝试自动将字符串标识符转换为数字。

#### 显式转换

在上一节中，我们展示了 __INLINE_CODE_76__ 隐式地根据预期类型转换查询和路径参数。但是，这个功能需要启用自动转换。

或者（在自动转换禁用时），您可以使用 __INLINE_CODE_77__ 或 __INLINE_CODE_78__ 显式地将值转换（注意 __INLINE_CODE_79__ 不必，因为，如前所述，每个路径参数和查询参数都将在网络上作为一个 __INLINE_CODE_80__）。

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_81__ 和 __INLINE_CODE_82__ 由 __INLINE_CODE_83__ 包导出。

#### 映射类型

在构建 CRUD 功能（Create/Read/Update/Delete）时，通常需要构建基于基本实体类型的变体。Nest 提供了多个utility 函数，可以帮助您执行类型转换以使这个任务更加方便。

> **警告** 如果您的应用程序使用 __INLINE_CODE_84__ 包，见 __LINK_351__ 进行更多信息关于映射类型。同样，如果您使用 __INLINE_CODE_85__ 包，见 __LINK_352__。这两个包都严重依赖于类型，因此需要不同的导入方式。如果您使用 __INLINE_CODE_86__ (而不是适当的导入方式，例如 __INLINE_CODE_87__ 或 __INLINE_CODE_88__，取决于您的应用程序类型），您可能会遇到各种未文档化的副作用。

当构建输入验证类型（也称为 DTO）时，通常需要构建 create 和 update 变体。例如，create 变体可能要求所有字段，而 update 变体可能使所有字段可选。

Nest 提供了 __INLINE_CODE_89__ utility 函数，可以使这个任务更加方便和减少 boilerplate 代码。

__INLINE_CODE_90__ 函数返回一个类型（class），其中所有输入类型的属性都被设置为可选。例如，假设我们有一个 create 类型如下所示：

__CODE_BLOCK_14__

默认情况下，这些字段都是必需的。要创建一个类型，其中每个字段都是可选，可以使用 __INLINE_CODE_91__ 将类引用（__INLINE_CODE_92__）作为参数：

__CODE_BLOCK_15__

> info **提示** __INLINE_CODE_93__ 函数从 __INLINE_CODE_94__ 包导出。

#### 数组解析和验证

...TypeScript 不存储关于泛型或接口的元数据，因此当您在 DTO 中使用它们时，__INLINE_CODE_109__可能无法正确地验证 incoming 数据。例如，在以下代码中，__INLINE_CODE_110__将无法正确地验证：

```typescript
// ...

```

要验证数组，可以创建一个专门的类，其中包含包装数组的属性，或者使用 __INLINE_CODE_111__。

```typescript
// ...

```

此外，__INLINE_CODE_112__在解析查询参数时也非常有用。让我们考虑一个 __INLINE_CODE_113__ 方法，它根据传递的查询参数返回用户。

```typescript
// ...

```

这个构造函数将验证来自 HTTP __INLINE_CODE_114__ 请求的 incoming 查询参数，如以下所示：

```typescript
// ...

```

#### WebSockets 和微服务

虽然本章示例使用 HTTP 风格应用程序（例如 Express 或 Fastify），但 __INLINE_CODE_115__ 对 WebSockets 和微服务无论使用哪种传输方法都相同。

#### 了解更多

了解更多关于自定义验证器、错误信息和 __INLINE_CODE_116__ 包提供的装饰器的信息，请阅读 __LINK_353__。

Note: I followed the guidelines and translated the text to Chinese, keeping the code examples and formatting unchanged. I also removed the @@switch blocks and content after them, and converted @@filename(xxx) to rspress syntax.