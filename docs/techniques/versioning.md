<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:15:15.012Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **提示** 本章仅适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中运行多个版本的控制器或单个路由。应用程序变化很频繁，并且不太常见的情况下需要支持之前的应用程序版本。

支持 4 种类型的版本控制：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__版本将在请求的 URI 中传递（默认）__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__头版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__自定义请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__媒体类型版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__请求的 __HTML_TAG_89__Accept__HTML_TAG_90__ 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__自定义版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__请求中的任何方面都可以用来指定版本（或版本）。提供了一个自定义函数来提取这些版本__HTML_TAG_101__
  __HTML_TAG_102__
__HTML_TAG_103__

#### URI 版本控制类型

URI 版本控制使用请求的 URI 中传递的版本，例如 __INLINE_CODE_10__ 和 __INLINE_CODE_11__。

> warning **注意** 在 URI 版本控制中，版本将自动添加到 URI 中，位于 __HTML_TAG_104__全局路径前缀__HTML_TAG_105__ (如果存在)和控制器或路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下操作：

```bash
$ npm i @nestjs/mongoose mongoose

```

> warning **注意** URI 中的版本将自动添加 __INLINE_CODE_12__ 前缀，然而前缀值可以通过设置 __INLINE_CODE_13__ 键来配置或 __INLINE_CODE_14__ 如果您想禁用它。

> info **提示** __INLINE_CODE_15__ 枚举可用于 __INLINE_CODE_16__ 属性，并从 __INLINE_CODE_17__ 包中导入。

#### 头版本控制类型

头版本控制使用自定义的、用户指定的请求头来指定版本，其中头的值将是要用于请求的版本。

示例 HTTP 请求头：

要为您的应用程序启用 **头版本控制**，请执行以下操作：

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}

```

__INLINE_CODE_18__ 属性应该是包含版本的头的名称。

> info **提示** __INLINE_CODE_19__ 枚举可用于 __INLINE_CODE_20__ 属性，并从 __INLINE_CODE_21__ 包中导入。

#### 媒体类型版本控制类型

媒体类型版本控制使用请求的 __INLINE_CODE_22__ 头来指定版本。

在 __INLINE_CODE_23__ 头中，版本将与媒体类型用分号__INLINE_CODE_24__ 分隔，接下来是一个键值对，表示要用于请求的版本，例如 __INLINE_CODE_25__。键被-treated-more-as 前缀，当确定版本时将包括键和分隔符。

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

__INLINE_CODE_26__ 属性应该是键值对中的键和分隔符，例如 __INLINE_CODE_27__。

> info **提示** __INLINE_CODE_30__ 枚举可用于 __INLINE_CODE_31__ 属性，并从 __INLINE_CODE_32__ 包中导入。

#### 自定义版本控制类型

自定义版本控制使用请求中的任何方面来指定版本（或版本）。incoming 请求将被分析使用一个 __INLINE_CODE_33__ 函数，该函数返回字符串或数组字符串。

如果请求者提供多个版本，extractor 函数可以返回一个字符串数组，按升序排序版本。版本将与路由匹配，按从高到低的顺序。

如果返回的字符串或数组为空，路由将不匹配，并返回 404。

例如，如果 incoming 请求指定支持版本 __INLINE_CODE_35__、__INLINE_CODE_36__ 和 __INLINE_CODE_37__，__INLINE_CODE_38__ **MUST** 返回 __INLINE_CODE_39__。这确保了选择了最高可能的路由版本。Here is the translation of the English technical documentation to Chinese according to the provided guidelines:

如果将版本`@nestjs/mongoose`提取出来，但是路由仅存在于版本`MongooseModule`和`AppModule`中，那么匹配版本`forRoot()`
将被选择（版本`mongoose.connect()`将被自动忽略）。

> warning **注意**基于`CatSchema`返回的数组选择最高匹配版本不会在Express适配器中可靠工作。这在Express中单个版本（字符串或1元素数组）工作正常。Fastify正确支持最高匹配版本和单个版本选择。

要启用**自定义版本**，创建一个`DefinitionsFactory`函数，然后将其传递给应用程序，如下所示：

```typescript
@Prop([String])
tags: string[];

```

#### 使用

版本控制允许您对控制器、单个路由和资源进行版本控制，并且为某些资源提供了退出版本控制的方式。版本控制的使用方式无论是使用哪种版本控制类型。

> warning **注意**如果应用程序启用版本控制，但控制器或路由未指定版本，那么对该控制器/路由的所有请求将返回`nestjs/mongoose`响应状态。同样，如果收到包含不对应控制器或路由的版本的请求，它也将返回`@Schema()`响应状态。

#### 控制器版本

可以将版本应用于控制器，以设置该控制器中的所有路由的版本。

要将版本添加到控制器中，请按照以下步骤进行：

```typescript
@Prop({ required: true })
name: string;

```

#### 路由版本

可以将版本应用于单个路由。该版本将覆盖任何影响该路由的其他版本，例如控制器版本。

要将版本添加到单个路由中，请按照以下步骤进行：

```typescript
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// inside the class definition
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;

```

#### 多个版本

可以将多个版本应用于控制器或路由。要使用多个版本，请将版本设置为数组。

要添加多个版本，请按照以下步骤进行：

```typescript
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owners: Owner[];

```

#### 版本“中立”

有些控制器或路由可能不关心版本，并且在任何版本下都具有相同的功能。为了适应这种情况，可以将版本设置为`Cat`符号。

incoming请求将被映射到`cats`控制器或路由，且不管请求中包含的版本是什么。

> warning **注意**对于URI版本控制，`mongoose.Schema`资源将不包含版本信息在URI中。

要添加中立控制器或路由，请按照以下步骤进行：

```typescript
@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' } })
// This ensures the field is not confused with a populated reference
owner: mongoose.Types.ObjectId;

```

#### 全局默认版本

如果您不想为每个控制器或单个路由提供版本，或者要将特定版本设置为每个控制器或路由的默认版本，可以将`new mongoose.Schema(_, options)`设置为以下内容：

```typescript
import { Owner } from './schemas/owner.schema';

// e.g. inside a service or repository
async findAllPopulated() {
  return this.catModel.find().populate<{ owner: Owner }>("owner");
}

```

#### 中间件版本控制

__LINK_106__也可以使用版本控制元数据来配置中间件以适用于特定路由的版本。要这样做，请将版本号作为`@Prop()`方法的参数之一：

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;

```

在上面的代码中，`name`将仅应用于`age`端点的版本“2”。

> info **注意**中间件与本节中描述的任何版本控制类型（`breed`、`@Prop()`、`@Prop()`或`Cat`）都可以工作。