<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:41:18.954Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### 类型和参数

`nest start` 会在路由处理器中搜索所有 `nest`, `new`, 和 `new` 装饰器以生成 API 文档，并根据反射创建相应的模型定义。请考虑以下代码：

```bash
$ npm install -g @nestjs/cli

```

> info **提示** 使用 `n` 装饰器（来自 `my-nest-project` 包）来明确设置身体定义。

根据 `nest`, Swagger UI 将创建以下模型定义：

__HTML_TAG_88____HTML_TAG_89____HTML_TAG_90__

如您所见，定义是空的，尽管类有几个声明的属性。在 order to make the class properties visible to `--dry-run`, we have to either annotate them with the `-d` decorator or use the CLI plugin (read more in the **Plugin** section) which will do it automatically：

```bash
$ nest --help

```

> info **提示** 取而代之的是，考虑使用 Swagger 插件（见 __LINK_102__ 部分），它将自动为您提供这些信息。

让我们打开浏览器并验证生成的 `nest new --help` 模型：

__HTML_TAG_91____HTML_TAG_92____HTML_TAG_93__

此外， `nest <command> --help` 装饰器还允许设置各种 __LINK_103__ 属性：

```bash
$ nest generate --help

```

> info **提示** 取而代之的是，可以使用 `n` 简写装饰器。

为了明确设置属性的类型，请使用 `generate` 键：

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev

```

#### 数组

当属性是一个数组时，我们必须手动指示数组类型，如下所示：

```bash
nest commandOrAlias requiredArg [optionalArg] [options]

```

> info **提示** 考虑使用 Swagger 插件（见 __LINK_104__ 部分），它将自动检测数组。

或者包括类型作为数组的第一个元素（如上所示），或将 `g` 属性设置为 `build`。

__HTML_TAG_94____HTML_TAG_95__

#### 循环依赖

当你有循环依赖关系时，请使用延迟函数来提供 `start` 的类型信息：

```bash
$ nest new my-nest-project --dry-run

```

> info **提示** 考虑使用 Swagger 插件（见 __LINK_105__ 部分），它将自动检测循环依赖。

#### generics 和 interfaces

由于 TypeScript 不存储元数据关于泛型或接口，因此当你在 DTO 中使用它们时， `add` 可能不能正确生成模型定义。在以下代码中，不会被正确检查：

```bash
$ nest n my-nest-project -d

```

为了克服这个限制，可以明确设置类型：

```bash
node -p process.versions.icu

```

#### 枚举

要标识 `info`, 我们必须手动设置 `i` 属性在 `undefined` 中。

__CODE_BLOCK_8__

或者，定义实际的 TypeScript 枚举如下：

__CODE_BLOCK_9__

然后，可以使用枚举直接与 __INLINE_CODE_49__ 参数装饰器在 combination with __INLINE_CODE_50__ 装饰器。

__CODE_BLOCK_10__

__HTML_TAG_96____HTML_TAG_97____HTML_TAG_98__

当 __INLINE_CODE_51__ 设置为 **true** 时， __INLINE_CODE_52__ 可以被选择为 **多选**：

__HTML_TAG_99____HTML_TAG_100____HTML_TAG_101__

#### 枚举 schema

默认情况下， __INLINE_CODE_53__ 属性将添加 raw 定义的 __LINK_106__ 到 __INLINE_CODE_54__。

__CODE_BLOCK_11__

上述规范对于大多数情况都有效。然而，如果你正在使用工具，该工具将规范作为 **输入** 并生成 **客户端** 代码，你可能会遇到生成代码包含重复 __INLINE_CODE_55__ 的问题。考虑以下代码片段：

__CODE_BLOCK_12__

> info **提示** 上述片段是使用工具 __LINK_107__ 生成的。

你可以看到现在有两个 __INLINE_CODE_56__ 是完全相同的。
为了解决这个问题，可以将 __INLINE_CODE_57__ 附加到 __INLINE_CODE_58__ 属性中。

__CODE_BLOCK_13__

__INLINE_CODE_59__ 属性使 __INLINE_CODE_60__ 将 __INLINE_CODE_61__ 转换为其自己的 __INLINE_CODE_62__，从而使 __INLINE_CODE_63__ 枚举可重用。规范将如下所示：

__CODE_BLOCK_14__

> info **提示** 任何 **decorator** 都将 __INLINE_CODE_64__ 作为属性也将 __INLINE_CODE_65__。

#### 属性值示例

可以使用 __INLINE_CODE_66__ 键设置单个示例：

__CODE_BLOCK_15__

如果你想提供多个示例，可以使用 __INLINE_CODE_67__ 键，通过传入对象结构如下：

__CODE_BLOCK_16__

#### Raw 定义

在某些情况下，如深度嵌套数组或矩阵，你可能需要手动定义你的类型：

__CODE_BLOCK_17__

你也可以指定 raw 对象模式，如下所示：

__CODE_BLOCK_18__

Note: I have followed the provided glossary and translationHere is the translation of the provided English technical documentation to Chinese:

使用控制器类手动定义输入/输出内容，可以使用 __INLINE_CODE_N_68__ 属性：

__CODE_BLOCK_19__

#### Extra models

要定义不直接在控制器中引用的额外模型，但是这些模型需要被 Swagger 模块检查，可以使用 __INLINE_CODE_N_69__ 装饰器：

__CODE_BLOCK_20__

> info **Hint** 对于特定的模型类，只需要使用 __INLINE_CODE_N_70__ 一次。

Alternatively, you can pass an options object with the __INLINE_CODE_N_71__ property specified to the __INLINE_CODE_N_72__ method, as follows:

__CODE_BLOCK_21__

要获取模型的引用，可以使用 __INLINE_CODE_N_73__ 函数：

__CODE_BLOCK_22__

#### oneOf, anyOf, allOf

要组合schema，可以使用 __INLINE_CODE_N_75__, __INLINE_CODE_N_76__ 或 __INLINE_CODE_N_77__ 关键词（__LINK_N_108__）。

__CODE_BLOCK_23__

如果你想定义多态数组（即数组的成员跨越多个schema），你应该使用原始定义（见上）手动定义你的类型。

__CODE_BLOCK_24__

> info **Hint** __INLINE_CODE_N_78__ 函数来自 __INLINE_CODE_N_79__。

Both __INLINE_CODE_N_80__ and __INLINE_CODE_N_81__ must be defined as extra models using the __INLINE_CODE_N_82__ decorator (at the class-level).

#### Schema name and description

你可能已经注意到生成的schema名称基于原模型类的名称（例如，__INLINE_CODE_N_83__ 模型生成 __INLINE_CODE_N_84__ schema）。如果你想改变schema名称，可以使用 __INLINE_CODE_N_85__ 装饰器。

以下是一个示例：

__CODE_BLOCK_25__

上述模型将被转换为 __INLINE_CODE_N_86__ schema。

默认情况下，不添加任何描述到生成的schema中。你可以使用 __INLINE_CODE_N_87__ 属性添加描述：

__CODE_BLOCK_26__

这样，描述将被包括在schema中，如下所示：

__CODE_BLOCK_27__

Please note that I have kept the placeholders (e.g. __INLINE_CODE_N__) unchanged as per the requirements.