# 翻译说明

文档翻译工作会是难得的学习 Nest 的机会，也是大家认识朋友的一次机会。

## 后续维护计划

Nestcn 官方文档会持续更新，为了保证后续的修改能更新上，我们需要不定期检查更新，目前预计这个检查的周期会是一个月~三个月一次，到时候会从翻译团队中征集人手。

# 开始翻译

## 加入翻译，领取任务

申请地址： https://github.com/nestcn/docs/issues/1


以下是任务列表，会实时更新，请在此话题下留言领取任务，留言内容如：

```
我要认领翻译「基础-依赖注入」
```

?> 注意

```
1. 请仔细查看「任务列表」是否任务已被别人领走，请特别关注此话题的评论（有时候来不及更新），为了防止多余的劳动力浪费，只能领取未认领的任务；
2. 认领超过 5 天的未完成任务将会被回收，请量力而行。
3. 翻译请严格对照 [翻译说明](about.md)
4. 目前只翻译 Typescript 版

```

## 任务列表


- 概述
  - [控制器](4.5/controllers.md)
  - [组件](4.5/components.md)
  - [模块](4.5/modules.md)
  - [中间件](4.5/middlewares.md)
  - [异常过滤器](4.5/exceptionfilters.md)  
  - [管道](4.5/pipes.md)
  - [看守器](4.5/guards.md)
  - [拦截器](4.5/interceptors.md)
  - [自定义装饰器](4.5/customdecorators.md)

- 基础
  - [依赖注入](4.5/dependencyinjection.md)
  - [异步组件](4.5/asynccomponents.md)
  - [循环依赖](4.5/circulardependency.md)
  - [单元测试](4.5/unit.md)
  - [E2E 测试](4.5/e2e.md)

- WEBSOCKETS
  - [网关](4.5/gateways.md)
  - [异常过滤器](4.5/exceptionfilters2.md)
  - [管道](4.5/pipes2.md)
  - [看守器](4.5/guards2.md)
  - [拦截器](4.5/interceptors2.md)
  - [适配器](4.5/adapter.md)

- 微服务
  - [基本信息](4.5/basics.md)
  - [Redis](4.5/redis.md)
  - [异常过滤器](4.5/exceptionfilters3.md)
  - [管道](4.5/pipes3.md)
  - [看守器](4.5/guards3.md)
  - [拦截器](4.5/interceptors3.md)
  - [自定义传输](4.5/customtransport.md)

- 高级
  - [分层注入](4.5/hierarchicalinjector.md)
  - [类型混淆](4.5/mixinClass.md)

- 秘籍
  - [MongoDB (4.5/Mongoose)](4.5/mongodb.md)
  - [MongoDB E2E (4.5/Mockgoose)](4.5/mongodbe2e.md)
  - [SQL (4.5/Sequelize)](4.5/sqls.md)
  - [集成认证](4.5/passportintegration.md)
  - [CQRS](4.5/cors.md)
  - [OpenAPI (4.5/Swagger)](4.5/openapi.md)
  - [GraphQL](4.5/graphql.md)

- FAQ
  - [Express 实例](4.5/expressinstance.md)
  - [全局路由前缀](4.5/globalrouteprefix.md)
  - [生命周期事件](4.5/lifecycleevents.md)
  - [混合应用](4.5/hybridapplication.md)
  - [HTTPS 和 多服务](4.5/httpsmultipleservers.md)
  - [样例](4.5/examples.md)


- 支持
  - [更新日志](4.5/changelog.md)

原文文档： https://docs.nestjs.com/

?> 为了让认领者更加直观，以上只保留未认领文档。


# 翻译规范

## 规范

我们严格遵循 [中文排版指南](https://github.com/sparanoid/chinese-copywriting-guidelines) 规范，并在此之上遵守以下约定：

英文的左右 必须 保持一个空白，避免中英文字黏在一起；
必须 使用全角标点符号；
必须 严格遵循 Markdown 语法；
原文中的双引号（" "）请代换成中文的引号（「」符号怎么打出来见 [这里](https://www.zhihu.com/question/19755746/answer/27233392) )；
「加亮」和「加粗」和「[链接]()」都需要在左右保持一个空格；
代码注释统一要求翻译；

!> 翻译时请特别注意规范，如果你的翻译提交不遵循排版规范，我们会十分痛心的拒绝你的提交。

## 对照表

请必须严格按照「[专有名词翻译对照表](about.md)」来翻译

# 开始翻译

项目地址：https://github.com/notadd/docs


1. Fork 项目；
2. 在 https://raw.githubusercontent.com/nestcn/docs/master/4.5/_sidebar.md 找到对应的文件，请必须基于 同一个文件进行翻译；
3. 翻译完成后自己 Review 两遍；
4. 然后提交 PR。


# 翻译署名

翻译参与者对译文能行使署名权，就如画家在作品上签名。

以下 Markdown 代码会在每篇文档最底部出现：

头像限制于 100X100

```
### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://ww3.sinaimg.cn/large/0060lm7Tly1fl9dj5cl4nj30960aujrp.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://ww3.sinaimg.cn/large/0060lm7Tly1fl9dj5cl4nj30960aujrp.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
```