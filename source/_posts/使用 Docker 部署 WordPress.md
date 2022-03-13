---
title: 使用 Docker 部署 WordPress
date: 2020/10/24
abbrlink: 3527
keywords:
  - Docker
  - WordPress
tags:
  - 编程
---

WordPress 提供了 Dockers Image，我们可以通过 Docker 的方式进行部署。由于同一台机器上部署了多个 Web 站点都需要使用 80/443 端口，所以使用 Nginx 通过域名判断并反向代理。

### 部署 WordPress
[WordPress Docker Image](https://hub.docker.com/_/wordpress)

新建目录，配置 `docker-compose.yml` 配置文件：

```yml
version: '3.1'
services:
  nginx:
      image: nginx
      volumes:
        - ./content:/var/content
        - ./conf:/etc/nginx
      ports:
        - "80:80"
        - "443:443"
      networks:
        - default
  
  wordpress:
    image: wordpress:latest
    restart: always
    depends_on:
      - db
    volumes:
      - ./wp_data:/var/www/html
    networks:
      - default
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_USER: wordpress
      MYSQL_ROOT_PASSWORD: wordpress
      MYSQL_DATABASE: wordpress
    volumes:
      - ./db_data:/var/lib/mysql
    networks:
      - default

networks:
    default:
```

### 配置 Nginx

编辑 Nginx 的配置文件 `nginx/conf/conf.d/default.conf` 将访问 `waynegong.cn:80` 的请求转发到 WordPress 容器中：

```
server {
  listen    80;
  server_name   waynegong.cn;
  location / {
    proxy_set_header Upgrade              $http_upgrade;
    proxy_set_header Connection           "upgrade";
    proxy_set_header Host                 $host;
    proxy_set_header X-Real-IP            $remote_addr;
    proxy_set_header X-Forwarded-For      $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto    $scheme;
    proxy_set_header X-Forwarded-Host     $host;
    proxy_set_header X-Forwarded-Port     $server_port;
    proxy_pass http://wordpress;
  }
}
```

启动容器，这时通过 waynegong.cn 即可访问了。