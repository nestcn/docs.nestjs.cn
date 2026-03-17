<!-- 此文件从 content/techniques/validation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:38:45.523Z -->
<!-- 源文件: content/techniques/validation.md -->

### 验证

在将数据发送到 Web 应用程序时，最佳实践是验证数据的正确性。为了自动验证 incoming 请求，Nest 提供了多个可用管道：

- __INLINE_CODE_27__
- __INLINE_CODE_28__
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__

__INLINE_CODE_32__ 使用了强大的 __LINK_345__ 包含的声明式验证装饰器。__INLINE_CODE_33__ 提供了一个便捷的方法来强制执行对所有 incoming 客户端 payload 的验证规则，其中具体规则是使用简单的注解在每个模块中的本地类/DTO 声明中声明的。

#### 概述

在 __LINK_346__ 章节中，我们详细介绍了简单的管道和将其绑定到控制器、方法或全局应用程序的过程，以便更好地理解本章的主题。这里，我们将专门讨论 __INLINE_CODE_34__ 的多种实际应用场景，并展示一些高级自定义功能的使用。

#### 使用内置的 ValidationPipe

要开始使用它，我们首先安装必需的依赖项。

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

> info **提示** __INLINE_CODE_35__ 是来自 __INLINE_CODE_36__ 包含的。

因为这个管道使用了 __LINK_347__ 和 __LINK_348__ 库，因此有很多可选项。您可以通过将配置对象传递给管道来配置这些设置。以下是内置选项：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

```

此外，还有所有 __INLINE_CODE_39__ 选项（来自 __INLINE_CODE_40__ 界面）：

请注意：所有 @@switch 块和内容都已被删除。 @@filename(xxx) 已被转换为 rspress 语法：```typescript title="xxx"。内部锚点保持不变（将在后续映射）。以下是翻译后的中文文档：

