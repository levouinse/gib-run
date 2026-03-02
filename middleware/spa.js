// SPA middleware - serve index.html for all routes (client-side routing)
module.exports = (req, res, next) => {
	if (req.method !== 'GET' && req.method !== 'HEAD') return next();
	
	// Skip if it's a file with extension (assets)
	const path = require('path');
	const ext = path.extname(req.url.split('?')[0]);
	
	if (ext && ext !== '.html') {
		return next();
	}
	
	// Serve index.html for all routes
	if (req.url !== '/' && req.url !== '/index.html') {
		req.url = '/index.html';
	}
	
	next();
};
