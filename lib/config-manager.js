const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const homeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const globalConfigPath = path.join(homeDir, '.gib-runs.json');

const defaultConfig = {
	host: '0.0.0.0',
	port: 8080,
	open: true,
	logLevel: 2,
	compression: true,
	cors: false,
	spa: false,
	mount: [],
	proxy: [],
	middleware: [],
	watch: null,
	ignore: null
};

const loadGlobalConfig = () => {
	if (fs.existsSync(globalConfigPath)) {
		try {
			const content = fs.readFileSync(globalConfigPath, 'utf8');
			const config = JSON.parse(content);
			if (config.ignorePattern) {
				config.ignorePattern = new RegExp(config.ignorePattern);
			}
			return config;
		} catch (e) {
			console.warn(chalk.yellow('  ⚠ Failed to load global config: ') + e.message);
			return {};
		}
	}
	return {};
};

const loadProjectConfig = (cwd) => {
	const projectConfigPath = path.join(cwd || process.cwd(), '.gib-runs.json');
	if (fs.existsSync(projectConfigPath)) {
		try {
			const content = fs.readFileSync(projectConfigPath, 'utf8');
			const config = JSON.parse(content);
			if (config.ignorePattern) {
				config.ignorePattern = new RegExp(config.ignorePattern);
			}
			return config;
		} catch (e) {
			console.warn(chalk.yellow('  ⚠ Failed to load project config: ') + e.message);
			return {};
		}
	}
	return {};
};

const mergeConfigs = (...configs) => {
	return Object.assign({}, defaultConfig, ...configs);
};

const generateConfig = (options = {}) => {
	const config = {
		port: options.port || 8080,
		host: options.host || '0.0.0.0',
		open: options.open !== false,
		logLevel: options.logLevel || 2,
		compression: options.compression !== false,
		cors: options.cors || false,
		spa: options.spa || false
	};
	
	if (options.watch && options.watch.length > 0) {
		config.watch = options.watch;
	}
	
	if (options.ignore && options.ignore.length > 0) {
		config.ignore = options.ignore;
	}
	
	if (options.mount && options.mount.length > 0) {
		config.mount = options.mount;
	}
	
	if (options.proxy && options.proxy.length > 0) {
		config.proxy = options.proxy;
	}
	
	return config;
};

const saveConfig = (config, targetPath) => {
	try {
		const content = JSON.stringify(config, null, 2);
		fs.writeFileSync(targetPath, content, 'utf8');
		return true;
	} catch (e) {
		console.error(chalk.red('  ✖ Failed to save config: ') + e.message);
		return false;
	}
};

const saveGlobalConfig = (config) => {
	return saveConfig(config, globalConfigPath);
};

const saveProjectConfig = (config, cwd) => {
	const projectConfigPath = path.join(cwd || process.cwd(), '.gib-runs.json');
	return saveConfig(config, projectConfigPath);
};

module.exports = {
	defaultConfig,
	loadGlobalConfig,
	loadProjectConfig,
	mergeConfigs,
	generateConfig,
	saveGlobalConfig,
	saveProjectConfig
};
