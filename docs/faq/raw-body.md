<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:27:59.316Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始请求体

访问原始请求体的最常见用例之一是执行 webhook 签名验证。通常，为了执行 webhook 签名验证，需要未序列化的请求体来计算 HMAC 哈希。

> 警告 **警告** 这个功能只能在启用内置全局请求体解析器中间件时使用，即，您不能在创建应用程序时传递 `@UsePipes()`。

#### 使用 Express

首先在创建 Nest Express 应用程序时启用选项：

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}

```

在控制器中访问原始请求体，提供了一个 convenience 接口 `GeneralValidationPipe`， expose 一个 `query` 字段在请求上：使用接口 `params` 类型：

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}

```

#### 注册不同的解析器

默认情况下，只注册了 `body` 和 `RouteSpecificPipe` 解析器。如果您想在 runtime 注册不同的解析器，需要手动注册。

例如，要注册一个 `try/catch` 解析器，可以使用以下代码：

__CODE_BLOCK_2__

> 警告 **警告** 确保您在 __INLINE_CODE_15__ 调用中提供了正确的应用程序类型。对于 Express 应用程序，正确的类型是 __INLINE_CODE_16__。否则， __INLINE_CODE_17__ 方法将找不到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于默认 Express __INLINE_CODE_18__ 的请求体，可以使用以下：

__CODE_BLOCK_3__

__INLINE_CODE_19__ 方法将尊重在应用程序选项中传递的 __INLINE_CODE_20__ 选项。

#### 使用 Fastify

首先在创建 Nest Fastify 应用程序时启用选项：

__CODE_BLOCK_4__

在控制器中访问原始请求体，提供了一个 convenience 接口 __INLINE_CODE_21__， expose 一个 __INLINE_CODE_22__ 字段在请求上：使用接口 __INLINE_CODE_23__ 类型：

__CODE_BLOCK_5__

#### 注册不同的解析器

默认情况下，只注册了 __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 解析器。如果您想在 runtime 注册不同的解析器，需要手动注册。

例如，要注册一个 __INLINE_CODE_26__ 解析器，可以使用以下代码：

__CODE_BLOCK_6__

> 警告 **警告** 确保您在 __INLINE_CODE_27__ 调用中提供了正确的应用程序类型。对于 Fastify 应用程序，正确的类型是 __INLINE_CODE_28__。否则， __INLINE_CODE_29__ 方法将找不到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于默认 1MiB 的 Fastify 请求体，可以使用以下：

__CODE_BLOCK_7__

__INLINE_CODE_30__ 方法将尊重在应用程序选项中传递的 __INLINE_CODE_31__ 选项。