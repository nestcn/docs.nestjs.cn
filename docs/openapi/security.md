<!-- 此文件从 content/openapi/security.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:42:36.435Z -->
<!-- 源文件: content/openapi/security.md -->

### 安全性

要为特定的操作定义安全机制，请使用 @Security decorator。

```typescript
// 代码示例

```

在运行应用程序之前，别忘记将安全定义添加到基本文档中：

```typescript
// 代码示例

```

一些最常用的身份验证技术内置（例如 Basic Auth 和 JWT），因此你不需要手动定义安全机制，如上所示。

#### 基本身份验证

要启用基本身份验证，请使用 `basicAuth()`。

```typescript
// 代码示例

```

在运行应用程序之前，别忘记将安全定义添加到基本文档中：

```typescript
// 代码示例

```

#### 令牌身份验证

要启用令牌身份验证，请使用 `bearerAuth()`。

```typescript
// 代码示例

```

在运行应用程序之前，别忘记将安全定义添加到基本文档中：

```typescript
// 代码示例

```

#### OAuth2 身份验证

要启用 OAuth2，请使用 `oauth2Auth()`。

```typescript
// 代码示例

```

在运行应用程序之前，别忘记将安全定义添加到基本文档中：

```typescript
// 代码示例

```

#### Cookie 身份验证

要启用 Cookie 身份验证，请使用 `cookieAuth()`。

```typescript
// 代码示例

```

在运行应用程序之前，别忘记将安全定义添加到基本文档中：

```typescript
// 代码示例

```