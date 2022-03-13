---
title: Docker 部署 Nginx、frp 实现内网穿透
date: 2020/03/23
abbrlink: 8279
tags:
  - 编程
---

由于没有公网 IP，加上黑群晖没有洗白，无法进行外网的远程连接。

通过 frp 内网穿透后可以通过 sub.domain.com:xxx 的形式访问到内网的 web 服务，但是带上端口号十分不优雅也难以记忆。

在公网服务器上部署 Nginx 反向代理到 frp 的特定端口，即可在使用内网服务时不需要端口号了。

### 服务端部署

通过 docker-compose 启动 Dcoker 容器，保持 Nginx 与 frp 两个容器在同一个 Network 下即可在 nginx 容器中将请求转发到 frp 容器。

前置条件：

- 服务端需要 docker 环境及 docker-compose
- [Nginx 镜像](https://hub.docker.com/_/nginx)
- [snowdreamtech/frps 镜像](https://hub.docker.com/r/snowdreamtech/frps)

### 目录结构

```
.
├── docker-compose.yml
├── frp
│   └── config
│       └── frps.ini
└── nginx
    ├── config
    │   ├── conf.d
    │   │   └── default.conf
    │   └── nginx.conf
    └── logs
        ├── access.log
        └── error.log
```

docker-compose.yml 内容如下：

```yml
version: "3"
services:
  nginx:
    image: nginx
    container_name: nginx
    restart: always
    volumes:
      - ./nginx/config/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/config/conf.d:/etc/nginx/conf.d
      - ./nginx/logs:/var/log/nginx
    ports:
      - "80:80"
    environment:
      - NGINX_PORT=80
    links:
      - frp
  
  frp:
    image: snowdreamtech/frps
    container_name: frp
    restart: always
    ports:
      - "7000:7000" # 里的端口与 frps.ini 中 bind_port 保持一致
    volumes:
      - ./frp/config/frps.ini:/etc/frp/frps.ini
```


nginx 的 default.conf 配置文件（可以先 run 一个 nginx 容器然后 通过 docker cp 得到默认配置）:

```nginx
server {
    listen       80;
    server_name  *.domain.com;
    location / {
        proxy_pass http://frp:8888; # 这里的端口与 frps.ini 中 vhost_http_port 保持一致
        proxy_set_header    Host $host;
        proxy_set_header    X-Real-IP $remote_addr;
        proxy_set_header    X-Forwarded-Proto https;
        proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

frps.ini 配置文件：

```ini
[common]
bind_port = 7000
vhost_http_port = 8888
frpc.ini 配置文件（这里是 frp 客户端配置，仅做参考）:

[common]
server_addr = x.x.x.x
server_port = 7000
[xx sercer]
type = http
local_port = xxx
custom_domains = sub.domain.com
```

完成所有配置之后在 docker-compose.yml 所在的目录执行 docker-compose up 完成验证即可。

### 验证

按照上述配置之后，原来通过 sub.domain.com:8888 才能访问的内网 web 服务现在只需要通过 sub.domain.com 访问即可。