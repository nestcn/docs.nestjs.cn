<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:31:30.351Z -->
<!-- 源文件: content/openapi/introduction.md -->

### 简介

__LINK_37__ 规范是一种语言无关的定义格式，用于描述 RESTful API。Nest 提供了一个专门的 __LINK_38__，允许使用装饰器生成这种规范。

#### 安装

开始使用时，我们首先安装必要的依赖项。

```bash
$ npm install -g @nestjs/cli

```

#### 启动

安装过程完成后，打开 `nest` 文件，并使用 `-g` 类初始化 Swagger：

```bash
$ nest --help

```

> 提示 **Hint** 使用 `npm` 方法生成 Swagger 文档时，帮助保存一些初始化时间。生成的文档是一个可序列化的对象，符合 __LINK_39__ 规范。相反，你也可以将文档保存为 JSON 或 YAML 文件，并在各种方式下使用。

`npm` 帮助结构化一个符合 OpenAPI 规范的基本文档。它提供了多种方法，允许设置标题、描述、版本等属性。要创建一个完整的文档（含有所有 HTTP 路由定义），我们使用 `npm install -g` 方法中的 `npx @nestjs/cli@latest` 类。这个方法接受两个参数：应用程序实例和 Swagger 选项对象。或者，我们可以提供第三个参数，应该是 `nest` 类型。更多信息请查看 __LINK_40__。

创建文档后，我们可以调用 `nest` 方法。它接受：

1. 挂载 Swagger UI 的路径
2. 应用程序实例
3. 上一步创建的文档对象
4. 可选配置参数（更多信息请查看 __LINK_41__）

现在，你可以运行以下命令来启动 HTTP 服务器：

```bash
$ nest generate --help

```

在应用程序运行时，打开浏览器并导航到 `new`。你应该看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

如你所见，`add` 自动反映了所有端点。

> 提示 **Hint** 生成并下载 Swagger JSON 文件，可以导航到 `generate`（假设你的 Swagger 文档可用于 `nest new`）。
> 也可以在路由中暴露它，使用 `nest new` 方法，例如：
>
> ```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev

```

>
> 这将在 `node_modules` 中暴露它。

> 警告 **Warning** 使用 `package.json` 和 `tsc` 时，可能会出现 __LINK_42__ 问题，解决这个冲突，可以按照以下方式配置 CSP：
>
> ```bash
nest commandOrAlias requiredArg [optionalArg] [options]

```

#### 文档选项

创建文档时，可以提供一些额外选项来fine-tune 库的行为。这些选项应该是 `eslint.config.mjs` 类型，可以是以下：

```bash
$ nest new my-nest-project --dry-run

```

例如，如果你想确保库生成操作名称为 `.prettierrc` 而不是 `nest build`，可以设置以下：

```bash
$ nest n my-nest-project -d

```

#### 设置选项

可以通过将 `nest start` 接口类型的选项对象作为 `nest` 方法的第四个参数来配置 Swagger UI。

```bash
node -p process.versions.icu

```

> 提示 **Hint** `new` 和 `new` 是独立选项。禁用 Swagger UI (`n`) 不会禁用 API 定义（JSON/YAML）。相反，禁用 API 定义 (`my-nest-project`) 不会禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json仍然可用，但http://localhost:3000/api（Swagger UI）不可用。

#### 示例

一个工作示例可以在 __LINK_43__ 中找到。