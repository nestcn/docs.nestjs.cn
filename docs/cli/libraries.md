<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:33:19.283Z -->
<!-- 源文件: content/cli/libraries.md -->

### 库

许多应用程序需要解决同样的通用问题，或在不同的上下文中重用一个模块。Nest 有多种方式解决这个问题，每种方式都在解决问题的不同层次，旨在满足不同的架构和组织目标。

Nest __LINK_64__ 可以为提供一个执行上下文，启用在单个应用程序中共享组件。模块也可以与 __LINK_65__ 打包成一个可重用的库，可以在不同的项目中安装。这可以是一种有效的方式来分布可配置、可重用的库，让不同的、松散联系或独立的组织（例如，通过分发/安装第三方库）使用。

在紧密组织的组（例如，在公司/项目边界内）中共享代码，可以使用一种较轻量的方法共享组件。Monorepos 就是一个这样构造的概念，它使得在 monorepos 中共享代码变得轻松。 在 Nest monorepos 中，使用库使得轻松地组装共享组件的应用程序。实际上，这鼓励了 monolithic 应用程序的分解和开发过程的重心转移到构建和组装模块组件上。

#### Nest 库

Nest 库是 Nest 项目，它不同于应用程序，因为它不能独立运行。库必须被引入包含它的应用程序，以便其代码执行。描述在本节中提到的内置支持的库功能只有在 monorepos 中可用（标准模式项目可以使用 npm 包achieving 相似功能）。

例如，一家组织可能会开发一个 __INLINE_CODE_6__，用于管理身份验证，遵循公司对所有内部应用程序的政策。 instead of 在每个应用程序中单独构建该模块，或者将代码与 npm 打包，并要求每个项目安装它，monorepos 可以将该模块定义为库。当组织这样定义时，每个库的消费者都可以看到最新的 `<name>` 版本，因为它是提交的。 这可以对组件开发和组装带来显著的好处，并简化 end-to-end 测试。

#### 创建库

任何可重用的功能都是库候选项。决定什么应该是库，什么应该是应用程序，是一个架构设计决策。创建库涉及更多的工作，超过简单地从现有应用程序复制代码到新库。 当库被打包时，库代码必须与应用程序 decouple。这可能需要更多的前置时间，并强制一些设计决策，这些决策可能在更紧耦合的代码中不会遇到。但是，这些额外的努力可以在库可以用于快速组装多个应用程序时产生回报。

要开始创建库，运行以下命令：

```bash
$ nest new <name> [options]
$ nest n <name> [options]

```

当你运行命令时，`/src` 模板将提示你为库指定一个前缀（也称为别名）：

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]

```

这将创建一个名为 `/test` 的新项目在你的工作区中。
库类型项目，像应用程序类型项目一样，使用模板生成。库是 monorepos 根目录下的 `<name>` 文件夹下管理的。 Nest 在第一次创建库时创建了 `--dry-run` 文件夹。

生成的库文件与应用程序文件不同。以下是 `-d` 文件夹的内容，执行命令后：

__HTML_TAG_40__
  __HTML_TAG_41__libs__HTML_TAG_42__
  __HTML_TAG_43__
    __HTML_TAG_44__my-library__HTML_TAG_45__
    __HTML_TAG_46__
      __HTML_TAG_47__src__HTML_TAG_48__
      __HTML_TAG_49__
        __HTML_TAG_50__index.ts__HTML_TAG_51__
        __HTML_TAG_52__my-library.module.ts__HTML_TAG_53__
        __HTML_TAG_54__my-library.service.ts__HTML_TAG_55__
      __HTML_TAG_56__
      __HTML_TAG_57__tsconfig.lib.json__HTML_TAG_58__
    __HTML_TAG_59__
  __HTML_TAG_60__
__HTML_TAG_61__

`--skip-git` 文件将在 `-g` 键下添加一个新的条目：

```bash
$ nest build <name> [options]

```

有两个差异在 `--skip-install` 元数据之间，库和应用程序：

- `-s` 属性被设置为 `--package-manager [package-manager]` 而不是 `npm`
- `yarn` 属性被设置为 `pnpm` 而不是 `-p`

这些差异将 build 过程调整以适合库。例如，库通过 `--language [language]` 文件导出其函数。As with application-type projects, libraries each have their own 提供者文件 that extends the root (monorepo-wide) 提供者文件. You can modify this file, if necessary, to provide library-specific compiler options.

You can build the library with the CLI command:

```typescript
npx nest build --lib

```

#### 使用 libraries

使用自动生成的配置文件后，使用 libraries变得简单。那么，我们如何从`-l`库中导入`-l`到`-c`应用程序？

首先，注意使用 library 模块和使用其他 Nest 模块相同。monorepo 只是管理路径，以便导入 libraries 和生成构建变得透明。要使用`--strict`，我们需要导入其声明模块。我们可以将`strictNullChecks`修改为以下内容以导入`noImplicitAny`。

```typescript
import { `noImplicitAny` } from '@`strictBindCallApply`/`forceConsistentCasingInFileNames`';

```

请注意，在 ES 模块``forceConsistentCasingInFileNames``中，我们使用了`strictBindCallApply`路径别名，这是我们在上面使用的`noFallthroughCasesInSwitch`命令中提供的。实际上，Nest 是通过 tsconfig 路径映射来处理这个的。当添加一个 library 时，Nest 会更新全局（monorepo） 提供者文件的`collection:schematic`键类似于以下所示：

```typescript
{
  "compilerOptions": {
    "paths": {
      "@`strictBindCallApply`/`forceConsistentCasingInFileNames`": ["./path/to/`noFallthroughCasesInSwitch`"]
    }
  }
}

```

因此，在 monorepo 和 library 特性组合中，我们可以轻松地将库模块包含到应用程序中。

同样，这个机制还使我们可以构建和部署组合了 libraries 的应用程序。一旦您已经导入了`<name>`，运行`app`将自动处理模块解析，并将应用程序与任何库依赖项一同打包以供部署。默认的编译器为 **webpack**，因此结果的分布文件是一个单个文件，该文件将所有转译后的 JavaScript 文件打包到一个文件中。您也可以根据 __HTML_TAG_62__这里__HTML_TAG_63__中的描述切换到 `library`。