/**
 * 修复文档中的死链 (Dead Links) 和 Shiki 错误 - 第五轮 (全面修复)
 */
const fs = require('fs');
const path = require('path');

const GLOBAL_RULES = [
    // 基础路径修复
    { from: '(/providers#dependency-injection)', to: '(/overview/providers#dependency-injection)' },
    { from: '(/providers)', to: '(/overview/providers)' },
    { from: '(/fundamentals/injection-scopes)', to: '(/fundamentals/provider-scopes)' },
    { from: '(/fundamentals/injection-scopes#provider-scope)', to: '(/fundamentals/provider-scopes#provider-scope)' },
    { from: '(/fundamentals/custom-providers)', to: '(/fundamentals/dependency-injection)' },
    { from: '(/fundamentals/custom-providers#factory-providers-usefactory)', to: '(/fundamentals/dependency-injection#factory-providers-usefactory)' },
    { from: '(/fundamentals/custom-providers#di-fundamentals)', to: '(/fundamentals/dependency-injection#di-fundamentals)' },
    { from: '(/fundamentals/custom-providers#non-service-based-providers)', to: '(/fundamentals/dependency-injection#non-service-based-providers)' },
    { from: '(/fundamentals/custom-providers#non-class-based-provider-tokens)', to: '(/fundamentals/dependency-injection#non-class-based-provider-tokens)' },
    { from: '(/fundamentals/async-providers)', to: '(/fundamentals/async-components)' },
    { from: '(/fundamentals/module-ref)', to: '(/fundamentals/module-reference)' },
    { from: '(/fundamentals/module-ref#getting-current-sub-tree)', to: '(/fundamentals/module-reference#getting-current-sub-tree)' },
    { from: '(/fundamentals/module-ref#resolving-scoped-providers)', to: '(/fundamentals/module-reference#resolving-scoped-providers)' },

    // GraphQL 路径修复
    { from: '(/graphql/resolvers)', to: '(/graphql/resolvers-map)' },
    { from: '(/graphql/resolvers#module)', to: '(/graphql/resolvers-map#module)' },
    { from: '(/graphql/other-features#creating-a-custom-driver)', to: '(/graphql/guards-interceptors#creating-a-custom-driver)' },
    { from: '(/graphql/other-features)', to: '(/graphql/guards-interceptors)' },

    // CLI 和技术路径修复
    { from: '(/cli/monorepo)', to: '(/cli/overview)' },
    { from: '(/cli/monorepo#cli-properties)', to: '(/cli/overview#cli-properties)' },
    { from: '(/cli/monorepo#monorepo-mode)', to: '(/cli/overview#monorepo-mode)' },
    { from: '(/cli/monorepo#assets)', to: '(/cli/overview#assets)' },
    { from: '(/techniques/database)', to: '(/techniques/sql)' },
    { from: '(/techniques/database#sequelize-integration)', to: '(/techniques/sql#sequelize-integration)' },
    { from: '(/techniques/mongodb)', to: '(/techniques/mongo)' },

    // 占位符和无效链接修复
    { from: '(todo)', to: '(https://docs.nestjs.com/deployment)' },
    { from: '(/_)', to: '(https://docs.nestjs.com/techniques/events)' },

    // Terminus 这里的路径在 recipes 目录下
    { from: '](cli/overview)', to: '](/cli/overview)' },
    { from: '](fundamentals/lifecycle-events#application-shutdown)', to: '](/fundamentals/lifecycle-events#application-shutdown)' },
    { from: '](techniques/database#multiple-databases)', to: '](/techniques/sql#multiple-databases)' },

    // GRPC 这里的路径在 microservices 目录下
    { from: '](microservices/grpc#subject-strategy)', to: '](/microservices/grpc#subject-strategy)' },
    { from: '](microservices/grpc#call-stream-handler)', to: '](/microservices/grpc#call-stream-handler)' },

    // Workspaces 这里的路径在 cli 目录下
    { from: '](cli/monorepo#assets)', to: '](/cli/overview#assets)' },
    { from: '](cli/monorepo#cli-properties)', to: '](/cli/overview#cli-properties)' },
];

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fixDocs() {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = getFiles(docsDir);
    let totalFixed = 0;

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        // 特殊处理 CSRF Shiki 错误
        if (file.endsWith('csrf.md')) {
            if (content.includes('``` should')) {
                content = content.replace('``` should', '```');
                changed = true;
            }
        }

        // 应用全局规则
        for (const rule of GLOBAL_RULES) {
            if (content.includes(rule.from)) {
                content = content.replace(new RegExp(escapeRegExp(rule.from), 'g'), rule.to);
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
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.md')) {
            results.push(file);
        }
    });
    return results;
}

fixDocs();
