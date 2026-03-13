<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:44:30.654Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### 类型和参数

`MyLibraryService` 在路由处理程序中搜索 `my-project/src/app.module.ts`, `MyLibraryModule`, 和 `@app` 装饰器，以生成 API 文档。它还使用反射创建相应的模型定义。考虑以下代码：

```bash
$ nest g library my-library

```

> 提示 **注意** 使用 `import` 装饰器（来自 `prefix` 包）来明确设置 body 定义。

根据 `nest g library`, Swagger UI 将创建以下模型定义：

__HTML_TAG_88____HTML_TAG_89____HTML_TAG_90__

如您所见，定义为空，尽管类中有一些 declared 属性。在 order to 使类 properties 可见给 `tsconfig.json`, 我们需要将它们用 `"paths"` 装饰器注释或使用 CLI 插件（阅读更多关于 **插件** 部分），它将自动执行以下操作：

```bash
What prefix would you like to use for the library (default: @app)?

```

> 提示 **注意** 相反，考虑使用 Swagger 插件（见 __LINK_102__ 部分），它将自动提供这些信息。

让我们打开浏览器并验证生成的 `MyLibraryModule` 模型：

__HTML_TAG_91____HTML_TAG_92____HTML_TAG_93__

此外,`nest build` 装饰器允许设置多种 __LINK_103__ 属性：

```javascript
...
{
    "my-library": {
      "type": "library",
      "root": "libs/my-library",
      "entryFile": "index",
      "sourceRoot": "libs/my-library/src",
      "compilerOptions": {
        "tsConfigPath": "libs/my-library/tsconfig.lib.json"
      }
}
...

```

> 提示 **注意** 相反，您可以使用 __INLINE_CODE_40__ 缩写装饰器来代替 `tsc`。

要显式设置属性的类型，请使用 __INLINE_CODE_41__ 键：

```bash
$ nest build my-library

```

#### 数组

当属性是一个数组时，我们必须手动指示数组类型，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLibraryModule } from '@app/my-library';

@Module({
  imports: [MyLibraryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

> 提示 **注意** 考虑使用 Swagger 插件（见 __LINK_104__ 部分），它将自动检测数组。

或者将类型作为数组的第一个元素（如下所示），或将 __INLINE_CODE_42__ 属性设置为 __INLINE_CODE_43__。

__HTML_TAG_94____HTML_TAG_95__

#### 循环依赖关系

当您在类之间存在循环依赖关系时，使用懒惰函数来提供 __INLINE_CODE_44__ 的类型信息：

```javascript
"paths": {
    "@app/my-library": [
        "libs/my-library/src"
    ],
    "@app/my-library/*": [
        "libs/my-library/src/*"
    ]
}

```

> 提示 **注意** 考虑使用 Swagger 插件（见 __LINK_105__ 部分），它将自动检测循环依赖关系。

#### generics 和 interfaces

由于 TypeScript 不存储泛型或接口的元数据，因此当您在 DTOs 中使用它们时，__INLINE_CODE_45__ 可能无法正确生成模型定义。例如，以下代码不会被 Swagger 模块正确地检查：

__CODE_BLOCK_6__

为了克服这个限制，您可以显式设置类型：

__CODE_BLOCK_7__

#### 枚举

要识别 __INLINE_CODE_46__, 我们必须手动将 __INLINE_CODE_47__ 属性设置为 __INLINE_CODE_48__ 的数组值。

__CODE_BLOCK_8__

或者，您可以定义实际的 TypeScript 枚举，如下所示：

__CODE_BLOCK_9__

然后，您可以使用枚举直接与 __INLINE_CODE_49__ 参数装饰器结合使用 __INLINE_CODE_50__ 装饰器。

__CODE_BLOCK_10__

__HTML_TAG_96____HTML_TAG_97____HTML_TAG_98__

使用 __INLINE_CODE_51__ 设置为 **true**时，__INLINE_CODE_52__ 可以被选择为 **多选**：

__HTML_TAG_99____HTML_TAG_100____HTML_TAG_101__

#### 枚举 schema

默认情况下,__INLINE_CODE_53__ 属性将添加 __LINK_106__ 的 raw 定义到 __INLINE_CODE_54__。

__CODE_BLOCK_11__

上述 specification 适用于大多数情况。但是，如果您正在使用工具，该工具将 specification 作为 **输入** 并生成 **客户端** 代码，您可能会遇到生成的代码包含重复的 __INLINE_CODE_55__。考虑以下代码片段：

__CODE_BLOCK_12__

> 提示 **注意** 上述片段是使用工具 __LINK_107__ 生成的。

您可以看到现在有两个 __INLINE_CODE_56__ 是完全相同的。
为了解决这个问题，您可以将 __INLINE_CODE_57__ 附加到 __INLINE_CODE_58__ 属性中您的装饰器。

__CODE_BLOCK_13__

__INLINE_CODE_59__ 属性使 __INLINE_CODE_60__ 能够将 __INLINE_CODE_61__ 转换为自己的 __INLINE_CODE_62__，从而使 __INLINE_CODE_63__ 枚举可重用。 specification 将如下所示：

__CODE_BLOCK_14__

> 提示 **注意** 任何 **装饰器** 都将 __INLINE_CODE_64__ 作为属性，并将 __INLINE_CODE_65__ 作为属性。

#### 属性值示例

您可以使用 __INLINE_CODE_66__ 键设置单个示例：

__CODE_BLOCK_15__

如果您想要提供多个示例，可以使用 __INLINE_CODE_67__ 键，传入一个结构化的对象：

__CODE_BLOCK_16__

#### 原始定义

在某些情况下，如深度嵌套数组或矩阵Here is the translation of the English technical documentation to Chinese following the provided rules:

使用控制器类手动定义输入/输出内容，请使用__INLINE_CODE_68__属性：

__CODE_BLOCK_19__

### Extra models

要定义不直接在控制器中引用但应该被 Swagger 模块检查的额外模型，请使用__INLINE_CODE_69__装饰器：

__CODE_BLOCK_20__

> info **提示** 只需要在特定的模型类中使用__INLINE_CODE_70__一次。

Alternatively, 可以将一个options 对象传递给__INLINE_CODE_72__方法，其中包括__INLINE_CODE_71__属性，例如：

__CODE_BLOCK_21__

要获取模型的引用，请使用__INLINE_CODE_74__函数：

__CODE_BLOCK_22__

### oneOf, anyOf, allOf

要组合模式，可以使用__INLINE_CODE_75__,__INLINE_CODE_76__或__INLINE_CODE_77__关键字（__LINK_108__）。

__CODE_BLOCK_23__

如果您想定义多种模式的数组（即数组成员跨越多种模式），请使用原始定义（见上文）手动定义您的类型。

__CODE_BLOCK_24__

> info **提示** __INLINE_CODE_78__函数来自__INLINE_CODE_79__。

__INLINE_CODE_80__和__INLINE_CODE_81__都必须作为额外模型使用__INLINE_CODE_82__装饰器（在类级别）。

### Schema name and description

您可能注意到生成的模式名称基于原始模型类的名称（例如，__INLINE_CODE_83__模型生成__INLINE_CODE_84__模式）。如果您想改变模式名称，可以使用__INLINE_CODE_85__装饰器。

以下是一个示例：

__CODE_BLOCK_25__

上述模型将被转换为__INLINE_CODE_86__模式。

默认情况下，不会添加描述到生成的模式中。您可以使用__INLINE_CODE_87__属性添加描述：

__CODE_BLOCK_26__

这样，描述将被包含在模式中，例如：

__CODE_BLOCK_27__