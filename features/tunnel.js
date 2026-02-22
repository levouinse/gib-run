const { spawn } = require('child_process');
const chalk = require('chalk');
const https = require('https');
const { eventBus, Events } = require('../core/event-bus');
const { logger } = require('../core/logger');

class TunnelManager {
	constructor() {
		this.activeTunnel = null;
		this.tunnelUrl = null;
		this.tunnelPassword = null;
	}
	
	async getTunnelPassword() {
		return new Promise((resolve) => {
			https.get('https://loca.lt/mytunnelpassword', (res) => {
				let data = '';
				res.on('data', (chunk) => { data += chunk; });
				res.on('end', () => {
					this.tunnelPassword = data.trim();
					resolve(this.tunnelPassword);
				});
			}).on('error', () => {
				logger.warn('Could not fetch tunnel password');
				resolve(null);
			});
		});
	}
	
	displayTunnelInfo(url, service) {
		logger.success('Tunnel active!');
		logger.box('Public Tunnel', [
			{ label: 'URL:', value: chalk.green.bold(url) },
			{ label: 'Service:', value: chalk.cyan(service) },
			this.tunnelPassword ? { label: 'Password:', value: chalk.yellow.bold(this.tunnelPassword) } : null
		].filter(Boolean));
		
		if (service === 'localtunnel' && this.tunnelPassword) {
			logger.info('Share password with visitors to access your site');
		}
	}
	
	async startLocalTunnel(port, options = {}) {
		logger.info('Starting LocalTunnel...');
		
		await this.getTunnelPassword();
		
		try {
			const lt = require('localtunnel');
			
			const ltOptions = {
				port,
				allow_invalid_cert: true,
				...(options.subdomain && { subdomain: options.subdomain })
			};
			
			const tunnel = await lt(ltOptions);
			this.activeTunnel = tunnel;
			this.tunnelUrl = tunnel.url;
			
			this.displayTunnelInfo(this.tunnelUrl, 'localtunnel');
			eventBus.emit(Events.TUNNEL_START, this.tunnelUrl);
			
			tunnel.on('close', () => {
				logger.warn('Tunnel closed');
				this.activeTunnel = null;
				this.tunnelUrl = null;
				eventBus.emit(Events.TUNNEL_STOP);
			});
			
			tunnel.on('error', (err) => {
				logger.error('Tunnel error:', err.message);
				eventBus.emit(Events.TUNNEL_ERROR, err);
				this.activeTunnel = null;
				this.tunnelUrl = null;
			});
		} catch (err) {
			logger.error('LocalTunnel failed:', err.message);
			eventBus.emit(Events.TUNNEL_ERROR, err);
		}
	}
	
	startCloudflared(port) {
		logger.info('Starting Cloudflare Tunnel...');
		
		const cloudflared = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`]);
		this.activeTunnel = cloudflared;
		
		const handleOutput = (data) => {
			const output = data.toString();
			const match = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
			if (match && !this.tunnelUrl) {
				this.tunnelUrl = match[0];
				this.displayTunnelInfo(this.tunnelUrl, 'cloudflared');
				eventBus.emit(Events.TUNNEL_START, this.tunnelUrl);
			}
		};
		
		cloudflared.stdout.on('data', handleOutput);
		cloudflared.stderr.on('data', handleOutput);
		
		cloudflared.on('error', (err) => {
			logger.error('Cloudflared not found');
			logger.info('Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
			eventBus.emit(Events.TUNNEL_ERROR, err);
		});
	}
	
	async startNgrok(port, options = {}) {
		logger.info('Starting Ngrok...');
		
		try {
			const ngrok = require('ngrok');
			
			const url = await ngrok.connect({
				addr: port,
				authtoken: options.authtoken
			});
			
			this.tunnelUrl = url;
			this.activeTunnel = { close: () => ngrok.disconnect() };
			this.displayTunnelInfo(this.tunnelUrl, 'ngrok');
			eventBus.emit(Events.TUNNEL_START, this.tunnelUrl);
		} catch (err) {
			logger.error('Ngrok error:', err.message);
			eventBus.emit(Events.TUNNEL_ERROR, err);
		}
	}
	
	async start(port, service = 'localtunnel', options = {}) {
		const services = {
			localtunnel: () => this.startLocalTunnel(port, options),
			lt: () => this.startLocalTunnel(port, options),
			cloudflared: () => this.startCloudflared(port),
			cloudflare: () => this.startCloudflared(port),
			cf: () => this.startCloudflared(port),
			ngrok: () => this.startNgrok(port, options)
		};
		
		const startFn = services[service] || services.localtunnel;
		return startFn();
	}
	
	stop() {
		if (this.activeTunnel) {
			if (typeof this.activeTunnel.close === 'function') {
				this.activeTunnel.close();
			} else if (this.activeTunnel.kill) {
				this.activeTunnel.kill();
			}
			this.activeTunnel = null;
			this.tunnelUrl = null;
			logger.info('Tunnel stopped');
			eventBus.emit(Events.TUNNEL_STOP);
		}
	}
	
	getUrl() {
		return this.tunnelUrl;
	}
	
	getPassword() {
		return this.tunnelPassword;
	}
}

// Singleton instance
const tunnelManager = new TunnelManager();

module.exports = {
	TunnelManager,
	tunnelManager
};
