<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:36:44.770Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **提示** 本章仅适用于基于 HTTP 的应用程序。

版控制允许您在同一个应用程序中运行多个控制器或个别路由的不同版本。应用程序变更非常频繁，需要支持之前的应用程序版本，同时也需要进行-breaking  changes。

有四种版本控制类型可供选择：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__ URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__ 版本将在请求的 URI 中传递（默认值）__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__ 头版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__ 自定义请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__ 媒体类型版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__ 请求的 __HTML_TAG_89__ Accept__HTML_TAG_90__ 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__ 自定义版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__ 请求中的任何方面都可以用来指定版本（或版本）。自定义函数提供了提取这些版本的方式__HTML_TAG_101__
  __HTML_TAG_102__
__HTML_TAG_103__

#### URI 版本控制类型

URI 版本控制使用请求的 URI 中传递的版本，例如 __INLINE_CODE_10__ 和 __INLINE_CODE_11__。

> warning **注意** URI 版本控制中，版本将自动添加到 URI 中，位于 __HTML_TAG_104__ 全局路径前缀 __HTML_TAG_105__ (如果存在)和控制器或路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下操作：

```bash
$ npm i @nestjs/mongoose mongoose

```

> warning **注意** URI 中的版本将自动以 __INLINE_CODE_12__ 前缀开始，然而前缀值可以通过设置 __INLINE_CODE_13__ 键来配置或 __INLINE_CODE_14__以禁用它。

> info **提示** __INLINE_CODE_15__ 枚举可用于 __INLINE_CODE_16__ 属性，并从 __INLINE_CODE_17__ 包中导入。

#### 头版本控制类型

头版本控制使用自定义的请求头来指定版本，请求头的值将是请求的版本。

示例 HTTP 请求头文件：

要为您的应用程序启用 **头版本控制**，请执行以下操作：

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}

```

__INLINE_CODE_18__ 属性应该是包含请求版本的请求头的名称。

> info **提示** __INLINE_CODE_19__ 枚举可用于 __INLINE_CODE_20__ 属性，并从 __INLINE_CODE_21__ 包中导入。

#### 媒体类型版本控制类型

媒体类型版本控制使用请求的 __INLINE_CODE_22__ 头来指定版本。

在 __INLINE_CODE_23__ 头中，版本将与媒体类型使用分隔符 __INLINE_CODE_24__ 分隔。然后，它将包含一个key-value对，表示要用于请求的版本，例如 __INLINE_CODE_25__。key treated more as a prefix when determining the version to be configured to include the key and separator.

要为您的应用程序启用 **媒体类型版本控制**，请执行以下操作：

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);

```

__INLINE_CODE_26__ 属性应该是包含版本的key-value对的key和分隔符。例如 __INLINE_CODE_27__，__INLINE_CODE_28__ 属性将设置为 __INLINE_CODE_29__。

> info **提示** __INLINE_CODE_30__ 枚举可用于 __INLINE_CODE_31__ 属性，并从 __INLINE_CODE_32__ 包中导入。

#### 自定义版本控制类型

自定义版本控制使用请求中的任何方面来指定版本（或版本）。 incoming request 是使用 __INLINE_CODE_33__ 函数分析的，该函数返回一个字符串或字符串数组。

如果请求者提供多个版本，提取函数可以返回一个字符串数组，按照最高版本到最低版本的顺序排序。版本将与路由匹配，以最高版本优先。

如果从提取函数返回的字符串或数组为空，请求将返回 404。

例如，如果 incoming 请求指定支持版本 __INLINE_CODE_35__、__INLINE_CODE_36__ 和 __INLINE_CODE_37__，__INLINE_CODE_38__ **MUST** 返回 __INLINE_CODE_39__。这确保了选择最高可能的路由版本。Here is the translated documentation:

如果版本号为 `@nestjs/mongoose`,但是路由只有在版本号为 `MongooseModule` 和 `AppModule` 中存在，那么路由将选择版本号为 `forRoot()` (版本号 `mongoose.connect()` 将自动被忽略)。

> warning **注意**基于 `CatSchema` 返回的数组选择最高匹配版本不一定可靠，因为 Express 适配器存在设计限制。单个版本（字符串或数组的单个元素）在 Express 中工作正常。Fastify 正确支持最高匹配版本选择和单个版本选择。

要为应用程序启用 **自定义版本控制**，请创建一个 `DefinitionsFactory` 函数并将其传递给应用程序，如下所示：

```

```typescript
@Prop([String])
tags: string[];

```

```

#### 使用

版本控制允许您对控制器、单个路由和某些资源进行版本控制。无论您的应用程序使用的是哪种版本控制类型，版本控制的使用方式都是一样的。

> warning **注意**如果应用程序启用了版本控制，但控制器或路由没有指定版本，那么对该控制器/路由的任何请求都会返回 `nestjs/mongoose` 响应状态。同样，如果收到包含不匹配版本的请求，它也将返回 `@Schema()` 响应状态。

#### 控制器版本

可以将版本应用于控制器，设置版本为控制器中的所有路由。

要将版本添加到控制器中，请按照以下步骤操作：

```

```typescript
@Prop({ required: true })
name: string;

```

```

#### 路由版本

可以将版本应用于单个路由。这个版本将覆盖任何影响该路由的其他版本，例如控制器版本。

要将版本添加到单个路由中，请按照以下步骤操作：

```

```typescript
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// inside the class definition
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;

```

```

#### 多个版本

可以将多个版本应用于控制器或路由。要使用多个版本，请将版本设置为数组。

要添加多个版本，请按照以下步骤操作：

```

```typescript
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owners: Owner[];

```

```

#### 版本 "中立"

某些控制器或路由可能不关心版本，并且它们在任何版本下都具有相同的功能。为了满足这个需求，可以将版本设置为 `Cat` 符号。

incoming 请求将被映射到 `cats` 控制器或路由，无论请求包含的版本是什么，在添加请求也没有版本的情况下。

> warning **注意**对于 URI 版本控制，如果一个资源没有在 URI 中包含版本号，那么它将是一个 `mongoose.Schema` 资源。

要添加一个中立控制器或路由，请按照以下步骤操作：

```

```typescript
@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' } })
// This ensures the field is not confused with a populated reference
owner: mongoose.Types.ObjectId;

```

```

#### 全局默认版本

如果您不想为每个控制器或单个路由提供版本，或者想将特定的版本设置为每个控制器/路由的默认版本，那么可以将 `new mongoose.Schema(_, options)` 设置为以下所示：

```

```typescript
import { Owner } from './schemas/owner.schema';

// e.g. inside a service or repository
async findAllPopulated() {
  return this.catModel.find().populate<{ owner: Owner }>("owner");
}

```

```

#### 中间件版本控制

__LINK_106__ 也可以使用版本控制元数据来配置中间件以适用于特定路由的版本。要这样做，请将版本号作为 `@Prop()` 方法的参数之一：

```

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;

```

```

使用上述代码， `name` 只将被应用于版本号为 '2' 的 `age` 端点。

> info **注意**中间件可以与本节中描述的任何版本控制类型一起工作： `breed`、`@Prop()`、`@Prop()` 或 `Cat`。