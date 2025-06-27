### 管道

常规管道与 WebSocket 管道之间没有本质区别。唯一的区别在于，你应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例没有意义）。

> info **提示** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定管道

以下示例使用了一个手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，你也可以使用网关作用域管道（即在网关类前添加 `@UsePipes()` 装饰器）。

```typescript
@@filename()
### 管道

常规管道与 WebSocket 管道之间没有本质区别。唯一的区别在于，你应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例没有意义）。

> info **提示** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定管道

以下示例使用了一个手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，你也可以使用网关作用域管道（即在网关类前添加 `@UsePipes()` 装饰器）。

```typescript
@@filename()
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

#### 验证管道

创建专用的 WebSocket 验证管道：

```typescript
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class WsValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints).join(', ')
      ).join('; ');
      
      throw new WsException({
        status: 'validation_error',
        message: '数据验证失败',
        errors: errorMessages,
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}
```

#### 数据传输对象（DTO）

定义 WebSocket 消息的 DTO：

```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsEnum(['text', 'image', 'file'])
  type: string;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class UserStatusDto {
  @IsEnum(['online', 'offline', 'away', 'busy'])
  status: string;

  @IsString()
  @IsOptional()
  message?: string;
}

// 使用示例
@WebSocketGateway()
export class ChatGateway {
  @UsePipes(new WsValidationPipe())
  @SubscribeMessage('send-message')
  handleMessage(@MessageBody() messageDto: ChatMessageDto) {
    // messageDto 已经被验证和转换
    return {
      status: 'success',
      message: `收到消息: ${messageDto.message}`,
    };
  }

  @UsePipes(new WsValidationPipe())
  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() joinRoomDto: JoinRoomDto) {
    // 验证房间ID和密码
    return {
      status: 'success',
      room: joinRoomDto.roomId,
    };
  }
}
```

#### 转换管道

创建数据转换管道：

```typescript
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new WsException(`${value} 不是一个有效的数字`);
    }
    return val;
  }
}

@Injectable()
export class WsParseObjectPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new WsException('无效的 JSON 格式');
      }
    }
    return value;
  }
}

// 使用示例
@SubscribeMessage('update-score')
handleUpdateScore(
  @MessageBody(new WsParseIntPipe()) score: number,
  @ConnectedSocket() client: Socket,
) {
  return { newScore: score, clientId: client.id };
}
```

#### 消息格式标准化管道

确保消息格式的一致性：

```typescript
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export interface StandardMessage {
  action: string;
  payload: any;
  timestamp?: number;
  id?: string;
}

@Injectable()
export class WsMessageStandardizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): StandardMessage {
    // 如果已经是标准格式，直接返回
    if (this.isStandardMessage(value)) {
      return {
        ...value,
        timestamp: value.timestamp || Date.now(),
        id: value.id || this.generateId(),
      };
    }

    // 尝试转换为标准格式
    if (typeof value === 'string') {
      return {
        action: 'text_message',
        payload: { text: value },
        timestamp: Date.now(),
        id: this.generateId(),
      };
    }

    if (value && typeof value === 'object') {
      return {
        action: value.type || 'generic_message',
        payload: value,
        timestamp: Date.now(),
        id: this.generateId(),
      };
    }

    throw new WsException('无法解析消息格式');
  }

  private isStandardMessage(value: any): boolean {
    return value && 
           typeof value === 'object' && 
           typeof value.action === 'string' && 
           value.payload !== undefined;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### 清理和过滤管道

清理输入数据，防止恶意内容：

```typescript
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsSanitizationPipe implements PipeTransform {
  private readonly bannedWords = ['spam', 'abuse', 'harmful'];
  private readonly maxLength = 1000;

  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (value && typeof value === 'object') {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(str: string): string {
    // 检查长度
    if (str.length > this.maxLength) {
      throw new WsException(`消息长度不能超过 ${this.maxLength} 字符`);
    }

    // 过滤敏感词
    let sanitized = str;
    this.bannedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      sanitized = sanitized.replace(regex, '*'.repeat(word.length));
    });

    // 移除潜在的 HTML 标签
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // 去除首尾空格
    return sanitized.trim();
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
```

#### 组合管道

将多个管道组合使用：

```typescript
@WebSocketGateway()
export class SecureChatGateway {
  
  @UsePipes(
    new WsMessageStandardizationPipe(),
    new WsSanitizationPipe(),
    new WsValidationPipe(),
  )
  @SubscribeMessage('secure-message')
  handleSecureMessage(@MessageBody() message: StandardMessage) {
    // 消息已经过标准化、清理和验证
    return {
      status: 'processed',
      messageId: message.id,
      processedAt: new Date(),
    };
  }

  @UsePipes(new WsSanitizationPipe(), new WsValidationPipe())
  @SubscribeMessage('user-input')
  handleUserInput(@MessageBody() data: ChatMessageDto) {
    return { received: data };
  }
}
```

#### 条件管道

根据条件应用不同的管道：

```typescript
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class WsConditionalPipe implements PipeTransform {
  constructor(
    private condition: (value: any) => boolean,
    private truePipe: PipeTransform,
    private falsePipe?: PipeTransform,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (this.condition(value)) {
      return this.truePipe.transform(value, metadata);
    } else if (this.falsePipe) {
      return this.falsePipe.transform(value, metadata);
    }
    return value;
  }
}

// 使用示例
@SubscribeMessage('flexible-message')
@UsePipes(
  new WsConditionalPipe(
    (value) => typeof value === 'string',
    new WsSanitizationPipe(),
    new WsValidationPipe(),
  )
)
handleFlexibleMessage(@MessageBody() data: any) {
  return { processed: data };
}
```

#### 全局 WebSocket 管道

设置全局 WebSocket 管道：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsValidationPipe } from './pipes/ws-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 设置全局 WebSocket 管道
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(new WsValidationPipe());
  
  await app.listen(3000);
}
bootstrap();
```

#### 错误处理最佳实践

在管道中正确处理错误：

```typescript
@Injectable()
export class WsRobustValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // 执行验证逻辑
      return await this.validateAndTransform(value, metadata);
    } catch (error) {
      // 记录错误
      console.error('WebSocket 管道验证失败:', error);
      
      // 返回友好的错误消息
      throw new WsException({
        status: 'validation_error',
        message: '数据格式不正确',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async validateAndTransform(value: any, metadata: ArgumentMetadata) {
    // 实际的验证和转换逻辑
    return value;
  }
}
```

通过这些管道，你可以确保 WebSocket 消息的数据完整性、安全性和格式一致性。
```
