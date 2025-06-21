const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { promisify } = require('util');

const app = express();
const PORT = 3000;

// 将回调函数转换为Promise
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);

// 创建缓存目录
const cacheDir = path.join(__dirname, '../cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// 简单日志函数
function log(message) {
  const now = new Date().toISOString().replace('T', ' ').substr(0, 19);
  console.log(`[${now}] ${message}`);
}

// 删除文件的函数
async function deleteFile(filePath) {
  try {
    if (await existsAsync(filePath)) {
      await unlinkAsync(filePath);
      return true;
    }
  } catch (err) {
    log(`错误: ${err.message}`);
  }
  return false;
}

// 从URL中提取真实域名
function extractDomainFromUrl(urlString) {
  try {
    // 确保URL有协议前缀
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString;
    }
    
    const parsedUrl = new URL(urlString);
    return parsedUrl.hostname;
  } catch (error) {
    // 如果解析失败，返回原始字符串的一部分作为标识符
    return urlString.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  }
}

// 处理文件下载请求
app.get('/:domain/*', async (req, res) => {
  let cacheFilePath = null;
  
  try {
    const domain = req.params.domain;
    // 获取文件路径
    const filePath = req.params[0];
    
    // 构建完整URL - 直接使用域名和路径，不添加协议
    const fileUrl = `${domain}/${filePath}`;
    
    log(`下载: ${fileUrl}`);
    
    // 提取真实域名用于缓存文件命名
    const realDomain = extractDomainFromUrl(fileUrl);
    
    // 生成缓存文件名
    const fileName = path.basename(filePath);
    cacheFilePath = path.join(cacheDir, `${realDomain}_${fileName}`);
    
    // 检查缓存是否存在
    if (fs.existsSync(cacheFilePath)) {
      // 使用流式传输，以便在完成后删除文件
      const fileStream = fs.createReadStream(cacheFilePath);
      
      // 设置响应头
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // 管道连接
      fileStream.pipe(res);
      
      // 当传输完成后删除文件
      res.on('close', async () => {
        // 确保客户端连接关闭后再删除
        await deleteFile(cacheFilePath);
      });
      
      return;
    }
    
    // 获取文件
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
    });
    
    // 获取文件类型和大小
    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    // 设置响应头
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // 创建写入流
    const fileStream = fs.createWriteStream(cacheFilePath);
    
    // 管道连接
    response.data.pipe(fileStream);
    response.data.pipe(res);
    
    // 处理错误
    fileStream.on('error', (err) => {
      log(`错误: ${err.message}`);
      // 如果缓存文件创建失败，删除它
      deleteFile(cacheFilePath);
    });
    
    // 当响应结束时删除缓存文件
    res.on('close', async () => {
      // 确保客户端连接关闭后再删除
      // 延迟一点时间确保文件写入完成
      setTimeout(async () => {
        await deleteFile(cacheFilePath);
      }, 1000);
    });
    
  } catch (error) {
    log(`错误: ${error.message}`);
    res.status(500).send(`下载错误: ${error.message}`);
    
    // 如果出错，尝试删除可能创建的缓存文件
    if (cacheFilePath) {
      await deleteFile(cacheFilePath);
    }
  }
});

// 首页 - 只显示运行状况
app.get('/', (req, res) => {
  res.send('文件下载代理服务器正在运行');
});

// 启动服务器
app.listen(PORT, () => {
  log(`服务启动在${PORT}端口`);
}); 