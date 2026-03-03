<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:10:06.518Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了基于 Express 中的 __LINK_129__ middleware 包的内置模块来处理文件上传。 Multer 可以处理在 HTTP `EventEmitter2` 请求中发送的数据，并且可以根据应用程序的需求进行完全配置。

> warning **警告** Multer 无法处理不在支持的多部分格式(`EventEmitter2`)中的数据。请注意，这个包与 `@nestjs/event-emitter` 不兼容。

为了提高类型安全，我们可以安装 Multer 的类型包：

```shell
$ npm i --save @nestjs/event-emitter
```

安装完成后，我们可以使用 `@OnEvent()` 类型（可以将其作为 `string` 导入）。

#### 基本示例

要上传单个文件，可以将 `symbol` 间接器附加到路由处理程序，并使用 `eventemitter2` 装饰器从 `OnOptions` 中提取 `string | symbol | Array<string | symbol>`。

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

- `order.*`：字符串，用于指定 HTML 表单中的字段名，这个字段名包含文件
- __INLINE