<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:06:36.802Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个使用 __INLINE_CODE_11__ 装饰器注解的类，实现了 __INLINE_CODE_12__ 接口。

__HTML_TAG_68____HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。他们确定某个请求是否将被路由处理程序处理，不管某些在运行时存在的条件（如权限、角色、ACL 等）。这通常被称为 授权。授权（和其同伴身份验证）在传统的 Express 应用程序中通常被 __LINK_75__ 处理。Middleware 是身份验证的不错选择，因为像令牌验证和将属性附加到 __INLINE_CODE_13__ 对象这些事情与特定路由上下文（及其元数据）没有太多关系。

但是，Middleware 的本质是愚蠢的。