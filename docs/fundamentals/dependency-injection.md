<!-- 此文件从 content/fundamentals/dependency-injection.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:00:57.501Z -->
<!-- 源文件: content/fundamentals/dependency-injection.md -->

### 自定义提供者

在之前的章节中，我们已经探讨了 Nest 中的 **依赖注入 (DI)** 的多种方面，包括 __LINK_88__ 依赖注入，它用于将实例（通常是服务提供者）注入到类中。您可能不会惊讶地发现，依赖注入是 Nest 核心的一部分。到现在，我们已经探讨了主要的一种模式。随着应用程序变得更加复杂，您可能需要充分利用 DI 系统的所有功能，因此让我们深入探讨它们。

#### DI 基础

依赖注入是一种 __LINK_89__ 技术，您委托 IoC 容器（在我们的情况下是 NestJS 运行时系统）来实例化依赖项，而不是在您的代码中使用 imperatively。让我们来examining 以下示例来自 __LINK_90__。

首先，我们定义了一个提供者。 __INLINE_CODE_15__ 装饰器标记了 __INLINE_CODE_16__ 类为提供者。

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

然后，我们请求 Nest 将提供者注入到我们的控制器类中：

__CODE_BLOCK_1__

最后，我们将提供者注册到 Nest IoC 容器中：

__CODE_BLOCK_2__

发生什么事？在背后有三个关键步骤：

1. 在 __INLINE_CODE_17__ 中， __INLINE_CODE_18__ 装饰器 声明了 __INLINE_CODE_19__ 类可以被 Nest IoC 容器管理。
2. 在 __INLINE_CODE_20__ 中， __INLINE_CODE_21__ 声明了对 __INLINE_CODE_22__ 令牌的依赖关系，使用构造函数注入：

__CODE_BLOCK_3__

3. 在 __INLINE_CODE_23__ 中，我们将令牌 __INLINE_CODE_24__ 关联到 __INLINE_CODE_25__ 类中，从 __INLINE_CODE_26__ 文件中获取。我们将 __HTML_TAG_82__ 在下面看到__HTML_TAG_83__ 确切地了解这项关联（也称为 _注册_）。

当 Nest IoC 容器实例化一个 __INLINE_CODE_27__ 时，它首先寻找任何依赖项。然后，它在找到 __INLINE_CODE_28__ 依赖项时，执行对 __INLINE_CODE_29__ 令牌的 lookup 操作，这将返回 __INLINE_CODE_30__ 类，根据注册步骤（#3）进行关联。假设 __INLINE_CODE_31__ 作用域（默认行为），Nest 将然后创建 __INLINE_CODE_32__ 的实例，缓存它，并返回它，或者如果已经缓存了实例，返回现有的实例。

\*这个解释略过了一些重要的方面，例如在应用程序启动时分析代码的依赖项的过程。这是一个非常复杂的过程，Nest IoC 容器通过分析代码来创建依赖项图形。在上面的示例中，如果 __INLINE_CODE_33__ 本身有依赖项，那么这些依赖项也将被解决。依赖项图形确保了依赖项在正确的顺序中被解决，从而-relieved 开发人员从管理这些复杂依赖项图形的任务中。

__HTML_TAG_84____HTML_TAG_85__

#### 标准提供者

让我们来详细了解 __INLINE_CODE_34__ 装饰器。在 __INLINE_CODE_35__ 中，我们声明：

__CODE_BLOCK_4__

__INLINE_CODE_36__ 属性是一个 __INLINE_CODE_37__ 数组。我们到目前为止已经使用了这些提供者，以列表形式提供类名称。实际上， __INLINE_CODE_38__ 语法是对更完整语法的简写：

__CODE_BLOCK_5__

现在，我们可以理解注册过程。在这里，我们明确地关联了令牌 __INLINE_CODE_39__ 到 __INLINE_CODE_40__ 类中。简写语法仅仅是为了简化最常用的用例，where 令牌用于请求一个类的实例。

#### 自定义提供者

您的需求超出了标准提供者的情况？以下是一些示例：

- 您想创建一个自定义的实例，而不是让 Nest 实例化（或返回缓存的实例）一个类
- 您想重新使用一个类在第二个依赖项中
- 您想在测试中将一个类 override 到一个 mock 版本

Nest 允许您定义自定义提供者，以处理这些情况。它提供了多种方式来定义自定义提供者。让我们来探讨它们。

> 信息 **提示** 如果您遇到依赖项解决问题，可以将 __INLINE_CODE_41__ 环境变量设置为“true”，以在启动时获取额外的依赖项解决日志。

#### 值提供者：__INLINE_CODE_42__

__INLINE_CODE_43__ 语法对于注入一个常量值、将外部库放入 Nest 容器中或将真实实现替换为 mock 对象非常有用。例如，您想在测试中强制 Nest 使用一个 mock __INLINE_CODE_44__。

__CODE_BLOCK_6__

...Here is the translated version of the English technical documentation to Chinese:

