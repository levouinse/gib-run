const compression = require('compression');

module.exports = {
	name: 'compression',
	version: '1.0.0',
	description: 'Gzip compression for responses',
	
	onInit(server) {
		const enabled = server.config.compression !== false;
		
		if (enabled) {
			server.use(compression());
		}
	}
};
