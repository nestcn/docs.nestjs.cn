<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T09:02:56.694Z -->
<!-- 源文件: content/guards.md -->

Here is the translation of the provided English technical documentation to Chinese:

### Guards（修改为测试）

Guards是一个带有`@Injectable()`装饰器的类，实现了`CanActivate`接口。

<figure><img class="illustrative-image" src="/assets/Guards_1.png" /></figure>

Guards只有一个责任。他们决定某个请求是否将被路由处理程序处理，不管是根据某些条件（如权限、角色、ACL等）在运行时存在的。这通常被称为**认证**。认证（及其同伴**身份验证**，通常与之合作）在传统的Express应用程序中通常由[middleware](/middleware)处理。Middleware是一个很好的身份验证选择，因为像令牌验证和将属性附加到