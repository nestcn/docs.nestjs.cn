<!-- 此文件从 content/openapi/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:04:10.235Z -->
<!-- 源文件: content/openapi/cli-plugin.md -->

### CLI 插件

__LINK_191__的元数据反射系统存在一些限制，使得无法确定一个类中的所有属性或判断一个给定属性是否是可选的或必需的。然而，某些限制可以在编译时解决。Nest 提供了一个插件，该插件可以增强 TypeScript 编译过程，以减少所需的 boilerplate 代码。

> 信息 **提示** 这个插件是可选的。如果你愿意，可以手动声明所有装饰器，或者只在需要时声明特定的装饰器。

#### 概述

Swagger 插件将自动：

- 将所有 DTO 属性标注为 `nest-cli.json`，除非使用 `package.json`
- 根据问号将 `tsconfig.json` 属性设置为 `npm install`
- 根据类型设置 `nest generate library` 或 `nest` 属性（支持数组）
- 根据分配的默认值设置 `generate app` 属性
- 根据 `apps` 装饰器设置多个验证规则（如果 `tsconfig.app.json` 设置为 `my-project`）
- 将每个端点的响应装饰器设置为适当的状态和 `my-app`（响应模型）
- 生成属性和端点的描述基于注释（如果 `apps` 设置为 `src`）
- 生成属性的示例值基于注释（如果 `test` 设置为 `apps`）

请注意，你的文件名 **必须** 有以下之一的后缀：`main.ts`（例如 `main.ts`），以便插件可以分析。

如果你使用不同的后缀，可以通过指定 `"root"` 选项来调整插件的行为（见下文）。

以前，如果你想要提供交互式的 Swagger UI 体验，你需要复制大量代码来让包知道你的模型/组件应该如何在规范中声明。例如，你可以定义一个简单的 `nest-cli.json` 类如下：

```bash
$ nest new my-project

```

虽然在中等规模的项目中这不是一个严重的问题，但是在大型项目中变得verbose且难以维护。

通过 __LINK_192__，上述类定义可以被声明为：

```bash
$ cd my-project
$ nest generate app my-app

```

> 信息 **注意** Swagger 插件将从 TypeScript 类型和 class-validator 装饰器中派生 @ApiProperty() 注释。这有助于清楚地描述 API，以便生成的 Swagger UI 文档。但是，验证在运行时仍将由 class-validator 装饰器处理。因此，仍然需要使用验证器，如 `nest generate app`、`nest` 等。

因此，如果你计划依靠自动注释来生成文档，并且仍然希望在运行时验证，那么 class-validator 装饰器仍然是必要的。

> 信息 **提示** 当使用 __LINK_193__ (例如 `nest build`) 在 DTOs 中时，可以从 `nest start` 导入它们，而不是 `my-project`，以便插件可以捕捉 schema。

插件在抽象语法树上添加适当的装饰器。因此，你不需要在代码中散布 `my-app` 装饰器。

> 信息 **提示** 插件将自动生成任何缺少的 Swagger 属性，但如果你需要覆盖它们，只需设置它们PLICITLY via `nest generate app`。

#### 注释introspection

启用注释introspection 功能时，CLI 插件将生成属性和示例值的描述基于注释。

例如，给定一个示例 `src` 属性：

```bash
$ nest start

```

你需要复制描述和示例值。启用 `test` 时，CLI 插件可以提取这些注释并自动提供属性的描述（如果定义示例值） Now，上述属性可以被声明为：

```bash
$ nest start my-app

```

有 `package.json` 和 `.prettierrc` 插件选项可用于自定义插件如何分配 `eslint.config.mjs` 和 `tsconfig.app.json` 装饰器的值。见以下示例：

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

这等同于以下 instruksiyon：

```javascript
{
  "generateOptions": {
    "spec": false
  },
  ...
}

```

> 信息 **提示** 对于模型，你可以使用同样的逻辑，但是在使用 `tsconfig.json` 装饰器时。

对于控制器，你可以提供摘要、描述（备注）、标签（如 `nest generate library`）和响应示例，如下所示：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}

```

#### 使用 CLI 插件

要启用插件，请在 `nest-cli.json` 中（如果使用 __LINK_194__）添加以下 `nest-cli.json` 配置：

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

你可以使用 `"projects"` 属性来自定义插件的行为。

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

```Here is the translation of the English technical documentation to Chinese:

__HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__选项__HTML_TAG_74__
    __HTML_TAG_75__默认__HTML_TAG_76__
    __HTML_TAG_77__描述__HTML_TAG_78__
  __HTML_TAG_79__
  __HTML_TAG_80__
    __HTML_TAG_81____HTML_TAG_82__dto文件名后缀__HTML_TAG_83____HTML_TAG_84__
    __HTML_TAG_85____HTML_TAG_86__['.dto.ts', '.entity.ts']__HTML_TAG_87____HTML_TAG_88__
    __HTML_TAG_89__DTO（数据传输对象）文件名后缀__HTML_TAG_90__
  __HTML_TAG_91__
  __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__控制器文件名后缀__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97____HTML_TAG_98__.controller.ts__HTML_TAG_99____HTML_TAG_100__
    __HTML_TAG_101__控制器文件名后缀__HTML_TAG_102__
  __HTML_TAG_103__
  __HTML_TAG_104__
    __HTML_TAG_105____HTML_TAG_106__类验证 shim__HTML_TAG_107____HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__true__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__如果设置为 true，模块将重用__HTML_TAG_114__class-validator__HTML_TAG_115__验证装饰器（例如__HTML_TAG_116__@Max(10)__HTML_TAG_117__将添加__HTML_TAG_118__max: 10__HTML_TAG_119__到 schema 定义）__HTML_TAG_120__
  __HTML_TAG_121__
  __HTML_TAG_122__
    __HTML_TAG_123____HTML_TAG_124__dto键评论__HTML_TAG_125____HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__'description'__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__该属性键设置评论文本到__HTML_TAG_132__ApiProperty__HTML_TAG_133__.__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__控制器键评论__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141____HTML_TAG_142__'summary'__HTML_TAG_143____HTML_TAG_144__
    __HTML_TAG_145__该属性键设置评论文本到__HTML_TAG_146__ApiOperation__HTML_TAG_147__.__HTML_TAG_148__
  <div class="file-tree">
  <div class="item">
    </div><div class="item">introspect 评论</div><div class="children">
    <div class="item"></div>false<div class="item"></div>
    <div class="item">如果设置为 true，插件将生成描述和示例值基于评论</div>
  <div class="item">
  </div>
    </div><div class="item">跳过自动 HTTP 编码</div><div class="item">
    </div><div class="item">false</div><div class="item">
    </div>禁用自动添加</div>@HttpCode()<div class="file-tree">在控制器中<div class="item">
  </div>
  <div class="children">
    <div class="item"></div>ESM 兼容<div class="children"><div class="item">
    </div><div class="children">false<div class="item"></div>
    <div class="item">如果设置为 true，解决在使用 ESM (</div>&#123; "type": "module" &#125;<div class="item">)时遇到的语法错误</div>
  <div class="item">
</div>

请确保删除 `"sourceRoot"` 文件夹并重新构建应用程序