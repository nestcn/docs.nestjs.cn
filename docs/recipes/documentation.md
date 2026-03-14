<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:25:57.262Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文件文档

**Compodoc** 是 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目结构和代码结构，**Compodoc** 也可以与 Nest 应用程序一起使用。

#### 设置

在现有的 Nest 项目中设置 Compodoc 十分简单。首先，在操作系统终端中使用以下命令添加 dev 依赖项：

```

```bash
$ npm install necord discord.js

```

```

#### 生成

使用以下命令生成项目文档（npm 6 是为了支持 __INLINE_CODE_2__）。更多选项请查看 __LINK_9__。

```

```typescript
import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { AppService } from './app.service';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      intents: [IntentsBitField.Flags.Guilds],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}

```

```

打开浏览器，导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

```

__HTML_TAG_3____HTML_TAG_4____HTML_TAG_5__
__HTML_TAG_6____HTML_TAG_7____HTML_TAG_8__

```

#### 贡献

您可以参与 Compodoc 项目的贡献 __LINK_11__。

Note:

* The translation follows the provided glossary and terminology.
* Code examples, variable names, function names, and Markdown formatting are preserved unchanged.
* Code comments are translated from English to Chinese.
* Placeholders like __CODE_BLOCK_N__, __INLINE_CODE_N__, __LINK_N__, __HTML_TAG_N__ are kept exactly as they are in the source text.
* Relative links and internal anchors are preserved unchanged.