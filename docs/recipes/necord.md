<!-- 此文件从 content/recipes/necord.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:33:15.163Z -->
<!-- 源文件: content/recipes/necord.md -->

### Necord

Necord 是一款功能强大的模块，能够简化创建 __LINK_30__ 机器人的过程，实现与 NestJS 应用程序的无缝集成。

> info **注意** Necord 是第三方包，不是 NestJS 核心团队官方维护。如果您遇到任何问题，请在 __LINK_31__ 中报告。

#### 安装

要开始使用 Necord，需要安装 Necord 和其依赖项 __LINK_32__。

```typescript
@Module({
  imports: [
    DashboardModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}

```

#### 使用

要在项目中使用 Necord，需要导入 __INLINE_CODE_16__ 并配置必要的选项。

```typescript
@Module({
  imports: [
    AdminModule,
    DashboardModule,
    MetricsModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'dashboard',
            module: DashboardModule,
          },
          {
            path: 'metrics',
            module: MetricsModule,
          },
        ],
      },
    ])
  ],
});

```

> info **提示** 您可以在 __LINK_33__ 中找到可用的意图列表。

使用这个设置，您可以将 __INLINE_CODE_17__ 注入到提供商中，以便轻松注册命令、事件等。

__CODE_BLOCK_2__

##### 理解上下文

您可能已经注意到了 __INLINE_CODE_18__ 装饰器在示例中。这个装饰器将事件上下文注入到方法中，使您可以访问各种事件特定的数据。由于有多种类型的事件，上下文类型将使用 __INLINE_CODE_19__ 类型推断。您可以使用 __INLINE_CODE_20__ 装饰器轻松访问上下文变量，该装饰器将变量填充为与事件相关的参数数组。

#### 文本命令

> warning **注意** 文本命令依赖于消息内容，该内容将在已验证的机器人和拥有超过 100 服务器的应用程序中被弃用。这意味着，如果您的机器人无法访问消息内容，文本命令将无法工作。了解更多关于该更改的信息 __LINK_34__。

下面是使用 __INLINE_CODE_21__ 装饰器创建简单命令处理程序的示例。

__CODE_BLOCK_3__

#### 应用程序命令

应用程序命令提供了一个native的方式，让用户在 Discord 客户端中与您的应用程序交互。有三个类型的应用程序命令可以通过不同的接口访问：聊天输入、消息上下文菜单（通过右键单击消息访问）和用户上下文菜单（通过右键单击用户访问）。

__HTML_TAG_27____HTML_TAG_28____HTML_TAG_29__

#### 切换命令

切换命令是一种engaging的方式，让用户在结构化的方式与您的机器人交互。它们允许您创建带有精准参数和选项的命令，提高用户体验。

要使用 Necord 定义切换命令，可以使用 __INLINE_CODE_22__ 装饰器。

__CODE_BLOCK_4__

> info **提示** 当您的机器人客户端登录时，它将自动注册所有定义的命令。请注意，全球命令将被缓存 1 小时。如果您想避免全球缓存问题，请使用 __INLINE_CODE_23__ 参数在 Necord 模块中，限制命令可见性到单个服务器。

##### 选项

您可以使用选项装饰器为您的切换命令定义参数。让我们创建一个 __INLINE_CODE_24__ 类以此目的：

__CODE_BLOCK_5__

然后，您可以在 __INLINE_CODE_25__ 类中使用该 DTO：

__CODE_BLOCK_6__

要查看可用的内置选项装饰器，请访问 __LINK_35__。

##### 自动完成

要实现自动完成功能，您需要创建一个拦截器。该拦截器将处理用户输入的自动完成请求。

__CODE_BLOCK_7__

您还需要将 options 类标记为 __INLINE_CODE_26__：

__CODE_BLOCK_8__

最后，应用拦截器到您的切换命令：

__CODE_BLOCK_9__

#### 用户上下文菜单

用户命令出现在右键单击用户时的上下文菜单中，这些命令提供了快速操作，目标用户本身。

__CODE_BLOCK_10__

#### 消息上下文菜单

消息命令出现在右键单击消息时的上下文菜单中，这些命令提供了快速操作，相关于这些消息。

__CODE_BLOCK_11__

#### 按钮

__LINK_36__ 是交互元素，可以包含在消息中。当点击时，它将发送 __LINK_37__ 到您的应用程序。

__CODE_BLOCK_12__

#### 选择菜单

__LINK_38__ 是另一种交互组件，出现在消息中，提供了下拉式 UI，让用户选择选项。

__CODE_BLOCK_13__

要查看可用的内置选择菜单组件，请访问 __LINK_39__。

#### 模态

模态是弹出窗口，允许用户提交格式化的输入。下面是使用 Necord 创建和处理模态的示例：

__CODE_BLOCK_14__

#### 更多信息

请访问 __LINK_40__ 网站获取更多信息。