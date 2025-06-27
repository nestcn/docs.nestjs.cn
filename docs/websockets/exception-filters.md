### 异常过滤器

HTTP [异常过滤器](/exception-filters)层与对应的 WebSocket 层唯一区别在于：不应抛出 `HttpException`，而应使用 `WsException`。

```typescript
throw new WsException('Invalid credentials.');
```

> info **提示** `WsException` 类需从 `@nestjs/websockets` 包导入。

基于上述示例，Nest 将处理抛出的异常并以如下结构发出 `exception` 消息：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

#### 过滤器

WebSocket 异常过滤器的行为与 HTTP 异常过滤器完全等效。以下示例使用了手动实例化的方法作用域过滤器。与基于 HTTP 的应用相同，您也可以使用网关作用域过滤器（即在网关类前添加 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```

#### 继承

通常，您会创建完全定制的异常过滤器来满足应用程序需求。但是，在某些情况下，您可能希望简单地扩展**核心异常过滤器**，并基于某些因素覆盖行为。

为了将异常处理委托给基础过滤器，您需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

上述实现只是演示该方法的一个外壳。您的扩展异常过滤器实现将包括您定制的**业务逻辑**（例如，处理各种条件）。

    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      event: 'exception',
      data: {
        ...details,
        originalData: data,
      },
    };

    // 发送错误消息给客户端
    client.emit('exception', errorResponse);
    
    // 记录错误
    console.error(`[WS Exception] 客户端 ${client.id}:`, errorResponse);
  }
}
```

#### 全局异常过滤器

处理所有类型的异常：

```typescript
import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch() // 捕获所有异常
export class GlobalWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    
    let errorResponse: any;

    if (exception instanceof WsException) {
      errorResponse = this.handleWsException(exception);
    } else if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception);
    } else if (exception instanceof Error) {
      errorResponse = this.handleGenericError(exception);
    } else {
      errorResponse = this.handleUnknownException(exception);
    }

    // 添加通用字段
    errorResponse.timestamp = new Date().toISOString();
    errorResponse.clientId = client.id;

    // 发送错误响应
    client.emit('error', errorResponse);
    
    // 记录错误
    this.logError(client.id, exception, errorResponse);
  }

  private handleWsException(exception: WsException) {
    const error = exception.getError();
    return {
      type: 'ws_exception',
      status: 'error',
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? error : undefined,
    };
  }

  private handleHttpException(exception: HttpException) {
    return {
      type: 'http_exception',
      status: 'error',
      statusCode: exception.getStatus(),
      message: exception.message,
      details: exception.getResponse(),
    };
  }

  private handleGenericError(exception: Error) {
    return {
      type: 'generic_error',
      status: 'error',
      message: exception.message,
      stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
    };
  }

  private handleUnknownException(exception: unknown) {
    return {
      type: 'unknown_exception',
      status: 'error',
      message: '发生未知错误',
      details: process.env.NODE_ENV === 'development' ? exception : undefined,
    };
  }

  private logError(clientId: string, exception: unknown, response: any) {
    console.error(`[WS Global Exception] 客户端 ${clientId}:`, {
      exception: exception instanceof Error ? exception.message : exception,
      response,
      stack: exception instanceof Error ? exception.stack : undefined,
    });
  }
}
```

#### 验证异常过滤器

专门处理验证错误：

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export class ValidationException extends WsException {
  constructor(public validationErrors: any[]) {
    super('Validation failed');
  }
}

@Catch(ValidationException)
export class WsValidationExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    
    const errorResponse = {
      status: 'validation_error',
      message: '数据验证失败',
      timestamp: new Date().toISOString(),
      errors: this.formatValidationErrors(exception.validationErrors),
    };

    client.emit('validation_error', errorResponse);
    
    console.warn(`[WS Validation] 客户端 ${client.id} 验证失败:`, errorResponse.errors);
  }

  private formatValidationErrors(errors: any[]): any[] {
    return errors.map(error => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
    }));
  }
}
```

#### 业务异常过滤器

处理特定的业务逻辑异常：

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export class BusinessException extends WsException {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
  }
}

@Catch(BusinessException)
export class WsBusinessExceptionFilter {
  catch(exception: BusinessException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    
    const errorResponse = {
      status: 'business_error',
      code: exception.code,
      message: exception.message,
      statusCode: exception.statusCode,
      timestamp: new Date().toISOString(),
      suggestions: this.getSuggestions(exception.code),
    };

    client.emit('business_error', errorResponse);
    
    console.info(`[WS Business] 客户端 ${client.id} 业务异常 [${exception.code}]: ${exception.message}`);
  }

  private getSuggestions(code: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      'INSUFFICIENT_BALANCE': ['请充值后重试', '检查账户余额'],
      'UNAUTHORIZED_ACCESS': ['请先登录', '检查访问权限'],
      'RESOURCE_NOT_FOUND': ['确认资源是否存在', '检查访问路径'],
      'RATE_LIMIT_EXCEEDED': ['请降低请求频率', '稍后重试'],
    };

    return suggestionMap[code] || ['请联系客服'];
  }
}
```

#### 连接异常过滤器

处理连接相关的异常：

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export class ConnectionException extends WsException {
  constructor(
    message: string,
    public shouldDisconnect: boolean = false,
  ) {
    super(message);
  }
}

