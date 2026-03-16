<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:01:31.452Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> 提示 **Hint** 这一章节只适用于 HTTP 基于的应用程序。

在 HTTP 应用程序（例如 REST API）中，handler 的路由路径是通过将控制器的可选前缀（在 `@Controller` 装饰器内）和方法的装饰器指定的路径（例如 `@Get('users')`）相拼接确定的。你可以在 [this section](/controllers#路由) 中学习更多关于这方面的知识。此外，你还可以为所有在应用程序中注册的路由定义一个 [global prefix](/faq/global-prefix)，或者启用 [versioning](/techniques/versioning)。

此外，在定义前缀时，有些边缘情况可能会很有用。例如，在一个 REST 应用程序中，有多个不同的端点被特定的应用程序部分（称为“Dashboard”）使用。在这种情况下，你可以使用一个utility `RouterModule` 模块，而不是在每个控制器中重复 `/dashboard` 前缀，例如：

```

```typescript
@Module({
  imports: [
    DashboardModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}

```

```

此外，你还可以定义层次结构。这意味着每个模块都可以有 `children` 模块。子模块将继承其父模块的前缀。以下示例中，我们将注册 `AdminModule` 作为 `DashboardModule` 和 `MetricsModule` 的父模块。

```

```typescript
@Module({
  imports: [
    AdminModule,
    DashboardModule,
    MetricsModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'dashboard',
            module: DashboardModule,
          },
          {
            path: 'metrics',
            module: MetricsModule,
          },
        ],
      },
    ])
  ],
});

```

```

> 提示 **Hint** 这个特性应该非常小心使用，因为过度使用它可能会使代码难以维护。

在上面的示例中，任何注册在 `DashboardModule` 中的控制器都将有一个额外的 `/admin/dashboard` 前缀（因为模块从上到下、父到子递归地将路径拼接）。类似地，每个在 `MetricsModule` 中定义的控制器都将有一个额外的模块级前缀 `/admin/metrics`。