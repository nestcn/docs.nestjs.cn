<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:18:22.698Z -->
<!-- 源文件: content/security/csrf.md -->

### CSRF 保护

跨站请求伪造（CSRF 或 XSRF）是一种攻击，其中**未经授权**的命令从受信任的用户发送到 Web 应用程序。为了帮助预防这种攻击，您可以使用 __LINK_8__ 包。

#### 与 Express（默认）一起使用

首先，安装所需的包：

```bash
$ npm i --save-dev @swc/cli @swc/core
```

> 警告 **警告** 如 __LINK_9__ 中所述，这个中间件需要会话中间件或 __INLINE_CODE_4__ 之前初始化。请查看文档以获取更多信息。

安装完成后，注册 __INLINE_CODE_5__ 中间件作为全局中间件。

```bash
$ nest start -b swc
# OR nest start --builder swc
```

#### 与 Fastify 一起使用

首先，安装所需的包：

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}
```

安装完成后，注册 __INLINE_CODE_6__ 插件，以下所示：

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

> 警告 **警告** 如 __INLINE_CODE_7__ 文档 __LINK_10__ 中所述，这个插件需要在初始化存储插件之前。请查看文档以获取更多信息。