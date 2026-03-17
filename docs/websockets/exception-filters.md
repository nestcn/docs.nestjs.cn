<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:47:10.675Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和对应的网页套接字层之间唯一的区别是，在抛出 __InvariantError__ 时，您应该使用 __throwError__。

__代码块_0__

> info **提示** __ExceptionFilter__ 类来自 __@nestjs/common__ 包。

使用以下示例，Nest 将处理抛出的异常并emit __LOGGING__ 消息，以结构为：

__代码块_1__

#### 过滤器

网页套接字异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，您也可以使用网关作用域过滤器（即在 __Interceptor__ 装饰器前缀网关类）。

__代码块_2__

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序需求。然而，在某些情况下，您可能想简单地扩展 **core exception filter**，并override 基于某些因素的行为。

要将异常处理委托给基本过滤器，您需要扩展 __ExceptionFilter__ 并调用继承的 __catchError__ 方法。

__代码块_3__

上述实现仅是一个 shell，展示了该approach。您的扩展异常过滤器实现将包括您定的 **业务逻辑**（例如，处理各种条件）。