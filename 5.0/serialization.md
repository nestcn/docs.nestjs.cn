## 序列化（Serialization）

在发送实际响应之前， Serializers 为数据操作提供了干净的抽象层。例如，应始终从最终响应中排除敏感数据（如用户密码）。此外，某些属性可能需要额外的转换，比方说，我们不想发送整个数据库实体。相反，我们只想选择 id 和 name 。其余部分应自动剥离。不幸的是，手动映射所有实体可能会带来很多麻烦。
> 译者注: Serialization 实现可类比 composer 库中 fractal ，响应给用户的数据不仅仅要剔除设计安全的属性，还需要剔除一些无用字段如 create_time, delete_time, update_time 和其他属性。在JAVA的实体类中定义N个属性的话就会返回N个字段，解决方法可以使用范型编程，否则操作实体类回影响数据库映射字段。

### 概要
为了提供一种直接的方式来执行这些操作， Nest 附带了这个 ClassSerializerInterceptor 类。它使用类转换器来提供转换对象的声明性和可扩展方式。基于此类基础下，可以从类转换器ClassSerializerInterceptor中获取方法和调用 classToPlain() 函数返回的值。

### 排除属性
让我们假设一下，如何从一个含有多属性的实体中剔除 password 属性？

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```
然后，直接在控制器的方法中调用就能获得此类 UserEntity 的实例。

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password',
  });
}
```
> 提示: @SerializeOptions()装饰器来源于 @nestjs/common 包。
现在当你调用此服务时，将收到以下响应结果：

```json
{
  "id": 1,
  "firstName": "Kamil",
  "lastName": "Mysliwiec"
}
```

### 公开属性
如果要暴露早期预先计算的属性，只需使用 @Expose() 装饰器即可。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```
> 您可以使用@Transform()装饰器执行其他数据转换。例如，您要选择一个名称 RoleEntity 而不是返回整个对象。

```typescript
@Transform(role => role.name)
role: RoleEntity;
```

### 通过属性
可变选项可能因某些因素而异。要覆盖默认设置，请使用 @SerializeOptions() 装饰器。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return {};
}	
```

> 提示: @SerializeOptions() 装饰器来源于 @nestjs/common 包。

这些属性将作为 classToPlain() 函数的第二个参数传递。

### Websockets和微服务
无论使用哪种传输介质，所有的使用指南都包括了 WebSockets 和微服务。

### 更多
想了解有关装饰器选项的更多信息，请访问此[页面](https://github.com/typestack/class-transformer)。