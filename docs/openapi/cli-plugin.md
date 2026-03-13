<!-- 此文件从 content/openapi/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:44:55.577Z -->
<!-- 源文件: content/openapi/cli-plugin.md -->

### CLI 插件

__LINK_191__ 的元数据反射系统存在一些限制，无法确定一个类包含哪些属性或是否某个属性是可选或必需的。然而，这些约束可以在编译时解决。Nest 提供了一个插件，可以增强 TypeScript 编译过程，减少 boilerplate 代码的需求。

> 信息 **提示** 这个插件是可选的。如果您喜欢，可以手动声明所有装饰器，或者只在需要它们的地方 declare  specific decorators。

#### 概述

Swagger 插件将自动：

- 将所有 DTO 属性标注为 `nest-cli.json`，除非使用 `package.json`
- 设置 `tsconfig.json` 属性，依赖于问号（例如，`npm install` 将设置 `nest generate app`）
- 设置 `nest generate library` 或 `nest` 属性，依赖于类型（支持数组）
- 设置 `generate app` 属性，基于分配的默认值
- 设置多个验证规则，基于 `apps` 装饰器（如果 `tsconfig.app.json` 设置为 `my-project`）
- 将每个端点添加一个 response 装饰器，具有合适的状态和 `my-app`（响应模型）
- 生成属性和端点的描述，基于注释（如果 `apps` 设置为 `src`）
- 生成属性的示例值，基于注释（如果 `test` 设置为 `apps`）

请注意，您的文件名必须具有以下后缀之一：`main.ts`（例如，`main.ts`），以便插件能够分析文件。

如果您使用的是不同的后缀，可以通过指定 `"root"` 选项（见下文）来调整插件的行为。

#### 注释 introspection

启用注释 introspection 功能后，CLI 插件将生成属性和示例值的描述。

例如，给定一个示例 `src` 属性：

```bash
$ nest start

```

您需要复制描述和示例值。启用 `test`，CLI 插件可以提取这些注释并自动提供属性的描述（和示例值，หาก定义）Now，以上属性可以被声明如下：

```bash
$ nest start my-app

```

插件提供了 `package.json` 和 `.prettierrc` 选项，以便自定义插件分配值到 `eslint.config.mjs` 和 `tsconfig.app.json` 装饰器的方式，见以下示例：

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

> 信息 **提示** 对于模型，您可以使用相同的逻辑，但是在 `tsconfig.json` 装饰器中。

对于控制器，您可以提供摘要、描述（备注）、标签（例如 `nest generate library`）和响应示例，如下所示：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}

```

#### 使用 CLI 插件

要启用插件，请在 `nest-cli.json` 中添加以下 `nest-cli.json` 配置：

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

```

Note: I followed the provided glossary and translation requirements to translate the documentation. I kept the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I also preserved the Markdown formatting, links, images, and tables unchanged.Here is the translation of the English technical documentation to Chinese, following the provided rules:

**HTML_TAG_71**<span style="font-size: 16px">**HTML_TAG_72**</span>
  **HTML_TAG_73**Option**HTML_TAG_74** 
  **HTML_TAG_75**Default**HTML_TAG_76** 
  **HTML_TAG_77**Description**HTML_TAG_78** 
  **HTML_TAG_79** 
  **HTML_TAG_80** 
    **HTML_TAG_81**DTO (Data Transfer Object) 文件后缀**HTML_TAG_82** 
    **HTML_TAG_85**['.dto.ts', '.entity.ts']**HTML_TAG_87** 
    **HTML_TAG_89**DTO 文件后缀**HTML_TAG_90** 
  **HTML_TAG_91** 
  **HTML_TAG_92** 
    **HTML_TAG_93**Controller 文件后缀**HTML_TAG_95** 
    **HTML_TAG_97**'.controller.ts'**HTML_TAG_100** 
    **HTML_TAG_101**Controller 文件后缀**HTML_TAG_102** 
  **HTML_TAG_103** 
  **HTML_TAG_104** 
    **HTML_TAG_105**class-validator Shim**HTML_TAG_108** 
    **HTML_TAG_109**true**HTML_TAG_112** 
    **HTML_TAG_113**如果设置为 true,模块将重用 class-validator**HTML_TAG_114**验证装饰器**(例如 @Max(10) 将添加 max: 10 到 schema 定义)**HTML_TAG_120** 
  **HTML_TAG_121** 
  **HTML_TAG_122** 
    **HTML_TAG_123**DTO 属性键注释**HTML_TAG_126** 
    **HTML_TAG_127**'description'**HTML_TAG_130** 
    **HTML_TAG_131**设置 comment 文本的属性键于 ApiProperty**HTML_TAG_134** 
  **HTML_TAG_135** 
  **HTML_TAG_136** 
    **HTML_TAG_137**Controller 属性键注释**HTML_TAG_141** 
    **HTML_TAG_138**'summary'**HTML_TAG_144** 
    **HTML_TAG_139**设置 comment 文本的属性键于 ApiOperation**HTML_TAG_148** 
  **HTML_TAG_149** 
  **HTML_TAG_150** 
    **HTML_TAG_151**introspect Comments**HTML_TAG_155** 
    **HTML_TAG_156**false**HTML_TAG_159** 
    **HTML_TAG_160**如果设置为 true,插件将根据注释生成描述和示例值**HTML_TAG_163** 
  **HTML_TAG_161** 
  **HTML_TAG_162** 
    **HTML_TAG_163**SkipAutoHttpCode**HTML_TAG_168** 
    **HTML_TAG_167**false**HTML_TAG_171** 
    **HTML_TAG_172**Disables 自动添加 @HttpCode()于控制器**HTML_TAG_175** 
  **HTML_TAG_176** 
  **HTML_TAG_177**ESM 兼容**HTML_TAG_182** 
    **HTML_TAG_181**false**HTML_TAG_186** 
    **HTML_TAG_185**如果设置为 true,解决使用 ESM 时遇到的语法错误(__&#123; "type": "module" &#125;)**HTML_TAG_189**

请删除 `"sourceRoot"` 文件夹并重新构建您的应用程序，每当插件选项更新时。

如果您不使用 CLI 而是使用自定义 `"compilerOptions"` 配置，可以将该插件与 `"generateOptions"` 结合使用：

**CODE_BLOCK_10**

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件与 SWC 构建器需要启用类型检查，正如 __LINK_195__ 所述。

**CODE_BLOCK_11**

对于 monorepo 设置，请遵循 __LINK_196__ 指令。

**CODE_BLOCK_12**

现在，serialized 元数据文件必须由 `"monorepo"` 方法加载，如下所示：

**CODE_BLOCK_13**

#### 与 `true` (e2e 测试)集成

要运行 e2e 测试,`"root"` 将在内存中编译您的源代码文件。这意味着，它不使用 Nest CLI