<!-- 此文件从 content/techniques/events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:05.871Z -->
<!-- 源文件: content/techniques/events.md -->

### 事件

__[LINK_51](/_) 包（__INLINE_CODE_11__）提供了一个简单的观察者实现，使您可以订阅和监听应用程序中的各种事件。事件是一个非常好的方式来解耦应用程序的不同方面，因为一个事件可以有多个监听器，而这些监听器之间没有依赖关系。

__[INLINE_CODE_12__](/_) 内部使用__[LINK_52](/_) 包。

#### 开始

首先安装所需的包：

```bash
$ npm i csrf-csrf
```

安装完成后，请将 __INLINE_CODE_13__ 导入到根 __INLINE_CODE_14__ 中，并运行 __INLINE_CODE_15__ 静态方法，如下所示：

```typescript
import { doubleCsrf } from 'csrf-csrf';
// ...
// somewhere in your initialization file
const {
  invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
```

__INLINE_CODE_16__ 调用初始化事件 emitter 并注册任何声明式事件监听器，该注册发生在 __INLINE_CODE_17__ 生命周期钩子中，以确保所有模块已经加载并声明了任何预定的作业。

要配置 underlying __INLINE_CODE_18__ 实例，请将配置对象传递给 __INLINE_CODE_19__ 方法，如下所示：

```bash
$ npm i --save @fastify/csrf-protection
```

#### 发布事件

要发布（即触发）事件，首先使用标准构造函数注入 __INLINE_CODE_20__：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);
```

> info **提示** 从 __INLINE_CODE_21__ 包中导入 __INLINE_CODE_22__。

然后，在类中使用它，如下所示：

__CODE_BLOCK_4__

#### 监听事件

要声明事件监听器，请使用 __INLINE_CODE_23__ 装饰器在方法定义之前，包含要执行的代码，如下所示：

__CODE_BLOCK_5__

> warning **警告** 事件订阅者不能是请求作用域。

第一个参数可以是 __INLINE_CODE_24__ 或 __INLINE_CODE_25__ 的简单事件 emitter 和 __INLINE_CODE_26__ 的 wildcard emitter。

第二个参数（可选）是监听选项对象，如下所示：

__CODE_BLOCK_6__

> info **提示** 了解更多关于 __INLINE_CODE_27__ 选项对象的信息，可以在 __LINK_53__ 中阅读。

__CODE_BLOCK_7__

要使用命名空间/wildcards，请将 __INLINE_CODE_29__ 选项传递给 __INLINE_CODE_30__ 方法。当启用命名空间/wildcards时，可以使用字符串（__INLINE_CODE_31__）或数组（__INLINE_CODE_32__）作为事件名称。分隔符也可以配置为配置属性（__INLINE_CODE_33__）。使用命名空间功能，您可以订阅事件使用通配符：

__CODE_BLOCK_8__

请注意，通配符仅适用于一个块。__INLINE_CODE_34__ 将匹配，例如，事件 __INLINE_CODE_35__ 和 __INLINE_CODE_36__，但不是 __INLINE_CODE_37__。要监听这些事件，请使用 __INLINE_CODE_38__ 模式（即 __INLINE_CODE_39__），如 __LINK_54__ 中所述。

使用这个模式，您可以，例如，创建一个事件监听器来捕捉所有事件。

__CODE_BLOCK_9__

> info **提示** __INLINE_CODE_41__ 类提供了许多有用的方法来与事件交互，如 __INLINE_CODE_42__ 和 __INLINE_CODE_43__。可以在 __LINK_55__ 中阅读更多信息。

#### 防止事件丢失

在 __INLINE_CODE_44__ 生命周期钩子之前或在 __INLINE_CODE_45__ 方法中触发的事件可能会被错过，因为 __INLINE_CODE_46__ 可能还没有完成设置监听器。

要解决这个问题，可以使用 __INLINE_CODE_47__ 方法，方法返回一个 promise，该 promise 在所有监听器注册完成时解决。这方法可以在模块的 __INLINE_CODE_49__ 生命周期钩子中调用，以确保所有事件都被正确捕捉。

__CODE_BLOCK_10__

> info **注意** 这只必要在事件在 __INLINE_CODE_50__ 生命周期钩子完成前被触发。

#### 示例

有一个可工作的示例 __LINK_56__。