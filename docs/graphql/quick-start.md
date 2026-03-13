<!-- 此文件从 content/graphql/quick-start.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:49:31.345Z -->
<!-- 源文件: content/graphql/quick-start.md -->

## TypeScript 和 GraphQL 的结合

__LINK_113__ 是一種強大的查詢語言，專門為 API 和查詢 runtime 提供。它是一種優雅的方法，解決了 REST API 通常遇到的問題。為背景，建議閱讀__LINK_114__，了解 GraphQL 和 REST 之間的關聯。使用 GraphQL 和 __LINK_115__ 可以幫助您開發更好的類型安全性，以便於您的 GraphQL 查詢，從頭到尾都具有類型安全性。

在本章中，我們假設對 GraphQL 的基本了解，並專注於使用內置的 __INLINE_CODE_25__ 模組。您可以根據需要配置 __INLINE_CODE_26__ 服务器（使用 __INLINE_CODE_27__ 驱動器）和 __LINK_117__（使用 __INLINE_CODE_28__）。我們提供了官方集成，這些集成已經準備好了，以便簡化使用 GraphQL 和 Nest 的過程（更多集成信息請查看__LINK_118__）。

您也可以建立自己的定制驅動器（了解更多信息請查看__LINK_119__）。

#### 安裝

首先，安裝所需的包：

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;

```

> 警告 **注意** __INLINE_CODE_29__ 和 __INLINE_CODE_30__ 包是相容的 **Apollo v3**（了解更多信息請查看 Apollo Server 3 __LINK_120__），而 __INLINE_CODE_31__ 只支持 **Apollo v2**（例如 __INLINE_CODE_32__ 包）。

#### 概述

Nest 提供了兩種方式來構建 GraphQL 應用：code first 和 schema first 方法。您應該選擇適合您的方法。本節中大多數章節都分為兩個主要部分：一部分適用于 code first，另一部分適用于 schema first。

在 code first 方法中，您使用裝飾器和 TypeScript 類別生成相應的 GraphQL schema。這種方法對於那些喜歡使用 TypeScript 和避免在語法之間切換的人非常有用。

在 schema first 方法中，schema 的來源是 GraphQL SDL（Schema Definition Language）文件。SDL 是一個語言中立的方法，用于分享 schema 文件之間。Nest 自動根據 GraphQL schema 生成您的 TypeScript 定義（使用類別或介面），以減少重複的代碼。

__HTML_TAG_106____HTML_TAG_107__

#### 使用 GraphQL & TypeScript

> 提示 **提示** 在接下來的章節中，我們將整合 __INLINE_CODE_33__ 包。如果您想使用 __INLINE_CODE_34__ 包，請查看 __LINK_121__。

安装完成後，我們可以導入 __INLINE_CODE_35__ 并配置它使用 __INLINE_CODE_36__靜態方法。

```typescript
export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const { extensions } = info.parentType.getFields()[info.fieldName];

  /**
   * In a real-world application, the "userRole" variable
   * should represent the caller's (user) role (for example, "ctx.user.role").
   */
  const userRole = Role.USER;
  if (userRole === extensions.role) {
    // or just "return null" to ignore
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};

```

> 提示 **提示** 對於 __INLINE_CODE_37__ 整合，您應該使用 __INLINE_CODE_38__ 和 __INLINE_CODE_39__。這兩個都是從 __INLINE_CODE_40__ 包中导出的。

__INLINE_CODE_41__ 方法接受一個選項對象作為參數。這些選項將被傳遞給底層驅動器實例（了解更多信息請查看__LINK_122__ 和 __LINK_123__）。例如，如果您想要禁用 __INLINE_CODE_42__ 和關閉 __INLINE_CODE_43__ 模式（對於 Apollo），請將以下選項傳遞：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;

```

在這種情況下，這些選項將被傳遞給 __INLINE_CODE_44__ 建構函數。

#### GraphQL playground