__HTML_TAG_117__
  __HTML_TAG_118__
    __HTML_TAG_119__选项__HTML_TAG_120__
    __HTML_TAG_121__类型__HTML_TAG_122__
    __HTML_TAG_123__描述__HTML_TAG_124__
  __HTML_TAG_125__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__enableDebugMessages__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131____HTML_TAG_132__布尔值__HTML_TAG_133____HTML_TAG_134__
    __HTML_TAG_135__如果设置为 true，验证器将在控制台打印额外的警告消息，以便指示某些事情不正确。__HTML_TAG_136__
  __HTML_TAG_137__
  __HTML_TAG_138__
    __HTML_TAG_139____HTML_TAG_140__skipUndefinedProperties__HTML_TAG_141____HTML_TAG_142__
    __HTML_TAG_143____HTML_TAG_144__布尔值__HTML_TAG_145____HTML_TAG_146__
    __HTML_TAG_147__如果设置为 true，则验证器将忽略在验证对象中 undefined 的所有属性。__HTML_TAG_148__
  __HTML_TAG_149__
  __HTML_TAG_150__
    __HTML_TAG_151____HTML_TAG_152__skipNullProperties__HTML_TAG_153____HTML_TAG_154__
    __HTML_TAG_155____HTML_TAG_156__布尔值__HTML_TAG_157____HTML_TAG_158__
    __HTML_TAG_159__如果设置为 true，则验证器将忽略在验证对象中 null 的所有属性。__HTML_TAG_160__
  __HTML_TAG_161__
  __HTML_TAG_162__
    __HTML_TAG_163____HTML_TAG_164__skipMissingProperties__HTML_TAG_165____HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__布尔值__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__如果设置为 true，则验证器将忽略在验证对象中 null 或 undefined 的所有属性。__HTML_TAG_172__
  __HTML_TAG_173__
  __HTML_TAG_174__
    __HTML_TAG_175____HTML_TAG_176__whiteList__HTML_TAG_177____HTML_TAG_178__
    __HTML_TAG_179____HTML_TAG_180__布尔值__HTML_TAG_181____HTML_TAG_182__
    __HTML_TAG_183__如果设置为 true，验证器将将验证后的对象中所有不使用任何验证装饰器的属性去除。__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__forbidNonWhitelisted__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191____HTML_TAG_192__布尔值__HTML_TAG_193____HTML_TAG_194__
    __HTML_TAG_195__如果设置为 true，则验证器将在验证对象中抛出异常，而不是去除非白名单属性。__HTML_TAG_196__
  __HTML_TAG_197__
  __HTML_TAG_198__
    __HTML_TAG_199____HTML_TAG_200__forbidUnknownValues__HTML_TAG_201____HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__布尔值__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__如果设置为 true，则验证对象中 unknown 对象的验证将立即失败。__HTML_TAG_208__
  __HTML_TAG_209__
  __HTML_TAG_210__
    __HTML_TAG_211____HTML_TAG_212__disableErrorMessages__HTML_TAG_213____HTML_TAG_214__
    __HTML_TAG_215____HTML_TAG_216__布尔值__HTML_TAG_217____HTML_TAG_218__
    __HTML_TAG_219__如果设置为 true，则验证错误将不返回给客户端。__HTML_TAG_220__
  __HTML_TAG_221__
  __HTML_TAG_222__
    __HTML_TAG_223____HTML_TAG_224__errorHttpStatusCode__HTML_TAG_225____HTML_TAG_226__
    __HTML_TAG_227____HTML_TAG_228__数字__HTML_TAG_229____HTML_TAG_230__
    __HTML_TAG_231__这个设置允许您指定在错误时使用的异常类型。默认情况下，它抛出 __HTML_TAG_232__BadRequestException__HTML_TAG_233__。__HTML_TAG_234__
  __HTML_TAG_235__
  __HTML_TAG_236__
    __HTML_TAG_237____HTML_TAG_238__exceptionFactory__HTML_TAG_239____HTML_TAG_240__
    __HTML_TAG_241____HTML_TAG_242__函数__HTML_TAG_243____HTML_TAG_244__
    __HTML_TAG_245__它将一个验证错误的数组作为参数，并返回要抛出的异常对象。__HTML_TAG_246__
  __HTML_TAG_247__
  __HTML_TAG_248__
    __HTML_TAGHere is the translation of the provided English technical documentation to Chinese:

 __HTML_TAG_274__
    __HTML_TAG_275____HTML_TAG_276__严格组组__HTML_TAG_277____HTML_TAG_278__
    __HTML_TAG_279____HTML_TAG_280__boolean__HTML_TAG_281____HTML_TAG_282__
    __HTML_TAG_283__如果 __HTML_TAG_284__ 组组__HTML_TAG_285__ 未给出或为空，忽略带有至少一个组的装饰器__HTML_TAG_286__
  __HTML_TAG_287__
  __HTML_TAG_288__
    __HTML_TAG_289____HTML_TAG_290__DismissDefaultMessages__HTML_TAG_291____HTML_TAG_292__
    __HTML_TAG_293____HTML_TAG_294__boolean__HTML_TAG_295____HTML_TAG_296__
    __HTML_TAG_297__如果设置为 true，验证将不会使用默认消息。错误消息始终将是 __HTML_TAG_298__ undefined __HTML_TAG_299__，如果其未被明确设置__HTML_TAG_300__
  __HTML_TAG_301__
  __HTML_TAG_302__
    __HTML_TAG_303____HTML_TAG_304__验证错误目标__HTML_TAG_305____HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__boolean__HTML_TAG_309____HTML_TAG_310__
    __HTML_TAG_311__指示是否将目标暴露在 __HTML_TAG_312__ ValidationError __HTML_TAG_313__ 中__HTML_TAG_314__
  __HTML_TAG_315__
  __HTML_TAG_316__
    __HTML_TAG_317____HTML_TAG_318__验证错误值__HTML_TAG_319____HTML_TAG_320__
    __HTML_TAG_321____HTML_TAG_322__boolean__HTML_TAG_323____HTML_TAG_324__
    __HTML_TAG_325__指示是否将验证值暴露在 __HTML_TAG_326__ ValidationError __HTML_TAG_327__ 中__HTML_TAG_328__
  __HTML_TAG_329__
  __HTML_TAG_330__
    __HTML_TAG_331____HTML_TAG_332__停止在第一个错误处__HTML_TAG_333____HTML_TAG_334__
    __HTML_TAG_335____HTML_TAG_336__boolean__HTML_TAG_337____HTML_TAG_338__
    __HTML_TAG_339__当设置为 true 时，验证给定属性将停止在遇到第一个错误时。默认为 false__HTML_TAG_340__
  __HTML_TAG_341__
