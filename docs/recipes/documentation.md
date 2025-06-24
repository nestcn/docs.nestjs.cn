### 文档

**Compodoc** 是一款专为 Angular 应用设计的文档工具。由于 Nest 和 Angular 具有相似的项目与代码结构，**Compodoc** 同样适用于 Nest 应用程序。

#### 安装配置

在现有 Nest 项目中配置 Compodoc 非常简单。首先通过操作系统终端运行以下命令添加开发依赖：

```bash
$ npm i -D @compodoc/compodoc
```

#### 生成

使用以下命令生成项目文档（需要 npm 6 以支持 `npx`）。更多选项请参阅 [官方文档](https://compodoc.app/guides/usage.html) 。

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s
```

打开浏览器并访问 [http://localhost:8080](http://localhost:8080)，您将看到一个初始的 Nest CLI 项目：

![](/assets/documentation-compodoc-1.jpg)

![](/assets/documentation-compodoc-2.jpg)

#### 贡献

您可以参与并贡献到 Compodoc 项目[这里](https://github.com/compodoc/compodoc) 。