playground 是一個圖形化、交互式的、在浏览器中的 GraphQL IDE，預設在 GraphQL 服务器本身的同一個 URL 中。要訪問 playground，需要基本的 GraphQL 服务器配置和運行。要立即查看它，可以安裝和構建 __LINK_124__。 Alternatively, 如果您正在遵循這些代碼樣本，您可以在完成步驟 __LINK_125__後訪問 playground。

當您完成這些步驟後，您可以在您的網頁浏览器中開啟，並導航到 __INLINE_CODE_45__（主機和埠可能取決於您的配置）。您將看到 GraphQL playground，像下面所示。

__HTML_TAG_108__
  __HTML_TAG_109__
__HTML_TAG_110__

> 提示 **注意** __INLINE_CODE_46__ 整合不包含內置的 GraphQL Playground 整合。相反，您可以使用 __LINK_126__，並將 __INLINE_CODE_47__ 設置。

> 警告 **注意** 更新（2025-04-14）：預設的 Apollo playground 已經棄用，並將在下一個主要版本中刪除。相反，您可以使用 __LINK_127__，只需在 __INLINE_CODE_49__ 設置 __INLINE_CODE_48__，如下所示：
>
> __CODE_BLOCK_3__
>
> 如果您的應用程序使用 __LINK_128__，請確保使用 __INLINE_CODE_50__，因為 __INLINE_CODE_51__ 不受 GraphiQL 支持。

#### code first

在 code first 方法中，您使用裝飾器和 TypeScript 類別生成相應的 GraphQL schema。

要使用 code first 方法，請首先將 __INLINE_CODE_52__ 屬性添加到選項對象中：

__CODEHere is the translation of the provided English technical documentation to Chinese:

**INLINE_CODE_53** 属性值是自动生成架构的路径。或者，可以在内存中实时生成架构。要启用此功能，请将 **INLINE_CODE_54** 属性设置为 **INLINE_CODE_55**：

**CODE_BLOCK_5**

在默认情况下，生成架构中的类型将按它们在包含模块中的顺序排序。要按字母顺序排序架构，请将 **INLINE_CODE_56** 属性设置为 **INLINE_CODE_57**：

**CODE_BLOCK_6**

#### 示例

有一个完全工作的代码优先样本可在 __LINK_129__ 获得。

#### 架构优先

要使用架构优先方法，首先添加一个 **INLINE_CODE_58** 属性到选项对象中。 **INLINE_CODE_59** 属性指示了 __INLINE_CODE_60__ 应该在哪里寻找 GraphQL SDL 架构定义文件。这些文件将在内存中组合；这允许将架构分割成多个文件，并将它们置于 resolver 附近。

**CODE_BLOCK_7**

通常情况下，您还需要拥有 TypeScript 定义（类和接口），这些定义对应于 GraphQL SDL 类型。手动创建 TypeScript 定义是一个重复和繁琐的过程。它使我们没有单个真实来源——每个 SDL 变更都需要调整 TypeScript 定义。为了解决这个问题，__INLINE_CODE_61__ 包可以 **自动生成** TypeScript 定义从抽象语法树（__LINK_130__）。要启用此功能，请在配置 __INLINE_CODE_63__ 时添加 **INLINE_CODE_62** 选项。

**CODE_BLOCK_8**

**INLINE_CODE_64** 对象的路径属性指示了生成 TypeScript 输出的路径。默认情况下，所有生成的 TypeScript 类型都是接口。要生成类别别，指定 **INLINE_CODE_65** 属性并将其设置为 **INLINE_CODE_66**。

**CODE_BLOCK_9**

上述方法动态生成 TypeScript 定义每次应用程序启动时。或者，也可能更好地使用简单脚本来生成这些内容。例如，我们可以创建以下脚本作为 **INLINE_CODE_67**：

**CODE_BLOCK_10**

现在，您可以在 demand 下运行该脚本：

**CODE_BLOCK_11**

> 信息 **提示** 您可以在 advance 之前编译脚本（例如，使用 __INLINE_CODE_68__）并使用 __INLINE_CODE_69__ 执行它。

