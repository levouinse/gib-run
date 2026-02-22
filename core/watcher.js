const chokidar = require('chokidar');
const path = require('path');
const { eventBus, Events } = require('./event-bus');
const { logger } = require('./logger');

class Watcher {
	constructor(options = {}) {
		this.options = options;
		this.watcher = null;
		this.watchPaths = options.watch || [options.root || process.cwd()];
		this.ignored = options.ignore || [];
		this.wait = options.wait || 100;
		this.noCssInject = options.noCssInject || false;
	}
	
	start() {
		const defaultIgnored = [
			function(testPath) {
				return testPath !== "." && /(^[.#]|(?:__|~)$)/.test(path.basename(testPath));
			},
			function(testPath) {
				return /\.timestamp-.*\.mjs$/.test(testPath);
			},
			function(testPath) {
				return /\.(log|lock|tmp)$/.test(testPath);
			},
			function(testPath) {
				return /(^|\/)((node_modules|\.git|dist|build|coverage|\.next|\.nuxt|\.output|out|target)(\/|$))/.test(testPath);
			}
		];
		
		const ignored = [...defaultIgnored, ...this.ignored];
		
		this.watcher = chokidar.watch(this.watchPaths, {
			ignored: ignored,
			ignoreInitial: true,
			ignorePermissionErrors: true,
			awaitWriteFinish: {
				stabilityThreshold: 100,
				pollInterval: 50
			},
			interval: 100,
			binaryInterval: 300
		});
		
		this.watcher
			.on('change', (changePath) => this.handleChange(changePath))
			.on('add', (addPath) => this.handleAdd(addPath))
			.on('unlink', (unlinkPath) => this.handleUnlink(unlinkPath))
			.on('addDir', (dirPath) => this.handleChange(dirPath))
			.on('unlinkDir', (dirPath) => this.handleChange(dirPath))
			.on('ready', () => {
				logger.success('File watcher ready');
				eventBus.emit('watcher:ready');
			})
			.on('error', (error) => {
				logger.error('Watcher error:', error.message);
				eventBus.emit('watcher:error', error);
			});
		
		return this.watcher;
	}
	
	handleChange(changePath) {
		const cssChange = path.extname(changePath) === '.css' && !this.noCssInject;
		const eventType = cssChange ? Events.RELOAD_CSS : Events.RELOAD_TRIGGER;
		
		logger.fileChange(cssChange ? 'css' : 'change', changePath);
		
		eventBus.emit(Events.FILE_CHANGE, changePath, 'change');
		eventBus.emit(eventType, changePath);
	}
	
	handleAdd(addPath) {
		logger.fileChange('add', addPath);
		eventBus.emit(Events.FILE_ADD, addPath);
		eventBus.emit(Events.FILE_CHANGE, addPath, 'add');
		this.handleChange(addPath);
	}
	
	handleUnlink(unlinkPath) {
		logger.fileChange('unlink', unlinkPath);
		eventBus.emit(Events.FILE_UNLINK, unlinkPath);
		eventBus.emit(Events.FILE_CHANGE, unlinkPath, 'unlink');
		this.handleChange(unlinkPath);
	}
	
	stop() {
		if (this.watcher) {
			this.watcher.close();
			this.watcher = null;
			logger.info('File watcher stopped');
		}
	}
}

module.exports = Watcher;
