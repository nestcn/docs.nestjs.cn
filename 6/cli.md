# CLI

## 概述
[Nest CLI](https://github.com/nestjs/nest-cli)是一个命令行界面工具，可帮助您初始化和开发应用程序。从架构项目到构建结构良好的应用程序，它可以在很多方面提供帮助。Nest CLI基于[Angular Devkit](https://github.com/angular/devkit)包。

### 安装

使用 **NPM** 安装 CLI：

``` 
$ npm install -g @nestjs/cli
```

### 基本工作流程

安装过程完成后，您应该能够通过`nest`可执行文件直接从命令行调用CLI命令。

```
$ nest --help
```

### 贡献

您可以[在此](https://github.com/nestjs/nest-cli)参与项目并为其做出贡献。


## 用法

为了提供出色的用户体验，CLI命令共享相同的命令模式。

```
$ nest [command] [...options]
```

### 选项

每个命令都接受下面列出的一组选项：
* **--dry-run:** 允许模拟命令执行，以验证它将如何影响您的工作目录
* **--no-spec:** 允许关闭spec文件的生成（仅适用于generate命令）
* **--flat:** 允许关闭专用目录的生成（仅适用于generate命令）

### new (alias: n)

**new** 命令生成基于 [typescript-starter](https://github.com/nestjs/typescript-starter)上的Nest项目以及安装所需的软件包。CLI将询问您缺少的信息 - 应用程序名称（如果未指定）以及要用于安装依赖项的程序包管理器。

```
$ nest new my-awesome-app
```

### generate (alias: g)

**generate**命令用于生成Nest体系结构组件。
 
|   Option               |      Description           |  Required     | Default value              |
| :---------------------: | :-------------------------: | :------------: | :-------------------------: |
| schematic              | 下面列表中的schematic名称 | true | N/A |
| name                   | 生成的Nest体系结构组件的名称 |false	| N/A |
| path                   | 生成Nest体系结构组件的路径 |false	| src |

可用架构组件的列表：

- `class` (alias: cl)
- `controller` (alias: co)
- `decorator` (alias: d)
- `filter` (alias: f)
- `gateway` (alias: ga)
- `guard` (alias: gu)
- `interface` (alias: -)
- `interceptor` (alias: in)
- `library` (alias: lib)
- `middleware` (alias: mi)
- `module` (alias: mo)
- `pipe` (alias: pi)
- `provider` (alias: pr)
- `resolver` (alias: r)
- `service` (alias: s)

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
  
用法示例:
  
```
$ nest generate service users
OR
$ nest g s users

```

### info (alias: i)

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
| [@franken133](https://github.com/franken133)  | <img class="avatar rounded-2" src="https://avatars0.githubusercontent.com/u/17498284?s=400&amp;u=aa9742236b57cbf62add804dc3315caeede888e1&amp;v=4" height="70">  |  翻译  | 专注于 java 和 nest，[@franken133](https://github.com/franken133)|
