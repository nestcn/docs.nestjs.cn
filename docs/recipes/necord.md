<!-- 此文件从 content/recipes/necord.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:01:39.009Z -->
<!-- 源文件: content/recipes/necord.md -->

### Necord

Necord 是一项功能强大且简化了创建 __LINK_30__ 机器人的模块，让您可以轻松地将其集成到 NestJS 应用程序中。

> 信息 **注意** Necord 是第三方包，且不由 NestJS 核心团队官方维护。如果您遇到任何问题，请在 __LINK_31__ 中报告。

#### 安装

要开始使用 Necord，需要安装 Necord 和其依赖项 __LINK_32__。

```bash
$ npm install --save @nestjs/serve-static

```

#### 使用

要在项目中使用 Necord，需要导入 __INLINE_CODE_16__ 并将其配置为必要选项。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

> 信息 **提示** 您可以在 __LINK_33__ 中找到可用的意图列表。

使用该设置，您可以将 __INLINE_CODE_17__ 注入到 Provider 中，以便轻松地注册命令、事件等。

__CODE_BLOCK_2__

##### 理解上下文

您可能已经注意到了 __INLINE_CODE_18__ 装饰器在上面的示例中。这 decorator 将事件上下文注入到您的方法中，使您可以访问各种事件特定的数据。由于有多种类型的事件，上下文类型将使用 __INLINE_CODE_19__ 类型进行推断。您可以使用 __INLINE_CODE_20__ 装饰器轻松地访问上下文变量，该装饰器将变量填充为与事件相关的参数数组。

#### 文本命令

> 警告 **注意** 文本命令依赖于消息内容，这对于已验证的机器人和拥有超过 100 服务器的应用程序将被弃用。这意味着，如果您的机器人无法访问消息内容，那么文本命令将无法工作。了解更多关于这项改变的信息 __LINK_34__。

以下是在使用 __INLINE_CODE_21__ 装饰器创建简单命令处理程序的示例：

__CODE_BLOCK_3__

#### 应用程序命令

应用程序命令提供了 Native 的方式，让用户可以在 Discord 客户端中与您的应用程序交互。有三种类型的应用程序命令可以通过不同的界面访问：聊天输入、消息上下文菜单（通过右键单击消息访问）和用户上下文菜单（通过右键单击用户访问）。

__HTML_TAG_27____HTML_TAG_28____HTML_TAG_29__

#### 列表命令

列表命令是一种优雅的方式，让您可以与用户交互。它们允许您创建带有精确定义参数和选项的命令，提高用户体验。

要使用 Necord 定义列表命令，可以使用 __INLINE_CODE_22__ 装饰器。

__CODE_BLOCK_4__

> 信息 **提示** 当您的机器人客户端登录时，它将自动注册所有定义的命令。请注意，全球命令将被缓存在一个小时内。为了避免全球缓存问题，请使用 Necord 模块的 __INLINE_CODE_23__ 参数，该参数将限制命令可见性到单个服务器。

##### 选项

您可以使用选项装饰器来定义您的列表命令的参数。让我们创建一个 __INLINE_CODE_24__ 类以便进行此操作：

__CODE_BLOCK_5__

然后，您可以使用该 DTO 在 __INLINE_CODE_25__ 类中：

__CODE_BLOCK_6__

对于完整的内置选项装饰器列表，请访问 __LINK_35__。

##### 自动完成

要实现自动完成功能，您需要创建一个拦截器。这拦截器将处理在自动完成字段中用户输入的请求。

__CODE_BLOCK_7__

您还需要将 Options 类标记为 __INLINE_CODE_26__：

__CODE_BLOCK_8__

最后，应用拦截器到您的列表命令：

__CODE_BLOCK_9__

#### 用户上下文菜单

用户命令出现在右键单击用户时的上下文菜单中，这些命令提供了快速操作，直接目标用户。

__CODE_BLOCK_10__

#### 消息上下文菜单

消息命令出现在右键单击消息时的上下文菜单中，这些命令提供了快速操作，相关于这些消息。

__CODE_BLOCK_11__

#### 按钮

__LINK_36__ 是交互元素，可以包含在消息中。当单击时，它将发送 __LINK_37__ 到您的应用程序。

__CODE_BLOCK_12__

#### 选择菜单

__LINK_38__ 是另一种交互组件，可以出现在消息中。它们提供了下拉式 UI，让用户可以选择选项。

__CODE_BLOCK_13__

对于完整的内置选择菜单组件列表，请访问 __LINK_39__。

#### 模态

模态是弹出窗口，可以让用户提交格式化输入。以下是使用 Necord 创建和处理模态的示例：

__CODE_BLOCK_14__

#### 更多信息

请访问 __LINK_40__ 网站以获取更多信息。