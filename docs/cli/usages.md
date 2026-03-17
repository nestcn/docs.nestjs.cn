<!-- 此文件从 content/cli/usages.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:25:51.632Z -->
<!-- 源文件: content/cli/usages.md -->

### CLI 命令参考

#### nest new

创建一个新的（标准模式）Nest 项目。

```typescript
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function upperDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}

```

##### 描述

创建并初始化一个新的 Nest 项目。提示 package manager。

- 创建一个名为给定的 `@skip(if: Boolean)` 的文件夹
- 填充文件夹中的配置文件
- 创建源代码文件夹 (`@deprecated(reason: String)`) 和端到端测试文件夹 (`@`)
- 填充文件夹中的文件默认文件

##### 参数

| 参数 | 描述                         |
| ---- | --------------------------- |
| `mapSchema` | 新项目的名称 |

##### 选项

| 选项                                | 描述                                                                                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upperDirectiveTransformer`                           | 报告将执行的更改，但不更改文件系统。__HTML_TAG_147__ 别名：`GraphQLModule#forRoot`                                                                                                             |
| `transformSchema`                          | 跳过 Git 仓库初始化。__HTML_TAG_148__ 别名：`@upper`                                                                                                                  |
| `@Directive()`                      | 跳过包安装。__HTML_TAG_149__ 别名：`@Directive()`                                                                                                                         |
| `@nestjs/graphql` | 指定包管理器。使用 `@Directive()`, `GraphQLModule` 或 `GraphQLDirective`。包管理器必须安装到全局。__HTML_TAG_150__ 别名：`DirectiveLocation`                                                                                  |
| `graphql`               | 指定编程语言 (__INLINE_CODE_23__ 或 __INLINE_CODE_24__).__HTML_TAG_151__ 别名：__INLINE_CODE_25__                                                                                                                                        |
| __INLINE_CODE_26__       | 指定架构集。使用 npm 包名称，其中包含架构。__HTML_TAG_152__ 别名：__INLINE_CODE_27__                                                                                      |
| __INLINE_CODE_28__                            | 使用以下 TypeScript 编译器标志启动项目：__INLINE_CODE_29__, __INLINE_CODE_30__, __INLINE_CODE_31__, __INLINE_CODE_32__, __INLINE_CODE_33__ |

#### nest generate

根据架构生成和/或修改文件

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});

