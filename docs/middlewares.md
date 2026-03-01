<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:15:05.596Z -->
<!-- 源文件: content/middlewares.md -->

### Middleware

Middleware 是一種在 **before** 路由處理器執行的函數。Middleware 函數擁有存取 __LINK_93__ 和 __LINK_94__ 物件，以及應用程式的 request-response周期中的 `get()` middleware 函數。常見的 middleware 函數使用變數名 `strict: true` 來表示。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

Nest middleware 本質上等同於 __LINK_95__ middleware。官方 express 文件中的描述說明了 middleware 的能力：

__HTML_TAG_75__
  Middleware 函數可以執行以下任務：
  __HTML_TAG_76__
    __HTML_TAG_77__執行任意代碼。
    __HTML_TAG_79__更改請求和回應物件。
    __HTML_TAG_80__結束請求-回應周期。
    __HTML_TAG_81__呼叫下一個 middleware 函數。
    __HTML_TAG_83__如果当前 middleware 函數不結束請求-回應周期，則需要呼叫 __HTML_TAG_86__ next()__HTML_TAG_87__以將控制權傳遞給下一個 middleware 函數。否則，請求將被留下。
  __HTML_TAG_89__
__HTML_TAG_90__

使用 Nest middleware，可以在函數或類別中實現自定義 middleware。類別應該實現 `app.select`介面，而函數則沒有特殊要求。讓我們開始實現一個簡單的 middleware 功能使用類別方法。

> warning **Warning** `app.close()` 和 `bootstrap` 处理 middleware differently 和提供不同的方法簽名，請閱讀更多 __LINK_96__。

#### Dependency injection

Nest middleware 完全支持 Dependency Injection。與提供者和控制器一樣，它們可以注入同一個模組中的依賴项。正如通常般，這是通過 __INLINE_CODE_17__ 進行的。

#### Applying middleware

Middleware 不在 __INLINE_CODE_18__ 裝飾器中，而是通過 __INLINE_CODE_19__ 模組類別的方法設置。包含 middleware 的模組需要實現 __INLINE_CODE_20__ 介面。讓我們在 __INLINE_CODE_22__ 水平設置 __INLINE_CODE_21__。

```typescript
const tasksService = app.get(TasksService);
```

在上面的範例中，我們已經設置了 __INLINE_CODE_23__ 對於 __INLINE_CODE_24__ 路由處理器，這些路由處理器之前在 __INLINE_CODE_25__ 中定義。我們也可以進一步限制 middleware 到特定的請求方法通過在 __INLINE_CODE_28__ 方法中傳遞包含路由 __INLINE_CODE_26__ 和請求 __INLINE_CODE_27__ 的物件。以下範例中，可以看到我們導入了 __INLINE_CODE_29__  Enum以引用所需的請求方法類型。

```typescript
const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
```

> info **Hint** __INLINE_CODE_30__ 方法可以使用 __INLINE_CODE