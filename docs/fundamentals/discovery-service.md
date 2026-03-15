<!-- 此文件从 content/fundamentals/discovery-service.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:58:13.846Z -->
<!-- 源文件: content/fundamentals/discovery-service.md -->

### 发现服务

__INLINE_CODE_7__ 提供的 __INLINE_CODE_8__ 包中的实体是一个强大的实用工具，允许开发者动态地检查和检索提供者、控制器和其他元数据，以便在 NestJS 应用程序中进行实时检查。特别是在构建插件、装饰器或高级功能时，这将非常有用。通过使用 __INLINE_CODE_9__，开发者可以创建更灵活和模块化的架构，使其能够自动化和动态地在应用程序中进行行为。

#### 入门

在使用 __INLINE_CODE_10__ 之前，您需要在要使用它的模块中导入 __INLINE_CODE_11__。这样可以确保服务可供依赖注入使用。以下是一个在 NestJS 模块中配置它的示例：

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```

一旦模块设置好了，__INLINE_CODE_12__ 就可以被注入到任何需要动态发现的地方。

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

```

#### 发现提供者和控制器

__INLINE_CODE_13__ 的一个主要功能是检索应用程序中所有注册的提供者。这对于动态处理提供者非常有用。以下是一个检索所有提供者的示例：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}

```

每个提供者对象都包含了实例、令牌和元数据的信息。类似地，如果您需要检索应用程序中所有注册的控制器，可以使用：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

这个特性特别有用，因为在需要动态处理控制器时，例如分析跟踪或自动注册机制。

#### 提取元数据

除了发现提供者和控制器外，__INLINE_CODE_14__ 还可以检索附加到这些组件的元数据。这在工作中自定义装饰器时非常有用，因为这些装饰器可以在运行时存储元数据。

例如，考虑一下使用自定义装饰器将提供者标记为特定的元数据：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

将这个装饰器应用于服务，使其可以存储可以后续查询的元数据：

```typescript
@Module({
  imports: [DogsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})

```

一旦元数据附加到提供者，这使得 __INLINE_CODE_15__ 可以轻松地根据分配的元数据过滤提供者。以下是一个检索已标记为特定元数据值的提供者的示例：

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}

```

#### 结论

__INLINE_CODE_16__ 是一个灵活和强大的工具，允许在 NestJS 应用程序中进行实时检查。通过允许动态发现提供者、控制器和元数据，它在构建可扩展的框架、插件和自动化驱动的特性时扮演着至关重要的角色。无论您需要扫描和处理提供者、提取元数据以便高级处理还是创建模块化和可扩展的架构，__INLINE_CODE_17__ 都提供了一个高效和结构化的方法来实现这些目标。