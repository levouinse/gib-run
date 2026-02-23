const { tunnelManager } = require('../../features/tunnel');

module.exports = {
	name: 'tunnel',
	version: '1.0.0',
	description: 'Public tunnel via localtunnel, cloudflare, or ngrok',
	
	async onStart(address) {
		const server = this.server;
		const enabled = server.config.tunnel === true;
		
		if (!enabled) return;
		
		const service = server.config.tunnelService || 'localtunnel';
		const options = server.config.tunnelOptions || {};
		
		setTimeout(() => {
			tunnelManager.start(address.port, service, options);
		}, 1000);
	},
	
	async onStop() {
		tunnelManager.stop();
	}
};
