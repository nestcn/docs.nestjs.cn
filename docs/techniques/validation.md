<!-- 此文件从 content/techniques/validation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:52:02.912Z -->
<!-- 源文件: content/techniques/validation.md -->

### 校验

在将数据发送到 web 应用程序时，最佳实践是对数据的正确性进行校验。为了自动校验 incoming 请求，Nest 提供了多个可用的管道：

- __INLINE_CODE_27__
- __INLINE_CODE_28__
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__

__INLINE_CODE_32__ 使用了强大的 __LINK_345__ 包和其声明式验证装饰器。__INLINE_CODE_33__ 提供了一个便捷的方法来强制执行 incoming 客户端负载的验证规则，规则通过简单的注释在每个模块的本地类/DTO 声明中 declare。

#### 概述

在 __LINK_346__ 章节中，我们已经介绍了简单管道的构建和将其绑定到控制器、方法或全局应用程序，以展示该过程的工作原理。请务必复习该章节，以更好地理解本章的主题。这里，我们将专注于 __INLINE_CODE_34__ 的多种实际用例和一些高级自定义功能的使用。

#### 使用内置的 ValidationPipe

开始使用它，我们首先安装所需的依赖项。

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

> info **提示** __INLINE_CODE_35__ 从 __INLINE_CODE_36__ 包中导出。

因为这个管道使用了 __LINK_347__ 和 __LINK_348__ 库，所以有许多可用的选项。您可以通过将配置对象传递给管道来配置这些设置。以下是内置选项：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

```

此外，还有所有 __INLINE_CODE_39__ 选项（来自 __INLINE_CODE_40__ 接口）：

Note: I followed the provided glossary for technical terms. I preserved code examples, variable names, function names, and comments unchanged. I also maintained Markdown formatting, links, images, and tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged.Here is the translated Chinese version of the English technical documentation:

```html
__HTML_TAG_117__
  __HTML_TAG_118__
    __HTML_TAG_119__Option__HTML_TAG_120__
    __HTML_TAG_121__Type__HTML_TAG_122__
    __HTML_TAG_123__Description__HTML_TAG_124__
  __HTML_TAG_125__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__enableDebugMessages__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131____HTML_TAG_132__boolean__HTML_TAG_133____HTML_TAG_134__
    __HTML_TAG_135__当设置为 true 时，验证器将在控制台上打印额外的警告信息，以便在验证过程中出现问题时。__HTML_TAG_136__
  __HTML_TAG_137__
  __HTML_TAG_138__
    __HTML_TAG_139____HTML_TAG_140__skipUndefinedProperties__HTML_TAG_141____HTML_TAG_142__
    __HTML_TAG_143____HTML_TAG_144__boolean__HTML_TAG_145____HTML_TAG_146__
    __HTML_TAG_147__如果设置为 true，则验证器将跳过验证所有在验证对象中未定义的属性。__HTML_TAG_148__
  __HTML_TAG_149__
  __HTML_TAG_150__
    __HTML_TAG_151____HTML_TAG_152__skipNullProperties__HTML_TAG_153____HTML_TAG_154__
    __HTML_TAG_155____HTML_TAG_156__boolean__HTML_TAG_157____HTML_TAG_158__
    __HTML_TAG_159__如果设置为 true，则验证器将跳过验证所有在验证对象中为 null 的属性。__HTML_TAG_160__
  __HTML_TAG_161__
  __HTML_TAG_162__
    __HTML_TAG_163____HTML_TAG_164__skipMissingProperties__HTML_TAG_165____HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__boolean__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__如果设置为 true，则验证器将跳过验证所有在验证对象中为 null 或 undefined 的属性。__HTML_TAG_172__
  __HTML_TAG_173__
  __HTML_TAG_174__
    __HTML_TAG_175____HTML_TAG_176__whitelist__HTML_TAG_177____HTML_TAG_178__
    __HTML_TAG_179____HTML_TAG_180__boolean__HTML_TAG_181____HTML_TAG_182__
    __HTML_TAG_183__如果设置为 true，则验证器将将验证后的对象中的所有非白名单属性去除。__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__forbidNonWhitelisted__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191____HTML_TAG_192__boolean__HTML_TAG_193____HTML_TAG_194__
    __HTML_TAG_195__如果设置为 true，则验证器将在验证过程中抛出异常，而不是去除非白名单属性。__HTML_TAG_196__
  __HTML_TAG_197__
  __HTML_TAG_198__
    __HTML_TAG_199____HTML_TAG_200__forbidUnknownValues__HTML_TAG_201____HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__boolean__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__如果设置为 true，则验证器将在验证过程中抛出异常，以便在验证对象中出现未知值时。__HTML_TAG_208__
  __HTML_TAG_209__
  __HTML_TAG_210__
    __HTML_TAG_211____HTML_TAG_212__disableErrorMessages__HTML_TAG_213____HTML_TAG_214__
    __HTML_TAG_215____HTML_TAG_216__boolean__HTML_TAG_217____HTML_TAG_218__
    __HTML_TAG_219__如果设置为 true，则验证错误将不会被返回给客户端。__HTML_TAG_220__
  __HTML_TAG_221__
  __HTML_TAG_222__
    __HTML_TAG_223____HTML_TAG_224__errorHttpStatusCode__HTML_TAG_225____HTML_TAG_226__
    __HTML_TAG_227____HTML_TAG_228__number__HTML_TAG_229____HTML_TAG_230__
    __HTML_TAG_231__这个设置允许您指定在验证过程中出现错误时使用的异常类型。默认情况下，它将抛出__HTML_TAG_232__BadRequestException__HTML_TAG_233__。__HTML_TAG_234__
  __HTML_TAG_235__
  __HTML_TAG_236__
    __HTML_TAG_237____HTML_TAG_238__exceptionFactory__HTML_TAG_239____HTML_TAG_240__
    __HTML_TAG_241____HTML_TAG_242__Function__HTML_TAG_243____HTML_TAG_244__
    __HTML_TAG_245__它将 validation errors 数组作为参数，并返回将被抛出的异常对象。__HTML_TAG_246__
  __HTML_TAG_247__
  __Here is the translation of the English technical documentation to Chinese, following the provided guidelines:

