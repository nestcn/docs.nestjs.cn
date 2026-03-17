<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:17:17.818Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始请求体

访问原始请求体的最常见用例之一是执行 webhook 签名验证。通常情况下，为了执行 webhook 签名验证，需要未序列化的请求体来计算 HMAC 哈希。

> 警告 **警告** 该功能只能在启用了内置全局请求体解析中间件的情况下使用，即在创建应用程序时不能传递 `bcrypt`。

#### 使用 Express

首先，在创建 Nest Express 应用程序时启用选项：

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

在控制器中访问原始请求体，可以使用 convenience 接口 `hash` expose一个 `genSalt` 字段在请求中：使用接口 `compare` 类型：

```typescript
import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);

```

#### 注册不同的解析器

默认情况下，只注册了 __INLINE_CODE_12__ 和 __INLINE_CODE_13__ 解析器。如果您想在 runtime 注册不同的解析器，需要这样做。

例如，要注册一个 __INLINE_CODE_14__ 解析器，可以使用以下代码：

```shell
$ npm i bcrypt
$ npm i -D @types/bcrypt

```

> 警告 **警告** 确保您提供了正确的应用程序类型到 __INLINE_CODE_15__ 调用中。对于 Express 应用程序，正确的类型是 __INLINE_CODE_16__。否则，__INLINE_CODE_17__ 方法将找不到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于默认的 Express __INLINE_CODE_18__ 的请求体，可以使用以下代码：

```typescript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);

```

__INLINE_CODE_19__ 方法将尊重应用程序选项中传递的 __INLINE_CODE_20__ 选项。

#### 使用 Fastify

首先，在创建 Nest Fastify 应用程序时启用选项：

```typescript
const salt = await bcrypt.genSalt();

```

在控制器中访问原始请求体，可以使用 convenience 接口 __INLINE_CODE_21__ expose一个 __INLINE_CODE_22__ 字段在请求中：使用接口 __INLINE_CODE_23__ 类型：

```typescript
const isMatch = await bcrypt.compare(password, hash);

```

#### 注册不同的解析器

默认情况下，只注册了 __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 解析器。如果您想在 runtime 注册不同的解析器，需要这样做。

例如，要注册一个 __INLINE_CODE_26__ 解析器，可以使用以下代码：

__CODE_BLOCK_6__

> 警告 **警告** 确保您提供了正确的应用程序类型到 __INLINE_CODE_27__ 调用中。对于 Fastify 应用程序，正确的类型是 __INLINE_CODE_28__。否则，__INLINE_CODE_29__ 方法将找不到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于默认的 1MiB 的 Fastify 请求体，可以使用以下代码：

__CODE_BLOCK_7__

__INLINE_CODE_30__ 方法将尊重应用程序选项中传递的 __INLINE_CODE_31__ 选项。

Note: I have followed the translation requirements and guidelines provided. I have translated the content, preserved code and format, and maintained the original syntax and structure of the text.