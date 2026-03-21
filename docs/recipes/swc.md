<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:14:41.100Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__[链接81](Speedy Web Compiler) 是一个可扩展的 Rust-based 平台，用于编译和捆绑。使用 SWC 和 Nest CLI 可以快速简化您的开发过程。

> 提示 **hint** SWC 大约是默认 TypeScript 编译器的 **x20** 倍速度。

#### 安装

要开始使用，首先安装一些包：

__代码块0__

#### 获取started

安装过程完成后，您可以使用 __INLINE_CODE_25__ 构建器与 Nest CLI alike：

__代码块1__

> 提示 **hint** 如果您的仓库是一个 monorepo， consulta __链接82__。

您可以使用 __INLINE_CODE_26__ 标志或将 __INLINE_CODE_27__ 属性设置为 __INLINE_CODE_28__ 在您的 __INLINE_CODE_29__ 文件中：

__代码块2__

为了自定义构建器的行为，您可以传递一个对象，其中包含两个属性：__INLINE_CODE_30__ (__INLINE_CODE_31__) 和 __INLINE_CODE_32__，如下所示：

__代码块3__

例如，要使 swc 编译 __INLINE_CODE_33__ 和 __INLINE_CODE_34__ 文件，请执行以下命令：

__代码块4__

要在 watch 模式下运行应用程序，请执行以下命令：

__代码块5__

#### 类型检查

SWC 不会执行类型检查（与默认 TypeScript 编译器不同），因此要启用它，您需要使用 __INLINE_CODE_35__ 标志：

__代码块6__

这将 instruct Nest CLI 在 __INLINE_CODE_36__ 模式下运行 SWC，并异步执行类型检查。相反，您也可以将 __INLINE_CODE_38__ 标志设置为 __INLINE_CODE_40__ 在您的 __INLINE_CODE_41__ 文件中：

__代码块7__

#### CLI 插件（SWC）

__INLINE_CODE_42__ 标志将自动执行 **NestJS CLI 插件**并生成一个可序列化的元数据文件，该文件可以在应用程序的 runtime 中被加载。

#### SWC 配置

SWC 构建器预先配置为满足 NestJS 应用程序的要求。然而，您可以通过创建一个 __INLINE_CODE_43__ 文件在应用程序的根目录中并调整选项来自定义配置：

__代码块8__

#### monorepo

如果您的仓库是一个 monorepo，那么您需要使用 __INLINE_CODE_44__ 构建器，而不是 __INLINE_CODE_45__。

首先，让我们安装所需的包：

__代码块9__

安装完成后，在应用程序的根目录中创建一个 __INLINE_CODE_47__ 文件，并将以下内容写入其中：

__代码块10__

#### monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，__INLINE_CODE_48__ 将不会自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。要做到这一点，请在 __INLINE_CODE_50__ 文件附近创建一个 __INLINE_CODE_49__ 文件，并将以下内容写入其中：

__代码块11__

> 提示 **hint** 在这个示例中，我们使用了 __INLINE_CODE_51__ 插件，但是您可以使用任何插件。

__INLINE_CODE_52__ 方法接受以下选项：

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| __INLINE_CODE_53__            | 是否监视项目的变化。                                                      |
| __INLINE_CODE_54__     | __INLINE_CODE_55__ 文件的路径。相对于当前工作目录（__INLINE_CODE_56__）。 |
| __INLINE_CODE_57__        | 元数据文件将被保存到的目录。                                   |
| __INLINE_CODE_58__         | 将用于生成元数据的访问者数组。                                   |
| __INLINE_CODE_59__         | 元数据文件的名称。默认为 __INLINE_CODE_60__。                                      |
| __INLINE_CODE_61__ | 是否将诊断信息打印到控制台。默认为 __INLINE_CODE_62__。                               |

最后，您可以在一个单独的终端窗口中运行 __INLINE_CODE_63__ 脚本，使用以下命令：

__代码块12__

#### 常见问题

如果您使用 TypeORM/MikroORM 或任何其他 ORM 在应用程序中，您可能会遇到循环依赖问题。SWC 不好地处理 **循环依赖**，因此您应该使用以下工作-around：

__代码块13__

> 提示 **hint** __INLINE_CODE_64__ 类型来自 __INLINE_CODE_65__ 包。

这样可以防止类型的属性在 transpiled 代码中被保存在属性元数据中，从而防止循环依赖问题。

如果您的 ORM 不提供类似的 workaround，您可以自己定义 wrapper 类型：

__代码块14__

对于您的所有 __LINK_83__ 项目，您还需要使用自定义 wrapper 类型，描述如下：

__代码块15__

### Jest + SWCHere is the translation of the given English technical documentation to Chinese:

使用 SWC 与 Jest 时，您需要安装以下包：

__CODE_BLOCK_16__

安装完成后，请更新 __INLINE_CODE_66__/__INLINE_CODE_67__ 文件（根据您的配置）以以下内容：

__CODE_BLOCK_17__

此外，您还需要将以下 __INLINE_CODE_68__ 属性添加到您的 __INLINE_CODE_69__ 文件中：__INLINE_CODE_70__, __INLINE_CODE_71__：

__CODE_BLOCK_18__

如果您使用 NestJS CLI 插件在项目中，您需要手动运行 __INLINE_CODE_72__。请 navigate to __LINK_84__以了解更多信息。

### Vitest

__LINK_85__ 是一个快速、轻量级的测试运行器，旨在与 Vite 一起工作。它提供了一个现代、快速和易于使用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，首先安装所需的包：

__CODE_BLOCK_19__

#### 配置

在应用程序的根目录下创建一个 __INLINE_CODE_73__ 文件，并将以下内容添加到其中：

__CODE_BLOCK_20__

这个配置文件设置了 Vitest 环境、根目录和 SWC 插件。您还需要创建一个单独的配置文件用于 e2e 测试，并添加一个额外的 __INLINE_CODE_74__ 字段来指定测试路径正则表达式：

__CODE_BLOCK_21__

此外，您可以设置 __INLINE_CODE_75__ 选项以支持 TypeScript 路径在测试中：

__CODE_BLOCK_22__

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名，如 __INLINE_CODE_76__。这可能会在测试中导致依赖项 resolution 错误。为了解决这个问题，请在您的 __INLINE_CODE_78__ 文件中添加以下配置：

__CODE_BLOCK_23__

这确保了 Vitest 正确地解析模块导入，从而避免了由于缺少依赖项而导致的错误。

#### 更新 E2E 测试

将所有 E2E 测试中的 __INLINE_CODE_79__ 进口更改为 __INLINE_CODE_80__。这在 Vitest 中是必要的，因为 Vitest，结合 Vite，期望默认导入 supertest。使用命名空间导入可能会在这个特定设置中导致问题。

最后，请更新您的 package.json 文件中的 test 脚本以以下内容：

__CODE_BLOCK_24__

这些脚本配置了 Vitest 运行测试、监视更改、生成代码覆盖报告和调试。test:e2e 脚本专门用于运行 E2E 测试，并使用一个自定义的配置文件。

现在，您可以使用 Vitest 在您的 NestJS 项目中，包括更快的测试执行和更现代的测试体验。

> info **提示** 您可以查看一个工作示例在这个 __LINK_86__ 中。