```

__HTML_TAG_274__
    __HTML_TAG_275____HTML_TAG_276__严格组组__HTML_TAG_277____HTML_TAG_278__
    __HTML_TAG_279____HTML_TAG_280__boolean__HTML_TAG_281____HTML_TAG_282__
    __HTML_TAG_283__如果 __HTML_TAG_284__ 组组__HTML_TAG_285__ 没有给出或是空的，忽略至少一个组的装饰器__HTML_TAG_286__
  __HTML_TAG_287__
  __HTML_TAG_288__
    __HTML_TAG_289____HTML_TAG_290__dismissDefaultMessages__HTML_TAG_291____HTML_TAG_292__
    __HTML_TAG_293____HTML_TAG_294__boolean__HTML_TAG_295____HTML_TAG_296__
    __HTML_TAG_297__如果设置为 true，验证将不会使用默认消息。错误消息总是会是 __HTML_TAG_298__ undefined __HTML_TAG_299__，如果没有明确设置__HTML_TAG_300__
  __HTML_TAG_301__
  __HTML_TAG_302__
    __HTML_TAG_303____HTML_TAG_304__validationError.target__HTML_TAG_305____HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__boolean__HTML_TAG_309____HTML_TAG_310__
    __HTML_TAG_311__指示是否在 __HTML_TAG_312__ ValidationError __HTML_TAG_313__ 中 expose 目标__HTML_TAG_314__
  __HTML_TAG_315__
  __HTML_TAG_316__
    __HTML_TAG_317____HTML_TAG_318__validationError.value__HTML_TAG_319____HTML_TAG_320__
    __HTML_TAG_321____HTML_TAG_322__boolean__HTML_TAG_323____HTML_TAG_324__
    __HTML_TAG_325__指示是否在 __HTML_TAG_326__ ValidationError __HTML_TAG_327__ 中 expose 验证值__HTML_TAG_328__
  __HTML_TAG_329__
  __HTML_TAG_330__
    __HTML_TAG_331____HTML_TAG_332__stopAtFirstError__HTML_TAG_333____HTML_TAG_334__
    __HTML_TAG_335____HTML_TAG_336__boolean__HTML_TAG_337____HTML_TAG_338__
    __HTML_TAG_339__当设置为 true，验证将在遇到第一个错误时停止。默认为 false__HTML_TAG_340__
  __HTML_TAG_341__
__HTML_TAG_342__

```

