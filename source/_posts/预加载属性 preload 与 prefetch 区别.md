---
title: 预加载属性 preload 与 prefetch 区别
date: 2020/03/04
abbrlink: 40528
keywords:
  - preload
  - prefetch
  - 性能优化
  - 预加载
tags:
  - 编程
---

TLDR:
- preload 告诉浏览器立即加载资源;
- prefetch 告诉浏览器在空闲时才开始加载资源；
- preload、prefetch 仅仅是加载资源，并不会“执行”;
- preload、prefetch 均能设置、命中缓存；
- 正确使用 preload、prefetch 不会导致重复请求；

### 测试 Demo

[waynegongcn/preload-prefetch](https://github.com/waynegongcn/preload-prefetch)

### 优先级

修改 `index.html` 为如下内容：

```html
<!DOCTYPE html>
<head>
  <link rel="preload" href="/style.css?t=2000" as="style">
  <link rel="preload" href="/main.js?t=2000" as="script">
  <link rel="prefetch" href="/prefetch.css?t=1000" as="style">
  <link rel="prefetch" href="/prefetch.js?t=1000" as="script">
</head>
<body>
  <p>hello world</p>
  <p class="preload">preload</p>
  <p class="prefetch">prefetch</p>
</body>
</html>
```

`node index.js` 运行项目，打开调试工具查看 `localhost:3000`，从 performance 工具得到如下结果：

![](/images/2020/11/Snipaste_2020-11-04_16-42-48.png)

发现 JS 没有输出，CSS 也没有生效。通过 `preload`、`prefetch` 加载的资源并不会立即“执行”；

资源加载完成之前就已经完成了渲染，所以通过这两种方式资源的加载都不会阻塞关键渲染路径；

使用 `preload` 会将资源优先级设置为 `Highest`，而使用 `prefetch` 会将资源优先级设置为 `Lowest`，`Lowest` 资源将会在网络空闲时才开始加载。

`preload` 优先级高于 `prefetch`；

### 终止请求与缓存

修改 `index.html` 为如下内容：

```html
<!DOCTYPE html>
<head>
  <link rel="preload" href="/preload.js?t=3000&ma=3600" as="script">
  <link rel="prefetch" href="/prefetch.js?t=3000&ma=3600" as="script">
</head>
<body>
  <p>hello world</p>
  <script>
    setTimeout(() => {
      if (location.href.indexOf('r') === -1) {
        location.href = `http://localhost:3000?r=${Date.now()}`
      }
    }, 1000)
  </script>
</body>
</html>
```
得到如下测试结果：

![](/images/2020/11/Snipaste_2020-11-04_17-17-13.png)


可以发现，在使用 `preload`、`prefetch` 加载资源时，如果发生了页面跳转，此时没有完成的请求将会被取消掉；

修改 `setTimeout` 参数为 `4000`，再次查看效果：

![](/images/2020/11/Snipaste_2020-11-04_17-22-58.png)

在资源有设置缓存的情况下，通过 preload 与 prefetch 加载资源缓存均能生效；


### 重复请求

为了验证使用预加载属性时是否会导致重复的网络请求，修改 `index.html` 如下：

```html
<!DOCTYPE html>
<head>
  <link rel="preload" href="/main.js?t=3000" as="script">
  <link rel="prefetch" href="/main.js?t=3000" as="script">
</head>
<body>
  <p>hello world</p>
  <script src="/main.js?t=3000"></script>
</body>
</html>
```
当页面中实际用到的资源与 `preload`、`prefetch` 加载的资源重复时，浏览器不会进行重复请求（这个例子中不会出现第三个 `main.js` 的请求）；

但是相同的资源重复使用 `preload`、`prefetch` 属性时将会导致重复下载（`main.js` 请求了两次，第二次耗时 6s 的请求为 `prefetch` 发起的）；