__HTML_TAG_342__

> info **Notice** 了解更多关于 __INLINE_CODE_41__ 包的信息，请访问其 __LINK_349__。

#### 自动验证

我们将从绑定 __INLINE_CODE_42__ 在应用程序级别开始，这样可以确保所有端点都受到保护，防止接收错误数据。

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};

```

要测试我们的管道，让我们创建一个基本端点。

__CODE_BLOCK_3__

> info **Hint**由于 TypeScript 不存储元数据关于 **泛型或接口**，当您使用它们在 DTO 中时， __INLINE_CODE_43__ 可能无法正确验证 incoming 数据。因此，考虑使用具体类在 DTO 中。

> info **Hint**当导入您的 DTO 时，您不能使用 type-only 导入，因为那将在运行时被擦除，即记住使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__。

现在我们可以在我们的 __INLINE_CODE_46__ 中添加一些验证规则。我们使用装饰器来实现，这些装饰器由 __INLINE_CODE_47__ 包提供，详细描述在 __LINK_350__ 中。在这种方式下，任何使用 __INLINE_CODE_48__ 的路由都将自动执行这些验证规则。

__CODE_BLOCK_4__

在这些规则中，如果请求以无效 __INLINE_CODE_49__ 属性在请求体中，应用程序将自动以 __INLINE_CODE_50__ 代码响应，并且带有以下响应体：

__CODE_BLOCK_5__

此外， __INLINE_CODE_51__ 可以与其他请求对象属性一起使用。想象我们想接受 __INLINE_CODE_52__ 在端点路径中。要确保只接受数字为该请求参数，我们可以使用以下构造：

__CODE_BLOCK_6__

__INLINE_CODE_53__，像 DTO 一样，是一个定义验证规则的类。它将如下所示：

__CODE_BLOCK_7__

#### 禁用详细错误

错误消息可以帮助解释请求中的错误。然而，有些生产环境 prefers to disable detailed errors。这样可以通过将 options 对象传递给 __INLINE_CODE_55__：

__CODE_BLOCK_8__

结果，详细错误消息将不在响应体中显示。

#### 删除属性

我们的 __INLINE_CODE_56__ 也可以过滤出不应该由方法处理器接收的属性。在这种情况下，我们可以 **whitelist** 可接受的属性，并将任何不包括在 whitelist 中的属性自动从结果对象中删除。例如，如果我们的**Transform Payload Objects**

payload 对象在网络传输时是纯粹的 JavaScript 对象。可以通过将 `__INLINE_CODE_66__` 设置为 `__INLINE_CODE_67__` 来自动将 payload 转换为 DTO 类型的对象。可以在方法级别实现：

```typescript
__CODE_BLOCK_10__

```

也可以在全局管道中实现：

```typescript
__CODE_BLOCK_11__

```

在自动转换选项启用时，__INLINE_CODE_69__还将执行基本类型的转换。在以下示例中，__INLINE_CODE_70__ 方法接受一个参数，表示提取的__INLINE_CODE_71__路径参数：

```typescript
__CODE_BLOCK_12__

```

默认情况下，每个路径参数和查询参数都将在网络传输时作为__INLINE_CODE_72__字符串。上述示例中，我们指定了__INLINE_CODE_73__类型为__INLINE_CODE_74__，因此__INLINE_CODE_75__将尝试自动将字符串标识符转换为数字。

**显式转换**

在上面部分，我们展示了__INLINE_CODE_76__可以隐式地根据预期类型转换查询和路径参数。但是，这个特性需要自动转换启用。

Alternatively (with auto-transformation disabled), you can explicitly cast values using the __INLINE_CODE_77__ or __INLINE_CODE_78__ (note that __INLINE_CODE_79__ is not needed because, as mentioned earlier, every path parameter and query parameter comes over the network as a __INLINE_CODE_80__ by default).

```typescript
__CODE_BLOCK_13__

