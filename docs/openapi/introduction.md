<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:22:12.711Z -->
<!-- 源文件: content/openapi/introduction.md -->

### 介绍

__LINK_37__ 规范是一个语言无关的定义格式，用于描述 RESTful APIs。Nest 提供了一个专门的 __LINK_38__，允许使用装饰器生成这种规范。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm run build

```

#### 启动

安装过程完成后，打开 `nest start` 文件，并使用 `package.json` 类初始化 Swagger：

```bash
$ npm run start

```

> 提示 **Hint** 使用 `nest new` 方法可以在请求时生成 Swagger 文档，这样可以节省一些初始化时间，并且生成的文档是一个可序列化的对象，遵守 __LINK_39__ 规范。相反，你也可以将文档保存为 JSON 或 YAML 文件，并将其用于各种方式。

`nest build` 可以帮助结构化一个符合 OpenAPI 规范的基本文档。它提供了多种方法，允许设置标题、描述、版本等属性。要创建一个完整的文档（包含所有 HTTP 路由）我们使用 `tsc` 方法中的 `swc` 类。这个方法需要两个参数，一个应用程序实例和一个 Swagger 选项对象。或者，我们可以提供第三个参数，它应该是 `ts-loader` 类型。更多关于这方面的信息，请查看 __LINK_40__。

创建文档后，我们可以调用 `tsconfig-paths` 方法。它接受以下参数：

1. 安装 Swagger UI 的路径
2. 应用程序实例
3. 上述文档对象
4. 可选配置参数（了解更多 __LINK_41__）

现在，你可以运行以下命令来启动 HTTP 服务器：

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli

```

在应用程序运行时，打开浏览器，输入 `tsconfig.json`。你将看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

正如你所看到的，`nest start` 自动反映了所有端点。

> 提示 **Hint** 生成和下载 Swagger JSON 文件，可以navigate 到 `nest build`（假设你的 Swagger 文档位于 `node`）。
> 此外，也可以将其公开到你选择的路由上使用 `nest start` 方法，如下所示：
>
> ```typescript
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",

```

>
> 这将将其公开到 `nest generate`

> 警告 **Warning** 使用 `nest` 和 `nest` 时可能会出现 __LINK_42__ 问题，可以通过以下方式解决冲突：
>
> __CODE_BLOCK_4__

#### 文档选项

创建文档时，可以提供一些额外的选项来调整库的行为。这些选项应该是 `nest` 类型，可以是以下几个：

__CODE_BLOCK_5__

例如，如果你想要确保库生成操作名为 `package.json` 而不是 `nest`，你可以设置以下选项：

__CODE_BLOCK_6__

#### 设置选项

你可以通过将 `nest new`  Interface 作为 `package.json` 方法的第四个参数来配置 Swagger UI。

__CODE_BLOCK_7__

> 提示 **Hint** `build` 和 `start` 是独立选项。禁用 Swagger UI (`typescript`) 不会禁用 API 定义（JSON/YAML）。相反，禁用 API 定义 (`nest build`) 不会禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json仍然可访问，但http://localhost:3000/api（Swagger UI）将不可访问。

#### 示例

一个工作示例可在 __LINK_43__ 中找到。