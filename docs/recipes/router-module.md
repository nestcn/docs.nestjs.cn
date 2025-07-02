### 路由模块

> info **注意** 本章节仅适用于基于 HTTP 的应用程序。

在 HTTP 应用（如 REST API）中，处理程序的路由路径由控制器（在 `@Controller` 装饰器内）声明的（可选）前缀与方法装饰器（例如 `@Get('users')`）中指定的任何路径拼接而成。您可以在[本节](/overview/controllers#路由)了解更多相关信息。此外，您可以为应用中注册的所有路由定义[全局前缀](/faq/global-prefix) ，或启用[版本控制](/techniques/versioning) 。

此外，在某些边缘情况下，在模块级别定义前缀（从而应用于该模块内注册的所有控制器）会非常有用。例如，假设一个 REST 应用暴露了多个不同端点，这些端点被应用中名为"Dashboard"的特定部分使用。这种情况下，您可以使用工具模块 `RouterModule` 来避免在每个控制器中重复 `/dashboard` 前缀，如下所示：

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

> info **提示** `RouterModule` 类是从 `@nestjs/core` 包中导出的。

此外，您可以定义层级结构。这意味着每个模块都可以拥有 `children` 子模块。子模块将继承其父模块的前缀。在以下示例中，我们将把 `AdminModule` 注册为 `DashboardModule` 和 `MetricsModule` 的父模块。

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

> info **提示** 此功能应谨慎使用，过度使用可能导致代码难以长期维护。

在上例中，任何在 `DashboardModule` 内注册的控制器都将拥有额外的 `/admin/dashboard` 前缀（因为模块会递归地从父级到子级自顶向下拼接路径）。同样地，在 `MetricsModule` 内定义的每个控制器都将拥有额外的模块级前缀 `/admin/metrics`。
