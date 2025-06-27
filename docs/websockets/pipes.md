### 管道

常规[管道](/pipes)与 WebSocket 管道之间没有本质区别。唯一的区别在于，你应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例没有意义）。

> info **提示** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定管道

以下示例使用了一个手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，你也可以使用网关作用域管道（即在网关类前添加 `@UsePipes()` 装饰器）。

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

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

#### 内置管道

WebSocket 应用中可以使用所有内置管道，包括：

- `ValidationPipe` - 验证管道
- `ParseIntPipe` - 整数解析管道
- `ParseFloatPipe` - 浮点数解析管道
- `ParseBoolPipe` - 布尔值解析管道
- `ParseArrayPipe` - 数组解析管道
- `ParseUUIDPipe` - UUID 解析管道
- `ParseEnumPipe` - 枚举解析管道
- `DefaultValuePipe` - 默认值管道
- `ParseFilePipe` - 文件解析管道
- `ParseDatePipe` - 日期解析管道

#### 数据转换

使用转换管道来处理传入的数据：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new WsException('Validation failed');
    }
    return val;
  }
}
```

将此管道绑定到消息处理器：

```typescript
@SubscribeMessage('getUserById')
async findOne(@MessageBody('id', ParseIntPipe) id: number) {
  return this.userService.findOne(id);
}
```

#### 数据验证

使用验证管道来确保传入数据的有效性：

```typescript
import { IsString, IsInt, IsPositive } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsInt()
  @IsPositive()
  age: number;

  @IsString()
  email: string;
}
```

在网关中使用验证管道：

```typescript
@WebSocketGateway()
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
export class ChatGateway {
  @SubscribeMessage('createUser')
  async createUser(@MessageBody() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

#### 自定义验证管道

创建专门的 WebSocket 验证管道：

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
      );
      throw new WsException(`Validation failed: ${errorMessages.join('; ')}`);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

#### 方法级管道

你可以在特定的消息处理器上使用管道：

```typescript
@SubscribeMessage('message')
@UsePipes(new WsValidationPipe())
handleMessage(@MessageBody() data: MessageDto): WsResponse<unknown> {
  return { event: 'message', data: this.processMessage(data) };
}
```

#### 网关级管道

在整个网关上应用管道：

```typescript
@WebSocketGateway()
@UsePipes(new ValidationPipe({ 
  exceptionFactory: (errors) => new WsException(errors),
  transform: true 
}))
export class ChatGateway {
  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() joinRoomDto: JoinRoomDto) {
    // 数据将被自动验证和转换
    return this.chatService.joinRoom(joinRoomDto);
  }

  @SubscribeMessage('sendMessage')
  sendMessage(@MessageBody() messageDto: MessageDto) {
    // 数据将被自动验证和转换
    return this.chatService.sendMessage(messageDto);
  }
}
```

#### 错误处理

WebSocket 管道中的错误处理：

```typescript
@Injectable()
export class SafeValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // 执行验证逻辑
      return await this.validate(value, metadata);
    } catch (error) {
      // 将 HTTP 异常转换为 WebSocket 异常
      if (error instanceof HttpException) {
        throw new WsException(error.message);
      }
      throw new WsException('Validation failed');
    }
  }

  private async validate(value: any, metadata: ArgumentMetadata) {
    // 验证逻辑
    return value;
  }
}
```

#### 全局管道

虽然可以设置全局管道，但需要注意它们对 WebSocket 的影响：

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注意：全局管道对 WebSocket 的影响
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      // 检查当前上下文是否为 WebSocket
      return new WsException(errors);
    }
  }));
  
  await app.listen(3000);
}
```

> warning **注意** 在混合应用中，`useGlobalPipes()` 方法不会为网关和微服务设置管道。对于"标准"（非混合）微服务应用，`useGlobalPipes()` 会全局挂载管道。

#### 最佳实践

1. **异常处理**：始终使用 `WsException` 而不是 `HttpException`
2. **数据验证**：使用 `class-validator` 进行 DTO 验证
3. **转换**：使用 `class-transformer` 进行数据转换
4. **错误消息**：提供清晰的错误消息给客户端
5. **性能考虑**：避免在高频消息处理中使用复杂的验证逻辑

#### 实际应用示例

以下是一个完整的聊天应用示例：

```typescript
// dto/chat.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file'
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

// chat.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UsePipes(new ValidationPipe({ 
  exceptionFactory: (errors) => new WsException(errors),
  transform: true,
  whitelist: true 
}))
export class ChatGateway {
  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() joinRoomDto: JoinRoomDto) {
    // 数据已经被验证和转换
    return this.chatService.joinRoom(joinRoomDto);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() messageDto: SendMessageDto) {
    // 数据已经被验证和转换
    return this.chatService.sendMessage(messageDto);
  }

  @SubscribeMessage('uploadFile')
  @UsePipes(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
      new FileTypeValidator({ fileType: /\.(jpg|jpeg|png|gif)$/i })
    ],
    exceptionFactory: (error) => new WsException(error)
  }))
  async uploadFile(@MessageBody() file: Express.Multer.File) {
    return this.chatService.uploadFile(file);
  }
}
```

这个示例展示了如何在 WebSocket 应用中使用各种管道来确保数据的有效性和安全性。
