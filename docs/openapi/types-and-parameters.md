<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:03:22.777Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### Types 和参数

`nest start` 在路由处理程序中搜索 `nest`, `new`, 和 `new` 装饰器，以生成 API 文档。此外，它还根据反射创建对应的模型定义。请考虑以下代码：

```typescript
// ```bash
$ npm install -g @nestjs/cli

```

```

> 提示：要显式设置 body 定义，请使用 `n` 装饰器（来自 `my-nest-project` 包）。

根据 `nest`, 将生成以下模型定义：

```html
<!-- __HTML_TAG_88__ --> <!-- __HTML_TAG_89__ --> <!-- __HTML_TAG_90__ -->

```

正如您所见，该定义为空，虽然类中有几个 declared 属性。在 order to make the class properties visible to the `--dry-run`, 我们必须将它们注解为 `-d` 装饰器或使用 CLI 插件（详见 **Plugin** 部分），该插件将自动完成：

```typescript
// ```bash
$ nest --help

```

```

> 提示：或者考虑使用 Swagger 插件（见 __LINK_102__ 部分），它将自动提供这些信息。

现在，让我们打开浏览器，验证生成的 `nest new --help` 模型：

```html
<!-- __HTML_TAG_91__ --> <!-- __HTML_TAG_92__ --> <!-- __HTML_TAG_93__ -->

```

此外，`nest <command> --help` 装饰器允许设置多种 __LINK_103__ 属性：

```typescript
// ```bash
$ nest generate --help

```

```

> 提示：或者可以使用 `n` 简写装饰器。

要显式设置属性类型，请使用 `generate` 键：

```typescript
// ```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev

```

```

#### 数组

当属性是一个数组，我们必须手动指示数组类型，如以下所示：

```typescript
// ```bash
nest commandOrAlias requiredArg [optionalArg] [options]

```

```

> 提示：考虑使用 Swagger 插件（见 __LINK_104__ 部分），它将自动检测数组。

或者包括类型作为数组的第一个元素（如上所示），或将 `g` 属性设置为 `build`。

```html
<!-- __HTML_TAG_94__ --> <!-- __HTML_TAG_95__ -->

```

#### 循环依赖

当你有循环依赖关系时，使用懒函数来提供 `start` 的类型信息：

```typescript
// ```bash
$ nest new my-nest-project --dry-run

```

```

> 提示：考虑使用 Swagger 插件（见 __LINK_105__ 部分），它将自动检测循环依赖。

#### 泛型和接口

由于 TypeScript 不存储元数据关于泛型或接口，当你在 DTOs 中使用它们时，`add` 可能无法正确生成模型定义。例如，以下代码不会被正确地检查：

```typescript
// ```bash
$ nest n my-nest-project -d

```

```

要解决这个限制，可以显式设置类型：

```typescript
// ```bash
node -p process.versions.icu

```

```

#### 枚举

要标识 `info`, 我们必须手动设置 `i` 属性于 `undefined` 中的数组值：

```typescript
// __CODE_BLOCK_8__

```

或者定义实际的 TypeScript 枚举，如以下所示：

```typescript
// __CODE_BLOCK_9__

```

可以使用枚举直接与 __INLINE_CODE_49__ 参数装饰器在一起使用 __INLINE_CODE_50__ 装饰器。

```typescript
// __CODE_BLOCK_10__

```

```html
<!-- __HTML_TAG_96__ --> <!-- __HTML_TAG_97__ --> <!-- __HTML_TAG_98__ -->

```

#### 枚举模式

默认情况下，__INLINE_CODE_53__ 属性将添加 __INLINE_CODE_54__ 的 raw 定义。

```typescript
// __CODE_BLOCK_11__

```

上述规则适用于大多数情况。但是，如果您使用工具生成客户端代码，并且该工具将 specification 作为 **input**，您可能会遇到生成的代码包含重复的 __INLINE_CODE_55__。考虑以下代码片段：

```typescript
// __CODE_BLOCK_12__

```

> 提示：上述片段使用了工具 __LINK_107__。

您可以看到现在有两个 __INLINE_CODE_56__，它们完全相同。

要解决这个问题，可以将 __INLINE_CODE_57__ 属性添加到你的装饰器中。

```typescript
// __CODE_BLOCK_13__

```

__INLINE_CODE_59__ 属性使 __INLINE_CODE_60__ 将 __INLINE_CODE_61__ 转换为自己的 __INLINE_CODE_62__，从而使 __INLINE_CODE_63__ 枚举可重用。 specification 将如下所示：

```typescript
// __CODE_BLOCK_14__

```

> 提示：任何接受 __INLINE_CODE_64__ 属性的装饰器也将接受 __INLINE_CODE_65__。

#### 属性值示例

可以使用 __INLINE_CODE_66__ 键设置单个示例：

```typescript
// __CODE_BLOCK_15__

```

如果您想要提供多个示例，可以使用 __INLINE_CODE_67__ 键，传入一个对象，结构Here is the translated Chinese technical documentation:

使用控制器类手动定义输入/输出内容，请使用 __INLINE_CODE_68__ 属性：

__CODE_BLOCK_19__

#### 额外模型

要定义直接在控制器中未被引用但应该被 Swagger 模块检查的额外模型，请使用 __INLINE_CODE_69__ 装饰器：

__CODE_BLOCK_20__

> 信息 **提示** 对于特定模型类，你只需要使用 __INLINE_CODE_70__ 一次。

或者，您可以将 options 对象传递给 __INLINE_CODE_72__ 方法，其中 __INLINE_CODE_71__ 属性指定为 follows：

__CODE_BLOCK_21__

要获取对模型的引用，请使用 __INLINE_CODE_74__ 函数：

__CODE_BLOCK_22__

#### oneOf, anyOf, allOf

要组合模式，可以使用 __INLINE_CODE_75__, __INLINE_CODE_76__ 或 __INLINE_CODE_77__ 关键字（__LINK_108__）。

__CODE_BLOCK_23__

如果您想要定义多种模式的数组（即数组中的成员跨越多个模式），应该使用原始定义（见上）手动定义您的类型。

__CODE_BLOCK_24__

> 信息 **提示** __INLINE_CODE_78__ 函数来自 __INLINE_CODE_79__。

同时，__INLINE_CODE_80__ 和 __INLINE_CODE_81__ 都必须作为额外模型使用 __INLINE_CODE_82__ 装饰器（在类级别）。

#### 模式名称和描述

正如你可能注意到的那样，生成的模式名称基于原始模型类的名称（例如，__INLINE_CODE_83__ 模型生成 __INLINE_CODE_84__ 模式）。如果您想改变模式名称，可以使用 __INLINE_CODE_85__ 装饰器。

以下是一个示例：

__CODE_BLOCK_25__

上述模型将被转换为 __INLINE_CODE_86__ 模式。

默认情况下，不会添加描述到生成的模式中。您可以使用 __INLINE_CODE_87__ 属性添加描述：

__CODE_BLOCK_26__

这样，描述将被包括在模式中，如下所示：

__CODE_BLOCK_27__