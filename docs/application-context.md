<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:57:47.361Z -->
<!-- 源文件: content/application-context.md -->

### standalone 应用程序

有多种方式可以将 Nest 应用程序挂载。您可以创建一个 web 应用程序、一个微服务或者一个没有网络监听器的简单 Nest standalone 应用程序（不含任何网络监听器）。Nest standalone 应用程序是一个 Nest IoC 容器的包装，它持有所有实例化的类。我们可以从任何导入的模块中直接使用 standalone 应用程序对象来获得对任何已存在实例的引用。因此，您可以在任何地方使用 Nest 框架，包括例如脚本 Cron 作业。您甚至可以基于它构建一个 CLI。

#### 入门

要创建一个 Nest standalone 应用程序，使用以下构造：

```

```bash
> $ npm install -g @nestjs/mau
> $ mau deploy
> ```

```

#### 从静态模块获取提供者

standalone 应用程序对象允许您获取对 Nest 应用程序中注册的任何实例的引用。让我们假设我们在 __INLINE_CODE_6__ 模块中有一个 __INLINE_CODE_7__ 提供者，该模块由我们的 __INLINE_CODE_8__ 模块导入，该类提供了一组方法，我们想要从 CRON 作业中调用这些方法。

```

```bash
$ npm run build

```

```

要访问 __INLINE_CODE_9__ 实例，我们使用 `dist` 方法。`nest build` 方法像一个查询，搜索注册的每个模块中的实例。您可以将任何提供者的令牌传递给它。或者，在严格上下文检查模式下，传递一个 options 对象，其中包含 `npm run build my-app` 属性。使用该选项，您需要通过特定的模块来获取特定的实例，从选择的上下文中。

```

```bash
$ NODE_ENV=production node dist/main.js

```

```

以下是从 standalone 应用程序对象中获取实例引用方法的总结。

```html
__HTML_TAG_17__
  __HTML_TAG_18__
    __HTML_TAG_19__
      __HTML_TAG_20__get()__HTML_TAG_21__
    __HTML_TAG_22__
    __HTML_TAG_23__
      Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.
    __HTML_TAG_24__
  __HTML_TAG_25__
  __HTML_TAG_26__
    __HTML_TAG_27__
      __HTML_TAG_28__select()__HTML_TAG_29__
    __HTML_TAG_30__
    __HTML_TAG_31__
      Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).
    __HTML_TAG_32__
  __HTML_TAG_33__
__HTML_TAG_34__

```

> info **Hint** 在非严格模式下，root 模块将被选择默认。要选择任何其他模块，您需要手动导航模块图形，步骤步骤。

请注意，standalone 应用程序没有网络监听器，因此任何与 HTTP 相关的 Nest 功能（例如中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，然后使用 `dist` 方法获取控制器的实例，拦截器将不会被执行。

#### 从动态模块获取提供者

在处理 __LINK_35__ 时，我们应该提供与应用程序中注册的动态模块相同的对象到 `main.js`。例如：

```

```bash
$ node dist/main.js # Adjust this based on your entry point location

```

```

然后，您可以选择该模块：

```

```bash
# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]

```

```

#### 终止阶段

如果您想在脚本完成后让 Node 应用程序关闭（例如，在脚本中运行 Cron 作业），您必须在您的 `tsconfig.json` 函数末尾调用 `.ts` 方法，如下所示：

```

```bash
node_modules
dist
*.log
*.md
.git

```

```

正如在 __LINK_36__ 章节中所述，这将触发生命周期钩子。

#### 示例

可用的工作示例可以在 __LINK_37__ 中找到。