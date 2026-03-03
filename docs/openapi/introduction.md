<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:25.473Z -->
<!-- 源文件: content/openapi/introduction.md -->

### 简介

__LINK_37__ 规范是一种语言无关的定义格式，用于描述 RESTful API。Nest 提供了一个专门的 __LINK_38__，允许通过装饰器生成这样的规范。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

#### 启动

安装过程完成后，打开 __INLINE_CODE_9__ 文件并使用 __INLINE_CODE_10__ 类初始化 Swagger：

__CODE_BLOCK_1__

> 提示 **Hint** 使用 __INLINE_CODE_11__ 方法可以在请求 Swagger 文档时生成 Swagger 文档。这一approach 可以节省一些初始化时间，并且生成的文档是一个可序列化的对象，符合 __LINK_39__ 规范。相反，你也可以将文档保存为 JSON 或 YAML 文件，并在各种方式中使用它。

__INLINE_CODE_12__ 帮助结构一个符合 OpenAPI 规范的基本文档，提供了多个方法，可以设置标题、描述、版本等属性。要创建一个完整的文档（包括所有 HTTP 路由），我们使用 __INLINE_CODE_13__ 方法中的 __INLINE_CODE_14__ 类。这个方法接受两个参数：应用程序实例和 Swagger 选项对象。或者，我们可以提供第三个参数，类型为 __INLINE_CODE_15__。更多关于这个的信息，在 __LINK_40__ 中。

创建文档后，我们可以调用 __INLINE_CODE_16__ 方法。它接受：

1. 将 Swagger UI 挂载到的路径
2. 应用程序实例
3. 以上述步骤中创建的文档对象
4. 可选的配置参数（更多信息在 __LINK_41__ 中）

现在，你可以运行以下命令来启动 HTTP 服务器：

__CODE_BLOCK_2__

在应用程序运行时，打开浏览器，导航到 __INLINE_CODE_17__。你应该看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

正如你所看到的，__INLINE_CODE_18__ 自动反映了所有端点。

> 提示 **Hint** 生成和下载 Swagger JSON 文件，可以导航到 __INLINE_CODE_19__（假设你的 Swagger 文档位于 __INLINE_CODE_20__）。
> 也可以将其暴露在你选择的路由上，使用 __INLINE_CODE_21__ 方法，如下所示：
>
> __CODE_BLOCK_3__
>
> 这将将其暴露在 __INLINE_CODE_22__ 上。

> 警告 **Warning** 使用 __INLINE_CODE_23__ 和 __INLINE_CODE_24__ 可能会出现 __LINK_42__ 的问题，解决这个问题，可以按照以下所示配置 CSP：
>
> __CODE_BLOCK_4__

#### 文档选项

创建文档时，可以提供一些额外的选项来调整库的行为。这些选项应该是类型为 __INLINE_CODE_25__ 的对象，可以是以下：

__CODE_BLOCK_5__

例如，如果你想确保库生成操作名称为 __INLINE_CODE_26__ 而不是 __INLINE_CODE_27__，你可以设置以下：

__CODE_BLOCK_6__

#### 设置选项

你可以通过将 __INLINE_CODE_28__ 接口满足的选项对象作为第四个参数传递给 __INLINE_CODE_29__ 方法来配置 Swagger UI。

__CODE_BLOCK_7__

> 提示 **Hint** __INLINE_CODE_30__ 和 __INLINE_CODE_31__ 是独立的选项。禁用 Swagger UI (__INLINE_CODE_32__) 不会禁用 API 定义（JSON/YAML）。相反，禁用 API 定义 (__INLINE_CODE_33__) 不会禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json仍然可以访问，但http://localhost:3000/api（Swagger UI）不可以。

#### 示例

一个工作示例可在 __LINK_43__ 中找到。