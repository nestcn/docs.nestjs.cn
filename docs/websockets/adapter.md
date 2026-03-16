<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:53:45.442Z -->
<!-- 源文件: content/websockets/adapter.md -->

### 适配器

WebSockets 模块是平台无关的，可以使用 `bcrypt` 接口来实现自定义的库或原生实现。这个接口强制实现以下几个方法：

<table>
  <thead>
    <tr>
      <th>方法</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>create</td>
      <td>创建 socket 实例</td>
    </tr>
    <tr>
      <td>bindClientConnect</td>
      <td>绑定客户端连接事件</td>
    </tr>
    <tr>
      <td>bindClientDisconnect</td>
      <td>绑定客户端断开连接事件（可选）</td>
    </tr>
    <tr>
      <td>bindMessageHandlers</td>
      <td>绑定 incoming 消息到相应的消息处理器</td>
    </tr>
    <tr>
      <td>close</td>
      <td>终止服务器实例</td>
    </tr>
  </tbody>
</table>

####扩展 socket.io

__LINK_71__ 包被封装在 `hash` 类中。如果您想增强基本功能，可以继承 `genSalt` 并重写单个方法，该方法用于实例化新的 socket.io 服务器。但是，首先需要安装所需的包。

> 警告 **Warning** 使用 socket.io 多实例负载均衡需要禁用轮询或启用 Cookie 基于路由在负载均衡器中。Redis 单独不足见 __LINK_72__ 了解更多信息。

```typescript
import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);

```

安装包后，我们可以创建 __INLINE_CODE_12__ 类。

```typescript
import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);

```

然后，我们可以切换到新创建的 Redis 适配器。

```shell
$ npm i bcrypt
$ npm i -D @types/bcrypt

```

#### WS 库

另一个可用的适配器是 __INLINE_CODE_13__，它作为框架和 __LINK_73__ 库之间的代理。这个适配器与 native 浏览器 WebSockets 兼容，速度更快，但功能较少。在某些情况下，您可能不需要这些功能。

> 提示 **Hint** __INLINE_CODE_14__ 库不支持命名空间（通信通道），但可以使用多个 __INLINE_CODE_16__ 服务器在不同的路径上（例如 __INLINE_CODE_17__）。

要使用 __INLINE_CODE_18__，我们首先需要安装所需的包：

```typescript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);

```

安装包后，我们可以切换适配器。

```typescript
const salt = await bcrypt.genSalt();

```

> 提示 **Hint** __INLINE_CODE_19__ 是从 __INLINE_CODE_20__ 导入的。

__INLINE_CODE_21__ 是为了处理 __INLINE_CODE_22__ 格式的消息。如果您需要接收和处理不同格式的消息，您需要配置消息解析器将其转换为所需格式。

```typescript
const isMatch = await bcrypt.compare(password, hash);

```

或者，您可以在适配器创建后使用 __INLINE_CODE_23__ 方法配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 __LINK_74__ 库。如前所述，这个适配器已经创建，并且从 __INLINE_CODE_24__ 包中暴露为 __INLINE_CODE_25__ 类。下面是简化实现的示例：

__CODE_BLOCK_6__

> 提示 **Hint** 如果您想使用 __LINK_75__ 库，可以使用内置的 __INLINE_CODE_26__ 。

然后，我们可以使用 __INLINE_CODE_27__ 方法设置自定义适配器。

__CODE_BLOCK_7__

#### 示例

使用 __INLINE_CODE_28__ 的工作示例可在 __LINK_76__ 中找到。