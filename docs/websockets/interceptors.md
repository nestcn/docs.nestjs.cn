### 拦截器

常规拦截器与 WebSocket 拦截器之间并无区别。以下示例使用手动实例化的方法作用域拦截器。与基于 HTTP 的应用相同，您也可以使用网关作用域拦截器（即在网关类前添加 `@UseInterceptors()` 装饰器）。

```typescript
@@filename()
### 拦截器

常规拦截器与 WebSocket 拦截器之间并无区别。以下示例使用手动实例化的方法作用域拦截器。与基于 HTTP 的应用相同，您也可以使用网关作用域拦截器（即在网关类前添加 `@UseInterceptors()` 装饰器）。

```typescript
@@filename()
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

#### 日志拦截器

记录 WebSocket 消息的详细信息：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Socket } from 'socket.io';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToWs();
    const client: Socket = ctx.getClient();
    const data = ctx.getData();
    const handler = context.getHandler().name;

    const startTime = Date.now();
    
    console.log(`[WS] 收到消息 - 处理器: ${handler}, 客户端: ${client.id}, 数据:`, data);

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        console.log(`[WS] 消息处理完成 - 处理器: ${handler}, 耗时: ${duration}ms, 响应:`, response);
      }),
    );
  }
}
```

#### 转换拦截器

转换 WebSocket 响应格式：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WsResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  messageId: string;
}

@Injectable()
export class WsTransformInterceptor<T> implements NestInterceptor<T, WsResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<WsResponse<T>> {
    const ctx = context.switchToWs();
    const client = ctx.getClient();

    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        messageId: this.generateMessageId(client.id),
      })),
    );
  }

  private generateMessageId(clientId: string): string {
    return `${clientId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### 错误处理拦截器

统一处理 WebSocket 错误：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        const ctx = context.switchToWs();
        const client = ctx.getClient();
        
        console.error(`[WS Error] 客户端 ${client.id} 处理失败:`, error);

        // 转换为 WebSocket 异常
        if (!(error instanceof WsException)) {
          const wsError = new WsException({
            status: 'error',
            message: '服务器内部错误',
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          });
          
          return throwError(() => wsError);
        }

        return throwError(() => error);
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### 缓存拦截器

为 WebSocket 响应提供缓存功能：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class WsCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();
  private readonly ttl = 60000; // 1 分钟缓存

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToWs();
    const data = ctx.getData();
    const handler = context.getHandler().name;
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(handler, data);
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && this.isNotExpired(cached.timestamp)) {
      console.log(`[WS Cache] 缓存命中: ${cacheKey}`);
      return of(cached.data);
    }

    return next.handle().pipe(
      tap(response => {
        // 缓存响应
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
        
        // 清理过期缓存
        this.cleanExpiredCache();
        
        console.log(`[WS Cache] 缓存设置: ${cacheKey}`);
      }),
    );
  }

  private generateCacheKey(handler: string, data: any): string {
    const dataStr = JSON.stringify(data);
    return `${handler}_${Buffer.from(dataStr).toString('base64').substr(0, 20)}`;
  }

  private isNotExpired(timestamp: number): boolean {
    return Date.now() - timestamp < this.ttl;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
```

#### 性能监控拦截器

监控 WebSocket 消息处理性能：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class WsPerformanceInterceptor implements NestInterceptor {
  private readonly performanceMetrics = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
  }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler().name;
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒

        this.updateMetrics(handler, duration);
        
        // 如果处理时间过长，记录警告
        if (duration > 1000) {
          console.warn(`[WS Performance] 慢处理器 ${handler}: ${duration.toFixed(2)}ms`);
        }
      }),
    );
  }

  private updateMetrics(handler: string, duration: number): void {
    if (!this.performanceMetrics.has(handler)) {
      this.performanceMetrics.set(handler, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
      });
    }

    const metrics = this.performanceMetrics.get(handler);
    metrics.count++;
    metrics.totalTime += duration;
    metrics.avgTime = metrics.totalTime / metrics.count;
    metrics.maxTime = Math.max(metrics.maxTime, duration);
    metrics.minTime = Math.min(metrics.minTime, duration);

    // 每 100 次调用输出一次统计
    if (metrics.count % 100 === 0) {
      console.log(`[WS Performance] ${handler} 统计:`, {
        调用次数: metrics.count,
        平均耗时: `${metrics.avgTime.toFixed(2)}ms`,
        最大耗时: `${metrics.maxTime.toFixed(2)}ms`,
        最小耗时: `${metrics.minTime.toFixed(2)}ms`,
      });
    }
  }

  // 获取性能统计
  getMetrics(): Map<string, any> {
    return new Map(this.performanceMetrics);
  }
}
```

#### 速率限制拦截器

控制消息处理频率：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsRateLimitInterceptor implements NestInterceptor {
  private readonly clientRequests = new Map<string, number[]>();
  private readonly maxRequests = 30; // 每分钟最大请求数
  private readonly windowMs = 60 * 1000; // 1 分钟窗口

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToWs();
    const client = ctx.getClient();
    const clientId = client.id;
    const now = Date.now();

    if (!this.clientRequests.has(clientId)) {
      this.clientRequests.set(clientId, []);
    }

    const requests = this.clientRequests.get(clientId);
    
    // 清理过期的请求记录
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    this.clientRequests.set(clientId, validRequests);

    // 检查是否超过限制
    if (validRequests.length >= this.maxRequests) {
      throw new WsException({
        status: 'rate_limit_exceeded',
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((validRequests[0] + this.windowMs - now) / 1000),
      });
    }

    // 记录当前请求
    validRequests.push(now);

    return next.handle();
  }
}
```

#### 用户活动跟踪拦截器

跟踪用户活动：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserActivity {
  userId: string;
  clientId: string;
  action: string;
  timestamp: Date;
  data?: any;
}

@Injectable()
export class WsActivityTrackingInterceptor implements NestInterceptor {
  private readonly activities: UserActivity[] = [];
  private readonly maxActivities = 1000; // 最大保存的活动记录数

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToWs();
    const client = ctx.getClient();
    const data = ctx.getData();
    const action = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        const activity: UserActivity = {
          userId: client.data?.user?.id || 'anonymous',
          clientId: client.id,
          action,
          timestamp: new Date(),
          data: this.sanitizeData(data),
        };

        this.addActivity(activity);
      }),
    );
  }

  private addActivity(activity: UserActivity): void {
    this.activities.push(activity);
    
    // 保持活动记录在限制范围内
    if (this.activities.length > this.maxActivities) {
      this.activities.shift();
    }

    console.log(`[WS Activity] ${activity.userId} 执行了 ${activity.action}`);
  }

  private sanitizeData(data: any): any {
    // 移除敏感信息
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.secret;
      return sanitized;
    }
    return data;
  }

  // 获取用户活动记录
  getUserActivities(userId: string, limit = 50): UserActivity[] {
    return this.activities
      .filter(activity => activity.userId === userId)
      .slice(-limit);
  }

  // 获取最近活动
  getRecentActivities(limit = 100): UserActivity[] {
    return this.activities.slice(-limit);
  }
}
```

