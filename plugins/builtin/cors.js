const cors = require('cors');

module.exports = {
	name: 'cors',
	version: '1.0.0',
	description: 'CORS support for cross-origin requests',
	
	onInit(server) {
		const enabled = server.config.cors === true;
		
		if (enabled) {
			server.use(cors({
				origin: true,
				credentials: true
			}));
		}
	}
};
