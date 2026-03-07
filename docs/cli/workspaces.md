---
title: workspaces
---






------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webpack`           | boolean             | 如果为 `true`，使用 [webpack 编译器](https://webpack.js.org/)。如果为 `false` 或不存在，使用 `tsc`。在单体仓库模式中，默认值为 `true`（使用 webpack），在标准模式中，默认值为 `false`（使用 `tsc`）。详见下文。（已弃用：改用 `builder`） |
| `tsConfigPath`      | string              | （**仅单体仓库**）指向包含 `tsconfig.json` 设置的文件，当调用 `nest build` 或 `nest start` 时不使用 `project` 选项时（例如，当构建或启动默认项目时）将使用这些设置。                                             |
| `webpackConfigPath` | string              | 指向 webpack 选项文件。如果未指定，Nest 会查找文件 `webpack.config.js`。详见下文。                                                                                                                                              |
| `deleteOutDir`      | boolean             | 如果为 `true`，每当调用编译器时，它将首先删除编译输出目录（如 `tsconfig.json` 中配置的那样，默认为 `./dist`）。                                                                                                     |
| `assets`            | array               | 启用在编译步骤开始时自动分发非 TypeScript 资产（资产分发在 `--watch` 模式下的增量编译中 **不会** 发生）。详见下文。                                                                    |
| `watchAssets`       | boolean             | 如果为 `true`，在监视模式下运行，监视 **所有** 非 TypeScript 资产。（有关要监视的资产的更精细控制，请参见下面的 [资产](/cli/workspaces#资源) 部分）。                                                                                            |
| `manualRestart`     | boolean             | 如果为 `true`，启用快捷键 `rs` 手动重启服务器。默认值为 `false`。                                                                                                                                                                            |
| `builder`           | string/object       | 指示 CLI 使用什么 `builder` 来编译项目（`tsc`、`swc` 或 `webpack`）。要自定义 builder 的行为，您可以传递一个包含两个属性的对象：`type`（`tsc`、`swc` 或 `webpack`）和 `options`。                                         |
| `typeCheck`         | boolean             | 如果为 `true`，为 SWC 驱动的项目启用类型检查（当 `builder` 为 `swc` 时）。默认值为 `false`。                                                                                                                                                             |

#### 全局生成选项

这些属性指定 `nest generate` 命令要使用的默认生成选项。

| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec`        | boolean _or_ object | 如果值为布尔值，`true` 表示默认启用 `spec` 生成，`false` 表示禁用。在 CLI 命令行上传递的标志会覆盖此设置，项目特定的 `generateOptions` 设置也会覆盖此设置（详见下文）。如果值为对象，每个键表示 schematic 名称，布尔值确定是否为该特定 schematic 启用/禁用默认 spec 生成。 |
| `flat`        | boolean             | 如果为 true，所有生成命令将生成扁平结构                                                                                                                                                                                                                                                                                                                                                                                 |

以下示例使用布尔值指定默认情况下应为所有项目禁用 spec 文件生成：


```javascript
{
  "generateOptions": {
    "spec": false
  },
  ...
}

```

以下示例使用布尔值指定扁平文件生成应为所有项目的默认值：


```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}

```

在以下示例中，`spec` 文件生成仅对 `service` schematic 禁用（例如，`nest generate service...`）：


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

> warning **警告** 当将 `spec` 指定为对象时，生成 schematic 的键当前不支持自动别名处理。这意味着指定键如 `service: false` 并尝试通过别名 `s` 生成服务，spec 仍会生成。为确保正常的 schematic 名称和别名都按预期工作，请同时指定正常的命令名称和别名，如下所示。
>
> ```javascript
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

#### 项目特定的生成选项

除了提供全局生成选项外，您还可以指定项目特定的生成选项。项目特定的生成选项遵循与全局生成选项完全相同的格式，但直接在每个项目上指定。

项目特定的生成选项覆盖全局生成选项。


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

> warning **警告** 生成选项的优先级顺序如下。在 CLI 命令行上指定的选项优先于项目特定的选项。项目特定的选项覆盖全局选项。

#### 指定的编译器

不同默认编译器的原因是，对于较大的项目（例如，在单体仓库中更典型），webpack 在构建时间和生成打包所有项目组件的单个文件方面具有显著优势。如果您希望生成单个文件，请将 `"webpack"` 设置为 `false`，这将导致构建过程使用 `tsc`（或 `swc`）。

#### Webpack 选项

webpack 选项文件可以包含标准的 [webpack 配置选项](https://webpack.js.org/configuration/)。例如，要告诉 webpack 打包 `node_modules`（默认情况下排除），请将以下内容添加到 `webpack.config.js`：


```javascript
module.exports = {
  externals: [],
};

```

由于 webpack 配置文件是 JavaScript 文件，您甚至可以公开一个函数，该函数接受默认选项并返回修改后的对象：


```javascript
module.exports = function (options) {
  return {
    ...options,
    externals: [],
  };
};

```

#### 资产

TypeScript 编译会自动将编译器输出（`.js` 和 `.d.ts` 文件）分发到指定的输出目录。分发非 TypeScript 文件（如 `.graphql` 文件、`images`、`.html` 文件和其他资产）也很方便。这允许您将 `nest build`（以及任何初始编译步骤）视为轻量级 **开发构建** 步骤，您可能正在编辑非 TypeScript 文件并迭代编译和测试。
资产应位于 `src` 文件夹中，否则它们不会被复制。

`assets` 键的值应该是一个元素数组，指定要分发的文件。元素可以是带有 `glob` 样式文件规范的简单字符串，例如：


```typescript
"assets": ["**/*.graphql"],
"watchAssets": true,

```

对于更精细的控制，元素可以是具有以下键的对象：

- `"include"`：要分发的资产的 `glob` 样式文件规范
- `"exclude"`：要从 `include` 列表中 **排除** 的资产的 `glob` 样式文件规范
- `"outDir"`：指定资产应分发到的路径（相对于根文件夹）的字符串。默认为为编译器输出配置的相同输出目录。
- `"watchAssets"`：布尔值；如果为 `true`，则在监视模式下运行，监视指定的资产

例如：


```typescript
"assets": [
  { "include": "**/*.graphql", "exclude": "**/omitted.graphql", "watchAssets": true },
]

```

> warning **警告** 在顶级 `compilerOptions` 属性中设置 `watchAssets` 会覆盖 `assets` 属性中的任何 `watchAssets` 设置。

#### 项目属性

此元素仅存在于单体仓库模式结构中。您通常不应编辑这些属性，因为它们被 Nest 用于在单体仓库中定位项目及其配置选项。
