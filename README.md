# 介绍

Nest是构建高效，可扩展的 Node.js Web 应用程序的框架。 它使用现代的 JavaScript 或 TypeScript（保留与纯 JavaScript 的兼容性），并结合 OOP（面向对象编程），FP（函数式编程）和FRP（函数响应式编程）的元素。。

# 设计哲学

近几年，由于 Node.js，JavaScript 已经成为 Web 前端和后端应用程序的“通用语言”，并且有了 Angular，React 和 Vue 等令人耳目一新的项目，提高了开发人员的生产力，使得可以快速构建可测试的且可扩展的前端应用程序。 然而，在服务器端，虽然有很多优秀的库、helper 和 Node 工具，但是它们都没有有效地解决主要问题 - 架构。

Nest 旨在提供一个开箱即用的应用程序体系结构，允许轻松创建高度可测试，可扩展，松散耦合且易于维护的应用程序。

## [查看 10.x 文档](/10/)

### 中文交流QQ群：     

二群：1031015552 （禁止广告）    
三群： 321735506 （禁止广告）


### TG 群

[点击加入 TG 群](https://t.me/+TCn0z6Z0wwKA_IFD)




### 微信群：

微信三群：    

<img src="https://ghproxy.org/https://raw.githubusercontent.com/zuohuadong/imgbed/main/pic/siqun.jpg" alt="加微信" width="260" height="260" align="bottom" />

如果二维码过期，请添加：


![](https://ghproxy.org/https://raw.githubusercontent.com/zuohuadong/imgbed/main/pic/68747470733a2f2f7069632e646f776e6b2e63632f6974656d2f3566386336633334316364316262623836623732666339612e6a7067.jpg)    



微信一二群，目前只接受 开源项目作者、nestjs 文档贡献者、捐赠者。



## 赞助商广告：

[UClould 59元一年 VPS](https://www.ucloud.cn/site/active/kuaijiesale.html?invitation_code=C1x5337F9CEC60E)


本站托管在： 
[CloudFlare](https://www.cloudflare.com)   
[京东云 六折优惠](https://partner.jdcloud.com/partner/notice/39c68afb71a544e4883b6cd79bb5dffd)
[vultr   （免费送 100 美金）](https://www.vultr.com/?ref=8967015-8H)  
[RamNode - 3美元-100G 高防](https://clientarea.ramnode.com/aff.php?aff=3451)    
[Onevps-不限流量](https://www.onevps.cloud/?aff=12238)    
  
SSL 证书：    
[SSLS 便宜证书](https://ssls.sjv.io/e4OKrg)

科学工具：

[BBXY-最低月租5元](https://bbxy.cloud/auth/register?code=GPTR)    
[JMS 搬瓦工官方的科学上网工具](https://justmysocks3.net/members/aff.php?aff=6423)    

捐赠通道：    
[【捐赠】](https://gitee.com/notadd/docs.nestjs.cn?donate=true)   

  


[![vultr](https://www.vultr.com/media/banner_1.png)](https://www.vultr.com/?ref=7815855-4F)



## 推荐视频

[全栈之巅](https://space.bilibili.com/341919508)

## 相关书籍


[《深入浅出 Node.js》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVAhADURNdHDJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUCEANRE10cHUtCCUZrEBxaXRNvH35ib3U-fgBgdGh7BlguQw4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhAGFQBlGmsVBREAUBNcFgMXD1MTaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFO0kJHQoRUF0dW0FVQgIGGl9GUBEOVhhZFQAQBVFMDBdQIgVUGl8c)


[《狼书（卷1）：更了不起的 Node.js》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARUEVxheHDJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBFQRXGF4cHUtCCUZrUVprQBVNOmZnVHEGAQJuBFdvEEg5Uw4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAUBNcFwcVD1YeaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOx5fRgVAVFcdDBEFQQIFE1gcB0UCBxkOQAUQBlVMC0FRIgVUGl8c)

[《狼书（卷2）：Node.js Web应用开发》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARUHUBNYEzJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBFQdQE1gTHUtCCUZrQkVJASYBWxFidkdcegVqYRRwXWQfZQ4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAUBNcEAETBlEYaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFO0xfQQITAVZPXBcAFwICS1sdVUABV05eQFcaB10YXRAEIgVUGl8c)

[《深入理解 TypeScript》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARQDURxYEDJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBFANRHFgQHUtCCUZraFBxBi8cWBxnR3EsRAVLUUQBMmRcZQ4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAUBNcEgsSAVcbaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFO0kOHAdGU1xIWUBXQQJTS1wdAhABVhJZHQoWD1UeDxMCIgVUGl8c)

[《前端serverless面向全栈的无服务器架构实战》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVABEGXBxfEjJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUAEQZcHF8SHUtCCUZrYF0SYUtIX3dgR0c2ExMQQhJhL0cAdQ4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAURpbFwUQD1ISaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOxtbFgobB1NPDkUKEwIFHAlFBRVTBkkPEAcQAwEbWhBXIgVUGl8c)

[《JavaScript悟道》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARsOVxhfHTJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBGw5XGF8dHUtCCUZrcnx7Xx4SGxxhQHUdUhMWcEpVB1tbUw4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhAGFQBlGmsVBREAURpbEgYRAVYSaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOx4JFgpADgBIDhYHEQIBH1tGV0UBVxIMRgtFDwAcDkIHIgVUGl8c)

[《Node.js设计模式》](https://union-click.jd.com/jdc?e=&p=JF8AALsDIgZlGmsXAxcDXBpZFzJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRcDFwNcGlkXHUtCCUZrXnhPWh5cLEVnaVdUBRNLQAhvUFMoQw4eN1QrWx0GFARUGVwWMiIHUisQewMiBmUbXBYFFgZVH14dBRUEZRxbHDISB1AbWRIHDgFTGl0VAxEHZStrFjIiN1UrWCVAfFIAHA8cA0YOUUsPHAdGAl0SWBYEEwcHGF1HBhBUBx5cJQATBlES)


[《Node.js 区块链开发》](https://union-click.jd.com/jdc?e=&p=JF8AAM4DIgZlGFwXARMOUR9bFTISD1UYUhAGEgRTHmtRXUpZCisCUEdTRV4FRU1HRltKQA4KUExbSxtTFQEbAlEbWBMHDV4QRwYlXRNTERxSSAJyf1J5X2B1WUYcTQdzYh4LZRprFQoWAVYaWRIBIjdVHGtUbBsBVx5cJQMiB1IYXBAKFQRcGlkUBSIAVRJrFQIXB1ccXgkEFAZTG1oWAiI3ZRhrJTISN1YrGXsBQA9dSQ8UBBUCVEheEgNGVAEdDBAHElACHwkTA0dSVytZFAMWDg)    

[《实现领域驱动设计》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVABIFVR5THDJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUAEgVVHlMcHUtCCUZrE31sADEbEBFien1QE11eAWVEFGAbQw4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAURpbEAcaB1MeaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFO0lSFANCA1xMUxELFQICSQkcUUAOVRlYQldHDgZOXBIDIgVUGl8c)

[《Node.js：来一打 C++ 扩展》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARAOVB5aEDJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBEA5UHloQHUtCCUZrYwFtUhNZHBBhWkdRRylKSVJYPGw_ZQ4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAUBNcEQsRBF0faxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOxpZEQtGAlNPWR1VQQJcGA5GABYCVk5YFgFBBwZLUxNXIgVUGl8c)

[《JavaScript 权威指南》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVAxoBUB5ZEjJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUDGgFQHlkSHUtCCUZrSn1KXVdOJFBhEXFTfjNqUhFBDEclZQ4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhADFgRlGmsVBREAUBNcEwoXBFYZaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFO0taHAdAUlQTDEUKRQJRG1kcCxZXUBwPEwESDgVMWBUAIgVUGl8c)




数据库:    

[《PostgreSQL修炼之道：从小工到专家（第2版）》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARQFUhhaFTJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBFAVSGFoVHUtCCUZrYGtLXw9uLh1hb1s3WA8TX2ZfCGI9dQ4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhADFgRlGmsVBREAUBNcHAQTD1ceaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOx9bRwYUUgFJWkJWEQICGAgdURsCBh9dQVdAAVVOWRFQIgVUGl8c)

[《MySQL必知必会》(](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARsHXBNSFjJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBGwdcE1IWHUtCCUZrfHVGRAMbA11nW0MRUgRoXmJCCmUwQw4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhAGFQBlGmsVBREAUBNcHQUTBVwYaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOxIPQAsbAwUcWBUKFQJVSQlGA0FQUR0JFwIXUFUTWhUKIgVUGl8c)


[《MongoDB从入门到商业实战》](https://union-click.jd.com/jdc?e=&p=JF8AAMQDIgZlGmsVARYBXRpaFTJWWA1FBCVbV0IUWVALHEpCAUdETlcNVQtHRRUBFgFdGloVHUtCCUZrY1BvZR1cHnBgS1MiQSxOVUR-U0g5Uw4eN1QrWx0GFARUGVwWMiIHUisNewITBlQaWhACFwRlGmsVBREAUBNdFAAQB10SaxICGzdVG14VABUCSR1dFAQSBlYbayUyETdlK1slASJFOx1YEQcVBQIYCBNQGwIHTgtGURBXBR5eQFEQDwUfWkYFIgVUGl8c)


## 捐赠

![image](https://user-images.githubusercontent.com/11203929/158335069-b51c4493-83f1-4abd-953f-a2e12dfdb8c5.png)







### 支付宝红包


<img src="https://ghproxy.com/https://raw.githubusercontent.com/zuohuadong/imgbed/main/pic/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20211213154942.jpg" alt="支付宝" width="260" height="400" align="bottom" />
