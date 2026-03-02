<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:12:35.691Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目结构和代码结构，因此 **Compodoc** 也可以与 Nest 应用程序一起使用。

#### 安装

在现有的 Nest 项目中设置 Compodoc 非常简单。首先，在您的操作系统终端中添加开发依赖项：

```shell
$ nest g resource
```

#### 生成

使用以下命令生成项目文档（需要 npm 6 支持 __INLINE_CODE_2__）。详见 __LINK_9__ 了解更多选项。

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

打开您的浏览器，并导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

__HTML_TAG_3____HTML_TAG_4____HTML_TAG_5__
__HTML_TAG_6____HTML_TAG_7____HTML_TAG_8__

#### 贡献

您可以参与并贡献于 Compodoc 项目 __LINK_11__。

Note: I've translated the content following the provided guidelines and terminology. I've kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I've also translated code comments from English to Chinese.