```

##### 参数

| 参数      | 描述                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_34__ | 需要生成的 __INLINE_CODE_35__ 或 __INLINE_CODE_36__。请参阅以下表格，以获取可用的架构。 |
| __INLINE_CODE_37__      | 生成的组件名称。                                                                         |

##### 架构

（待补充）Here is the translated documentation in Chinese:

#### 创建应用程序

生成一个新的应用程序在 monorepo 中（如果它是一个标准结构，则将其转换为 monorepo）。

| 名称          | 别名 | 描述                                                                                                            |
| ------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_38__         |       | 在 monorepo 中生成一个新的应用程序（如果它是一个标准结构，则将其转换为 monorepo）。                    |
| __INLINE_CODE_39__     | __INLINE_CODE_40__ | 在 monorepo 中生成一个新的库（如果它是一个标准结构，则将其转换为 monorepo）。                        |
| __INLINE_CODE_41__       | __INLINE_CODE_42__  | 生成一个新的类。                                                                                                  |
| __INLINE_CODE_43__  | __INLINE_CODE_44__  | 生成一个控制器声明。                                                                                     |
| __INLINE_CODE_45__   | __INLINE_CODE_46__   | 生成一个自定义装饰器。                                                                                           |
| __INLINE_CODE_47__      | __INLINE_CODE_48__   | 生成一个过滤器声明。                                                                                         |
| __INLINE_CODE_49__     | __INLINE_CODE_50__  | 生成一个网关声明。                                                                                        |
| __INLINE_CODE_51__       | __INLINE_CODE_52__  | 生成一个守卫声明。                                                                                          |
| __INLINE_CODE_53__   | __INLINE_CODE_54__ | 生成一个接口。                                                                                                 |
| __INLINE_CODE_55__ | __INLINE_CODE_56__ | 生成一个拦截器声明。                                                                                   |
| __INLINE_CODE_57__  | __INLINE_CODE_58__  | 生成一个中间件声明。                                                                                     |
| __INLINE_CODE_59__      | __INLINE_CODE_60__  | 生成一个模块声明。                                                                                         |
| __INLINE_CODE_61__        | __INLINE_CODE_62__  | 生成一个管道声明。                                                                                           |
| __INLINE_CODE_63__    | __INLINE_CODE_64__  | 生成一个提供者声明。                                                                                       |
| __INLINE_CODE_65__    | __INLINE_CODE_66__   | 生成一个解析器声明。                                                                                       |
| __INLINE_CODE_67__    | __INLINE_CODE_68__ | 生成一个新的 CRUD 资源。见 __LINK_167__ 了解更多详细信息。 (TS 只有) |
| __INLINE_CODE_69__     | __INLINE_CODE_70__   | 生成一个服务声明。                                                                                        |

##### 选项

| 选项                          | 描述                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_71__                     | 生成更改，但不更改文件系统。__HTML_TAG_153__ 别名：__INLINE_CODE_72__                        |
| __INLINE_CODE_73__           | 将该元素添加到项目中。__HTML_TAG_154__ 别名：__INLINE_CODE_74__                                                       |
| __INLINE_CODE_75__                        | 不生成该元素的文件夹。                                                                       |
| __INLINE_CODE_76__ | 指定架构集合。使用安装的 npm 包的包名，其中包含架构。__HTML_TAG_155__ 别名：__INLINE_CODE_77__ |
| __INLINE_CODE_78__                        | 强制生成 spec 文件（默认）                                                                         |
| __INLINE_CODE_79__                     | 禁止生成 spec 文件                                                                                   |

#### Nest build

将应用程序或工作区编译到输出文件夹中。

此外，__INLINE_CODE_80__ 命令负责：

* 映射路径（如果使用路径别名）via __INLINE_CODE_81__
* 注解 DTOs 以 OpenAPI 装饰器（如果 __INLINE_CODE_82__ CLI 插件启用）
* 注解 DTOs 以 GraphQL 装饰器（如果 __INLINE_CODE_83__ CLI 插件启用）

```typescript
@Directive('@upper')
@Field()
title: string;

