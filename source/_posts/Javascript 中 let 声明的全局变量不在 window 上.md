---
title: Javascript 中 let 声明的全局变量不在 window 上
date: 2021/02/27
abbrlink: 42055
tags:
  - 编程
---

`GlobalEnv` 是一个复合环境，由 `global（顶层对象）`和 `declsEnv（一般声明环境）`组合而成。

在 ES6 之前，顶层对象的属性与全局变量是等价的，顶层对象的属性与全局变量挂钩，被认为是 JavaScript 语言最大的设计败笔之一。

ES6 为了改变这一点，一方面规定，为了保持兼容性，`var` 命令和 `function` 命令声明的全局变量，依旧是顶层对象的属性。

另一方面规定，`let` 命令、`const` 命令、`class` 命令声明的全局变量，不属于顶层对象的属性，而是在一般声明环境 `declsEnv` 中。

通过 `var` 声明的变量在 `Global` 作用域中 ⬇️

![通过 var 定义](/images/2021/03/var.png)

通过 `let` 声明变量时则在 `Script` 作用域中 ⬇️

![通过 let 定义](/images/2021/03/let.png)