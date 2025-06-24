### 加密与哈希

**加密**是将信息编码的过程。该过程将信息的原始表示形式（称为明文）转换为另一种形式（称为密文）。理想情况下，只有授权方才能将密文解密回明文并访问原始信息。加密本身并不能防止干扰，但会使得潜在拦截者无法理解内容。加密是一种双向函数；经过加密的内容可以通过正确的密钥进行解密。

**哈希**是将给定键值转换为另一个值的过程。哈希函数根据数学算法生成新值。一旦完成哈希处理，应该无法从输出值反推输入值。

#### 加密

Node.js 提供了一个内置的[加密模块(crypto module)](https://nodejs.org/api/crypto.html)，可用于加密和解密字符串、数字、缓冲区、流等。Nest 本身并未在该模块之上提供任何额外的包，以避免引入不必要的抽象层。

例如，我们使用 AES（高级加密系统）`'aes-256-ctr'` 算法的 CTR 加密模式。

```typescript
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

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

现在要解密 `encryptedText` 值：

```typescript
import { createDecipheriv } from 'crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);
```

#### 哈希处理

对于哈希处理，我们推荐使用 [bcrypt](https://www.npmjs.com/package/bcrypt) 或 [argon2](https://www.npmjs.com/package/argon2) 包。Nest 本身没有在这些模块之上提供额外的封装层，以避免引入不必要的抽象（从而降低学习成本）。

例如，我们使用 `bcrypt` 来哈希一个随机密码。

首先安装所需依赖包：

```shell
$ npm i bcrypt
$ npm i -D @types/bcrypt
```

安装完成后，可以按如下方式使用 `hash` 函数：

```typescript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);
```

要生成盐值，请使用 `genSalt` 函数：

```typescript
const salt = await bcrypt.genSalt();
```

要比较/验证密码，请使用 `compare` 函数：

```typescript
const isMatch = await bcrypt.compare(password, hash);
```

您可以[在此](https://www.npmjs.com/package/bcrypt)阅读有关可用函数的更多信息。