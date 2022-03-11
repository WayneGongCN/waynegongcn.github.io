---
title: 浏览器插件开发 - 自动发布到 Chrome 商店
date: 2022/01/29
abbrlink: 48515
tags:
  - 编程
keywords:
- 浏览器插件
- chrome插件
- Chrome 商店
- 自动化发布
- 持续部署
---

## 背景
目前 [microsoft-todo-browser-ext](https://github.com/WayneGongCN/microsoft-todo-browser-ext) 在代码提交到 master 分支后，会自动执行 [GitHub Action](https://github.com/WayneGongCN/microsoft-todo-browser-ext/actions) 进行构建，但发布过程仍然需要人工进行手动发布。

为了解决这类重复性操作，减少可能出现的操作失误，将发布过程通过自动化完成。

## 方案
当 master 分支触发 tag push 事件后，开始启动 [Github Action](https://github.com/WayneGongCN/microsoft-todo-browser-ext/actions) 进行 CI 构建，构建完成后通过脚本将构建的产物上传到 Chrom Store，并进行自动（或手动）发布。

 [Chrome Web Store API](https://developer.chrome.com/docs/webstore/api_index/) 提供了上传、发布 Chrome 插件的相关接口，在 [Google Cloud Platform](https://console.cloud.google.com/home/dashboard) 注册应用并进行简单的配置即可使用。

 [chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload) 这个开源库将 [Chrome Web Store API](https://developer.chrome.com/docs/webstore/api_index/) 进行了封装，简化了鉴权、文件上传的流程，同时还提供了 [CLI 程序](https://github.com/fregante/chrome-webstore-upload-cli) 。

 
## 实现

### 前置步骤
 [chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload) 的使用方式已有详细的 [说明文档](https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md) 简单来说分为下面几个步骤：

1. 在 Google Cloud PlatForm [创建一个项目](https://console.developers.google.com/apis/credentials)；
 
2. 将新建的项目设为[公开可访问](https://console.developers.google.com/apis/credentials);
 
3. 配置 OAuth 同意屏幕，并将自己的 Google 添加到测试账号列表；
 
4. 为项目[启用 Chrome Store API](https://console.developers.google.com/apis/library/chromewebstore.googleapis.com)；
 
5. 为项目[添加一个 Chrome APP 类型的 OAuth Client](https://console.developers.google.com/apis/credentials) （这一步将得到一个 `clientId`）；
 
6. [发布项目](https://console.cloud.google.com/apis/credentials/consent)；

7. 使用上面得到的 `ClientID` 替换链接 `client_id` 参数：
```text
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fchromewebstore&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&access_type=offline&approval_prompt=force&client_id=YOUR_CLIENT_ID_HERE
```

8. 在控制台执行 [**代码**](https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md#:~:text=Run%20this%20in%20your%20browser%20console%20on%20that%20last%20page.%20It%27s%20a%20wizard%20to%20create%20your%20refresh_token%3A)，获得 `refresh_token`;

9. 保存上面获得的 `clientId` 和 `refresh_token` 开始编写上传脚本；


### 编写脚本
上传脚本 `path/to/upload.js`

```javascript
import fs from 'fs';

const myZipFile = fs.createReadStream('./mypackage.zip');
store.uploadExisting(myZipFile).then(res => {
  // 返回结果参照文档：
  // https://developer.chrome.com/webstore/webstore_api/items#resource
});
```

发布脚本 `path/to/publish.js`
```javascript
const target = 'default';

store.publish(target).then(res => {
  // 返回结果参照文档：
  // https://developer.chrome.com/webstore/webstore_api/items/publish
});
```

### package.json 配置
```json
{
  "script": {
    "upload": "node path/to/uplaod.js",
    "publish": "node path/to/publish.js"
  }
}
```
 
### Github Action 配置

Github Action 配置参考 [upload.yml](https://github.com/WayneGongCN/microsoft-todo-browser-ext/blob/main/.github/workflows/upload.yml)
