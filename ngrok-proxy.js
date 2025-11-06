// ngrok-proxy.js
// Simple proxy server to add ngrok-skip-browser-warning header
// This runs on port 3001 and forwards to your server on port 3000

const http = require('http');
const httpProxy = require('http-proxy-middleware');
const express = require('express');

const app = express();

// Proxy all requests to localhost:3000
app.use('/', (req, res, next) => {
  // Add ngrok-skip-browser-warning header to all requests
  req.headers['ngrok-skip-browser-warning'] = 'true';
  
  // Proxy to your actual server
  const proxy = httpProxy.createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // Ensure the header is set
      proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
    }
  });
  
  proxy(req, res, next);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🔀 Proxy server running on port ${PORT}`);
  console.log(`   Forwarding to http://localhost:3000`);
  console.log(`   Use this port for ngrok: ngrok http ${PORT}\n`);
});

