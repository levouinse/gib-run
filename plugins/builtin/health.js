const os = require('os');

module.exports = {
	name: 'health',
	version: '1.0.0',
	description: 'Health check endpoint at /health',
	
	onRequest(req, res, next) {
		if (req.url !== '/health') {
			return next();
		}
		
		const server = this.server;
		const stats = server.getStats ? server.getStats() : {};
		const mem = process.memoryUsage();
		
		const health = {
			status: 'healthy',
			uptime: stats.uptime || 0,
			server: {
				requests: stats.requests || 0,
				reloads: stats.reloads || 0,
				clients: stats.clients || 0,
				memory: {
					rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
					heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
					heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`
				}
			},
			system: {
				platform: os.platform(),
				cpus: os.cpus().length,
				freemem: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
				totalmem: `${Math.round(os.totalmem() / 1024 / 1024)}MB`
			}
		};
		
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.end(JSON.stringify(health, null, 2));
	}
};
