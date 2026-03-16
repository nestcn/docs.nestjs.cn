<!-- 此文件从 content/openapi/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:32:43.413Z -->
<!-- 源文件: content/openapi/cli-plugin.md -->

### CLI 插件

__LINK_191__的元数据反射系统存在一些限制，无法确定一个类中的所有属性或判断一个给定的属性是否是可选或必需的。然而，某些约束可以在编译时解决。Nest 提供了一个插件，使得 TypeScript 编译过程中减少 boilerplate 代码的需求。

> info **提示** 这个插件是可选的。您可以手动声明所有装饰器，或者仅在需要时声明特定的装饰器。

#### 概述

Swagger 插件将自动：

- 对所有 DTO 属性进行 `nest-cli.json`注解，除非使用 `package.json`
- 将 `tsconfig.json` 属性设置为问号（例如，`npm install`将设置 `nest generate app`）
- 将 `nest generate library` 或 `nest` 属性设置为类型（支持数组）
- 将 `generate app` 属性设置为默认值
- 设置多个验证规则基于 `apps` 装饰器（如果 `tsconfig.app.json` 设置为 `my-project`）
- 将每个端点添加一个response 装饰器，带有适当的状态和 `my-app`（响应模型）
- 生成属性和端点的描述，基于注释（如果 `apps` 设置为 `src`）
- 生成属性的示例值，基于注释（如果 `test` 设置为 `apps`）

请注意，您的文件名 **必须** 包含以下后缀之一：`main.ts`（例如，`main.ts`），以便插件能够分析文件。

如果您使用的是不同的后缀，可以通过指定 `"root"` 选项来调整插件的行为（见下文）。

在使用 Swagger UI 提供交互式体验之前，您需要大量重复代码来让包知道您的模型/组件应该如何在规范中声明。例如，您可以定义一个简单的 `nest-cli.json` 类如下所示：

```bash
$ nest new my-project

```

在中等规模的项目中，这不是一个主要问题，但是一旦您有了大量类，它将变得冗长和难以维护。

通过 __LINK_192__，上述类定义可以简化：

```bash
$ cd my-project
$ nest generate app my-app

```

> info **注意** Swagger 插件将从 TypeScript 类型和 class-validator 装饰器中派生@ApiProperty() 注解。这有助于明确描述您的 API，以便生成 Swagger UI 文档。但是，运行时的验证仍将由 class-validator 装饰器处理。因此，仍需要使用验证器，如 `nest generate app`、`nest` 等。

因此，如果您打算依赖自动注解来生成文档，仍然需要使用验证器。

> info **提示** 在使用 __LINK_193__ (例如 `nest build`) 时，在 DTO 中导入它们来自 `nest start` 而不是 `my-project`，以便插件能够检测 schema。

插件会在 Abstract Syntax Tree 上添加适当的装饰器，因此您不需要在代码中散布 `my-app` 装饰器。

> info **提示** 插件将自动生成缺少的 Swagger 属性，但如果您需要覆盖它们，可以简单地将它们设置为 `nest generate app`。

#### 评论 introspection

启用评论 introspection 功能后，CLI 插件将生成属性和示例值的描述。

例如，给定一个示例 `src` 属性：

```bash
$ nest start

```

您需要重复描述和示例值。启用 `test` 后，CLI 插件可以提取这些注释并自动提供属性的描述（和示例值， если定义了）。现在，上述属性可以简化如下所示：

```bash
$ nest start my-app

```

有 `package.json` 和 `.prettierrc` 插件选项可用于自定义插件将值分配给 `eslint.config.mjs` 和 `tsconfig.app.json` 装饰器的方式。见下文：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/my-project/src",
  "monorepo": true,
  "root": "apps/my-project",
  "compilerOptions": {
    "webpack": true,
    "tsConfigPath": "apps/my-project/tsconfig.app.json"
  },
  "projects": {
    "my-project": {
      "type": "application",
      "root": "apps/my-project",
      "entryFile": "main",
      "sourceRoot": "apps/my-project/src",
      "compilerOptions": {
        "tsConfigPath": "apps/my-project/tsconfig.app.json"
      }
    },
    "my-app": {
      "type": "application",
      "root": "apps/my-app",
      "entryFile": "main",
      "sourceRoot": "apps/my-app/src",
      "compilerOptions": {
        "tsConfigPath": "apps/my-app/tsconfig.app.json"
      }
    }
  }
}

```

这等同于以下指令：

```javascript
{
  "generateOptions": {
    "spec": false
  },
  ...
}

```

> info **提示** 对于模型，您可以使用同样的逻辑，但使用 `tsconfig.json` 装饰器。

对于控制器，您可以提供摘要、描述（注释）、标签（例如 `nest generate library`）和响应示例，如下所示：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}

```

#### 使用 CLI 插件

要启用插件，请在 `nest-cli.json` (如果使用 __LINK_194__) 中添加以下 `nest-cli.json` 配置：

