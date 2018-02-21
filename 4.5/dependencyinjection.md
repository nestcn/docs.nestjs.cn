# 依赖注入

有很多情况下, 当你想绑定的东西直接到 Nest 容器。您应该知道的是, Nest 是通过 tokens 来注入依赖关系的。通常, token 只是一种类型。如果要提供自定义组件, 则需要创建一个 token。通常, 自定义 token 是纯字符串。遵循最佳做法, 您应该将此 token 保存在分隔的文件中, 例如, constants.ts。

让我们来看看可用的选项:

## 使用 Value

```typescript
const connectionProvider = { provide: 'ConnectionToken', useValue: null };

@Module({
  components: [connectionProvider],
})
```

!> 将自定义提供程序保留在分离的文件中是一种很好的做法, 例如 cats.providers.ts。

用例：

- 将特定值绑定到容器，例如第三方库


## 使用工厂（Factory）

```typescript
const connectionFactory = {
  provide: 'ConnectionToken',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  components: [connectionFactory],
})
```
!> 如果你想使用模块中的组件，你必须将它们传递给inject数组。Nest会以相同顺序将实例作为函数的参数传递。

用例:

- 提供一个值, 必须使用其他组件 (或自定义包功能) 进行计算
- 提供待摊值, 例如数据库连接 (阅读有关[异步组件](/4.5/asynccomponents)的更多信息)


## 使用类（class）

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass: DevelopmentConfigService,
};

@Module({
  components: [configServiceProvider],
})
```

!> 们没有使用自定 义token ，而是使用了 ConfigService 类，因此实际上我们已经忽略了默认实现。

用例:

- 重写默认类的实现。

## 注入


要通过构造函数注入自定义组件，我们使用 `@Inject()` 装饰器。这个装饰器需要1个参数 - token 。

```typescript
@Component()
class CatsRepository {
  constructor(@Inject('ConnectionToken') connection: Connection) {}
}
```
!> @Inject() 装饰器从 @nestjs/common 包中导入。

