### 库

许多应用程序需要解决相同的通用问题，或在多种不同场景中复用模块化组件。Nest 提供了几种解决方式，每种方式在不同层面上处理问题，以满足不同的架构和组织目标。

Nest [模块](/overview/modules)能为组件共享提供执行上下文，适用于单一应用内部。这些模块还可通过 [npm](https://npmjs.com) 打包，创建可复用的库并安装到不同项目中。这是分发可配置、可复用库的有效方式，适用于松散关联或无关联的不同组织（例如通过分发/安装第三方库）。

在组织严密的群体（如公司/项目内部）中共享代码时，采用更轻量级的组件共享方式会很有帮助。为此出现了 monorepo 这种结构，而在 monorepo 中， **库**提供了一种简单轻便的代码共享方式。在 Nest monorepo 中，使用库可以轻松组装共享组件的应用程序。实际上，这鼓励了将单体应用和开发流程分解，专注于构建和组合模块化组件。

#### Nest 库

Nest 库是一种不同于应用程序的 Nest 项目，它无法独立运行。库必须被导入到容器应用程序中才能执行其代码。本节描述的内置库支持仅适用于 **monorepo**（标准模式项目可以通过 npm 包实现类似功能）。

例如，一个组织可以开发一个 `AuthModule` 模块，通过实施管理所有内部应用的公司策略来处理认证。与其为每个应用单独构建该模块，或通过 npm 物理打包代码并要求每个项目安装它，monorepo 可以将此模块定义为一个库。这样组织时，库模块的所有使用者都能看到 `AuthModule` 提交时的最新版本。这对协调组件开发与组装、简化端到端测试具有显著优势。

#### 创建库

任何适合复用的功能都可以考虑作为库来管理。决定哪些部分应该成为库、哪些应该保留在应用中，这是一个架构设计决策。创建库不仅仅是简单地将代码从现有应用复制到新库中。当被打包为库时，库代码必须与应用解耦。这可能需要**更多**前期时间，并强制做出一些在紧密耦合代码中可能不会遇到的设计决策。但当该库能够用于跨多个应用实现更快速的应用组装时，这些额外努力将得到回报。

要开始创建库，请运行以下命令：

```bash
$ nest g library my-library
```

运行该命令时，`library` 原理图会提示您输入库的前缀（又称别名）：

```bash
您希望为该库使用什么前缀（默认：@app）？
```

这会在您的工作空间中创建一个名为 `my-library` 的新项目。库类型项目与应用类型项目一样，使用原理图生成到指定文件夹中。库在 monorepo 根目录的 `libs` 文件夹下管理。Nest 在首次创建库时会创建 `libs` 文件夹。

为库生成的文件与为应用生成的文件略有不同。执行上述命令后，`libs` 文件夹的内容如下：

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

`nest-cli.json` 文件将在 `"projects"` 键下新增一个库的条目：

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

库与应用程序在 `nest-cli.json` 元数据中有两处不同：

*   `"type"` 属性设置为 `"library"` 而非 `"application"`
*   `"entryFile"` 属性设置为 `"index"` 而非 `"main"`

这些差异决定了构建过程如何正确处理库。例如，库通过 `index.js` 文件导出其函数。

与应用类型项目类似，每个库都有自己扩展自根目录（整个 monorepo 范围内）`tsconfig.json` 文件的 `tsconfig.lib.json` 文件。如有需要，您可以修改此文件以提供库特定的编译器选项。

您可以使用 CLI 命令构建该库：

```bash
$ nest build my-library
```

#### 使用库

有了自动生成的配置文件后，使用库就变得简单直接。我们该如何将 `MyLibraryService` 从 `my-library` 库导入到 `my-project` 应用中呢？

首先要注意，使用库模块与使用其他 Nest 模块相同。monorepo 的作用是以透明化的方式管理路径，使得导入库和生成构建现在变得直观。要使用 `MyLibraryService`，我们需要导入其声明模块。我们可以修改 `my-project/src/app.module.ts` 如下所示来导入 `MyLibraryModule`。

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

注意上面我们在 ES 模块的 `import` 语句中使用了 `@app` 路径别名，这是我们之前执行 `nest g library` 命令时提供的 `prefix`。在底层，Nest 通过 tsconfig 路径映射来处理这一点。当添加库时，Nest 会像这样更新全局（monorepo）`tsconfig.json` 文件中的 `"paths"` 键：

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

简而言之，monorepo 与库功能的结合使得将库模块集成到应用程序中变得简单直观。

同样的机制支持构建和部署由库组成的应用程序。一旦导入 `MyLibraryModule` 后，运行 `nest build` 会自动处理所有模块解析，并将应用程序与库依赖项打包以供部署。monorepo 的默认编译器是 **webpack**，因此生成的发布文件会将所有转译后的 JavaScript 文件打包成单一文件。您也可以按照[此处](../cli/workspaces#全局编译器选项)说明切换至 `tsc` 编译器。