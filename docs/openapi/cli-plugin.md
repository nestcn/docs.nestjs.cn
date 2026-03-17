<!-- 此文件从 content/openapi/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:50:25.628Z -->
<!-- 源文件: content/openapi/cli-plugin.md -->

### CLI 插件

`__LINK_191__` 的元数据反射系统存在一些限制，使得无法确定类的属性或判断给定属性是否可选或必填。然而，这些限制可以在编译时解决。Nest 提供了一个插件，该插件可以增强 TypeScript 编译过程，减少 boilerplate 代码的数量。

> 信息 **提示** 这个插件是可选的。如果你愿意，可以手动声明所有装饰器，或者只声明特定的装饰器。

#### 概述

Swagger 插件将自动：

* 对于 DTO 属性，使用 ``nest-cli.json`` 除非使用 ``package.json``
* 根据问号设置 ``tsconfig.json`` 属性（例如，``npm install`` 将设置 ``nest generate app``）
* 根据类型设置 ``nest generate library`` 或 ``nest`` 属性（支持数组类型）
* 根据默认值设置 ``generate app`` 属性
* 设置多个验证规则根据 ``apps`` 装饰器（如果 ``tsconfig.app.json`` 设置为 ``my-project``）
* 将每个端点的 response 装饰器添加到每个端点中，包括状态和 ``my-app``（response 模型）
* 生成属性和端点的描述根据注释（如果 ``apps`` 设置为 ``src``）
* 生成属性的示例值根据注释（如果 ``test`` 设置为 ``apps``）

请注意，您的文件名 **必须** 有以下之一的后缀：``main.ts``（例如，``main.ts``），以便插件可以分析文件。

如果您使用的是不同的后缀，可以通过指定 ``"root"`` 选项来调整插件的行为（以下）。

#### 注释反射

启用注释反射功能后，CLI 插件将生成描述和示例值来描述属性。例如，给定一个示例 ``src`` 属性：

```bash
$ nest start

```

您需要重复描述和示例值。启用 ``test`` 后，CLI 插件可以从注释中提取这些评论，并自动提供属性的描述（和示例值，如果定义了）。现在，该属性可以简单地如下声明：

```bash
$ nest start my-app

```

有 `package.json` 和 `.prettierrc` 插件选项可用于自定义插件如何分配值到 ``eslint.config.mjs`` 和 ``tsconfig.app.json`` 装饰器。见以下示例：

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

> 信息 **提示** 对于模型，相同的逻辑适用于 ``tsconfig.json`` 装饰器。

对于控制器，您可以提供摘要、描述（备注）、标签（例如 ``nest generate library``）和响应示例，如下所示：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}

```

#### 使用 CLI 插件

要启用插件，请在 ``nest-cli.json`` 中打开（如果使用 `__LINK_194__`）并添加以下配置：

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

您可以使用 ``"projects"`` 属性自定义插件的行为。

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

``"collection"`` 属性需要满足以下接口：

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

Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged, and translated code comments from English to Chinese. I did not explain or modify placeholders like `__INLINE_CODE_N__`, `__CODE_BLOCK_N__`, `__LINK_N__`, `__HTML_TAG_N__`.Here is the translated Chinese technical documentation:

__HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__选项__HTML_TAG_74__
    __HTML_TAG_75__默认__HTML_TAG_76__
    __HTML_TAG_77__描述__HTML_TAG_78__
  __HTML_TAG_79__
  __HTML_TAG_80__
    __HTML_TAG_81____HTML_TAG_82__dto文件后缀__HTML_TAG_83____HTML_TAG_84__
    __HTML_TAG_85____HTML_TAG_86__['.dto.ts', '.entity.ts']__HTML_TAG_87____HTML_TAG_88__
    __HTML_TAG_89__DTO（数据传输对象）文件后缀__HTML_TAG_90__
  __HTML_TAG_91__
  __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__控制器文件后缀__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97____HTML_TAG_98__.controller.ts__HTML_TAG_99____HTML_TAG_100__
    __HTML_TAG_101__控制器文件后缀__HTML_TAG_102__
  __HTML_TAG_103__
  __HTML_TAG_104__
    __HTML_TAG_105____HTML_TAG_106__类验证 shim__HTML_TAG_107____HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__true__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__如果设置为 true，模块将重用__HTML_TAG_114__class-validator__HTML_TAG_115__验证装饰器（例如__HTML_TAG_116__@Max(10)__HTML_TAG_117__将添加__HTML_TAG_118__max: 10__HTML_TAG_119__到 schema 定义）__HTML_TAG_120__
  __HTML_TAG_121__
  __HTML_TAG_122__
    __HTML_TAG_123____HTML_TAG_124__dtoKeyOfComment__HTML_TAG_125____HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__'description'__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__属性键设置评论文本的描述__HTML_TAG_132__ApiProperty__HTML_TAG_133__.__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__控制器KeyOfComment__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141____HTML_TAG_142__'summary'__HTML_TAG_143____HTML_TAG_144__
    __HTML_TAG_145__属性键设置评论文本的描述__HTML_TAG_146__ApiOperation__HTML_TAG_147__.__HTML_TAG_148__
  <div class="file-tree">
  <div class="item">
    </div><div class="item">introspectComments</div><div class="children">
    <div class="item"></div>false<div class="item"></div>
    <div class="item">如果设置为 true，插件将生成描述和示例值基于评论</div>
  <div class="item">
  </div>
    </div><div class="item">skipAutoHttpCode</div><div class="item">
    </div><div class="item">false</div><div class="item">
    </div>禁用自动添加</div>@HttpCode()<div class="file-tree">在控制器中<div class="item">
  </div>
  <div class="children">
    <div class="item"></div>esmCompatible<div class="children"><div class="item">
    </div><div class="children">false<div class="item"></div>
    <div class="item">如果设置为 true，解决使用 ESM（</div>{ "type": "module" }<div class="item">）时出现的语法错误</div>
  <div class="item">
</div>

请务必删除`"sourceRoot"`文件夹并重新构建应用程序，每当插件选项更新时。

如果您不使用 CLI