# E2E 测试

端到端测试是一个很好的方法从开始到结束来验证应用程序是如何工作的。例如, 当应用程序增长时, 很难手动测试每个 API 端点。e2e 测试帮助我们确保一切工作正常, 符合我们的要求。

执行 e2e 测试的步骤与单元测试完全相同。我们使用 Jest 库作为测试运行器，并使用 Test 静态类来创建测试模块。此外, 为了模拟 HTTP 请求, 我们已经安装了 supertest 库。

让我们创建一个 e2e 目录并测试 CatsModule。

> cats.e2e-spec.ts

```typescript
import * as express from 'express';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';

describe('Cats', () => {
    const server = express();
    const catsService = { findAll: () => ['test'] };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [CatsModule],
          })
          .overrideComponent(CatsService).useValue(catsService)
          .compile();

        const app = module.createNestApplication(server);
        await app.init();
    });

    it(`/GET cats`, () => {
        return request(server)
            .get('/cats')
            .expect(200)
            .expect({
              data: catsService.findAll(),
            });
    });
});
```

!> 将您的 e2e 测试文件保存在 e2e 目录中。测试文件应该有一个 .e2e-spec 或一个 .e2e-test 后缀。

这是一个 `cats.e2e-spec.ts` 测试文件。它包含一个 HTTP 请求测试，我们正在检查响应是否看起来像预期的那样。

请注意，TestingModule 实例提供了一种 overrideComponent() 方法，因此我们可以重写作为导入模块一部分的组件。此外，我们可以先后使用 overrideGuard() 和覆盖看守器和拦截器 overrideInterceptor()。

编译好的模块有几种在下表中详细描述的方法：

| | |
| --------   | ----- | 
| createNestInstance() | 采用可选参数-快速实例, 并返回 INestApplication。必须使用 init () 方法手动初始化应用程序。 |
| createNestMicroservice() | 以 MicroserviceConfiguration 为参数, 并返回 INestMicroservice 。  |
| get() | 使您可以检索已处理模块内可用的组件或控制器的实例。 |
| select() | 允许您在模块树中导航, 例如, 从所选模块中拉出特定实例。 |