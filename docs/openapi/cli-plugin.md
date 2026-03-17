<!-- 此文件从 content/openapi/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:22:50.408Z -->
<!-- 源文件: content/openapi/cli-plugin.md -->

### CLI 插件

__LINK_191__ 的元数据反射系统具有多种限制，使得无法确定一个类包含的属性或判断某个属性是否可选或必需。然而，某些约束可以在编译时解决。Nest 提供了一款插件，该插件可以增强 TypeScript 编译过程，以减少 boilerplate 代码的数量。

> info **提示** 这个插件是可选的。如果你愿意，可以手动声明所有装饰器，或者只在需要时声明特定的装饰器。

#### 概述

Swagger 插件将自动：

- 将所有 DTO 属性标记为 `nest-cli.json`，除非使用 `package.json`
- 将 `tsconfig.json` 属性设置为问号（例如， `npm install` 将设置 `nest generate app`）
- 将 `nest generate library` 或 `nest` 属性设置为类型（支持数组）
- 将 `generate app` 属性设置为默认值
- 设置多个验证规则基于 `apps` 装饰器（如果 `tsconfig.app.json` 设置为 `my-project`）
- 将响应装饰器添加到每个端点中，具有合适的状态和 `my-app`（响应模型）
- 生成属性和端点的描述，基于注释（如果 `apps` 设置为 `src`）
- 生成属性的示例值，基于注释（如果 `test` 设置为 `apps`）

请注意，您的文件名必须具有以下后缀之一：`main.ts`（例如，`main.ts`），以便插件可以分析文件。

如果您使用的是不同的后缀，可以通过指定 `"root"` 选项来调整插件的行为（见下文）。

####  comments introspection

启用 comments introspection 功能后，CLI 插件将生成描述和示例值，基于注释。

例如，给定一个示例 `src` 属性：

```bash
$ nest start

```

您必须复制描述和示例值。启用 `test` 后，CLI 插件可以提取注释并自动提供属性的描述（和示例值，如果定义了）。现在，上述属性可以被声明如下：

```bash
$ nest start my-app

```

插件还提供了 `package.json` 和 `.prettierrc` 选项，以便自定义插件对 `eslint.config.mjs` 和 `tsconfig.app.json` 装饰器的分配方式。见下面的示例：

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

> info **提示** 对于模型，您可以使用与控制器相同的逻辑，但是在使用 `tsconfig.json` 装饰器时。

对于控制器，您可以提供概要、描述（备注）、标签（例如 `nest generate library`）和响应示例，例如：

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

Note: I followed the guidelines and translated the text accordingly. I also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged (will be mapped later).Here is the translation of the provided English technical documentation to Chinese:

__HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__选择__HTML_TAG_74__
    __HTML_TAG_75__默认__HTML_TAG_76__
    __HTML_TAG_77__描述__HTML_TAG_78__
  __HTML_TAG_79__
  __HTML_TAG_80__
    __HTML_TAG_81____HTML_TAG_82__dto文件后缀__HTML_TAG_83____HTML_TAG_84__
    __HTML_TAG_85____HTML_TAG_86__['.dto.ts', '.entity.ts']__HTML_TAG_87____HTML_TAG_88__
    __HTML_TAG_89__DTO数据传输对象文件后缀__HTML_TAG_90__
  __HTML_TAG_91__
  __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__控制器文件后缀__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97____HTML_TAG_98__.controller.ts__HTML_TAG_99____HTML_TAG_100__
    __HTML_TAG_101__控制器文件后缀__HTML_TAG_102__
  __HTML_TAG_103__
  __HTML_TAG_104__
    __HTML_TAG_105____HTML_TAG_106__类验证 shim__HTML_TAG_107____HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__true__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__如果设置为true，模块将重用__HTML_TAG_114__class-validator__HTML_TAG_115__验证装饰器（例如__HTML_TAG_116__@Max(10)__HTML_TAG_117__将添加__HTML_TAG_118__max: 10__HTML_TAG_119__到schema定义）__HTML_TAG_120__
  __HTML_TAG_121__
  __HTML_TAG_122__
    __HTML_TAG_123____HTML_TAG_124__dtoCommentKey__HTML_TAG_125____HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__'description'__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__设置__HTML_TAG_132__ApiProperty__HTML_TAG_133__的注释文本__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__controllerCommentKey__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141____HTML_TAG_142__'summary'__HTML_TAG_143____HTML_TAG_144__
    __HTML_TAG_145__设置__HTML_TAG_146__ApiOperation__HTML_TAG_147__的注释文本__HTML_TAG_148__
  <div class="file-tree">
  <div class="item">
    </div><div class="item">introspectComments</div><div class="children">
    <div class="item"></div>false<div class="item"></div>
    <div class="item">如果设置为true，插件将根据注释生成描述和示例值</div>
  <div class="item">
  </div>
    </div><div class="item">skipAutoHttpCode</div><div class="item">
    </div><div class="item">false</div><div class="item">
    </div>禁用自动添加</div>@HttpCode()<div class="file-tree">控制器<div class="item">
  </div>
  <div class="children">
    <div class="item"></div>esmCompatible<div class="children"><div class="item">
    </div><div class="children">false<div class="item"></div>
    <div class="item">如果设置为true，解决使用 ESM(</div>&#123; "type": "module" &#125;<div class="item">)时遇到的语法错误</div>
  <div class="item">
</div>

请删除`"sourceRoot"`文件夹并重新构建应用程序，每当插件选项更新时。

如果您不使用 CLI，而是使用自