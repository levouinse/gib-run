const proxyMiddleware = require('proxy-middleware');
const { logger } = require('../core/logger');

const createProxyMiddleware = (proxyRules) => {
	if (!proxyRules || proxyRules.length === 0) {
		return null;
	}
	
	const middlewares = [];
	
	proxyRules.forEach(([route, target]) => {
		try {
			const { URL } = require('url');
			const targetUrl = new URL(target);
			const proxyOpts = {
				protocol: targetUrl.protocol,
				host: targetUrl.hostname,
				port: targetUrl.port,
				pathname: targetUrl.pathname,
				via: true,
				preserveHost: true
			};
			
			const middleware = proxyMiddleware(proxyOpts);
			
			middlewares.push({
				route,
				target,
				middleware: (req, res, next) => {
					if (req.url.startsWith(route)) {
						logger.debug(`Proxying ${req.url} to ${target}`);
						return middleware(req, res, next);
					}
					next();
				}
			});
			
			logger.info(`Proxy: ${route} → ${target}`);
		} catch (e) {
			logger.error(`Invalid proxy target: ${target}`, e.message);
		}
	});
	
	return (req, res, next) => {
		for (const { route, middleware } of middlewares) {
			if (req.url.startsWith(route)) {
				return middleware(req, res, next);
			}
		}
		next();
	};
};

module.exports = {
	createProxyMiddleware
};
