我们徽章的密码在services/wercker/wercker.service.js此徽章的测试应储存在services/wercker/wercker.tester.js.

我们先在文件中添加一些样板文件：

进口 { createServiceTester } 从 '../tester.js' 出口 const T = 等待 createServiceTester()

如果我们的.service.js模块导出单个类，我们可以createServiceTester它使用约定创建ServiceTester反对。把这个叫进去services/wercker/wercker.tester.js将创建一个ServiceTester中导出的服务配置的services/wercker/wercker.service.js我们将在此添加我们的测试ServiceTester对象t从模块导出的。

（2）我们的第一个测试用例

首先，我们将为典型案例添加一个测试：

进口 { isBuildStatus } 从 '../test-validators.js' T.创建(“建立状态”) .得到('/build/wercker/go-wercker-api.json') .期望徽章({ 标签: 'build', 消息: isBuildStatus })
