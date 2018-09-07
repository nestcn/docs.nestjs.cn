# CLI

## 概述
为了帮助用户管理他们的项目，已经创建了 [CLI](https://github.com/nestjs/nest-cli) 工具。它同时在很多方面都有帮助，从搭建项目到构建结构良好的应用程序。嵌套CLI基于 [@ angular - devkit](https://github.com/angular/devkit) 软件包。此外，还有专门用于嵌套开发 [@ nestjs / schematics](https://github.com/nestjs/schematics) 的特殊示意图

### 安装

使用 **NPM** 安装 CLI：

``` 
$ npm install -g @nestjs/cli
```

使用 **Docker Hub** 安装CLI：

```
$ docker pull nestjs/cli:[version]
```

更多详细信息可在 [Docker Hub](https://hub.docker.com/r/nestjs/cli/) 中找到。

## 使用

为了提高用户体验，CLI命令共享相同的命令架构

```
$ nest [command] [...options]
```

### 选项

每个命令都接受下面列出的一组选项：
* **--dry-run：** 允许模拟命令执行，以验证它将如何影响您的工作目录

### new (alias: n)

**new** 命令生成基于 [typescript-starter](https://github.com/nestjs/typescript-starter)上的Nest项目以及安装所需的软件包。CLI会询问您是否缺少创建项目的信息，例如，您想使用哪个程序包管理器来安装依赖项。
 
|   Option               |      Description           |  Required     | Default value              |
| :---------------------: | :-------------------------: | :------------: | :-------------------------: |
| name                   | 你的应用名称 | false | nest-app-name |
| description            | 你的应用程序描述 |false	| description |
| version                | 你的应用版本 |false	| 1.0.0 |
| author                 | 您的应用作者 |false	| '' |

示例用法:

```
$ nest new my-awesome-app
OR 
$ nest n my-awesome-app
```

generate (alias: g)

 **generate** 命令生成嵌套体系结构组件。

|   Option               |      Description           |  Required     | Default value              |
| :---------------------: | :-------------------------: | :------------: | :-------------------------: |
| schematic                   | 下面列表中的示意图名称。 | true | N/A |
| name          | generateNest架构组件的名称  |true	| N/A |
| path               | generateNest架构组件的路径 |false	|src |

可用体系结构组件的列表:
  
  * class (alias: cl)
  
  * controller (alias: co)
  
  * decorator (alias: d)
  
  * exception (alias: e)
  
  * filter (alias: f)
  
  * gateway (alias: ga)
  
  * guard (alias: gu)
  
  * interceptor (alias: i)
  
  * middleware (alias: mi)
  
  * module (alias: mo)
  
  * pipe (alias: pi) 
  
  * provider (alias: pr)
  
  * service (alias: s)
  
  示例用法:
  
  ```
$ nest generate service users
$ nest g s users
```

info (alias: i)

**info** 命令将显示您的项目信息

```
$ nest info
 _   _             _      ___  _____  _____  _     _____
| \ | |           | |    |_  |/  ___|/  __ \| |   |_   _|
|  \| |  ___  ___ | |_     | |\ `--. | /  \/| |     | |
| . ` | / _ \/ __|| __|    | | `--. \| |    | |     | |
| |\  ||  __/\__ \| |_ /\__/ //\__/ /| \__/\| |_____| |_
\_| \_/ \___||___/ \__|\____/ \____/  \____/\_____/\___/

[System Information]
OS Version     : macOS High Sierra
NodeJS Version : v8.9.0
YARN Version    : 1.5.1
[Nest Information]
microservices version : 5.0.0
websockets version    : 5.0.0
testing version       : 5.0.0
common version        : 5.0.0
core version          : 5.0.0
```


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |