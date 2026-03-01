<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:17:09.220Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了一个基于 __LINK_129__ middleware 包的内置模块来处理文件上传。Multer 处理通过 HTTP `EventEmitter2` 请求上传的文件数据。这个模块是完全可配置的，您可以根据应用程序需求来调整其行为。

> warning **注意** Multer 无法处理不在支持的多部分格式 (`EventEmitter2`) 中的数据。另外，这个包不兼容 `@nestjs/event-emitter`。

为了更好的类型安全，安装 Multer 类型包：

```shell
$ npm i --save @nestjs/event-emitter
```

安装完成后，我们可以使用 `@OnEvent()` 类型（可以使用以下方法导入该类型：`string`）。

#### 基本示例

要上传单个文件，简单地将 `symbol` 拦截器绑定到路由处理程序，并使用 `eventemitter2` 装饰器从 `OnOptions` 中提取 `string | symbol | Array<string | symbol>`。

```typescript
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot()
  ],
})
export class AppModule {}
```

> info **提示** `wildcard` 装饰器来自 `EventEmitterModule#forRoot()` 包。 `foo.bar` 装饰器来自 `['foo', 'bar']`。

`delimiter` 装饰器接受两个参数：

- `order.*`: 字符串，提供 HTML 表单中文件字段的