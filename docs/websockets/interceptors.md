<!-- 此文件从 content/websockets/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T02:49:53.083Z -->
<!-- 源文件: content/websockets/interceptors.md -->

### 拦截器

与 WebSocket 拦截器没有区别。下面示例使用了手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，您也可以使用网关作用域拦截器（即在网关类前添加一个 __INLINE_CODE_1__ 装饰器）。

```
```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
```