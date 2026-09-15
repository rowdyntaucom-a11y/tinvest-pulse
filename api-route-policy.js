'use strict';

function registerApiNotFound(app) {
  if (!app || typeof app.all !== 'function') throw new TypeError('Express app is required');
  app.all(['/api', '/api/*'], (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).json({ ok: false, error: 'API route not found', path: req.path });
  });
}

module.exports = { registerApiNotFound };
