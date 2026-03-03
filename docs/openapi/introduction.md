<!-- 此文件从 content/openapi/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:15:27.435Z -->
<!-- 源文件: content/openapi/introduction.md -->

### 样式

Nest 提供了一种语言无关的定义格式来描述RESTful APIs。Nest 提供了一个专门的 __LINK_37__，允许生成这样的定义格式，使用装饰器。

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

安装过程完成后，请打开 __INLINE_CODE_9__ 文件，使用 __INLINE_CODE_10__ 类初始化 Swagger：

__CODE_BLOCK_1__

> 提示 **Hint** 使用 __INLINE_CODE_11__ 工厂方法生成 Swagger 文档时，可以提高初始化速度，并且生成的文档是一个可序列化的对象，符合 __LINK_39__ 规范。相反，你也可以将文档保存为 JSON 或 YAML 文件，然后在各种方式下使用它。

__INLINE_CODE_12__ 帮助结构化一个符合 OpenAPI 规范的基本文档。它提供了多种方法，允许设置标题、描述、版本等属性。要创建一个完整的文档（包含所有 HTTP 路由），我们使用 __INLINE_CODE_13__ 方法，传入应用程序实例和 Swagger 选项对象。或者，我们可以提供第三个参数，类型为 __INLINE_CODE_15__。更多信息请查看 __LINK_40__。

创建文档后，我们可以调用 __INLINE_CODE_16__ 方法。它接受：

1. 挂载 Swagger UI 的路径
2. 应用程序实例
3. 上一步创建的文档对象
4. 可选配置参数（详见 __LINK_41__）

现在，您可以运行以下命令启动 HTTP 服务器：

__CODE_BLOCK_2__

当应用程序在运行时，打开浏览器，导航到 __INLINE_CODE_17__。您应该看到 Swagger UI。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

如您所见，__INLINE_CODE_18__自动反映了所有端口。

> 提示 **Hint** 生成和下载 Swagger JSON 文件，请导航到 __INLINE_CODE_19__（假设您的 Swagger 文档位于 __INLINE_CODE_20__）。
> 也可以在您选择的路由下暴露它，使用 __INLINE_CODE_21__ 的 setup 方法，例如：
>
> __CODE_BLOCK_3__
>
> 这将将其暴露在 __INLINE_CODE_22__ 路由下。

> 警告 **Warning** 使用 __INLINE_CODE_23__ 和 __INLINE_CODE_24__ 时，可能会出现 __LINK_42__ 的问题，以解决冲突，请按照以下方式配置 CSP：
>
> __CODE_BLOCK_4__

#### 文档选项

创建文档时，可以提供一些额外的选项来 fine-tune 库的行为。这些选项应该是类型为 __INLINE_CODE_25__ 的对象，可以是以下：

__CODE_BLOCK_5__

例如，如果您想使库生成操作名称像 __INLINE_CODE_26__ 而不是 __INLINE_CODE_27__，可以设置以下：

__CODE_BLOCK_6__

#### 设置选项

可以通过将 __INLINE_CODE_28__ 接口类型的选项对象作为 __INLINE_CODE_29__ 方法的第四个参数来配置 Swagger UI。

__CODE_BLOCK_7__

> 提示 **Hint** __INLINE_CODE_30__ 和 __INLINE_CODE_31__ 是独立的选项。禁用 Swagger UI (__INLINE_CODE_32__) 不会禁用 API 定义（JSON/YAML）。相反，禁用 API 定义 (__INLINE_CODE_33__) 不会禁用 Swagger UI。
>
> 例如，以下配置将禁用 Swagger UI 但仍允许访问 API 定义：
>
> __CODE_BLOCK_8__
>
> 在这种情况下，http://localhost:3000/api-json仍然可访问，但 http://localhost:3000/api（Swagger UI）不可以。

#### 示例

有一个工作示例可在 __LINK_43__ 中找到。