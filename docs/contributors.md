# 贡献者

感谢所有为 NestJS 中文文档项目做出贡献的开发者们！你们的努力让更多中文开发者能够更好地学习和使用 NestJS。

## 如何贡献

我们欢迎各种形式的贡献：

- 📝 **翻译改进**：修正翻译错误，提升表达质量
- 🐛 **错误修复**：发现并修复文档中的错误
- ✨ **内容完善**：添加示例代码、补充说明等
- 🎨 **界面优化**：改进文档网站的用户体验

## 贡献指南

### 开始之前

在提交贡献之前，请确保：

1. **搜索现有问题**：查看 [GitHub Issues](https://github.com/nestcn/docs.nestjs.cn/issues) 是否已有相关讨论
2. **了解项目结构**：熟悉文档的组织方式和文件结构
3. **遵循规范**：确保你的贡献符合项目的编码和文档规范

### 提交步骤

1. **Fork 本仓库**
   ```bash
   # 在 GitHub 上点击 Fork 按钮
   git clone https://github.com/YOUR_USERNAME/docs.nestjs.cn.git
   cd docs.nestjs.cn
   ```

2. **创建特性分支**
   ```bash
   git checkout -b feature/amazing-feature
   # 或者
   git checkout -b fix/some-bug
   ```

3. **进行你的修改**
   - 📝 翻译新内容或改进现有翻译
   - 🐛 修复文档中的错误
   - ✨ 添加示例代码或补充说明
   - 🎨 改进文档的格式和样式

4. **测试你的修改**
   ```bash
   npm install
   npm run dev
   ```
   在浏览器中查看你的修改效果

5. **提交你的修改**
   ```bash
   git add .
   git commit -m "feat: add some amazing feature"
   # 或者
   git commit -m "fix: correct translation error"
   ```

6. **推送到你的分支**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **创建 Pull Request**
   - 访问你的 Fork 仓库页面
   - 点击 "New Pull Request" 按钮
   - 填写详细的 PR 描述

### 提交消息规范

我们使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

**类型包括：**
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档修改
- `style`: 代码格式修改
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```bash
feat(awesome): add new learning resources section
fix(contributors): correct community link
docs(readme): update installation instructions
```

### 翻译指南

#### 术语一致性

请参考我们的 [术语表](https://github.com/nestcn/docs.nestjs.cn/wiki/术语表) 确保翻译的一致性：

| 英文 | 中文 | 说明 |
|------|------|------|
| Controller | 控制器 | 不翻译为"控制器类" |
| Provider | 提供者 | 不翻译为"提供商" |
| Module | 模块 | - |
| Service | 服务 | - |
| Decorator | 装饰器 | - |
| Middleware | 中间件 | - |
| Guard | 守卫 | 不翻译为"守护" |
| Interceptor | 拦截器 | - |
| Pipe | 管道 | - |
| Exception Filter | 异常过滤器 | - |

#### 翻译原则

1. **准确性**：确保翻译内容与原文意思一致
2. **流畅性**：使用自然的中文表达方式
3. **专业性**：保持技术术语的准确性
4. **一致性**：在整个项目中使用统一的术语

#### 代码示例

- 保留所有英文代码和注释
- 仅翻译代码注释中的说明文字
- 变量名和函数名保持英文

### 文档结构

```
docs/
├── overview/          # 概览
├── fundamentals/      # 基础概念
├── techniques/        # 技术指南
├── security/         # 安全
├── microservices/    # 微服务
├── graphql/          # GraphQL
├── websockets/       # WebSockets
├── cli/              # CLI
├── recipes/          # 使用指南
├── faq/              # 常见问题
└── ...
```

## 社区交流

我们建立了多个交流群，欢迎所有对 NestJS 感兴趣的开发者加入：

### QQ 群

- **二群**：1031015552（禁止广告）
- **三群**：321735506（禁止广告）

### Telegram 群

[点击加入 TG 群](https://t.me/+TCn0z6Z0wwKA_IFD)

### 微信群

微信三群：

<img src="https://ghproxy.net/https://raw.githubusercontent.com/zuohuadong/imgbed/main/pic/siqun.jpg" alt="加微信" width="260" height="260" />

如果二维码过期，请添加：

<img src="https://ghproxy.net/https://raw.githubusercontent.com/zuohuadong/imgbed/main/pic/68747470733a2f2f7069632e646f776e6b2e63632f6974656d2f3566386336633334316364316262623836623732666339612e6a7067.jpg" alt="微信联系人" width="200" />

微信一二群，目前只接受开源项目作者、NestJS 文档贡献者、捐赠者。

## 项目贡献者

<!-- readme: collaborators,contributors -start -->
<table>
<tr>
    <td align="center">
        <a href="https://github.com/zuohuadong">
            <img src="https://avatars.githubusercontent.com/u/11203929?v=4" width="100;" alt="zuohuadong"/>
            <br />
            <sub><b>zuohuadong</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/renovate-bot">
            <img src="https://avatars.githubusercontent.com/u/25180681?v=4" width="100;" alt="renovate-bot"/>
            <br />
            <sub><b>renovate-bot</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Armor-cn">
            <img src="https://avatars.githubusercontent.com/u/31821714?v=4" width="100;" alt="Armor-cn"/>
            <br />
            <sub><b>Armor-cn</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/franken133">
            <img src="https://avatars.githubusercontent.com/u/17498284?v=4" width="100;" alt="franken133"/>
            <br />
            <sub><b>franken133</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/fanybook">
            <img src="https://avatars.githubusercontent.com/u/7055107?v=4" width="100;" alt="fanybook"/>
            <br />
            <sub><b>fanybook</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/tangkai123456">
            <img src="https://avatars.githubusercontent.com/u/22436910?v=4" width="100;" alt="tangkai123456"/>
            <br />
            <sub><b>tangkai123456</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/tihssiefiL">
            <img src="https://avatars.githubusercontent.com/u/27731469?v=4" width="100;" alt="tihssiefiL"/>
            <br />
            <sub><b>tihssiefiL</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/HaveF">
            <img src="https://avatars.githubusercontent.com/u/54462?v=4" width="100;" alt="HaveF"/>
            <br />
            <sub><b>HaveF</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/shenX-2021">
            <img src="https://avatars.githubusercontent.com/u/35101675?v=4" width="100;" alt="shenX-2021"/>
            <br />
            <sub><b>shenX-2021</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ethanyou725">
            <img src="https://avatars.githubusercontent.com/u/18167983?v=4" width="100;" alt="ethanyou725"/>
            <br />
            <sub><b>ethanyou725</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/elonglau">
            <img src="https://avatars.githubusercontent.com/u/3918032?v=4" width="100;" alt="elonglau"/>
            <br />
            <sub><b>elonglau</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/tth37">
            <img src="https://avatars.githubusercontent.com/u/48872409?v=4" width="100;" alt="tth37"/>
            <br />
            <sub><b>tth37</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/sunsssshine">
            <img src="https://avatars.githubusercontent.com/u/22254736?v=4" width="100;" alt="sunsssshine"/>
            <br />
            <sub><b>sunsssshine</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/NotEvenANeko">
            <img src="https://avatars.githubusercontent.com/u/49067249?v=4" width="100;" alt="NotEvenANeko"/>
            <br />
            <sub><b>NotEvenANeko</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/younggglcy">
            <img src="https://avatars.githubusercontent.com/u/73387709?v=4" width="100;" alt="younggglcy"/>
            <br />
            <sub><b>younggglcy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/rmlzy">
            <img src="https://avatars.githubusercontent.com/u/33822612?v=4" width="100;" alt="rmlzy"/>
            <br />
            <sub><b>rmlzy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ganshiqingyuan">
            <img src="https://avatars.githubusercontent.com/u/33950951?v=4" width="100;" alt="ganshiqingyuan"/>
            <br />
            <sub><b>ganshiqingyuan</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/finalwhy">
            <img src="https://avatars.githubusercontent.com/u/24859256?v=4" width="100;" alt="finalwhy"/>
            <br />
            <sub><b>finalwhy</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/zxC0der">
            <img src="https://avatars.githubusercontent.com/u/73784351?v=4" width="100;" alt="zxC0der"/>
            <br />
            <sub><b>zxC0der</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/yuu2lee4">
            <img src="https://avatars.githubusercontent.com/u/8046366?v=4" width="100;" alt="yuu2lee4"/>
            <br />
            <sub><b>yuu2lee4</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/iyangsheng">
            <img src="https://avatars.githubusercontent.com/u/39045336?v=4" width="100;" alt="iyangsheng"/>
            <br />
            <sub><b>iyangsheng</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/heiye9">
            <img src="https://avatars.githubusercontent.com/u/24930493?v=4" width="100;" alt="heiye9"/>
            <br />
            <sub><b>heiye9</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Znonymous29">
            <img src="https://avatars.githubusercontent.com/u/19743142?v=4" width="100;" alt="Znonymous29"/>
            <br />
            <sub><b>Znonymous29</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/fyzhu">
            <img src="https://avatars.githubusercontent.com/u/5175751?v=4" width="100;" alt="fyzhu"/>
            <br />
            <sub><b>fyzhu</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/Jimmysh">
            <img src="https://avatars.githubusercontent.com/u/230652?v=4" width="100;" alt="Jimmysh"/>
            <br />
            <sub><b>Jimmysh</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/NNNNzs">
            <img src="https://avatars.githubusercontent.com/u/27205495?v=4" width="100;" alt="NNNNzs"/>
            <br />
            <sub><b>NNNNzs</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/fishel-feng">
            <img src="https://avatars.githubusercontent.com/u/20787523?v=4" width="100;" alt="fishel-feng"/>
            <br />
            <sub><b>fishel-feng</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/leonzhao">
            <img src="https://avatars.githubusercontent.com/u/233218?v=4" width="100;" alt="leonzhao"/>
            <br />
            <sub><b>leonzhao</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/franken133521">
            <img src="https://avatars.githubusercontent.com/u/111852977?v=4" width="100;" alt="franken133521"/>
            <br />
            <sub><b>franken133521</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/bushuai">
            <img src="https://avatars.githubusercontent.com/u/1875256?v=4" width="100;" alt="bushuai"/>
            <br />
            <sub><b>bushuai</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/BG7ZAG">
            <img src="https://avatars.githubusercontent.com/u/16408650?v=4" width="100;" alt="BG7ZAG"/>
            <br />
            <sub><b>BG7ZAG</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Huauauaa">
            <img src="https://avatars.githubusercontent.com/u/21063170?v=4" width="100;" alt="Huauauaa"/>
            <br />
            <sub><b>Huauauaa</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/warriorsloong">
            <img src="https://avatars.githubusercontent.com/u/177649003?v=4" width="100;" alt="warriorsloong"/>
            <br />
            <sub><b>warriorsloong</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ZhangLinkang">
            <img src="https://avatars.githubusercontent.com/u/39427729?v=4" width="100;" alt="ZhangLinkang"/>
            <br />
            <sub><b>ZhangLinkang</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/baby7305">
            <img src="https://avatars.githubusercontent.com/u/25588905?v=4" width="100;" alt="baby7305"/>
            <br />
            <sub><b>baby7305</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/bigggge">
            <img src="https://avatars.githubusercontent.com/u/9855604?v=4" width="100;" alt="bigggge"/>
            <br />
            <sub><b>bigggge</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/jdumpling">
            <img src="https://avatars.githubusercontent.com/u/38931471?v=4" width="100;" alt="jdumpling"/>
            <br />
            <sub><b>jdumpling</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/lpjia">
            <img src="https://avatars.githubusercontent.com/u/33349672?v=4" width="100;" alt="lpjia"/>
            <br />
            <sub><b>lpjia</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/rookie-luochao">
            <img src="https://avatars.githubusercontent.com/u/22948077?v=4" width="100;" alt="rookie-luochao"/>
            <br />
            <sub><b>rookie-luochao</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/mecoepcoo">
            <img src="https://avatars.githubusercontent.com/u/12879491?v=4" width="100;" alt="mecoepcoo"/>
            <br />
            <sub><b>mecoepcoo</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/zhysky">
            <img src="https://avatars.githubusercontent.com/u/43907589?v=4" width="100;" alt="zhysky"/>
            <br />
            <sub><b>zhysky</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/raotaohub">
            <img src="https://avatars.githubusercontent.com/u/66949076?v=4" width="100;" alt="raotaohub"/>
            <br />
            <sub><b>raotaohub</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/wintsa123">
            <img src="https://avatars.githubusercontent.com/u/47288630?v=4" width="100;" alt="wintsa123"/>
            <br />
            <sub><b>wintsa123</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/gjbxy">
            <img src="https://avatars.githubusercontent.com/u/39456318?v=4" width="100;" alt="gjbxy"/>
            <br />
            <sub><b>gjbxy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/yuntian001">
            <img src="https://avatars.githubusercontent.com/u/43692243?v=4" width="100;" alt="yuntian001"/>
            <br />
            <sub><b>yuntian001</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/zhixiangyao">
            <img src="https://avatars.githubusercontent.com/u/49728521?v=4" width="100;" alt="zhixiangyao"/>
            <br />
            <sub><b>zhixiangyao</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/toimc">
            <img src="https://avatars.githubusercontent.com/u/51934415?v=4" width="100;" alt="toimc"/>
            <br />
            <sub><b>toimc</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/songzeng2016">
            <img src="https://avatars.githubusercontent.com/u/21862776?v=4" width="100;" alt="songzeng2016"/>
            <br />
            <sub><b>songzeng2016</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/wuwb">
            <img src="https://avatars.githubusercontent.com/u/510080?v=4" width="100;" alt="wuwb"/>
            <br />
            <sub><b>wuwb</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/AqingCyan">
            <img src="https://avatars.githubusercontent.com/u/32301956?v=4" width="100;" alt="AqingCyan"/>
            <br />
            <sub><b>AqingCyan</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/alantsui5">
            <img src="https://avatars.githubusercontent.com/u/33037271?v=4" width="100;" alt="alantsui5"/>
            <br />
            <sub><b>alantsui5</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/meepobrother">
            <img src="https://avatars.githubusercontent.com/u/8385261?v=4" width="100;" alt="meepobrother"/>
            <br />
            <sub><b>meepobrother</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Alkaidcc">
            <img src="https://avatars.githubusercontent.com/u/54631354?v=4" width="100;" alt="Alkaidcc"/>
            <br />
            <sub><b>Alkaidcc</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Char2sGu">
            <img src="https://avatars.githubusercontent.com/u/63489409?v=4" width="100;" alt="Char2sGu"/>
            <br />
            <sub><b>Char2sGu</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/GuoJikun">
            <img src="https://avatars.githubusercontent.com/u/21582741?v=4" width="100;" alt="GuoJikun"/>
            <br />
            <sub><b>GuoJikun</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/hengistchan">
            <img src="https://avatars.githubusercontent.com/u/46242125?v=4" width="100;" alt="hengistchan"/>
            <br />
            <sub><b>hengistchan</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/okxiaoliang4">
            <img src="https://avatars.githubusercontent.com/u/22525904?v=4" width="100;" alt="okxiaoliang4"/>
            <br />
            <sub><b>okxiaoliang4</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Kennytian">
            <img src="https://avatars.githubusercontent.com/u/2621619?v=4" width="100;" alt="Kennytian"/>
            <br />
            <sub><b>Kennytian</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/lxKylin">
            <img src="https://avatars.githubusercontent.com/u/75473409?v=4" width="100;" alt="lxKylin"/>
            <br />
            <sub><b>lxKylin</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ThisIsLoui">
            <img src="https://avatars.githubusercontent.com/u/69883404?v=4" width="100;" alt="ThisIsLoui"/>
            <br />
            <sub><b>ThisIsLoui</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/wu-yu-pei">
            <img src="https://avatars.githubusercontent.com/u/73653265?v=4" width="100;" alt="wu-yu-pei"/>
            <br />
            <sub><b>wu-yu-pei</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Wzb3422">
            <img src="https://avatars.githubusercontent.com/u/42794622?v=4" width="100;" alt="Wzb3422"/>
            <br />
            <sub><b>Wzb3422</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Erchoc">
            <img src="https://avatars.githubusercontent.com/u/19908809?v=4" width="100;" alt="Erchoc"/>
            <br />
            <sub><b>Erchoc</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Gavin-Gong">
            <img src="https://avatars.githubusercontent.com/u/9414378?v=4" width="100;" alt="Gavin-Gong"/>
            <br />
            <sub><b>Gavin-Gong</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Xecuss">
            <img src="https://avatars.githubusercontent.com/u/16537413?v=4" width="100;" alt="Xecuss"/>
            <br />
            <sub><b>Xecuss</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/HelTi">
            <img src="https://avatars.githubusercontent.com/u/17466707?v=4" width="100;" alt="HelTi"/>
            <br />
            <sub><b>HelTi</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/myfreax">
            <img src="https://avatars.githubusercontent.com/u/5459483?v=4" width="100;" alt="myfreax"/>
            <br />
            <sub><b>myfreax</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/heng1025">
            <img src="https://avatars.githubusercontent.com/u/17466991?v=4" width="100;" alt="heng1025"/>
            <br />
            <sub><b>heng1025</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/jiaruh">
            <img src="https://avatars.githubusercontent.com/u/9866717?v=4" width="100;" alt="jiaruh"/>
            <br />
            <sub><b>jiaruh</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wenjianmin">
            <img src="https://avatars.githubusercontent.com/u/20159338?v=4" width="100;" alt="wenjianmin"/>
            <br />
            <sub><b>wenjianmin</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/kenlig">
            <img src="https://avatars.githubusercontent.com/u/28685375?v=4" width="100;" alt="kenlig"/>
            <br />
            <sub><b>kenlig</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/lizhongyi">
            <img src="https://avatars.githubusercontent.com/u/3292807?v=4" width="100;" alt="lizhongyi"/>
            <br />
            <sub><b>lizhongyi</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/Teeoo">
            <img src="https://avatars.githubusercontent.com/u/25023667?v=4" width="100;" alt="Teeoo"/>
            <br />
            <sub><b>Teeoo</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/litingyes">
            <img src="https://avatars.githubusercontent.com/u/69500429?v=4" width="100;" alt="litingyes"/>
            <br />
            <sub><b>litingyes</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Mayness">
            <img src="https://avatars.githubusercontent.com/u/24516789?v=4" width="100;" alt="Mayness"/>
            <br />
            <sub><b>Mayness</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/hhhuaang">
            <img src="https://avatars.githubusercontent.com/u/10963105?v=4" width="100;" alt="hhhuaang"/>
            <br />
            <sub><b>hhhuaang</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/gaogaoinvincible">
            <img src="https://avatars.githubusercontent.com/u/13410631?v=4" width="100;" alt="gaogaoinvincible"/>
            <br />
            <sub><b>gaogaoinvincible</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Frorice">
            <img src="https://avatars.githubusercontent.com/u/6328069?v=4" width="100;" alt="Frorice"/>
            <br />
            <sub><b>Frorice</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/ezhq">
            <img src="https://avatars.githubusercontent.com/u/20750061?v=4" width="100;" alt="ezhq"/>
            <br />
            <sub><b>ezhq</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/dengshenkk">
            <img src="https://avatars.githubusercontent.com/u/28993720?v=4" width="100;" alt="dengshenkk"/>
            <br />
            <sub><b>dengshenkk</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/dangqi888">
            <img src="https://avatars.githubusercontent.com/u/39114778?v=4" width="100;" alt="dangqi888"/>
            <br />
            <sub><b>dangqi888</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/chengzhenguo1">
            <img src="https://avatars.githubusercontent.com/u/51019050?v=4" width="100;" alt="chengzhenguo1"/>
            <br />
            <sub><b>chengzhenguo1</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/chenc041">
            <img src="https://avatars.githubusercontent.com/u/16097887?v=4" width="100;" alt="chenc041"/>
            <br />
            <sub><b>chenc041</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/buqiyuan">
            <img src="https://avatars.githubusercontent.com/u/39730999?v=4" width="100;" alt="buqiyuan"/>
            <br />
            <sub><b>buqiyuan</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/zhupengfeivip">
            <img src="https://avatars.githubusercontent.com/u/30720809?v=4" width="100;" alt="zhupengfeivip"/>
            <br />
            <sub><b>zhupengfeivip</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/akai007">
            <img src="https://avatars.githubusercontent.com/u/10443550?v=4" width="100;" alt="akai007"/>
            <br />
            <sub><b>akai007</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/muyu66">
            <img src="https://avatars.githubusercontent.com/u/20837526?v=4" width="100;" alt="muyu66"/>
            <br />
            <sub><b>muyu66</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Cacivy">
            <img src="https://avatars.githubusercontent.com/u/8381177?v=4" width="100;" alt="Cacivy"/>
            <br />
            <sub><b>Cacivy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/luoxzhg">
            <img src="https://avatars.githubusercontent.com/u/25560573?v=4" width="100;" alt="luoxzhg"/>
            <br />
            <sub><b>luoxzhg</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/mowangjuanzi">
            <img src="https://avatars.githubusercontent.com/u/13846040?v=4" width="100;" alt="mowangjuanzi"/>
            <br />
            <sub><b>mowangjuanzi</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/xrr2016">
            <img src="https://avatars.githubusercontent.com/u/18013127?v=4" width="100;" alt="xrr2016"/>
            <br />
            <sub><b>xrr2016</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/woai3c">
            <img src="https://avatars.githubusercontent.com/u/22117876?v=4" width="100;" alt="woai3c"/>
            <br />
            <sub><b>woai3c</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/liangpengyv">
            <img src="https://avatars.githubusercontent.com/u/23415234?v=4" width="100;" alt="liangpengyv"/>
            <br />
            <sub><b>liangpengyv</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/qunbotop">
            <img src="https://avatars.githubusercontent.com/u/38276469?v=4" width="100;" alt="qunbotop"/>
            <br />
            <sub><b>qunbotop</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/think2011">
            <img src="https://avatars.githubusercontent.com/u/3961388?v=4" width="100;" alt="think2011"/>
            <br />
            <sub><b>think2011</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/gaga-change">
            <img src="https://avatars.githubusercontent.com/u/21301350?v=4" width="100;" alt="gaga-change"/>
            <br />
            <sub><b>gaga-change</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/zyu">
            <img src="https://avatars.githubusercontent.com/u/807397?v=4" width="100;" alt="zyu"/>
            <br />
            <sub><b>zyu</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/zemor923">
            <img src="https://avatars.githubusercontent.com/u/30496751?v=4" width="100;" alt="zemor923"/>
            <br />
            <sub><b>zemor923</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/bigyifeng">
            <img src="https://avatars.githubusercontent.com/u/66539215?v=4" width="100;" alt="bigyifeng"/>
            <br />
            <sub><b>bigyifeng</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/xdlover">
            <img src="https://avatars.githubusercontent.com/u/21051235?v=4" width="100;" alt="xdlover"/>
            <br />
            <sub><b>xdlover</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wyn77">
            <img src="https://avatars.githubusercontent.com/u/36877886?v=4" width="100;" alt="wyn77"/>
            <br />
            <sub><b>wyn77</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wujingquan">
            <img src="https://avatars.githubusercontent.com/u/22289015?v=4" width="100;" alt="wujingquan"/>
            <br />
            <sub><b>wujingquan</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/wangkunmeng">
            <img src="https://avatars.githubusercontent.com/u/17898858?v=4" width="100;" alt="wangkunmeng"/>
            <br />
            <sub><b>wangkunmeng</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/uxuip">
            <img src="https://avatars.githubusercontent.com/u/110730129?v=4" width="100;" alt="uxuip"/>
            <br />
            <sub><b>uxuip</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/sunet693">
            <img src="https://avatars.githubusercontent.com/u/12874803?v=4" width="100;" alt="sunet693"/>
            <br />
            <sub><b>sunet693</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/mhfe123">
            <img src="https://avatars.githubusercontent.com/u/33445131?v=4" width="100;" alt="mhfe123"/>
            <br />
            <sub><b>mhfe123</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/skipsoul">
            <img src="https://avatars.githubusercontent.com/u/17571715?v=4" width="100;" alt="skipsoul"/>
            <br />
            <sub><b>skipsoul</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/redismsgs">
            <img src="https://avatars.githubusercontent.com/u/32961930?v=4" width="100;" alt="redismsgs"/>
            <br />
            <sub><b>redismsgs</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/Ran968777">
            <img src="https://avatars.githubusercontent.com/u/39400191?v=4" width="100;" alt="Ran968777"/>
            <br />
            <sub><b>Ran968777</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Hucy">
            <img src="https://avatars.githubusercontent.com/u/11373955?v=4" width="100;" alt="Hucy"/>
            <br />
            <sub><b>Hucy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/pengzhanbo">
            <img src="https://avatars.githubusercontent.com/u/16745751?v=4" width="100;" alt="pengzhanbo"/>
            <br />
            <sub><b>pengzhanbo</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/edgexie">
            <img src="https://avatars.githubusercontent.com/u/18474752?v=4" width="100;" alt="edgexie"/>
            <br />
            <sub><b>edgexie</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/BM-laoli">
            <img src="https://avatars.githubusercontent.com/u/60060313?v=4" width="100;" alt="BM-laoli"/>
            <br />
            <sub><b>BM-laoli</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/hom">
            <img src="https://avatars.githubusercontent.com/u/23349958?v=4" width="100;" alt="hom"/>
            <br />
            <sub><b>hom</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/linbudu599">
            <img src="https://avatars.githubusercontent.com/u/48507806?v=4" width="100;" alt="linbudu599"/>
            <br />
            <sub><b>linbudu599</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/KenyeeC">
            <img src="https://avatars.githubusercontent.com/u/18223471?v=4" width="100;" alt="KenyeeC"/>
            <br />
            <sub><b>KenyeeC</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Jelly38214">
            <img src="https://avatars.githubusercontent.com/u/16983056?v=4" width="100;" alt="Jelly38214"/>
            <br />
            <sub><b>Jelly38214</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/JailBreakC">
            <img src="https://avatars.githubusercontent.com/u/7326583?v=4" width="100;" alt="JailBreakC"/>
            <br />
            <sub><b>JailBreakC</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/IOLOII">
            <img src="https://avatars.githubusercontent.com/u/34856171?v=4" width="100;" alt="IOLOII"/>
            <br />
            <sub><b>IOLOII</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/McCarthey">
            <img src="https://avatars.githubusercontent.com/u/24711467?v=4" width="100;" alt="McCarthey"/>
            <br />
            <sub><b>McCarthey</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/fuergaosi233">
            <img src="https://avatars.githubusercontent.com/u/22197568?v=4" width="100;" alt="fuergaosi233"/>
            <br />
            <sub><b>fuergaosi233</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Grapedge">
            <img src="https://avatars.githubusercontent.com/u/22425339?v=4" width="100;" alt="Grapedge"/>
            <br />
            <sub><b>Grapedge</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/genalhuang">
            <img src="https://avatars.githubusercontent.com/u/46491653?v=4" width="100;" alt="genalhuang"/>
            <br />
            <sub><b>genalhuang</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wjw-gavin">
            <img src="https://avatars.githubusercontent.com/u/19986739?v=4" width="100;" alt="wjw-gavin"/>
            <br />
            <sub><b>wjw-gavin</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/GaleLQ">
            <img src="https://avatars.githubusercontent.com/u/41321052?v=4" width="100;" alt="GaleLQ"/>
            <br />
            <sub><b>GaleLQ</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Funny002">
            <img src="https://avatars.githubusercontent.com/u/32964708?v=4" width="100;" alt="Funny002"/>
            <br />
            <sub><b>Funny002</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/ifrvn">
            <img src="https://avatars.githubusercontent.com/u/21982381?v=4" width="100;" alt="ifrvn"/>
            <br />
            <sub><b>ifrvn</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/coding-ax">
            <img src="https://avatars.githubusercontent.com/u/53092569?v=4" width="100;" alt="coding-ax"/>
            <br />
            <sub><b>coding-ax</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/lemontree2000">
            <img src="https://avatars.githubusercontent.com/u/21957062?v=4" width="100;" alt="lemontree2000"/>
            <br />
            <sub><b>lemontree2000</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/DougLee">
            <img src="https://avatars.githubusercontent.com/u/2282371?v=4" width="100;" alt="DougLee"/>
            <br />
            <sub><b>DougLee</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wangdicoder">
            <img src="https://avatars.githubusercontent.com/u/7374042?v=4" width="100;" alt="wangdicoder"/>
            <br />
            <sub><b>wangdicoder</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ManiuLtd">
            <img src="https://avatars.githubusercontent.com/u/36794003?v=4" width="100;" alt="ManiuLtd"/>
            <br />
            <sub><b>ManiuLtd</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/CosPie">
            <img src="https://avatars.githubusercontent.com/u/28629610?v=4" width="100;" alt="CosPie"/>
            <br />
            <sub><b>CosPie</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/BYVoid">
            <img src="https://avatars.githubusercontent.com/u/245270?v=4" width="100;" alt="BYVoid"/>
            <br />
            <sub><b>BYVoid</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/caperso">
            <img src="https://avatars.githubusercontent.com/u/34877623?v=4" width="100;" alt="caperso"/>
            <br />
            <sub><b>caperso</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/CaanDoll">
            <img src="https://avatars.githubusercontent.com/u/23540471?v=4" width="100;" alt="CaanDoll"/>
            <br />
            <sub><b>CaanDoll</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Ancss">
            <img src="https://avatars.githubusercontent.com/u/61501274?v=4" width="100;" alt="Ancss"/>
            <br />
            <sub><b>Ancss</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/yunyu950908">
            <img src="https://avatars.githubusercontent.com/u/25625252?v=4" width="100;" alt="yunyu950908"/>
            <br />
            <sub><b>yunyu950908</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/Zeng1998">
            <img src="https://avatars.githubusercontent.com/u/31177490?v=4" width="100;" alt="Zeng1998"/>
            <br />
            <sub><b>Zeng1998</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/youmengme">
            <img src="https://avatars.githubusercontent.com/u/27558572?v=4" width="100;" alt="youmengme"/>
            <br />
            <sub><b>youmengme</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Yaob1990">
            <img src="https://avatars.githubusercontent.com/u/22534346?v=4" width="100;" alt="Yaob1990"/>
            <br />
            <sub><b>Yaob1990</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/YangFong">
            <img src="https://avatars.githubusercontent.com/u/70502828?v=4" width="100;" alt="YangFong"/>
            <br />
            <sub><b>YangFong</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/NuoHui">
            <img src="https://avatars.githubusercontent.com/u/42414989?v=4" width="100;" alt="NuoHui"/>
            <br />
            <sub><b>NuoHui</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/XHalso">
            <img src="https://avatars.githubusercontent.com/u/18637285?v=4" width="100;" alt="XHalso"/>
            <br />
            <sub><b>XHalso</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/Lydanne">
            <img src="https://avatars.githubusercontent.com/u/39021696?v=4" width="100;" alt="Lydanne"/>
            <br />
            <sub><b>Lydanne</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/WinChance">
            <img src="https://avatars.githubusercontent.com/u/12797337?v=4" width="100;" alt="WinChance"/>
            <br />
            <sub><b>WinChance</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Wuwei9536">
            <img src="https://avatars.githubusercontent.com/u/32845405?v=4" width="100;" alt="Wuwei9536"/>
            <br />
            <sub><b>Wuwei9536</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/WenyXu">
            <img src="https://avatars.githubusercontent.com/u/32535939?v=4" width="100;" alt="WenyXu"/>
            <br />
            <sub><b>WenyXu</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wangzishi">
            <img src="https://avatars.githubusercontent.com/u/8288105?v=4" width="100;" alt="wangzishi"/>
            <br />
            <sub><b>wangzishi</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/TrumanGao">
            <img src="https://avatars.githubusercontent.com/u/33452837?v=4" width="100;" alt="TrumanGao"/>
            <br />
            <sub><b>TrumanGao</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/TerrniT">
            <img src="https://avatars.githubusercontent.com/u/104818206?v=4" width="100;" alt="TerrniT"/>
            <br />
            <sub><b>TerrniT</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ShingLi">
            <img src="https://avatars.githubusercontent.com/u/17964694?v=4" width="100;" alt="ShingLi"/>
            <br />
            <sub><b>ShingLi</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/sunpm">
            <img src="https://avatars.githubusercontent.com/u/35005831?v=4" width="100;" alt="sunpm"/>
            <br />
            <sub><b>sunpm</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/phpjavac">
            <img src="https://avatars.githubusercontent.com/u/18723964?v=4" width="100;" alt="phpjavac"/>
            <br />
            <sub><b>phpjavac</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/a20185">
            <img src="https://avatars.githubusercontent.com/u/14831358?v=4" width="100;" alt="a20185"/>
            <br />
            <sub><b>a20185</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/SJcz">
            <img src="https://avatars.githubusercontent.com/u/20878022?v=4" width="100;" alt="SJcz"/>
            <br />
            <sub><b>SJcz</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/wuliupo">
            <img src="https://avatars.githubusercontent.com/u/1187809?v=4" width="100;" alt="wuliupo"/>
            <br />
            <sub><b>wuliupo</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Onekki">
            <img src="https://avatars.githubusercontent.com/u/31927350?v=4" width="100;" alt="Onekki"/>
            <br />
            <sub><b>Onekki</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/HoHow">
            <img src="https://avatars.githubusercontent.com/u/5638006?v=4" width="100;" alt="HoHow"/>
            <br />
            <sub><b>HoHow</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Nugine">
            <img src="https://avatars.githubusercontent.com/u/30099658?v=4" width="100;" alt="Nugine"/>
            <br />
            <sub><b>Nugine</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/hcfw007">
            <img src="https://avatars.githubusercontent.com/u/13669999?v=4" width="100;" alt="hcfw007"/>
            <br />
            <sub><b>hcfw007</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/mnixry">
            <img src="https://avatars.githubusercontent.com/u/32300164?v=4" width="100;" alt="mnixry"/>
            <br />
            <sub><b>mnixry</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/philipxyc">
            <img src="https://avatars.githubusercontent.com/u/12481493?v=4" width="100;" alt="philipxyc"/>
            <br />
            <sub><b>philipxyc</b></sub>
        </a>
    </td></tr>
</table>
<!-- readme: collaborators,contributors -end -->

> 此列表由 GitHub Actions 自动生成和更新

## 特别感谢

- **[zuohuadong](https://github.com/zuohuadong)** - 项目发起人和主要维护者
- **所有贡献者** - 每一个 Pull Request 和 Issue 都让项目变得更好
- **NestJS 官方团队** - 创造了这个优秀的框架
- **中文开发者社区** - 提供了宝贵的反馈和建议

## 赞助商

感谢以下企业对本项目的支持：

### 主要赞助商

<div align="center">
  <a href="https://trilon.io/" target="_blank">
    <img src="https://trilon.io/logo.svg" alt="Trilon Logo" width="200" />
  </a>
  <br />
  <a href="https://mojam.co/" target="_blank">
    <img src="https://mojam.co/logo.png" alt="Mojam Logo" width="200" />
  </a>
</div>

### 支持我们

NestJS 是一个基于 MIT 许可证的开源项目，它的持续发展离不开社区的支持。如果你喜欢这个框架，或者你的企业在使用 NestJS，请考虑赞助我们的开发工作，以确保你依赖的项目能够得到积极的维护和改进。

#### 如何支持我们

- **💰 成为赞助商或支持者**：通过 [OpenCollective](https://opencollective.com/nest) 支持我们
- **🎯 一次性捐赠**：使用 [PayPal](https://paypal.me/kamilmysliwiec) 进行一次性捐赠
- **📧 直接联系**：发送邮件至 [mail@kamilmysliwiec.com](mailto:mail@kamilmysliwiec.com)
- **⭐ GitHub Star**：给我们的 [GitHub 仓库](https://github.com/nestjs/nest) 一个星标
- **🔄 分享推广**：在社交媒体和技术社区中分享 NestJS

#### 为什么支持我们很重要

NestJS 没有大公司的持续资金支持，完全依靠社区的善意 ❤️。你的支持将帮助我们：

- 💻 **持续开发新功能**：让框架变得更加强大和完善
- 📚 **创建更多内容**：编写教程、博客文章和录制视频
- 🛠️ **及时修复问题**：快速响应社区反馈和问题
- 🌱 **支持生态发展**：维护相关工具和库

### 企业支持

如果你的企业正在使用 NestJS，可以考虑：

- **📈 企业赞助**：通过 [企业支持计划](https://enterprise.nestjs.com) 获得专业服务
- **🎓 团队培训**：安排 NestJS 官方培训和工作坊
- **💼 技术咨询**：获得 NestJS 核心团队的直接技术指导

---

*想要加入我们吗？查看 [GitHub 仓库](https://github.com/nestcn/docs.nestjs.cn) 开始贡献！*

## 许可证

本项目基于 [Apache License 2.0](https://github.com/nestcn/docs.nestjs.cn/blob/main/LICENSE) 许可证开源。