#### 组合拦截器使用

在网关中组合使用多个拦截器：

```typescript
@WebSocketGateway()
@UseInterceptors(
  WsLoggingInterceptor,
  WsErrorInterceptor,
  WsPerformanceInterceptor,
  WsActivityTrackingInterceptor,
)
export class EnhancedGateway {
  
  @UseInterceptors(WsTransformInterceptor)
  @SubscribeMessage('standard-message')
  handleStandardMessage(@MessageBody() data: any) {
    return { processed: data, timestamp: new Date() };
  }

  @UseInterceptors(WsCacheInterceptor)
  @SubscribeMessage('cached-data')
  handleCachedData(@MessageBody() query: any) {
    // 这个方法的结果会被缓存
    return this.expensiveOperation(query);
  }

  @UseInterceptors(WsRateLimitInterceptor)
  @SubscribeMessage('limited-action')
  handleLimitedAction(@MessageBody() data: any) {
    return { action: 'completed', data };
  }

  private expensiveOperation(query: any) {
    // 模拟耗时操作
    return { result: `处理查询: ${JSON.stringify(query)}`, cost: 'expensive' };
  }
}
```

#### 全局拦截器配置

设置全局 WebSocket 拦截器：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: WsLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: WsErrorInterceptor,
    },
  ],
})
export class AppModule {}
```

通过这些拦截器，你可以为 WebSocket 应用添加全面的日志记录、性能监控、错误处理、缓存和活动跟踪功能。
```