const proxyMiddleware = require('proxy-middleware');

module.exports = {
	name: 'proxy',
	version: '1.0.0',
	description: 'Proxy API requests to backend servers',
	
	onInit(server) {
		const proxies = server.config.proxy || [];
		
		proxies.forEach(([route, target]) => {
			const { URL } = require('url');
			const proxyUrl = new URL(target);
			
			const proxyOpts = {
				protocol: proxyUrl.protocol,
				host: proxyUrl.hostname,
				port: proxyUrl.port,
				pathname: proxyUrl.pathname,
				via: true,
				preserveHost: true
			};
			
			server.use(route, proxyMiddleware(proxyOpts));
		});
	}
};
