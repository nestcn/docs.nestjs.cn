/**
 * 修复文档中的死链 (Dead Links) 和 Shiki 错误 - 第五轮 (全面修复)
 */
const fs = require('fs');
const path = require('path');

const GLOBAL_RULES = [
    // 基础路径修复 - 使用更精确的 Markdown 链接匹配模式
    { from: /\]\(\/providers#dependency-injection\)/g, to: '](/overview/providers#dependency-injection)' },
    { from: /\]\(\/providers\)/g, to: '](/overview/providers)' },
    { from: /\]\(\/fundamentals\/injection-scopes\)/g, to: '](/fundamentals/provider-scopes)' },
    { from: /\]\(\/fundamentals\/injection-scopes#provider-scope\)/g, to: '](/fundamentals/provider-scopes#provider-scope)' },
    { from: /\]\(\/fundamentals\/custom-providers\)/g, to: '](/fundamentals/dependency-injection)' },
    { from: /\]\(\/fundamentals\/custom-providers#factory-providers-usefactory\)/g, to: '](/fundamentals/dependency-injection#factory-providers-usefactory)' },
    { from: /\]\(\/fundamentals\/custom-providers#di-fundamentals\)/g, to: '](/fundamentals/dependency-injection#di-fundamentals)' },
    { from: /\]\(\/fundamentals\/custom-providers#non-service-based-providers\)/g, to: '](/fundamentals/dependency-injection#non-service-based-providers)' },
    { from: /\]\(\/fundamentals\/custom-providers#non-class-based-provider-tokens\)/g, to: '](/fundamentals/dependency-injection#non-class-based-provider-tokens)' },
    { from: /\]\(\/fundamentals\/async-providers\)/g, to: '](/fundamentals/async-components)' },
    { from: /\]\(\/fundamentals\/module-ref\)/g, to: '](/fundamentals/module-reference)' },
    { from: /\]\(\/fundamentals\/module-ref#getting-current-sub-tree\)/g, to: '](/fundamentals/module-reference#getting-current-sub-tree)' },
    { from: /\]\(\/fundamentals\/module-ref#resolving-scoped-providers\)/g, to: '](/fundamentals/module-reference#resolving-scoped-providers)' },

    // GraphQL 路径修复
    { from: /\]\(\/graphql\/resolvers\)/g, to: '](/graphql/resolvers-map)' },
    { from: /\]\(\/graphql\/resolvers#module\)/g, to: '](/graphql/resolvers-map#module)' },
    { from: /\]\(\/graphql\/other-features#creating-a-custom-driver\)/g, to: '](/graphql/guards-interceptors#creating-a-custom-driver)' },
    { from: /\]\(\/graphql\/other-features\)/g, to: '](/graphql/guards-interceptors)' },

    // CLI 和技术路径修复
    { from: /\]\(\/cli\/monorepo\)/g, to: '](/cli/overview)' },
    { from: /\]\(\/cli\/monorepo#cli-properties\)/g, to: '](/cli/overview#cli-properties)' },
    { from: /\]\(\/cli\/monorepo#monorepo-mode\)/g, to: '](/cli/overview#monorepo-mode)' },
    { from: /\]\(\/cli\/monorepo#assets\)/g, to: '](/cli/overview#assets)' },
    { from: /\]\(\/techniques\/database\)/g, to: '](/techniques/sql)' },
    { from: /\]\(\/techniques\/database#sequelize-integration\)/g, to: '](/techniques/sql#sequelize-integration)' },
    { from: /\]\(\/techniques\/mongodb\)/g, to: '](/techniques/mongo)' },

    // 占位符和无效链接修复
    { from: /\]\(todo\)/g, to: '](https://docs.nestjs.com/deployment)' },
    { from: /\]\(\/_\)/g, to: '](https://docs.nestjs.com/techniques/events)' },

    // Terminus 这里的路径在 recipes 目录下
    { from: /\]\(cli\/overview\)/g, to: '](/cli/overview)' },
    { from: /\]\(fundamentals\/lifecycle-events#application-shutdown\)/g, to: '](/fundamentals/lifecycle-events#application-shutdown)' },
    { from: /\]\(techniques\/database#multiple-databases\)/g, to: '](/techniques/sql#multiple-databases)' },

    // GRPC 这里的路径在 microservices 目录下
    { from: /\]\(microservices\/grpc#subject-strategy\)/g, to: '](/microservices/grpc#subject-strategy)' },
    { from: /\]\(microservices\/grpc#call-stream-handler\)/g, to: '](/microservices/grpc#call-stream-handler)' },

    // Workspaces 这里的路径在 cli 目录下
    { from: /\]\(cli\/monorepo#assets\)/g, to: '](/cli/overview#assets)' },
    { from: /\]\(cli\/monorepo#cli-properties\)/g, to: '](/cli/overview#cli-properties)' },
];

function fixDocs() {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = getFiles(docsDir);
    let totalFixed = 0;

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        // 应用全局规则
        for (const rule of GLOBAL_RULES) {
            if (rule.from.test(content)) {
                content = content.replace(rule.from, rule.to);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(file, content);
            console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
            totalFixed++;
        }
    });

    console.log(`\n🎉 修复完成！共修改了 ${totalFixed} 个文件。`);
}

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else if (file.endsWith('.md')) {
            results.push(fullPath);
        }
    });
    return results;
}

fixDocs();