```javascript
{
  "generateOptions": {
    "spec": {
      "service": false
    }
  },
  ...
}

```

您可以使用 `"projects"` 属性来自定义插件的行为。

```javascript
> {
>   "generateOptions": {
>     "spec": {
>       "service": false,
>       "s": false
>     }
>   },
>   ...
> }
> ```

`"collection"` 属性必须满足以下接口：

```javascript
{
  "projects": {
    "cats-project": {
      "generateOptions": {
        "spec": {
          "service": false
        }
      },
      ...
    }
  },
  ...
}

```Here is the translation of the provided English technical documentation to Chinese:

**HTML_TAG_71**
**HTML_TAG_72**
    **HTML_TAG_73**选项**HTML_TAG_74**
    **HTML_TAG_75**默认**HTML_TAG_76**
    **HTML_TAG_77**描述**HTML_TAG_78**
**HTML_TAG_79**
**HTML_TAG_80**
    **HTML_TAG_81**DTO 文件后缀**HTML_TAG_82**dtoFileNameSuffix**HTML_TAG_83**文件名**HTML_TAG_84**
    **HTML_TAG_85**文件名**HTML_TAG_86**['.dto.ts', '.entity.ts']**HTML_TAG_87**文件名**HTML_TAG_88**
    **HTML_TAG_89**DTO 文件后缀**HTML_TAG_90**
**HTML_TAG_91**
**HTML_TAG_92**
    **HTML_TAG_93**控制器文件后缀**HTML_TAG_94**controllerFileNameSuffix**HTML_TAG_95**文件名**HTML_TAG_96**
    **HTML_TAG_97**文件名**HTML_TAG_98**.controller.ts**HTML_TAG_99**文件名**HTML_TAG_100**
    **HTML_TAG_101**控制器文件后缀**HTML_TAG_102**
**HTML_TAG_103**
**HTML_TAG_104**
    **HTML_TAG_105**类验证 shim**HTML_TAG_106**classValidatorShim**HTML_TAG_107**设置**HTML_TAG_108**
    **HTML_TAG_109**设置**HTML_TAG_110**true**HTML_TAG_111**设置**HTML_TAG_112**
    **HTML_TAG_113**如果设置为 true,模块将重新使用**HTML_TAG_114**class-validator**HTML_TAG_115**验证装饰器(例如**HTML_TAG_116**@Max(10)**HTML_TAG_117**将添加**HTML_TAG_118**max: 10**HTML_TAG_119**到 schema 定义)**HTML_TAG_120**
**HTML_TAG_121**
**HTML_TAG_122**
    **HTML_TAG_123**DTO 属性 key**HTML_TAG_124**dtoKeyOfComment**HTML_TAG_125**设置**HTML_TAG_126**
    **HTML_TAG_127**设置**HTML_TAG_128**'description'**HTML_TAG_129**设置**HTML_TAG_130**
    **HTML_TAG_131**属性 key 设置 comment 文本到**HTML_TAG_132**ApiProperty**HTML_TAG_133**.**HTML_TAG_134**
**HTML_TAG_135**
**HTML_TAG_136**
    **HTML_TAG_137**控制器属性 key**HTML_TAG_138**controllerKeyOfComment**HTML_TAG_139**设置**HTML_TAG_140**
    **HTML_TAG_141**设置**HTML_TAG_142**'summary'**HTML_TAG_143**设置**HTML_TAG_144**
    **HTML_TAG_145**属性 key 设置 comment 文本到**HTML_TAG_146**ApiOperation**HTML_TAG_147**.**HTML_TAG_148**
**HTML_TAG_149**
**HTML_TAG_150**
    **HTML_TAG_151**introspect Comments**HTML_TAG_152**introspectComments**HTML_TAG_153**设置**HTML_TAG_154**
    **HTML_TAG_155**设置**HTML_TAG_156**false**HTML_TAG_157**设置**HTML_TAG_158**
    **HTML_TAG_159**如果设置为 true,插件将生成描述和示例值基于注释**HTML_TAG_160**
**HTML_TAG_161**
**HTML_TAG_162**
    **HTML_TAG_163**跳过自动 Http 代码**HTML_TAG_164**skipAutoHttpCode**HTML_TAG_165**设置**HTML_TAG_166**
    **HTML_TAG_167**设置**HTML_TAG_168**false**HTML_TAG_169**设置**HTML_TAG_170**
    **HTML_TAG_171**禁用自动添加**HTML_TAG_172**@HttpCode()**HTML_TAG_173**在控制器中**HTML_TAG_174**
**HTML_TAG_175**
**HTML_TAG_176**
    **HTML_TAG_177**ESM 兼容**HTML_TAG_178**esmCompatible**HTML_TAG_179**设置**HTML_TAG_180**
    **HTML_TAG_181**设置**HTML_TAG_182**false**HTML_TAG_183**设置**HTML_TAG_184**
    **HTML_TAG_185**如果设置为 true,解决使用 ESM(__HTML