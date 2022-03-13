---
title: 理解 Service Worker
date: 2020/10/21
tags:
  - 编程
  
abbrlink: 23257
---

Service Worker 是一种 JavaScript Worker，通常用来充当 Web 应用程序、浏览器与网络（可用时）之间的代理服务器。

它能够劫持从 Web 应用程序发起的请求，并进行灵活的缓存控制，使得在离线环境下也能访问指定的缓存资源，从而提供良好的离线体验。

除了进行细粒度的缓存控制，还可以实现推送通知、后台同步等功能。

### 前提条件

#### HTTPS 环境
由于 Service Worker 能直接劫持页面请求，为了避免遭到中间人攻击，只有在 HTTPS 环境下才能进行注册（localhost 除外）。

#### Scope

调用 `register` 注册时，浏览器会根据 Service Worker 文件的路径分配不同的 `scope。`

例如：处于根路径下的 Service Worker 能控制所有的 `fetch` 请求，处于 `/a/b/c/` 下的 Service Worker 则只能控制路径以 `/a/b/c/` 开头页面的 `fetch` 请求。

### Service Worker 使用

Service Worker 的使用主要在于理解生命周期及安装、更新机制。

#### 安装

安装 Service Worker 只需要在页面中进行 `register` 即可：

例如：`navigator.serviceWorker.register("/sw.js")`
当用户首次访问页面，将会开始下载并执行 Service Worker 并等待 Service Worker 生命周期事件触发。

Service Worker 加载后第一个触发的是 install 事件。
在 install 事件的处理函数中通常会“加载需要离线缓存的资源”并保存在 CacheStorage 中，由于加载网络资源为异步过程，通常还会搭配 event.waitUntill() 一起使用；

在 install 事件的处理函数执行完成后，Service Worker 将会触发 active 事件。
但此时 Service Worker 还并不能控制页面发出的请求，页面还是非受控状态。只有当页面刷新后 Service Worker 才能进行实际的控制。

如果希望在首次 install 完成，并触发 active 后立即控制页面，可以使用 self.clents.claim() 立即取得控制权。

#### 更新

当安装、激活成功后，访问页面时浏览器将会检查文件内容是否有更新，如果文件内容发生改变则触发 Service Worker 更新。

浏览器检查更新时会遵循 Service Worker 文件的 HTTP 缓存设置，但为了防止设置了长时间缓存导致不能被更新到，浏览器在 24 小时内至少会获取一次最新资源。

除了浏览器自身检查更新外，还能通过在页面中 register() 的方式进行更新。

重复调用 register 注册相同的 Service Worker 不会触发更新，但如果 register 的 Service Worker 内容、文件名、参数任意一项发生变化，则也会触发更新；

Service Worker 的更新流程与安装流程稍有差异。

首次安装 Service Worker 时 install 事件执行完成后，会立即触发 active 事件，但当前客户端（页面）处于非受控状态，只有在刷新或新打开的页面中才能取得对新客户端的控制。

更新的 Service Worker 也会立即执行 install 事件，但不会立即触发 active 事件，而是会进入activating 状态等待。直到没有任何页面使用旧的 Service Worker 时，这时才触发 active 事件，并取得后面打开页面的控制权。

### Service Worker 生命周期图

![](/images/2020/10/image-1.png)

### 其他

- 页面强制刷新时，页面获取直接依赖的资源时不会通过 Service Worker；
- 多个 scop 下安装 service worker 情况