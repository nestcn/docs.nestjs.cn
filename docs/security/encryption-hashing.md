<!-- 此文件从 content/security/encryption-hashing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:20.251Z -->
<!-- 源文件: content/security/encryption-hashing.md -->

### 加密和散列

**加密**是将信息编码的过程。这过程将信息的原始表示形式，称为明文，转换为称为密文的alternative形式。理想情况下，只有授权的方可以将密文还原为明文，并访问原始信息。加密本身不能防止干扰，但可以阻止中间人访问明文。加密是一种两种函数；加密后的信息可以使用正确的密钥还原。

**散列**是将给定的密钥转换为另一个值。散列函数根据数学算法生成新的值。一旦散列完成，应该无法从输出值转换回输入值。

#### 加密

Node.js 提供了一个内置的 __LINK_12__ 模块，您可以使用它来加密和解密字符串、数字、缓冲区、流等。Nest 本身不提供任何额外的包来避免引入不必要的抽象。

例如，让我们使用 AES (Advanced Encryption System) __INLINE_CODE_6__ 算法CTR加密模式。

```bash
$ npm i --save-dev @swc/cli @swc/core
```

现在要解密 __INLINE_CODE_7__ 值：

```bash
$ nest start -b swc
# OR nest start --builder swc
```

#### 散列

对于散列，我们建议使用 __LINK_13__ 或 __LINK_14__ 包。Nest 本身不提供任何额外的包装来避免引入不必要的抽象（使学习曲线短）。

例如，让我们使用 __INLINE_CODE_8__ 散列一个随机密码。

首先安装所需的包：

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}
```

安装完成后，您可以使用 __INLINE_CODE_9__ 函数，以下是示例：

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}
```

要生成盐，请使用 __INLINE_CODE_10__ 函数：

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}

```

要比较/检查密码，请使用 __INLINE_CODE_11__ 函数：

```bash
$ nest start -b swc -w
# OR nest start --builder swc --watch
```

可以阅读更多关于可用函数的信息 __LINK_15__。