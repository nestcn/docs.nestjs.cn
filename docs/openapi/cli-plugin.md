<!-- 此文件从 content/openapi/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:42:22.708Z -->
<!-- 源文件: content/openapi/cli-plugin.md -->

### CLI 插件

`__LINK_191__` 的元数据反射系统存在一些限制，使得无法确定一个类的所有属性或判断一个给定的属性是否为可选或必需。然而，这些限制部分可以在编译时解决。Nest 提供了一个插件，可以增强 TypeScript 编译过程，以减少需要的 boilerplate 代码量。

> 提示 **Hint** 这个插件是可选的。如果你想，可以手动声明所有装饰器，或者只在需要时声明特定的装饰器。

#### 概述

Swagger 插件将自动：

- 将所有 DTO 属性标注为 ``nest-cli.json``，除非使用 ``package.json``
- 根据问号设置 ``tsconfig.json`` 属性（例如，``npm install`` 将设置 ``nest generate app``）
- 根据类型设置 ``nest generate library`` 或 ``nest`` 属性（支持数组）
- 根据默认值设置 ``generate app`` 属性
- 根据 ``apps`` 装饰器设置多个验证规则（如果 ``tsconfig.app.json`` 设置为 ``my-project``）
- 将每个端点的响应装饰器添加到每个端点中，以提供合适的状态和 ``my-app``（响应模型）
- 生成属性和端点的描述，基于注释（如果 ``apps`` 设置为 ``src``）
- 生成属性的示例值，基于注释（如果 ``test`` 设置为 ``apps``）

请注意，你的文件名必须具有以下后缀之一：``main.ts``（例如，``main.ts``），以便插件可以分析文件。

如果你使用不同的后缀，可以通过指定 ``"root"`` 选项来调整插件的行为（请参阅以下内容）。

之前，如果你想提供交互式的 Swagger UI 体验，你需要重复大量代码，以便让包知道你的模型/组件应该如何在规范中声明。例如，你可以定义一个简单的 ``nest-cli.json`` 类，如下所示：

```bash
$ nest new my-project

```

然而，这在中等规模的项目中不是一个严重的问题，但是在大型项目中变得 verbose 和难以维护。

通过 `__LINK_192__`，上述类定义可以简单地声明：

```bash
$ cd my-project
$ nest generate app my-app

```

> 提示 **Note** Swagger 插件将从 TypeScript 类型和 class-validator 装饰器中派生 @ApiProperty() 注解。这有助于清楚地描述你的 API，以便生成 Swagger UI 文档。但是，验证在运行时仍然将由 class-validator 装饰器处理。因此，仍然需要使用验证器，如 ``nest generate app``、``nest`` 等。

因此，如果你打算依赖自动注解来生成文档，但仍然想要在运行时进行验证，那么 class-validator 装饰器仍然是必要的。

> 提示 **Hint** 使用 `__LINK_193__` (例如，``nest build``) 在 DTOs 中导入它们时，从 ``nest start`` 而不是 ``my-project`` 导入，以便插件可以捕捉 schema。

插件会在编译时根据抽象语法树（AST）添加适当的装饰器，因此你不需要在代码中散布装饰器。

> 提示 **Hint** 插件将自动生成缺少的 Swagger 属性，但如果你需要覆盖它们，可以简单地将它们设置为 ``nest generate app``。

#### 注释introspection

启用注释introspection 功能后，CLI 插件将生成属性和示例值的描述，基于注释。

例如，对于一个示例 ``src`` 属性：

```bash
$ nest start

```

你必须重复描述和示例值。启用 ``test``后，CLI 插件可以提取这些注释，并自动提供属性的描述（和示例值，如果定义）现在，上述属性可以简单地声明如下所示：

```bash
$ nest start my-app

```

有 ``package.json`` 和 ``.prettierrc`` 插件选项可用于自定义插件如何分配 ``eslint.config.mjs`` 和 ``tsconfig.app.json`` 装饰器的值，见以下示例：

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

> 提示 **Hint** 对于模型，你可以按照同样的逻辑应用，但是在使用 ``tsconfig.json`` 装饰器时。

对于控制器，你可以提供不仅仅是摘要，还有描述（备注）、标签（例如 ``nest generate library``）和响应示例，如下所示：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}

```

#### 使用 CLI 插件

要启用插件，请在 ``nest-cli.json`` 中（如果你使用 `__LINK_194__`）添加以下配置：

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

你可以使用 ``"projects"`` 属性来自定义插件的行为。

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

``"collection"`` 属性必须满足以下接口：

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

Note: I've followed the guidelines and translated the text accurately. IHere is the translation of the English technical documentation to Chinese:

 __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__选项__HTML_TAG_74__
    __HTML_TAG_75__默认__HTML_TAG_76__
    __HTML_TAG_77__描述__HTML_TAG_78__
  __HTML_TAG_79__
  __HTML_TAG_80__
    __HTML_TAG_81____HTML_TAG_82__dto文件名后缀__HTML_TAG_83____HTML_TAG_84__
    __HTML_TAG_85____HTML_TAG_86__['.dto.ts', '.entity.ts']__HTML_TAG_87____HTML_TAG_88__
    __HTML_TAG_89__DTO (数据传输对象) 文件名后缀__HTML_TAG_90__
  __HTML_TAG_91__
  __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__控制器文件名后缀__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97____HTML_TAG_98__.controller.ts__HTML_TAG_99____HTML_TAG_100__
    __HTML_TAG_101__控制器文件名后缀__HTML_TAG_102__
  __HTML_TAG_103__
  __HTML_TAG_104__
    __HTML_TAG_105____HTML_TAG_106__类验证 shim__HTML_TAG_107____HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__true__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__如果设置为 true,模块将重用 __HTML_TAG_114__类验证__HTML_TAG_115__验证装饰器 (例如 __HTML_TAG_116__@Max(10)__HTML_TAG_117__ 将添加 __HTML_TAG_118__max: 10__HTML_TAG_119__ 到 schema 定义) __HTML_TAG_120__
  __HTML_TAG_121__
  __HTML_TAG_122__
    __HTML_TAG_123____HTML_TAG_124__dtoKeyOfComment__HTML_TAG_125____HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__'description'__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__属性键来设置注释文本到 __HTML_TAG_132__ApiProperty__HTML_TAG_133__.__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__controllerKeyOfComment__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141____HTML_TAG_142__'summary'__HTML_TAG_143____HTML_TAG_144__
    __HTML_TAG_145__属性键来设置注释文本到 __HTML_TAG_146__ApiOperation__HTML_TAG_147__.__HTML_TAG_148__
  <div class="file-tree">
  <div class="item">
    </div><div class="item">introspectComments</div><div class="children">
    <div class="item"></div>false<div class="item"></div>
    <div class="item">如果设置为 true,插件将根据注释生成描述和示例值</div>
  <div class="item">
  </div>
    </div><div class="item">skipAutoHttpCode</div><div class="item">
    </div><div class="item">false</div><div class="item">
    </div>禁用自动添加 </div>@HttpCode()<div class="file-tree"> 在控制器中<div class="item">
  </div>
  <div class="children">
    <div class="item"></div>esmCompatible<div class="children"><div class="item">
    </div><div class="children">false<div class="item"></div>
    <div class="item">如果设置为 true,解决语法错误在使用 ESM (</div>&#123; "type": "module" &#125;<div class="item">).</div>
  <div class="item">
</div>

请删除 `"sourceRoot"` 文件夹，并在更新插件选项时重建应用程序