const assert = require('assert');
const PluginManager = require('../core/plugin-manager');

describe('Plugin System', function() {
	let pluginManager;
	let mockServer;
	
	beforeEach(function() {
		mockServer = {
			config: {},
			use: function() {}
		};
		pluginManager = new PluginManager(mockServer);
	});
	
	it('should register a plugin', function() {
		const plugin = {
			name: 'test-plugin',
			version: '1.0.0'
		};
		
		pluginManager.register(plugin);
		
		assert.strictEqual(pluginManager.plugins.size, 1);
		assert.ok(pluginManager.get('test-plugin'));
	});
	
	it('should register plugin hooks', function() {
		const plugin = {
			name: 'test-plugin',
			onInit: function() {},
			onStart: function() {}
		};
		
		pluginManager.register(plugin);
		
		assert.strictEqual(pluginManager.hooks.onInit.length, 1);
		assert.strictEqual(pluginManager.hooks.onStart.length, 1);
	});
	
	it('should call onInit hooks', async function() {
		let called = false;
		
		const plugin = {
			name: 'test-plugin',
			onInit: function(server) {
				called = true;
				assert.strictEqual(server, mockServer);
			}
		};
		
		pluginManager.register(plugin);
		await pluginManager.init();
		
		assert.ok(called);
	});
	
	it('should call onStart hooks', async function() {
		let called = false;
		const address = { port: 8080 };
		
		const plugin = {
			name: 'test-plugin',
			onStart: function(addr) {
				called = true;
				assert.strictEqual(addr, address);
			}
		};
		
		pluginManager.register(plugin);
		await pluginManager.start(address);
		
		assert.ok(called);
	});
	
	it('should create middleware chain', function(done) {
		const plugin1 = {
			name: 'plugin1',
			onRequest: function(req, res, next) {
				req.plugin1 = true;
				next();
			}
		};
		
		const plugin2 = {
			name: 'plugin2',
			onRequest: function(req, res, next) {
				req.plugin2 = true;
				next();
			}
		};
		
		pluginManager.register(plugin1);
		pluginManager.register(plugin2);
		
		const middleware = pluginManager.createMiddleware();
		const req = {};
		const res = {};
		
		middleware(req, res, function() {
			assert.ok(req.plugin1);
			assert.ok(req.plugin2);
			done();
		});
	});
	
	it('should handle plugin errors gracefully', async function() {
		const plugin = {
			name: 'error-plugin',
			onInit: function() {
				throw new Error('Plugin error');
			}
		};
		
		pluginManager.register(plugin);
		
		// Should not throw
		await pluginManager.init();
	});
	
	it('should list registered plugins', function() {
		pluginManager.register({ name: 'plugin1', version: '1.0.0' });
		pluginManager.register({ name: 'plugin2', version: '2.0.0' });
		
		const list = pluginManager.list();
		
		assert.strictEqual(list.length, 2);
		assert.strictEqual(list[0].name, 'plugin1');
		assert.strictEqual(list[1].name, 'plugin2');
	});
	
	it('should disable/enable plugins', function() {
		pluginManager.register({ name: 'test-plugin' });
		
		pluginManager.disable('test-plugin');
		assert.strictEqual(pluginManager.get('test-plugin').enabled, false);
		
		pluginManager.enable('test-plugin');
		assert.strictEqual(pluginManager.get('test-plugin').enabled, true);
	});
	
	it('should stop all plugins', async function() {
		let stopped = false;
		
		const plugin = {
			name: 'test-plugin',
			onStop: function() {
				stopped = true;
			}
		};
		
		pluginManager.register(plugin);
		await pluginManager.stop();
		
		assert.ok(stopped);
		assert.strictEqual(pluginManager.plugins.size, 0);
	});
});
