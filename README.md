# 文件代理（文件加速下载）

文件加速下载API。支持Cloudflare Worker，也可私有化部署Node.js，使用Node.js编写。

# Cloudflare Worker 快速部署指南

这个指南将帮助您快速部署文件下载代理到Cloudflare Worker平台，只需复制现有代码即可。

## 前提条件

1. 拥有一个Cloudflare账户（免费账户即可）

## 部署步骤

### 1. 登录Cloudflare Dashboard

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账户。

### 2. 创建新的Worker

1. 在左侧菜单中点击 **Workers & Pages**
2. 点击 **创建应用程序**
3. 选择 **创建Worker**
4. 为您的Worker命名，例如 `files-proxy`

### 3. 复制代码

1. 访问以下链接获取Worker代码：
   [https://down.kongkuang.top/项目/文件下载加速/worker.js](https://down.kongkuang.top/%E9%A1%B9%E7%9B%AE/%E6%96%87%E4%BB%B6%E4%B8%8B%E8%BD%BD%E5%8A%A0%E9%80%9F/worker.js)

2. 全选并复制页面上的所有代码

3. 回到Cloudflare Worker编辑页面，删除默认代码

4. 粘贴您刚才复制的代码

### 4. 部署Worker

1. 点击 **保存并部署** 按钮

2. 部署成功后，您将获得一个Worker URL，格式类似：
   `https://files-proxy.your-subdomain.workers.dev`

## 使用方法

部署完成后，您可以通过以下URL格式下载文件：

```
https://files-proxy.your-subdomain.workers.dev/https://example.com/path/to/file.zip
```

例如，要下载 `https://example.com/files/document.pdf`，您可以使用：

```
https://files-proxy.your-subdomain.workers.dev/https://example.com/files/document.pdf
```

## 自定义域名（可选）

如果您想使用自己的域名而不是workers.dev子域名，可以按照以下步骤操作：

1. 确保您的域名已添加到Cloudflare
2. 在Worker设置中，转到 **触发器** 选项卡
3. 点击 **添加自定义域**
4. 输入您想要使用的子域名，例如 `files.yourdomain.com`
5. 点击 **添加自定义域** 完成设置

## 限制和注意事项

1. Cloudflare Worker免费计划有以下限制：
   - 每天100,000个请求
   - 每个请求最多运行10ms CPU时间
   - 每个请求最大响应体积为10MB

2. 如果需要处理大文件或高流量，请考虑升级到Cloudflare Worker付费计划

## 故障排除

如果部署或运行过程中遇到问题：

1. 确保您复制了完整的代码
2. 检查Cloudflare Dashboard中的日志
3. 确保您的URL格式正确

# 文件代理Docker快速部署
## 简介 
Docker 是一个开源的应用容器引擎，它允许开发者将应用及其依赖打包到一个轻量级、可移植的容器中。当然文件代理我们也有Docker版，它部署起来更方便。

## 前提条件
1.一台服务器，由于是文件代理，建议国外服务器
2.已安装Docker环境
3.具有网络环境
## 镜像地址
DockerHub：
```shell
xiaozengraw/files-proxy
```
阿里：
```shell
crpi-g4myt05d4c7dw7wd.cn-hangzhou.personal.cr.aliyuncs.com/kk_nework/files-proxy
```
>Tip:服务器在外国，基本DockerHub都能成功拉取。
## 部署方法
### 拉取镜像（可省略）
```shell
docker pull xiaozengraw/files-proxy
```
或
```shell
docker pull crpi-g4myt05d4c7dw7wd.cn-hangzhou.personal.cr.aliyuncs.com/kk_nework/files-proxy
```
~~直接Docker run 会自动拉取的~~
### 运行Docker容器
执行这条命令，会随机给Docker命名
```shell
docker run -p 8563:8563 xiaozengraw/files-proxy
```
如果需要自定义Docker名称
```shell
docker run -p 8563:8563 -name <容器名称> xiaozengraw/files-proxy
```
>Tip:拉取较慢可将“xiaozengraw/files-proxy”换成“crpi-g4myt05d4c7dw7wd.cn-hangzhou.personal.cr.aliyuncs.com/kk_nework/files-proxy”

