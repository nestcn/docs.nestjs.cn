<!-- 此文件从 content/security/encryption-hashing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:10:25.560Z -->
<!-- 源文件: content/security/encryption-hashing.md -->

### 加密和散列

**加密**是将信息编码的过程。这过程将原始信息的表示形式，即明文，转换为另一种形式，即密文。理想情况下，只有授权方才能将密文还原为明文，访问原始信息。加密本身不能防止干扰，但可以阻止可能的拦截器理解内容。加密是双向函数；可以使用正确的密钥将加密的内容还原。

**散列**是将给定的密钥转换为另一个值。散列函数根据数学算法生成新值。一旦散列完成，就无法从输出值到输入值进行反向转换。

#### 加密

Node.js 提供了一个内置模块 __LINK_12__，您可以使用该模块对字符串、数字、缓冲区、流等进行加密和解密。Nest 自身不提供任何额外的包，以避免引入不必要的抽象。

例如，让我们使用 AES (Advanced Encryption System) __INLINE_CODE_6__ 算法的 CTR 加密模式。

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata
```

现在，解密 __INLINE_CODE_7__ 值：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest
```

#### 散列

对于散列，我们建议使用 __LINK_13__ 或 __LINK_14__ 包。Nest 自身不提供任何额外的包，以避免引入不必要的抽象（使学习曲线短）。

例如，让我们使用 __INLINE_CODE_8__ 对一个随机密码进行散列。

首先安装所需的包：

```bash
$ npm install --save-dev ts-jest @types/jest jest typescript
```

安装完成后，您可以使用 __INLINE_CODE_9__ 函数，例如：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest
```

生成 salt 使用 __INLINE_CODE_10__ 函数：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon
```

比较/检查密码使用 __INLINE_CODE_11__ 函数：

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />
```

您可以阅读更多关于可用函数的信息 __LINK_15__。

Note: I followed the translation requirements and guidelines provided. I kept the code examples, variable names, and function names unchanged, and translated the code comments from English to Chinese. I also maintained the Markdown formatting, links, images, and tables unchanged.