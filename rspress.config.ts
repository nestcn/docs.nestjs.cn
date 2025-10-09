import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  // @ts-ignore
  publicDir: path.join(__dirname, 'public'),
  outDir: path.join(__dirname, 'doc_build'),
  builderConfig: {
    dev: {
      assetPrefix: '/',
    },
    output: {
      assetPrefix: '/',
      distPath: {
        root: path.join(__dirname, 'doc_build'),
      },
    }
  },
  title: 'NestJS 中文文档',
  description: 'NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的开发框架',
  icon: '/favicon.ico',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  markdown: {
    remarkPlugins: [
      remarkGfm
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeRaw
    ]
  },
  route: {
    cleanUrls: true,
  },
  head: [
    [
      'meta',
      {
        name: 'theme-color',
        content: '#ffffff',
      },
    ],
  ],
  themeConfig: {
    nav: [
      {
        text: '文档仓库',
        link: 'https://github.com/nestcn/docs.nestjs.cn',
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/nestjs/nest',
      },
    ],
    outlineTitle: '目录',
    lastUpdated: true,
    lastUpdatedText: '最后更新于',
    prevPageText: '上一页',
    nextPageText: '下一页',
    enableContentAnimation: true,
    sidebar: {
      '/': [
        {
          text: '开始',
          link: '/introduction'
        },
        {
          text: '概述',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '第一步', link: '/overview/first-steps' },
            { text: '控制器', link: '/overview/controllers' },
            { text: '提供者', link: '/overview/providers' },
            { text: '模块', link: '/overview/modules' },
            { text: '中间件', link: '/overview/middlewares' },
            { text: '异常过滤器', link: '/overview/exception-filters' },
            { text: '管道', link: '/overview/pipes' },
            { text: '守卫', link: '/overview/guards' },
            { text: '拦截器', link: '/overview/interceptors' },
            { text: '自定义装饰器', link: '/overview/custom-decorators' },
          ],
        },
        {
          text: '基础',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '依赖注入', link: '/fundamentals/dependency-injection' },
            { text: '动态模块', link: '/fundamentals/dynamic-modules' },
            { text: '异步组件', link: '/fundamentals/async-components' },
            { text: '循环依赖', link: '/fundamentals/circular-dependency' },
            { text: '模块引用', link: '/fundamentals/module-reference' },
            { text: '懒加载模块', link: '/fundamentals/lazy-loading-modules' },
            { text: '执行上下文', link: '/fundamentals/execution-context' },
            { text: '生命周期事件', link: '/fundamentals/lifecycle-events' },
            { text: '平台无关', link: '/fundamentals/platform-agnosticism' },
            { text: '单元测试', link: '/fundamentals/unit-testing' },
            { text: '注入作用域', link: '/fundamentals/provider-scopes' },
            { text: '发现服务', link: '/fundamentals/discovery-service' },
          ],
        },
        {
          text: '技术',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '配置', link: '/techniques/configuration' },
            { text: 'SQL', link: '/techniques/sql' },
            { text: 'Mongo', link: '/techniques/mongo' },
            { text: '验证', link: '/techniques/validation' },
            { text: '缓存', link: '/techniques/caching' },
            { text: '序列化', link: '/techniques/serialization' },
            { text: '任务调度', link: '/techniques/task-scheduling' },
            { text: '队列', link: '/techniques/queues' },
            { text: '日志', link: '/techniques/logger' },
            { text: 'Cookies', link: '/techniques/cookies' },
            { text: '压缩', link: '/techniques/compression' },
            { text: '文件上传', link: '/techniques/file-upload' },
            { text: '文件流', link: '/techniques/streaming-files' },
            { text: 'HTTP 模块', link: '/techniques/http-module' },
            { text: 'MVC', link: '/techniques/mvc' },
            { text: '性能', link: '/techniques/performance' },
            { text: 'SSE', link: '/techniques/server-sent-events' },
            { text: '事件', link: '/techniques/events' },
            { text: 'Session', link: '/techniques/sessions' },
            { text: '版本控制', link: '/techniques/versioning' },
          ],
        },
        {
          text: 'GraphQL',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '快速开始', link: '/graphql/quick-start' },
            { text: '解析器', link: '/graphql/resolvers-map' },
            { text: '类型映射', link: '/graphql/mapped-types' },
            { text: '插件', link: '/graphql/plugins' },
            { text: '指令', link: '/graphql/directives' },
            { text: '中间件', link: '/graphql/field-middleware' },
            { text: '联合与枚举', link: '/graphql/unions-and-enums' },
            { text: '接口', link: '/graphql/interfaces' },
            { text: '标量', link: '/graphql/scalars' },
            { text: '订阅', link: '/graphql/subscriptions' },
            { text: '复杂度', link: '/graphql/complexity' },
            { text: '联邦', link: '/graphql/federation' },
            { text: '扩展', link: '/graphql/extensions' },
            { text: 'CLI 插件', link: '/graphql/cli-plugin' },
          ],
        },
        {
          text: '微服务',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '基础', link: '/microservices/basics' },
            { text: '自定义传输', link: '/microservices/custom-transport' },
            { text: '异常过滤器', link: '/microservices/exception-filters' },
            { text: 'gRPC', link: '/microservices/grpc' },
            { text: '守卫', link: '/microservices/guards' },
            { text: '拦截器', link: '/microservices/interceptors' },
            { text: 'Kafka', link: '/microservices/kafka' },
            { text: 'MQTT', link: '/microservices/mqtt' },
            { text: 'NATS', link: '/microservices/nats' },
            { text: '管道', link: '/microservices/pipes' },
            { text: 'RabbitMQ', link: '/microservices/rabbitmq' },
            { text: 'Redis', link: '/microservices/redis' },
          ],
        },
        {
          text: 'WebSocket',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '网关', link: '/websockets/gateways' },
            { text: '守卫', link: '/websockets/guards' },
            { text: '管道', link: '/websockets/pipes' },
            { text: '拦截器', link: '/websockets/interceptors' },
            { text: '异常过滤器', link: '/websockets/exception-filters' },
            { text: '适配器', link: '/websockets/adapter' },
          ],
        },
        {
          text: '部署',
          link: '/deployment'
        },
        {
          text: '独立应用程序',
          link: '/standalone-applications'
        },
        {
          text: 'OpenAPI',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '介绍', link: '/openapi/introduction' },
            { text: '装饰器', link: '/openapi/decorators' },
            { text: '类型映射', link: '/openapi/mapped-types' },
            { text: '操作', link: '/openapi/operations' },
            { text: '其他特性', link: '/openapi/other-features' },
            { text: '安全', link: '/openapi/security' },
            { text: '类型与参数', link: '/openapi/types-and-parameters' },
            { text: 'CLI 插件', link: '/openapi/cli-plugin' },
          ],
        },
        {
          text: 'CLI',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '概述', link: '/cli/overview' },
            { text: '库', link: '/cli/libraries' },
            { text: '脚本', link: '/cli/scripts' },
            { text: '用法', link: '/cli/usages' },
            { text: '工作区', link: '/cli/workspaces' },
          ],
        },
        {
          text: '实用食谱',
          collapsible: true,
          collapsed: true,
          items: [
            { text: 'AsyncLocalStorage', link: '/recipes/async-local-storage' },
            { text: 'CQRS', link: '/recipes/cqrs' },
            { text: 'CRUD 生成器', link: '/recipes/crud-generator' },
            { text: '文档', link: '/recipes/documentation' },
            { text: '热重载', link: '/recipes/hot-reload' },
            { text: 'MikroORM', link: '/recipes/mikroorm' },
            { text: 'MongoDB', link: '/recipes/mongodb' },
            { text: 'Necord', link: '/recipes/necord' },
            { text: 'Commander', link: '/recipes/nest-commander' },
            { text: 'Passport', link: '/recipes/passport' },
            { text: 'Prisma', link: '/recipes/prisma' },
            { text: 'REPL', link: '/recipes/repl' },
            { text: '路由模块', link: '/recipes/router-module' },
            { text: 'Sentry', link: '/recipes/sentry' },
            { text: '静态资源', link: '/recipes/serve-static' },
            { text: 'Sequelize', link: '/recipes/sql-sequelize' },
            { text: 'TypeORM', link: '/recipes/sql-typeorm' },
            { text: 'Suites (Automock)', link: '/recipes/suites' },
            { text: 'SWC', link: '/recipes/swc' },
            { text: '健康检查', link: '/recipes/terminus' },
          ],
        },
        {
          text: '常见问题',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '错误', link: '/faq/errors' },
            { text: '全局前缀', link: '/faq/global-prefix' },
            { text: 'HTTP 适配器', link: '/faq/http-adapter' },
            { text: '混合应用', link: '/faq/hybrid-application' },
            { text: '长连接', link: '/faq/keep-alive-connections' },
            { text: '多服务器', link: '/faq/multiple-servers' },
            { text: '原始请求体', link: '/faq/raw-body' },
            { text: '请求生命周期', link: '/faq/request-lifecycle' },
            { text: 'Serverless', link: '/faq/serverless' },
          ],
        },
        {
          text: '安全',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '认证', link: '/security/authentication' },
            { text: '授权', link: '/security/authorization' },
            { text: 'CORS', link: '/security/cors' },
            { text: 'CSRF', link: '/security/csrf' },
            { text: '加密与哈希', link: '/security/encryption-hashing' },
            { text: 'Helmet', link: '/security/helmet' },
            { text: '速率限制', link: '/security/rate-limiting' },
          ],
        },
        {
          text: '开发工具',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '概述', link: '/devtools/overview' },
            { text: 'CI/CD', link: '/devtools/ci-cd' },
          ],
        },
        {
          text: '迁移指南',
          link: '/migration-guide'
        },
        {
          text: '生态与案例',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '谁在用', link: '/discover/who-uses' },
            { text: '精彩资源', link: '/awesome' },
          ],
        },
        {
          text: '支持',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '支持', link: '/support/index' },
          ],
        },
        {
          text: '社区',
          collapsible: true,
          collapsed: true,
          items: [
            { text: '贡献者', link: '/contributors' },
          ],
        },
      ],
    },
  },
  mediumZoom: {
    selector: '.rspress-doc img',
  },
  globalStyles: path.join(__dirname, 'styles/styles.css')
});
