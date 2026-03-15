<!-- 此文件从 content/cli/usages.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:07:03.293Z -->
<!-- 源文件: content/cli/usages.md -->

### CLI 命令参考

#### nest new

创建一个新的(Nest 标准模式)项目。

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

创建并初始化一个新的 Nest 项目。提示输入包管理器。

- 创建一个具有给定 `@skip(if: Boolean)` 的文件夹
- 填充文件夹中的配置文件
- 创建源代码文件夹(`@deprecated(reason: String)`)和端到端测试文件夹(`@`)
- 填充文件夹中的默认文件，以便应用组件和测试

##### 参数

| 参数 | 描述                 |
| ---- | -------------------- |
| `mapSchema` | 新项目的名称 |

##### 选项

| 选项                                | 描述                                                                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upperDirectiveTransformer`                           | 仅报告将要执行的更改，而不更改文件系统。__HTML_TAG_147__ 别名：`GraphQLModule#forRoot`                                                                                                             |
| `transformSchema`                          | 跳过 Git 仓库初始化。__HTML_TAG_148__ 别名：`@upper`                                                                                                                                                 |
| `@Directive()`                      | 跳过包安装。__HTML_TAG_149__ 别名：`@Directive()`                                                                                                                                                          |
| `@nestjs/graphql` | 指定包管理器。使用 `@Directive()`、`GraphQLModule` 或 `GraphQLDirective`。包管理器必须安装在全局上。__HTML_TAG_150__ 别名：`DirectiveLocation`                                                                                  |
| `graphql`               | 指定编程语言（__INLINE_CODE_23__ 或 __INLINE_CODE_24__）。__HTML_TAG_151__ 别名：__INLINE_CODE_25__                                                                                                                                        |
| __INLINE_CODE_26__       | 指定架构。使用安装了 npm 包的包名，该包包含架构。__HTML_TAG_152__ 别名：__INLINE_CODE_27__                                                                                      |
| __INLINE_CODE_28__                            | 使用以下 TypeScript 编译器标志启动项目：__INLINE_CODE_29__、__INLINE_CODE_30__、__INLINE_CODE_31__、__INLINE_CODE_32__、__INLINE_CODE_33__ |

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
| --------- | -------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_34__ | 要生成的 __INLINE_CODE_35__ 或 __INLINE_CODE_36__。请参阅以下表格以获取可用的架构。 |
| __INLINE_CODE_37__      | 生成的组件名称。                                                                     |

##### 架构

(等待 further instructions )|名称          |别名 |描述                                                                                                            |
|------------- |----- | ---------------------------------------------------------------------------------------------------------------------- |
|`nest new`    |       | 在 monorepo 中生成新的应用程序（如果是标准结构，则将其转换为 monorepo）。                    |
|`nest lib`    | `nest new library` | 在 monorepo 中生成新的库（如果是标准结构，则将其转换为 monorepo）。                        |
|`nest class`  |       | 生成一个新的类。                                                                                                  |
|`nest controller` |       | 生成控制器声明。                                                                                     |
|`nest decorator` |       | 生成自定义装饰器。                                                                                           |
|`nest filter`  |       | 生成过滤器声明。                                                                                         |
|`nest gateway` |       | 生成网关声明。                                                                                          |
|`nest guard`   |       | 生成守卫声明。                                                                                          |
|`nest interface` |       | 生成接口。                                                                                                 |
|`nest interceptor` |       | 生成拦截器声明。                                                                                       |
|`nest middleware` |       | 生成中间件声明。                                                                                     |
|`nest module`  |       | 生成模块声明。                                                                                         |
|`nest pipe`    |       | 生成管道声明。                                                                                           |
|`nest provider` |       | 生成提供者声明。                                                                                       |
|`nest resolver` |       | 生成解析器声明。                                                                                       |
|`nest resource` |       | 生成新的 CRUD 资源。请查看 __LINK_167__以获取更多详细信息。 (TS only) |
|`nest service`  |       | 生成服务声明。                                                                                        |

##### 选项

|选项                          |描述                                                                                                     |
|----------------------------- | --------------------------------------------------------------------------------------------------------------- |
|`nest --dry-run`            | 报告将要进行的更改，但不更改文件系统。__HTML_TAG_153__ 别名：`nest --dry-run`                        |
|`nest --add`                | 将该元素添加到项目中。__HTML_TAG_154__ 别名：`nest --add`                                                      |
|`nest --no-folder`          | 不生成该元素的文件夹。                                                                       |
|`nest --collection`         | 指定架构师收藏集。使用安装的 npm 包中包含架构师的包名。__HTML_TAG_155__ 别名：`nest --collection` |
|`nest --enforce-spec`       |强制生成 spec 文件（默认）                                                                         |
|`nest --no-spec`           | 禁用 spec 文件生成                                                                                   |

#### nest build

将应用程序或工作区编译到输出文件夹中。

同时，`nest build` 命令还负责：

- 映射路径（如果使用路径别名）via __INLINE_CODE_81__
- 对 DTOs 应用 OpenAPI 装饰器（如果 enabled __INLINE_CODE_82__ CLI 插件）
- 对 DTOs 应用 GraphQL 装饰器（如果 enabled __INLINE_CODE_83__ CLI 插件）

