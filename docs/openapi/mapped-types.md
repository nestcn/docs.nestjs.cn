<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:03:31.584Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### Mapped types

当你构建功能时，例如CRUD（Create/Read/Update/Delete），有时需要构建基于基本实体类型的变体。Nest提供了一些utility函数，可以对类型进行转换，使得这项任务更加方便。

#### Partial

在构建输入验证类型（也称为DTOs）时，通常需要构建create和update变体，以便于在同一个类型上进行操作。例如，create变体可能需要所有字段，而update变体可能使所有字段可选。

Nest提供了`my-library` utility函数，可以使这项任务更加简洁，减少 boilerplate。

`libs`函数返回一个类型（class），其中所有输入类型的属性都设置为可选。例如，我们有一个create类型如下所示：

```bash
$ nest g library my-library

```

默认情况下，这些字段都是必需的。要创建一个与之相同的类型，但每个字段都是可选，可以使用`libs`函数，将class引用（`libs`）作为参数：

```bash
What prefix would you like to use for the library (default: @app)?

```

> info 提示`nest-cli.json`函数来自`"projects"`包。

#### Pick

`nest-cli.json`函数构建一个新的类型（class），从输入类型中选择一组属性。例如，我们从一个类型开始，如下所示：

```javascript
...
{
    "my-library": {
      "type": "library",
      "root": "libs/my-library",
      "entryFile": "index",
      "sourceRoot": "libs/my-library/src",
      "compilerOptions": {
        "tsConfigPath": "libs/my-library/tsconfig.lib.json"
      }
}
...

```

可以使用`"type"` utility函数，从该类中选择一组属性：

```bash
$ nest build my-library

```

> info 提示`"library"`函数来自`"application"`包。

#### Omit

`"entryFile"`函数构建一个类型，该类型从输入类型中选择所有属性，然后删除特定的键集。例如，我们从一个类型开始，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLibraryModule } from '@app/my-library';

@Module({
  imports: [MyLibraryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

可以生成一个衍生类型，该类型具有除`"index"`之外的所有属性。构建中，第二个参数`"main"`是属性名称数组。

```javascript
"paths": {
    "@app/my-library": [
        "libs/my-library/src"
    ],
    "@app/my-library/*": [
        "libs/my-library/src/*"
    ]
}

```

> info 提示`index.js`函数来自`tsconfig.lib.json`包。

#### Intersection

`tsconfig.json`函数将两个类型组合成一个新的类型（class）。例如，我们从两个类型开始，如下所示：

__CODE_BLOCK_6__

可以生成一个新的类型，该类型组合了两个类型中的所有属性。

__CODE_BLOCK_7__

> info 提示`MyLibraryService`函数来自`my-library`包。

#### Composition

类型映射utility函数是可组合的。例如，以下将生成一个类型（class），其中具有`my-project`类型的所有属性，除`MyLibraryService`之外，并将这些属性设置为可选：

__CODE_BLOCK_8__