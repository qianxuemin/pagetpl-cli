# pagetpl-cli

一个快速创建后台管理系统页面的小工具

### 安装 

依赖 [Node.js](https://nodejs.org/en/) (>=6.x)：
```
$ npm install pagetpl-cli -g

```

### 用法

```
pagetpl add <template-name> 
```
示例:

```
$ pagetpl add dva-page
```

### 模板

- ✅ dva-page : dva版本的页面模板
- redux-page : redux版本的页面模板

### 功能 

1. ✅ 自动生成初始化页面
2. ✅ 自动初始化model文件
3. ✅ 自动初始化services文件
4. 自动配置路由表
5. 自动增加菜单项
6. 自动增加mock数据

### Note

* 当前只有dva版本的项目可以使用
* 文件夹路径需要满足3-20个字母

### 待讨论
* 约定模板还是配置模板？
* 生成页面通过输入的方式还是读取配置的方式？