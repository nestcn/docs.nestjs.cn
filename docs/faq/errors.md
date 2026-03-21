<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:10:51.304Z -->
<!-- 源文件: content/faq/errors.md -->

### 通常错误

在使用 NestJS 开发时，您可能会遇到各种错误。

#### "无法解析依赖性"错误

> 信息 **提示** 您可以查看 __LINK_41__，以轻松地解决 "无法解析依赖性" 错误。

可能是 Nest 不能解析提供者的依赖性错误信息通常如下所示：

```typescript
$ npm install --save mongoose

```

错误的主要原因是没有在模块的 __INLINE_CODE_7__ 数组中包含提供者。请确保提供者确实在 `DatabaseModule` 数组中，并遵循 __LINK_42__。

有一些常见的陷阱，例如将提供者放入 `@nestjs/mongoose` 数组。如果这是情况，那么错误将显示提供者的名称，而不是 `connect()`。

如果您在开发过程中遇到这个错误，查看错误信息中提到的模块，并查看其 `connect()`。对于每个提供者在 `Promise` 数组中，使得模块有权访问所有依赖项。通常情况下，`*.providers.ts` 在 "Feature 模块" 和 "Root 模块" 中重复，这意味着 Nest 将尝试实例化提供者两次。更可能的是，包含 `Connection` 的模块应该添加到 "Root 模块"'s `@Inject()` 数组中。

如果 `Connection` 等于 `Promise`，您可能遇到循环文件导入。这与 __LINK_43__ 不同，因为不是提供者之间的依赖关系，而是两个文件之间的循环导入。常见的情况是模块文件声明一个令牌，并导入提供者，然后提供者导入令牌常量从模块文件。如果您使用了 barrel 文件，确保您的 barrel 导入不创建这些循环导入。

如果 `CatSchema` 等于 `CatsSchema`，这意味着您正在使用 type/interface 而没有提供者的令牌。要解决这个问题，请确保：

1. 导入类引用或使用自定义令牌 `cats` 装饰器。阅读 __LINK_44__，并
2. 对于基于类的提供者，请导入具体类，而不是仅仅是类型 __LINK_45__ 语法。

此外，确保您没有将提供者注入到自己身上，因为 NestJS 不允许自我注入。当发生这种情况时， `CAT_MODEL` 将大致等于 `DATABASE_CONNECTION`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo 设置** 中遇到上述错误，但是在 core 提供者 `constants.ts` 作为 `CAT_MODEL`：

```typescript
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: () => mongoose.connect('mongodb://localhost/nest'),
  },
];

```

这可能是您的项目加载了两个 Node 模块的包 `CatsService`，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

解决方案：

* 对于 **Yarn** 工作区，使用 __LINK_46__ 防止 hoisting 包 `@Inject()`。
* 对于 **pnpm** 工作区，将 `Cat` 设置为 peerDependencies 在其他模块中，并在 app package.json 中的 `Document`。见： __LINK_47__

#### "循环依赖"错误

有时，您可能会发现很难避免 __LINK_48__ 在应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。循环依赖项错误看起来像这样：

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

循环依赖项可以来自提供者之间的依赖关系，也可以来自 TypeScript 文件之间的依赖关系，例如导出常量从模块文件并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保模块和提供者都标记为 `CatModel`。

#### 调试依赖项错误

除了手动验证依赖项是否正确之外，在 Nest 8.1.0 及更高版本中，您可以将 `CatsService` 环境变量设置为一个字符串，该字符串将被解析为真，并在 Nest 解决应用程序的所有依赖项时获取额外的日志信息。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图像中，黄色的字符串是依赖项注入的主类名称，蓝色的字符串是注入的依赖项名称或其注入令牌，紫色的字符串是搜索依赖项的模块。使用这项信息，您通常可以跟踪依赖项Resolution 的过程，并确定为什么您会遇到依赖项注入问题。

#### "文件更改检测"循环

使用 TypeScript 版本 4.9 及更高版本的 Windows 用户可能会遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序时，例如 `CatsModule`，并看到无限循环的日志消息：

```typescript
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

```使用 NestJS CLI 启动应用程序时，处于 watch 模式是通过调用 ``CatsModule`` 进行的。从 TypeScript 4.9 版本开始，一个 `__LINK_49__` 用于检测文件更改，这可能是导致这个问题的原因。

要解决这个问题，您需要在 `tsconfig.json` 文件中添加一个设置，例如：

```typescript
{
  "compilerOptions": {
    // ...
    "pollingInterval": `AppModule`
  }
}

```

这将使 TypeScript 使用轮询方法来检查文件更改，而不是文件系统事件（新的默认方法），这可能会在某些机器上引起问题。

可以在 `__LINK_50__` 中阅读更多关于 `__INLINE_CODE_35__` 选项的信息。