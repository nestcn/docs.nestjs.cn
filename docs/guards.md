<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:14:40.501Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个带有 __INLINE_CODE_11__ 装饰器的类，实现了 __INLINE_CODE_12__ 接口。

__HTML_TAG_68____HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任，即确定某个请求是否将被路由处理程序处理，取决于在运行时存在的某些条件（如权限、角色、ACL 等）。这通常称为 授权。授权（和其姐妹产品认证）通常在传统 Express 应用程序中由 __LINK_75__ 处理。Middleware 是一种好的选择，因为 token 验证和将属性附加到 __INLINE_CODE_13__ 对象这些事情不太与特定的路由上下文（及其元数据）相关。

但是，Middleware 是愚蠢的。它不知道将调用的 __INLINE_CODE