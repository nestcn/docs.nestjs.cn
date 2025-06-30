### CLI 命令参考

#### nest new

创建一个新的（标准模式）Nest 项目。

```bash
$ nest new <name> [options]
$ nest n <name> [options]
```

##### 描述

创建并初始化一个新的 Nest 项目。会提示选择包管理器。

*   使用给定的 `<name>` 创建文件夹
*   用配置文件填充该文件夹
*   创建源代码子文件夹(`/src`)和端到端测试子文件夹(`/test`)
*   用默认文件填充子文件夹，包含应用组件和测试文件

##### 参数

| 参数项 | 描述 |
| --- | --- |
|  | 新项目名称 |

##### 选项

| 选项 | 描述 |
| --- | --- |
| \--dry-run | 显示将会做出的更改，但不实际修改文件系统。别名：-d |
| \--skip-git | 跳过 git 仓库初始化。别名：-g |
| \--skip-install | 跳过包安装。别名：-s |
| \--package-manager \[package-manager\] | 指定包管理器。使用 npm、yarn 或 pnpm。包管理器必须全局安装。别名：-p |
| \--language \[language\] | 指定编程语言（TS 或 JS）。别名：-l |
| \--collection \[collectionName\] | 指定原理图集合。使用包含原理图的已安装 npm 包的包名称。别名：-c |
| \--strict | 启动项目时启用以下 TypeScript 编译器标志：strictNullChecks、noImplicitAny、strictBindCallApply、 forceConsistentCasingInFileNames 、noFallthroughCasesInSwitch |

#### nest generate

