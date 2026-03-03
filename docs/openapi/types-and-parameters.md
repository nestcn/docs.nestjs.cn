<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:13:32.695Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### Types 和参数

`SwaggerCustomOptions` 会在路由处理器中搜索 `SwaggerModule#setup`, `ui`, 和 `raw` 装饰器以生成 API 文档。同时，它也会根据反射创建相应的模型定义。考虑以下代码：

```typescript
// ```bash
$ npm install --save @nestjs/swagger
```

> info **Hint** 若要显式设置主体定义，请使用 `ui: false` 装饰器（来自 `raw: []` 包）。

根据 __INLINE_CODE_34__, 将创建以下模型定义：

```html
<!-- __HTML_TAG_88__ --> <!-- __HTML_TAG_89__ --> <!-- __HTML_TAG_90__ -->
```

如您所见，定义为空，虽然类中声明了几个属性。在使类属性可见于 __INLINE_CODE_35__ 时，我们需要将它们标注为 __INLINE_CODE_36__ 装饰器或使用 CLI 插件（阅读 **Plugin** 部分），该插件将自动完成：

```typescript
// ```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> info **Hint** 而不是手动标注每个属性，考虑使用 Swagger 插件（见 __LINK_102__ 部分），该插件将自动提供这个功能。

让我们打开浏览器并验证生成的 __INLINE_CODE_37__ 模型：

```html
<!-- __HTML_TAG_91__ --> <!-- __HTML_TAG_92__ --> <!-- __HTML_TAG_93__ -->
```

此外,__INLINE_CODE_38__ 装饰器还允许设置各种 __LINK_103__ 属性：

```typescript
// ```bash
$ npm run start
```

> info **Hint** 而不是显式地类型 __INLINE_CODE_39__，可以使用 __INLINE_CODE_40__ 简写装饰器。

为了显式设置属性的类型，使用 __INLINE_CODE_41__ 键：

```typescript
// ```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```
```

#### 数组

当属性是一个数组时，我们必须手动指示数组类型，如下所示：

```typescript
// ```typescript
> app.register(helmet, {
>   contentSecurityPolicy: {
>     directives: {
>       defaultSrc: [`'self'`],
>       styleSrc: [`'self'`, `'unsafe-inline'`],
>       imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
>       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>     },
>   },
> });
>
> // If you are not going to use CSP at all, you can use this:
> app.register(helmet, {
>   contentSecurityPolicy: false,
> });
> ```
```

> info **Hint** 考虑使用 Swagger 插件（见 __LINK_104__ 部分），该插件将自动检测数组。

或者将类型作为数组的第一个元素（如上所示）或将 __INLINE_CODE_42__ 属性设置为 __INLINE_CODE_43__。

```html
<!-- __HTML_TAG_94__ --> <!-- __HTML_TAG_95__ -->
```

#### 循环依赖

当您在类中存在循环依赖时，使用延迟函数提供 __INLINE_CODE_44__ 类型信息：

```typescript
// ```TypeScript
export interface SwaggerDocumentOptions {
  /**
   * List of modules to include in the specification
   */
  include?: Function[];

  /**
   * Additional, extra models that should be inspected and included in the specification
   */
  extraModels?: Function[];

  /**
   * If `true`, swagger will ignore the global prefix set through `setGlobalPrefix()` method
   */
  ignoreGlobalPrefix?: boolean;

  /**
   * If `true`, swagger will also load routes from the modules imported by `include` modules
   */
  deepScanRoutes?: boolean;

  /**
   * Custom operationIdFactory that will be used to generate the `operationId`
   * based on the `controllerKey`, `methodKey`, and version.
   * @default () => controllerKey_methodKey_version
   */
  operationIdFactory?: OperationIdFactory;

  /**
   * Custom linkNameFactory that will be used to generate the name of links
   * in the `links` field of responses
   *
   * @see [Link objects](https://swagger.io/docs/specification/links/)
   *
   * @default () => `${controllerKey}_${methodKey}_from_${fieldKey}`
   */
  linkNameFactory?: (
    controllerKey: string,
    methodKey: string,
    fieldKey: string
  ) => string;

  /*
   * Generate tags automatically based on the controller name.
   * If `false`, you must use the `@ApiTags()` decorator to define tags.
   * Otherwise, the controller name without the suffix `Controller` will be used.
   * @default true
   */
  autoTagControllers?: boolean;
}
```

> info **Hint** 考虑使用 Swagger 插件（见 __LINK_105__ 部分），该插件将自动检测循环依赖。

#### generics 和 interfaces

由于 TypeScript 无法存储泛型或接口的元数据，因此当您在 DTO 中使用它们时， __INLINE_CODE_45__ 可能无法正确地生成模型定义。例如，以下代码将无法被 Swagger 模块正确地检查：

```typescript
// ```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);
```

为了克服这个限制，可以显式设置类型：

```