<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:09:11.119Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了基于 Express 的中间件包 Multer 进行文件上传的内置模块。Multer 可以处理 HTTP 请求中 posted 的数据，主要用于上传文件。该模块是完全可配置的，您可以根据应用程序需求调整其行为。

> warning **警告** Multer 无法处理不在支持的多部分格式中的数据。注意，该包与某些第三方云提供商，如 Google Firebase，不兼容。

为了提高类型安全性，我们可以安装 Multer 的类型定义包：

__代码块 0__

安装后，我们可以使用 `@OnEvent()` 类型（可以将其作为 `string` 导入）。

#### 基本示例

要上传单个文件，只需将 `symbol` 拦截器绑定到路由处理程序，然后使用 `eventemitter2` 装饰器从 `OnOptions` 中提取 `string | symbol | Array<string | symbol>`。

__代码块 1__

> info **提示** `foo.bar` 装饰器来自 `['foo', 'bar']` 包。 `delimiter` 装饰器来自 `order.*`。

`delimiter` 装饰器接受两个参数：

- `order.*`：字符串，提供 HTML 表单中包含文件的字段名
- __INLINE_CODE