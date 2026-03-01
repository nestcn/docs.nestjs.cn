<!-- 此文件从 content/recipes/documentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:20:44.442Z -->
<!-- 源文件: content/recipes/documentation.md -->

### 文档

**Compodoc** 是 Angular 应用程序的文档工具。由于 Nest 和 Angular 共享相似的项目结构和代码结构，**Compodoc** 也可以与 Nest 应用程序一起工作。

#### 设置

在现有的 Nest 项目中设置 Compodoc 非常简单。首先，在操作系统终端中添加开发依赖项，使用以下命令：

```bash
```shell
$ nest g resource
```

#### 生成

使用以下命令生成项目文档（npm 6 是必需的，以便支持 __INLINE_CODE_2__）。查看 __LINK_9__ 获取更多选项。

```bash
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

打开浏览器，导航到 __LINK_10__。您应该看到一个初始的 Nest CLI 项目：

```html
__HTML_TAG_3__ __HTML_TAG_4__ __HTML_TAG_5__
__HTML_TAG_6__ __HTML_TAG_7__ __HTML_TAG_8__
```

#### 贡献

您可以参与 Compodoc 项目的贡献 __LINK_11__。