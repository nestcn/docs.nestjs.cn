<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:00:26.376Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

热加载对应用程序的启动过程的影响最大的是**TypeScript 编译**。幸运的是，使用 __LINK_42__ HMR（Hot-Module Replacement），我们不需要在每次更改时重新编译整个项目。这大大减少了实例化应用程序所需的时间，并使iterative开发变得更加容易。

> warning **警告**注意 __INLINE_CODE_10__ 不会自动将资产（例如 __INLINE_CODE_11__ 文件）复制到 __INLINE_CODE_12__ 文件夹。同样， __INLINE_CODE_13__ 不兼容 glob 静态路径（例如 __INLINE_CODE_14__ 属性在 __INLINE_CODE_15__ 中）。

### 使用 CLI

如果您使用 __LINK_43__，配置过程非常简单。CLI 将 __INLINE_CODE_16__ 包装，以便使用 __INLINE_CODE_17__。

#### 安装

首先安装所需的包：

```bash
$ npm i -D @compodoc/compodoc

```

> info **提示**如果您使用 **Yarn Berry**（而不是classic Yarn），安装 __INLINE_CODE_18__ 包而不是 __INLINE_CODE_19__。

#### 配置

安装完成后，在应用程序根目录创建 __INLINE_CODE_20__ 文件。

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s

```

> info **提示**使用 **Yarn Berry**（而不是classic Yarn），在 __INLINE_CODE_22__ 配置属性中使用 __INLINE_CODE_23__ 而不是 __INLINE_CODE_21__，来自 __INLINE_CODE_24__ 包：__INLINE_CODE_25__。

该函数将原始对象，包含默认 Webpack 配置作为第一个参数，以及对应的 __INLINE_CODE_26__ 包的引用作为第二个参数。它还将返回一个修改后的 Webpack 配置，添加了 __INLINE_CODE_27__、__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 插件。

#### Hot-Module Replacement

要启用 **HMR**，打开应用程序入口文件（__INLINE_CODE_30__）并添加以下 Webpack 相关指令：

__CODE_BLOCK_2__

为了简化执行过程，添加一个脚本到您的 __INLINE_CODE_31__ 文件。

__CODE_BLOCK_3__

现在，打开命令行并运行以下命令：

__CODE_BLOCK_4__

### 不使用 CLI

如果您不使用 __LINK_44__，配置将略微复杂一些（需要更多手动步骤）。

#### 安装

首先安装所需的包：

__CODE_BLOCK_5__

> info **提示**如果您使用 **Yarn Berry**（而不是classic Yarn），安装 __INLINE_CODE_32__ 包而不是 __INLINE_CODE_33__。

#### 配置

安装完成后，在应用程序根目录创建 __INLINE_CODE_34__ 文件。

__CODE_BLOCK_6__

> info **提示**使用 **Yarn Berry**（而不是classic Yarn），在 __INLINE_CODE_36__ 配置属性中使用 __INLINE_CODE_37__ 而不是 __INLINE_CODE_35__，来自 __INLINE_CODE_38__ 包：__INLINE_CODE_39__。

该配置告诉 Webpack 几个关于应用程序的基本信息：入口文件的位置、哪个目录用于存储编译后的文件，以及我们想要使用哪种加载器来编译源文件。一般情况下，您可以将该文件作为-is 使用，即使您不完全理解所有选项。

#### Hot-Module Replacement

要启用 **HMR**，打开应用程序入口文件（__INLINE_CODE_40__）并添加以下 Webpack 相关指令：

__CODE_BLOCK_7__

为了简化执行过程，添加一个脚本到您的 __INLINE_CODE_41__ 文件。

__CODE_BLOCK_8__

现在，打开命令行并运行以下命令：

__CODE_BLOCK_9__

#### 示例

一个工作示例可在 __LINK_45__ 中找到。