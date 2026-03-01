<!-- 此文件从 content/security/encryption-hashing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:18:29.260Z -->
<!-- 源文件: content/security/encryption-hashing.md -->

### 加密和哈希

**加密**是将信息进行编码的过程。这个过程将信息的原始表示形式，即明文，转换为另一种形式，称为密文。理想情况下，只有授权的方可以将密文还原为明文，访问原始信息。加密本身不能防止干扰，但可以防止某个潜在的拦截器访问信息的内容。加密是一个双向函数；可以使用正确的密钥对加密的内容进行解密。

**哈希**是将给定的密钥转换为另一种值的过程。哈希函数根据数学算法生成新的值。哈希完成后，通常不可能从输出值回去到输入值。

#### 加密

Node.js 提供了一个名为 __LINK_12__ 的内置模块，可以用来加密和解密字符串、数字、缓冲区、流等内容。Nest 本身不提供额外的包来避免引入不必要的抽象。

例如，让我们使用 AES (Advanced Encryption System) __INLINE_CODE_6__ 算法的 CTR 加密模式。

```bash
$ npm install --save typeorm mysql2
```

现在，来解密 `DatabaseModule` 值：

```typescript
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'test',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
```

#### 哈希

对于哈希，我们建议使用 __LINK_13__ 或 __LINK_14__ 包。Nest 本身不提供额外的包来避免引入不必要的抽象（使学习曲线变得短）。

例如，让我们使用 `@nestjs/typeorm` 对随机密码进行哈希。

首先，安装所需的包：

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

安装完成后，您可以使用 `new DataSource().initialize()` 函数，例如：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```

要生成salt，使用 `typeorm` 函数：

```typescript
import { DataSource } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PHOTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Photo),
    inject: ['DATA_SOURCE'],
  },
];
```

要比较/检查密码，使用 `initialize()` 函数：

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PHOTO_REPOSITORY')
    private photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }
}
```

可以阅读关于可用的函数的更多信息 __LINK_15__。

Note: I have followed the provided glossary and translation requirements to translate the text. I have also kept the code examples and variable names unchanged, and maintained the Markdown formatting and links as they were in the original text.