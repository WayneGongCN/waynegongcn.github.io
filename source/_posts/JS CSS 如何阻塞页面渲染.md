---
title: JS CSS 如何阻塞页面渲染
date: 2020/10/25
abbrlink: 49203
tags:
  - 编程
---

TLDR:

CSS 和 JS 都会阻塞页面的 关键渲染路径 ，不同情况下阻塞效果不同：

- 内联 JS 的执行会阻塞 DOM 构建（Layout）；
- 外部 JS 的加载和执行都会阻塞 DOM 构建；
- 内联 CSS 的 CSSOM 构建会阻塞渲染树的构建，从而阻塞布局（Layout）；
- 外部 CSS 的加载和 CSSOM 构建都会阻塞渲染树的构建，从而阻塞布局；
- 在页面存在 CSS 和 JS 的情况下，CSSOM 的构建会阻塞他后面 JS 的执行；
- `script` 标签的 `async` 和 `derfer` 属性能使 JS 的加载不阻塞 DOM 构建；


## 测试 Demo

为了验证关键渲染路径是如何被阻塞，可以运行一个 Web Server，并通过浏览器调试工具（Chrome DevTools – Performance）观察页面渲染过程。

一个简单的 [Demo](https://github.com/zowiegong/critical-rendering-path)

## JS 如何阻塞页面渲染

由于 JS 可能会修改 DOM，所以运行 JS 和构建 DOM 不能同时进行，所以 JS 会对页面渲染造成较大的影响。

验证 Js 对页面渲染的影响主要分为三种情况：

1. 内联方式的 JS
2. 外部链接引入的 JS
3. 外部链接并使用 async、defer 属性的 JS

### 内联 JS 对页面渲染的影响

修改 Demo 代码 `demo/static/index.html`:
```html
<html>
<body>
  <h1>hello</h1>
  <script>
    const stopTime = Date.now() + 20
    while (Date.now() < stopTime);
  </script>
  <br>
  <h1>world</h1>
</body>
</html>
```
得到如下结果：
![](/images/2020/11/Snipaste_2020-11-03_13-52-15.png)

浏览器接收到 HTML 内容便立即开始 Parse HTML（构建 DOM） ，点击 Parse HTML 可以看到详细的执行耗时。如下：

![](/images/2020/11/Snipaste_2020-11-03_13-58-45.png)

Parse HTML（构建 DOM）只需要 0.3ms，而 JS 却阻塞了 19.9ms，整个 Parse HTML 过程花费了约 20.1 ms。

假设 JS 代码执行需要更久的时间，则 Parse HTML 也会被拉长更久，无法进入下一步（Layout）。

可以得出结论，内联 JS 的执行会阻塞关键渲染路径。

## 外链 JS 对页面渲染的影响

修改 Demo 代码 `demo/static/index.html`:

```html
<html>
<body>
  <h1>hello</h1>
  <script src="/block.js?t=100"></script>
  <br>
  <h1>world</h1>
</body>
</html>
```

得到如下结果：

![](/images/2020/11/Snipaste_2020-11-03_16-59-52.png)

与内联 JS 不同的是 Parse HTML 被分为两次了。

在首次 Parse HTML 中，浏览器解析了 `index.html` 中 `script` 标签之前的内容（0 – 3 行）并立即发起请求获取 `block.js`，停止了解析。

在等待 `block.js` 加载的过程中，浏览器没有对 `script` 标签后面的内容进行解析，而是对已经完成解析的这部分内容进行了布局和绘制（Paint）。
首次绘制（FP）的时间早于 `block.js` 加载完成的时间，但此时页面上仅显示 hello，内容不完整。

`block.js` 加载完成后，浏览器没有对后面的 HTML 解析，而是先执行了 JS 代码。
直到代码执行完成后才开始对剩余内容解析、回流、重绘。

在等待外部 JS 加载完成的过程中，浏览器无法对 `script` 标签后面的内容进行解析，即 JS 的加载会阻塞 DOM 构建。
外部 JS 加载完成后需要先执行 JS，即 JS 的执行也会阻塞 DOM 构建。

可以得出结论，**外链形式引入 JS 的加载、执行都会阻塞关键渲染路径**。


### async、derfer 属性对页面渲染的影响

[MDN 对这两个属性的解释](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script)：

> async: 对于普通脚本，如果存在 async 属性，那么普通脚本会被并行请求，并尽快解析和执行。

> defer: 这个布尔属性被设定用来通知浏览器该脚本将在文档完成解析后，触发 DOMContentLoaded 事件前执行。有 defer 属性的脚本会阻止 DOMContentLoaded 事件，直到脚本被加载并且解析完成。

修改 Demo 代码 `demo/static/index.html`：

```html
<html>
<body>
  <h1>hello</h1>

  <script async src="/block.js?t=100"></script>

  <br>
  <h1>world</h1>
</body>
</html>
```

使用 async 属性时如下：

![](/images/2020/11/Snipaste_2020-11-03_17-33-12.png)

使用 defer 属性时如下：

![](/images/2020/11/Snipaste_2020-11-03_17-39-17.png)

可以发现，加上 `async`、`defer` 这两个属性后，`block.js` 的加载都没有影响到 Parse HTML。

浏览器接收到 HTML 后立即开始了页面的解析，当遇到了 script 标签便立即发起了请求去加载 `block.js`。

与之前不同的是，浏览器继续对 script 后面的内容进行了解析、布局、绘制。

可以得出结论，`async`、`defer` 属性都可以使外链引入的 JS 不阻塞 Parse HTML（DOM 构建）。

## CSS 资源如何阻塞页面渲染

不同于 JS，CSS 不会修改 DOM 所以不会阻塞构建 DOM，所以构建 DOM 与构建 CSSOM 井水不犯河水。

内联的 CSS 已经在 HTML 中一同返回，所有不会对 DOM 构建产生影响。

模拟外链 CSS 阻塞页面渲染，修改测试 Demo `demo/static/index.html`：

得到如下结果:

![](/images/2020/11/Snipaste_2020-11-03_19-01-54.png)

浏览器需要将 DOM 和 CSSOM 合并成一颗渲染树（Render tree）后才能进行布局和绘制。

如果 CSS 通过外链引入，即使 CSS 不阻塞 DOM 构建，但在 CSS 加载完成之前都无法进行 CSSOM 构建也就无法进行渲染树的构建，从而导致阻塞关键渲染流程。

可以看到在 Parse HTML 完成后一直在等待 `block.css` 加载，直到 `block.css` 加载完成才进行 CSSOM 树的构建、渲染、绘制。

证明 CSS 会导致关键渲染路径阻塞。


## 当 JS 遇见 CSS

上述情况只讨论了 HTML + JS、HTML + CSS 的情况，如果 HTML、JS、CSS 都同时存在，对页面渲染又会有什么影响？

JS 之所以会阻塞 DOM 构建是因为 JS 可能会修改 DOM，所以只能按照顺序执行。

同理，JS 也有可能会修改样式，所以在 CSSOM 构建完成之前，JS 无法执行，也就是 CSSOM 会阻塞 JS 执行（JS 的位置在 CSS 之后的情况下）。

从头到位捋一遍他们之间的关系：**CSS 会阻塞渲染树的构建和他后面的 JS 执行，JS 的执行和 DOM 构建又是相互阻塞的**。

修改测试 Demo `demo/static/index.html`：

```html
<html>
<body>
  <h1>hello</h1>
  <script src="/block.js?t=100"></script>
  <h1>world</h1>
  <link rel="stylesheet" href="/block.css?t=300">
  <script src="/block.js?t=200"></script>
</body>
</html>
```
得到如下结果：

![](/images/2020/11/Snipaste_2020-11-03_19-56-04.png)

可以发现，即使 `block.js?t=200` 比 `block.css?t=300` 先加载完成，但他并没有立即执行，而是等待 `block.css?t=300` 加载完成后才执行。


## CSS 为什么需要在页面头部

CSS 不会阻塞 DOM 构建，但却会阻塞渲染树构建，从而阻塞布局影响关键渲染流程。

如果将 CSS 放在页面中间或者底部，CSS 不会阻塞 DOM 构建，已经解析完成的内容会被渲染出来。

这时一旦 CSS 加载完成页面则会重新渲染，可能造成页面变化。一方面不必要的重新渲染造成额外的性能负担，另一方面页面的变化体验也非常不好。

所以将重要的 CSS 资源放在页面头部，尽早开始加载，减少网络请求上阻塞的时间，避免页面阻塞提高渲染效率。

另外对于体积较大的 CSS 资源建议以外部链接的方式加载，这样则能充分利用缓存减少请求时间。

## JS 为什么需要在页面底部

`script` 标签在不设置 `async`、`defer` 属性的情况下，会阻塞 DOM 构建。

如果将这样的 `script` 标签放在页面头部，在没有加载完成的情况下不会解析 `script` 后面的 HTML 内容，直到 JS 加载执行完成页面都会一直显示空白，体验非常不好。

将 JS 放在页面底部则不会有这样的问题，即使浏览器解析 HTML 在底部被阻塞了 script 标签之前的内容依然可以显示，用户依然能在第一时间看到完整的页面。

不过在有了 `async`、`derfer` 属性之后，`script` 标签的位置已经不是那么重要了。

现代的浏览器对页面解析和渲染也做了大量的工作，预加载扫描器等优化技术也极大的提升了渲染效率。

