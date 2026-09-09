'use strict';
const http = require('http');
const originalWriteHead = http.ServerResponse.prototype.writeHead;

http.ServerResponse.prototype.writeHead = function patchedWriteHead(...args) {
  try {
    const url = String(this.req?.url || '').split('?')[0];
    const isPage = url === '/' || url.endsWith('.html');
    const isRuntime = /\.(?:js|css)$/.test(url);

    if (isPage) {
      this.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      this.setHeader('Pragma', 'no-cache');
      this.setHeader('Expires', '0');
      // One release guard: Samsung/Chromium must not keep an old DNA renderer
      // while HTML already points at the current build.
      this.setHeader('Clear-Site-Data', '"cache"');
    } else if (isRuntime) {
      this.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    }
  } catch (_) {}
  return originalWriteHead.apply(this, args);
};

require('./server');
