const EventEmitter = require('events');

class GibRunsEventBus extends EventEmitter {
	constructor() {
		super();
		this.setMaxListeners(50);
	}
}

const eventBus = new GibRunsEventBus();

// Event types
const Events = {
	SERVER_START: 'server:start',
	SERVER_STOP: 'server:stop',
	SERVER_ERROR: 'server:error',
	SERVER_LISTENING: 'server:listening',
	
	REQUEST_START: 'request:start',
	REQUEST_END: 'request:end',
	REQUEST_ERROR: 'request:error',
	
	FILE_CHANGE: 'file:change',
	FILE_ADD: 'file:add',
	FILE_UNLINK: 'file:unlink',
	
	RELOAD_TRIGGER: 'reload:trigger',
	RELOAD_CSS: 'reload:css',
	
	TUNNEL_START: 'tunnel:start',
	TUNNEL_STOP: 'tunnel:stop',
	TUNNEL_ERROR: 'tunnel:error',
	
	PROCESS_START: 'process:start',
	PROCESS_STOP: 'process:stop',
	PROCESS_ERROR: 'process:error',
	
	CONFIG_LOAD: 'config:load',
	CONFIG_ERROR: 'config:error'
};

module.exports = {
	eventBus,
	Events
};
