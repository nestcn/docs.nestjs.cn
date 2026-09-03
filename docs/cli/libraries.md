<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.317Z -->
<!-- 源文件: content/cli/libraries.md -->

### 库

许多应用程序需要解决相同的通用问题，或在多个不同的上下文中重用模块化组件。Nest 有几种方法来解决这个问题，但每种方法都在不同的层面上工作，以有助于满足不同的架构和组织目标的方式解决问题。

Nest [模块](/modules)对于提供在单个应用程序内共享组件的执行上下文非常有用。模块也可以使用 [npm](https://npmjs.com) 打包，创建一个可安装在多个项目中的可重用库。这可以是分发可配置、可重用库的有效方式，这些库可以被不同的、松散连接或无关的组织使用（例如，通过分发/安装第三方库）。

对于在紧密组织的组内共享代码（例如，在公司/项目边界内），采用更轻量级的方法共享组件可能很有用。Monorepo 已经作为一种结构出现来实现这一点，在 monorepo 中，**库**提供了一种简单、轻量级的方式共享代码。在 Nest monorepo 中，使用库可以轻松组装共享组件的应用程序。事实上，这鼓励了单体应用程序的分解和开发过程，专注于构建和组合模块化组件。

#### Nest 库

Nest 库是一个 Nest 项目，与应用程序的不同之处在于它不能独立运行。库必须导入到包含的应用程序中才能执行其代码。本节中描述的库内置支持仅适用于 **monorepos**（标准模式项目可以使用 npm 包实现类似功能）。

例如，一个组织可能开发一个 `AuthModule`，通过实施管理所有内部应用程序的公司策略来管理身份验证。与其为每个应用程序单独构建该模块，或使用 npm 物理打包代码并要求每个项目安装它，monorepo 可以将此模块定义为库。以这种方式组织时，库模块的所有使用者都可以看到提交时的 `AuthModule` 最新版本。这对于协调组件开发和组装以及简化端到端测试具有重要意义。

#### 创建库

任何适合重用的功能都是作为库管理的候选者。决定什么应该是库，什么应该是应用程序的一部分，是一个架构设计决策。创建库不仅仅是将代码从现有应用程序复制到新库。当打包为库时，库代码必须与应用程序解耦。这可能需要**更多**的前期时间，并强制你做出一些紧密耦合代码可能不会面临的设计决策。但当库可以用于在多个应用程序中实现更快速的应用程序组装时，这些额外的努力会得到回报。

要开始创建库，运行以下命令：

```bash
$ nest g library my-library

```

运行命令时，`library` 原理会提示你输入库的前缀（也称为别名）：

```bash
What prefix would you like to use for the library (default: @app)?

```

这将在你的工作区中创建一个名为 `my-library` 的新项目。
库类型项目与应用程序类型项目一样，使用原理生成到命名文件夹中。库在 monorepo 根目录的 `libs` 文件夹下管理。Nest 在首次创建库时创建 `libs` 文件夹。

为库生成的文件与应用程序生成的文件略有不同。以下是执行上述命令后 `libs` 文件夹的内容：

<div class="file-tree">
  <div class="item">libs</div>
  <div class="children">
    <div class="item">my-library</div>
    <div class="children">
      <div class="item">src</div>
      <div class="children">
        <div class="item">index.ts</div>
        <div class="item">my-library.module.ts</div>
        <div class="item">my-library.service.ts</div>
      </div>
      <div class="item">tsconfig.lib.json</div>
    </div>
  </div>
</div>

`nest-cli.json` 文件将在 `"projects"` 键下为库添加一个新条目：

```javascript
...
{
    "my-library": {
      "type": "library",
      "root": "libs/my-library",
      "entryFile": "index",
      "sourceRoot": "libs/my-library/src",
      "compilerOptions": {
        "tsConfigPath": "libs/my-library/tsconfig.lib.json"
      }
}
...

```

库和应用程序在 `nest-cli.json` 元数据中有两个区别：

- `"type"` 属性设置为 `"library"` 而不是 `"application"`
- `"entryFile"` 属性设置为 `"index"` 而不是 `"main"`

这些区别使构建过程能够适当地处理库。例如，库通过 `index.js` 文件导出其函数。

与应用程序类型项目一样，库各自有自己的 `tsconfig.lib.json` 文件，该文件扩展根（monorepo 范围）`tsconfig.json` 文件。如有必要，你可以修改此文件以提供库特定的编译器选项。

你可以使用 CLI 命令构建库：

```bash
$ nest build my-library

```

#### 使用库

有了自动生成的配置文件，使用库非常简单。我们如何将 `my-library` 库中的 `MyLibraryService` 导入到 `my-project` 应用程序中？

首先，请注意使用库模块与使用任何其他 Nest 模块相同。monorepo 所做的是以现在导入库和生成构建透明的方式管理路径。要使用 `MyLibraryService`，我们需要导入其声明模块。我们可以修改 `my-project/src/app.module.ts` 如下以导入 `MyLibraryModule`。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLibraryModule } from '@app/my-library';

@Module({
  imports: [MyLibraryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

注意上面我们在 ES 模块 `import` 行中使用了 `@app` 路径别名，这是我们在上面的 `nest g library` 命令中提供的 `prefix`。在底层，Nest 通过 tsconfig 路径映射处理此问题。添加库时，Nest 会更新全局（monorepo）`tsconfig.json` 文件的 `"paths"` 键，如下所示：

```javascript
"paths": {
    "@app/my-library": [
        "libs/my-library/src"
    ],
    "@app/my-library/*": [
        "libs/my-library/src/*"
    ]
}

```

简而言之，monorepo 和库功能的结合使得将库模块包含到应用程序中变得简单直观。

同样的机制使得构建和部署组合库的应用程序成为可能。一旦你导入了 `MyLibraryModule`，运行 `nest build` 会自动处理所有模块解析，并将应用程序与任何库依赖项一起打包以进行部署。monorepo 的默认编译器是 **webpack**，因此生成的分发文件是一个将所有转译的 JavaScript 文件打包到单个文件中的文件。你也可以切换到 `tsc`，如<a href="./cli/monorepo#global-compiler-options">这里</a>所述。
