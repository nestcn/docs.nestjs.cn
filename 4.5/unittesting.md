# 单元测试
单元测试在编程领域非常重要。有很多很棒的文章会告诉我们为什么写以及如何写单元测试， 因此在这里我只会告诉你 Nest 的相关工具。

## 隔离测试
组件，控制器，拦截器... 这些 Nest 应用程序的构建块，实际上都只是简单的类。由于每个依赖项都是通过构造器注入的，因此可以使用一些流行的库对其轻松地进行 `mock` ，例如： [Jasmine](https://github.com/jasmine/jasmine) 或 [Jest](https://github.com/facebook/jest)。

`cats.controller.spec.ts`

```typescript
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```
?>  将你的测试文件保存在已测试的类附近. 测试文件应该有一个 `.spec` 或 `.test` 后缀.

这有一个使用 [Jest](https://github.com/facebook/jest) 库的例子. 我们使用 `new` 关键词手动创建了 `CatsController` 和 `CatsService` 的示例，我们没有使用任何 Nest 的工具。这种测试就称为隔离测试。

## 测试工具

Nest 有一个测试专用包 `@nestjs/testing` ，它提供了一套实用的工具来帮助我们测试。让我们使用 Nest `Test` 类来重写这个测试的例子。

`cats.controller.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
        controllers: [CatsController],
        components: [CatsService],
      }).compile();

    catsService = module.get<CatsService>(CatsService);
    catsController = module.get<CatsController>(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```
`Test` 类有一个 `createTestingModule()` 方法，它将模块元数据（module metadata）作为参数（模块元数据是等同于 `@Module()` 装饰器的一个对象）。这个方法创建一个 `TestingModule` 实例，这个实例提供了一些方法，其中只有 `compile()` 这一个方法在单元测试中是有用的。这个方法是异步的，所以它必须被等待。当模块要被编译并准备使用时，你可以使用 `get()` 方法取到任何实例。

有时你可能想使用测试替身（test doubles）来替代真实的实例。这很容易，因为 Nest 允许使用 [自定义组件（custom components）](https://docs.nestjs.com/fundamentals/dependency-injection) 来覆盖原本的组件（component）。

?> 阅读更多关于 `TestingModule` 类的内容，请移步  **[这里](/4.5/e2e.md)** .
