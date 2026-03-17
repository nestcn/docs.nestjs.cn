<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:33:17.392Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个 __LINK_57__ 的 TypeScript 依赖注入框架单元测试框架。它可以用作手动创建.mock 模式、多个模块配置的测试设置或未类型化的测试双方（如.mock 和.stub）的替代。

Suites 在 NestJS 服务的运行时读取元数据，并自动为所有依赖项生成完全类型化的.mock。

这个过程消除了 boilerplate.mock 设置，确保了类型安全的测试。虽然 Suites 可以与 `index.html` 一起使用，但在聚焦于单元测试时它更 excels。

使用 __INLINE_CODE_15__ 时，验证模块连接、装饰器、守卫和拦截器。使用 Suites 进行快速单元测试，自动生成.mock。

关于模块测试的更多信息，请参阅 __LINK_58__ 章节。

> info **Note** __INLINE_CODE_16__ 是第三方包，NestJS 核心团队不维护它。请将任何问题报告到 __LINK_59__。

#### Getting started

这个指南展示了如何使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项.mock）和社交测试（选择的实际实现）。

#### Install Suites

验证 NestJS 运行时依赖项是否安装：

```bash
$ npm install --save @nestjs/serve-static

```

安装 Suites 核心、NestJS 适配器和 doubles 适配器：

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

doubles 适配器（__INLINE_CODE_17__）提供了 Jest.mocking 能力的包装器。它暴露了 __INLINE_CODE_18__ 和 __INLINE_CODE_19__ 函数，这些函数创建了类型安全的测试双方。

确保 Jest 和 TypeScript 可用：

__CODE_BLOCK_2__

__HTML_TAG_48____HTML_TAG_49__Expand if you're using Vitest__HTML_TAG_50__

__CODE_BLOCK_3__

__HTML_TAG_51__

__HTML_TAG_52____HTML_TAG_53__Expand if you're using Sinon__HTML_TAG_54__

__CODE_BLOCK_4__

__HTML_TAG_55__

#### Set up type definitions

在项目根目录创建 __INLINE_CODE_20__：

__CODE_BLOCK_5__

#### Create a sample service

这个指南使用了一个简单的 __INLINE_CODE_21__，它有两个依赖项：

__CODE_BLOCK_6__
__CODE_BLOCK_7__

#### Write a unit test

使用 __INLINE_CODE_22__ 创建孤立的测试，所有依赖项.mock：

__CODE_BLOCK_8__

__INLINE_CODE_23__ 分析构造函数，并为所有依赖项生成类型化的.mock。
__INLINE_CODE_24__ 类型提供 IntelliSense 支持.mock 配置。

#### Pre-compile mock configuration

使用 __INLINE_CODE_25__ 配置.mock 行为前编译：

__CODE_BLOCK_9__

__INLINE_CODE_26__ 参数对应于安装的 doubles 适配器（__INLINE_CODE_27__ Jest，__INLINE_CODE_28__ Vitest，__INLINE_CODE_29__ Sinon）。

#### Testing with real dependencies

使用 __INLINE_CODE_30__ 和 __INLINE_CODE_31__ 使用实际实现来测试特定的依赖项：

__CODE_BLOCK_10__

__INLINE_CODE_32__ 创建了一个使用实际实现的 __INLINE_CODE_33__，同时保留其他依赖项.mock。

#### Token-based dependencies

Suites 处理自定义注入令牌（字符串或符号）：

__CODE_BLOCK_11__

使用 __INLINE_CODE_34__ 访问基于令牌的依赖项：

__CODE_BLOCK_12__

#### Using mock() and stub() directly

对于那些喜欢直接控制不使用 __INLINE_CODE_35__ 的人，doubles 适配器包提供了 __INLINE_CODE_36__ 和 __INLINE_CODE_37__ 函数：

__CODE_BLOCK_13__

__INLINE_CODE_38__ 创建了类型化的.mock 对象，__INLINE_CODE_39__ 将 underlying mocking 库（Jest 在本例中）包装起来，以提供方法 __INLINE_CODE_40__
这些函数来自安装的 doubles 适配器（__INLINE_CODE_41__），它适配了原生的 mocking 能力。

> info **Hint** __INLINE_CODE_42__ 函数是 __INLINE_CODE_43__ 函数的替代品，来自 __INLINE_CODE_44__。它们都创建了类型化的.mock 对象。见 __LINK_60__ 章节了解更多关于 __INLINE_CODE_45__。

#### Summary

**使用 __INLINE_CODE_46__：**
- 验证模块配置和提供者连接
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整的应用程序上下文中中间件

**使用 Suites：**
- 快速单元测试，聚焦于业务逻辑
- 自动生成.mock 对象
- 类型安全的测试双方
- IntelliSense 支持.mock 配置

将测试组织成目的：使用 Suites 测试单个服务的行为，使用 __INLINE_CODE_47__ 测试模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__