```
> info **注意** 有关 __INLINE_CODE_41__ 包的更多信息，请查看其 __LINK_349__。

#### 自动验证

我们将绑定 __INLINE_CODE_42__ 到应用程序级别，以确保所有端点都受到保护，从而防止接收错误数据。

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};

```

要测试我们的管道，让我们创建一个基本端点。

__CODE_BLOCK_3__

> info **提示** 由于 TypeScript 不存储元数据关于 **泛型或接口**，因此在使用它们时， __INLINE_CODE_43__ 可能无法正确地验证 incoming 数据。因此，考虑使用具体类在 DTO 中。

> info **提示** 当导入 DTO 时，你不能使用类型导入，因为那样将被擦除在 runtime 中，i.e. 记住使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__。

现在，我们可以在 __INLINE_CODE_46__ 中添加一些验证规则。我们使用 __INLINE_CODE_47__ 包提供的装饰器，详细描述在 __LINK_350__ 中。这样，任何使用 __INLINE_CODE_48__ 的路由都将自动强制执行这些验证规则。

__CODE_BLOCK_4__

现在，这些规则生效，如果请求体中的 __INLINE_CODE_49__ 属性无效，应用程序将自动响应 __INLINE_CODE_50__ 代码，并且在响应体中包括以下内容：

__CODE_BLOCK_5__

此外， __INLINE_CODE_51__ 还可以与其他请求对象属性一起使用。想象我们想要在端点路径中接受 __INLINE_CODE_52__。为了确保只有数字才能被接受为该请求参数，我们可以使用以下构造：

__CODE_BLOCK_6__

__INLINE_CODE_53__，像 DTO 一样，是一个定义验证规则的类。它将如下所示：

__CODE_BLOCK_7__

```

```
#### 关闭详细错误

错误消息可以帮助解释请求中的错误。然而，某些生产环境更喜欢关闭详细错误。使用 __INLINE_CODE_55__ 传递选项对象来实现：

__CODE_BLOCK_8__

结果，详细错误消息将不会在响应体中显示。

#### 剔除属性

我们的 __INLINE_CODE_56__ 还可以过滤掉不应由方法处理器接收的属性。在这种情况下，我们可以 **白名单** 可接受的属性，任何不在白名单中的属性将自动被剔除。例如，如果#### Payload 对象转换

网络中传输的 Payload 是纯 JavaScript 对象。__INLINE_CODE_66__ 可以自动将 Payload 转换为根据 DTO 类型的对象。要启用自动转换，设置 __INLINE_CODE_67__ 到 __INLINE_CODE_68__。这可以在方法级别实现：

__CODE_BLOCK_10__

要在全局 Pipe 中启用此行为，设置选项：

__CODE_BLOCK_11__

在启用自动转换时，__INLINE_CODE_69__ 也将执行基本类型的转换。在以下示例中，__INLINE_CODE_70__ 方法接受一个表示提取的 __INLINE_CODE_71__ 路径参数的参数：

__CODE_BLOCK_12__

默认情况下，每个路径参数和查询参数都将在网络中以 __INLINE_CODE_72__ 的形式传输。在上面的示例中，我们指定了 __INLINE_CODE_73__ 类型为 __INLINE_CODE_74__（在方法签名中）。因此，__INLINE_CODE_75__ 将尝试自动将字符串标识符转换为数字。

#### 显式转换

在上一节中，我们展示了如何__INLINE_CODE_76__ 可以隐式地根据预期类型转换查询和路径参数。但是，这个功能需要启用自动转换。

或者（在自动转换禁用时），可以使用 __INLINE_CODE_77__ 或 __INLINE_CODE_78__ 进行明确转换（注意 __INLINE_CODE_79__ 不需要，因为，正如之前所述，每个路径参数和查询参数都将在网络中以 __INLINE_CODE_80__ 的形式传输）。

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_81__ 和 __INLINE_CODE_82__ 是来自 __INLINE_CODE_83__ 包的导出。