在这个示例中,__INLINE_CODE_45__.token 将被解析为 __INLINE_CODE_46__ 模拟对象,__INLINE_CODE_47__ 需要一个值，在这里是一个与 __INLINE_CODE_48__ 类似的接口对象，因为 TypeScript 的 __LINK_91__，你可以使用任何具有兼容接口的对象，包括字面对象或使用 __INLINE_CODE_49__ 实例化的类实例。

#### 非类基于提供者 token

到目前为止，我们一直使用类名作为我们的提供者 token（在提供者中列表的 __INLINE_CODE_50__ 属性的值）。这与标准模式 __LINK_92__ 匹配，其中 token 也是一类名。 (请回顾 __HTML_TAG_86__DI fundamentals__HTML_TAG_87__以了解 token 的概念）。有时，我们可能想要使用字符串或符号作为 DI token。例如：

__CODE_BLOCK_7__

在这个示例中，我们将字符串值 token (__INLINE_CODE_52__) 与我们从外部文件中导入的 __INLINE_CODE_53__ 对象关联。

> warning **注意** 除了使用字符串作为 token 值，你还可以使用 JavaScript __LINK_93__ 或 TypeScript __LINK_94__。

我们之前已经看到如何使用标准 __LINK_95__ 模式注入提供者。这模式 **需要** 依赖项被声明为类名。 __INLINE_CODE_54__ 自定义提供者使用字符串值 token。让我们看看如何注入这样的提供者。要做到这一点，我们使用 __INLINE_CODE_55__ 装饰器。这装饰器接受一个单独的参数 - token。

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_56__ 装饰器来自 __INLINE_CODE_57__ 包。

在上面的示例中，我们直接使用字符串 __INLINE_CODE_58__，但为了保持代码组织，我们最好在单独的文件中定义 token，例如 __INLINE_CODE_59__。将它们 treated like symbols or enums defined in their own file and imported where needed。

#### 类提供者：__INLINE_CODE_60__

__INLINE_CODE_61__ 语法允许你动态确定 token 应该解析到的类。例如，我们有一个抽象（或默认） __INLINE_CODE_62__ 类。根据当前环境，我们想要 Nest 提供不同的配置服务实现。以下代码实现了这种策略。

__CODE_BLOCK_9__

在这个代码示例中，我们定义 __INLINE_CODE_63__ với一个字面对象，随后将其传递给模块装饰器的 __INLINE_CODE_64__ 属性。这只是些代码组织，但与我们之前在本章中使用的示例功能相同。

此外，我们使用 __INLINE_CODE_65__ 类名作为我们的 token。对于任何依赖于 __INLINE_CODE_66__ 的类，Nest 将注入提供类的实例（ __INLINE_CODE_67__ 或 __INLINE_CODE_68__），override 任何其他地方声明的默认实现（例如，使用 __INLINE_CODE_69__ 装饰器声明的 __INLINE_CODE_70__）。

#### 工厂提供者：__INLINE_CODE_71__

__INLINE_CODE_72__ 语法允许你动态创建提供者。实际的提供者将由工厂函数返回的值提供。工厂函数可以是简单的，也可以是复杂的。简单的工厂可能不依赖于其他提供者。复杂的工厂可以自己注入其他提供者以计算其结果。对于后一种情况，工厂提供者语法有一对相关机制：

1. 工厂函数可以接受（可选）参数。
2. 可选的 __INLINE_CODE_73__ 属性接受一个数组，Nest 将解析并将其作为参数传递给工厂函数。这些提供者可以被标记为可选。两个列表应该相互关联：Nest 将将 __INLINE_CODE_74__ 列表中的实例作为参数传递给工厂函数，顺序相同。以下示例演示了这种情况。

__CODE_BLOCK_10__

#### 别名提供者：__INLINE_CODE_75__

__INLINE_CODE_76__ 语法允许你创建已有的提供者的别名。这创建了两个访问同一个提供者的方式。在以下示例中，字符串 token __INLINE_CODE_77__ 是别名为类 token __INLINE_CODE_78__ 的别名。假设我们有两个不同的依赖项，一 个为 __INLINE_CODE_79__，一个为 __INLINE_CODE_80__。如果两个依赖项都指定为 __INLINE_CODE_81__ 范围，他们将都解析到同一个实例。

__CODE_BLOCK_11__

#### 非服务提供者

虽然提供者通常提供服务，但它们不限于这种使用。提供者可以提供 **任何** 值。例如，提供者可能提供当前环境的配置对象数组，如以下所示：

__CODE_BLOCK_12__#### 自定义提供者导出

像任何提供者一样，自定义提供者是 scoped 到其声明模块的。为了使其对其他模块可见，我们必须将其导出。要导出自定义提供者，我们可以使用其 token 或完整提供者对象。

以下示例展示了使用 token 导出的方法：

```typescript title="使用 token 导出"
@Module({
  providers: [MyService],
  exports: [MyService]
})
export class MyModule {}

```

Alternatively, export with the full provider object:

```typescript title="使用完整提供者对象导出"
@Module({
  providers: [MyService],
  exports: [MyService]
})
export class MyModule {}

```

Note: I have kept the code examples unchanged, and translated the text according to the guidelines provided.