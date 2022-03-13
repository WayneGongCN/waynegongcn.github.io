---
title: 站点 SEO - 基础配置
abbrlink: 25672
date: 2022-02-07 17:10:52
description: 本文介绍了对于一个新站点，最基础的 SEO 优化配置。包括域名选择与页面路径优化、title 标签与 meta 标签的注意事项，以及各大搜索引擎的收录方式。
keywords:
- SEO 优化
- title 标签
- meta 标签
- sitemap
- 搜索引擎优化
- 百度
- 谷歌
- 必应
---

### 域名与页面路径

- 为站点配置域名，不要使用 IP 地址；
- 尽可能使用顶级域名，例如 `example.com` 而非 `sub.example.com`；
- 为站点的页面配置永久链接，不要使用 query 参数来区分页面；
- 页面路径尽可能简短，减少非必要层级；

### 页面标题 title

页面标题 `<title>balabala ...</title>` 将作为搜索结果的标题显示，在 SEO 中权重占比最高。

- 使用较长的描述性标题，而非一两个单词的；
- 标题长度建议在 55 至 60 个字符之间；
- 避免堆砌关键词；
- 页面标题在站点中尽可能唯一；

### Meta 标签

#### 描述 Description

页面描述 `<meta name="description" content="some text">` 在搜索结果标题下方展示，作为标题的补充与内容的摘要。对于提高点击率有非常重要的作用。

 - 长度控制在 25 到 160 个字符之间；
 - 避免重复内容、关键字堆砌；
 - 避免使用双引号防止截断；

### 站点地图 sitemap

站点地图用来帮助搜索引擎爬虫发现站点的页面，各大搜索引擎均支持通过 sitemap 进行页面收录。

sitemap 通常放置在站点的根路径下，通常为 xml 格式，各站点生成工具均有对应的 sitemap 生成工具。

### 搜索引擎收录

- [Google Console](https://search.google.com/search-console/about)
- [Bing WebMaster](https://www.bing.com/webmasters)
- [百度收录](https://ziyuan.baidu.com/dailysubmit/index)
- [搜狗收录](https://zhanzhang.sogou.com/index.php/sitelink/index)
- [360 站长](https://zhanzhang.so.com/sitetool/site_manage)



### 参考链接

[Title | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/title#:~:text=%E9%81%BF%E5%85%8D%E4%BD%BF%E7%94%A8%E4%B8%80,%E7%BB%93%E6%9E%9C%E4%B8%8D%E5%87%86%E7%A1%AE%E3%80%82)


[Meta description](https://moz.com/learn/seo/meta-description)
