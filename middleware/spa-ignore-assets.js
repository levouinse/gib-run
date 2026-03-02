const path = require('path');

// SPA middleware that ignores asset files
module.exports = (req, res, next) => {
	if (req.method !== 'GET' && req.method !== 'HEAD') return next();
	
	// Skip if it's a file with extension (assets)
	const ext = path.extname(req.url.split('?')[0]);
	
	if (ext && ext !== '.html') {
		return next();
	}
	
	// Serve index.html for all routes without extension
	if (req.url !== '/' && req.url !== '/index.html' && !ext) {
		req.url = '/index.html';
	}
	
	next();
};