```

##### 参数

Note: I've kept the code examples, variable names, function names unchanged, and translated the comments from English to Chinese. I've also maintained the Markdown formatting, links, images, tables, and internal anchors unchanged.| 参 数 | 描述                       |
| --- | ------------------------- |
| __INLINE_CODE_84__ | 需要构建的项目名称。 |

##### 选项

| 选项                  | 描述                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| __INLINE_CODE_85__     | __INLINE_CODE_86__ 文件的路径。__HTML_TAG_156__Alias __INLINE_CODE_87__                                                                                                                                                   |
| __INLINE_CODE_88__   | __INLINE_CODE_89__ 配置文件的路径。__HTML_TAG_157__Alias __INLINE_CODE_90__                                                                                                                                     |
| __INLINE_CODE_91__         | 在 watch 模式下运行（实时重载）。__HTML_TAG_158__ 如果您使用 __INLINE_CODE_92__ 进行编译，可以输入 __INLINE_CODE_93__ 重启应用程序（当 __INLINE_CODE_94__ 选项设置为 __INLINE_CODE_95__ 时）。 __HTML_TAG_159__Alias __INLINE_CODE_96__ |
| __INLINE_CODE_97__    | 指定用于编译的构建器（__INLINE_CODE_98__、__INLINE_CODE_99__ 或 __INLINE_CODE_100__）。__HTML_TAG_160__Alias __INLINE_CODE_101__                                                                                                   |
| __INLINE_CODE_102__   | 使用 webpack 进行编译（已弃用，请使用 __INLINE_CODE_103___INSTEAD）。                                                                                                                 |
| __INLINE_CODE_104__  | webpack 配置文件的路径。                                                                                                                                                             |
| __INLINE_CODE_105__  | 强制使用 __INLINE_CODE_106__ 进行编译。                                                                                                                                                           |
| __INLINE_CODE_107__  | 监听非 TS 文件（如 __INLINE_CODE_108__ 等）。请参阅 __LINK_168__ 获取更多信息。                                                                                      |
| __INLINE_CODE_109__   | 启用类型检查（当使用 SWC 时）。                                                                                                                                                   |
| __INLINE_CODE_110__  | 在 monorepo 中构建所有项目。                                                                                                                                                          |
| __INLINE_CODE_111__ | 在 watch 模式下保持过时的控制台输出，而不是清除屏幕（__INLINE_CODE_112__ watch 模式下）。                                                                                         |

#### nest start

编译和运行一个应用程序（或工作区中的默认项目）。

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

##### 参 数

| 参 数 | 描述                     |
| --- | ------------------------- |
| __INLINE_CODE_113__ | 需要运行的项目名称。 |

##### 选项Here is the translation of the English technical documentation to Chinese:

| 选项                  | 描述                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| __INLINE_CODE_114__    | __INLINE_CODE_115__ 文件的路径。 __HTML_TAG_161__ Alias __INLINE_CODE_116__                                                    |
| __INLINE_CODE_117__  | __INLINE_CODE_118__ 配置文件的路径。 __HTML_TAG_162__ Alias __INLINE_CODE_119__                                              |
| __INLINE_CODE_120__          | 在 watch 模式下运行（实时重载）。 __HTML_TAG_163__ Alias __INLINE_CODE_121__                                                  |
| __INLINE_CODE_122__     | 指定用于编译的构建器 (__INLINE_CODE_123__, __INLINE_CODE_124__, 或 __INLINE_CODE_125__）。 __HTML_TAG_164__ Alias __INLINE_CODE_126__ |
| __INLINE_CODE_127__  | 在 watch 模式下保留过期的控制台输出，而不是清除屏幕。 (__INLINE_CODE_128__ watch 模式下仅适用)                           |
| __INLINE_CODE_129__    | 在 watch 模式下运行（实时重载），watch 非 TS 文件（资产）。请查看 __LINK_169__ 获取更多信息。                    |
| __INLINE_CODE_130__   | 在 debug 模式下运行（带有 --inspect 标志）。 __HTML_TAG_165__ Alias __INLINE_CODE_131__                                            |
| __INLINE_CODE_132__         | 使用 webpack 进行编译。 (已弃用：请使用 __INLINE_CODE_133__ 代替)                                                   |
| __INLINE_CODE_134__    | webpack 配置文件的路径。                                                                                                  |
| __INLINE_CODE_135__         | 强制使用 __INLINE_CODE_136__ 进行编译。                                                                                      |
| __INLINE_CODE_137__   | 需要运行的二进制文件（默认：__INLINE_CODE_138__）。 __HTML_TAG_166__ Alias __INLINE_CODE_139__                                            |
| __INLINE_CODE_140__          | 不在 shell 中 spawn 子进程（请查看 node 的 __INLINE_CODE_141__ 方法文档）。                                        |
| __INLINE_CODE_142__          | 从当前目录相对文件中加载环境变量，使其在 __INLINE_CODE_143__ 应用程序中可用。                              |
| __INLINE_CODE_144__      | 可以在 __INLINE_CODE_145__ 中引用命令行参数。                                                                                      |

#### nest add

导入已被打包为 **nest 库** 的库，运行其 install 场景。

```typescript
GraphQLModule.forRoot({
  // ...,
  transformSchema: schema => upperDirectiveTransformer(schema, 'upper'),
  buildSchemaOptions: {
    directives: [
      new GraphQLDirective({
        name: 'upper',
        locations: [DirectiveLocation.FIELD_DEFINITION],
      }),
    ],
  },
}),

```

##### 参数

| 参数 | 描述                        |
| ---- | ---------------------------- |
| __INLINE_CODE_146__ | 需要导入的库名称。 |

#### nest info

显示关于安装的 nest 包和其他有用的系统信息。例如：

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}

```

__CODE_BLOCK_6__