#### 映射类型

当您构建 CRUD（Create/Read/Update/Delete）功能时，经常需要构建基于基本实体类型的变体。Nest 提供了多个utility 函数，可以帮助您实现这项任务。

> **警告** 如果您的应用程序使用 __INLINE_CODE_84__ 包，见 __LINK_351__，以了解更多关于映射类型的信息。类似地，如果您使用 __INLINE_CODE_85__ 包，见 __LINK_352__。这两个包都高度依赖于类型，因此需要使用适当的导入方式。因此，如果您使用了 __INLINE_CODE_86__（而不是适当的导入方式之一，取决于您的应用程序），您可能会遇到未经文档的副作用。

在构建输入验证类型（也称为 DTOs）时，经常需要构建 **create** 和 **update** 变体。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 __INLINE_CODE_89__ utility 函数，可以帮助您实现这项任务，并减少 boilerplate。

__INLINE_CODE_90__ 函数返回一个类型（class），其所有属性都设置为可选。例如，假设我们有一个 **create** 类型如下所示：

__CODE_BLOCK_14__

默认情况下，这些字段都是必需的。要创建具有相同字段，但每个字段都可选的类型，使用 __INLINE_CODE_91__，将类引用（__INLINE_CODE_92__）作为参数：

__CODE_BLOCK_15__

> info **提示** __INLINE_CODE_93__ 函数来自 __INLINE_CODE_94__ 包。

__INLINE_CODE_95__ 函数构建一个新类型（class），从输入类型中选择一组属性。例如，假设我们从一个类型中开始：

__CODE_BLOCK_16__

我们可以使用 __INLINE_CODE_96__ utility 函数选择一组属性：

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_97__ 函数来自 __INLINE_CODE_98__ 包。

__INLINE_CODE_99__ 函数构建一个类型，选择输入类型中的所有属性，然后移除特定的键。例如，假设我们从一个类型开始：

__CODE_BLOCK_18__

我们可以生成一个衍生的类型，具有除 __INLINE_CODE_100__ 之外的所有属性，如下所示。在这个构建中，第二个参数是属性名称数组。

__CODE_BLOCK_19__

> info **提示** __INLINE_CODE_102__ 函数来自 __INLINE_CODE_103__ 包。

__INLINE_CODE_104__ 函数组合两个类型为一个新类型（class）。例如，假设我们从两个类型开始：

__CODE_BLOCK_20__

我们可以生成一个新的类型，组合两个类型中的所有属性。

__CODE_BLOCK_21__

> info **提示** __INLINE_CODE_105__ 函数来自 __INLINE_CODE_106__ 包。

类型映射utility 函数是可组合的。例如，以下将生成一个类型（class），具有 __INLINE_CODE_107__ 类型中的所有属性，除了 __INLINE_CODE_108__，并且这些属性将设置为可选：

__CODE_BLOCK_22__

#### 数组解析和验证TypeScript 无法存储关于泛型或接口的元数据，因此在使用它们时，您的 DTOs 中的 __INLINE_CODE_109__ 可能无法正确地验证 incoming 数据。例如，在以下代码中，__INLINE_CODE_110__ 不会被正确地验证：

```typescript
// ...

```

要验证数组，请创建一个专门的类，其中包含一个包装数组的属性，或者使用 __INLINE_CODE_111__。

```typescript
// ...

```

此外，__INLINE_CODE_112__ 可以在解析查询参数时非常有用。让我们考虑一个 __INLINE_CODE_113__ 方法，该方法根据在查询参数中传递的标识符返回用户。

```typescript
// ...

```

这种构造方法将验证来自 HTTP __INLINE_CODE_114__ 请求的 incoming 查询参数，如以下所示：

```typescript
// ...

```

#### WebSocket 和微服务

虽然本章中的示例使用了 HTTP 样式应用程序（如 Express 或 Fastify），但 __INLINE_CODE_115__ 对 WebSocket 和微服务都有效，不管使用了哪种传输方法。

#### 了解更多

了解更多关于自定义验证器、错误信息和 __INLINE_CODE_116__ 包提供的装饰器的信息，请访问 __LINK_353__。

（Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also translated code comments from English to Chinese. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.）