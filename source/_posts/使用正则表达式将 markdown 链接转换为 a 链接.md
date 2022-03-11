---
title: 使用正则表达式将 markdown 链接转换为 a 链接
abbrlink: 8598
description: 使用正则表达式匹配 markdown 链接语法，批量替换转换为 a 标签语法，以支持 target rel 等 a 标签属性。
tags:
  - 编程
keywords:
  - markdown 链接
  - 正则表达式
  - 分组匹配
  - 向后否定断言
date: 2022-02-10 23:18:12
---

## 背景

在使用 markdown 的超链接语法 `[text](link)` 时，无法支持 `a` 标签的属性（例如 `target`、`rel`）

所以希望将现有用 markdown 链接语法的内容批量替换成 `a` 标签


## 正则解析

通过正则表达式 `(?<!!)\[(.*?)\]\((.*?)\)` 即可完成匹配，其中 `$1` 分组为链接文字， `$2` 分组为链接地址。

整个正则表达式分为三部分：
1. 第一部分 `(?<!!)` 向后否定断言，表示不匹配以 `!` 开始的内容，避免误伤到 markdown 的图片语法 `![text](img src)`;
2. 第二部分 `\[(.*?)\]` 匹配 markdown 链接语法的前半部分 `[text]`，并将结果保存到 `$1` 分组；
3. 第三部分 `\((.*?)\)` 匹配 markdown 链接语法的前半部分 `(link)`，并将结果保存到 `$2` 分组；

## 使用

```javascript
const str = `balabala![img](https://path.to.img) balabala [text](http://path.to.link) balabala`;
const reg = /(?<!!)\[(.*?)\]\((.*?)\)/ig;
const result = str.replace(reg, `[$1]($2)`);
console.log(result);
```

## 相关链接

[向后否定断言 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions/Assertions#:~:text=%E5%90%91%E5%90%8E%E5%90%A6%E5%AE%9A%E6%96%AD%E8%A8%80%3A%20x%20%E4%B8%8D%E8%B7%9F%E9%9A%8F%20y%20%E6%97%B6%E5%8C%B9%E9%85%8D%20x%E3%80%82%E4%BE%8B%E5%A6%82%EF%BC%8C%E5%AF%B9%E4%BA%8E/(%3F%3C!%2D)%5Cd%2B/%EF%BC%8C%E6%95%B0%E5%AD%97%E4%B8%8D%E7%B4%A7%E9%9A%8F%2D%E7%AC%A6%E5%8F%B7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%89%8D%E4%BC%9A%E5%BE%97%E5%88%B0%E5%8C%B9%E9%85%8D%E3%80%82%E5%AF%B9%E4%BA%8E/(%3F%3C!%2D)%5Cd%2B/.exec(3)%20%EF%BC%8C%E2%80%9C3%E2%80%9D%E5%BE%97%E5%88%B0%E5%8C%B9%E9%85%8D%E3%80%82%20%E8%80%8C/(%3F%3C!%2D)%5Cd%2B/.exec(%2D3)%E7%9A%84%E7%BB%93%E6%9E%9C%E6%97%A0%E5%8C%B9%E9%85%8D%EF%BC%8C%E8%BF%99%E6%98%AF%E7%94%B1%E4%BA%8E%E6%95%B0%E5%AD%97%E4%B9%8B%E5%89%8D%E6%9C%89%2D%E7%AC%A6%E5%8F%B7%E3%80%82)

[正则表达式在线验证工具](https://regex101.com/)
