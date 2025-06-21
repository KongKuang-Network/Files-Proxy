/**
 * 文件下载代理 - Cloudflare Worker版本
 */

// 简单日志函数
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
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

// 处理请求
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 首页 - 只显示运行状况
  if (path === '/' || path === '') {
    return new Response('文件下载代理服务器正在运行', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  
  // 提取域名和文件路径
  const pathParts = path.substring(1).split('/');
  if (pathParts.length < 2) {
    return new Response('无效的URL格式。正确格式: /https://example.com/path/to/file', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  
  const domain = pathParts[0];
  const filePath = pathParts.slice(1).join('/');
  
  // 构建完整URL
  const fileUrl = `${domain}/${filePath}`;
  
  try {
    log(`下载: ${fileUrl}`);
    
    // 获取文件
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`源站返回错误: ${response.status} ${response.statusText}`);
    }
    
    // 获取文件名
    const fileName = filePath.split('/').pop() || 'download';
    
    // 创建新的响应对象，添加下载头
    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename=${fileName}`);
    
    // 返回响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
    
  } catch (error) {
    log(`错误: ${error.message}`);
    return new Response(`下载错误: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// 注册事件监听器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
}); 