要启用 watch 模式来监视脚本（自动生成类型时器每当 __INLINE_CODE_70__ 文件更改），将 __INLINE_CODE_71__ 选项传递给 __INLINE_CODE_72__ 方法。

**CODE_BLOCK_12**

要自动生成每个对象类型的额外 __INLINE_CODE_73__ 字段，请启用 __INLINE_CODE_74__ 选项：

**CODE_BLOCK_13**

要生成 resolver（查询、mutation、subscription）作为 plain 字段而不是带有参数的字段，请启用 __INLINE_CODE_75__ 选项：

**CODE_BLOCK_14**

要生成枚举类型为 TypeScript 联合类型而不是常规 TypeScript 枚举，请将 __INLINE_CODE_76__ 选项设置为 __INLINE_CODE_77__：

**CODE_BLOCK_15**

#### Apollo Sandbox

要使用 __LINK_131__ 作为 GraphQL IDE 而不是 __INLINE_CODE_78__，使用以下配置：

**CODE_BLOCK_16**

#### 示例

有一个完全工作的架构优先样本可在 __LINK_132__ 获得。

#### 获取生成架构

在某些情况下（例如 end-to-end 测试），您可能想要获取生成架构对象。在 end-to-end 测试中，您可以使用 __INLINE_CODE_79__ 对象运行查询，而不使用任何 HTTP监听器。

您可以访问生成架构（在代码优先或架构优先方法中），使用 __INLINE_CODE_80__ 类：

**CODE_BLOCK_17**

> 信息 **提示** 您必须在应用程序初始化后（在 __INLINE_CODE_82__ 钩子函数被 __INLINE_CODE_83__ 或 __INLINE_CODE_84__ 方法触发后）调用 __INLINE_CODE_81__ getter。

#### 异步配置

当您需要异步配置模块选项时，可以使用 __INLINE_CODE_85__ 方法。与大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

**CODE_BLOCK_18**

像其他工厂提供者一样，我们的工厂函数可以是 __HTML_TAG_111__async__HTML_TAG_112__并可以通过 __INLINE_CODE_86__ 注入依赖项。

**CODE_BLOCK_19**

或者，您可以使用类来配置 __INLINE_CODE_87__，如以下所示：

**CODE_BLOCK_20**

构造上述示例中，__INLINE_CODE_88__ 内部实例化 __INLINE_CODE_89__，使用它创建选项对象。注意，在这个示例中，__INLINE_CODE_90__ 必须实现 __INLINE_CODE_91__ 接口，如以下所示。__INLINE_CODE_92__ 将在实例化对象时调用 __INLINE_CODE_93__ 方法。

**CODE_BLOCK_21**如果您想重新使用现有的选项提供者，而不是在__INLINE_CODE_94__中创建私有副本，可以使用__INLINE_CODE_95__语法。

**Mercurius 集成**

Fastify 用户（了解更多 __LINK_133__）可以使用 __INLINE_CODE_96__ 驱动器作为替代 Apollo。

**代码块 22**

> info **提示** 一旦应用程序运行，您可以在浏览器中导航到 __INLINE_CODE_97__，然后查看 __LINK_134__。

__INLINE_CODE_98__ 方法接受一个选项对象作为参数，这些选项将被传递给 underlying 驱动器实例。了解更多关于可用设置的信息 __LINK_135__。

#### 多个端点

__INLINE_CODE_99__ 模块的另一个有用特性是可以同时服务多个端点。这让您可以确定哪些模块应该在哪个端点中。默认情况下，__INLINE_CODE_100__ 会在整个应用程序中搜索解析器。要将扫描限制到仅 subsets 的模块，请使用 __INLINE_CODE_101__ 属性。

**代码块 23**

> warning **警告** 如果您使用 __INLINE_CODE_102__ 和 __INLINE_CODE_103__ 包含多个 GraphQL 端点在同一个应用程序中，请确保在 __INLINE_CODE_105__ 配置中启用 __INLINE_CODE_104__ 设置。

#### 第三方集成

- __LINK_136__

#### 示例

可用的工作示例 __LINK_137__。