const auth = require('http-auth');

module.exports = {
	name: 'auth',
	version: '1.0.0',
	description: 'HTTP Basic Authentication',
	
	onInit(server) {
		const htpasswd = server.config.htpasswd;
		
		if (!htpasswd) return;
		
		const basic = auth.basic({
			realm: 'Please authorize',
			file: htpasswd
		});
		
		server.use((req, res, next) => {
			const authHandler = basic.check(() => next());
			authHandler(req, res);
		});
	}
};
