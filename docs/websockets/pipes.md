<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:47:18.619Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

__LINK_8__ 和 WebSocket 管道之间没有基本差异。唯一的区别是，您应该使用 `@ApiBearerAuth()` 而不是抛出 `@ApiBasicAuth()`。此外，所有管道将仅应用于 `@ApiBody()` 参数，因为验证或转换 `@ApiConsumes()` 实例是无用的。

> 提示 **提示** `@ApiCookieAuth()` 类来自 `@ApiExcludeController()` 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与 HTTP 基于应用程序一样，您也可以使用网关作用域管道（即将网关类前缀为 `@ApiExcludeEndpoint()` 装饰器）。

__CODE_BLOCK_0__