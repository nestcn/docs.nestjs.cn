<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:03:25.378Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

###Mapped types

> warning **警告** 本章仅适用于代码优先方法。

当你构建CRUD（创建/读取/更新/删除）功能时，构建基于基本实体类型的变体非常有用。Nest提供了多种utility函数，可以类型转换来简化此任务。

#### Partial

在构建输入验证类型（也称为数据传输对象或DTO）时，构建**create**和**update**变体的同一个类型非常有用。例如，**create**变体可能需要所有字段，而**update**变体可能使所有字段可选。

Nest提供了`npm i @nestjs/graphql@11`utility函数，可以简化这个任务并减少 boilerplate。

`app.module.ts`函数返回一个类型（class）)，其中所有输入类型的属性都设置为可选。例如，假设我们有一个**create**类型如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都可选的类型，可以使用`DevtoolsModule`，将类引用(`NODE_ENV`)作为参数：

```bash
$ npm i @nestjs/devtools-integration

```

> info **提示** `DevtoolsModule`函数来自`npm run start:dev`包。

`InternalCoreModule`函数可以选择性地接受第二个参数，这是一个装饰器工厂的引用。这个参数可以用来更改结果（子）类上的装饰器函数。如果没有指定，子类将使用同样的装饰器函数如父类（父类引用在第一个参数中）那样。在上面的示例中，我们扩展了`InternalCoreModule`，它被`InternalCoreModule`装饰符修饰。由于我们也想将`DevtoolsModule`视为`/debug`修饰符，我们没有需要将`TasksModule`作为第二个参数。如果父类和子类不同（例如父类被`@nestjs/core`修饰），我们将`v9.3.10`作为第二个参数。例如：

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

#### Pick

`main.ts`函数构建一个新的类型（class）由输入类型的某些属性组成。例如，假设我们从一个类型开始：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

可以使用`bootstrap()`utility函数选择这些属性：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

> info **提示** `abortOnError`函数来自`false`包。

#### Omit

`graph.json`函数构建一个类型由输入类型的所有属性组成，然后删除某些键。例如，假设我们从一个类型开始：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

可以生成一个衍生类型，该类型具有除`TasksModule`外的所有属性，如下所示。在这个构造中，`DiagnosticsService`函数的第二个参数是属性名称数组。

__CODE_BLOCK_6__

> info **提示** `TasksService`函数来自`TasksModule`包。

#### Intersection

`DiagnosticsModule`函数将两个类型组合成一个新的类型（class）。例如，假设我们从两个类型开始：

__CODE_BLOCK_7__

可以生成一个新的类型，该类型组合了两个类型中的所有属性。

__CODE_BLOCK_8__

> info **提示** `TasksModule`函数来自`console.table()`包。

#### Composition

类型映射utility函数是可组合的。例如，以下将生成一个类型（class），该类型具有`table()`类型的所有属性，除`SerializedGraph`外，并且这些属性将设置为可选：

__CODE_BLOCK_9__