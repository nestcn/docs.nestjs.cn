<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:49:19.819Z -->
<!-- 源文件: content/openapi/introduction.md -->

### 引言

__LINK_37__规范是一种语言无关的定义格式，用于描述RESTful API。Nest提供了一个专门的__LINK_38__，允许通过装饰器生成这种规范。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm run build

```

#### 启动

安装过程完成后，打开`nest start`文件，并使用`package.json`类初始化 Swagger：

```bash
$ npm run start

```

> 提示 **Hint** 使用`nest new`方法生成 Swagger 文档时，它会将结果对象序列化为符合__LINK_39__规范的对象。这样可以保存一些初始化时间，并且可以将结果对象用于各种方式。

`nest build`用于结构化一个遵循 OpenAPI 规范的基本文档。它提供了多个方法，允许设置标题、描述、版本等属性。要创建一个完整的文档（包含所有 HTTP 路由），我们使用`tsc`方法中的`swc`类。这个方法接受两个参数：应用程序实例和 Swagger 选项对象。或者，我们可以提供第三个参数，类型为`ts-loader`。更多细节请查看__LINK_40__。

创建文档后，我们可以调用`tsconfig-paths`方法。它接受：

1. Swagger UI 挂载路径
2. 应用程序实例
3. 前面创建的文档对象
4. 可选配置参数（查看__LINK_41__）

现在，您可以运行以下命令来启动 HTTP 服务器：

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli

```

在应用程序运行时，打开浏览器并导航到`tsconfig.json`。您应该看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

如您所见，`nest start`自动反映了所有端点。

> 提示 **Hint** 生成和下载 Swagger JSON 文件，可以导航到`nest build`（假设您的 Swagger 文档位于`node`）。
> 也可以将其暴露在您选择的路由上使用`nest start`方法，如下所示：
>
> ```typescript
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",

```

>
> 这将暴露它在`nest generate`上。

> 警告 **Warning** 使用`nest`和`nest`时，可能会出现__LINK_42__问题，以解决这个问题，configure CSP如下所示：
>
> __CODE_BLOCK_4__

#### 文档选项

创建文档时，可以提供一些额外的选项来fine-tune 库的行为。这些选项应该是类型`nest`的，可以是以下：

__CODE_BLOCK_5__

例如，如果您想要确保库生成操作名称像`package.json`而不是`nest`，可以设置以下：

__CODE_BLOCK_6__

#### setup 选项

可以通过将`nest new`接口实现的选项对象作为`package.json`方法的第四个参数来配置 Swagger UI。

__CODE_BLOCK_7__

> 提示 **Hint** `build`和`start`是独立的选项。禁用 Swagger UI (`typescript`)不禁用 API 定义（JSON/YAML）。反之，禁用 API 定义 (`nest build`)不禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json仍然可访问，但http://localhost:3000/api（Swagger UI）将不可访问。

#### 示例

有一个工作示例可查看__LINK_43__。