@Catch(ConnectionException)
export class WsConnectionExceptionFilter {
  catch(exception: ConnectionException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    
    const errorResponse = {
      status: 'connection_error',
      message: exception.message,
      timestamp: new Date().toISOString(),
      reconnect: !exception.shouldDisconnect,
    };

    if (exception.shouldDisconnect) {
      // 发送错误消息后断开连接
      client.emit('connection_error', errorResponse);
      setTimeout(() => {
        client.disconnect(true);
      }, 100);
      
      console.warn(`[WS Connection] 强制断开客户端 ${client.id}: ${exception.message}`);
    } else {
      client.emit('connection_error', errorResponse);
      console.warn(`[WS Connection] 客户端 ${client.id} 连接异常: ${exception.message}`);
    }
  }
}
```

#### 异常统计过滤器

收集和统计异常信息：

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface ExceptionStats {
  count: number;
  lastOccurrence: Date;
  clients: Set<string>;
}

@Catch()
export class WsExceptionStatsFilter {
  private stats = new Map<string, ExceptionStats>();
  private readonly maxStatsEntries = 1000;

  catch(exception: unknown, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    const exceptionType = this.getExceptionType(exception);
    
    // 更新统计信息
    this.updateStats(exceptionType, client.id);
    
    // 生成错误响应
    const errorResponse = {
      status: 'error',
      type: exceptionType,
      message: this.getExceptionMessage(exception),
      timestamp: new Date().toISOString(),
      frequency: this.getExceptionFrequency(exceptionType),
    };

    client.emit('error', errorResponse);
    
    // 如果某种异常频率过高，记录警告
    const stats = this.stats.get(exceptionType);
    if (stats && stats.count > 100) {
      console.warn(`[WS Exception Stats] 高频异常 ${exceptionType}: ${stats.count} 次, 影响 ${stats.clients.size} 个客户端`);
    }
  }

  private getExceptionType(exception: unknown): string {
    if (exception instanceof WsException) return 'WsException';
    if (exception instanceof Error) return exception.constructor.name;
    return 'UnknownException';
  }

  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof WsException) {
      const error = exception.getError();
      return typeof error === 'string' ? error : error.message || 'WebSocket异常';
    }
    if (exception instanceof Error) return exception.message;
    return '未知异常';
  }

  private updateStats(exceptionType: string, clientId: string): void {
    if (!this.stats.has(exceptionType)) {
      this.stats.set(exceptionType, {
        count: 0,
        lastOccurrence: new Date(),
        clients: new Set(),
      });
    }

    const stats = this.stats.get(exceptionType);
    stats.count++;
    stats.lastOccurrence = new Date();
    stats.clients.add(clientId);

    // 限制统计条目数量
    if (this.stats.size > this.maxStatsEntries) {
      const oldestEntry = Array.from(this.stats.entries())
        .sort(([,a], [,b]) => a.lastOccurrence.getTime() - b.lastOccurrence.getTime())[0];
      this.stats.delete(oldestEntry[0]);
    }
  }

  private getExceptionFrequency(exceptionType: string): string {
    const stats = this.stats.get(exceptionType);
    if (!stats) return 'low';
    
    if (stats.count > 100) return 'high';
    if (stats.count > 10) return 'medium';
    return 'low';
  }

  // 获取异常统计
  getStats(): Map<string, ExceptionStats> {
    return new Map(this.stats);
  }

  // 重置统计
  resetStats(): void {
    this.stats.clear();
  }
}
```

#### 继承

通常，您会创建完全自定义的异常过滤器来满足应用程序需求。但在某些情况下，您可能希望直接扩展**核心异常过滤器** ，并根据特定因素覆盖其行为。

为了将异常处理委托给基础过滤器，您需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
@@filename()
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 添加自定义逻辑
    const client = host.switchToWs().getClient();
    console.log(`[WS Exception] 客户端 ${client.id} 发生异常:`, exception);
    
    // 调用基础过滤器
    super.catch(exception, host);
  }
}
```

#### 组合使用异常过滤器

在网关中组合使用多个异常过滤器：

```typescript
@WebSocketGateway()
@UseFilters(
  new WsValidationExceptionFilter(),
  new WsBusinessExceptionFilter(),
  new WsConnectionExceptionFilter(),
  new GlobalWsExceptionFilter(),
)
export class SecureGateway {
  
  @SubscribeMessage('risky-operation')
  async handleRiskyOperation(@MessageBody() data: any) {
    // 可能抛出各种异常的操作
    if (!data.userId) {
      throw new ValidationException([
        { property: 'userId', constraints: { isNotEmpty: 'userId不能为空' } }
      ]);
    }
    
    if (data.amount > 1000) {
      throw new BusinessException('INSUFFICIENT_BALANCE', '余额不足');
    }
    
    if (Math.random() > 0.8) {
      throw new ConnectionException('网络不稳定', false);
    }
    
    return { success: true, data };
  }
}
```

#### 全局异常过滤器配置

设置全局 WebSocket 异常过滤器：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalWsExceptionFilter } from './filters/global-ws-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 设置全局 WebSocket 异常过滤器
  app.useGlobalFilters(new GlobalWsExceptionFilter());
  
  await app.listen(3000);
}
bootstrap();
```

上述实现仅是一个展示方法的框架。您对扩展异常过滤器的实现将包含您定制的**业务逻辑** （例如处理各种条件）。

通过这些异常过滤器，您可以为 WebSocket 应用提供全面的错误处理、统计和监控功能。