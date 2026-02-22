const cors = require('cors');
const { logger } = require('../core/logger');

const createCorsMiddleware = (options = {}) => {
	const corsOptions = {
		origin: options.origin !== undefined ? options.origin : true,
		credentials: options.credentials !== undefined ? options.credentials : true,
		methods: options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: options.allowedHeaders || ['Content-Type', 'Authorization', 'X-Requested-With'],
		exposedHeaders: options.exposedHeaders || [],
		maxAge: options.maxAge || 86400
	};
	
	logger.info('CORS enabled');
	
	return cors(corsOptions);
};

module.exports = {
	createCorsMiddleware
};
