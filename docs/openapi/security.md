### 安全

要为特定操作定义应使用的安全机制，请使用 `@ApiSecurity()` 装饰器。

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，记得使用 `DocumentBuilder` 将安全定义添加到基础文档中：

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

一些最流行的身份验证技术是内置的（例如 `basic` 和 `bearer`），因此您无需像上面所示手动定义安全机制。

#### 基本认证

要启用基本认证，请使用 `@ApiBasicAuth()`。

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序前，记得使用 `DocumentBuilder` 将安全定义添加到基础文档中：

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

#### Bearer 认证

要启用承载身份验证，请使用 `@ApiBearerAuth()`。

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记得使用 `DocumentBuilder` 将安全定义添加到基础文档中：

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

#### OAuth2 身份验证

要启用 OAuth2，请使用 `@ApiOAuth2()`。

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，记得使用 `DocumentBuilder` 将安全定义添加到基础文档中：

```typescript
const options = new DocumentBuilder().addOAuth2();
```

#### Cookie 认证

要启用 Cookie 认证，请使用 `@ApiCookieAuth()`。

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，记得使用 `DocumentBuilder` 将安全定义添加到基础文档中：

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```