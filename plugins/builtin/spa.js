const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'spa',
	version: '1.0.0',
	description: 'Single Page Application fallback',
	
	onRequest(req, res, next) {
		const server = this.server;
		const enabled = server.config.spa === true;
		
		if (!enabled) {
			return next();
		}
		
		// Skip if file exists
		const filePath = path.join(server.config.root, req.url);
		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			return next();
		}
		
		// Skip API routes and assets
		if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
			return next();
		}
		
		if (req.url.startsWith('/api') || req.url.startsWith('/__')) {
			return next();
		}
		
		// Fallback to index.html
		req.url = '/index.html';
		next();
	}
};
