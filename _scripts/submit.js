const axios = require("axios");
const path = require("path");
const urls = require(path.join(__dirname, "../urls.json")).map(x => x.url);

function submitToBing() {
  return axios
    .post(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${process.env.BING_TOKEN}`,
      {
        siteUrl: "https://waynegong.cn",
        urlList: urls,
      }
    )
    .then((res) => {
      if (res.status !== 200) throw res;
      else {
        console.log("Bing 推送成功:", res.data);
      }
    })
    .catch((e) => {
      console.error("Bing 推送失败", e);
    });
}

function submitToBadidu() {
  return axios
    .post(
      `http://data.zz.baidu.com/urls?site=https://waynegong.cn&token=${process.env.BAIDU_TOKEN}`,
      urls.join("\n"),
      { headers: { "Content-Type": "text/plain" } }
    )
    .then((res) => {
      if (res.status !== 200) throw res;
      else {
        console.log("Baidu 推送成功:", res.data);
      }
    })
    .catch((e) => {
      console.error("Baidu 推送失败", e);
    });
}


submitToBadidu()
submitToBing()