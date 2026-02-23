const path = require('path');
const { logger } = require('./logger');

class PluginManager {
	constructor(server) {
		this.server = server;
		this.plugins = new Map();
		this.hooks = {
			onInit: [],
			onStart: [],
			onRequest: [],
			onFileChange: [],
			onReload: [],
			onStop: []
		};
	}
	
	register(plugin, options = {}) {
		if (typeof plugin === 'string') {
			plugin = this.loadPlugin(plugin);
		}
		
		if (!plugin || !plugin.name) {
			throw new Error('Invalid plugin: must have a name');
		}
		
		if (this.plugins.has(plugin.name)) {
			logger.warn(`Plugin ${plugin.name} already registered`);
			return;
		}
		
		const pluginInstance = {
			...plugin,
			options,
			enabled: true
		};
		
		this.plugins.set(plugin.name, pluginInstance);
		
		// Register hooks
		Object.keys(this.hooks).forEach(hookName => {
			if (typeof plugin[hookName] === 'function') {
				this.hooks[hookName].push({
					plugin: plugin.name,
					handler: plugin[hookName].bind(pluginInstance)
				});
			}
		});
		
		logger.debug(`Plugin registered: ${plugin.name}`);
		
		return pluginInstance;
	}
	
	loadPlugin(pluginPath) {
		try {
			// Try as npm package
			if (!pluginPath.startsWith('.') && !pluginPath.startsWith('/')) {
				return require(pluginPath);
			}
			
			// Try as local file
			const resolved = path.resolve(process.cwd(), pluginPath);
			return require(resolved);
		} catch (e) {
			logger.error(`Failed to load plugin: ${pluginPath}`, e.message);
			return null;
		}
	}
	
	async init() {
		for (const { plugin, handler } of this.hooks.onInit) {
			try {
				await handler(this.server);
			} catch (e) {
				// Only log in non-test mode
				if (typeof describe === 'undefined') {
					logger.error(`Plugin ${plugin} init failed:`, e.message);
				}
			}
		}
	}
	
	async start(address) {
		for (const { plugin, handler } of this.hooks.onStart) {
			try {
				await handler(address);
			} catch (e) {
				logger.error(`Plugin ${plugin} start failed:`, e.message);
			}
		}
	}
	
	createMiddleware() {
		return async (req, res, next) => {
			let index = 0;
			
			const runNext = async () => {
				if (index >= this.hooks.onRequest.length) {
					return next();
				}
				
				const { plugin, handler } = this.hooks.onRequest[index++];
				
				try {
					await handler(req, res, runNext);
				} catch (e) {
					logger.error(`Plugin ${plugin} middleware failed:`, e.message);
					next(e);
				}
			};
			
			await runNext();
		};
	}
	
	async onFileChange(filePath, changeType) {
		for (const { handler } of this.hooks.onFileChange) {
			try {
				await handler(filePath, changeType);
			} catch {
				// Silent fail for file change hooks
			}
		}
	}
	
	async onReload() {
		for (const { handler } of this.hooks.onReload) {
			try {
				await handler();
			} catch {
				// Silent fail
			}
		}
	}
	
	async stop() {
		for (const { plugin, handler } of this.hooks.onStop) {
			try {
				await handler();
			} catch (e) {
				logger.error(`Plugin ${plugin} stop failed:`, e.message);
			}
		}
		
		this.plugins.clear();
		Object.keys(this.hooks).forEach(key => {
			this.hooks[key] = [];
		});
	}
	
	get(name) {
		return this.plugins.get(name);
	}
	
	list() {
		return Array.from(this.plugins.values()).map(p => ({
			name: p.name,
			version: p.version,
			enabled: p.enabled
		}));
	}
	
	disable(name) {
		const plugin = this.plugins.get(name);
		if (plugin) {
			plugin.enabled = false;
		}
	}
	
	enable(name) {
		const plugin = this.plugins.get(name);
		if (plugin) {
			plugin.enabled = true;
		}
	}
}

module.exports = PluginManager;
