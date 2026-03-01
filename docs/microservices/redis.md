<!-- 此文件从 content/microservices/redis.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:22:50.206Z -->
<!-- 源文件: content/microservices/redis.md -->

### Redis

__LINK_113__ 提供者实现了发布/订阅消息传递模式，并利用了 Redis 的 __LINK_114__ 功能。发布的消息被分类到通道中，且不知道哪些订阅者（如果存在）将最终接收该消息。每个微服务都可以订阅任意数量的通道。同时，一条消息也可以被多个订阅者同时订阅。

__HTML_TAG_50____HTML_TAG_51____HTML_TAG_52__

#### 安装

要开始构建基于 Redis 的微服务，首先安装所需的包：

```typescript
throw new RpcException('Invalid credentials.');
```

#### 概述

要使用 Redis 提供者，传递以下选项对象给 `@UseFilters()` 方法：

```json
{
  "status": "error",
  "message": "Invalid credentials."
}
```

> info **提示** `BaseExceptionFilter` 枚举来自 `catch()` 包。

#### 选项

__INLINE_CODE_15__ 属性特定于所选提供者。__HTML_TAG_53__ Redis __HTML_TAG_54__ 提供者暴露以下属性。

__HTML_TAG_55__
  __HTML_TAG_56__
    __HTML_TAG_57____HTML_TAG_58__host__HTML_TAG_59____HTML_TAG_60__
    __HTML_TAG_61__连接 URL__HTML_TAG_62__
  __HTML_TAG_63__
  __HTML_TAG_64__
    __HTML_TAG_65____HTML_TAG_66__port__HTML_TAG_67____HTML_TAG_68__
    __HTML_TAG_69__连接端口__HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73____HTML_TAG_74__retryAttempts__HTML_TAG_75____HTML_TAG_76__
    __HTML_TAG_77__重试消息次数（默认：__HTML_TAG_78__0__HTML_TAG_79__）__HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83____HTML_TAG_84__retryDelay__HTML_TAG_85____HTML_TAG_86__
    __HTML_TAG_87__消息重试尝试之间的延迟（毫秒）（默认：__HTML_TAG_88__0__HTML_TAG_89__）__HTML_TAG_90__
  __HTML_TAG_91__
   __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__wildcards__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97__启用 Redis 通配符订阅， instructing 提供者使用 __HTML_TAG_98__psubscribe__HTML_TAG_99__/__HTML_TAG_100__pmessage__HTML_TAG_101__。 (默认：__HTML_TAG_102__false__HTML_TAG_103__).__HTML_TAG_104__
  __HTML_TAG_105__
__HTML_TAG_106__

所有由官方 __LINK_115__ 客户端支持的属性都支持该提供者。

#### 客户端

像其他微服务提供者一样，您有 __HTML_TAG_107__several options__HTML_TAG_108__ 创建 Redis __INLINE_CODE_16__ 实例。

创建实例的一个方法是使用 __INLINE_CODE_17__. 创建一个客户端实例，并使用 __INLINE_CODE_18__ 方法将选项对象传递给 `@UseFilters()` 方法，并将 __INLINE_CODE_21__ 属性用作注入令牌。了解更多关于 __INLINE_CODE_22__ __HTML_TAG_109__ here__HTML_TAG_110__。

```typescript
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception.getError());
  }
}

@Catch(RpcException)
export class ExceptionFilter {
  catch(exception, host) {
    return throwError(() => exception.getError());
  }
}
```

其他创建客户端的选项（如 __INLINE_CODE_23__ 或 __INLINE_CODE_24__）也可以使用。了解更多关于它们 __HTML_TAG