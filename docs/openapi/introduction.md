<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:03:09.493Z -->
<!-- 源文件: content/openapi/introduction.md -->

### 简介

__LINK_37__ 规范是描述 RESTful API 的语言无关定义格式。Nest 提供了一个专门的 __LINK_38__，允许通过装饰器生成这样一种规范。

#### 安装

开始使用它，我们首先安装所需的依赖项。

```bash
$ npm run build

```

#### 启动

安装过程完成后，打开 `nest start` 文件，并使用 `package.json` 类初始化 Swagger：

```bash
$ npm run start

```

> 提示 **Hint** 使用 `nest new` 方法特别是为了在请求时生成 Swagger 文档。这可以帮助节省一些初始化时间，并且生成的文档是一个可以序列化的对象，遵循 __LINK_39__ 规范。相反，你也可以将文档保存为 JSON 或 YAML 文件，并在各种方式中使用它。

`nest build` 帮助结构化一个遵循 OpenAPI 规范的基本文档。它提供了多个方法，允许设置标题、描述、版本等属性。要创建一个完整的文档（包括所有 HTTP 路由）我们使用 `tsc` 方法，该方法接受两个参数：一个应用程序实例和一个 Swagger 选项对象。或者，我们可以提供第三个参数，类型为 `ts-loader`。更多信息，请查看 __LINK_40__。

创建文档后，我们可以调用 `tsconfig-paths` 方法。它接受：

1. 要 mounts 的 Swagger UI 路径
2. 应用程序实例
3. 上述文档对象
4. 可选配置参数（阅读更多 __LINK_41__）

现在，你可以运行以下命令来启动 HTTP 服务器：

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli

```

在应用程序运行时，打开浏览器并导航到 `tsconfig.json`。你应该看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

如你所见，`nest start` 自动反映了所有端点。

> 提示 **Hint** 生成和下载 Swagger JSON 文件，可以导航到 `nest build`（假设你的 Swagger 文档可在 `node` 下访问）。
> 也可以使用 `nest start` 方法公开它，如下所示：
>
> ```typescript
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",

```

>
> 这将公开它在 `nest generate` 路径下。

> 警告 **Warning** 使用 `nest` 和 `nest` 时，可能会出现 __LINK_42__ 问题，以解决冲突，可以按照以下方式配置 CSP：
>
> __CODE_BLOCK_4__

#### 文档选项

创建文档时，可以提供一些额外选项来微调库的行为。这些选项应该是类型 `nest` 的对象，可以是以下：

__CODE_BLOCK_5__

例如，如果你想确保库生成操作名称像 `package.json` 而不是 `nest`，你可以设置以下：

__CODE_BLOCK_6__

#### 设置选项

你可以通过将 `nest new` 接口类型的选项对象作为 `package.json` 方法的第四个参数来配置 Swagger UI。

__CODE_BLOCK_7__

> 提示 **Hint** `build` 和 `start` 是独立选项。禁用 Swagger UI (`typescript`) 不会禁用 API 定义（JSON/YAML）。相反，禁用 API 定义 (`nest build`) 不会禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json vẫn可以访问，但 http://localhost:3000/api（Swagger UI）不会。

#### 示例

有一个可用的工作示例 __LINK_43__。