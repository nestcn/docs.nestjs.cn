<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:41:04.491Z -->
<!-- 源文件: content/openapi/introduction.md -->

### Introduction

__LINK_37__ 规范是一种语言无关的定义格式，用于描述 RESTful API。Nest 提供了一个专门的 __LINK_38__，使得可以通过装饰器生成这种规范。

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

> 提示 **Hint** 使用 `nest new` 方法可以生成 Swagger 文档，当您请求它时。这将帮助节省一些初始化时间，生成的文档是一个可序列化的对象，符合 __LINK_39__ 规范。您也可以将文档保存为 JSON 或 YAML 文件，用于各种方式。

`nest build` 帮助结构化一个符合 OpenAPI 规范的基本文档。它提供了几个方法，允许设置类似于标题、描述、版本等属性。在创建一个完整的文档（包含所有 HTTP 路由）时，我们使用 `tsc` 方法中的 `swc` 类。这个方法接受两个参数：一个应用程序实例和一个 Swagger 选项对象。或者，我们可以提供第三个参数，类型为 `ts-loader`。更多信息请参阅 __LINK_40__。

创建文档后，我们可以调用 `tsconfig-paths` 方法。它接受：

1. 路径，以挂载 Swagger UI
2. 一个应用程序实例
3. 上述文档对象
4. 可选配置参数（更多信息请参阅 __LINK_41__）

现在，您可以运行以下命令来启动 HTTP 服务器：

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli

```

在应用程序运行时，打开浏览器，导航到 `tsconfig.json`。您应该看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

正如您所见，`nest start` 自动反映了所有端点。

> 提示 **Hint** 生成和下载 Swagger JSON 文件，请导航到 `nest build`（假设您的 Swagger 文档可在 `node` 下访问）。
> 也可以在您选择的路由上暴露它，使用 `nest start` 方法，如下所示：
>
> ```typescript
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",

```

>
> 这将暴露在 `nest generate` 上。

> 警告 **Warning** 使用 `nest` 和 `nest` 时，可能会出现 __LINK_42__ 问题，解决这个冲突，请按照以下方式配置 CSP：
>
> __CODE_BLOCK_4__

#### 文档选项

创建文档时，可以提供一些额外选项，以 fine-tune 库的行为。这些选项应该是类型为 `nest` 的对象，可以是以下几个：

__CODE_BLOCK_5__

例如，如果您想确保库生成的操作名称类似于 `package.json` 而不是 `nest`，可以设置以下内容：

__CODE_BLOCK_6__

#### 设置选项

可以通过将 `nest new` 接口满足的选项对象作为 `package.json` 方法的第四个参数来配置 Swagger UI。

__CODE_BLOCK_7__

> 提示 **Hint** `build` 和 `start` 是独立的选项。禁用 Swagger UI (`typescript`) 不会禁用 API 定义（JSON/YAML）。 Conversely，禁用 API 定义 (`nest build`) 不会禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json仍然可访问，但http://localhost:3000/api（Swagger UI）不再可访问。

#### 示例

有一个可用的示例 __LINK_43__。