const { eventBus, Events } = require('./event-bus');

class HookManager {
	constructor() {
		this.hooks = {
			onStart: [],
			beforeRequest: [],
			afterResponse: [],
			onReload: [],
			onFileChange: [],
			onError: [],
			onStop: []
		};
	}
	
	register(hookName, handler) {
		if (!this.hooks[hookName]) {
			this.hooks[hookName] = [];
		}
		this.hooks[hookName].push(handler);
	}
	
	registerMultiple(hooks) {
		Object.keys(hooks).forEach(hookName => {
			if (typeof hooks[hookName] === 'function') {
				this.register(hookName, hooks[hookName]);
			}
		});
	}
	
	async execute(hookName, ...args) {
		const handlers = this.hooks[hookName] || [];
		
		for (const handler of handlers) {
			try {
				await handler(...args);
			} catch (error) {
				console.error(`Hook ${hookName} error:`, error);
			}
		}
	}
	
	executeSync(hookName, ...args) {
		const handlers = this.hooks[hookName] || [];
		
		for (const handler of handlers) {
			try {
				handler(...args);
			} catch (error) {
				console.error(`Hook ${hookName} error:`, error);
			}
		}
	}
	
	clear(hookName) {
		if (hookName) {
			this.hooks[hookName] = [];
		} else {
			Object.keys(this.hooks).forEach(key => {
				this.hooks[key] = [];
			});
		}
	}
}

// Singleton instance
const hookManager = new HookManager();

// Connect hooks to event bus
eventBus.on(Events.SERVER_START, (...args) => {
	hookManager.execute('onStart', ...args);
});

eventBus.on(Events.SERVER_STOP, (...args) => {
	hookManager.execute('onStop', ...args);
});

eventBus.on(Events.REQUEST_START, (...args) => {
	hookManager.executeSync('beforeRequest', ...args);
});

eventBus.on(Events.REQUEST_END, (...args) => {
	hookManager.executeSync('afterResponse', ...args);
});

eventBus.on(Events.FILE_CHANGE, (...args) => {
	hookManager.executeSync('onFileChange', ...args);
});

eventBus.on(Events.RELOAD_TRIGGER, (...args) => {
	hookManager.executeSync('onReload', ...args);
});

eventBus.on(Events.SERVER_ERROR, (...args) => {
	hookManager.execute('onError', ...args);
});

module.exports = {
	HookManager,
	hookManager
};