```typescript
@Directive('@upper')
@Field()
title: string;

```

##### 参数| 参数 | 说明                       |
| ---- | --------------------------- |
| __INLINE_CODE_84__ | 需要构建的项目名称。 |

##### 选项

| 选项                  | 说明                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| __INLINE_CODE_85__         | __INLINE_CODE_86__ 文件的路径。__HTML_TAG_156__ Alias __INLINE_CODE_87__                                                                                                                                                   |
| __INLINE_CODE_88__       | __INLINE_CODE_89__ 配置文件的路径。__HTML_TAG_157__ Alias __INLINE_CODE_90__                                                                                                                                     |
| __INLINE_CODE_91__               | 在 watch 模式下运行（live-reload）。__HTML_TAG_158__ 如果您使用 __INLINE_CODE_92__ 进行编译，可以输入 __INLINE_CODE_93__ 重新启动应用程序（当 __INLINE_CODE_94__ 选项设置为 __INLINE_CODE_95__ 时）。__HTML_TAG_159__ Alias __INLINE_CODE_96__ |
| __INLINE_CODE_97__      | 指定用于编译的构建器（__INLINE_CODE_98__、__INLINE_CODE_99__ 或 __INLINE_CODE_100__）。__HTML_TAG_160__ Alias __INLINE_CODE_101__                                                                                                   |
| __INLINE_CODE_102__             | 使用 webpack 进行编译（已弃用：请使用 __INLINE_CODE_103__ 替代）。                                                                                                                 |
| __INLINE_CODE_104__         | webpack 配置文件的路径。                                                                                                                                                             |
| __INLINE_CODE_105__                 | 强制使用 __INLINE_CODE_106__ 进行编译。                                                                                                                                                           |
| __INLINE_CODE_107__         | 监听非 TS 文件（资产如 __INLINE_CODE_108__ 等）。请查看 __LINK_168__ 进行更多详细信息。                                                                                      |
| __INLINE_CODE_109__          | 启用类型检查（当使用 SWC 时）。                                                                                                                                                   |
| __INLINE_CODE_110__                 | 在 monorepo 中构建所有项目。                                                                                                                                                          |
| __INLINE_CODE_111__ | 在 watch 模式下保留过时的控制台输出，而不是清除屏幕（__INLINE_CODE_112__ watch 模式 only）                                                                                         |

#### nest start

编译和运行一个应用程序（或工作区的默认项目）。

__CODE BLOCK_3__

##### 参数

| 参数 | 说明                     |
| ---- | ----------------------- |
| __INLINE_CODE_113__ | 需要运行的项目名称。 |

##### 选项Here is the translation of the English technical documentation to Chinese:

| 选项                  | 描述                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_114__         | __INLINE_CODE_115__ 文件的路径。__HTML_TAG_161__Alias __INLINE_CODE_116__                                                                                           |
| __INLINE_CODE_117__       | __INLINE_CODE_118__ 配置文件的路径。__HTML_TAG_162__Alias __INLINE_CODE_119__                                                                             |
| __INLINE_CODE_120__               | 在 watch 模式下运行（实时重载）__HTML_TAG_163__Alias __INLINE_CODE_121__                                                                                    |
| __INLINE_CODE_122__      | 指定用于编译的构建器（__INLINE_CODE_123__、__INLINE_CODE_124__ 或 __INLINE_CODE_125__）。__HTML_TAG_164__Alias __INLINE_CODE_126__                                           |
| __INLINE_CODE_127__ | 在 watch 模式下保留过时的控制台输出，而不是清除屏幕。(__INLINE_CODE_128__ watch 模式下只适用)                                 |
| __INLINE_CODE_129__         | 在 watch 模式下运行（实时重载），监控非 TS 文件（资产）。见 __LINK_169__ för更多详细信息。               |
| __INLINE_CODE_130__    | 在调试模式下运行（带有 --inspect 标志）__HTML_TAG_165__Alias __INLINE_CODE_131__                                                                            |
| __INLINE_CODE_132__             | 使用 webpack 进行编译。（已弃用：使用 __INLINE_CODE_133__ 代替）                                                         |
| __INLINE_CODE_134__         | webpack 配置文件的路径。                                                                                                     |
| __INLINE_CODE_135__                 | 强制使用 __INLINE_CODE_136__ 进行编译。                                                                                                   |
| __INLINE_CODE_137__       | 运行的二进制文件（默认：__INLINE_CODE_138__）。__HTML_TAG_166__Alias __INLINE_CODE_139__                                                                                   |
| __INLINE_CODE_140__            | 不在 shell 中 spawn 子进程（见 node 的 __INLINE_CODE_141__ 方法文档）。                                      |
| __INLINE_CODE_142__            | 从当前目录相对文件加载环境变量，使其可供应用程序在 __INLINE_CODE_143__ 中使用。 |
| __INLINE_CODE_144__        | 命令行参数，可以用 __INLINE_CODE_145__ 参考。                                                                 |

#### nest add

导入已打包为 **nest 库** 的库，运行其安装架构。

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
| ---- | -------------------------- |
| __INLINE_CODE_146__ | 要导入的库名称。 |

#### nest info

显示安装的 nest 包和其他有助的系统信息。例如：

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}

```

__CODE_BLOCK_6__