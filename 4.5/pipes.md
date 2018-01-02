# 管道

管道是具有 `@Pipe()` 装饰器的类。管道应实现 `PipeTransform` 接口。

![](https://docs.nestjs.com/assets/Pipe_1.png)

管道将输入数据转换成预设格式的输出。因此，它可能超越验证的职责，因为它可能在数据错误的时候抛出异常。

