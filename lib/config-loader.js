const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const loadConfigFile = (configPath) => {
	const ext = path.extname(configPath);
	
	if (ext === '.json') {
		const content = fs.readFileSync(configPath, 'utf8');
		return JSON.parse(content);
	}
	
	if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
		delete require.cache[require.resolve(configPath)];
		const config = require(configPath);
		return config.default || config;
	}
	
	throw new Error(`Unsupported config format: ${ext}`);
};

const findConfigFile = (cwd) => {
	const configNames = [
		'gib.config.js',
		'gib.config.cjs',
		'gib.config.mjs',
		'gib.config.json',
		'.gib-runs.json',
		'.gibrc.json',
		'.gibrc.js'
	];
	
	for (const name of configNames) {
		const configPath = path.join(cwd, name);
		if (fs.existsSync(configPath)) {
			return configPath;
		}
	}
	
	return null;
};

const loadConfig = (cwd, options = {}) => {
	const configPath = options.config || findConfigFile(cwd);
	
	if (!configPath) {
		return null;
	}
	
	try {
		const config = loadConfigFile(configPath);
		
		if (options.logLevel >= 2) {
			console.log(chalk.cyan('  ✓ Loaded config: ') + chalk.gray(path.relative(cwd, configPath)));
		}
		
		return config;
	} catch (e) {
		if (options.logLevel >= 1) {
			console.warn(chalk.yellow('  ⚠ Failed to load config: ') + e.message);
		}
		return null;
	}
};

const validateConfig = (config) => {
	const errors = [];
	
	if (config.port !== undefined) {
		if (typeof config.port !== 'number' || config.port < 0 || config.port > 65535) {
			errors.push('port must be a number between 0 and 65535');
		}
	}
	
	if (config.host !== undefined && typeof config.host !== 'string') {
		errors.push('host must be a string');
	}
	
	if (config.logLevel !== undefined) {
		if (typeof config.logLevel !== 'number' || config.logLevel < 0 || config.logLevel > 3) {
			errors.push('logLevel must be a number between 0 and 3');
		}
	}
	
	if (config.watch !== undefined && !Array.isArray(config.watch)) {
		errors.push('watch must be an array of paths');
	}
	
	if (config.ignore !== undefined && !Array.isArray(config.ignore)) {
		errors.push('ignore must be an array of paths');
	}
	
	if (config.mount !== undefined) {
		if (!Array.isArray(config.mount)) {
			errors.push('mount must be an array');
		} else {
			config.mount.forEach((m, i) => {
				if (!Array.isArray(m) || m.length !== 2) {
					errors.push(`mount[${i}] must be [route, path]`);
				}
			});
		}
	}
	
	if (config.proxy !== undefined) {
		if (!Array.isArray(config.proxy)) {
			errors.push('proxy must be an array');
		} else {
			config.proxy.forEach((p, i) => {
				if (!Array.isArray(p) || p.length !== 2) {
					errors.push(`proxy[${i}] must be [route, url]`);
				}
			});
		}
	}
	
	if (config.middleware !== undefined && !Array.isArray(config.middleware)) {
		errors.push('middleware must be an array');
	}
	
	return errors;
};

const normalizeConfig = (config, cwd) => {
	const normalized = { ...config };
	
	// Normalize paths
	if (normalized.root && !path.isAbsolute(normalized.root)) {
		normalized.root = path.resolve(cwd, normalized.root);
	}
	
	if (normalized.watch) {
		normalized.watch = normalized.watch.map(p => 
			path.isAbsolute(p) ? p : path.resolve(cwd, p)
		);
	}
	
	if (normalized.ignore) {
		normalized.ignore = normalized.ignore.map(p => 
			path.isAbsolute(p) ? p : path.resolve(cwd, p)
		);
	}
	
	if (normalized.mount) {
		normalized.mount = normalized.mount.map(([route, dir]) => [
			route,
			path.isAbsolute(dir) ? dir : path.resolve(cwd, dir)
		]);
	}
	
	if (normalized.https && typeof normalized.https === 'string') {
		if (!path.isAbsolute(normalized.https)) {
			normalized.https = path.resolve(cwd, normalized.https);
		}
	}
	
	if (normalized.htpasswd && !path.isAbsolute(normalized.htpasswd)) {
		normalized.htpasswd = path.resolve(cwd, normalized.htpasswd);
	}
	
	// Normalize middleware
	if (normalized.middleware) {
		normalized.middleware = normalized.middleware.map(mw => {
			if (typeof mw === 'string' && !path.isAbsolute(mw)) {
				const ext = path.extname(mw);
				if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
					return path.resolve(cwd, mw);
				}
			}
			return mw;
		});
	}
	
	return normalized;
};

const mergeConfigs = (...configs) => {
	const merged = {};
	
	configs.forEach(config => {
		if (!config) return;
		
		Object.keys(config).forEach(key => {
			if (Array.isArray(config[key])) {
				if (!merged[key]) {
					merged[key] = [];
				}
				merged[key] = [...merged[key], ...config[key]];
			} else if (typeof config[key] === 'object' && config[key] !== null) {
				if (!merged[key]) {
					merged[key] = {};
				}
				merged[key] = { ...merged[key], ...config[key] };
			} else {
				merged[key] = config[key];
			}
		});
	});
	
	return merged;
};

const generateConfigTemplate = (format = 'js') => {
	if (format === 'json') {
		return JSON.stringify({
			port: 8080,
			host: '0.0.0.0',
			open: true,
			spa: false,
			cors: false,
			compression: true,
			logLevel: 2,
			watch: ['src', 'public'],
			ignore: ['**/*.test.js', '**/*.spec.js'],
			mount: [],
			proxy: [],
			middleware: []
		}, null, 2);
	}
	
	return `// GIB-RUNS Configuration
// https://github.com/levouinse/gib-runs

export default {
  // Server settings
  port: 8080,
  host: '0.0.0.0',
  open: true,
  
  // Application mode
  spa: false,
  
  // Features
  cors: false,
  compression: true,
  
  // Logging
  logLevel: 2, // 0=errors, 1=warnings, 2=info, 3=debug
  
  // File watching
  watch: ['src', 'public'],
  ignore: ['**/*.test.js', '**/*.spec.js'],
  
  // Directory mounting
  mount: [
    // ['/components', './node_modules']
  ],
  
  // Proxy configuration
  proxy: [
    // ['/api', 'http://localhost:3001']
  ],
  
  // Middleware
  middleware: [
    // 'security',
    // 'performance',
    // './custom-middleware.js'
  ],
  
  // Hooks (optional)
  hooks: {
    beforeRequest(req, res, next) {
      // Custom logic before request
      next();
    },
    
    afterResponse(req, res) {
      // Custom logic after response
    },
    
    onFileChange(path) {
      // Custom logic on file change
      console.log('File changed:', path);
    }
  }
};
`;
};

module.exports = {
	loadConfigFile,
	findConfigFile,
	loadConfig,
	validateConfig,
	normalizeConfig,
	mergeConfigs,
	generateConfigTemplate
};
