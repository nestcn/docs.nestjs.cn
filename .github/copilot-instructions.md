# Copilot 工作指令
    * 对于内部内容跳转，请将"docs.nestjs.com" 和 "docs.nestjs.cn" 改为使用相对路径，并需要并修正该真实路径，   例如 `./guide/introduction`。
    * 对于含有 "#" 的链接，如果后面是英文，请寻找对应的中文翻译链接。
    * 锚点链接修正：确保所有内部锚点链接指向正确的中文章节标题，常见映射包括：
      - `#provider-scope` → `#提供者作用域`
      - `#library-specific-approach` → `#库特定方法`
      - `#binding-guards` → `#绑定守卫`
      - `#declarative-cron-jobs` → `#声明式-cron-任务`
      - `#dependency-injection` → `#依赖注入`
      等等。
## 核心规则
1.  **运行环境**: 所有脚本和命令优先使用 `bun` 运行。
2.  **命令兼容性**: 在生成终端命令时，请注意 Windows 环境下不支持使用 `&&` 连接多个命令。应提供分步命令或使用兼容的替代方案。
3.  **翻译内容**:
    *  以 `ccontent`（原文）为基准，仔细校对 `docs` 目录下的中文翻译内容，确保其准确、流畅。
    *  删除所有 `@@switch` JavaScript 代码块部分。
    *  比如 @@filename(rspress.config.ts)   参考 rspress 语法更改为 ：  ts title="rspress.config.ts"
    * 适当保留中文本地化改进。
    * 代码块中的 // 注释应当翻译。
    * awesome.md 和 index.md的 “docs.nestjs.com” 不要替换为 “docs.nestjs.cn”。
    * 网站的最终链接地址为 `https://docs.nestjs.cn`。
    * 对于内部内容跳转，请将“docs.nestjs.com” 和 “docs.nestjs.cn” 改为使用相对路径，并需要并修正该真实路径，   例如 `./guide/introduction`。
4. **内容完整性**: 严格按照原文进行校对，不要添加任何未经请求的额外内容或个人解释。
5.  **文档处理**: 
        * 使用脚本需要防止文件乱码。
        *content 目录下的文件不需要处理。
6.  **文档内容**: `first-steps.md` 的 node 国内下载优化部分保留。 对 `awesome.md` 内容不做处理。