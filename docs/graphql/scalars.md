### 标量类型

GraphQL 对象类型具有名称和字段，但这些字段最终需要解析为具体数据。这就是标量类型的作用：它们表示查询的叶节点（了解更多[此处](https://graphql.org/learn/schema/#scalar-types) ）。GraphQL 默认包含以下类型：`Int`、`Float`、`String`、`Boolean` 和 `ID`。除了这些内置类型，您可能还需要支持自定义原子数据类型（例如 `Date`）。

#### 代码优先

代码优先方法内置了五种标量类型，其中三种是现有 GraphQL 类型的简单别名。

- `ID`（`GraphQLID` 的别名）——表示唯一标识符，通常用于重新获取对象或作为缓存键
- `Int`（`GraphQLInt` 的别名）- 有符号 32 位整数
- `Float`（`GraphQLFloat` 的别名）- 有符号双精度浮点数值
- `GraphQLISODateTime` - UTC 时区的日期时间字符串（默认用于表示 `Date` 类型）
- `GraphQLTimestamp` - 有符号整数，表示从 UNIX 纪元开始计算的毫秒数

默认使用 `GraphQLISODateTime`（例如 `2019-12-03T09:54:33Z`）来表示 `Date` 类型。若要改用 `GraphQLTimestamp`，需将 `buildSchemaOptions` 对象的 `dateScalarMode` 属性设置为 `'timestamp'`，如下所示：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),
```

同理，默认使用 `GraphQLFloat` 来表示 `number` 类型。若要改用 `GraphQLInt`，需将 `buildSchemaOptions` 对象的 `numberScalarMode` 属性设置为 `'integer'`，如下所示：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),
```

此外，您还可以创建自定义标量类型。

#### 覆盖默认标量类型

要为 `Date` 标量创建自定义实现，只需新建一个类即可。

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```

完成此操作后，将 `DateScalar` 注册为提供程序。

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}
```

现在我们可以在类中使用 `Date` 类型。

```typescript
@Field()
creationDate: Date;
```

#### 导入自定义标量

要使用自定义标量类型，需将其作为解析器导入并注册。我们将以 `graphql-type-json` 包为例进行演示，这个 npm 包定义了一个 `JSON` 类型的 GraphQL 标量。

首先安装该包：

```bash
$ npm i --save graphql-type-json
```

安装完成后，向 `forRoot()` 方法传入自定义解析器：

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}
```

现在即可在类中使用 `JSON` 类型。

```typescript
@Field(() => GraphQLJSON)
info: JSON;
```

如需获取一系列实用的标量类型，请查看 [graphql-scalars](https://www.npmjs.com/package/graphql-scalars) 包。

#### 创建自定义标量

要定义自定义标量，需新建一个 `GraphQLScalarType` 实例。我们将创建一个自定义的 `UUID` 标量。

```typescript
const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validate(uuid: unknown): string | never {
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    throw new Error('invalid uuid');
  }
  return uuid;
}

export const CustomUuidScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'A simple UUID parser',
  serialize: (value) => validate(value),
  parseValue: (value) => validate(value),
  parseLiteral: (ast) => validate(ast.value),
});
```

我们向 `forRoot()` 方法传递了一个自定义解析器：

```typescript
@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { UUID: CustomUuidScalar },
    }),
  ],
})
export class AppModule {}
```

现在我们可以在类中使用 `UUID` 类型了。

```typescript
@Field(() => CustomUuidScalar)
uuid: string;
```

#### 模式优先

要定义自定义标量类型（了解更多关于标量的信息[请点击这里](https://www.apollographql.com/docs/graphql-tools/scalars.html) ），需要创建一个类型定义和专用的解析器。这里（如同官方文档所示），我们将使用 `graphql-type-json` 包进行演示。这个 npm 包定义了一个 `JSON` GraphQL 标量类型。

首先安装这个包：

```bash
$ npm i --save graphql-type-json
```

安装完成后，我们向 `forRoot()` 方法传递一个自定义解析器：

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}
```

现在我们可以在类型定义中使用 `JSON` 标量：

```graphql
scalar JSON
```

type Foo {
  field: JSON
}
```

另一种定义标量类型的方法是创建一个简单的类。假设我们想要用 `Date` 类型增强我们的模式。

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```

完成这些后，将 `DateScalar` 注册为提供者。

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}
```

现在我们可以在类型定义中使用 `Date` 标量。

```graphql
scalar Date
```

默认情况下，所有标量生成的 TypeScript 定义都是 `any`——这并不具备良好的类型安全性。但当你指定类型生成方式时，可以配置 Nest 如何为自定义标量生成类型声明：

```typescript
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();

definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  defaultScalarType: 'unknown',
  customScalarTypeMapping: {
    DateTime: 'Date',
    BigNumber: '_BigNumber',
  },
  additionalHeader: "import _BigNumber from 'bignumber.js'",
});
```

> **提示** 或者，你也可以使用类型引用，例如：`DateTime: Date`。这种情况下，`GraphQLDefinitionsFactory` 将提取指定类型的名称属性（`Date.name`）来生成 TS 定义。注意：对于非内置类型（自定义类型），需要添加对应的导入语句。

现在，给定以下 GraphQL 自定义标量类型：

```graphql
scalar DateTime
scalar BigNumber
scalar Payload
```

我们将在 `src/graphql.ts` 中看到如下生成的 TypeScript 定义：

```typescript
import _BigNumber from 'bignumber.js';

export type DateTime = Date;
export type BigNumber = _BigNumber;
export type Payload = unknown;
```

在此，我们使用了 `customScalarTypeMapping` 属性来提供我们希望为自定义标量声明的类型映射。我们还提供了一个 `additionalHeader` 属性，以便添加这些类型定义所需的任何导入项。最后，我们添加了一个默认标量类型 `defaultScalarType`，其值为 `'unknown'`，这样任何未在 `customScalarTypeMapping` 中指定的自定义标量都将被别名化为 `unknown` 而非 `any`（自 TypeScript 3.0 起[官方推荐](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type)使用前者以增强类型安全性）。

> info **注意** 我们已从 `bignumber.js` 导入了 `_BigNumber`；这是为了避免[循环类型引用](https://github.com/Microsoft/TypeScript/issues/12525#issuecomment-263166239) 。