```

> info **Hint** The __INLINE_CODE_81__ and __INLINE_CODE_82__ are exported from the __INLINE_CODE_83__ package.

**Mapped Types**

当您构建 CRUD 等功能时，构建基于基础实体类型的变体非常有用。Nest 提供了多种utility 函数，用于类型转换，以简化这个任务。

> **Warning** If your application uses the __INLINE_CODE_84__ package, see __LINK_351__ for more information about Mapped Types. Likewise, if you use the __INLINE_CODE_85__ package see __LINK_352__. Both packages heavily rely on types and so they require a different import to be used. Therefore, if you used __INLINE_CODE_86__ (instead of an appropriate one, either __INLINE_CODE_87__ or __INLINE_CODE_88__ depending on the type of your app), you may face various, undocumented side-effects.

在构建输入验证类型（也称为 DTO）时，构建 create 和 update 变体非常有用。例如，create 变体可能需要所有字段，而 update 变体可能使所有字段可选。

Nest 提供了 __INLINE_CODE_89__ utility 函数，以简化这个任务。

__INLINE_CODE_90__ 函数返回一个类型（class），其中所有输入类型的属性都设置为可选。例如，假设我们有一个 create 类型如下所示：

```typescript
__CODE_BLOCK_14__

```

默认情况下，这些字段都需要。要创建一个类型，其中每个字段都是可选的，可以使用 __INLINE_CODE_91__，将类引用（__INLINE_CODE_92__）作为参数：

```typescript
__CODE_BLOCK_15__

```

> info **Hint** The __INLINE_CODE_93__ function is imported from the __INLINE_CODE_94__ package.

__INLINE_CODE_95__ 函数构建一个新类型（class），从输入类型中选择一组属性。例如，假设我们从一个类型开始：

```typescript
__CODE_BLOCK_16__

```

可以使用 __INLINE_CODE_96__ utility 函数从这个类中选择一组属性：

```typescript
__CODE_BLOCK_17__

```

> info **Hint** The __INLINE_CODE_97__ function is imported from the __INLINE_CODE_98__ package.

__INLINE_CODE_99__ 函数构建一个类型，从输入类型中删除一组键。例如，假设我们从一个类型开始：

```typescript
__CODE_BLOCK_18__

```

可以生成一个派生类型，该类型具有除 __INLINE_CODE_100__ 之外的所有属性。构造中，第二个参数是属性名称数组：

```typescript
__CODE_BLOCK_19__

```

> info **Hint** The __INLINE_CODE_102__ function is imported from the __INLINE_CODE_103__ package.

__INLINE_CODE_104__ 函数将两个类型组合成一个新类型（class）。例如，假设我们从两个类型开始：

```typescript
__CODE_BLOCK_20__

```

可以生成一个新类型，该类型结合了两个类型的所有属性。

```typescript
__CODE_BLOCK_21__

```

> info **Hint** The __INLINE_CODE_105__ function is imported from the __INLINE_CODE_106__ package.

类型映射utility 函数是可组合的。例如，以下将生成一个类型（class），其中所有__INLINE_CODE_107__类型的属性都设置为可选，且除__INLINE_CODE_108__外的所有属性：

```typescript
__CODE_BLOCK_22__

```

#### 处理数组

Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged. Translated code comments from English to Chinese.TypeScript 不会存储泛型或接口的元数据，因此在使用它们时，__INLINE_CODE_109__可能无法正确地验证 incoming 数据。例如，在以下代码中，__INLINE_CODE_110__将无法正确地验证：

```typescript title="示例代码"
// __CODE_BLOCK_23__

```

要验证数组，请创建一个专门的类，其中包含一个包装数组的属性，或者使用 __INLINE_CODE_111__。

```typescript title="示例代码"
// __CODE_BLOCK_24__

```

此外，__INLINE_CODE_112__在解析 query 参数时可能会很有用。让我们考虑一个 __INLINE_CODE_113__ 方法，它根据作为 query 参数传递的标识符返回用户。

```typescript title="示例代码"
// __CODE_BLOCK_25__

```

这构造验证来自 HTTP __INLINE_CODE_114__ 请求的 incoming query 参数，如以下所示：

```typescript title="示例代码"
// __CODE_BLOCK_26__

```

#### WebSocket 和微服务

虽然这个章节使用了 HTTP 风格的应用程序（例如 Express 或 Fastify），但 __INLINE_CODE_115__ 对 WebSocket 和微服务都是相同的，无论使用哪种传输方法。

#### 了解更多

了解更多关于自定义验证器、错误消息和 __INLINE_CODE_116__ 包提供的可用装饰器的信息，请访问 __LINK_353__。