根据原理图生成和/或修改文件

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]
```

##### 参数

| 参数 | 描述 |
| --- | --- |
|  | 要生成的 schematic 或 collection:schematic。可用的 schematic 请参阅下表。 |
|  | 所生成组件的名称。 |

##### 原理图

| 名称 | 别名 | 描述 |
| --- | --- | --- |
| app |  | 在 monorepo 中生成一个新应用（如果是标准结构则转换为 monorepo）。 |
| library | lib | 在 monorepo 中生成一个新库（如果是标准结构则转换为 monorepo）。 |
| class | cl | 生成一个新类。 |
| controller | co | 生成控制器声明。 |
| decorator | d | 生成自定义装饰器。 |
| filter | f | 生成过滤器声明。 |
| gateway | ga | 生成网关声明。 |
| guard | gu | 生成守卫声明。 |
| interface | itf | 生成一个接口。 |
| interceptor | itc | 生成一个拦截器声明。 |
| middleware | mi | 生成一个中间件声明。 |
| module | mo | 生成一个模块声明。 |
| pipe | pi | 生成管道声明。 |
| provider | pr | 生成提供者声明。 |
| resolver | r | 生成解析器声明。 |
| resource | res | 生成新的 CRUD 资源。详情请参阅 CRUD（资源）生成器 。（仅限 TS） |
| service | s | 生成服务声明 |

##### 选项

| 选项 | 描述 |
| --- | --- |
| \--dry-run | 报告将进行的更改，但不会实际修改文件系统。别名：-d |
| \--project \[project\] | 该元素应添加到的项目。别名：-p |
| \--flat | 不要为该元素生成文件夹。 |
| \--collection \[collectionName\] | 指定原理图集合。使用包含原理图的已安装 npm 包的包名称。别名：-c |
| \--spec | 强制生成规范文件（默认） |
| \--no-spec | 禁用规范文件生成 |

#### nest build

将应用程序或工作区编译到输出文件夹中。

此外，`build` 命令还负责：

*   通过 `tsconfig-paths` 映射路径（若使用路径别名）
*   使用 OpenAPI 装饰器标注 DTO（若启用 `@nestjs/swagger` CLI 插件）
*   使用 GraphQL 装饰器标注 DTO（若启用 `@nestjs/graphql` CLI 插件）

```bash
$ nest build <name> [options]
```

##### 参数

| 参数 | 描述 |
| --- | --- |
|  | 要构建的项目名称。 |

##### 选项

| 选项 | 描述 |
| --- | --- |
| \--path \[path\] | tsconfig 文件的路径。别名 -p |
| \--config \[path\] | nest-cli 配置文件的路径。别名 -c |
| \--watch | 以监听模式运行（实时重载）。如果使用 tsc 进行编译，当 manualRestart 选项设为 true 时，可输入 rs 重启应用。别名 -w |
| \--builder \[name\] | 指定用于编译的构建工具（tsc、swc 或 webpack）。别名 -b |
| \--webpack | 使用 webpack 进行编译（已弃用：改用 --builder webpack）。 |
| \--webpackPath | webpack 配置文件的路径。 |
| \--tsc | 强制使用 tsc 进行编译。 |
| \--watchAssets | 监视非 TS 文件（如 .graphql 等资源文件）。详见资源文件章节。 |
| \--type-check | 启用类型检查（当使用 SWC 时）。 |
| \--all | 构建单仓库中的所有项目。 |
| \--preserveWatchOutput | 在监视模式下保留过时的控制台输出而非清屏（仅限 tsc 监视模式） |

#### nest start

编译并运行应用程序（或工作区中的默认项目）。

```bash
$ nest start <name> [options]
```

##### 参数

| 参数 | 描述 |
| --- | --- |
|  | 要运行的项目名称 |

##### 选项

| 选项 | 描述 |
| --- | --- |
| \--path \[path\] | tsconfig 文件的路径。别名 -p |
| \--config \[path\] | nest-cli 配置文件的路径。别名 -c |
| \--watch | 以监视模式运行（实时重载）别名 -w |
| \--builder \[name\] | 指定用于编译的构建工具（tsc、swc 或 webpack）。别名 -b |
| \--preserveWatchOutput | 在监视模式下保留过时的控制台输出，而不是清屏。（仅限 tsc 监视模式） |
| \--watchAssets | 以监视模式运行（实时重载），观察非 TS 文件（资源）。详见资源获取更多详情。 |
| \--debug \[hostport\] | 以调试模式运行（带--inspect 标志）别名 -d |
| \--webpack | 使用 webpack 进行编译。（已弃用：改用 --builder webpack） |
| \--webpackPath | webpack 配置文件的路径。 |
| \--tsc | 强制使用 tsc 进行编译。 |
| \--exec \[binary\] | 要运行的二进制文件（默认为 node）。别名 -e |
| \--no-shell | 不要在 shell 中生成子进程（参见 node 的 child\_process.spawn() 方法文档）。 |
| \--env-file | 从当前目录的相对路径加载环境变量文件，使其在 process.env 中可供应用程序使用。 |
| \-- \[key=value\] | 可通过 process.argv 引用的命令行参数。 |

#### nest add

导入已打包为 **nest 库**的库，并运行其安装原理图。

```bash
$ nest add <name> [options]
```

##### 参数

| 参数 | 描述 |
| --- | --- |
|  | 要导入的库名称。 |

#### nest 信息

显示已安装的 nest 包的相关信息及其他有用的系统信息。例如：

```bash
$ nest info
```

```bash
 _   _             _      ___  _____  _____  _     _____
| \ | |           | |    |_  |/  ___|/  __ \| |   |_   _|
|  \| |  ___  ___ | |_     | |\ `--. | /  \/| |     | |
| . ` | / _ \/ __|| __|    | | `--. \| |    | |     | |
| |\  ||  __/\__ \| |_ /\__/ //\__/ /| \__/\| |_____| |_
\_| \_/ \___||___/ \__|\____/ \____/  \____/\_____/\___/
```

[System Information]
OS Version : macOS High Sierra
NodeJS Version : v20.18.0
[Nest Information]
microservices version : 10.0.0
websockets version : 10.0.0
testing version : 10.0.0
common version : 10.0.0
core version : 10.0.0
```