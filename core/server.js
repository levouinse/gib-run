const http = require('http');
const connect = require('connect');
const { eventBus, Events } = require('./event-bus');
const { logger } = require('./logger');

class Server {
	constructor(options = {}) {
		this.options = options;
		this.app = connect();
		this.server = null;
		this.wsClients = [];
		this.startTime = null;
		this.requestCount = 0;
		this.reloadCount = 0;
	}
	
	createServer() {
		const { https: httpsConfig, httpsModule } = this.options;
		
		if (httpsConfig) {
			const httpsModuleName = httpsModule || 'https';
			try {
				const httpsLib = require(httpsModuleName);
				const config = typeof httpsConfig === 'string' ? 
					require(httpsConfig) : httpsConfig;
				this.server = httpsLib.createServer(config, this.app);
				this.protocol = 'https';
			} catch (e) {
				logger.error('Failed to create HTTPS server:', e.message);
				throw e;
			}
		} else {
			this.server = http.createServer(this.app);
			this.protocol = 'http';
		}
		
		this.setupServerEvents();
		this.setupWebSocket();
		
		return this.server;
	}
	
	setupServerEvents() {
		this.server.on('error', (error) => {
			logger.error('Server error:', error.message);
			eventBus.emit(Events.SERVER_ERROR, error);
			
			if (error.code === 'EADDRINUSE') {
				logger.warn(`Port ${this.options.port} is in use, trying next port...`);
				setTimeout(() => {
					this.server.listen(0, this.options.host);
				}, 1000);
			}
		});
		
		this.server.on('listening', () => {
			this.startTime = Date.now();
			const address = this.server.address();
			
			logger.success(`Server listening on ${this.protocol}://${address.address}:${address.port}`);
			eventBus.emit(Events.SERVER_LISTENING, address);
		});
	}
	
	setupWebSocket() {
		this.server.on('upgrade', (request, socket, head) => {
			const WebSocket = require('faye-websocket');
			const ws = new WebSocket(request, socket, head);
			
			ws.onopen = () => {
				ws.send('connected');
				logger.debug('WebSocket client connected');
			};
			
			ws.onclose = () => {
				this.wsClients = this.wsClients.filter(client => client !== ws);
				logger.debug('WebSocket client disconnected');
			};
			
			// Apply wait debounce if configured
			if (this.options.wait > 0) {
				const originalSend = ws.send;
				let waitTimeout;
				
				ws.send = function() {
					const args = arguments;
					if (waitTimeout) clearTimeout(waitTimeout);
					waitTimeout = setTimeout(() => {
						originalSend.apply(ws, args);
					}, this.options.wait);
				}.bind(this);
			}
			
			this.wsClients.push(ws);
		});
		
		// Listen to reload events
		eventBus.on(Events.RELOAD_TRIGGER, () => {
			this.broadcast('reload');
			this.reloadCount++;
		});
		
		eventBus.on(Events.RELOAD_CSS, () => {
			this.broadcast('refreshcss');
			this.reloadCount++;
		});
	}
	
	broadcast(message) {
		this.wsClients.forEach(ws => {
			if (ws && ws.send) {
				try {
					ws.send(message);
				} catch (e) {
					logger.debug('Failed to send to WebSocket client:', e.message);
				}
			}
		});
	}
	
	use(middleware) {
		this.app.use(middleware);
		return this;
	}
	
	async listen(port, host) {
		if (!this.server) {
			this.createServer();
		}
		
		return new Promise((resolve, reject) => {
			this.server.listen(port, host, (error) => {
				if (error) {
					reject(error);
				} else {
					eventBus.emit(Events.SERVER_START, this.server);
					resolve(this.server);
				}
			});
		});
	}
	
	close() {
		return new Promise((resolve) => {
			if (this.server) {
				this.server.close(() => {
					logger.info('Server closed');
					eventBus.emit(Events.SERVER_STOP);
					resolve();
				});
			} else {
				resolve();
			}
		});
	}
	
	getStats() {
		return {
			uptime: this.startTime ? (Date.now() - this.startTime) / 1000 : 0,
			requests: this.requestCount,
			reloads: this.reloadCount,
			clients: this.wsClients.length
		};
	}
}

module.exports = Server;
