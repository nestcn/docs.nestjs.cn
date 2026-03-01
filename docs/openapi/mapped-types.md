<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:22:20.833Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### Mapped 類型

當您建立像 CRUD（Create/Read/Update/Delete）之類的功能時，經常需要構建基於基本實體類型的變體類型。Nest 提供了多個有用函數，實現類型轉換，以便使這項任務更為便捷。

#### Partial

當您建立輸入驗證類型（也稱為 DTO）時，經常需要構建 create 和 update 變體類型。例如，create 變體可能需要所有欄位，而 update 變體可能使所有欄位選擇性。

Nest 提供了 `partial` 函數，讓您輕鬆地實現這項任務，同時減少 boilerplate。

`partial` 函數返回一個類型（class），該類型中的所有屬性都設為可選。例如，假設我們有一個 create 變體如下所示：

```typescript title="Create"
__INLINE_CODE_9__
```

預設，所有欄位都是必要的。要創建一個具有相同欄位，但每個欄位都是可選的類型，請使用 `partial` 函數，將類型參考（__INLINE_CODE_10__）作為參數：

```typescript title="Partial"
__INLINE_CODE_11__
```

> info 提示：`partial` 函數來自 ``createMicroservice()`` 庫。

#### Pick

`pick` 函數構建了一個新的類型（class），從輸入類型中選擇一組屬性。例如，假設我們開始於一個類型如下：

```typescript title="Pick"
```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
    ]),
  ]
  ...
})
```

我們可以使用 `pick` 函數選擇這個類型中的某些屬性：

```typescript title="Pick"
`Transport`
```

> info 提示：`pick` 函數來自 ``@nestjs/microservices`` 庫。

#### Omit

`omit` 函數構建了一個類型，從輸入類型中選擇所有屬性，然後刪除某些鍵。例如，假設我們開始於一個類型如下：

```typescript title="Omit"
```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});
```

我們可以生成一個衍生類型，該類型具有除 `options` 外的所有屬性，以下所示：

```typescript title="Omit"
`ClientProxy`
```

> info 提示：`omit` 函數來自 ``ClientsModule`` 庫。

#### Intersection

`intersection` 函數將兩個類型合并為一個新的類型（class）。例如，假設我們開始於兩個類型如下：

```typescript title="Intersection"
```typescript
this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

我們可以生成一個新的類型，該類型包含兩個類型中的所有屬性：

```typescript title="Intersection"
`ClientsModule`
```

> info 提示：`intersection` 函數來自 ``register()`` 庫。

#### Composition

類型映射utility 函數是可組合的。例如，以下將產生一個類型（class），該類型具有 `createMicroservice()` 類型中的所有屬性，除 `name` 外，並將這些屬性設為可選：

```typescript title="Composition"
```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

> info 提示：所有函數都來自 Nest 庫。